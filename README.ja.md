# small-state-react

[small\-state](https://github.com/qyvvy/small-state) の React カスタムフック、および、[Jotai](https://github.com/pmndrs/jotai) の React 拡張。

## Installation

```
npm i small-state
```

## Usage

### './small-state-react'

#### `useRuntime(machine, options?)`

`<M extends AnyMachine>(machine: M, options?: RuntimeOptions<M>) => {snapshot, send, runtime}`

- マシンを受け取り、ランタイムとして start させ、 `{snapshot, send, runtime}` のオブジェクトを返す。
- マシンは参照が変わると作り直されるので makeMachine をインラインで定義するのでなくいったん変数に束縛しそれを指定する必要がある。
- 逆にオプションはインラインで指定してもランタイムが作り直されないことに注意。


#### `useSelectedSnapshot(runtime, selector, compare?)`

`<M extends AnyMachine, Sel>(runtime: Runtime<M>, selector: (snapshot: Snapshot<M>)=>Sel, compare?: (current: Sel, next: Sel)=>boolean) => Sel`

- ランタイムを受け取り、そのランタイムのスナップショットを `selector` で加工したスナップショットを返す。
  - スナップショットの一部の値だけ利用・監視したいときなどに使う。
- 引数 compare は selection の旧値と新値を比較する関数である。 true なら同一と見なし再レンダリングを抑制する。 false なら更新を反映する。省略時は `===` による同一性比較である。


### './small-state-react/jotai'

#### `atomWithRuntimeSnapshot(machine, options?)`

`<M extends AnyMachine>(machine: M | ((get:Getter)=>M), options?: RuntimeOptions<M>) => WritableAtom<Snapshot<M>, [event: SendFnEvent<M>], void>`

- 指定したマシンについての atom を返す。
  - これはどこかでマウントされたときランタイム化され起動される。どこにもマウントされなくなったとき、このランタイムは破棄される。
- `useAtom` に渡して戻ってくる値は `[snapshot, send]` である。
