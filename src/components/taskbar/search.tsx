import { Search as SearchIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { APPS, type AppId } from '../../apps/registry'
import { useWindowStore } from '../../store/windows'

const matches = (haystack: string, needle: string) =>
  haystack.toLowerCase().includes(needle.toLowerCase())

export function Search() {
  const toggle = useWindowStore((state) => state.toggle)
  const [query, setQuery] = useState('')
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const jumpToSearch = (event: KeyboardEvent) => {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        input.current?.focus()
        input.current?.select()
      }
    }

    window.addEventListener('keydown', jumpToSearch)
    return () => window.removeEventListener('keydown', jumpToSearch)
  }, [])

  const results = APPS.filter((app) => {
    if (!query) return true
    return matches(app.title, query) || matches(app.keywords, query)
  })

  const choose = (id: AppId) => {
    toggle(id)
    setQuery('')
    input.current?.blur()
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-full bg-white/6 px-3.5 py-2 ring-1 ring-white/10 transition-colors focus-within:bg-white/10 focus-within:ring-white/25">
        <SearchIcon size={14} strokeWidth={2.5} className="shrink-0 text-ink-300" />
        <input
          ref={input}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => event.key === 'Escape' && input.current?.blur()}
          placeholder="Search"
          aria-label="Search applications"
          className="w-32 bg-transparent text-[13px] text-ink-100 placeholder:text-ink-500 focus:outline-none"
        />
        <kbd className="rounded border border-white/12 bg-white/6 px-1.5 py-0.5 font-sans text-[10px] text-ink-500">
          ⌘K
        </kbd>
      </div>

      {query && (
        <ul className="glass-deep absolute bottom-full left-0 z-50 mb-2 w-64 overflow-hidden rounded-xl p-1.5">
          {results.length === 0 && (
            <li className="px-3 py-2 text-[13px] text-ink-500">No matches</li>
          )}
          {results.map((app) => {
            const Icon = app.icon
            return (
              <li key={app.id}>
                <button
                  type="button"
                  onClick={() => choose(app.id)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] text-ink-100 transition-colors hover:bg-white/10"
                >
                  <Icon size={14} strokeWidth={2.25} className="text-ink-300" />
                  {app.title}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
