import { checkUserState } from './utils.js'

document.addEventListener('DOMContentLoaded', async() => {
  console.log('booking page.');
  if (!await checkUserState()) { window.location.href = '/'; };
});
