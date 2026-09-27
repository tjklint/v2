import { Pause, Play, RotateCcw } from 'lucide-react'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'

import { useWindowStore } from '../../store/windows'

type Phase = 'ready' | 'running' | 'paused' | 'over'

type Size = { width: number; height: number }

type Point = { x: number; y: number }

type Snapshot = { score: number; stat: [string, string]; title: string }

type View = Snapshot & { best: number; phase: Phase }

type Instance = {
  phase: () => Phase
  reset: () => void
  launch: () => void
  pause: () => void
  resume: () => void
  update: (dt: number, size: Size) => boolean
  draw: (ctx: CanvasRenderingContext2D, size: Size) => void
  key: (name: string, down: boolean) => boolean
  aim: ((x: number) => void) | null
  snapshot: () => Snapshot
}

type Cabinet = {
  id: string
  name: string
  hint: string
  space: 'launch' | 'drop'
  create: () => Instance
}

const STORAGE_KEY = 'tjos:arcade:best'

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

const readBests = (): Record<string, number> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    if (parsed && typeof parsed === 'object') return parsed as Record<string, number>
    return {}
  } catch {
    return {}
  }
}

const saveBest = (id: string, score: number) => {
  const all = readBests()
  all[id] = Math.max(Number(all[id]) || 0, Math.round(score))
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch {
    return
  }
}

const cellFor = (size: Size, columns: number, rows: number) =>
  Math.max(2, Math.floor(Math.min(size.width / columns, size.height / rows)))

const originFor = (size: Size, columns: number, rows: number, cell: number) => ({
  x: Math.round((size.width - columns * cell) / 2),
  y: Math.round((size.height - rows * cell) / 2),
})

const block = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  radius: number,
) => {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.roundRect(x, y, size, size, radius)
  ctx.fill()
}

const SNAKE_COLUMNS = 20
const SNAKE_ROWS = 26
const SNAKE_TICK = 0.11
const SNAKE_TURNS: Record<string, Point> = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 },
  s: { x: 0, y: 1 },
  a: { x: -1, y: 0 },
  d: { x: 1, y: 0 },
  W: { x: 0, y: -1 },
  S: { x: 0, y: 1 },
  A: { x: -1, y: 0 },
  D: { x: 1, y: 0 },
}

const createSnake = (): Instance => {
  let body: Point[] = [{ x: 4, y: 8 }]
  let food: Point = { x: 12, y: 6 }
  let heading: Point = { x: 1, y: 0 }
  let queued: Point = { x: 1, y: 0 }
  let phase: Phase = 'ready'
  let score = 0
  let elapsed = 0

  const taken = (point: Point) =>
    body.some((segment) => segment.x === point.x && segment.y === point.y)

  const scatter = (): Point => {
    for (let attempt = 0; attempt < 240; attempt += 1) {
      const point = {
        x: Math.floor(Math.random() * SNAKE_COLUMNS),
        y: Math.floor(Math.random() * SNAKE_ROWS),
      }
      if (!taken(point)) return point
    }
    return { x: 0, y: 0 }
  }

  const reset = () => {
    body = [{ x: 4, y: 8 }]
    heading = { x: 1, y: 0 }
    queued = { x: 1, y: 0 }
    food = scatter()
    score = 0
    elapsed = 0
    phase = 'ready'
  }

  const step = () => {
    heading = queued
    const head = body[0]
    const next = { x: head.x + heading.x, y: head.y + heading.y }
    if (
      next.x < 0 ||
      next.y < 0 ||
      next.x >= SNAKE_COLUMNS ||
      next.y >= SNAKE_ROWS ||
      taken(next)
    ) {
      phase = 'over'
      return
    }
    body = [next, ...body]
    if (next.x === food.x && next.y === food.y) {
      score += 1
      food = scatter()
      return
    }
    body.pop()
  }

  reset()

  return {
    phase: () => phase,
    reset,
    launch: () => {
      reset()
      phase = 'running'
    },
    pause: () => {
      if (phase === 'running') phase = 'paused'
    },
    resume: () => {
      if (phase === 'paused') phase = 'running'
    },
    update: (dt) => {
      if (phase !== 'running') return false
      elapsed += dt
      let moved = false
      while (elapsed >= SNAKE_TICK) {
        elapsed -= SNAKE_TICK
        moved = true
        step()
        if (phase !== 'running') break
      }
      return moved
    },
    draw: (ctx, size) => {
      const cell = cellFor(size, SNAKE_COLUMNS, SNAKE_ROWS)
      const origin = originFor(size, SNAKE_COLUMNS, SNAKE_ROWS, cell)
      const width = SNAKE_COLUMNS * cell
      const height = SNAKE_ROWS * cell

      ctx.fillStyle = 'rgba(124, 92, 255, 0.05)'
      ctx.fillRect(origin.x, origin.y, width, height)

      ctx.fillStyle = 'rgba(255, 255, 255, 0.09)'
      for (let x = 0; x < SNAKE_COLUMNS; x += 1) {
        for (let y = 0; y < SNAKE_ROWS; y += 1) {
          ctx.fillRect(origin.x + x * cell + (cell >> 1), origin.y + y * cell + (cell >> 1), 1, 1)
        }
      }

      ctx.fillStyle = 'rgba(34, 211, 238, 0.3)'
      ctx.fillRect(origin.x, origin.y, width, 1)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)'
      ctx.fillRect(origin.x, origin.y, 1, height)

      ctx.fillStyle = 'rgba(255, 107, 157, 0.92)'
      ctx.beginPath()
      ctx.arc(
        origin.x + food.x * cell + cell / 2,
        origin.y + food.y * cell + cell / 2,
        Math.max(2, cell * 0.3),
        0,
        Math.PI * 2,
      )
      ctx.fill()

      body.forEach((segment, index) => {
        const inset = Math.max(1, cell * 0.12)
        block(
          ctx,
          origin.x + segment.x * cell + inset,
          origin.y + segment.y * cell + inset,
          cell - inset * 2,
          `rgba(125, 211, 252, ${Math.max(0.3, 1 - index / 12)})`,
          Math.max(1, cell * 0.2),
        )
      })
    },
    key: (name, down) => {
      if (!down) return false
      const turn = SNAKE_TURNS[name]
      if (!turn) return false
      if (turn.x === -heading.x && turn.y === -heading.y) return true
      if (phase !== 'running') {
        reset()
        phase = 'running'
      }
      queued = turn
      return true
    },
    aim: null,
    snapshot: () => ({
      score,
      stat: ['LEN', String(body.length)],
      title: 'GAME OVER',
    }),
  }
}

const BRICK_COLUMNS = 9
const BRICK_ROWS = 6
const BRICK_LIVES = 3
const BRICK_GAP = 4
const BRICK_PALETTE = ['#ff6b9d', '#ffb454', '#4ade80', '#22d3ee', '#7c5cff', '#60a5fa']

