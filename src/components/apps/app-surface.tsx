import { APPS, type AppId } from '../../apps/registry'

export function AppSurface({ id }: { id: AppId }) {
  const app = APPS.find((entry) => entry.id === id)!

  return (
    <div className="flex h-full items-center justify-center p-8 text-[13px] text-ink-500">
      {app.title}
    </div>
  )
}
