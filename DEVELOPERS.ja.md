# Development

## Commands

- Setup
  ```
  bun install
  ```
- Test
  ```
  bun test
  ```
- Build
  ```
  bun run build
  ```


## Coding Rules


## 技術用備忘録

### DOM環境の構築

https://bun.sh/guides/test/testing-library

- ./bunfig.toml - bun の設定
- ./bun-test-preload--happydom.ts - テスト前に読み込まれて仮想DOM環境を構築する
- ./bun-test-preload--rtl.ts - RTL 用の設定（expect関数を拡張）
- ./bun-test-matchers.d.ts - 拡張したマッチャーを TypeScript で有効にする