type Field = {
  left: number
  top: number
  width: number
  height: number
  brickWidth: number
  brickHeight: number
  brickTop: number
  paddleWidth: number
  paddleHeight: number
  paddleY: number
}

const breakoutField = (size: Size): Field => {
  const width = Math.max(24, size.width - 16)
  const height = Math.max(24, size.height - 16)
  const left = Math.round((size.width - width) / 2)
  const top = Math.round((size.height - height) / 2)
  const brickWidth = (width - BRICK_GAP * (BRICK_COLUMNS - 1)) / BRICK_COLUMNS
  const brickHeight = clamp(brickWidth * 0.5, 6, 20)
  return {
    left,
    top,
    width,
    height,
    brickWidth,
    brickHeight,
    brickTop: top + clamp(height * 0.08, 12, 28),
    paddleWidth: clamp(width * 0.22, 36, 110),
    paddleHeight: clamp(height * 0.022, 6, 12),
    paddleY: top + height - clamp(height * 0.09, 18, 34),
  }
}

const createBreakout = (): Instance => {
  let bricks: boolean[] = []
  let paddle = 0
  let ball = { x: 0, y: 0, vx: 0, vy: 0, r: 4 }
  let lives = BRICK_LIVES
  let score = 0
  let phase: Phase = 'ready'
  let won = false
  let served = false
  let left = false
  let right = false
  let pointing = false
  let aimX = 0

  const serve = (field: Field) => {
    const angle = (Math.random() - 0.5) * 0.7
    ball = {
      x: paddle,
      y: field.paddleY - 8,
      vx: Math.sin(angle) * 240,
      vy: -Math.abs(Math.cos(angle) * 240),
      r: 4,
    }
  }

  const reset = () => {
    bricks = Array.from({ length: BRICK_COLUMNS * BRICK_ROWS }, () => true)
    lives = BRICK_LIVES
    score = 0
    won = false
    served = false
    left = false
    right = false
    pointing = false
    phase = 'ready'
  }

  const advance = (field: Field, dt: number) => {
    ball.x += ball.vx * dt
    ball.y += ball.vy * dt

    if (ball.x - ball.r < field.left) {
      ball.x = field.left + ball.r
      ball.vx = Math.abs(ball.vx)
    }
    if (ball.x + ball.r > field.left + field.width) {
      ball.x = field.left + field.width - ball.r
      ball.vx = -Math.abs(ball.vx)
    }
    if (ball.y - ball.r < field.top) {
      ball.y = field.top + ball.r
      ball.vy = Math.abs(ball.vy)
    }

    const reach = field.paddleWidth / 2 + ball.r
    if (
      ball.vy > 0 &&
      ball.y + ball.r >= field.paddleY &&
      ball.y - ball.r <= field.paddleY + field.paddleHeight &&
      Math.abs(ball.x - paddle) <= reach
    ) {
      ball.y = field.paddleY - ball.r
      const offset = clamp((ball.x - paddle) / (field.paddleWidth / 2), -1, 1)
      const speed = clamp(Math.hypot(ball.vx, ball.vy) + 3, 200, 520)
      const side = offset < 0 ? -1 : 1
      const swing = side * Math.max(Math.abs(offset * 1.1), 0.28)
      ball.vx = Math.sin(swing) * speed
      ball.vy = -Math.abs(Math.cos(swing) * speed)
    }

    const column = Math.floor((ball.x - field.left) / (field.brickWidth + BRICK_GAP))
    const row = Math.floor((ball.y - field.brickTop) / (field.brickHeight + BRICK_GAP))
    if (
      row >= 0 &&
      row < BRICK_ROWS &&
      column >= 0 &&
      column < BRICK_COLUMNS &&
      bricks[row * BRICK_COLUMNS + column]
    ) {
      const brickX = field.left + column * (field.brickWidth + BRICK_GAP)
      const brickY = field.brickTop + row * (field.brickHeight + BRICK_GAP)
      const overlapX =
        field.brickWidth / 2 + ball.r - Math.abs(ball.x - (brickX + field.brickWidth / 2))
      const overlapY =
        field.brickHeight / 2 + ball.r - Math.abs(ball.y - (brickY + field.brickHeight / 2))
      if (overlapY <= overlapX) {
        const up = ball.y < brickY + field.brickHeight / 2 ? -1 : 1
        ball.y = brickY + (field.brickHeight / 2 + ball.r + 0.5) * up
        ball.vy = -ball.vy
      } else {
        const leftward = ball.x < brickX + field.brickWidth / 2 ? -1 : 1
        ball.x = brickX + (field.brickWidth / 2 + ball.r + 0.5) * leftward
        ball.vx = -ball.vx
      }
      const speed = Math.hypot(ball.vx, ball.vy)
      const drift = speed * 0.34
      if (Math.abs(ball.vy) < drift) {
        const lean = ball.vx < 0 ? -1 : 1
        ball.vy = ball.vy < 0 ? -drift : drift
        ball.vx = lean * Math.sqrt(Math.max(0, speed * speed - drift * drift))
      }
      bricks[row * BRICK_COLUMNS + column] = false
      score += 10
      if (!bricks.some(Boolean)) {
        won = true
        phase = 'over'
        return
      }
    }

    if (ball.y - ball.r > field.top + field.height) {
      lives -= 1
      if (lives <= 0) {
        phase = 'over'
        return
      }
      serve(field)
    }
  }

  reset()

  return {
    phase: () => phase,
    reset,
    launch: () => {
      reset()
      phase = 'running'
    },
    pause: () => {
      if (phase === 'running') phase = 'paused'
    },
    resume: () => {
      if (phase === 'paused') phase = 'running'
    },
    update: (dt, size) => {
      if (phase !== 'running') return false
      const field = breakoutField(size)
      if (!served) {
        served = true
        paddle = field.left + field.width / 2
        serve(field)
      }
      if (pointing) paddle += (aimX - paddle) * Math.min(1, dt * 18)
      else if (right !== left) paddle += (right ? 1 : -1) * 420 * dt
      paddle = clamp(
        paddle,
        field.left + field.paddleWidth / 2,
        field.left + field.width - field.paddleWidth / 2,
      )
      const travel = Math.hypot(ball.vx, ball.vy) * dt
      const steps = Math.max(1, Math.ceil(travel / 5))
      for (let index = 0; index < steps; index += 1) {
        if (phase !== 'running') break
        advance(field, dt / steps)
      }
      return true
    },
    draw: (ctx, size) => {
      const field = breakoutField(size)
      const reach = field.paddleWidth / 2

      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
      ctx.fillRect(field.left, field.top, field.width, field.height)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)'
      ctx.fillRect(field.left, field.top, field.width, 1)

      for (let row = 0; row < BRICK_ROWS; row += 1) {
        for (let column = 0; column < BRICK_COLUMNS; column += 1) {
          if (!bricks[row * BRICK_COLUMNS + column]) continue
          const x = field.left + column * (field.brickWidth + BRICK_GAP)
          const y = field.brickTop + row * (field.brickHeight + BRICK_GAP)
          block(
            ctx,
            x,
            y,
            field.brickWidth,
            BRICK_PALETTE[BRICK_ROWS - 1 - row] ?? '#7c5cff',
            Math.min(3, field.brickHeight / 3),
          )
        }
      }

      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)'
      ctx.fillRect(field.left, field.paddleY, field.width, 1)

      ctx.fillStyle = '#eeeef5'
      ctx.beginPath()
      ctx.roundRect(
        paddle - reach,
        field.paddleY,
        field.paddleWidth,
        field.paddleHeight,
        field.paddleHeight / 2,
      )
      ctx.fill()

      ctx.fillStyle = '#ffb454'
      ctx.beginPath()
      ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2)
      ctx.fill()
    },
    key: (name, down) => {
      if (name === 'ArrowLeft' || name === 'a' || name === 'A') {
        left = down
        pointing = false
        return true
      }
      if (name === 'ArrowRight' || name === 'd' || name === 'D') {
        right = down
        pointing = false
        return true
      }
      return false
    },
    aim: (x) => {
      aimX = x
      pointing = true
    },
    snapshot: () => ({
      score,
      stat: ['LIVES', String(Math.max(0, lives))],
      title: won ? 'YOU WIN' : 'GAME OVER',
    }),
  }
}

