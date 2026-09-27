import { useEffect, useReducer, useRef } from 'react'

import {
  COMMAND_NAMES,
  readHistory,
  recordHistory,
  runCommand,
  type CommandResult,
} from '../../apps/shell/commands'
import {
  FILESYSTEM,
  HOME,
  completions,
  displayPath,
  isDirectory,
} from '../../apps/shell/filesystem'
import { useWindowStore } from '../../store/windows'

type Line = {
  text: string
  tone: 'out' | 'err' | 'echo' | 'info'
}

type Search = {
  draft: string
  index: number
  match: string | null
}

type TerminalState = {
  lines: Line[]
  input: string
  cwd: string
  history: string[]
  cursor: number
  search: Search | null
}

type Action =
  | { type: 'edit'; value: string }
  | { type: 'submit'; input: string; result: CommandResult; history: string[] }
  | { type: 'history'; direction: 1 | -1 }
  | { type: 'complete' }
  | { type: 'search'; direction: 'start' | 'next' }
  | { type: 'accept' }
  | { type: 'cancel' }

const BANNER: Line[] = [
  { text: 'zsh 5.9 (tjos-kernel)', tone: 'info' },
  { text: 'Type `help` for commands, `neofetch` for system info.', tone: 'info' },
  { text: '', tone: 'info' },
]

const initialState: TerminalState = {
  lines: BANNER,
  input: '',
  cwd: HOME,
  history: [],
  cursor: 0,
  search: null,
}

const mountState = (): TerminalState => ({ ...initialState, history: readHistory().reverse() })

const promptLine = (input: string): Line => ({ text: `tj@tjos ${input}`, tone: 'echo' })

const resultLines = (result: CommandResult): Line[] =>
  (result.lines ?? []).map((text) => ({
    text,
    tone: result.error || text.includes('not found') || text.includes('no such') ? 'err' : 'out',
  }))

const searchMatch = (history: string[], query: string, start: number) => {
  const needle = query.toLowerCase()
  if (needle === '' || history.length === 0) return { index: start, match: null }

  for (let offset = 0; offset < history.length; offset += 1) {
    const index = (start + offset) % history.length
    const entry = history[index]
    if (entry && entry.toLowerCase().includes(needle)) return { index, match: entry }
  }

  return { index: start, match: null }
}

const completeInput = (state: TerminalState): string => {
  const tokens = state.input.split(' ')
  const fragment = tokens[tokens.length - 1]
  const prefix = state.input.slice(0, state.input.length - fragment.length)
  const isCommand = tokens.length === 1

  const matches = isCommand
    ? COMMAND_NAMES.filter((name) => name.startsWith(fragment))
    : completions(FILESYSTEM, state.cwd, fragment)

  if (matches.length !== 1) return state.input

  const match = matches[0]
  const suffix = isCommand || !isDirectory(FILESYSTEM, state.cwd, match) ? ' ' : '/'

  return `${prefix}${match}${suffix}`
}

function reducer(state: TerminalState, action: Action): TerminalState {
  switch (action.type) {
    case 'edit':
      return {
        ...state,
        input: action.value,
        search: state.search
          ? { ...state.search, ...searchMatch(state.history, action.value, 0) }
          : null,
      }

    case 'submit':
      if (action.result.clear) {
        return { ...state, input: '', lines: [], cursor: 0, search: null }
      }
      return {
        ...state,
        input: '',
        lines: [...state.lines, promptLine(action.input), ...resultLines(action.result)],
        cwd: action.result.cwd ?? state.cwd,
        history: action.history,
        cursor: 0,
        search: null,
      }

    case 'history': {
      if (state.search) return state
      const next = state.cursor + (action.direction === -1 ? 1 : -1)
      if (next < 0 || next > state.history.length) return state
      return { ...state, cursor: next, input: next === 0 ? '' : (state.history[next - 1] ?? '') }
    }

    case 'complete':
      return state.search ? state : { ...state, input: completeInput(state) }

    case 'search': {
      if (action.direction === 'start') {
        return {
          ...state,
          search: { draft: state.input, ...searchMatch(state.history, state.input, 0) },
        }
      }
      if (!state.search) return state
      const next = searchMatch(state.history, state.input, state.search.index + 1)
      return { ...state, search: { ...state.search, ...next } }
    }

    case 'accept':
      if (!state.search) return state
      return { ...state, input: state.search.match ?? state.input, search: null }

    case 'cancel':
      if (!state.search) return state
      return { ...state, input: state.search.draft, search: null }
  }
}

