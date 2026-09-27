import { useEffect, useReducer, useRef } from 'react'

import { COMMAND_NAMES, runCommand, type CommandResult } from '../../apps/shell/commands'
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

type TerminalState = {
  lines: Line[]
  input: string
  cwd: string
  history: string[]
  cursor: number
}

type Action =
  | { type: 'edit'; value: string }
  | { type: 'submit'; input: string; result: CommandResult }
  | { type: 'history'; direction: 1 | -1 }
  | { type: 'complete' }

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
}

const promptLine = (input: string): Line => ({ text: `tj@tjos ${input}`, tone: 'echo' })

const resultLines = (result: CommandResult): Line[] =>
  (result.lines ?? []).map((text) => ({
    text,
    tone: text.includes('not found') || text.includes('no such') ? 'err' : 'out',
  }))

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
      return { ...state, input: action.value }

    case 'submit':
      if (action.result.clear) {
        return { ...state, input: '', lines: [], cursor: 0 }
      }
      return {
        ...state,
        input: '',
        lines: [...state.lines, promptLine(action.input), ...resultLines(action.result)],
        cwd: action.result.cwd ?? state.cwd,
        history: action.input ? [action.input, ...state.history].slice(0, 50) : state.history,
        cursor: 0,
      }

    case 'history': {
      const next = state.cursor + (action.direction === -1 ? 1 : -1)
      if (next < 0 || next > state.history.length) return state
      return { ...state, cursor: next, input: next === 0 ? '' : (state.history[next - 1] ?? '') }
    }

    case 'complete':
      return { ...state, input: completeInput(state) }
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
  const [state, dispatch] = useReducer(reducer, initialState)
  const input = useRef<HTMLInputElement>(null)
  const viewport = useRef<HTMLDivElement>(null)

  useEffect(() => {
    input.current?.focus()
  }, [])

  useEffect(() => {
    const node = viewport.current
    if (node) node.scrollTop = node.scrollHeight
  }, [state.lines])

  const submit = () => {
    const value = state.input.trim()
    const result = runCommand(value, {
      state: { cwd: state.cwd },
      history: state.history,
    })

    if (result.launch) launch(result.launch)
    dispatch({ type: 'submit', input: state.input, result })
  }

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
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="shrink-0 text-ink-500">tj@tjos</span>
          <span className="shrink-0 text-sky-300">{displayPath(state.cwd)}</span>
          <span className="shrink-0 text-ink-500">%</span>
          <input
            ref={input}
            value={state.input}
            spellCheck={false}
            autoComplete="off"
            aria-label="Terminal input"
            onChange={(event) => dispatch({ type: 'edit', value: event.target.value })}
            onKeyDown={(event) => {
              const keys: Record<string, () => void> = {
                Enter: () => {
                  event.preventDefault()
                  submit()
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
              }

              keys[event.key]?.()
            }}
            className="min-w-0 flex-1 bg-transparent text-ink-100 caret-sky-300 focus:outline-none"
          />
        </div>
      </div>
    </div>
  )
}