type PongRole = 'solo' | 'host' | 'guest'

type PongState = {
  seq: number
  player: number
  cpu: number
  bx: number
  by: number
  you: number
  them: number
  rally: number
  phase: Phase
}

type PongMessage =
  | { t: 'offer'; code: string }
  | { t: 'join'; code: string }
  | { t: 'state'; code: string; state: PongState }
  | { t: 'input'; code: string; dir: number }
  | { t: 'leave'; code: string }

type PongView = { role: PongRole; code: string; status: string; live: boolean }

const PONG_CHANNEL = 'tjos-pong-v1'
const PONG_STALE = 2500
const PONG_SEND_EVERY = 32

const makeCode = () => Math.random().toString(36).slice(2, 6).toUpperCase()

const pongNet = {
  role: 'solo' as PongRole,
  code: '',
  channel: null as BroadcastChannel | null,
  timer: 0,
  seq: 0,
  applied: -1,
  inbox: null as PongState | null,
  lastSeen: 0,
  input: 0,
  inputSent: 0,
  lastSent: 0,
  opponent: false,
  joined: false,
  listeners: new Set<() => void>(),
}

const pongStatus = () => {
  if (pongNet.role === 'host') return pongNet.opponent ? 'OPPONENT READY' : 'WAITING FOR OPPONENT'
  if (pongNet.role === 'guest') return pongNet.joined ? 'CONNECTED' : 'WAITING FOR HOST'
  return 'SOLO'
}

const pongAnnounce = () => {
  for (const listener of pongNet.listeners) listener()
}

const pongSend = (message: PongMessage) => {
  pongNet.channel?.postMessage(message)
}

const pongReceive = (message: PongMessage) => {
  if (pongNet.role === 'solo' || message.code !== pongNet.code) return
  if (message.t === 'offer') {
    if (pongNet.role === 'host') {
      pongNet.opponent = true
      pongAnnounce()
      return
    }
    if (!pongNet.joined) {
      pongNet.joined = true
      pongAnnounce()
    }
    return
  }
  if (message.t === 'join' && pongNet.role === 'host') {
    pongNet.opponent = true
    pongAnnounce()
    pongSend({ t: 'offer', code: pongNet.code })
    return
  }
  if (message.t === 'state' && pongNet.role === 'guest') {
    pongNet.inbox = message.state
    pongNet.lastSeen = performance.now()
    if (!pongNet.joined) {
      pongNet.joined = true
      pongAnnounce()
    }
    return
  }
  if (message.t === 'input' && pongNet.role === 'host') {
    pongNet.input = message.dir
    if (!pongNet.opponent) {
      pongNet.opponent = true
      pongAnnounce()
    }
    return
  }
  if (message.t === 'leave') pongLeave()
}

const pongClose = () => {
  if (pongNet.timer) {
    clearInterval(pongNet.timer)
    pongNet.timer = 0
  }
  pongNet.channel?.close()
  pongNet.channel = null
  pongNet.role = 'solo'
  pongNet.code = ''
  pongNet.inbox = null
  pongNet.input = 0
  pongNet.inputSent = 0
  pongNet.opponent = false
  pongNet.joined = false
  pongNet.applied = -1
  pongAnnounce()
}

const pongOpen = (role: Exclude<PongRole, 'solo'>, code: string) => {
  pongClose()
  if (typeof BroadcastChannel === 'undefined') return
  pongNet.role = role
  pongNet.code = code
  pongNet.lastSeen = performance.now()
  const channel = new BroadcastChannel(PONG_CHANNEL)
  pongNet.channel = channel
  channel.onmessage = (event: MessageEvent<PongMessage>) => pongReceive(event.data)
  pongNet.timer = setInterval(() => {
    if (
      pongNet.role === 'guest' &&
      pongNet.joined &&
      performance.now() - pongNet.lastSeen > PONG_STALE
    ) {
      pongLeave()
    }
  }, 500)
  window.addEventListener('pagehide', pongLeave)
  pongAnnounce()
}

const pongLeave = () => {
  if (pongNet.role === 'solo') return
  pongSend({ t: 'leave', code: pongNet.code })
  window.removeEventListener('pagehide', pongLeave)
  pongClose()
}

const pongCreate = () => {
  pongOpen('host', makeCode())
  pongAnnounce()
}

const pongJoin = (code: string) => {
  const clean = code.trim().toUpperCase()
  if (clean.length < 4) return false
  pongOpen('guest', clean)
  pongSend({ t: 'join', code: clean })
  return true
}

const pongSetInput = (dir: number) => {
  if (pongNet.role !== 'guest' || pongNet.inputSent === dir) return
  pongNet.inputSent = dir
  pongSend({ t: 'input', code: pongNet.code, dir })
}

const pongPublish = (state: Omit<PongState, 'seq'>) => {
  if (pongNet.role !== 'host') return
  const now = performance.now()
  if (now - pongNet.lastSent < PONG_SEND_EVERY) return
  pongNet.lastSent = now
  pongNet.seq += 1
  pongSend({ t: 'state', code: pongNet.code, state: { ...state, seq: pongNet.seq } })
}

