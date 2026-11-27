import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from 'react'
import type { AnyMachine, Runtime, RuntimeOptions, SendFnEvent, Snapshot } from 'small-state'
import { isMachine, makeRuntime } from 'small-state'

export type UseBoundSend<M extends AnyMachine> = (event: SendFnEvent<M>) => () => undefined

function readyToUseBoundSend<M extends AnyMachine>(rtRef: React.RefObject<Runtime<M> | null>): UseBoundSend<M> {
  return (event: SendFnEvent<M>) => useRef(() => void rtRef.current!.send(event)).current
}

/**
 * @typedef {Object} RuntimeHandle
 * @property {Object} snapshot
 * @property {function(string|{type: string, [key: string]: *}): undefined} send
 * @property {Object} runtime
 * @property {function(string|{type: string, [key: string]: *}): function(): undefined} useBoundSend
 */
export type RuntimeHandle<M extends AnyMachine> = {
  snapshot: Snapshot<M>
  send: (event: SendFnEvent<M>) => undefined
  runtime: Runtime<M>
  useBoundSend: UseBoundSend<M>
}

/**
 * @param machine
 * @param {Object} [options]
 * @param {string} [options.id]
 * @param {function(): *} [options.input]
 * @param {function} [options.onPreStart]
 * @returns {RuntimeHandle}
 */
export function useRuntimeHandle<M extends AnyMachine>(
  machine: M,
  options?: RuntimeOptions<M> & { onPreStart?: (runtime: Runtime<M>) => void },
): RuntimeHandle<M> {
  if (!isMachine(machine)) {
    throw new Error(`useRuntimeHandle() expects Machine object.`)
  }
  const rtRef = useRef<null | Runtime<M>>(null)
  if (!rtRef.current) {
    rtRef.current = makeRuntime(machine, options)
  }

  const retRef = useRef({} as RuntimeHandle<M>)

  // biome-ignore lint/correctness/useExhaustiveDependencies: Uses only the arguments passed on the initial call.
  useEffect(() => {
    // <StrictMode> で二度呼ばれたとき用の対策
    if (rtRef.current!.runtimeStatus === 'stopped') {
      rtRef.current = makeRuntime(machine, options)
      retRef.current = {} as RuntimeHandle<M>
    }
    const crrRt = rtRef.current!
    options?.onPreStart?.(crrRt)
    crrRt.start()
    return () => {
      crrRt.stop()
    }
  }, [])

  const runtime = rtRef.current

  let snapshot: Snapshot<M>
  {
    const subscribe = useCallback(
      (onStoreChange: () => void) => {
        const unsubscribe = runtime.subscribe(onStoreChange, onStoreChange)
        return unsubscribe
      },
      [runtime],
    )
    const getSnapshot = useCallback(() => runtime.getSnapshot(), [runtime])
    snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  }

  const ret = retRef.current
  ret.snapshot = snapshot
  ret.send = useCallback((event: SendFnEvent<M>) => void runtime.send.apply(runtime, [event]), [runtime])
  ret.runtime = runtime
  ret.useBoundSend = useMemo(() => readyToUseBoundSend(rtRef), [])

  return ret
}
