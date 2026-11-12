import type { Getter } from 'jotai/vanilla'
import { atom } from 'jotai/vanilla'
import type { AnyMachine, Runtime, RuntimeOptions, SendFnEvent, Snapshot } from 'small-state'
import { makeRuntime } from 'small-state'

export const FINALIZE_EVENT = Symbol()

export function atomWithRuntimeSnapshot<M extends AnyMachine>(
  machine: M | ((get: Getter) => M),
  options?: RuntimeOptions<M>,
) {
  const rtCacheAtom = atom<Runtime<M> | null>(null)
  const snapshotAtom = atom<Snapshot<M> | null>(null)

  const setupAtom = atom(
    (get) => {
      const cache = get(rtCacheAtom)
      if (cache) return cache
      let initializing = true
      const safeGet: typeof get = (...args) => {
        if (initializing) return get(...args)
        throw new Error('get not allowed after initialization')
      }
      try {
        return makeRuntime(typeof machine === 'function' ? machine(safeGet) : machine, options)
      } finally {
        initializing = false
      }
    },
    // onMount からのみ呼ばれる初期化/ファイナライズ処理
    (get, set, event?) => {
      if (event === FINALIZE_EVENT) {
        const rt = get(setupAtom)
        set(rtCacheAtom, null)
        set(snapshotAtom, null)
        rt.stop()
      } else {
        const rt = get(setupAtom)
        set(rtCacheAtom, rt)
        const sync = () => set(snapshotAtom, rt.getSnapshot())
        const unsubscribe: () => void = rt.subscribe(sync, sync)
        rt.start()
        sync()
        return unsubscribe
      }
    },
  )
  setupAtom.onMount = (write) => {
    const unsubscribe = write() // 自身の write を呼び rtCacheAtom と snapshotAtom を初期化する
    return () => {
      unsubscribe?.()
      write(FINALIZE_EVENT)
    }
  }

  const retAtom = atom(
    (get) => {
      const rt = get(setupAtom) // onMount->write->read が呼ばれ全atomがsetupされる
      return get(snapshotAtom) ?? rt.getSnapshot()
    },
    (get, _, event: SendFnEvent<M>) => {
      get(setupAtom).send(event)
    },
  )
  return retAtom
}
