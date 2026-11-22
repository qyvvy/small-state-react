# small-state-react

This README.md was automatically translated from the Japanese version and may contain inaccuracies. For accurate information, please refer to [the Japanese version](https://github.com/qyvvy/small-state-react/blob/main/README.ja.md).

---

React custom hooks for [small\-state](https://github.com/qyvvy/small-state), and React extensions for [Jotai](https://github.com/pmndrs/jotai).


## Installation

```
npm i small-state-react
```

## Usage

### Import from "./small-state-react"

#### Types

- `type RuntimeHandle<M extends AnyMachine> = { snapshot: Snapshot<M>; send: (event: SendFnEvent<M>) => undefined; runtime: Runtime<M>; useBoundSend: UseBoundSend<M>; }`
- `type UseBoundSend<M extends AnyMachine> = (event: SendFnEvent<M>) => () => undefined`

#### `useRuntimeHandle(machine, options?): RuntimeHandle`

`<M extends AnyMachine>(machine: M, options?: RuntimeOptions<M> & { onPreStart?: (runtime: Runtime<M>) => void }) => RuntimeHandle<M>`

- Takes a machine, starts it as a runtime, and returns a `RuntimeHandle<M>` object containing `{ snapshot, send, runtime, useBoundSend }`.
- Only the arguments provided on the initial call are used. Subsequent changes to the arguments are ignored. This allows inline arguments to be treated as having the same values even if their references change between renders.
- The onPreStart option is a callback that is invoked immediately before the runtime is started. It receives the runtime created from the machine.
  - This is useful for registering .onEmitted or .subscribe handlers.

- Return value: `RuntimeHandle<M>: {snapshot, send, runtime, useBoundSend}` - An object containing properties for accessing and interacting with the runtime's current state.
  - `snapshot: Snapshot<M>` - The runtime's current snapshot. It contains properties such as context, states, and runtimeStatus. See the small-state Snapshot documentation for details.
  - `send: (event: SendFnEvent<M>) => undefined` - Sends an event to the runtime.
    - Defining an inline callback such as `onChange={() => send({ type: 'foo' })}` creates a new function on every render, which may cause the receiving object to be updated each time. If the event is always the same and you want to avoid this, you can use `useBoundSend` (described below) to create a function with a fixed event and use it as the event handler instead.
  - `runtime: Runtime<M>` - The runtime instance itself.
  - `useBoundSend: (event: SendFnEvent<M>) => () => undefined`
    - **NOTE: This is an experimental feature and may be unstable.**
    - This function takes an event object and returns a send function bound to that event. In other words, it behaves similarly to calling `.bind` on send with the specified event. However, the returned function retains the same reference across renders, helping prevent unnecessary re-renders when passed to components.
      - This is useful when you need a function that can be passed directly to an event handler.
    - The event provided on the first call is used. Any changes to the event object on subsequent calls are ignored.
    - Since this function is treated as a React Hook, it is subject to the Rules of Hooks. In particular, it must not be called inside conditional statements or other conditional branches.


#### `useSelectedSnapshot(runtime, selector, compare?)`

`<M extends AnyMachine, Sel>(runtime: Runtime<M>, selector: (snapshot: Snapshot<M>)=>Sel, compare?: (current: Sel, next: Sel)=>boolean) => Sel`

- Takes a runtime and a snapshot transformation function, `selector`, and returns the result of applying `selector` to the snapshot.
  - Useful when you only need to access or subscribe to specific values from the snapshot.
- The compare argument is a function that compares the old and new values of the selection. If true, they are considered identical and re-rendering is suppressed. If false, the update is applied. If omitted, identity comparison (===) is used.


### Import from "./small-state-react/jotai"

#### `atomWithRuntimeSnapshot(machine, options?)`

`<M extends AnyMachine>(machine: M | ((get:Getter)=>M), options?: RuntimeOptions<M> & { onPreStart?: (runtime: Runtime<M>) => void }) => WritableAtom<Snapshot<M>, [event: SendFnEvent<M>], void>`


- Returns an atom for the specified machine.
  - It is initialized as a runtime and started when mounted somewhere. When it is no longer mounted anywhere, the runtime is destroyed.
- The values returned when passed to `useAtom` are `[snapshot, send]`.
- The `onPreStart` option is a hook function that is called immediately before the runtime starts. It receives `runtime` as an argument.
  - This is useful for registering `.onEmitted` or `.subscribe` handlers.
