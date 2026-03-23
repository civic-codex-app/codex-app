import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { SiteSettingsForm } from '@/components/admin/site-settings-form'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Site Settings | Admin' }

export default async function AdminSettingsPage() {
  const supabase = createServiceRoleClient()
  const { data } = await supabase.from('site_settings').select('key, value')

  const settings: Record<string, string> = {}
  for (const row of data ?? []) {
    settings[row.key] = row.value
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-[var(--codex-text)]">Site Settings</h1>
      <p className="mb-8 text-sm text-[var(--codex-sub)]">
        Manage your site name, SEO metadata, and branding
      </p>
      <SiteSettingsForm initialSettings={settings} />
    </div>
  )
}
