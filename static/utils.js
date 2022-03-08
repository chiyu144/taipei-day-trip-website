// * 實作 Skeleton 用
// * 整個流程: fetch 資料 → loading spinner 畫面 → 資料回來等圖片載入中 → Skeleton 畫面 → 圖片載好 → 正常畫面)
export const onImgLoaded = img => {
  if (img.complete) {
    // * 圖片已被載入 (圖片無情瞬間載好，不需做事)
    return
  } else {
    // * 如果圖片還沒載好，顯示 Skeleton
    img.classList.add('skeleton')
    // * 圖片載好後，關掉 Skeleton
    img.onload = () => img.classList.remove('skeleton')
  }
}