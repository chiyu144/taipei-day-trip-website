const host = window.location.href;
const apiHeaders = {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
};

export const getAttractionsApi = async(page, keyword) => {
  try {
    const apiUrl = new URL('/api/attractions', host);
    apiUrl.searchParams.append('page', page);
    if (keyword) {
      apiUrl.searchParams.append('keyword', keyword)
    }
    const res = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: apiHeaders,
    });
    return res;
  } catch (err) {
    console.warn(err);
  }
};

export const getAttractionApi = async(id) => {
  try {
    const apiUrl = new URL(`/api/attraction/${id}`, host);
    const res = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: apiHeaders
    });
    return res;
  } catch (err) {
    console.warn(err);
  }
};