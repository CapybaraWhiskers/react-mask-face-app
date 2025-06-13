/* global faceapi */
// React のフックを読み込み
import { useEffect, useRef, useState } from 'react'
import Marker from './components/Marker'
import ImageUploader from './components/ImageUploader'
import ImagePreview from './components/ImagePreview'
import Controls from './components/Controls'
// モザイク処理を行うユーティリティ関数
import { drawMosaic } from './utils/canvas'
import './App.css'

// 表情認識の結果から表示する絵文字を決めるテーブル
const expressionEmojiMap = {
  angry: '😠',
  disgusted: '🤢',
  fearful: '😨',
  happy: '😄',
  neutral: '😐',
  sad: '😢',
  surprised: '😮'
}

// マーカーに付与する連番 ID を生成する関数
let idCounter = 0
const nextId = () => ++idCounter

function App() {
  // 選択中のマスクタイプ（emoji / mosaic）
  const [maskType, setMaskType] = useState('emoji')
  // モザイクのブロックサイズ
  const [mosaicSize, setMosaicSize] = useState(10)
  // 追加する絵文字の種類
  const [emoji, setEmoji] = useState('😊')
  // 配置済みのマーカー一覧
  const [markers, setMarkers] = useState([])
  // 画像処理中かどうか
  const [loading, setLoading] = useState(false)
  // 表示する画像の URL
  const [imageUrl, setImageUrl] = useState(null)
  // 顔検出処理が完了したか
  const [processed, setProcessed] = useState(false)
  // face-api.js のモデルが読み込まれたか
  const [modelsLoaded, setModelsLoaded] = useState(false)
  // img 要素への参照を保持
  const imgRef = useRef(null)

  // 画像ファイルが選択されたときの処理
  const handleImageChange = async e => {
    const file = e.target.files[0]
    if (!file) return
    setLoading(true)
    setProcessed(false)
    setMarkers([])
    // 画像をバックエンドに送信し一時的な URL を取得
    const form = new FormData()
    form.append('image', file)
    const res = await fetch('/api/upload', { method: 'POST', body: form })
    const { url } = await res.json()
    // キャッシュを避けるためにタイムスタンプを付与
    setImageUrl(`${url}?${Date.now()}`)
  }

  // 画像が読み込まれたときに顔検出を行う
  const handleImageLoad = async e => {
    const img = e.target
    imgRef.current = img
    // 初回のみモデルを読み込み
    if (!modelsLoaded) {
      await faceapi.nets.ssdMobilenetv1.loadFromUri('models')
      await faceapi.nets.faceExpressionNet.loadFromUri('models')
      setModelsLoaded(true)
    }
    const detections = await faceapi
      .detectAllFaces(img)
      .withFaceExpressions()
    // 表示サイズと元画像サイズの比率を計算
    const scaleX = img.clientWidth / img.naturalWidth
    const scaleY = img.clientHeight / img.naturalHeight
    // 検出結果からマーカー情報を作成
    const newMarkers = detections.map(det => {
      const { x, y, width, height } = det.detection.box
      const sizeW = width * scaleX
      const sizeH = height * scaleY
      const size = Math.max(sizeW, sizeH)
      const adjustedX = x * scaleX - (size - sizeW) / 2
      const adjustedY = y * scaleY - (size - sizeH) / 2
      if (maskType === 'mosaic') {
        return {
          id: nextId(),
          type: 'mosaic',
          x: adjustedX,
          y: adjustedY,
          size,
          pixel: mosaicSize,
          dimmed: false
        }
      }
      // 最も確率が高い表情を取得
      const expressions = det.expressions
      const best = Object.keys(expressions).reduce((a, b) =>
        expressions[a] > expressions[b] ? a : b
      )
      return {
        id: nextId(),
        type: 'emoji',
        x: adjustedX,
        y: adjustedY,
        size,
        emoji: expressionEmojiMap[best] || '😊',
        dimmed: false
      }
    })
    setMarkers(newMarkers)
    setProcessed(true)
    setLoading(false)
  }

  const addMarker = () => {
    const img = imgRef.current
    if (!img) return
    const size = 80
    const x = (img.clientWidth - size) / 2
    const y = (img.clientHeight - size) / 2
    if (maskType === 'mosaic') {
      setMarkers(m => [
        ...m,
        { id: nextId(), type: 'mosaic', x, y, size, pixel: mosaicSize, dimmed: false }
      ])
    } else {
      setMarkers(m => [
        ...m,
        { id: nextId(), type: 'emoji', x, y, size, emoji, dimmed: false }
      ])
    }
  }

  const updateMarker = (id, props) => {
    setMarkers(m => m.map(marker => (marker.id === id ? { ...marker, ...props } : marker)))
  }

  const toggleMarker = id => {
    setMarkers(m => m.map(marker => (marker.id === id ? { ...marker, dimmed: !marker.dimmed } : marker)))
  }

  // 画面の状態を PNG として保存
  const downloadImage = () => {
    const img = imgRef.current
    if (!img) return
    // 描画用のキャンバスを用意
    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)
    // 画像サイズの比率を計算
    const scaleX = img.naturalWidth / img.clientWidth
    const scaleY = img.naturalHeight / img.clientHeight
    // 各マーカーをキャンバスへ描画
    markers.forEach(m => {
      if (m.dimmed) return
      if (m.type === 'emoji') {
        const centerX = (m.x + m.size / 2) * scaleX
        const centerY = (m.y + m.size / 2) * scaleY
        const fontSize = m.size * scaleY
        ctx.font = `${fontSize}px serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(m.emoji, centerX, centerY)
      } else {
        drawMosaic(ctx, img, m.x * scaleX, m.y * scaleY, m.size * scaleX, m.size * scaleY, m.pixel)
      }
    })
    const link = document.createElement('a')
    link.href = canvas.toDataURL('image/png')
    link.download = 'masked.png'
    link.click()
  }

  // モザイクサイズ変更時、既存マーカーへ反映
  useEffect(() => {
    setMarkers(m =>
      m.map(marker => (marker.type === 'mosaic' ? { ...marker, pixel: mosaicSize } : marker))
    )
  }, [mosaicSize])

  // UI の描画部分
  return (
    <div className="app-card">
      <h1>Mask Face App</h1>
      <ImageUploader onChange={handleImageChange} loading={loading} />
      <ImagePreview
        imageUrl={imageUrl}
        markers={markers}
        imgRef={imgRef}
        onLoad={handleImageLoad}
        onUpdate={updateMarker}
        onToggle={toggleMarker}
        processed={processed}
        onClick={() => setMarkers(m => m)}
      />
      <Controls
        maskType={maskType}
        setMaskType={setMaskType}
        mosaicSize={mosaicSize}
        setMosaicSize={setMosaicSize}
        emoji={emoji}
        setEmoji={setEmoji}
        addMarker={addMarker}
        downloadImage={downloadImage}
      />
    </div>
  )
}

// コンポーネントを公開
export default App
