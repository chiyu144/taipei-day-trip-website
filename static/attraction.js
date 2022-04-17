import { getAttractionSpotApi, bookingApi } from './apis.js';
import { onImgLoaded, Carousel, showMsgModal } from './utils.js';

const getAttractionSpot = async(spotId) => {
  const data = await getAttractionSpotApi(spotId);
  return data;
};
const postBooking = async({ attractionId, date, time, price }, msgModalTrigger) => {
  const res = await bookingApi('POST', { attractionId, date, time, price });
  if (res.error) { showMsgModal(msgModalTrigger, `${res.message}`, res.status === 403 ? true : false); };
  if (res.ok) { window.location.href = '/booking'; };
};

document.addEventListener('DOMContentLoaded', async () => {
  const attractionUrl = new URL(window.location);
  const spotId = attractionUrl.pathname.split('/')[2];
  const spotDetails = await getAttractionSpot(spotId);
  const carouselWrap = document.querySelector('#carousel-spot');
  const carousel = carouselWrap.querySelector('.carousel');
  const indicatorWrap = document.querySelector('#carousel-spot > .wrap-indicator');
  const spotSkeletons = document.querySelectorAll('.spot-skeleton');
  const spotInfos = document.querySelectorAll('.info-spot');
  const bookingForm = document.querySelector('#form-booking');
  const bookingDate = bookingForm.querySelector('#date-booking');
  const bookingRadios = bookingForm.querySelectorAll('input[type="radio"]');
  const guideFeeMsg = document.querySelector('#msg-guide-fee');
  const msgModalTrigger = document.querySelector('#trigger-msg-attraction');

  const render = () => {
    if(spotDetails.data?.length > 0) {
      spotDetails.data.forEach(({name, category, mrt, description, address, transport, images}) => {
        images.forEach((image, index) => {
          const slide = document.createElement('div');
          slide.classList.add('slide');
          slide.setAttribute('data-slide-index', `${index}`);
          const slideImage = document.createElement('img');
          slideImage.src = image;
          onImgLoaded(slideImage);
          const indicatorButton = document.createElement('span');
          indicatorButton.classList.add('indicator');
          if(index === 0) {
            indicatorButton.classList.add('active-indicator');
          }
          if (images.length > 15) {
            indicatorButton.style.margin = '0 4px';
          }
          slide.appendChild(slideImage);
          carousel.appendChild(slide);
          indicatorWrap.appendChild(indicatorButton);
        });
        spotInfos[0].textContent = name;
        spotInfos[1].textContent = `${category} at ${mrt}`;
        spotInfos[2].textContent = description;
        spotInfos[3].textContent = address;
        spotInfos[4].textContent = transport;
      });
      carouselWrap.classList.remove('skeleton');
      spotSkeletons.forEach(spotSkeleton => spotSkeleton.style.display = 'none');
      spotInfos.forEach(detailInfo => detailInfo.style.opacity = 1);
    };
    bookingRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        if(radio.checked){
          guideFeeMsg.textContent = radio.id === 'morning' ? '2000' : '2500';
        }
      });
    });
  }
  const booking = async(e) => {
    e.preventDefault();
    console.log();
    if (sessionStorage.getItem('member') !== '') {
      if (bookingDate.value === '') {
        showMsgModal(msgModalTrigger, '請選擇正確日期。');
      } else {
        await postBooking({
          attractionId: spotDetails.data[0].id,
          date: bookingDate.value,
          time: bookingForm.querySelector('input[name=radio-booking]:checked').id,
          price: parseInt(guideFeeMsg.textContent),
        }, msgModalTrigger);
      }
    } else {
      document.querySelector('#trigger-auth').click();
    };
  };

  render();
  const today = new Date().toLocaleDateString('en-CA');
  bookingDate.setAttribute('min', today);
  bookingForm.addEventListener('submit', booking);
  new Carousel('carousel-spot').init();
});