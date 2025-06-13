// ファイル選択用のコンポーネント
import React from 'react'

export default function ImageUploader({ onChange, loading }) {
  // ファイル選択ボタンと読み込み中表示
  return (
    <>
      <label htmlFor="imageUpload" className="custom-file-label">Upload Image</label>
      {/* 実際のファイル入力は非表示にしてある */}
      <input
        type="file"
        id="imageUpload"
        accept="image/jpeg,image/png"
        style={{ display: 'none' }}
        onChange={onChange}
      />
      {loading && <div id="loading">Processing...</div>}
    </>
  )
}
