import { useCallback, useEffect, useMemo } from 'react'
import type { AnyMachine, Runtime, RuntimeOptions, Snapshot } from 'small-state'
import { isMachine, isRuntime, makeRuntime } from 'small-state'
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/with-selector'

const DEFAULT_COMPARE = <T>(a: T, b: T) => a === b

export function useSelectedSnapshot<M extends AnyMachine, R extends Runtime<M>, Sel>(
  runtimeOrMachine: R | undefined,
  selector: (snapshot: Snapshot<M>) => Sel,
  compare?: (prev: Sel, next: Sel) => boolean,
): Sel
export function useSelectedSnapshot<M extends AnyMachine, R extends Runtime<M>, Sel>(
  runtimeOrMachine: M,
  options: RuntimeOptions<M>,
  selector: (snapshot: Snapshot<M>) => Sel,
  compare?: (prev: Sel, next: Sel) => boolean,
): Sel
export function useSelectedSnapshot<M extends AnyMachine, R extends Runtime<M>, Sel>(
  runtimeOrMachine: M,
  selector: (snapshot: Snapshot<M>) => Sel,
  compare?: (prev: Sel, next: Sel) => boolean,
): Sel

export function useSelectedSnapshot<M extends AnyMachine, R extends Runtime<M>, Sel>(
  runtimeOrMachine: M | R | undefined,
  ...args:
    | [selector: (snapshot: Snapshot<M>) => Sel, compare?: (prev: Sel, next: Sel) => boolean]
    | [options: RuntimeOptions<M>, selector: (snapshot: Snapshot<M>) => Sel, compare?: (prev: Sel, next: Sel) => boolean]
) {
  const runtime = useMemo(() => {
    if (!runtimeOrMachine) return undefined
    if (isRuntime(runtimeOrMachine)) return runtimeOrMachine
    if (isMachine(runtimeOrMachine)) {
      const options = typeof args[0] === 'object' ? (args.shift() as RuntimeOptions<M>) : {}
      return makeRuntime(runtimeOrMachine, options)
    }
    throw new Error(`useRuntimeSelector(): unexpected argument: ${JSON.stringify(runtimeOrMachine)}`)
  }, [runtimeOrMachine, args])

  const [selector, compare] = (() => {
    const [x, y = DEFAULT_COMPARE] = args
    if (typeof x !== 'function') throw new Error(`useRuntimeSelector(): unexpected argument: selector must be function`)
    return [x, y] as [(snapshot: Snapshot<M>) => Sel, (a: Sel, b: Sel) => boolean]
  })()

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

  useEffect(() => {
    if (isMachine(runtimeOrMachine)) {
      runtime!.start()
      return () => {
        runtime!.stop()
      }
    }
  }, [runtime, runtimeOrMachine])
  return selectedSnapshot
}
