import { getAttractionSpotApi, bookingApi } from './apis.js';
import { onImgLoaded, checkUserState, Carousel } from './utils.js';

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
  const detailInfos = document.querySelectorAll('.detail-info');
  const formBooking = document.querySelector('#form-booking');
  const dateBooking = formBooking.querySelector('#date-booking');
  const radioBookings = formBooking.querySelectorAll('input[type="radio"]');
  const msgGuideFee = document.querySelector('#msg-guide-fee');

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
        detailInfos[0].textContent = name;
        detailInfos[1].textContent = `${category} at ${mrt}`;
        detailInfos[2].textContent = description;
        detailInfos[3].textContent = address;
        detailInfos[4].textContent = transport;
      });
      detailSkeletons.forEach(detailSkeleton => {
        detailSkeleton.style.display = 'none';
      });
      detailInfos.forEach(detailInfo => {
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
    if (await checkUserState()) {
      await postBooking({
        attractionId: detail.data[0].id,
        date: dateBooking.value,
        time: formBooking.querySelector('input[name=radio-booking]:checked').id,
        price: parseInt(msgGuideFee.textContent),
      });
    } else {
      document.querySelector('#trigger-auth').click();
    };
  };

  render();
  const today = new Date(new Date()).toISOString().split('T')[0];
  dateBooking.setAttribute('min', today);
  formBooking.addEventListener('submit', booking);
  new Carousel('carousel-detail').init();
});