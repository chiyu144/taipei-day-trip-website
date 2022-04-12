import { getAttractionSpotApi, bookingApi } from './apis.js';
import { onImgLoaded, Carousel, showMsgModal } from './utils.js';

let attractionUrl = new URL(window.location);
let id = attractionUrl.pathname.split('/')[2];

const getAttractionSpot = async(id) => {
  const data = await getAttractionSpotApi(id);
  return data;
};
const postBooking = async({ attractionId, date, time, price }) => {
  const res = await bookingApi('POST', { attractionId, date, time, price });
  if (res?.ok) { window.location.href = '/booking'; };
};

document.addEventListener('DOMContentLoaded', async () => {
  const detail = await getAttractionSpot(id);
  const carousel = document.querySelector('#carousel-detail > .carousel');
  const wrapIndicator = document.querySelector('#carousel-detail > .wrap-indicator');
  const detailSkeletons = document.querySelectorAll('.detail-skeleton');
  const infoDetails = document.querySelectorAll('.info-detail');
  const formBooking = document.querySelector('#form-booking');
  const dateBooking = formBooking.querySelector('#date-booking');
  const radioBookings = formBooking.querySelectorAll('input[type="radio"]');
  const msgGuideFee = document.querySelector('#msg-guide-fee');
  const triggerMsg = document.querySelector('.trigger-msg');

  const render = () => {
    if(detail.data?.length > 0) {
      detail.data.forEach(({name, category, mrt, description, address, transport, images}) => {
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
          wrapIndicator.appendChild(indicatorButton);
        });
        infoDetails[0].textContent = name;
        infoDetails[1].textContent = `${category} at ${mrt}`;
        infoDetails[2].textContent = description;
        infoDetails[3].textContent = address;
        infoDetails[4].textContent = transport;
      });
      detailSkeletons.forEach(detailSkeleton => {
        detailSkeleton.style.display = 'none';
      });
      infoDetails.forEach(detailInfo => {
        detailInfo.style.opacity = 1;
      });
    }
    radioBookings.forEach(radio => {
      radio.addEventListener('change', () => {
        if(radio.checked){
          msgGuideFee.textContent = radio.id === 'morning' ? '2000' : '2500';
        }
      });
    });
  }
  const booking = async(e) => {
    e.preventDefault();
    console.log();
    if (sessionStorage.getItem('member') !== '') {
      if (dateBooking.value === '') {
        showMsgModal(triggerMsg, { title: '錯誤', content: '請選擇正確日期。' });
      } else {
        await postBooking({
          attractionId: detail.data[0].id,
          date: dateBooking.value,
          time: formBooking.querySelector('input[name=radio-booking]:checked').id,
          price: parseInt(msgGuideFee.textContent),
        });
      }
    } else {
      document.querySelector('#trigger-auth').click();
    };
  };

  render();
  const today = new Date().toLocaleDateString('en-CA');
  dateBooking.setAttribute('min', today);
  formBooking.addEventListener('submit', booking);
  new Carousel('carousel-detail').init();
});