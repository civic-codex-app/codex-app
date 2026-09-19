/**
 * Every page's caching declaration must mean what it says.
 *
 * Three defects of this class have shipped, each invisible to type-checking,
 * tests and the build, and each costing the app its cache on a hot route:
 *
 *   /issues/[slug]      declared revalidate, had no generateStaticParams
 *   /states/[state]     same
 *   /politicians/[slug] both — an auth-cookie read AND no generateStaticParams
 *
 * The last one was the most-visited page type in the app, rendering from
 * scratch on every single view. Fixing one cause without the other changes
 * nothing, which is exactly why this is worth asserting mechanically: the
 * symptom is silent, and the only way to see it is to serve a production
 * build and read the x-nextjs-cache header.
 *
 * Rules:
 *   1. A page declaring `revalidate` must not import the cookie-backed
 *      Supabase client. Reading cookies opts a route out of static rendering
 *      at the point of the call, not at the point a user is found — so it is
 *      dynamic for signed-out visitors too, and the revalidate is decorative.
 *   2. A dynamic segment declaring `revalidate` must export
 *      generateStaticParams. Without it the route is never cached whatever
 *      revalidate says.
 *   3. A page must not declare both `revalidate` and `dynamic = 'force-dynamic'`.
 *
 * Reported but not failed: routes that are dynamic and have no loading.tsx.
 * Next's default prefetch only reaches the nearest loading boundary, so those
 * routes cannot be usefully prefetched. That becomes a rule once the skeletons
 * land; until then it is a count, not a verdict.
 *
 * Usage: node scripts/check-route-config.mjs
 */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs'
import { join, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const APP = join(ROOT, 'app')

function pages(dir) {
  const out = []
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) out.push(...pages(p))
    else if (e.name === 'page.tsx' || e.name === 'page.ts') out.push(p)
  }
  return out
}

/** "app/(public)/politicians/[slug]/page.tsx" -> "/politicians/[slug]" */
function routeOf(file) {
  const rel = relative(APP, dirname(file)).split('\\').join('/')
  const segs = rel.split('/').filter((s) => s && !(s.startsWith('(') && s.endsWith(')')))
  return '/' + segs.join('/')
}

const found = pages(APP).sort()
let fail = 0
const noLoading = []

console.log(`${found.length} page(s) under app/\n`)

for (const file of found) {
  const src = readFileSync(file, 'utf8')
  const rel = relative(ROOT, file)
  const route = routeOf(file)

  const revalidate = /export\s+const\s+revalidate\s*=/.test(src)
  const forceDynamic = /export\s+const\s+dynamic\s*=\s*['"]force-dynamic['"]/.test(src)
  const cookieClient = /from\s+['"]@\/lib\/supabase\/server['"]/.test(src)
  const hasStaticParams = /export\s+(async\s+)?function\s+generateStaticParams/.test(src)
  const isDynamicSegment = /\[[^\]]+\]/.test(route)
  const readsSearchParams = /searchParams/.test(src)

  if (revalidate && cookieClient) {
    console.log(`  DEFEATS ITS OWN CACHE  ${route}`)
    console.log(`      ${rel}`)
    console.log(`      declares revalidate and imports the cookie-backed client, so it renders per request`)
    fail++
  }

  if (revalidate && isDynamicSegment && !hasStaticParams) {
    console.log(`  NEVER CACHED           ${route}`)
    console.log(`      ${rel}`)
    console.log(`      a dynamic segment with revalidate and no generateStaticParams is not cached at all`)
    fail++
  }

  if (revalidate && forceDynamic) {
    console.log(`  CONTRADICTORY          ${route}`)
    console.log(`      ${rel}`)
    console.log(`      declares both revalidate and dynamic = 'force-dynamic'`)
    fail++
  }

  if (forceDynamic || readsSearchParams) {
    const dir = dirname(file)
    // A loading.tsx anywhere up the segment tree covers this route.
    let covered = false
    for (let d = dir; d.startsWith(APP); d = dirname(d)) {
      if (existsSync(join(d, 'loading.tsx'))) { covered = true; break }
    }
    if (!covered) noLoading.push(route)
  }
}

console.log(`\n${noLoading.length} dynamic route(s) with no loading.tsx anywhere above them.`)
console.log(`Next's default prefetch stops at the nearest loading boundary, so these cannot be`)
console.log(`usefully prefetched. Reported, not failed — this becomes a rule once skeletons land.`)
if (noLoading.length) console.log(`  ${noLoading.slice(0, 12).join(', ')}${noLoading.length > 12 ? `, +${noLoading.length - 12} more` : ''}`)

console.log(`\n${fail ? `${fail} route(s) whose caching declaration does not mean what it says` : 'every caching declaration is honoured'}`)
process.exit(fail ? 1 : 0)
