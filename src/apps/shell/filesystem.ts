import { APPS } from '../registry'

export type FileNode = {
  type: 'dir' | 'file'
  children?: Record<string, FileNode>
  content?: string
}

type DirNode = FileNode & { children: Record<string, FileNode> }

const file = (content: string): FileNode => ({ type: 'file', content })
const dir = (children: Record<string, FileNode>): DirNode => ({ type: 'dir', children })

export const HOME = '/Users/tj'
export const DESKTOP = `${HOME}/Desktop`
export const HISTORY_FILE = `${HOME}/.zsh_history`

export const exeName = (title: string) => `${title.toLowerCase().split(' ')[0]}.exe`

export const appForExe = (name: string) =>
  APPS.find((app) => exeName(app.title) === name.toLowerCase()) ?? null

const desktop = dir(
  Object.fromEntries(
    APPS.map((app) => [
      exeName(app.title),
      file(
        [
          `#!/usr/bin/env tjos`,
          `# ${app.title} — ${app.keywords}`,
          '',
          'This is a real file. Run it from the terminal:',
          `  ./${exeName(app.title)}`,
        ].join('\n'),
      ),
    ]),
  ),
)

export const FILESYSTEM: DirNode = dir({
  Users: dir({
    tj: dir({
      Desktop: desktop,
      Documents: dir({
        'about.md': file('Personal technical portfolio. Built with React, TypeScript and SASS.'),
        'canconf.md': file('Canadian tech conferences and hackathons worth your time.'),
        'reading.md': file(
          'Build a React + TypeScript todo app\nDesigning Data-Intensive Applications\nThe Art of Readable Code',
        ),
      }),
      Downloads: dir({}),
      '.zshrc': file('export EDITOR=nvim\nalias ll="ls -l"\nalias gs="git status"'),
    }),
  }),
  bin: dir({
    ls: file(''),
    cat: file(''),
    pwd: file(''),
  }),
  etc: dir({
    motd: file('Welcome to TJOS. Type `help` if you get lost.'),
  }),
})

const isDir = (node: FileNode | null | undefined): node is DirNode => node?.type === 'dir'

const STORAGE_KEY = 'tjos.filesystem.v1'

const sanitize = (value: unknown): FileNode | null => {
  if (!value || typeof value !== 'object') return null
  const node = value as { type?: unknown; children?: unknown; content?: unknown }
  if (node.type === 'file') return typeof node.content === 'string' ? file(node.content) : null
  if (node.type !== 'dir' || !node.children || typeof node.children !== 'object') return null
  const children: Record<string, FileNode> = {}
  for (const [name, child] of Object.entries(node.children as Record<string, unknown>)) {
    if (name === '.' || name === '..' || name.includes('/')) continue
    const clean = sanitize(child)
    if (clean) children[name] = clean
  }
  return dir(children)
}

const load = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return sanitize(JSON.parse(raw))
  } catch {
    return null
  }
}

const saved = load()
if (saved) {
  FILESYSTEM.children = saved.children ?? {}
}

export const resetFilesystem = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    return
  }
  location.reload()
}

const save = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(FILESYSTEM))
  } catch {
    return
  }
}

export const resolve = (cwd: string, target: string): string | null => {
  const expanded =
    target === '~' ? HOME : target.startsWith('~/') ? `${HOME}/${target.slice(2)}` : target
  const base = expanded.startsWith('/') ? [] : cwd.split('/').filter(Boolean)

  for (const segment of expanded.split('/').filter(Boolean)) {
    if (segment === '.') continue
    if (segment === '..') base.pop()
    else base.push(segment)
  }

  return `/${base.join('/')}`
}

export const lookup = (root: FileNode, path: string): FileNode | null => {
  let node: FileNode | undefined = root
  for (const segment of path.split('/').filter(Boolean)) {
    if (!isDir(node)) return null
    node = node.children?.[segment]
    if (!node) return null
  }
  return node ?? null
}

export const listing = (node: FileNode): string[] =>
  isDir(node) ? Object.keys(node.children ?? {}).sort() : []

