import { getAttractionIdApi } from './apis.js';
import { onImgLoaded, clearView } from './utils.js';

const getAttractionId = async(id) => {
  const res = await getAttractionIdApi(id);
  const attractionId = await res.json();
  return attractionId;
};

document.addEventListener('DOMContentLoaded', async () => {
  const attractionId = await getAttractions(nextPage, keyword);
  await getAttractionId(1);
  console.log(attractionId);
});