const pongView = (): PongView => ({
  role: pongNet.role,
  code: pongNet.code,
  status: pongStatus(),
  live: pongNet.role === 'host' ? pongNet.opponent : pongNet.joined,
})

const PONG_TARGET = 11

const pongField = (size: Size) => {
  const width = Math.max(24, size.width - 16)
  const height = Math.max(24, size.height - 16)
  return {
    left: Math.round((size.width - width) / 2),
    top: Math.round((size.height - height) / 2),
    width,
    height,
    paddleWidth: clamp(width * 0.022, 5, 10),
    paddleHeight: clamp(height * 0.16, 28, 86),
  }
}

const createPong = (): Instance => {
  let player = 0
  let cpu = 0
  let ball = { x: 0, y: 0, vx: 0, vy: 0, r: 4 }
  let you = 0
  let them = 0
  let rally = 0
  let phase: Phase = 'ready'
  let wait = 0
  let serveDir = 1
  let drift = 0
  let heldUp = false
  let heldDown = false

  const reset = () => {
    you = 0
    them = 0
    rally = 0
    wait = 0.85
    heldUp = false
    heldDown = false
    serveDir = 1
    phase = 'ready'
  }

  const bounce = (center: number, extent: number, field: ReturnType<typeof pongField>) => {
    const offset = clamp((ball.y - center) / extent, -1, 1)
    const speed = clamp(Math.hypot(ball.vx, ball.vy) + 6, 200, 430)
    ball.vx = -Math.sign(ball.vx) * speed
    ball.vy = clamp(ball.vy + offset * 150, -speed * 0.8, speed * 0.8)
    ball.x = center + Math.sign(ball.vx) * (field.paddleWidth / 2 + ball.r + 1)
    rally += 1
  }

  const point = (scorer: 'you' | 'them', field: ReturnType<typeof pongField>) => {
    if (scorer === 'you') you += 1
    else them += 1
    serveDir = scorer === 'you' ? 1 : -1
    drift = (Math.random() - 0.5) * field.height * 0.16
    wait = 0.85
    ball = { x: field.left + field.width / 2, y: field.top + field.height / 2, vx: 0, vy: 0, r: 4 }
    if (you >= PONG_TARGET || them >= PONG_TARGET) phase = 'over'
  }

  reset()

  return {
    phase: () => phase,
    reset,
    launch: () => {
      if (pongNet.role === 'guest') return
      reset()
      phase = 'running'
    },
    pause: () => {
      if (phase === 'running') phase = 'paused'
    },
    resume: () => {
      if (phase === 'paused') phase = 'running'
    },
    update: (dt, size) => {
      if (pongNet.role === 'guest') {
        const state = pongNet.inbox
        if (!state || state.seq <= pongNet.applied) return false
        pongNet.applied = state.seq
        player = state.player
        cpu = state.cpu
        ball = { x: state.bx, y: state.by, vx: 0, vy: 0, r: 4 }
        you = state.you
        them = state.them
        rally = state.rally
        phase = state.phase
        return true
      }
      if (phase !== 'running') return false
      const field = pongField(size)
      const middle = field.top + field.height / 2
      const half = field.paddleHeight / 2
      const ceiling = field.top + field.height - half

      player = clamp(
        player + ((heldDown ? 1 : 0) - (heldUp ? 1 : 0)) * 340 * dt,
        field.top + half,
        ceiling,
      )

      if (wait > 0) {
        wait -= dt
        player = clamp(player, field.top + half, ceiling)
        ball.x = middle + Math.sin((0.85 - wait) * 6) * 6
        ball.y = middle
        cpu += clamp(middle - cpu, -260 * dt, 260 * dt)
        if (wait <= 0) {
          const speed = 230
          ball.vx = serveDir * speed
          ball.vy = (Math.random() - 0.5) * 120
          rally = 0
        }
        return true
      }

      if (pongNet.role === 'host') {
        cpu = clamp(cpu + pongNet.input * 340 * dt, field.top + half, ceiling)
      } else {
        const target = ball.vx > 0 ? ball.y + drift : middle
        cpu = clamp(cpu + clamp((target - cpu) * 6, -190 * dt, 190 * dt), field.top + half, ceiling)
      }

      ball.x += ball.vx * dt
      ball.y += ball.vy * dt

      if (ball.y - ball.r < field.top) {
        ball.y = field.top + ball.r
        ball.vy = Math.abs(ball.vy)
      }
      if (ball.y + ball.r > field.top + field.height) {
        ball.y = field.top + field.height - ball.r
        ball.vy = -Math.abs(ball.vy)
      }

      if (
        ball.vx < 0 &&
        ball.x - ball.r <= field.left + field.paddleWidth &&
        Math.abs(ball.y - player) <= half + ball.r
      ) {
        bounce(field.left + field.paddleWidth / 2, half, field)
      }
      if (
        ball.vx > 0 &&
        ball.x + ball.r >= field.left + field.width - field.paddleWidth &&
        Math.abs(ball.y - cpu) <= half + ball.r
      ) {
        bounce(field.left + field.width - field.paddleWidth / 2, half, field)
      }

      if (ball.x - ball.r < field.left) point('them', field)
      else if (ball.x + ball.r > field.left + field.width) point('you', field)

      return true
    },
    draw: (ctx, size) => {
      const field = pongField(size)
      const half = field.paddleHeight / 2

      pongPublish({ player, cpu, bx: ball.x, by: ball.y, you, them, rally, phase })

      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
      ctx.fillRect(field.left, field.top, field.width, field.height)

      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
      const dash = clamp(field.height / 16, 6, 14)
      for (let y = field.top + dash / 2; y < field.top + field.height; y += dash * 2) {
        ctx.fillRect(field.left + field.width / 2 - 1, y, 2, dash)
      }

      ctx.fillStyle = 'rgba(34, 211, 238, 0.9)'
      ctx.beginPath()
      ctx.roundRect(
        field.left,
        player - half,
        field.paddleWidth,
        field.paddleHeight,
        field.paddleWidth / 2,
      )
      ctx.fill()

      ctx.fillStyle = 'rgba(255, 107, 157, 0.9)'
      ctx.beginPath()
      ctx.roundRect(
        field.left + field.width - field.paddleWidth,
        cpu - half,
        field.paddleWidth,
        field.paddleHeight,
        field.paddleWidth / 2,
      )
      ctx.fill()

      ctx.fillStyle = '#eeeef5'
      ctx.beginPath()
      ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2)
      ctx.fill()
    },
    key: (name, down) => {
      if (pongNet.role === 'guest') {
        if (name === 'ArrowUp' || name === 'w' || name === 'W') {
          pongSetInput(down ? -1 : 0)
          return true
        }
        if (name === 'ArrowDown' || name === 's' || name === 'S') {
          pongSetInput(down ? 1 : 0)
          return true
        }
        return false
      }
      if (name === 'ArrowUp' || name === 'w' || name === 'W') {
        heldUp = down
        return true
      }
      if (name === 'ArrowDown' || name === 's' || name === 'S') {
        heldDown = down
        return true
      }
      return false
    },
    aim: null,
    snapshot: () => ({
      score: you,
      stat: pongNet.role === 'solo' ? ['RALLY', String(rally)] : ['THEM', String(them)],
      title: you >= PONG_TARGET ? 'YOU WIN' : pongNet.role === 'solo' ? 'CPU WINS' : 'THEY WIN',
    }),
  }
}

