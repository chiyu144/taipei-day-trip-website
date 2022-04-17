import { getOrderDetailApi } from './apis.js';

const getOrderDetail = async(orderNumber) => {
  if(!orderNumber) { window.location.href = '/' };
  const data = await getOrderDetailApi(orderNumber);
  return data;
}

document.addEventListener('DOMContentLoaded', async() => {
  const orderNumber = new URL(window.location.href).searchParams.get('number');
  const orderDetail = await getOrderDetail(orderNumber);
  const orderBriefWrap = document.querySelector('#wrap-order-brief');
  const orderBriefFailed = document.querySelector('#failed-order-brief');
  const orderBriefNumber = document.querySelector('#number-order-brief');
  const thankyouButton = document.querySelector('.button-thankyou');

  const render = () => {
    if (orderDetail?.data?.length > 0) {
      orderDetail.data.forEach(({ number, status, price, trip, contact }) => {
        orderBriefNumber.textContent = number;
      });
    } else {
      orderBriefWrap.style.display = 'none';
      orderBriefFailed.style.display = 'block';
      orderBriefFailed.textContent = `${orderDetail.message}`;
    }
  };

  render();
  thankyouButton.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = '/';
  })
});