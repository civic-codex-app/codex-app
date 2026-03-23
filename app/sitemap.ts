import type { MetadataRoute } from 'next'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://getpoli.app'
  const supabase = createServiceRoleClient()

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/directory`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/issues`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/elections`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/states`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/insights`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/compare`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/bills`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/polls`, changeFrequency: 'daily', priority: 0.6 },
    { url: `${baseUrl}/feed`, changeFrequency: 'daily', priority: 0.6 },
    { url: `${baseUrl}/report-cards`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/quiz`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/contact`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/contribute`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/privacy`, changeFrequency: 'monthly', priority: 0.2 },
    { url: `${baseUrl}/terms`, changeFrequency: 'monthly', priority: 0.2 },
    { url: `${baseUrl}/data-sources`, changeFrequency: 'monthly', priority: 0.3 },
  ]

  // Politicians
  const allPoliticians: { slug: string }[] = []
  let from = 0
  while (true) {
    const { data } = await supabase
      .from('politicians')
      .select('slug')
      .range(from, from + 999)
    if (!data || data.length === 0) break
    allPoliticians.push(...data)
    if (data.length < 1000) break
    from += 1000
  }

  const politicianPages: MetadataRoute.Sitemap = allPoliticians.map((p) => ({
    url: `${baseUrl}/politicians/${p.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Issues
  const { data: issues } = await supabase.from('issues').select('slug')
  const issuePages: MetadataRoute.Sitemap = (issues ?? []).map((i) => ({
    url: `${baseUrl}/issues/${i.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // States
  const statePages: MetadataRoute.Sitemap = [
    'al','ak','az','ar','ca','co','ct','de','fl','ga','hi','id','il','in','ia','ks','ky','la','me','md',
    'ma','mi','mn','ms','mo','mt','ne','nv','nh','nj','nm','ny','nc','nd','oh','ok','or','pa','ri','sc',
    'sd','tn','tx','ut','vt','va','wa','wv','wi','wy','dc',
  ].map((s) => ({
    url: `${baseUrl}/states/${s}`,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...politicianPages, ...issuePages, ...statePages]
}
