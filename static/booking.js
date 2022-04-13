import { bookingApi, ordersApi } from './apis.js';
import {
  onImgLoaded, ntdDisplay, animateArrayItems, checkBookingNum,
  checkClassExist, inputValidation, showMsgModal, addInputInvalidAll
} from './utils.js'
import { tappaySetup, tappayValidation } from './tappay.js'

let bookings = [];
let orderTotalPrice = 0;

const getBooking = async() => {
  const res = await bookingApi('GET')
  if (res?.error) { window.location.href = '/'; };
  return res.data;
};
const deleteBooking = async(attractionId, reRender) => {
  const res = await bookingApi('DELETE', undefined, attractionId);
  if (res?.error) { window.location.href = '/'; };
  if (res?.ok) { 
    orderTotalPrice = 0;
    bookings = await getBooking();
    const rows = document.querySelectorAll('.row-booking');
    const bookingNum = document.querySelector('#nav-booking-num');
    rows.forEach(row => row.remove());
    bookingNum.textContent = await checkBookingNum();
    reRender(bookings);
  };
};
const postOrder = async({prime, order}) => {
  const res = await ordersApi('POST', {prime, order});
  if (res?.ok) {
    const thankyouPage = new URL('/thankyou', window.location.href);
    thankyouPage.searchParams.append('number', res.number)
    window.location.href = thankyouPage.toString();
  }
}

document.addEventListener('DOMContentLoaded', async() => {
  bookings = await getBooking();
  const bookingGrid = document.querySelector('.grid-booking');
  const memberNames = document.querySelectorAll('.member-name');
  const bookingPrice = document.querySelector('#price-booking > span');
  const orderForm = document.querySelector('#form-order');
  const orderInputs = document.querySelectorAll('#form-order input');
  const tappayFields = document.querySelectorAll('#form-order .tpfield');
  const loader = document.querySelector('.wrap-center');
  const noBookingMsg = document.querySelector('.msg-no-booking');
  const msgModalTrigger = document.querySelector('.trigger-msg');
  
  const render = bookings => {
    memberNames.forEach(memberName => {
      memberName.textContent = JSON.parse(sessionStorage.getItem('member'))['sub_name']; 
    }) 
    if(bookings?.length > 0) {
      const fragment = document.createDocumentFragment();
      const infoKeys = ['台北一日遊', '日期', '時間', '費用', '地點'];

      bookings.forEach(({ attraction, date, price, time }, index) => {
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
        if (index === 0) { row.classList.add('run-fade-in-booking'); };
        row.classList.add('row', 'row-booking');
        row.appendChild(colLeft);
        row.appendChild(colRight);

        fragment.appendChild(row);
        orderTotalPrice += parseFloat(price);
      });
      bookingGrid.appendChild(fragment);
      noBookingMsg.style.display = 'none';
      orderForm.style.display = 'block';
    } else {
      noBookingMsg.style.display = 'block';
      orderForm.style.display = 'none';
      orderTotalPrice = 0;
    }
    bookingPrice.textContent = ntdDisplay(Math.trunc(orderTotalPrice));
    loader.style.display = 'none';
  };

  animateArrayItems(bookingGrid, 'fade-in', 'run-fade-in-booking');
  render(bookings);

  const validationTypes = ['name', 'email', 'phone'];
  orderInputs.forEach((orderInput, index) => {
    orderInput.addEventListener('keyup', e => {
      checkClassExist(e.currentTarget, 'input-invalid') && e.currentTarget.classList.remove('input-invalid');
      checkClassExist(e.currentTarget.nextElementSibling, 'input-icon-invalid') && e.currentTarget.nextElementSibling.classList.remove('input-icon-invalid');
    });
    orderInput.addEventListener('blur', e => inputValidation(validationTypes[index], e.currentTarget, e.currentTarget.value));
  });
  tappaySetup();
  tappayValidation(tappayFields);

  orderForm.addEventListener('submit', e => {
    e.preventDefault();
    const tappayStatus = TPDirect.card.getTappayFieldsStatus();
    const formData = new FormData(e.target);
    const buyerName =  formData.get('buyer-name');
    const buyerEmail = formData.get('buyer-email');
    const buyerPhone = formData.get('buyer-phone');
    if (tappayStatus.canGetPrime === false || buyerName === '' || buyerEmail === '' || buyerPhone === '') {
      orderInputs.forEach((orderInput, index) => inputValidation(validationTypes[index], orderInput, orderInput.value));
      addInputInvalidAll(tappayFields);
      showMsgModal(msgModalTrigger, { title: '錯誤', content: '請填寫完整的正確資訊。' });
      return;
    };
    TPDirect.card.getPrime(async(result) => {
      if (result.status !== 0) {
        addInputInvalidAll(tappayFields);
        showMsgModal(msgModalTrigger, { title: '信用卡錯誤', content: `${result.msg}` });
        return;
      };
      await postOrder({
        prime: result.card.prime,
        order: {
          price: orderTotalPrice,
          trip: bookings.map(booking => delete booking.price),
          contact: {
            name: buyerName,
            email: buyerEmail,
            phone: buyerPhone
          }
        }
      });
    });
    
  });
});
