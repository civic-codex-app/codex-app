import { createClient } from '@/lib/supabase/server'
import { AccountForm } from '@/components/account/account-form'
import { ChangePasswordForm } from '@/components/account/change-password-form'
import { NotificationPreferences } from '@/components/account/notification-preferences'
import { DeleteAccount } from '@/components/account/delete-account'

export default async function AccountPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  return (
    <div className="max-w-2xl">
      <h1 className="mb-2 text-3xl font-bold">Account</h1>
      <p className="mb-10 text-sm text-[var(--codex-sub)]">
        Manage your profile and settings
      </p>

      <div className="mb-10">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.15em] text-[var(--codex-sub)]">
          Profile
        </h2>
        <AccountForm profile={profile} />
      </div>

      <div className="mb-10">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.15em] text-[var(--codex-sub)]">
          Notification Preferences
        </h2>
        <NotificationPreferences profileId={user!.id} />
      </div>

      <div className="mb-10">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.15em] text-[var(--codex-sub)]">
          Change Password
        </h2>
        <ChangePasswordForm />
      </div>

      <div>
        <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.15em] text-[var(--codex-sub)]">
          Danger Zone
        </h2>
        <DeleteAccount />
      </div>
    </div>
  )
}
