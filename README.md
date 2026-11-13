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

#### `useRuntime(machine, options?)`

`<M extends AnyMachine>(machine: M, options?: RuntimeOptions<M> & { onPreStart?: (runtime: Runtime<M>) => void }) => {snapshot, send, runtime}`

- Accepts a machine, starts it as a Runtime, and returns an `{snapshot, send, runtime}` object.
- Only the options passed to the initial call are used. Even if the options are specified inline and their references change between renders, they are treated as the same values.
- The `onPreStart` option is a hook function that is called immediately before the runtime starts. It receives `runtime` as an argument.
  - This is useful for registering `.onEmitted` or `.subscribe` handlers.


#### `useSelectedSnapshot(runtime, selector, compare?)`

`<M extends AnyMachine, Sel>(runtime: Runtime<M>, selector: (snapshot: Snapshot<M>)=>Sel, compare?: (current: Sel, next: Sel)=>boolean) => Sel`

- Accepts a runtime and returns a snapshot processed by the `selector`.
  - Useful when you want to use or monitor only a specific part of the snapshot values.
- The compare argument is a function that compares the old and new values of the selection. If true, they are considered identical and re-rendering is suppressed. If false, the update is applied. If omitted, identity comparison (===) is used.


### Import from "./small-state-react/jotai"

#### `atomWithRuntimeSnapshot(machine, options?)`

`<M extends AnyMachine>(machine: M | ((get:Getter)=>M), options?: RuntimeOptions<M> & { onPreStart?: (runtime: Runtime<M>) => void }) => WritableAtom<Snapshot<M>, [event: SendFnEvent<M>], void>`


- Returns an atom for the specified machine.
  - It is initialized as a runtime and started when mounted somewhere. When it is no longer mounted anywhere, the runtime is destroyed.
- The values returned when passed to `useAtom` are `[snapshot, send]`.
- The `onPreStart` option is a hook function that is called immediately before the runtime starts. It receives `runtime` as an argument.
  - This is useful for registering `.onEmitted` or `.subscribe` handlers.
