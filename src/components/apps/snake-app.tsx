import { Pause, Play, RotateCcw } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

const COLUMNS = 22
const ROWS = 16
const CELL = 20
const TICK_MS = 110

type Point = { x: number; y: number }
type Phase = 'ready' | 'running' | 'paused' | 'over'

const spawn = (): Point => ({
  x: Math.floor(Math.random() * COLUMNS),
  y: Math.floor(Math.random() * ROWS),
})

const collides = (body: Point[], point: Point) =>
  body.some((segment) => segment.x === point.x && segment.y === point.y)

export function SnakeApp() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const snake = useRef<Point[]>([{ x: 4, y: 8 }])
  const food = useRef<Point>(spawn())
  const heading = useRef<Point>({ x: 1, y: 0 })
  const buffered = useRef<Point>({ x: 1, y: 0 })
  const phase = useRef<Phase>('ready')
  const points = useRef(0)
  const record = useRef(0)

  const [state, setState] = useState<Phase>('ready')
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(0)

  const sync = useCallback((next: Phase) => {
    phase.current = next
    setState(next)
  }, [])

  const restart = useCallback(() => {
    snake.current = [{ x: 4, y: 8 }]
    heading.current = { x: 1, y: 0 }
    buffered.current = { x: 1, y: 0 }
    food.current = spawn()
    points.current = 0
    setScore(0)
    sync('ready')
  }, [sync])

  useEffect(() => {
    const turns: Record<string, Point> = {
      ArrowUp: { x: 0, y: -1 },
      w: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
      s: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 },
      a: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
      d: { x: 1, y: 0 },
    }

    const onKey = (event: KeyboardEvent) => {
      const turn = turns[event.key]

      if (turn) {
        event.preventDefault()
        const current = heading.current
        if (turn.x === -current.x && turn.y === -current.y) return

        if (phase.current === 'ready' || phase.current === 'over') restart()
        buffered.current = turn
        if (phase.current === 'ready' || phase.current === 'over') heading.current = turn
        return
      }

      if (event.key === ' ') {
        event.preventDefault()
        if (phase.current === 'running') sync('paused')
        else if (phase.current === 'paused') sync('running')
        else restart()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [restart, sync])

  useEffect(() => {
    if (state !== 'running') return

    const timer = setInterval(() => {
      heading.current = buffered.current
      const head = snake.current[0]
      const next = { x: head.x + heading.current.x, y: head.y + heading.current.y }
      const escaped =
        next.x < 0 ||
        next.y < 0 ||
        next.x >= COLUMNS ||
        next.y >= ROWS ||
        collides(snake.current, next)

      if (escaped) {
        record.current = Math.max(record.current, points.current)
        points.current = 0
        setBest(record.current)
        setScore(0)
        sync('over')
        return
      }

      snake.current = [next, ...snake.current]

      if (next.x === food.current.x && next.y === food.current.y) {
        points.current += 1
        setScore(points.current)
        let target = spawn()
        while (collides(snake.current, target)) target = spawn()
        food.current = target
      } else {
        snake.current.pop()
      }
    }, TICK_MS)

    return () => clearInterval(timer)
  }, [state, sync])

  useEffect(() => {
    const node = canvas.current
    const context = node?.getContext('2d')
    if (!node || !context) return

    context.clearRect(0, 0, node.width, node.height)
    context.fillStyle = 'rgba(255, 255, 255, 0.03)'
    context.fillRect(0, 0, node.width, node.height)

    context.fillStyle = 'rgba(255, 255, 255, 0.1)'
    for (let x = 0; x < COLUMNS; x += 1) {
      for (let y = 0; y < ROWS; y += 1) context.fillRect(x * CELL, y * CELL, 1, 1)
    }

    context.fillStyle = '#fda4af'
    context.beginPath()
    context.arc(
      food.current.x * CELL + CELL / 2,
      food.current.y * CELL + CELL / 2,
      CELL * 0.3,
      0,
      Math.PI * 2,
    )
    context.fill()

    snake.current.forEach((segment, index) => {
      const inset = 2
      const fade = Math.max(0.3, 1 - index / 10)
      context.fillStyle = `rgba(125, 211, 252, ${fade})`
      context.beginPath()
      context.roundRect(
        segment.x * CELL + inset,
        segment.y * CELL + inset,
        CELL - inset * 2,
        CELL - inset * 2,
        4,
      )
      context.fill()
    })
  })

  const pause = () => sync(state === 'paused' ? 'running' : 'paused')

  const overlay = {
    ready: { title: 'Snake', hint: 'Arrows or WASD to move, space to pause' },
    paused: { title: 'Paused', hint: 'Space to resume' },
    over: { title: `Score ${score}`, hint: 'Space to play again' },
  }[state === 'running' ? 'paused' : state]

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-4 px-4 py-2.5 text-[11px] text-ink-500">
        <span className="tabular-nums">
          score <span className="text-ink-100">{score}</span>
        </span>
        <span className="tabular-nums">
          best <span className="text-ink-100">{best}</span>
        </span>
        <span className="flex-1" />
        <button
          type="button"
          aria-label={state === 'paused' ? 'Resume' : 'Pause'}
          onClick={pause}
          className="rounded-md p-1 text-ink-300 transition-colors hover:bg-white/10 hover:text-ink-100 focus-ring"
        >
          {state === 'paused' ? (
            <Play size={13} strokeWidth={2.25} />
          ) : (
            <Pause size={13} strokeWidth={2.25} />
          )}
        </button>
        <button
          type="button"
          aria-label="Restart"
          onClick={restart}
          className="rounded-md p-1 text-ink-300 transition-colors hover:bg-white/10 hover:text-ink-100 focus-ring"
        >
          <RotateCcw size={13} strokeWidth={2.25} />
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-4 pb-4">
        <canvas
          ref={canvas}
          width={COLUMNS * CELL}
          height={ROWS * CELL}
          className="rounded-lg bg-black/25"
        />
        {state !== 'running' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-lg bg-black/40">
            <p className="text-[15px] font-medium text-ink-100">{overlay.title}</p>
            <p className="text-[11px] text-ink-500">{overlay.hint}</p>
            {state === 'over' && (
              <button
                type="button"
                onClick={restart}
                className="mt-2 rounded-lg bg-white/10 px-3 py-1.5 text-[12px] text-ink-100 transition-colors hover:bg-white/15 focus-ring"
              >
                Play again
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
