import { useCallback } from 'react'
import type { AnyMachine, Runtime, Snapshot } from 'small-state'
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/with-selector'

const DEFAULT_COMPARE = <T>(a: T, b: T) => a === b

export function useSelectedSnapshot<M extends AnyMachine, Sel>(
  runtime: Runtime<M> | undefined,
  selector: (snapshot: Snapshot<M>) => Sel,
  compare: (current: Sel, next: Sel) => boolean = DEFAULT_COMPARE
) {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!runtime) return () => { }
      const unsubscribe = runtime.subscribe(onStoreChange, onStoreChange)
      return unsubscribe
    },
    [runtime],
  )
  const getSnapshot = useCallback(() => runtime?.getSnapshot() as Snapshot<M>, [runtime])
  const selectedSnapshot = useSyncExternalStoreWithSelector(subscribe, getSnapshot, getSnapshot, selector, compare)

  return selectedSnapshot
}
