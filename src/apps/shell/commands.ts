import { useAchievements, type AchievementId } from '../../store/achievements'
import { APPS, type AppId } from '../registry'
import {
  DESKTOP,
  FILESYSTEM,
  HISTORY_FILE,
  HOME,
  appendFile,
  appForExe,
  listing,
  lookup,
  mkdir,
  read,
  removeNode,
  resolve,
  writeFile,
  type FileNode,
} from './filesystem'

export type ShellState = {
  cwd: string
}

export type CommandResult = {
  lines?: string[]
  cwd?: string
  clear?: boolean
  launch?: AppId
  error?: boolean
}

export type CommandContext = {
  state: ShellState
  args: string[]
  history: string[]
  stdin?: string
}

export type Command = {
  name: string
  usage: string
  summary: string
  run: (context: CommandContext) => CommandResult
}

const HISTORY_LIMIT = 300

const UNLOCKS: Partial<Record<string, AchievementId>> = {
  help: 'read-the-manual',
  neofetch: 'showoff',
  history: 'historian',
  exit: 'no-exit',
}

const RECURSIVE = /^-[a-z]*[rf][a-z]*$/

const award = (...ids: (AchievementId | undefined)[]) => {
  try {
    for (const id of ids) {
      if (id) useAchievements.getState().unlock(id)
    }
  } catch {
    return
  }
}

const label = (name: string, node: FileNode) => (node.type === 'dir' ? `${name}/` : name)

const NEOFETCH_LOGO = [
  '        ▄▄▄▄▄▄▄▄▄▄▄▄▄',
  '     ▄██████████████████▄',
  '   ▄████▀▀        ▀▀████▄',
  '  ████▀   ▄▄▄▄▄▄▄▄   ▀████',
  ' ████    ███████████    ████',
  ' ████    ████    ████    ████',
  '  ████▄   ▀████████▀   ▄████',
  '   ▀████▄▄        ▄▄████▀',
  '     ▀██████████████████▀',
  '        ▀▀▀▀▀▀▀▀▀▀▀▀▀',
]

const findApp = (query: string): AppId | null => {
  const needle = query.toLowerCase()
  const match = APPS.find((app) => app.id === needle || app.title.toLowerCase() === needle)
  return match?.id ?? null
}

const describeNode = (node: FileNode | null, name: string): string[] => {
  if (!node) return [`ls: ${name}: No such file or directory`]
  if (node.type === 'file') return [name]
  return listing(node).map((entry) => label(entry, node.children![entry]))
}

const splitLines = (text: string) => (text === '' ? [] : text.split('\n'))

const pathArg = (args: string[]) => args.find((arg) => !arg.startsWith('-')) ?? null

const operands = (args: string[]): string[] => {
  const kept: string[] = []
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]
    if (arg === '-n') index += 1
    else if (!arg.startsWith('-')) kept.push(arg)
  }
  return kept
}

const countArg = (args: string[], fallback: number) => {
  const flag = args.indexOf('-n')
  const next = flag === -1 ? undefined : args[flag + 1]
  const glued = args.find((arg) => /^-\d+$/.test(arg))
  const raw = next ?? glued?.slice(1)
  const value = raw === undefined ? Number.NaN : Number.parseInt(raw, 10)
  return Number.isFinite(value) ? value : fallback
}

type Source = { lines: string[] } | { error: string }

const readSource = ({ state, args, stdin }: CommandContext): Source => {
  const files = operands(args)

  if (files.length === 0) {
    if (stdin === undefined) return { error: 'missing file operand' }
    return { lines: splitLines(stdin) }
  }

  const lines: string[] = []

  for (const target of files) {
    const path = resolve(state.cwd, target)
    const content = read(path ? lookup(FILESYSTEM, path) : null)
    if (content === null) return { error: `no such file or directory: ${target}` }
    lines.push(...splitLines(content))
  }

  return { lines }
}

export const readHistory = (): string[] => {
  const node = lookup(FILESYSTEM, HISTORY_FILE)
  const content = read(node)
  return content === null ? [] : splitLines(content)
}

export const recordHistory = (entry: string): string[] => {
  const entries = [...readHistory(), entry].slice(-HISTORY_LIMIT)
  writeFile(HISTORY_FILE, entries.join('\n'))
  return [...entries].reverse()
}

