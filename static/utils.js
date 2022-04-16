import { userApi } from './apis.js'

// * 實作 Skeleton 用
// * 整個流程: fetch 資料 → loading spinner 畫面 → 資料回來等圖片載入中 → Skeleton 畫面 → 圖片載好 → 正常畫面)
export const onImgLoaded = img => {
  if (img.complete) {
    if(img.classList.contains('skeleton')) {
      img.classList.remove('skeleton');
    }
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

export const addInputInvalidAll = inputElements => {
  // * invalidElements 必須是 Array
  inputElements.forEach(inputElement => {
    inputElement.classList.add('input-invalid');
    inputElement.nextElementSibling.classList.add('input-icon-invalid');
  });
};

export const clearInputInvalidAll = invalidElements => {
  // * invalidElements 必須是 Array
  invalidElements.forEach(invalidElement => {
    invalidElement.classList.remove('input-invalid');
    invalidElement.nextElementSibling.classList.remove('input-icon-invalid');
  });
};

export const checkUserState = async() => {
  const userState = await userApi('GET');
  if (userState.isLogin) {
    return userState.data;
  } else {
    return userState.data === 'expired' ? 'expired' : false;
  }
};

export const checkBookingNum = async() => {
  const userState = await userApi('GET');
  return (!userState?.data || userState.error) ? 0 : userState.data.booking_num;
};

export const checkClassExist = (element, className) => {
  return element.classList.contains(`${className}`) ? true : false;
};

export const inputValidation = (type, inputElement, value) => {
  // * type : 要驗證哪種格式，分別有 'email'、'password'、'phone'、'name'
  const regex = {
    email: new RegExp(/\S+@\S+\.\S+/),
    password: new RegExp(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/),
    phone: new RegExp(/^[09]{2}\d{8}$/),
    name:  new RegExp(/^[\u4e00-\u9fa5]{2,5}$/)
  };
  const inputIcon = inputElement.nextElementSibling;
  if (value === '' || !regex[type].test(value)) {
    !checkClassExist(inputIcon, 'input-icon-invalid') && inputIcon.classList.add('input-icon-invalid');
    !checkClassExist(inputElement, 'input-invalid') && inputElement.classList.add('input-invalid');
    return false;
  } else {
    checkClassExist(inputIcon, 'input-icon-invalid') && inputIcon.classList.remove('input-icon-invalid');
    checkClassExist(inputElement, 'input-invalid') && inputElement.classList.remove('input-invalid');
    return true;
  }
};

export const showMsgModal = (trigger, contentText, isLoginExpired = false) => {
  const modal = document.querySelector('#modal-msg');
  const title = document.querySelector('#title-modal-msg');
  const content = document.querySelector('#content-modal-msg');
  const button = document.querySelector('#button-modal-msg');
  if (isLoginExpired) {
    const exits = document.querySelectorAll('.exit-modal');
    exits.forEach(exit => {
      exit.style.pointerEvents = 'none';
      if(exit.classList.contains('close-modal')) exit.style.display = 'none';
    });
  };
  title.textContent = isLoginExpired ? '連線逾時' : '錯誤';
  content.textContent = contentText;
  button.textContent = isLoginExpired ? '回首頁' : '確定';
  button.addEventListener('click', e => {
    e.preventDefault();
    if(isLoginExpired) { window.location.href = '/'; };
    modal.classList.remove('open-modal');
  });
  trigger.click();
}

export const animateArrayItems = (container, animationName, className) => {
  container.addEventListener('animationend', e => {
    if (e.animationName === animationName) {
      e.target.classList.remove(`${className}`);
      e.target.style.opacity = 1;
      if (e.target.nextElementSibling) {
        e.target.nextElementSibling.classList.add(`${className}`);
      }
    }
  });
}

export const animeProgressBar = async(startTime = undefined) => {
  const progressBar = document.querySelector('#progress-bar');
  return await new Promise(resolve => {
    const intervalTimerId = setInterval(() => {
      const timePassed = new Date() - startTime;
      console.log(timePassed);
      let progress = timePassed / 500;
      if (progress > 1) { progress = 1; }
      let delta = Math.pow(progress, 2);
      progressBar.style.width = `${ 100 * Math.abs(delta) }%`;
      if( progress === 1 ) {
        clearInterval(intervalTimerId);
        resolve(false);
      };
    }, 20);
  })
};

export const ntdDisplay = (num = 0) => {
  return `新台幣 ${num} 元`;
};

export class Carousel {
  constructor(id) {
    this.wrapCarousel = document.querySelector(`#${id}`);
    this.carousel = this.wrapCarousel.querySelector('.carousel');
    this.slides = this.carousel.querySelectorAll('.slide');
    this.arrowButtons = this.wrapCarousel.querySelectorAll('.arrow');
    this.indicatorButtons = this.wrapCarousel.querySelectorAll('.indicator');
    this.carouselLength = this.slides.length;
    this.currentSlideNum = 1;
    this.currentCarouselPos = -100;
    this.direction = undefined;
    this.isAnimating = false;
  }
  init() {
    this.carousel.style.left = '-100%';
    this.listenEvents();
    this.cloneFirstAndLastSlide();
  }
  listenEvents() {
    this.arrowButtons.forEach(arrowButton => {
      arrowButton.addEventListener('click', e => {
        this.direction = parseInt(e.currentTarget.getAttribute('data-direction'));
        if (!this.isAnimating) { 
          this.currentSlideNum += this.direction;
          this.slide(null);
        };
      });
    });
    this.indicatorButtons.forEach((indicatorButton, targetSlideIndex) => {
      indicatorButton.addEventListener('click', () => {
        if (this.currentSlideNum !== targetSlideIndex + 1 && !this.isAnimating) {
          this.direction = this.currentSlideNum - 1 > targetSlideIndex ? -1 : 1;
          this.slide(targetSlideIndex);
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
  animateIndicator(targetSlideIndex) {
    const activeIndicator = this.wrapCarousel.querySelector('.active-indicator');
    if(activeIndicator) {
      activeIndicator.classList.remove('active-indicator');
    };
    this.indicatorButtons[targetSlideIndex].classList.add('active-indicator');
  }
  animateSlide(newCarouselPos, isOnClone, targetSlideIndex) {
    const start = new Date();
    const timerId = setInterval(() => {
      const timePassed = new Date() - start;
      let progress = timePassed / 400;
      if (progress > 1) { progress = 1; }
      let delta = Math.pow(progress, 2);
      this.carousel.style.left = `${this.currentCarouselPos + Math.abs(newCarouselPos - this.currentCarouselPos) * delta * this.direction * -1}%`;
      if( progress === 1 ) {
        clearInterval(timerId);
        this.isAnimating = false;
        this.currentCarouselPos = newCarouselPos;
        if (isOnClone) {
          this.currentSlideNum = this.currentSlideNum < 1 ? this.carouselLength : 1;
          this.currentCarouselPos = this.currentSlideNum * 100 * -1;
          this.carousel.style.left = `${this.currentCarouselPos}%`;
        } else {
          this.currentSlideNum = targetSlideIndex !== null ? targetSlideIndex + 1 : this.currentSlideNum;
          this.currentCarouselPos = this.currentSlideNum * 100 * -1;
        }
        this.animateIndicator(targetSlideIndex !== null ? targetSlideIndex : this.currentSlideNum - 1);
      }
    }, 20);
  }
  slide(targetSlideIndex) {
    const isOnClone = this.currentSlideNum < 1 || this.currentSlideNum > this.carouselLength;
    const newCarouselPos = isOnClone
    ? this.direction > 0 ? (this.carouselLength + 1) * 100 * -1 : 0
    : (targetSlideIndex !== null ? targetSlideIndex + 1 : this.currentSlideNum) * 100 * -1;
    this.isAnimating = true;
    this.animateSlide(newCarouselPos, isOnClone, targetSlideIndex);
  };
}