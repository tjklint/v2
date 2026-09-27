import {
  ArrowLeft,
  ArrowUp,
  Check,
  ChevronRight,
  Download,
  FilePlus,
  FileText,
  Folder,
  FolderOpen,
  FolderPlus,
  HardDrive,
  House,
  Lock,
  Monitor,
  Pencil,
  Trash2,
  TriangleAlert,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import {
  useEffect,
  useReducer,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'

import {
  DESKTOP,
  FILESYSTEM,
  HOME,
  displayPath,
  listing,
  lookup,
  mkdir,
  read,
  removeNode,
  resolve,
  subscribeFs,
  writeFile,
  type FileNode,
} from '../../apps/shell/filesystem'

const ICON_BUTTON =
  'rounded-md p-1.5 text-ink-300 transition-colors hover:bg-white/10 hover:text-ink-100 focus-ring'

const TEXT_BUTTON =
  'rounded-md px-2 py-1 text-[10px] font-medium text-ink-300 transition-colors hover:bg-white/10 hover:text-ink-100 focus-ring'

const FIELD =
  'rounded-md bg-white/8 px-2 py-1 font-mono text-[11px] text-ink-100 placeholder:text-ink-500 focus-ring'

type Place = {
  path: string
  label: string
  icon: LucideIcon
}

const ROOT_LABEL = 'TJOS HD'

const PLACES: Place[] = [
  { path: HOME, label: 'Home', icon: House },
  { path: DESKTOP, label: 'Desktop', icon: Monitor },
  { path: `${HOME}/Documents`, label: 'Documents', icon: FileText },
  { path: `${HOME}/Downloads`, label: 'Downloads', icon: Download },
  { path: '/', label: ROOT_LABEL, icon: HardDrive },
]

type Entry = {
  name: string
  path: string
  node: FileNode
  dir: boolean
  kind: string
  icon: LucideIcon
  tone: string
  content: string
  meta: string
}

type Crumb = {
  label: string
  path: string
  root: boolean
}

type Stats = {
  items: number
  files: number
  folders: number
}

type Draft = {
  name: string
  content: string
}

type RowActions = {
  select: () => void
  open: () => void
  remove: () => void
  confirm: () => void
  cancel: () => void
  step: (delta: number) => void
  jump: (position: 'first' | 'last') => void
}

type FileRowProps = {
  entry: Entry
  active: boolean
  confirming: boolean
  actions: RowActions
}

const childrenOf = (node: FileNode | null | undefined): Record<string, FileNode> =>
  node?.type === 'dir' ? (node.children ?? {}) : {}

const contentOf = (node: FileNode | undefined) => (node ? (read(node) ?? '') : '')

const joinPath = (dir: string, name: string) => resolve(dir, name) ?? `${dir}/${name}`

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`

const kindOf = (name: string, node: FileNode): Pick<Entry, 'kind' | 'icon' | 'tone'> => {
  if (node.type === 'dir') return { kind: 'Folder', icon: Folder, tone: 'text-cyan-bloom' }
  if (name.startsWith('.')) return { kind: 'Hidden file', icon: Lock, tone: 'text-ink-500' }
  if (name.endsWith('.exe')) return { kind: 'Program', icon: Zap, tone: 'text-coral-bloom' }
  return { kind: 'Text file', icon: FileText, tone: 'text-ink-300' }
}

const describe = (dir: string, name: string, node: FileNode): Entry => {
  const kind = kindOf(name, node)
  const content = contentOf(node)

  return {
    name,
    path: joinPath(dir, name),
    node,
    dir: node.type === 'dir',
    kind: kind.kind,
    icon: kind.icon,
    tone: kind.tone,
    content,
    meta: node.type === 'dir' ? plural(listing(node).length, 'item') : `${content.length} B`,
  }
}

const namesOf = (node: FileNode | null) => (node ? listing(node) : [])

const statsOf = (node: FileNode | null): Stats => {
  const kids = childrenOf(node)
  const names = namesOf(node)
  const files = names.filter((name) => kids[name]?.type === 'file').length

  return { items: names.length, files, folders: names.length - files }
}

const crumbs = (path: string): Crumb[] => {
  const trail: Crumb[] = [{ label: ROOT_LABEL, path: '/', root: true }]
  let at = ''

  for (const part of path.split('/').filter(Boolean)) {
    at = `${at}/${part}`
    trail.push({ label: at === HOME ? '~' : part, path: at, root: false })
  }

  return trail
}

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-baseline justify-between gap-3 py-[3px]">
    <dt className="truncate text-[10px] text-ink-500">{label}</dt>
    <dd className="truncate text-right font-mono text-[11px] text-ink-100 tabular-nums">{value}</dd>
  </div>
)

const Note = ({
  icon: Icon,
  tone,
  title,
  body,
}: {
  icon: LucideIcon
  tone: string
  title: string
  body: string
}) => (
  <div className="flex h-full flex-col items-center justify-center gap-2 px-6 py-4 text-center">
    <Icon size={22} strokeWidth={1.75} className={tone} aria-hidden="true" />
    <p className="text-[12px] text-ink-100">{title}</p>
    <p className="max-w-[30ch] text-[11px] leading-relaxed text-ink-500">{body}</p>
  </div>
)

function FileRow({ entry, active, confirming, actions }: FileRowProps) {
  if (confirming) {
    return (
      <li>
        <div
          role="alert"
          className="flex items-center gap-1.5 rounded-md bg-rose-300/10 px-2 py-1.5"
        >
          <TriangleAlert
            size={12}
            strokeWidth={2.25}
            className="text-rose-300"
            aria-hidden="true"
          />
          <p className="min-w-0 flex-1 truncate text-[10px] text-rose-300">Delete {entry.name}?</p>
          <button
            type="button"
            autoFocus
            onClick={actions.remove}
            className="shrink-0 rounded-md bg-rose-300/20 px-1.5 py-0.5 text-[10px] font-medium text-rose-300 transition-colors hover:bg-rose-300/30 focus-ring"
          >
            Delete
          </button>
          <button
            type="button"
            onClick={actions.cancel}
            className="shrink-0 rounded-md px-1.5 py-0.5 text-[10px] text-ink-300 transition-colors hover:bg-white/10 focus-ring"
          >
            Keep
          </button>
        </div>
      </li>
    )
  }

  const Icon = entry.icon

  return (
    <li>
      <button
        type="button"
        data-row={entry.name}
        aria-current={active ? 'true' : undefined}
        onClick={actions.select}
        onDoubleClick={actions.open}
        onKeyDown={(event) => {
          const keys: Record<string, () => void> = {
            Enter: actions.open,
            ArrowDown: () => actions.step(1),
            ArrowUp: () => actions.step(-1),
            Home: () => actions.jump('first'),
            End: () => actions.jump('last'),
            Delete: actions.confirm,
          }

          const run = keys[event.key]
          if (!run) return
          event.preventDefault()
          run()
        }}
        className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors focus-ring ${
          active ? 'bg-white/12' : 'hover:bg-white/6'
        }`}
      >
        <Icon
          size={14}
          strokeWidth={2.25}
          className={`shrink-0 ${entry.tone}`}
          aria-hidden="true"
        />
        <span
          className={`min-w-0 flex-1 truncate text-[12px] ${
            active ? 'text-ink-100' : 'text-ink-300'
          }`}
        >
          {entry.name}
        </span>
        <span className="shrink-0 font-mono text-[10px] text-ink-500 tabular-nums">
          {entry.meta}
        </span>
      </button>
    </li>
  )
}

