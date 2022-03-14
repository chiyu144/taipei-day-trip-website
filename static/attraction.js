import { getAttractionApi } from './apis.js';
import { onImgLoaded, clearView, Carousel } from './utils.js';

let attractionUrl = new URL(window.location);
let id = attractionUrl.pathname.split('/')[2];

const getAttraction = async(id) => {
  const res = await getAttractionApi(id);
  const detail = await res.json();
  return detail;
};

document.addEventListener('DOMContentLoaded', async () => {
  const detail = await getAttraction(id);
  console.log(detail.data);
  new Carousel('carousel-detail').init();
});