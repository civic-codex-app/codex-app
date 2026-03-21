import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}

const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)

const IMAGES = {
  'dave-mccormick': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/McCormick_Portrait_%28HR%29.jpg/330px-McCormick_Portrait_%28HR%29.jpg',
  'jack-reed': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Senator_Jack_Reed_Official_Portrait_Full_Person_%28cropped%29.jpg/330px-Senator_Jack_Reed_Official_Portrait_Full_Person_%28cropped%29.jpg',
  'adam-smith': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Adam_Smith_official_photo.jpg/330px-Adam_Smith_official_photo.jpg',
  'brian-fitzpatrick': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Brian_Fitzpatrick_official_congressional_photo.jpg/330px-Brian_Fitzpatrick_official_congressional_photo.jpg',
  'jason-smith': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Rep_Jason_Smith_-_2024.jpeg/330px-Rep_Jason_Smith_-_2024.jpeg',
  'mark-green': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Mark_Green%2C_official_portrait%2C_116th_Congress.jpg/330px-Mark_Green%2C_official_portrait%2C_116th_Congress.jpg',
  'robert-garcia': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Robert_Garcia_119th_Congress.jpeg/330px-Robert_Garcia_119th_Congress.jpeg',
  'matt-meyer': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/%2802-19-2025%29_Matt_Meyer.jpg/330px-%2802-19-2025%29_Matt_Meyer.jpg',
}

console.log('Fixing 8 missing images...')
let updated = 0
for (const [slug, url] of Object.entries(IMAGES)) {
  const { error, count } = await supabase
    .from('politicians')
    .update({ image_url: url })
    .eq('slug', slug)

  if (error) {
    console.log(`  ✗ ${slug}: ${error.message}`)
  } else {
    updated++
    console.log(`  ✓ ${slug}`)
  }
}

console.log(`\nUpdated ${updated} images`)

// Verify none remain
const { data } = await supabase.from('politicians').select('name, slug').is('image_url', null).order('name')
console.log(`\nStill missing images: ${data.length}`)
if (data.length > 0) data.forEach(p => console.log(`  ✗ ${p.name} (${p.slug})`))
else console.log('  All politicians have images!')
