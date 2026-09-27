import { useEffect, useState } from 'react'

import { fetchContributions, type Contributions } from '../../apps/contributions'

type ContributionsState = { data: Contributions | null; failed: boolean }

const PENDING: ContributionsState = { data: null, failed: false }

let pending: Promise<ContributionsState> | null = null

const load = (): Promise<ContributionsState> => {
  pending ??= fetchContributions().then(
    (data) => ({ data, failed: data === null }),
    () => ({ data: null, failed: true }),
  )

  return pending
}

export function useContributions(): ContributionsState {
  const [state, setState] = useState<ContributionsState>(PENDING)

  useEffect(() => {
    let live = true

    load().then((next) => {
      if (live) setState(next)
    })

    return () => {
      live = false
    }
  }, [])

  return state
}
