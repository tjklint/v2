export type FileNode = {
  type: 'dir' | 'file'
  children?: Record<string, FileNode>
  content?: string
}

const file = (content: string): FileNode => ({ type: 'file', content })
const dir = (children: Record<string, FileNode>): FileNode => ({ type: 'dir', children })

export const HOME = '/Users/tj'

export const FILESYSTEM: FileNode = dir({
  Users: dir({
    tj: dir({
      Desktop: dir({}),
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

const isDir = (
  node: FileNode | null | undefined,
): node is FileNode & { children: Record<string, FileNode> } => node?.type === 'dir'

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