export const COMMANDS: Command[] = [
  {
    name: 'help',
    usage: 'help',
    summary: 'List every command',
    run: () => ({
      lines: [
        ...COMMANDS.map((command) => `  ${command.usage.padEnd(24)}${command.summary}`),
        '',
        'Tab completes commands and paths. Up and down walk the history.',
        'Ctrl+R searches the history backwards. The log lives in ~/.zsh_history.',
        'The .exe files on the Desktop are real files. Run one to open its window:',
        '  ls Desktop        ./sites.exe',
        '',
        'Pipes join commands, and > or >> at the end writes to a file:',
        '  cat ~/Documents/reading.md | grep -i react | wc',
        '  ls ~/Documents | sort | uniq | head -n 2',
        '  echo ship it > notes.md        echo again >> notes.md',
      ],
    }),
  },
  {
    name: 'ls',
    usage: 'ls [path]',
    summary: 'List directory contents',
    run: ({ state, args }) => {
      const target = args[0] ?? '.'
      const path = resolve(state.cwd, target)
      if (!path) return { lines: [`ls: ${target}: No such file or directory`], error: true }
      return { lines: describeNode(lookup(FILESYSTEM, path), path) }
    },
  },
  {
    name: 'cd',
    usage: 'cd [path]',
    summary: 'Change directory',
    run: ({ state, args }) => {
      const path = resolve(state.cwd, args[0] ?? '~')
      const node = path ? lookup(FILESYSTEM, path) : null
      if (!path || !node)
        return { lines: [`cd: no such file or directory: ${args[0] ?? '~'}`], error: true }
      if (node.type !== 'dir') return { lines: [`cd: not a directory: ${args[0]}`], error: true }
      return { cwd: path }
    },
  },
  {
    name: 'pwd',
    usage: 'pwd',
    summary: 'Print the working directory',
    run: ({ state }) => ({ lines: [state.cwd] }),
  },
  {
    name: 'cat',
    usage: 'cat [file...]',
    summary: 'Print files, or piped stdin',
    run: (context) => {
      const source = readSource(context)
      if ('error' in source) return { lines: [`cat: ${source.error}`], error: true }
      return { lines: source.lines }
    },
  },
  {
    name: 'echo',
    usage: 'echo <text>',
    summary: 'Print text',
    run: ({ args }) => ({ lines: [args.join(' ')] }),
  },
  {
    name: 'touch',
    usage: 'touch <path>',
    summary: 'Create an empty file',
    run: ({ state, args }) => {
      const target = pathArg(args)
      if (!target) return { lines: ['touch: missing file operand'], error: true }
      const path = resolve(state.cwd, target) ?? target
      if (lookup(FILESYSTEM, path)) return { lines: [] }
      const error = writeFile(path, '')
      return error ? { lines: [`touch: ${error}`], error: true } : { lines: [] }
    },
  },
  {
    name: 'mkdir',
    usage: 'mkdir <path>',
    summary: 'Create a directory',
    run: ({ state, args }) => {
      const target = pathArg(args)
      if (!target) return { lines: ['mkdir: missing operand'], error: true }
      const error = mkdir(resolve(state.cwd, target) ?? target)
      return error ? { lines: [`mkdir: ${error}`], error: true } : { lines: [] }
    },
  },
  {
    name: 'rm',
    usage: 'rm <path>',
    summary: 'Remove a file or empty directory',
    run: ({ state, args }) => {
      const target = pathArg(args)
      if (!target) return { lines: ['rm: missing operand'], error: true }
      const error = removeNode(resolve(state.cwd, target) ?? target)
      return error ? { lines: [`rm: ${error}`], error: true } : { lines: [] }
    },
  },
  {
    name: 'grep',
    usage: 'grep [-i] <pat> [file]',
    summary: 'Print lines matching a pattern',
    run: (context) => {
      const [pattern, ...files] = operands(context.args)
      if (!pattern) return { lines: ['grep: missing pattern'], error: true }
      const source = readSource({ ...context, args: files })
      if ('error' in source) return { lines: [`grep: ${source.error}`], error: true }

      const insensitive = context.args.includes('-i')
      const needle = insensitive ? pattern.toLowerCase() : pattern

      return {
        lines: source.lines.filter((line) =>
          (insensitive ? line.toLowerCase() : line).includes(needle),
        ),
      }
    },
  },
  {
    name: 'head',
    usage: 'head [-n N] [file]',
    summary: 'First N lines (default 10)',
    run: (context) => {
      const source = readSource(context)
      if ('error' in source) return { lines: [`head: ${source.error}`], error: true }
      return { lines: source.lines.slice(0, countArg(context.args, 10)) }
    },
  },
  {
    name: 'tail',
    usage: 'tail [-n N] [file]',
    summary: 'Last N lines (default 10)',
    run: (context) => {
      const source = readSource(context)
      if ('error' in source) return { lines: [`tail: ${source.error}`], error: true }
      return {
        lines: source.lines.slice(Math.max(0, source.lines.length - countArg(context.args, 10))),
      }
    },
  },
  {
    name: 'wc',
    usage: 'wc [-l|-w|-c] [file]',
    summary: 'Count lines, words, characters',
    run: (context) => {
      const source = readSource(context)
      if ('error' in source) return { lines: [`wc: ${source.error}`], error: true }

      const text = source.lines.join('\n')
      const only = context.args.find((arg) => arg === '-l' || arg === '-w' || arg === '-c')
      const counts = [
        source.lines.length,
        text.split(/\s+/).filter(Boolean).length,
        text.replace(/\n/g, '').length,
      ]
      const picked =
        only === '-l' ? counts[0] : only === '-w' ? counts[1] : only === '-c' ? counts[2] : null
      const cells = (picked === null ? counts : [picked]).map((count) => String(count).padStart(6))
      const name = operands(context.args)[0]

      return { lines: [`${cells.join('')}${picked === null && name ? ` ${name}` : ''}`] }
    },
  },
  {
    name: 'sort',
    usage: 'sort [file]',
    summary: 'Sort lines alphabetically',
    run: (context) => {
      const source = readSource(context)
      if ('error' in source) return { lines: [`sort: ${source.error}`], error: true }
      return { lines: [...source.lines].sort() }
    },
  },
  {
    name: 'uniq',
    usage: 'uniq [file]',
    summary: 'Drop adjacent duplicate lines',
    run: (context) => {
      const source = readSource(context)
      if ('error' in source) return { lines: [`uniq: ${source.error}`], error: true }
      const { lines } = source
      return { lines: lines.filter((line, index) => index === 0 || line !== lines[index - 1]) }
    },
  },
  {
    name: 'rev',
    usage: 'rev [file]',
    summary: 'Reverse each line',
    run: (context) => {
      const source = readSource(context)
      if ('error' in source) return { lines: [`rev: ${source.error}`], error: true }
      return { lines: source.lines.map((line) => [...line].reverse().join('')) }
    },
  },
  {
    name: 'open',
    usage: 'open <app>',
    summary: `Launch an app (${APPS.map((app) => app.id).join(', ')})`,
    run: ({ args }) => {
      const app = findApp(args[0] ?? '')
      if (!app)
        return {
          lines: [
            `open: unknown app: ${args[0] ?? ''}`,
            `Try: ${APPS.map((entry) => entry.id).join(', ')}`,
          ],
          error: true,
        }
      return { lines: [`launching ${app}...`], launch: app }
    },
  },
  {
    name: 'whoami',
    usage: 'whoami',
    summary: 'Print the current user',
    run: () => ({ lines: ['tj'] }),
  },
  {
    name: 'date',
    usage: 'date',
    summary: 'Print the current date',
    run: () => ({ lines: [new Date().toString()] }),
  },
  {
    name: 'uname',
    usage: 'uname -a',
    summary: 'Print system information',
    run: () => ({ lines: ['TJOS tj 1.0.0 tjos-kernel web/typescript arm64'] }),
  },
  {
    name: 'neofetch',
    usage: 'neofetch',
    summary: 'Show system info with the logo',
    run: () => ({
      lines: [
        ...NEOFETCH_LOGO,
        '',
        'tj@tjos',
        '-------------',
        `os       TJOS 1.0 (web)`,
        `shell    zsh 5.9`,
        `wm       tjwm`,
        `terminal tjos-term`,
        `uptime   ${Math.floor(performance.now() / 1000)}s`,
        `home     ${HOME}`,
      ],
    }),
  },
  {
    name: 'history',
    usage: 'history',
    summary: 'Print the persisted command log',
    run: ({ history }) => {
      const entries = readHistory()
      const log = entries.length > 0 ? entries : [...history].reverse()
      return { lines: log.map((entry, index) => `${String(index + 1).padStart(4)}  ${entry}`) }
    },
  },
  {
    name: 'clear',
    usage: 'clear',
    summary: 'Clear the screen',
    run: () => ({ clear: true }),
  },
  {
    name: 'exit',
    usage: 'exit',
    summary: 'Attempt to leave (unsupported)',
    run: () => ({
      lines: [
        'there is no exit.',
        'this is a browser tab pretending to be a terminal.',
        'the terminal is in on it.',
        'close the tab, or commit to the bit.',
      ],
    }),
  },
]

