// 操作パネルを表示するコンポーネント
import React from 'react'

// maskType など各種状態と操作関数を受け取る
export default function Controls({
  maskType,
  setMaskType,
  mosaicSize,
  setMosaicSize,
  emoji,
  setEmoji,
  addMarker,
  downloadImage,
}) {
  // 各種操作ボタンとセレクター
  return (
    <div className="button-row">
      <select
        id="maskType"
        className="mask-type-selector"
        value={maskType}
        onChange={e => setMaskType(e.target.value)}
      >
        <option value="emoji">Emoji</option>
        <option value="mosaic">Mosaic</option>
      </select>
      {maskType === 'emoji' ? (
        // 絵文字を選択
        <select
          id="emojiSelector"
          className="emoji-selector"
          value={emoji}
          onChange={e => setEmoji(e.target.value)}
        >
          <option value="😊">😊</option>
          <option value="😠">😠</option>
          <option value="🤢">🤢</option>
          <option value="😨">😨</option>
          <option value="😄">😄</option>
          <option value="😐">😐</option>
          <option value="😢">😢</option>
          <option value="😮">😮</option>
        </select>
      ) : (
        // モザイクの場合はサイズ指定のスライダー
        <input
          type="range"
          id="mosaicSize"
          min="5"
          max="50"
          value={mosaicSize}
          onChange={e => setMosaicSize(parseInt(e.target.value))}
        />
      )}
      {/* マーカーを追加 */}
      <button id="addMarker" onClick={addMarker}>
        Add Marker
      </button>
      {/* 加工済み画像を保存 */}
      <button id="download" onClick={downloadImage}>
        Download Masked Image
      </button>
    </div>
  )
}
