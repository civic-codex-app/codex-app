/**
 * Flag parsing shared by the scripts. Kept tiny on purpose.
 *
 * `arg` splits on the FIRST '=' only. A previous copy used .split('=')[1],
 * which truncates any value containing one — it cut a route list short at
 * "/compare?a=lisa-murkowski&b=..." and made a 32-route sweep look like it had
 * passed after measuring 5. Every script should import this rather than
 * carrying its own copy of that bug.
 */
export const arg = (name, fallback) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`))
  return hit === undefined ? fallback : hit.slice(`--${name}=`.length)
}

export const has = (name) => process.argv.includes(`--${name}`)