const TETRIS_COLUMNS = 10
const TETRIS_ROWS = 20
const TETRIS_LOCK = 0.45
const TETRIS_SOFT = 0.032
const TETRIS_CLEAR = [0, 100, 300, 500, 800]
const TETRIS_COLORS = ['#22d3ee', '#ffb454', '#7c5cff', '#4ade80', '#ff6b9d', '#60a5fa', '#fb923c']
const TETRIS_SHAPES: number[][][] = [
  [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  [
    [1, 1],
    [1, 1],
  ],
  [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
]

const spinGrid = (grid: number[][]) =>
  grid[0].map((_, index) => grid.map((row) => row[index]).reverse())

const TETRIS_STATES = TETRIS_SHAPES.map((shape) => {
  const states = [shape]
  for (let index = 1; index < 4; index += 1) states.push(spinGrid(states[index - 1]))
  return states
})

const tetrisField = (size: Size) => {
  const panel = clamp(size.width * 0.22, 56, 104)
  const cell = Math.max(
    3,
    Math.floor(
      Math.min((size.width - panel - 12) / TETRIS_COLUMNS, (size.height - 8) / TETRIS_ROWS),
    ),
  )
  const width = TETRIS_COLUMNS * cell
  const height = TETRIS_ROWS * cell
  const left = Math.round((size.width - width - panel - 12) / 2)
  return { cell, width, height, left, top: Math.round((size.height - height) / 2), panel }
}

const empty = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)'
  ctx.fillRect(x, y, size, size)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.09)'
  ctx.fillRect(x, y, size, 1)
  ctx.fillRect(x, y + size - 1, size, 1)
  ctx.fillRect(x, y, 1, size)
  ctx.fillRect(x + size - 1, y, 1, size)
}

const preview = (
  ctx: CanvasRenderingContext2D,
  target: number,
  x: number,
  y: number,
  size: number,
) => {
  const state = TETRIS_STATES[target][0]
  const columns = state[0].length
  const rows = state.length
  const unit = Math.max(2, Math.floor((size - 6) / Math.max(columns, rows)))
  const ox = x + Math.round((size - columns * unit) / 2)
  const oy = y + Math.round((size - rows * unit) / 2)
  state.forEach((row, rowIndex) => {
    row.forEach((value, columnIndex) => {
      if (value !== 1) return
      block(
        ctx,
        ox + columnIndex * unit,
        oy + rowIndex * unit,
        unit,
        TETRIS_COLORS[target] ?? '#7c5cff',
        Math.max(1, unit * 0.18),
      )
    })
  })
}

