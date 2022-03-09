import { getAttractionsApi } from './apis.js';
import { onImgLoaded, clearView } from './utils.js';

let nextPage = 0;
let keyword = undefined;
let isLoading = true;
const containerAttractions = document.querySelector('#container-attractions');
const attractionsRow = document.querySelector('#container-attractions > .grid > .row');
const wrapLoader = document.querySelector('.wrap-center');
const msgHint = document.querySelector('.msg-hint');
const sentinel = document.querySelector('.sentinel');

const getAttractions = async(page, keyword) => {
  const res = await getAttractionsApi(page, keyword);
  const attractions = await res.json();
  nextPage = attractions.nextPage;
  console.log(nextPage);
  return attractions;
};
const render = attractions => {
  msgHint.style.display = 'none';
  const fragment = document.createDocumentFragment();
  attractions.data.forEach(({ name, category, mrt, images }, index) => {
    const attraction = document.createElement('div');
    attraction.classList.add('attraction', 'col-xs-12', 'col-md-6', 'col-lg-4', 'col-3', 'col');
    if(index === attractions.data.length - 1) {
      attraction.style.marginRight = 'auto';
    } 
    const link = document.createElement('a');
    
    const thumbnailWrap = document.createElement('div');
    thumbnailWrap.classList.add('wrap-attraction-thumbnail');
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
  attractionsRow.appendChild(fragment);
  wrapLoader.style.display = 'none';
  isLoading = false;
};
const searchAttractionId = async(e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  keyword = !formData.get('search-attraction-name') ? undefined : formData.get('search-attraction-name');
  if(keyword) {
    isLoading = true;
    clearView(attractionsRow);
    wrapLoader.style.display = 'block';
    const attractions = await getAttractions(0, String(keyword));
    if (attractions.data.length > 0) {
      render(attractions);
    } else {
      wrapLoader.style.display = 'none';
      msgHint.textContent = `找不到名字包含 '${keyword}' 的景點。`
      msgHint.style.display = 'block';
    };
  };
  document.querySelector('#search-attraction-name').value = '';
};

document.addEventListener('DOMContentLoaded', async () => {
  const attractions = await getAttractions(nextPage, keyword);
  const formAttractionId = document.querySelector('#form-attraction-id');
  const footer = document.querySelector('footer');
  const footerIO = new IntersectionObserver(async(e) => {
    if(e[0].isIntersecting && nextPage !== null && !isLoading && window.location.pathname === '/') {
      isLoading = true;
      console.log(`keyword: ${keyword}`);
      sentinel.classList.add('sentinel-index');
      sentinel.appendChild(wrapLoader);
      wrapLoader.style.display = 'block';
    
      const moreAttractions = await getAttractions(nextPage, keyword);
      render(moreAttractions);
  
      sentinel.classList.remove('sentinel-index');
      containerAttractions.appendChild(wrapLoader);
    }
  }, { threshold: [1] });
  render(attractions);
  footerIO.observe(footer);
  formAttractionId.addEventListener('submit', searchAttractionId);
});