import { bookingApi } from './apis.js';
import { onImgLoaded, checkUserState, ntdDisplay, animateArrayItems, checkBookingNum } from './utils.js'

let booking = [];
let totalPrice = 0;

const getBooking = async() => {
  const res = await bookingApi('GET')
  if (res?.error) { window.location.href = '/'; };
  return res.data;
};
const deleteBooking = async(attractionId, reRender) => {
  const res = await bookingApi('DELETE', undefined, attractionId);
  if (res?.error) { window.location.href = '/'; };
  if (res?.ok) { 
    totalPrice = 0;
    booking = await getBooking();
    const rows = document.querySelectorAll('.row-booking');
    const bookingNum = document.querySelector('#nav-booking-num');
    rows.forEach(row => row.remove());
    bookingNum.textContent = await checkBookingNum();
    reRender(booking);
  };
};

document.addEventListener('DOMContentLoaded', async() => {
  if (!await checkUserState()) { window.location.href = '/'; };
  booking = await getBooking();
  const gridBooking = document.querySelector('.grid-booking');
  const memberNames = document.querySelectorAll('.member-name');
  const priceBooking = document.querySelector('#price-booking > span');
  const orderForm = document.querySelector('#form-order');
  const loader = document.querySelector('.wrap-center');
  const msgNoBooking = document.querySelector('.msg-no-booking');
  
  const render = booking => {
    memberNames.forEach(memberName => {
      memberName.textContent = JSON.parse(sessionStorage.getItem('member'))['sub_name']; 
    }) 
    if(booking?.length > 0) {
      const fragment = document.createDocumentFragment();
      const infoKeys = ['台北一日遊', '日期', '時間', '費用', '地點'];

      booking.forEach(({ attraction, date, price, time }, index) => {
        const thumbnail = document.createElement('img');
        thumbnail.classList.add('thumbnail-booking');
        thumbnail.src = attraction?.image;
        onImgLoaded(thumbnail);
        const wrapThumbnail = document.createElement('div');
        wrapThumbnail.classList.add('wrap-thumbnail-booking');
        wrapThumbnail.appendChild(thumbnail);
        const colLeft = document.createElement('div');
        colLeft.classList.add('col-md-12', 'col', 'col-booking', 'col-booking-left');
        colLeft.appendChild(wrapThumbnail);

        const colRight = document.createElement('div');
        colRight.classList.add('col-md-12', 'col', 'col-booking', 'col-booking-right');

        const infoValues = [
          attraction?.name,
          new Date(date).toISOString().split('T')[0],
          time === 'morning' ? '早上 9 點到下午 4 點' : '下午 1 點到晚上 8 點',
          ntdDisplay(Math.trunc(price)),
          attraction?.address
        ];

        infoKeys.forEach((key, index) => {
          const infoTitle = document.createElement('span');
          infoTitle.textContent = `${key + '：'}`;
          const infoDesc = document.createElement('span');
          infoDesc.textContent = infoValues[index];
          const infoBooking = document.createElement('div');
          infoBooking.classList.add('info-booking');
          infoBooking.appendChild(infoTitle);
          infoBooking.appendChild(infoDesc);
          colRight.appendChild(infoBooking);
        });

        const iconDelete = document.createElement('img');
        iconDelete.src = '/static/image/icon_delete.png';
        const cancelBooking = document.createElement('div');
        cancelBooking.classList.add('cancel-booking');
        cancelBooking.setAttribute('data-attraction-id', attraction?.id);
        cancelBooking.addEventListener('click', async(e) => {
          const attractionId = e.currentTarget.getAttribute('data-attraction-id');
          await deleteBooking(attractionId, render);
        });
        cancelBooking.appendChild(iconDelete);
        colRight.appendChild(cancelBooking);

        const row = document.createElement('div');
        if (index === 0) { row.classList.add('run-fade-in'); };
        row.classList.add('row', 'row-booking');
        row.appendChild(colLeft);
        row.appendChild(colRight);

        fragment.appendChild(row);
        totalPrice += parseFloat(price);
      });
      gridBooking.appendChild(fragment);
      msgNoBooking.style.display = 'none';
      orderForm.style.display = 'block';
    } else {
      msgNoBooking.style.display = 'block';
      orderForm.style.display = 'none';
      totalPrice = 0;
    }
    priceBooking.textContent = ntdDisplay(Math.trunc(totalPrice));
    loader.style.display = 'none';
  };

  animateArrayItems(gridBooking, 'fade-in', 'run-fade-in');
  render(booking);
  orderForm.addEventListener('submit', e => {
    e.preventDefault();
  })
});
