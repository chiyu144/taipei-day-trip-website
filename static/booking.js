import { bookingApi } from './apis.js';
import { checkUserState } from './utils.js'

const getBooking = async() => {
  const res = await bookingApi('GET')
  if (res?.error) { window.location.href = '/'; };
  if (res?.ok) { return res.data; };
};
const deleteBooking = async(attractionId) => {
  const res = await bookingApi('DELETE', undefined, attractionId);
  if (res?.error) { window.location.href = '/'; };
  if (res?.ok) { window.location.reload(); };
};

document.addEventListener('DOMContentLoaded', async() => {
  if (!await checkUserState()) { window.location.href = '/'; };
  const data = await getBooking();
  console.log(data);
});