const TONE_CLASS: Record<Line['tone'], string> = {
  out: 'text-ink-300',
  err: 'text-rose-300',
  echo: 'text-ink-100',
  info: 'text-ink-500',
}

export function TerminalApp() {
  const launch = useWindowStore((state) => state.launch)
  const [state, dispatch] = useReducer(reducer, undefined, mountState)
  const input = useRef<HTMLInputElement>(null)
  const viewport = useRef<HTMLDivElement>(null)

  useEffect(() => {
    input.current?.focus()
  }, [])

  useEffect(() => {
    const node = viewport.current
    if (node) node.scrollTop = node.scrollHeight
  }, [state.lines, state.search])

  const submit = () => {
    const value = state.input.trim()
    const history = value ? recordHistory(value) : state.history
    const result = runCommand(value, {
      state: { cwd: state.cwd },
      history,
    })

    if (result.launch) launch(result.launch)
    dispatch({ type: 'submit', input: state.input, result, history })
  }

  const searching = state.search !== null

  return (
    <div
      onMouseDown={(event) => {
        event.preventDefault()
        input.current?.focus()
      }}
      className="flex h-full cursor-text flex-col bg-black/25 font-mono text-[12px] leading-relaxed"
    >
      <div ref={viewport} className="flex-1 overflow-y-auto px-4 py-3">
        {state.lines.map((line, index) => (
          <p key={index} className={`${TONE_CLASS[line.tone]} whitespace-pre-wrap break-words`}>
            {line.text}
          </p>
        ))}
        {state.search && (
          <p className="whitespace-pre-wrap break-words text-ink-300">
            {state.search.match
              ? `(reverse-i-search) \`${state.input}': ${state.search.match}`
              : `(failed reverse-i-search) \`${state.input}'`}
          </p>
        )}
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="shrink-0 text-ink-500">tj@tjos</span>
          <span className="shrink-0 text-accent">{displayPath(state.cwd)}</span>
          <span className="shrink-0 text-ink-500">%</span>
          <input
            ref={input}
            value={state.input}
            spellCheck={false}
            autoComplete="off"
            aria-label={searching ? 'Reverse history search' : 'Terminal input'}
            onChange={(event) => dispatch({ type: 'edit', value: event.target.value })}
            onKeyDown={(event) => {
              if (event.ctrlKey && searching && event.key === 'c') {
                event.preventDefault()
                dispatch({ type: 'cancel' })
                return
              }

              if (event.ctrlKey && event.key === 'r') {
                event.preventDefault()
                dispatch({ type: 'search', direction: searching ? 'next' : 'start' })
                return
              }

              const keys: Record<string, () => void> = {
                Enter: () => {
                  event.preventDefault()
                  if (searching) dispatch({ type: 'accept' })
                  else submit()
                },
                Tab: () => {
                  event.preventDefault()
                  dispatch({ type: 'complete' })
                },
                ArrowUp: () => {
                  event.preventDefault()
                  dispatch({ type: 'history', direction: -1 })
                },
                ArrowDown: () => {
                  event.preventDefault()
                  dispatch({ type: 'history', direction: 1 })
                },
                Escape: () => {
                  if (!searching) return
                  event.preventDefault()
                  dispatch({ type: 'cancel' })
                },
              }

              keys[event.key]?.()
            }}
            className="min-w-0 flex-1 bg-transparent text-ink-100 caret-accent focus:outline-none"
          />
        </div>
      </div>
    </div>
  )
}
