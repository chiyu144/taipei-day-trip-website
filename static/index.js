import { getAttractionsApi } from './apis.js';
import { onImgLoaded, clearView } from './utils.js';

let nextPage = 0;
let keyword = undefined;
let isLoading = true;

const getAttractions = async(page, keyword) => {
  const res = await getAttractionsApi(page, keyword);
  const attractions = await res.json();
  nextPage = attractions.nextPage;
  return attractions;
};

document.addEventListener('DOMContentLoaded', async () => {
  const rowAttractions = document.querySelector('#container-attractions > .grid > .row');
  const msgHint = document.querySelector('.msg-hint');
  const wrapLoader = document.querySelector('.wrap-center');
  const containerAttractions = document.querySelector('#container-attractions');
  const sentinel = document.querySelector('.sentinel');
  const formSearchAttraction = document.querySelector('#form-search-attraction');
  const attractions = await getAttractions(nextPage, keyword);
  const footer = document.querySelector('footer');

  const render = attractions => {
    msgHint.style.display = 'none';
    const fragment = document.createDocumentFragment();
    attractions.data.forEach(({ id, name, category, mrt, images }, index) => {
      const attraction = document.createElement('div');
      attraction.classList.add('attraction', 'col-xs-12', 'col-md-6', 'col-lg-4', 'col-3', 'col');
      if(index === attractions.data.length - 1) {
        attraction.style.marginRight = 'auto';
      } 
      const link = document.createElement('a');
      link.classList.add('link-attraction');
      link.href = `./attraction/${id}`;
      
      const wrapThumbnail = document.createElement('span');
      wrapThumbnail.classList.add('wrap-thumbnail-attraction');
      const thumbnail = document.createElement('img');
      thumbnail.classList.add('thumbnail-attraction');
      thumbnail.src = images[0];
      onImgLoaded(thumbnail);
      
      const title = document.createElement('a');
      title.classList.add('title-attraction');
      title.textContent = name;
      title.href = `./attraction/${id}`;
    
      const subtitle = document.createElement('div');
      subtitle.classList.add('subtitle-attraction', 'row');
      const mrtName = document.createElement('div');
      mrtName.classList.add('col');
      mrtName.textContent = mrt;
      const categoryName = document.createElement('div');
      categoryName.classList.add('col');
      categoryName.textContent = category;
      categoryName.style.textAlign = 'end';
    
      wrapThumbnail.appendChild(thumbnail);
      link.appendChild(wrapThumbnail);
      subtitle.appendChild(mrtName);
      subtitle.appendChild(categoryName);
      
      attraction.appendChild(link);
      attraction.appendChild(title);
      attraction.appendChild(subtitle);
      fragment.appendChild(attraction);
    });
    rowAttractions.appendChild(fragment);
    wrapLoader.style.display = 'none';
    isLoading = false;
  };

  const searchAttractionId = async(e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    keyword = !formData.get('search-attraction') ? undefined : formData.get('search-attraction');
    if(keyword) {
      isLoading = true;
      clearView(rowAttractions);
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
    document.querySelector('#search-attraction').value = '';
  };

  const footerIO = new IntersectionObserver(async(e) => {
    if(e[0].isIntersecting && nextPage !== null && !isLoading && window.location.pathname === '/') {
      isLoading = true;
      sentinel.classList.add('sentinel-attractions');
      sentinel.appendChild(wrapLoader);
      wrapLoader.style.display = 'block';
      const moreAttractions = await getAttractions(nextPage, keyword);
      render(moreAttractions);
  
      sentinel.classList.remove('sentinel-index');
      containerAttractions.appendChild(wrapLoader);
    }
  }, { threshold: [0.98] });

  render(attractions);
  footerIO.observe(footer);
  formSearchAttraction.addEventListener('submit', searchAttractionId);
  window.addEventListener('popstate', () => {
    console.log('index popstate');
  })
});