const createTetris = (): Instance => {
  let grid: number[][] = []
  let bag: number[] = []
  let queue: number[] = []
  let piece = 0
  let rotation = 0
  let x = 0
  let y = 0
  let hold: number | null = null
  let spent = false
  let score = 0
  let lines = 0
  let level = 1
  let gravity = 0
  let lockTimer = 0
  let softDrop = false
  let phase: Phase = 'ready'

  const drawPiece = (target: number, turn: number, offsetX: number, offsetY: number) =>
    TETRIS_STATES[target][turn].flatMap((row, rowIndex) =>
      row.map((value, columnIndex) => ({ value, x: offsetX + columnIndex, y: offsetY + rowIndex })),
    )

  const hits = (target: number, turn: number, offsetX: number, offsetY: number) =>
    drawPiece(target, turn, offsetX, offsetY).some(
      (cell) =>
        cell.value === 1 &&
        (cell.x < 0 ||
          cell.x >= TETRIS_COLUMNS ||
          cell.y >= TETRIS_ROWS ||
          (cell.y >= 0 && grid[cell.y][cell.x] !== 0)),
    )

  const deal = () => {
    if (queue.length < 4) {
      const fresh = TETRIS_SHAPES.map((_, index) => index)
      for (let index = fresh.length - 1; index > 0; index -= 1) {
        const swap = Math.floor(Math.random() * (index + 1))
        const held = fresh[index]
        fresh[index] = fresh[swap]
        fresh[swap] = held
      }
      bag = fresh
    }
    const next = bag.length > 0 ? bag.shift() : undefined
    if (next !== undefined) queue.push(next)
    const dealt = queue.shift()
    return dealt ?? 0
  }

  const place = (target: number) => {
    piece = target
    rotation = 0
    const state = TETRIS_STATES[target][0]
    x = Math.floor((TETRIS_COLUMNS - state[0].length) / 2)
    y = state[0].every((value) => value === 0) ? -1 : 0
    lockTimer = 0
    gravity = 0
    if (hits(piece, rotation, x, y)) phase = 'over'
  }

  const reset = () => {
    grid = Array.from({ length: TETRIS_ROWS }, () =>
      Array.from({ length: TETRIS_COLUMNS }, (): number => 0),
    )
    bag = []
    queue = []
    hold = null
    spent = false
    score = 0
    lines = 0
    level = 1
    softDrop = false
    phase = 'ready'
    place(deal())
  }

  const lock = () => {
    for (const cell of drawPiece(piece, rotation, x, y)) {
      if (cell.value !== 1) continue
      if (cell.y < 0 || cell.y >= TETRIS_ROWS) {
        phase = 'over'
        return
      }
      grid[cell.y][cell.x] = piece + 1
    }
    const kept = grid.filter((row) => !row.every((value) => value !== 0))
    const cleared = TETRIS_ROWS - kept.length
    if (cleared > 0) {
      score += (TETRIS_CLEAR[cleared] ?? 0) * level
      lines += cleared
      level = Math.min(15, Math.floor(lines / 10) + 1)
    }
    while (kept.length < TETRIS_ROWS)
      kept.unshift(Array.from({ length: TETRIS_COLUMNS }, (): number => 0))
    grid = kept
    spent = false
    place(deal())
  }

  const shift = (delta: number) => {
    if (hits(piece, rotation, x + delta, y)) return
    x += delta
    lockTimer = 0
  }

  const spin = (direction: number) => {
    const turn = (rotation + direction + 4) % 4
    const kicks: [number, number][] = [
      [0, 0],
      [-1, 0],
      [1, 0],
      [0, -1],
    ]
    for (const [dx, dy] of kicks) {
      if (!hits(piece, turn, x + dx, y + dy)) {
        rotation = turn
        x += dx
        y += dy
        lockTimer = 0
        return
      }
    }
  }

  reset()

  return {
    phase: () => phase,
    reset,
    launch: () => {
      reset()
      phase = 'running'
    },
    pause: () => {
      if (phase === 'running') phase = 'paused'
    },
    resume: () => {
      if (phase === 'paused') phase = 'running'
    },
    update: (dt) => {
      if (phase !== 'running') return false
      const rate = softDrop ? TETRIS_SOFT : Math.max(0.06, 0.85 * Math.pow(0.8, level - 1))
      gravity += dt
      let moved = false
      while (gravity >= rate) {
        gravity -= rate
        moved = true
        if (hits(piece, rotation, x, y + 1)) {
          lockTimer += rate
          if (lockTimer >= TETRIS_LOCK) {
            lock()
            break
          }
        } else {
          y += 1
          lockTimer = 0
          if (softDrop) score += 1
        }
        if (phase !== 'running') break
      }
      return moved
    },
    draw: (ctx, size) => {
      const field = tetrisField(size)
      const unit = field.cell
      const gap = Math.max(1, Math.round(unit * 0.08))
      const inner = unit - gap * 2

      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
      ctx.fillRect(field.left, field.top, field.width, field.height)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.07)'
      for (let column = 0; column <= TETRIS_COLUMNS; column += 1) {
        ctx.fillRect(field.left + column * unit, field.top, 1, field.height)
      }
      for (let row = 0; row <= TETRIS_ROWS; row += 1) {
        ctx.fillRect(field.left, field.top + row * unit, field.width, 1)
      }

      for (let row = 0; row < TETRIS_ROWS; row += 1) {
        for (let column = 0; column < TETRIS_COLUMNS; column += 1) {
          const value = grid[row][column]
          if (value === 0) continue
          block(
            ctx,
            field.left + column * unit + gap,
            field.top + row * unit + gap,
            inner,
            TETRIS_COLORS[value - 1] ?? '#7c5cff',
            Math.max(1, unit * 0.16),
          )
        }
      }

      if (phase !== 'over') {
        let ghost = y
        while (!hits(piece, rotation, x, ghost + 1)) ghost += 1
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
        for (const cell of drawPiece(piece, rotation, x, ghost)) {
          if (cell.value !== 1 || cell.y < 0) continue
          ctx.fillRect(
            field.left + cell.x * unit + gap,
            field.top + cell.y * unit + gap,
            inner,
            inner,
          )
        }
      }

      for (const cell of drawPiece(piece, rotation, x, y)) {
        if (cell.value !== 1 || cell.y < 0) continue
        block(
          ctx,
          field.left + cell.x * unit + gap,
          field.top + cell.y * unit + gap,
          inner,
          TETRIS_COLORS[piece] ?? '#7c5cff',
          Math.max(1, unit * 0.16),
        )
      }

      const panelX = field.left + field.width + 12
      const boxSize = Math.round(clamp(unit * 2.2, 20, 46))

      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)'
      ctx.font = '9px ui-monospace, SFMono-Regular, monospace'
      ctx.fillText('HOLD', panelX, field.top + 8)
      ctx.fillText('NEXT', panelX, field.top + 26 + boxSize)

      empty(ctx, panelX, field.top + 14, boxSize)
      if (hold !== null) preview(ctx, hold, panelX, field.top + 14, boxSize)

      empty(ctx, panelX, field.top + 32 + boxSize, boxSize)
      queue.slice(0, 3).forEach((target, index) => {
        preview(ctx, target, panelX, field.top + 32 + boxSize + index * (boxSize + 6), boxSize)
      })
    },
    key: (name, down) => {
      if (name === 'ArrowDown' || name === 's' || name === 'S') {
        softDrop = down
        return true
      }
      if (!down) return false
      if (phase !== 'running') return false
      if (name === 'ArrowLeft' || name === 'a' || name === 'A') {
        shift(-1)
        return true
      }
      if (name === 'ArrowRight' || name === 'd' || name === 'D') {
        shift(1)
        return true
      }
      if (name === 'ArrowUp' || name === 'x' || name === 'X') {
        spin(1)
        return true
      }
      if (name === 'z' || name === 'Z') {
        spin(-1)
        return true
      }
      if (name === ' ') {
        let dropped = 0
        while (!hits(piece, rotation, x, y + 1)) {
          y += 1
          dropped += 1
        }
        score += dropped * 2
        lock()
        return true
      }
      if (name === 'c' || name === 'C' || name === 'Shift') {
        if (spent) return true
        spent = true
        if (hold === null) {
          hold = piece
          place(deal())
          return true
        }
        const swap = hold
        hold = piece
        place(swap)
        return true
      }
      return false
    },
    aim: null,
    snapshot: () => ({
      score,
      stat: ['LEVEL', String(level)],
      title: 'GAME OVER',
    }),
  }
}

const CABINETS: Cabinet[] = [
  {
    id: 'snake',
    name: 'SNAKE',
    hint: 'ARROWS OR WASD TO TURN',
    space: 'launch',
    create: createSnake,
  },
  {
    id: 'breakout',
    name: 'BREAKOUT',
    hint: 'ARROWS OR MOUSE TO MOVE',
    space: 'launch',
    create: createBreakout,
  },
  {
    id: 'pong',
    name: 'PONG',
    hint: 'UP DOWN OR W S TO MOVE',
    space: 'launch',
    create: createPong,
  },
  {
    id: 'tetris',
    name: 'TETRIS',
    hint: 'LEFT RIGHT MOVE / UP TURN / SPACE DROP',
    space: 'drop',
    create: createTetris,
  },
]

