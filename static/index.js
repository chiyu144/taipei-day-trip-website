import { getAttractionsApi } from './apis.js';
import { onImgLoaded } from './utils.js';

let page = 0;
let keyword = undefined;

const getAttractions = async(page, keyword) => {
  const res = await getAttractionsApi(page, keyword);
  const attractions = await res.json();
  return attractions;
};

const render = attractions => {
  const row = document.querySelector('#attractions-container > .grid > .row');
  const fragment = document.createDocumentFragment();

  attractions.data.forEach(({ name, category, mrt, images }) => {
    const attraction = document.createElement('div');
    attraction.classList.add('attraction', 'col-xs-12', 'col-md-6', 'col-lg-4', 'col-3', 'col');
    
    const link = document.createElement('a');
    
    const thumbnailWrap = document.createElement('div');
    thumbnailWrap.classList.add('attraction-thumbnail-wrap');
    const thumbnail = document.createElement('img');
    thumbnail.classList.add('attraction-thumbnail');
    thumbnail.src = images[0];
    onImgLoaded(thumbnail);
    
    const title = document.createElement('div');
    title.classList.add('attraction-title');
    title.textContent = name;
  
    const subtitle = document.createElement('div');
    subtitle.classList.add('attraction-subtitle', 'row');
    const mrtName = document.createElement('div');
    mrtName.classList.add('col');
    mrtName.textContent = mrt;
    const categoryName = document.createElement('div');
    categoryName.classList.add('col');
    categoryName.textContent = category;
    categoryName.style.textAlign = 'end';
  
    thumbnailWrap.appendChild(thumbnail);
    link.appendChild(thumbnailWrap);
    link.appendChild(title);
    subtitle.appendChild(mrtName);
    subtitle.appendChild(categoryName);
    
    attraction.appendChild(link);
    attraction.appendChild(subtitle);
    fragment.appendChild(attraction);
  });
  row.appendChild(fragment);
}

document.addEventListener('DOMContentLoaded', async () => {
  console.log('YOOOOOO', 'app.js', window.location.href);
  const attractions = await getAttractions(page, keyword);
  render(attractions);
});