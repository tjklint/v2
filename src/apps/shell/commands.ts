import { APPS, type AppId } from '../registry'
import {
  DESKTOP,
  FILESYSTEM,
  HOME,
  appForExe,
  listing,
  lookup,
  read,
  resolve,
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
}

export type CommandContext = {
  state: ShellState
  args: string[]
  history: string[]
}

export type Command = {
  name: string
  usage: string
  summary: string
  run: (context: CommandContext) => CommandResult
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

export const COMMANDS: Command[] = [
  {
    name: 'help',
    usage: 'help',
    summary: 'List every command',
    run: () => ({
      lines: [
        ...COMMANDS.map((command) => `  ${command.usage.padEnd(22)}${command.summary}`),
        '',
        'Tab completes commands and paths. Up and down walk the history.',
        'The .exe files on the Desktop are real files. Run one to open its window:',
        '  ls Desktop        ./sites.exe',
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
      if (!path) return { lines: [`ls: ${target}: No such file or directory`] }
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
      if (!path || !node) return { lines: [`cd: no such file or directory: ${args[0] ?? '~'}`] }
      if (node.type !== 'dir') return { lines: [`cd: not a directory: ${args[0]}`] }
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
    usage: 'cat <file>',
    summary: 'Print a file',
    run: ({ state, args }) => {
      const target = args[0]
      if (!target) return { lines: ['cat: missing file operand'] }
      const path = resolve(state.cwd, target)
      const content = read(path ? lookup(FILESYSTEM, path) : null)
      if (content === null) return { lines: [`cat: ${target}: No such file`] }
      return { lines: content.split('\n') }
    },
  },
  {
    name: 'echo',
    usage: 'echo <text>',
    summary: 'Print text',
    run: ({ args }) => ({ lines: [args.join(' ')] }),
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
    summary: 'Show recent commands',
    run: ({ history }) => ({
      lines: history.map((entry, index) => `${String(index + 1).padStart(4)}  ${entry}`),
    }),
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
  if (node.type === 'dir') return { lines: [`zsh: ${token}: is a directory`] }

  const name = path.slice(path.lastIndexOf('/') + 1)
  const app = appForExe(name)
  if (!app) return { lines: [`zsh: ${token}: Permission denied`] }

  return { lines: [`launching ${name}...`], launch: app.id }
}

export const runCommand = (input: string, context: Omit<CommandContext, 'args'>): CommandResult => {
  const [name, ...args] = input.trim().split(/\s+/)
  const command = COMMANDS.find((entry) => entry.name === name)

  if (command) return command.run({ ...context, args })

  const executed = execute(name, context.state.cwd)
  if (executed) return executed

  return { lines: [`zsh: command not found: ${name}`] }
}