export function FilesApp() {
  const [cwd, setCwd] = useState(HOME)
  const [trail, setTrail] = useState<string[]>([])
  const [selectedName, setSelectedName] = useState<string | null>(null)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [creating, setCreating] = useState<'folder' | 'file' | null>(null)
  const [newName, setNewName] = useState('')
  const [confirming, setConfirming] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const [, tick] = useReducer((count: number, bump: number) => count + bump, 0)
  const rows = useRef<HTMLUListElement>(null)
  const field = useRef<HTMLInputElement>(null)
  const editor = useRef<HTMLTextAreaElement>(null)

  const browsing = creating !== null
  const writing = draft !== null

  useEffect(() => subscribeFs(() => tick(1)), [])
  useEffect(() => {
    if (browsing) field.current?.select()
  }, [browsing])
  useEffect(() => {
    if (writing) editor.current?.focus()
  }, [writing])

  const node = lookup(FILESYSTEM, cwd)
  const folder = node?.type === 'dir' ? node : null
  const kids = childrenOf(folder)
  const entries: Entry[] = namesOf(folder).flatMap((name) => {
    const child = kids[name]
    return child ? [describe(cwd, name, child)] : []
  })

  const selected = entries.find((entry) => entry.name === selectedName) ?? null
  const file = selected && !selected.dir ? selected : null
  const info = selected?.dir ? selected : null
  const stats = statsOf(info ? info.node : folder)
  const dirty = draft !== null && draft.content !== contentOf(kids[draft.name])
  const route = crumbs(cwd)

  const move = (next: string, history: string[]) => {
    setCwd(next)
    setTrail(history)
    setSelectedName(null)
    setDraft(null)
    setCreating(null)
    setNewName('')
    setConfirming(null)
    setNotice(null)
  }

  const go = (next: string) => {
    if (next === cwd) return
    move(next, [...trail, cwd])
  }

  const back = () => {
    const previous = trail[trail.length - 1]
    if (previous) move(previous, trail.slice(0, -1))
  }

  const up = () => {
    const parent = resolve(cwd, '..')
    if (parent && parent !== cwd) go(parent)
  }

  const open = (entry: Entry) => {
    if (entry.dir) {
      go(entry.path)
      return
    }

    setDraft({ name: entry.name, content: entry.content })
    setNotice(null)
  }

  const focusRow = (name: string) => {
    setSelectedName(name)
    const row = rows.current?.querySelector<HTMLButtonElement>(`[data-row="${CSS.escape(name)}"]`)
    row?.focus()
  }

  const step = (name: string, delta: number) => {
    const index = entries.findIndex((item) => item.name === name)
    const next = entries[Math.min(Math.max(index + delta, 0), entries.length - 1)]
    if (next) focusRow(next.name)
  }

  const startCreate = (kind: 'folder' | 'file') => {
    setCreating(kind)
    setNewName('')
    setConfirming(null)
    setNotice(null)
  }

  const cancelCreate = () => {
    setCreating(null)
    setNewName('')
  }

  const commitCreate = (event: FormEvent) => {
    event.preventDefault()
    if (!creating) return

    const name = newName.trim()
    if (name === '') {
      cancelCreate()
      return
    }

    const error =
      creating === 'folder' ? mkdir(joinPath(cwd, name)) : writeFile(joinPath(cwd, name), '')

    if (error) {
      setNotice(error)
      return
    }

    setCreating(null)
    setNewName('')
    setNotice(null)

    if (draft) return
    setSelectedName(name)
    if (creating === 'file') setDraft({ name, content: '' })
  }

  const destroy = (name: string) => {
    const error = removeNode(joinPath(cwd, name))
    setConfirming(null)

    if (error) {
      setNotice(error)
      return
    }

    setNotice(null)
    if (selectedName === name) setSelectedName(null)
    if (draft?.name === name) setDraft(null)
  }

  const save = () => {
    if (!draft) return
    const error = writeFile(joinPath(cwd, draft.name), draft.content)
    if (error) setNotice(error)
    else setNotice(null)
  }

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return

    const target = event.target
    if (
      target instanceof HTMLElement &&
      (target.isContentEditable || target.closest('input, textarea'))
    ) {
      return
    }

    if (event.key === 'Backspace') {
      event.preventDefault()
      up()
      return
    }

    if (event.key === 'Escape' && (confirming || notice)) {
      event.preventDefault()
      setConfirming(null)
      setNotice(null)
    }
  }

  const actionsFor = (entry: Entry): RowActions => ({
    select: () => setSelectedName(entry.name),
    open: () => open(entry),
    remove: () => destroy(entry.name),
    confirm: () => setConfirming(entry.name),
    cancel: () => setConfirming(null),
    step: (delta) => step(entry.name, delta),
    jump: (position) => {
      const edge = position === 'first' ? entries[0] : entries[entries.length - 1]
      if (edge) focusRow(edge.name)
    },
  })

  const Target = file?.icon ?? (info ? Folder : HardDrive)
  const tone = file?.tone ?? 'text-cyan-bloom'
  const title = draft ? draft.name : (selected?.name ?? 'Details')
  const meta = draft
    ? ''
    : selected
      ? selected.meta
      : `${stats.items} item${stats.items === 1 ? '' : 's'}`

  return (
    <div onKeyDown={onKeyDown} className="flex h-full flex-col overflow-hidden">
      <div className="flex shrink-0 items-center gap-1 border-b border-white/8 px-2 py-1.5">
        <button
          type="button"
          aria-label="Back"
          title="Back"
          disabled={trail.length === 0}
          onClick={back}
          className={ICON_BUTTON}
        >
          <ArrowLeft size={14} strokeWidth={2.25} />
        </button>
        <button
          type="button"
          aria-label="Up one level"
          title="Up one level (Backspace)"
          disabled={cwd === '/'}
          onClick={up}
          className={ICON_BUTTON}
        >
          <ArrowUp size={14} strokeWidth={2.25} />
        </button>

        <nav
          aria-label="Path"
          title={displayPath(cwd)}
          className="flex min-w-0 flex-1 items-center overflow-x-auto [scrollbar-width:none]"
        >
          {route.map((crumb, index) => (
            <span key={crumb.path} className="flex shrink-0 items-center">
              {index > 0 && (
                <ChevronRight
                  size={11}
                  strokeWidth={2.25}
                  className="text-ink-500"
                  aria-hidden="true"
                />
              )}
              <button
                type="button"
                aria-current={crumb.path === cwd ? 'location' : undefined}
                onClick={() => go(crumb.path)}
                className="flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[11px] text-ink-300 transition-colors hover:bg-white/10 hover:text-ink-100 focus-ring"
              >
                {crumb.root && (
                  <HardDrive
                    size={11}
                    strokeWidth={2.25}
                    className="text-ink-500"
                    aria-hidden="true"
                  />
                )}
                {crumb.label}
              </button>
            </span>
          ))}
        </nav>

        <button
          type="button"
          aria-label="New folder"
          title="New folder"
          onClick={() => startCreate('folder')}
          className={ICON_BUTTON}
        >
          <FolderPlus size={14} strokeWidth={2.25} />
        </button>
        <button
          type="button"
          aria-label="New file"
          title="New file"
          onClick={() => startCreate('file')}
          className={ICON_BUTTON}
        >
          <FilePlus size={14} strokeWidth={2.25} />
        </button>
      </div>

      {notice && (
        <div
          role="alert"
          className="flex shrink-0 items-center gap-2 border-b border-rose-300/30 bg-rose-300/10 px-3 py-1.5"
        >
          <TriangleAlert
            size={12}
            strokeWidth={2.25}
            className="shrink-0 text-rose-300"
            aria-hidden="true"
          />
          <p className="min-w-0 flex-1 font-mono text-[11px] break-words text-rose-300">{notice}</p>
          <button
            type="button"
            aria-label="Dismiss message"
            title="Dismiss message"
            onClick={() => setNotice(null)}
            className={ICON_BUTTON}
          >
            <X size={12} strokeWidth={2.5} />
          </button>
        </div>
      )}

      <div className="@container flex min-h-0 flex-1">
        <nav
          aria-label="Places"
          className="w-32 shrink-0 overflow-y-auto border-r border-white/8 p-1.5 @min-[520px]:w-40"
        >
          <p className="px-2 pt-0.5 pb-1.5 text-[9px] font-medium tracking-[0.12em] text-ink-500 uppercase">
            Places
          </p>
          <ul>
            {PLACES.map((place) => {
              const Icon = place.icon
              const active = place.path === cwd
              const gone = lookup(FILESYSTEM, place.path) === null

              return (
                <li key={place.path}>
                  <button
                    type="button"
                    aria-current={active ? 'location' : undefined}
                    onClick={() => go(place.path)}
                    className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors focus-ring ${
                      active ? 'bg-white/12' : 'hover:bg-white/6'
                    }`}
                  >
                    <Icon
                      size={14}
                      strokeWidth={2.25}
                      className={`shrink-0 ${active ? 'text-cyan-bloom' : 'text-ink-500'}`}
                      aria-hidden="true"
                    />
                    <span
                      className={`min-w-0 flex-1 truncate text-[12px] ${
                        gone
                          ? 'text-ink-500 line-through'
                          : active
                            ? 'text-ink-100'
                            : 'text-ink-300'
                      }`}
                    >
                      {place.label}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        <main className="flex min-w-0 flex-1 flex-col">
          {folder ? (
            <>
              <div className="min-h-0 flex-[3] overflow-y-auto p-1.5">
                {entries.length === 0 && !browsing ? (
                  <Note
                    icon={FolderOpen}
                    tone="text-ink-500"
                    title="This folder is empty"
                    body={`Nothing in ${displayPath(cwd)} yet. Make a folder or a file above, or run mkdir in the Terminal and watch it land here.`}
                  />
                ) : (
                  <ul ref={rows} aria-label="Folder contents" className="divide-y divide-white/6">
                    {browsing && (
                      <li className="flex items-center gap-2 px-2 py-1.5">
                        {creating === 'folder' ? (
                          <Folder
                            size={14}
                            strokeWidth={2.25}
                            className="shrink-0 text-cyan-bloom"
                            aria-hidden="true"
                          />
                        ) : (
                          <FileText
                            size={14}
                            strokeWidth={2.25}
                            className="shrink-0 text-ink-300"
                            aria-hidden="true"
                          />
                        )}
                        <form onSubmit={commitCreate} className="min-w-0 flex-1">
                          <input
                            ref={field}
                            value={newName}
                            aria-label={creating === 'folder' ? 'New folder name' : 'New file name'}
                            placeholder={creating === 'folder' ? 'untitled folder' : 'untitled.txt'}
                            spellCheck={false}
                            autoComplete="off"
                            onChange={(event) => setNewName(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key !== 'Escape') return
                              event.preventDefault()
                              cancelCreate()
                            }}
                            className={`${FIELD} w-full`}
                          />
                        </form>
                        <span className="shrink-0 font-mono text-[9px] text-ink-500">enter</span>
                      </li>
                    )}
                    {entries.map((item) => (
                      <FileRow
                        key={item.name}
                        entry={item}
                        active={item.name === selectedName}
                        confirming={item.name === confirming}
                        actions={actionsFor(item)}
                      />
                    ))}
                  </ul>
                )}
              </div>

              <section
                aria-label="Details"
                className="flex min-h-0 flex-[2] shrink-0 flex-col border-t border-white/8"
              >
                <header className="flex shrink-0 items-center gap-2 border-b border-white/6 px-2 py-1.5">
                  <Target
                    size={13}
                    strokeWidth={2.25}
                    className={`shrink-0 ${tone}`}
                    aria-hidden="true"
                  />
                  <h3 className="min-w-0 flex-1 truncate text-[11px] font-medium text-ink-100">
                    {title}
                  </h3>
                  {meta && (
                    <span className="shrink-0 font-mono text-[10px] text-ink-500 tabular-nums">
                      {meta}
                    </span>
                  )}
                  {!draft && file && (
                    <button
                      type="button"
                      aria-label={`Edit ${file.name}`}
                      title={`Edit ${file.name}`}
                      onClick={() => open(file)}
                      className={ICON_BUTTON}
                    >
                      <Pencil size={13} strokeWidth={2.25} />
                    </button>
                  )}
                  {!draft && info && (
                    <button
                      type="button"
                      aria-label={`Open ${info.name}`}
                      title={`Open ${info.name}`}
                      onClick={() => go(info.path)}
                      className={ICON_BUTTON}
                    >
                      <FolderOpen size={13} strokeWidth={2.25} />
                    </button>
                  )}
                  {!draft && selected && (
                    <button
                      type="button"
                      aria-label={`Delete ${selected.name}`}
                      title={`Delete ${selected.name}`}
                      onClick={() => setConfirming(selected.name)}
                      className={ICON_BUTTON}
                    >
                      <Trash2 size={13} strokeWidth={2.25} />
                    </button>
                  )}
                </header>

                {draft ? (
                  <>
                    <textarea
                      ref={editor}
                      value={draft.content}
                      aria-label={`Contents of ${draft.name}`}
                      spellCheck={false}
                      wrap="soft"
                      onChange={(event) => setDraft({ ...draft, content: event.target.value })}
                      onKeyDown={(event) => {
                        if ((event.metaKey || event.ctrlKey) && event.key === 's') {
                          event.preventDefault()
                          save()
                          return
                        }
                        if (event.key === 'Escape') {
                          event.preventDefault()
                          event.currentTarget.blur()
                        }
                      }}
                      className="min-h-0 flex-1 resize-none overflow-auto bg-transparent px-3 py-2 font-mono text-[11px] leading-relaxed whitespace-pre-wrap break-words text-ink-100 focus-ring"
                    />
                    <div className="flex shrink-0 items-center gap-1.5 border-t border-white/6 px-2 py-1">
                      <span
                        className={`flex min-w-0 flex-1 items-center gap-1 text-[9px] tracking-[0.1em] uppercase ${
                          dirty ? 'text-amber-bloom' : 'text-cyan-bloom'
                        }`}
                      >
                        {dirty ? (
                          <span
                            className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-bloom"
                            aria-hidden="true"
                          />
                        ) : (
                          <Check
                            size={10}
                            strokeWidth={3}
                            className="shrink-0"
                            aria-hidden="true"
                          />
                        )}
                        {dirty ? 'Unsaved' : 'Saved'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setDraft(null)
                          setNotice(null)
                        }}
                        className={TEXT_BUTTON}
                      >
                        Close
                      </button>
                      <button
                        type="button"
                        onClick={save}
                        className="rounded-md bg-white/12 px-2 py-1 text-[10px] font-medium text-ink-100 transition-colors hover:bg-white/20 focus-ring"
                      >
                        Save
                      </button>
                    </div>
                  </>
                ) : file ? (
                  file.content === '' ? (
                    <Note
                      icon={FileText}
                      tone="text-ink-500"
                      title="This file is empty"
                      body="Nothing has been written here yet. Use Edit to open it in the text editor."
                    />
                  ) : (
                    <pre className="min-h-0 flex-1 overflow-auto px-3 py-2 font-mono text-[11px] leading-relaxed whitespace-pre-wrap break-words text-ink-300">
                      {file.content}
                    </pre>
                  )
                ) : (
                  <dl className="px-3 py-2">
                    <Detail label="Kind" value="Folder" />
                    <Detail label="Items" value={String(stats.items)} />
                    <Detail label="Files" value={String(stats.files)} />
                    <Detail label="Folders" value={String(stats.folders)} />
                    <Detail label="Path" value={displayPath(info ? info.path : cwd)} />
                  </dl>
                )}
              </section>
            </>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col">
              <Note
                icon={FolderOpen}
                tone="text-coral-bloom"
                title={`${displayPath(cwd)} is not here`}
                body="It was removed from the filesystem. Open a place on the left, or head back to Home."
              />
              <div className="pb-3 text-center">
                <button
                  type="button"
                  onClick={() => go(HOME)}
                  className="rounded-md bg-white/10 px-2.5 py-1 text-[11px] text-ink-100 transition-colors hover:bg-white/20 focus-ring"
                >
                  Go to Home
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
