import { act, renderHook } from '@testing-library/react'
import { StrictMode } from 'react'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, jest, mock, test } from 'bun:test'
import { makeMachine, makeRuntime } from 'small-state'
import { useRuntime } from '../useRuntime'
import { useSelectedSnapshot } from '../useSelectedSnapshot'


describe('react', () => {
  describe('useRuntime', () => {
    let mockFn1: jest.Mock
    beforeAll(async () => {
      mockFn1 = jest.fn()
    })

    {
      const machine = makeMachine({}, ({ on }) => ([[], {
        a: [
          on('1', { to: 'b' })
        ],
        b: [{ final: () => 'finished' }]
      }]))

      test('0:ステート遷移しても古い snapshot は変更されない', async () => {
        const { result } = renderHook(() => useRuntime(machine))
        const { snapshot, send } = result.current
        expect(snapshot.stateValue).toBe('/a')

        act(() => send({ type: '1' }))
        expect(snapshot.stateValue).toBe('/a')
        expect(snapshot.runtimeStatus).toBe('active')

        const snapshot2 = result.current.snapshot
        expect(snapshot2.stateValue).toBe('/b')
        expect(snapshot2.runtimeStatus).toBe('done')
        // TODO: TBC: output にはこういうとき、渡されないのが正しい仕様だったか確認
        //expect(snapshot2.output).toBe('finished')
      })
    }

    {
      const machine = makeMachine({
        initContext: () => ({ name: '' })
      }, ({ on }) => ({
        a: [
          on('1', { actions: ({ update }) => update({ name: 'John' }) })
        ],
        b: null,
      }))
      test('0:コンテキスト更新しても古い snapshot は変更されない', async () => {
        const { result } = renderHook(() => useRuntime(machine))
        const { snapshot, send } = result.current
        expect(snapshot.stateValue).toBe('/a')
        expect(snapshot.context).toEqual({ name: '' })

        act(() => send({ type: '1' }))
        const snapshot2 = result.current.snapshot
        expect(snapshot2.stateValue).toBe('/a')
        expect(snapshot2.context).toEqual({ name: 'John' })
        expect(snapshot.context).toEqual({ name: '' })
      })
    }
  })

  describe.todo('useSelectedSnapshot', () => {
    type User = { name: string; age: number }
    const machine = makeMachine({
      types: { events: {} as { type: '1' } | { type: '2', user: User } | { type: '3' } },
      initContext: () => ({ user: null as User | null, count: 0 })
    }, ({ on }) => ({
      a: [
        on('1', { actions: [({ update, c }) => update({ count: c.count + 1 })] }),
        on('2', { actions: [({ update, e }) => update({ user: e.user }), () => console.log(`DBG:100: `,)] }),
        on('3', { to: 'b' }),
      ],
      b: [],
    }))

    test('0:', async () => {
      const rt = makeRuntime(machine).start()

      const x = renderHook(() => useSelectedSnapshot(rt, (snapshot) => {
        return snapshot.context.user
      }))
      const snapshot1 = x.result.current
      expect(snapshot1).toEqual(null)

      rt.send({ type: '1' })
      const xx = renderHook(() => useSelectedSnapshot(rt, (snapshot) => {
        return snapshot.context.user
      }))
      const snapshot2 = xx.result.current
      expect(snapshot2).toEqual(null)

      rt.send({ type: '2', user: { name: 'John', age: 19 } })
      const xxx = renderHook(() => useSelectedSnapshot(rt, (snapshot) => {
        return snapshot.context.user
      }))
      const snapshot3 = xxx.result.current
      expect(snapshot3).toEqual({ name: 'John', age: 19 })

      rt.send({ type: '1' })
      const xxxx = renderHook(() => useSelectedSnapshot(rt, (snapshot) => {
        return snapshot.context.user
      }))
      const snapshot4 = xxxx.result.current
      expect(snapshot4).toBe(snapshot3)

    })

  })
})
