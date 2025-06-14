# React Mask Face アプリ

アップロードした写真の顔を隠すシンプルなウェブアプリケーションです。
このアプリでは [face-api.js](https://github.com/justadudewhohacks/face-api.js) を使って顔を検出し、絵文字またはモザイクマスクを配置できます。
Flask バックエンドで画像のアップロードを処理します。

## 特徴

* 画像をアップロードすると自動で顔を検出
* 絵文字またはモザイクブロックで顔をマスク
* マーカーをドラッグして位置を調整、または自分で追加
* マスク付きの最終画像をダウンロード

## はじめに

1. **依存パッケージのインストール**

   ```bash
   npm install
   ```

2. **バックエンドの起動**
   （Python3 と `flask`、`flask-cors` が必要です）

   ```bash
   python backend/app.py
   ```

   サーバーは [http://localhost:5000](http://localhost:5000) で起動します。

3. **React 開発サーバーの起動**

   ```bash
   npm run dev
   ```

   Vite が [http://localhost:5173](http://localhost:5173) でアプリを提供し、API リクエストをバックエンドにプロキシします。

ブラウザで該当の URL を開いて、顔をマスクしてみてください。

## Lint（コードチェック）

ESLint を実行してプロジェクトをチェックします：

```bash
npm run lint
```

## 本番用ビルド

本番用ビルドを作成するには：

```bash
npm run build
```

ビルド結果は `dist` ディレクトリに出力されます。
