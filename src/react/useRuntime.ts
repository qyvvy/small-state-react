import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react'
import type { AnyMachine, RuntimeOptions } from 'small-state'
import { isMachine, makeRuntime } from 'small-state'

export function useRuntime<M extends AnyMachine>(machine: M, options?: RuntimeOptions<M>) {
  if (!isMachine(machine)) {
    throw new Error(`useRuntime() expects Machine object.`)
  }
  // biome-ignore lint/correctness/useExhaustiveDependencies: options はインライン指定されると useMemo が無効になるので runtime 生成時にのみ参照する
  const runtime = useMemo(() => makeRuntime(machine, options), [machine])

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const unsubscribe = runtime.subscribe(onStoreChange, onStoreChange)
      return unsubscribe
    },
    [runtime],
  )

  const getSnapshot = useCallback(() => runtime?.getSnapshot(), [runtime])
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  useEffect(() => {
    runtime.start()
    return () => {
      runtime.stop()
    }
  }, [runtime])

  return { snapshot, send: runtime.send.bind(runtime), runtime }
}
