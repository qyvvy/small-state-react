# small-state-react

[small\-state](https://github.com/qyvvy/small-state) の React カスタムフック、および、[Jotai](https://github.com/pmndrs/jotai) の React 拡張。

## Installation

```
npm i small-state-react
```

## Usage

### Import from "./small-state-react"

#### 型

- `type RuntimeHandle<M extends AnyMachine> = { snapshot: Snapshot<M>; send: (event: SendFnEvent<M>) => undefined; runtime: Runtime<M>; useBoundSend: UseBoundSend<M>; }`
- `type UseBoundSend<M extends AnyMachine> = (event: SendFnEvent<M>) => () => undefined`

#### `useRuntimeHandle(machine, options?): RuntimeHandle`

`<M extends AnyMachine>(machine: M, options?: RuntimeOptions<M> & { onPreStart?: (runtime: Runtime<M>) => void }) => RuntimeHandle<M>`

- マシンを受け取り、ランタイムとして start させ、 `RuntimeHandle<M>: {snapshot, send, runtime, useBoundSend}` のオブジェクトを返す。
- 引数は初回呼び出しに与えられた引数のみが使われる。後から与える引数を変えてもそれは反映されない。これは引数がインラインで指定されて参照が変わっても同一の値と見なさせるためである。
- オプション `onPreStart` はランタイムが start される直前に実行されるフック関数であり、マシンから作られたランタイムを引数に受け取る。
  - `.onEmitted` や `.subscribe` を実行するのに使うと良い。

- 戻り値 `RuntimeHandle<M>: {snapshot, send, runtime, useBoundSend}` - ランタイムの現在の状態と操作を行うプロパティが設定されたオブジェクト
  - `snapshot: Snapshot<M>` - ランタイムのスナップショットオブジェクト。context や states や runtimeStatus 等を持つ。詳しくは small-state の Snapshot のドキュメント参照。
  - `send: (event: SendFnEvent<M>) => undefined` - ランタイムにイベントを送る。
    - `onChange={()=>send({type: 'foo'})}` のようにインラインで書くと毎回新しい関数が生成されるので毎回そのオブジェクトが更新されてしまう。送るイベントの値が毎回固定的であり、これを嫌うなら後述する `useBoundSend` でイベントを固定化した関数を生成しそれを代わりにハンドラーとして使うとよい。
  - `runtime: Runtime<M>` - ランタイム自身。
  - `useBoundSend: (event: SendFnEvent<M>) => () => undefined`
    - NOTE: これは試験的機能である。まだ不安定である。
    - 関数であり、イベントオブジェクトを与えるとそのイベントオブジェクトが紐づけられた send 関数を返す。つまり、指定したイベントを send 関数に `.bind` したような関数を返す（ただし関数オブジェクトの参照は毎実行時変わらないのでコンポネントに与えても毎回再描写されるのを抑えられる）。
      - イベントハンドラに直接渡せる関数を得るために使うとよい。
    - 初回呼び出し時に与えた event が使われ、次回呼び出し以降に、event の内容を変更してもそれは無視される。
    - React のフック扱いなので、通常のフックの扱いの制限を受ける。すなわち、条件分岐内などで実行してはいけない。


#### `useSelectedSnapshot(runtime, selector, compare?)`

`<M extends AnyMachine, Sel>(runtime: Runtime<M>, selector: (snapshot: Snapshot<M>)=>Sel, compare?: (current: Sel, next: Sel)=>boolean) => Sel`

- ランタイムとスナップショット加工関数 `selector` を受け取り、`selector` で加工した結果を返す。
  - スナップショットの一部の値だけ利用・監視したいときなどに使う。
- 引数 compare は selection の旧値と新値を比較する関数である。 true なら同一と見なし再レンダリングを抑制する。 false なら更新を反映する。省略時は `===` による同一性比較である。


### Import from "./small-state-react/jotai"

#### `atomWithRuntimeSnapshot(machine, options?): [snapshot, send]`

`<M extends AnyMachine>(machine: M | ((get:Getter)=>M), options?: RuntimeOptions<M> & { onPreStart?: (runtime: Runtime<M>) => void }) => WritableAtom<Snapshot<M>, [event: SendFnEvent<M>], void>`

- 指定したマシンについての atom を返す。
  - これはどこかでマウントされたときランタイム化され起動される。どこにもマウントされなくなったとき、このランタイムは破棄される。
- `useAtom` に渡して戻ってくる値は `[snapshot, send]` である。
- オプション `onPreStart` はランタイムが start される直前に実行されるフック関数であり、マシンから作られたランタイムを引数に受け取る。
  - `.onEmitted` や `.subscribe` を実行するのに使うと良い。
