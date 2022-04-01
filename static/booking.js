import { bookingApi } from './apis.js';
import { onImgLoaded, checkUserState, ntdDisplay } from './utils.js'

const getBooking = async() => {
  const res = await bookingApi('GET')
  if (res?.error) { window.location.href = '/'; };
  return res.data;
};
const deleteBooking = async(attractionId) => {
  const res = await bookingApi('DELETE', undefined, attractionId);
  if (res?.error) { window.location.href = '/'; };
  if (res?.ok) { window.location.reload(); };
};

document.addEventListener('DOMContentLoaded', async() => {
  if (!await checkUserState()) { window.location.href = '/'; };
  const booking = await getBooking();
  const noBooking = document.querySelector('div[name="no-booking"]');
  const hasBooking = document.querySelector('div[name="has-booking"]');
  const infoBookings = document.querySelectorAll('.info-booking');
  const thumbnail = document.querySelector('.thumbnail-booking'); 
  const memberNames = document.querySelectorAll('.member-name');
  const attractionName = infoBookings[0].querySelector('span:last-of-type');
  const bookingDate = infoBookings[1].querySelector('span:last-of-type');
  const bookingTime = infoBookings[2].querySelector('span:last-of-type');
  const bookingFee = infoBookings[3].querySelector('span:last-of-type');
  const bookingAddr = infoBookings[4].querySelector('span:last-of-type');
  const cancellation = document.querySelector('.cancellation-booking');
  const bookingPrice = document.querySelector('#price-booking > span');
  const orderForm = document.querySelector('#form-order');
  const loader = document.querySelector('.wrap-center');
  
  const render = () => {
    loader.style.display = 'none';
    memberNames.forEach(memberName => {
      memberName.textContent = JSON.parse(sessionStorage.getItem('member'))['sub_name']; 
    }) 
    if(booking?.length > 0) {
      booking.forEach(({ attraction, date, price, time }) => {
        thumbnail.src = attraction?.image;
        onImgLoaded(thumbnail);
        attractionName.textContent = attraction?.name;
        bookingDate.textContent = new Date(date).toISOString().split('T')[0];
        bookingTime.textContent = time === 'morning' ? '早上 9 點到下午 4 點' : '下午 4 點到晚上 9 點';
        bookingFee.textContent = ntdDisplay(price);
        bookingAddr.textContent = attraction?.address;
        cancellation.setAttribute('data-attraction-id', attraction?.id);
        cancellation.addEventListener('click', async(e) => {
          const attractionId = e.currentTarget.getAttribute('data-attraction-id');
          await deleteBooking(attractionId);
        });
      });
      bookingPrice.textContent = ntdDisplay(booking[0].price);
      noBooking.style.display = 'none';
      hasBooking.style.display = 'block';
    } else {
      noBooking.style.display = 'block';
      hasBooking.style.display = 'none';
    }
  };

  render();
  orderForm.addEventListener('submit', e => {
    e.preventDefault();
  })
});
