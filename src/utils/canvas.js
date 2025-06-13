// 指定した領域をモザイク化して描画する
export function drawMosaic(ctx, image, sx, sy, sw, sh, pixel, dx = sx, dy = sy, dw = sw, dh = sh) {
    // 一時キャンバスに縮小描画してから拡大することでモザイクを表現
    const tmpW = Math.max(1, Math.floor(sw / pixel))
    const tmpH = Math.max(1, Math.floor(sh / pixel))
    const tmp = document.createElement('canvas')
    tmp.width = tmpW
    tmp.height = tmpH
    const tctx = tmp.getContext('2d')
    tctx.drawImage(image, sx, sy, sw, sh, 0, 0, tmpW, tmpH)
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(tmp, 0, 0, tmpW, tmpH, dx, dy, dw, dh)
}