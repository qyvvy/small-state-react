import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, jest, mock, test } from 'bun:test'
import { act, renderHook } from '@testing-library/react'
import { useAtom } from 'jotai'
import { makeMachine } from 'small-state'
import { atomWithRuntimeSnapshot } from '../atomWithRuntimeSnapshot'

describe('jotai', () => {
  describe('atomWithRuntimeSnapshot', () => {
    {
      const machine = makeMachine(
        {
          initContext: () => ({ name: '' }),
        },
        ({ on }) => ({
          a: [on('1', { to: 'b', actions: [({ update }) => update({ name: 'John' })] })],
          b: [on('2', { to: 'c' })],
          c: null,
        }),
      )

      test('0:マウントされると onPreStart が呼ばれる', async () => {
        const mockFn = jest.fn()
        const atom = atomWithRuntimeSnapshot(machine, { onPreStart: mockFn })
        expect(mockFn).not.toHaveBeenCalled()

        const { result } = renderHook(() => useAtom(atom))
        expect(mockFn).toHaveBeenCalled()
        expect(mockFn).toHaveBeenCalledWith(result.current[0]._runtime)
      })

      test('0:ステート遷移', async () => {
        const atom = atomWithRuntimeSnapshot(machine)
        const { result, unmount } = renderHook(() => useAtom(atom))
        const [snapshot, send] = result.current
        expect(snapshot.stateValue).toBe('/a')

        act(() => send({ type: '1' }))

        const { result: result2 } = renderHook(() => useAtom(atom))
        const [snapshot2] = result2.current
        expect(snapshot2.stateValue).toBe('/b')
        expect(snapshot2.context).toEqual({ name: 'John' })

        expect(snapshot.stateValue).toBe('/a')
        expect(snapshot.runtimeStatus).toBe('active')

        act(() => send({ type: '2' }))
        const { result: result3 } = renderHook(() => useAtom(atom))
        const [snapshot3] = result3.current
        expect(snapshot3.stateValue).toBe('/c')

        unmount()
      })

      test('10:アンマウントで runtime 停止', async () => {
        const atom = atomWithRuntimeSnapshot(machine)
        const { result, unmount } = renderHook(() => useAtom(atom))

        const rt = result.current[0]._runtime
        expect(rt.runtimeStatus).toBe('active')

        unmount()
        expect(rt.runtimeStatus).toBe('stopped')
      })

      test('10:再マウントすると別の runtime が初期状態で作り直される', async () => {
        const atom = atomWithRuntimeSnapshot(machine)

        const first = renderHook(() => useAtom(atom))
        const rt1 = first.result.current[0]._runtime
        act(() => first.result.current[1]({ type: '1' }))
        expect(first.result.current[0].stateValue).toBe('/b')
        expect(first.result.current[0].context.name).toBe('John')

        first.unmount()
        expect(rt1.runtimeStatus).toBe('stopped')

        const second = renderHook(() => useAtom(atom))
        const [snapshot2] = second.result.current
        expect(snapshot2._runtime).not.toBe(rt1)
        expect(snapshot2.runtimeId).not.toBe(rt1.id)
        expect(snapshot2.runtimeStatus).toBe('active')
        expect(snapshot2.stateValue).toBe('/a') // 遷移前に戻っている
        expect(snapshot2.context.name).toBe('')

        second.unmount()
      })

      test('10:購読者が複数いる間は停止せず、最後のアンマウントで停止する', () => {
        const atom = atomWithRuntimeSnapshot(machine)

        const h1 = renderHook(() => useAtom(atom))
        const h2 = renderHook(() => useAtom(atom))
        const rt = h1.result.current[0]._runtime
        expect(h2.result.current[0]._runtime).toBe(rt) // 同一 runtime を共有

        h1.unmount()
        expect(rt.runtimeStatus).toBe('active')

        h2.unmount()
        expect(rt.runtimeStatus).toBe('stopped')
      })
    }
  })
})
