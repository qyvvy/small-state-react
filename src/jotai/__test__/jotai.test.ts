import { act, renderHook } from '@testing-library/react'
import { StrictMode } from 'react'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, jest, mock, test } from 'bun:test'
import { makeMachine } from 'small-state'
import { useAtom } from 'jotai'
import { atomWithRuntimeSnapshot } from '../atomWithRuntimeSnapshot'


describe('jotai', () => {
  describe('atomWithRuntimeSnapshot', () => {
    let mockFn1: jest.Mock
    beforeAll(async () => {
      mockFn1 = jest.fn()
    })

    {
      const machine = makeMachine({
        initContext: () => ({ name: '' })
      }, ({ on }) => ({
        a: [
          on('1', { to: 'b', actions: [({ update }) => update({ name: 'John' })] })
        ],
        b: [on('2', { to: 'c' })],
        c: null,
      }))

      test('0:ステート遷移', async () => {
        const atom = atomWithRuntimeSnapshot(machine)
        const { result } = renderHook(() => useAtom(atom))
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
      })
    }

  })

})
