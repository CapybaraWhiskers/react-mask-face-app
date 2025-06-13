// 画像とマーカーを表示するエリア
import React from 'react'
import Marker from './Marker'

export default function ImagePreview({ imageUrl, markers, imgRef, onLoad, onUpdate, onToggle, onClick, processed }) {
  // アップロードされた画像とマーカーを描画
  return (
    <div className="image-container" onClick={onClick}>
      {imageUrl && (
        // 画像があるときだけ表示
        <img
          src={imageUrl}
          alt="uploaded"
          id="uploadedImage"
          onLoad={onLoad}
          ref={imgRef}
          style={{ visibility: processed ? 'visible' : 'hidden' }}
        />
      )}
      {processed &&
        // 顔検出が終わったらマーカーを表示
        markers.map(marker => (
          <Marker
            key={marker.id}
            marker={marker}
            uploadedImage={imgRef.current}
            onUpdate={onUpdate}
            onToggle={onToggle}
          />
        ))}
    </div>
  )
}
