# small-state-react

React custom hooks for [small\-state](https://github.com/qyvvy/small-state), and React extensions for [Jotai](https://github.com/pmndrs/jotai).


## Installation

```
npm i small-state-react
```

## Usage

### './small-state-react'

#### `useRuntime(machine, options?)`

`<M extends AnyMachine>(machine: M, options?: RuntimeOptions<M>) => {snapshot, send, runtime}`

- Accepts a machine, starts it as a Runtime, and returns an `{snapshot, send, runtime}` object.
- Since the machine is recreated if its reference changes, you must bind makeMachine to a variable and pass it, rather than defining it inline.
- Note that options, conversely, will not cause the runtime to be recreated even if specified inline.


#### `useSelectedSnapshot(runtime, selector, compare?)`

`<M extends AnyMachine, Sel>(runtime: Runtime<M>, selector: (snapshot: Snapshot<M>)=>Sel, compare?: (current: Sel, next: Sel)=>boolean) => Sel`

- Accepts a runtime and returns a snapshot processed by the `selector`.
  - Useful when you want to use or monitor only a specific part of the snapshot values.
- The compare argument is a function that compares the old and new values of the selection. If true, they are considered identical and re-rendering is suppressed. If false, the update is applied. If omitted, identity comparison (===) is used.


### './small-state-react/jotai'

#### `atomWithRuntimeSnapshot(machine, options?)`

`<M extends AnyMachine>(machine: M | ((get:Getter)=>M), options?: RuntimeOptions<M>) => WritableAtom<Snapshot<M>, [event: SendFnEvent<M>], void>`

- Returns an atom for the specified machine.
  - It is initialized as a runtime and started when mounted somewhere. When it is no longer mounted anywhere, the runtime is destroyed.
- The values returned when passed to `useAtom` are `[snapshot, send]`.