export const read = (node: FileNode | null): string | null =>
  node?.type === 'file' ? (node.content ?? '') : null

export const isDirectory = (root: FileNode, cwd: string, target: string) => {
  const path = resolve(cwd, target)
  return path ? isDir(lookup(root, path)) : false
}

const listeners = new Set<() => void>()

export const subscribeFs = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const changed = () => {
  save()
  for (const listener of listeners) listener()
}

const absolute = (path: string) => resolve('/', path) ?? '/'

const parts = (path: string) => path.split('/').filter(Boolean)

const descend = (segments: string[], create: boolean): { dir: DirNode } | { error: string } => {
  let node: DirNode = FILESYSTEM
  let path = ''

  for (const segment of segments) {
    path = `${path}/${segment}`
    const existing: FileNode | undefined = node.children[segment]

    if (!existing) {
      if (!create) return { error: `no such file or directory: ${path}` }
      const fresh: DirNode = { type: 'dir', children: {} }
      node.children[segment] = fresh
      node = fresh
      continue
    }

    if (!isDir(existing)) return { error: `not a directory: ${path}` }
    node = existing
  }

  return { dir: node }
}

export const writeFile = (path: string, content: string): string | null => {
  const target = absolute(path)
  const segments = parts(target)
  if (segments.length === 0) return 'is a directory: /'

  const name = segments[segments.length - 1]
  const parent = descend(segments.slice(0, -1), true)
  if ('error' in parent) return parent.error
  if (isDir(parent.dir.children[name])) return `is a directory: ${target}`

  parent.dir.children[name] = file(content)
  changed()
  return null
}

export const appendFile = (path: string, content: string): string | null => {
  const target = absolute(path)
  const segments = parts(target)
  if (segments.length === 0) return 'is a directory: /'

  const name = segments[segments.length - 1]
  const parent = descend(segments.slice(0, -1), true)
  if ('error' in parent) return parent.error

  const existing = parent.dir.children[name]
  if (isDir(existing)) return `is a directory: ${target}`

  parent.dir.children[name] = file(existing?.content ? `${existing.content}\n${content}` : content)
  changed()
  return null
}

export const mkdir = (path: string): string | null => {
  const target = absolute(path)
  const segments = parts(target)
  if (segments.length === 0) return 'file exists: /'

  const name = segments[segments.length - 1]
  const parent = descend(segments.slice(0, -1), true)
  if ('error' in parent) return parent.error
  if (parent.dir.children[name]) return `file exists: ${target}`

  parent.dir.children[name] = dir({})
  changed()
  return null
}

export const removeNode = (path: string): string | null => {
  const target = absolute(path)
  const segments = parts(target)
  if (segments.length === 0) return 'cannot remove the root directory: /'

  const name = segments[segments.length - 1]
  const parent = descend(segments.slice(0, -1), false)
  if ('error' in parent) return parent.error

  const existing = parent.dir.children[name]
  if (!existing) return `no such file or directory: ${target}`
  if (isDir(existing) && listing(existing).length > 0) return `directory not empty: ${target}`

  delete parent.dir.children[name]
  changed()
  return null
}

export const displayPath = (cwd: string) =>
  cwd === HOME || cwd === '/Users/tj'
    ? '~'
    : cwd.startsWith(`${HOME}/`)
      ? `~${cwd.slice(HOME.length)}`
      : cwd

export const completions = (root: FileNode, cwd: string, fragment: string): string[] => {
  const slash = fragment.lastIndexOf('/')
  const dirPart = slash === -1 ? '' : fragment.slice(0, slash + 1)
  const namePart = slash === -1 ? fragment : fragment.slice(slash + 1)
  const dirPath = resolve(cwd, dirPart || '.') ?? cwd
  const node = lookup(root, dirPath)

  if (!isDir(node)) return []

  return Object.keys(node.children ?? {})
    .filter((name) => name.startsWith(namePart))
    .sort()
    .map((name) => `${dirPart}${name}`)
}
