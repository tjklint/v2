import { useEffect, useState } from 'react'

import { fetchContributions, type Contributions } from '../../apps/contributions'

export function useContributions(): { data: Contributions | null; failed: boolean } {
  const [state, setState] = useState<{ data: Contributions | null; failed: boolean }>({
    data: null,
    failed: false,
  })

  useEffect(() => {
    const controller = new AbortController()

    fetchContributions(controller.signal)
      .then((data) => setState({ data, failed: data === null }))
      .catch(() => {
        if (!controller.signal.aborted) setState({ data: null, failed: true })
      })

    return () => controller.abort()
  }, [])

  return state
}
