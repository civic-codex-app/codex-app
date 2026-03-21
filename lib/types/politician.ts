export interface Politician {
  id: string
  name: string
  slug: string
  state: string
  chamber: 'senate' | 'house' | 'governor' | 'presidential'
  party: 'democrat' | 'republican' | 'green' | 'independent'
  title: string
  since_year: number | null
  bio: string | null
  website_url: string | null
  donate_url: string | null
  wiki_url: string | null
  image_url: string | null
  twitter_url: string | null
  facebook_url: string | null
  instagram_url: string | null
  youtube_url: string | null
  threads_url: string | null
  tiktok_url: string | null
  linkedin_url: string | null
  created_at: string
  updated_at: string
}
