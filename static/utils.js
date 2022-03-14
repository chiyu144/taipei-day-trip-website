// * 實作 Skeleton 用
// * 整個流程: fetch 資料 → loading spinner 畫面 → 資料回來等圖片載入中 → Skeleton 畫面 → 圖片載好 → 正常畫面)
export const onImgLoaded = img => {
  if (img.complete) {
    // * 圖片已被載入 (圖片無情瞬間載好，不需做事)
    return;
  } else {
    // * 如果圖片還沒載好，顯示 Skeleton
    img.classList.add('skeleton');
    // * 圖片載好後，關掉 Skeleton
    img.onload = () => img.classList.remove('skeleton');
  };
};

export const clearView = root => {
  while (root.firstChild) {
    root.removeChild(root.firstChild);
  };
};

// * 自己研究出來的輪播
export class Carousel {
  constructor(id) {
    this.wrapCarousel = document.querySelector(`#${id}`);
    this.carousel = this.wrapCarousel.querySelector('.carousel');
    this.slides = this.carousel.querySelectorAll('.slide');
    this.carouselLength = this.slides.length;
    this.currentSlideNum = 1;
    this.currentCarouselPos = -100;
    this.direction = undefined;
    this.isAnimating = false;
  }

  init() {
    this.listenEvents();
    this.cloneFirstAndLastSlide();
  }

  listenEvents() {
    console.log('listenEvent', this);
    const arrowButtons = this.wrapCarousel.querySelectorAll('.arrow');
    const indicatorButtons = this.wrapCarousel.querySelectorAll('.indicator');
    arrowButtons.forEach(arrowButton => {
      arrowButton.addEventListener('click', e => {
        console.log('click carousel arrow button', this);
        this.direction = parseInt(e.currentTarget.getAttribute('data-direction'));
        if (!this.isAnimating) { 
          this.currentSlideNum += this.direction;
          this.slide(null);
        };
      });
    });
    indicatorButtons.forEach((indicatorButton, targetSlideIndex) => {
      indicatorButton.addEventListener('click', e => {
        const targetSlide = this.slides[targetSlideIndex];
        if (this.currentSlideNum !== targetSlideIndex + 1 && !this.isAnimating) {
          direction = currentSlideNum - 1 > targetSlideIndex ? -1 : 1;
          slide(targetSlideIndex);
        };
      })
    })
  }

  cloneFirstAndLastSlide() {
    const firstSlide = this.slides[0];
    const firstSlideClone = firstSlide.cloneNode(true);
    const lastSlideClone = this.slides[this.carouselLength - 1].cloneNode(true);
    firstSlideClone.removeAttribute('data-slide-index');
    lastSlideClone.removeAttribute('data-slide-index');
    this.carousel.appendChild(firstSlideClone);
    this.carousel.insertBefore(lastSlideClone, firstSlide);
  };

  clickArrowButton() {

  };

  clickIndicator() {

  };

}