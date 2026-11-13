import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react'
import type { AnyMachine, Runtime, RuntimeOptions } from 'small-state'
import { isMachine, makeRuntime } from 'small-state'

export function useRuntime<M extends AnyMachine>(
  machine: M,
  options?: RuntimeOptions<M> & { onPreStart?: (runtime: Runtime<M>) => void },
) {
  if (!isMachine(machine)) {
    throw new Error(`useRuntime() expects Machine object.`)
  }
  // biome-ignore lint/correctness/useExhaustiveDependencies: options はインライン指定されると useMemo が無効になるので初回呼び出しのものだけを使う
  const qOptions = useMemo(() => options, [])
  const runtime = useMemo(() => makeRuntime(machine, qOptions), [machine, qOptions])

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
    qOptions?.onPreStart?.(runtime)
    runtime.start()
    return () => {
      runtime.stop()
    }
  }, [runtime, qOptions])

  return { snapshot, send: runtime.send.bind(runtime), runtime }
}