export function ArcadeApp() {
  const focused = useWindowStore((state) => state.focused)
  const stage = useRef<HTMLDivElement>(null)
  const screen = useRef<HTMLCanvasElement>(null)
  const cabinet = useRef<Cabinet>(CABINETS[0])
  const running = useRef<Instance | null>(null)
  const metrics = useRef<Size & { dpr: number }>({ width: 0, height: 0, dpr: 1 })
  const awake = useRef<typeof focused>(focused)
  const dirty = useRef(true)
  const beat = useRef<Phase>('ready')
  const record = useRef(0)
  const published = useRef<View | null>(null)
  const [slot, setSlot] = useState(0)
  const [net, setNet] = useState<PongView>(pongView)
  const [code, setCode] = useState('')

  useEffect(() => {
    const sync = () => setNet(pongView())
    pongNet.listeners.add(sync)
    return () => {
      pongNet.listeners.delete(sync)
      pongLeave()
    }
  }, [])
  const [view, setView] = useState<View>({
    score: 0,
    best: 0,
    stat: ['SCORE', '0'],
    phase: 'ready',
    title: 'GAME OVER',
  })

  const publish = useCallback(() => {
    const game = running.current
    if (!game) return
    const snap = game.snapshot()
    const phase = game.phase()
    if (phase === 'over' && published.current?.phase !== 'over') {
      const best = Math.max(record.current, snap.score)
      if (best > record.current) {
        record.current = best
        saveBest(cabinet.current.id, best)
      }
    }
    const before = published.current
    if (
      before &&
      before.phase === phase &&
      before.score === snap.score &&
      before.best === record.current &&
      before.title === snap.title &&
      before.stat[0] === snap.stat[0] &&
      before.stat[1] === snap.stat[1]
    ) {
      return
    }
    const next: View = { ...snap, phase, best: record.current }
    published.current = next
    setView(next)
  }, [])

  const activate = useCallback(() => {
    const game = running.current
    if (!game) return
    if (game.phase() === 'running') game.pause()
    else if (game.phase() === 'paused') game.resume()
    else game.launch()
    dirty.current = true
  }, [])

  const restart = useCallback(() => {
    const game = running.current
    if (!game) return
    game.reset()
    dirty.current = true
  }, [])

  const dispatch = useCallback(
    (name: string, down: boolean) => {
      const game = running.current
      if (!game) return false
      if (!down) return game.key(name, false)
      if (name === ' ' || name === 'Enter') {
        if (cabinet.current.space === 'drop' && game.phase() === 'running') {
          return game.key(name, true)
        }
        activate()
        return true
      }
      if (name === 'p' || name === 'P') {
        activate()
        return true
      }
      if (name === 'Escape') {
        game.pause()
        dirty.current = true
        return true
      }
      if (name === 'r' || name === 'R') {
        restart()
        return true
      }
      return game.key(name, true)
    },
    [activate, restart],
  )

  useEffect(() => {
    const entry = CABINETS[slot]
    if (entry.id !== 'pong') pongLeave()
    const game = entry.create()
    cabinet.current = entry
    running.current = game
    record.current = readBests()[entry.id] ?? 0
    published.current = null
    const snap = game.snapshot()
    const next: View = { ...snap, phase: game.phase(), best: record.current }
    published.current = next
    setView(next)
    dirty.current = true
  }, [slot])

  useEffect(() => {
    awake.current = focused
    dirty.current = true
  }, [focused])

  useEffect(() => {
    const node = stage.current
    const canvas = screen.current
    if (!node || !canvas) return

    const sync = () => {
      const rect = node.getBoundingClientRect()
      const dpr = clamp(window.devicePixelRatio || 1, 1, 3)
      const width = Math.max(1, Math.round(rect.width))
      const height = Math.max(1, Math.round(rect.height))
      metrics.current = { width, height, dpr }
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      dirty.current = true
    }

    const observer = new ResizeObserver(sync)
    observer.observe(node)
    window.addEventListener('resize', sync)
    sync()

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', sync)
    }
  }, [])

  useEffect(() => {
    let frame = 0
    let last = performance.now()

    const tick = (now: number) => {
      const delta = Math.min(Math.max((now - last) / 1000, 0), 0.05)
      last = now
      const game = running.current
      const canvas = screen.current
      const { width, height, dpr } = metrics.current

      if (game && canvas && width > 0 && height > 0) {
        const role = cabinet.current.id === 'pong' ? pongNet.role : 'solo'
        const online = role !== 'solo'
        if (
          (awake.current === 'game' || online) &&
          (game.phase() === 'running' || role === 'guest')
        ) {
          if (game.update(delta, { width, height })) dirty.current = true
        }
        if (game.phase() !== beat.current) {
          beat.current = game.phase()
          dirty.current = true
        }
        if (dirty.current) {
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
            ctx.clearRect(0, 0, width, height)
            game.draw(ctx, { width, height })
            dirty.current = false
            publish()
          }
        }
      }

      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [publish])

  useEffect(() => {
    if (focused !== 'game') return

    const onDown = (event: KeyboardEvent) => {
      if (dispatch(event.key, true)) event.preventDefault()
    }
    const onUp = (event: KeyboardEvent) => {
      dispatch(event.key, false)
    }

    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)

    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
  }, [focused, dispatch])

  const aim = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const game = running.current
    if (!game?.aim) return
    game.aim(event.clientX - event.currentTarget.getBoundingClientRect().left)
  }

  const entry = CABINETS[slot]
  const online = entry.id === 'pong' && net.role !== 'solo'
  const dimmed = focused !== 'game' && !online
  const idle = view.phase !== 'running'
  const waiting = entry.id === 'pong' && net.role === 'guest' && view.phase !== 'running'
  const overlay = dimmed
    ? { title: 'PAUSED', hint: 'CLICK THE WINDOW TO RESUME', action: '' }
    : waiting
      ? { title: 'ONLINE', hint: net.status, action: '' }
      : view.phase === 'ready'
        ? { title: entry.name, hint: entry.hint, action: 'INSERT COIN' }
        : view.phase === 'paused'
          ? { title: 'PAUSED', hint: 'PRESS P OR SPACE TO RESUME', action: 'RESUME' }
          : { title: view.title, hint: `SCORE ${view.score}`, action: 'PLAY AGAIN' }

  const playLabel =
    view.phase === 'running' ? 'Pause game' : view.phase === 'paused' ? 'Resume game' : 'Start game'

  return (
    <div className="flex h-full flex-col overflow-hidden select-none">
      <div className="flex shrink-0 items-center gap-2 px-3 pt-2.5 pb-2">
        <div className="flex min-w-0 flex-1 items-center justify-between gap-2 rounded-md border border-amber-bloom/25 bg-amber-bloom/10 px-2.5 py-1.5 shadow-[0_0_20px_-8px_rgba(255,180,84,0.8)]">
          <span className="font-pixel text-[9px] tracking-[0.16em] text-amber-bloom">
            TJOS ARCADE
          </span>
          <span
            className={`font-pixel text-[7px] tracking-[0.1em] text-ink-300 ${idle ? 'animate-pulse' : ''}`}
          >
            {idle ? 'PRESS START' : 'PLAYING'}
          </span>
        </div>
      </div>

      <div role="group" aria-label="Choose a game" className="flex shrink-0 gap-1.5 px-3 pb-2">
        {CABINETS.map((item, index) => {
          const active = index === slot
          return (
            <button
              key={item.id}
              type="button"
              aria-label={`Load ${item.name.toLowerCase()}`}
              aria-pressed={active}
              onClick={() => setSlot(index)}
              className={`min-w-0 flex-1 truncate rounded-md border px-1 py-1.5 text-[10px] font-medium tracking-wide uppercase transition-colors focus-ring ${
                active
                  ? 'border-violet-bloom/60 bg-violet-bloom/15 text-ink-100'
                  : 'border-white/10 bg-white/4 text-ink-300 hover:bg-white/8 hover:text-ink-100'
              }`}
            >
              {item.name}
            </button>
          )
        })}
      </div>

      {entry.id === 'pong' ? (
        <div className="flex shrink-0 items-center gap-2 px-3 pb-2">
          {net.role === 'solo' ? (
            <>
              <button
                type="button"
                onClick={pongCreate}
                className="shrink-0 rounded-md border border-cyan-bloom/50 bg-cyan-bloom/15 px-2 py-1.5 font-pixel text-[8px] tracking-[0.08em] text-ink-100 transition-colors hover:bg-cyan-bloom/25 focus-ring"
              >
                CREATE GAME
              </button>
              <form
                onSubmit={(event) => {
                  event.preventDefault()
                  if (!pongJoin(code)) setNet(pongView())
                }}
                className="flex min-w-0 flex-1 items-center gap-2"
              >
                <label htmlFor="pong-code" className="sr-only">
                  Join code
                </label>
                <input
                  id="pong-code"
                  value={code}
                  maxLength={6}
                  onChange={(event) => setCode(event.target.value.toUpperCase())}
                  placeholder="CODE"
                  className="min-w-0 flex-1 rounded-md border border-white/10 bg-white/4 px-2 py-1.5 font-pixel text-[8px] tracking-[0.12em] text-ink-100 placeholder:text-ink-500 focus-ring"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-md border border-white/12 bg-white/6 px-2 py-1.5 font-pixel text-[8px] tracking-[0.08em] text-ink-300 transition-colors hover:bg-white/10 hover:text-ink-100 focus-ring"
                >
                  JOIN
                </button>
              </form>
            </>
          ) : (
            <>
              <span
                aria-live="polite"
                aria-label={
                  net.role === 'host' ? `Join code ${net.code}` : `Playing against ${net.code}`
                }
                className="shrink-0 rounded-md border border-white/10 bg-white/4 px-2 py-1.5 font-pixel text-[8px] tracking-[0.1em] text-ink-100"
              >
                {net.role === 'host' ? net.code : `VS ${net.code}`}
              </span>
              <span className="min-w-0 flex-1 truncate font-pixel text-[7px] tracking-[0.06em] text-ink-300">
                {net.status}
              </span>
              <button
                type="button"
                onClick={pongLeave}
                className="shrink-0 rounded-md border border-white/12 bg-white/6 px-2 py-1.5 font-pixel text-[8px] tracking-[0.08em] text-ink-300 transition-colors hover:bg-white/10 hover:text-ink-100 focus-ring"
              >
                LEAVE
              </button>
            </>
          )}
        </div>
      ) : null}

      <div className="min-h-0 flex-1 px-3">
        <div
          ref={stage}
          className="relative h-full w-full overflow-hidden rounded-panel bg-ink-950 ring-1 ring-white/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03),inset_0_0_80px_rgba(0,0,0,0.9),0_0_40px_-14px_rgba(124,92,255,0.5)]"
        >
          <canvas
            ref={screen}
            role="img"
            aria-label={`${entry.name} play area`}
            onPointerMove={aim}
            onPointerDown={aim}
            className="absolute inset-0 h-full w-full touch-none"
          />

          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(to_bottom,rgba(0,0,0,0.18)_0px,rgba(0,0,0,0.18)_1px,transparent_1px,transparent_3px)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,rgba(124,92,255,0.12),transparent_65%)]"
          />

          {dimmed || idle ? (
            <div
              role="status"
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-ink-950/70 px-4 text-center"
            >
              <p className="font-pixel text-[11px] tracking-[0.1em] text-ink-100">
                {overlay.title}
              </p>
              <p className="font-pixel text-[7px] leading-4 tracking-[0.08em] text-ink-300">
                {overlay.hint}
              </p>
              {overlay.action ? (
                <button
                  type="button"
                  onClick={activate}
                  className="mt-1 rounded-md border border-violet-bloom/50 bg-violet-bloom/15 px-3 py-2 font-pixel text-[8px] tracking-[0.08em] text-ink-100 transition-colors hover:bg-violet-bloom/25 focus-ring"
                >
                  {overlay.action}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-2 px-3 pt-2 pb-2.5">
        <div className="flex gap-2">
          <div
            aria-live="polite"
            className="min-w-0 flex-1 rounded-md border border-white/8 bg-white/4 px-2 py-1.5"
          >
            <p className="font-pixel text-[7px] tracking-[0.08em] text-ink-500">SCORE</p>
            <p className="mt-1 font-pixel text-[11px] tabular-nums text-ink-100">{view.score}</p>
          </div>
          <div className="min-w-0 flex-1 rounded-md border border-white/8 bg-white/4 px-2 py-1.5">
            <p className="font-pixel text-[7px] tracking-[0.08em] text-ink-500">BEST</p>
            <p className="mt-1 font-pixel text-[11px] tabular-nums text-amber-bloom">{view.best}</p>
          </div>
          <div className="min-w-0 flex-1 rounded-md border border-white/8 bg-white/4 px-2 py-1.5">
            <p className="font-pixel text-[7px] tracking-[0.08em] text-ink-500">{view.stat[0]}</p>
            <p className="mt-1 font-pixel text-[11px] tabular-nums text-cyan-bloom">
              {view.stat[1]}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div aria-hidden className="flex min-w-0 items-center gap-2.5 overflow-hidden">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/12 bg-ink-900 shadow-[inset_0_2px_6px_rgba(0,0,0,0.85)]">
              <span className="h-3.5 w-3.5 rounded-full bg-ink-700 shadow-[0_1px_0_0_rgba(255,255,255,0.14)]" />
            </span>
            <span className="flex shrink-0 items-center gap-1.5">
              <span className="h-4 w-4 rounded-full bg-coral-bloom/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]" />
              <span className="h-4 w-4 rounded-full bg-amber-bloom/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]" />
              <span className="h-4 w-4 rounded-full bg-cyan-bloom/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]" />
            </span>
          </div>

          <span className="flex-1" />

          <button
            type="button"
            aria-label={playLabel}
            onClick={activate}
            className="rounded-md p-1.5 text-ink-300 transition-colors hover:bg-white/10 hover:text-ink-100 focus-ring"
          >
            {view.phase === 'running' ? (
              <Pause size={14} strokeWidth={2.25} />
            ) : (
              <Play size={14} strokeWidth={2.25} />
            )}
          </button>
          <button
            type="button"
            aria-label="Restart game"
            onClick={restart}
            className="rounded-md p-1.5 text-ink-300 transition-colors hover:bg-white/10 hover:text-ink-100 focus-ring"
          >
            <RotateCcw size={14} strokeWidth={2.25} />
          </button>
        </div>
      </div>
    </div>
  )
}