export const COMMAND_NAMES = COMMANDS.map((command) => command.name)

const PATH_DIRS = ['/bin', DESKTOP]

const execute = (token: string, cwd: string): CommandResult | null => {
  const candidates = [resolve(cwd, token), ...PATH_DIRS.map((dir) => resolve(dir, token))]
  const path = candidates.find((entry) => entry && lookup(FILESYSTEM, entry))

  if (!path) return null

  const node = lookup(FILESYSTEM, path)
  if (!node) return null
  if (node.type === 'dir') return { lines: [`zsh: ${token}: is a directory`], error: true }

  const name = path.slice(path.lastIndexOf('/') + 1)
  const app = appForExe(name)
  if (!app) return { lines: [`zsh: ${token}: Permission denied`], error: true }

  return { lines: [`launching ${name}...`], launch: app.id }
}

type Redirect = { append: boolean; path: string }

type Stage = { tokens: string[]; redirect: Redirect | null }

const parseStage = (raw: string): Stage | null => {
  const tokens = raw.trim().split(/\s+/).filter(Boolean)
  const arrow = tokens.findIndex((token) => token === '>' || token === '>>')
  if (arrow === -1) return { tokens, redirect: null }
  if (tokens.length !== arrow + 2) return null
  return {
    tokens: tokens.slice(0, arrow),
    redirect: { append: tokens[arrow] === '>>', path: tokens[arrow + 1] },
  }
}

