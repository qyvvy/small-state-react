# small-state-react

[small\-state](https://github.com/qyvvy/small-state) の React カスタムフック、および、[Jotai](https://github.com/pmndrs/jotai) の React 拡張。

## Installation

```
npm i small-state-react
```

## Usage

### Import from "./small-state-react"

#### `useRuntime(machine, options?)`

`<M extends AnyMachine>(machine: M, options?: RuntimeOptions<M> & { onPreStart?: (runtime: Runtime<M>) => void }) => {snapshot, send, runtime}`

- マシンを受け取り、ランタイムとして start させ、 `{snapshot, send, runtime}` のオブジェクトを返す。
- オプション引数は一番最初の呼び出しに与えられた引数のみが使われる。インラインで指定されて参照が変わっても同一の値と見なすためである。
- オプション `onPreStart` はランタイムが start される直前に実行されるフック関数であり、マシンから作られたランタイムを引数に受け取る。
  - `.onEmitted` や `.subscribe` を実行するのに使うと良い。


#### `useSelectedSnapshot(runtime, selector, compare?)`

`<M extends AnyMachine, Sel>(runtime: Runtime<M>, selector: (snapshot: Snapshot<M>)=>Sel, compare?: (current: Sel, next: Sel)=>boolean) => Sel`

- ランタイムを受け取り、そのランタイムのスナップショットを `selector` で加工したスナップショットを返す。
  - スナップショットの一部の値だけ利用・監視したいときなどに使う。
- 引数 compare は selection の旧値と新値を比較する関数である。 true なら同一と見なし再レンダリングを抑制する。 false なら更新を反映する。省略時は `===` による同一性比較である。


### Import from "./small-state-react/jotai"

#### `atomWithRuntimeSnapshot(machine, options?)`

`<M extends AnyMachine>(machine: M | ((get:Getter)=>M), options?: RuntimeOptions<M> & { onPreStart?: (runtime: Runtime<M>) => void }) => WritableAtom<Snapshot<M>, [event: SendFnEvent<M>], void>`

- 指定したマシンについての atom を返す。
  - これはどこかでマウントされたときランタイム化され起動される。どこにもマウントされなくなったとき、このランタイムは破棄される。
- `useAtom` に渡して戻ってくる値は `[snapshot, send]` である。
- オプション `onPreStart` はランタイムが start される直前に実行されるフック関数であり、マシンから作られたランタイムを引数に受け取る。
  - `.onEmitted` や `.subscribe` を実行するのに使うと良い。
