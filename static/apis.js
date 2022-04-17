const host = window.location.href;
const apiHeaders = {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
};

export const getAttractionsApi = async(page, keyword) => {
  try {
    const apiUrl = new URL('/api/attractions', host);
    apiUrl.searchParams.append('page', page);
    keyword && apiUrl.searchParams.append('keyword', keyword);
    const res = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: apiHeaders,
    });
    const data = await res.json();
    if (res.ok) { return data; }
    else { throw `${res.status} ${res.statusText}`; };
  } catch (err) {
    console.warn(err);
  };
};
export const getAttractionSpotApi = async(id) => {
  try {
    const apiUrl = new URL(`/api/attraction/${id}`, host);
    const res = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: apiHeaders
    });
    const data = await res.json();
    if (res.ok) { return data; }
    else { throw `${res.status} ${res.statusText}`; };
  } catch (err) {
    console.warn(err);
  };
};
export const userApi = async(method, bodyObj = undefined) => {
  try {
    const apiUrl = new URL('/api/user', host);
    const res = await fetch(apiUrl.toString(), {
      method: `${method}`,
      headers: apiHeaders,
      body: bodyObj ? JSON.stringify(bodyObj) : undefined
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn(err);
  };
};
export const bookingApi = async(method, bodyObj = undefined, attractionId = undefined) => {
  try {
    const apiUrl = new URL('/api/booking', host);
    attractionId && apiUrl.searchParams.append('id', attractionId);
    const res = await fetch(apiUrl.toString(), {
      method: `${method}`,
      headers: apiHeaders,
      body: bodyObj ? JSON.stringify(bodyObj) : undefined
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn(err);
  };
};
export const ordersApi = async(method, bodyObj = undefined) => {
  try {
    const apiUrl = new URL('/api/orders', host);
    const res = await fetch(apiUrl.toString(), {
      method: `${method}`,
      headers: apiHeaders,
      body: bodyObj ? JSON.stringify(bodyObj) : undefined
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn(err);
  };
};
export const getOrderDetailApi = async(number) => {
  try {
    const apiUrl = new URL(`/api/order/${number}`, host);
    const res = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: apiHeaders
    });
    const data = await res.json();
    if (res.ok) { return data; }
    else { throw `${res.status} ${res.statusText}`; };
  } catch (err) {
    console.warn(err);
  }
}