const redirectTo = (redirect: Redirect, lines: string[], cwd: string): string | null => {
  const path = resolve(cwd, redirect.path)
  if (!path) return `no such file or directory: ${redirect.path}`
  const content = lines.join('\n')
  return redirect.append ? appendFile(path, content) : writeFile(path, content)
}

const runStage = (
  name: string,
  args: string[],
  stdin: string | undefined,
  context: Omit<CommandContext, 'args'>,
): CommandResult => {
  const command = COMMANDS.find((entry) => entry.name === name)
  if (command) {
    award('first-command', UNLOCKS[command.name])
    if (command.name === 'rm' && args.includes('/') && args.some((arg) => RECURSIVE.test(arg))) {
      award('self-destruct')
    }
    return command.run({ ...context, args, stdin })
  }

  const executed = execute(name, context.state.cwd)
  if (executed) {
    award('first-command')
    return executed
  }

  return { lines: [`zsh: command not found: ${name}`], error: true }
}

export const runCommand = (input: string, context: Omit<CommandContext, 'args'>): CommandResult => {
  const stages: Stage[] = []

  for (const raw of input.split('|')) {
    const stage = parseStage(raw)
    if (!stage) return { lines: ['zsh: parse error: expected a file after >'], error: true }
    stages.push(stage)
  }

  if (stages.length > 1) award('first-pipe')
  if (stages.some((stage) => stage.redirect)) award('first-redirect')

  let stdin: string | undefined
  let result: CommandResult = { lines: [] }

  for (const stage of stages) {
    const [name, ...args] = stage.tokens
    result = name ? runStage(name, args, stdin, context) : { lines: [] }
    if (result.error) return result

    if (!stage.redirect) {
      stdin = (result.lines ?? []).join('\n')
      continue
    }

    const failure = redirectTo(stage.redirect, result.lines ?? [], context.state.cwd)
    result = failure ? { lines: [failure], error: true } : { ...result, lines: [] }
    stdin = ''
  }

  return result
}
