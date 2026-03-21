import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}

const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)

// 1. Remove Kristi Noem DHS record (fired)
console.log('Removing Kristi Noem DHS record (fired)...')
const { error: delErr } = await supabase
  .from('politicians')
  .delete()
  .eq('slug', 'kristi-noem-dhs')

if (delErr) console.error('Delete error:', delErr.message)
else console.log('  ✓ Removed kristi-noem-dhs')

// 2. Add Wikipedia portrait images for presidential officials
const IMAGES = {
  'donald-trump': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Official_Presidential_Portrait_of_President_Donald_J._Trump_%282025%29.jpg/330px-Official_Presidential_Portrait_of_President_Donald_J._Trump_%282025%29.jpg',
  'jd-vance-vp': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/January_2025_Official_Vice_Presidential_Portrait_of_JD_Vance.jpg/330px-January_2025_Official_Vice_Presidential_Portrait_of_JD_Vance.jpg',
  'marco-rubio': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Official_portrait_of_Secretary_Marco_Rubio_%28cropped%29%282%29.jpg/330px-Official_portrait_of_Secretary_Marco_Rubio_%28cropped%29%282%29.jpg',
  'pete-hegseth': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Pete_Hegseth_Official_Portrait.jpg/330px-Pete_Hegseth_Official_Portrait.jpg',
  'scott-bessent': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Official_portrait_of_Treasury_Secretary_Scott_Bessent_%28borderless%29.jpg/330px-Official_portrait_of_Treasury_Secretary_Scott_Bessent_%28borderless%29.jpg',
  'pam-bondi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Pam_Bondi_official_portrait_%28cropped%29%282%29.jpg/330px-Pam_Bondi_official_portrait_%28cropped%29%282%29.jpg',
  'doug-burgum': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Doug_Burgum_2025_DOI_portrait.jpg/330px-Doug_Burgum_2025_DOI_portrait.jpg',
  'brooke-rollins': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Second_Portrait_of_Secretary_Rollins.jpg/330px-Second_Portrait_of_Secretary_Rollins.jpg',
  'howard-lutnick': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Howard_Lutnick_2025.jpg/330px-Howard_Lutnick_2025.jpg',
  'lori-chavez-deremer': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Secretary_Lori_Chavez-DeRemer_official_portrait_2025_%28cropped%29_%282%29.jpg/330px-Secretary_Lori_Chavez-DeRemer_official_portrait_2025_%28cropped%29_%282%29.jpg',
  'robert-f-kennedy-jr': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Robert_F._Kennedy_Jr.%2C_official_portrait_%282025%29_%28cropped_3-4%29_%28b%29.jpg/330px-Robert_F._Kennedy_Jr.%2C_official_portrait_%282025%29_%28cropped_3-4%29_%28b%29.jpg',
  'scott-turner': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Scott_Turner%2C_official_portrait_%282025%29.jpg/330px-Scott_Turner%2C_official_portrait_%282025%29.jpg',
  'sean-duffy': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Secretary_of_Transportation_Sean_Duffy_Official_Portrait.jpg/330px-Secretary_of_Transportation_Sean_Duffy_Official_Portrait.jpg',
  'chris-wright': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Secretary_Chris_Wright_Official_Portrait.png/330px-Secretary_Chris_Wright_Official_Portrait.png',
  'linda-mcmahon': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/ED_Sec_Linda_McMahon_%28cropped%29.jpg/330px-ED_Sec_Linda_McMahon_%28cropped%29.jpg',
  'doug-collins': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Official_portrait_of_Douglas_Collins%2C_U.S._Secretary_of_Veterans_Affairs.jpeg/330px-Official_portrait_of_Douglas_Collins%2C_U.S._Secretary_of_Veterans_Affairs.jpeg',
  'tulsi-gabbard': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Director_Tulsi_Gabbard_Official_Portrait.jpg/330px-Director_Tulsi_Gabbard_Official_Portrait.jpg',
  'john-ratcliffe': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/John_Ratcliffe_official_photo.jpg/330px-John_Ratcliffe_official_photo.jpg',
  'susie-wiles': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Susie_Wiles_%28crop%29_%28cropped%29.jpg/330px-Susie_Wiles_%28crop%29_%28cropped%29.jpg',
  'russell-vought': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Russell_Vought%2C_official_portrait_%282025%29_%28cropped%29%282%29.jpg/330px-Russell_Vought%2C_official_portrait_%282025%29_%28cropped%29%282%29.jpg',
  'elon-musk': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Elon_Musk_%2854816836217%29_%28cropped%29.jpg/330px-Elon_Musk_%2854816836217%29_%28cropped%29.jpg',
}

console.log('\nUpdating images for presidential officials...')
let updated = 0
for (const [slug, url] of Object.entries(IMAGES)) {
  const { error } = await supabase
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

// Verify
const { data: pres } = await supabase
  .from('politicians')
  .select('name, image_url')
  .eq('chamber', 'presidential')
  .order('name')

console.log('\nPresidential officials status:')
pres.forEach(p => console.log(`  ${p.image_url ? '✓' : '✗'} ${p.name}`))
