import axios from 'axios';

const BASE_URL =  'http://api.nbp.pl/api/';

const getRouteWithParams = (route, params) => {
  const tmp = Object.keys(params).map(key => `${key}=${params[key]}`);
  return `${route}?${tmp.join('&')}`;
};

class RestService {
  constructor() {
    this.headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    };

    this.baseUrl = BASE_URL;
  }

  setBaseUrl(url) {
    this.baseUrl = url;
  }

  setHeaders(headers) {
    return this.headers = {
      ...this.headers,
      ...headers
    };
  }

  removeHeader(key) {
    delete this.headers[key];
  }

  get(route, params, url) {
    const newRoute = params ? getRouteWithParams(route, params) : route
    return this.xhr(newRoute, params, 'GET', url);
  }

  patch(route, params, url) {
    return this.xhr(route, params, 'PATCH', url);
  }

  post(route, params, url, headers) {
    if (headers) {
      return this.xhr(route, params, 'POST', url, headers);
    }

    return this.xhr(route, params, 'POST', url);
  }

  xhr(route, params, method, uri = this.baseUrl, requestHeaders) {
    let url = `${uri}${route}`;

    if (typeof URL !== 'undefined') {
      url = new URL(url).href;
    }

    const options = {
      headers: requestHeaders ? requestHeaders : this.headers,
      method,
      url,
    };

    if (typeof FormData !== 'undefined' && params) {
      options.data = params instanceof FormData ? params : JSON.stringify(params);
    }

    return (
      axios.get(url)
        // tslint:disable-next-line:no-any
        .then((response) => {
          switch (response.status) {
            case 200:
            case 201:
            case 204:
              return response.data;
            case 422: {
              return response.data.then((data) => {
                const message = data.message || 'An internal error has occured';
                return Promise.reject(new Error(message));
              });
            }
            case 401:
              return Promise.reject();
            default: {
              return Promise.reject(new Error(response.data));
            }
          }
        })
        // tslint:disable-next-line: no-any
        .catch((e) => {
          console.error('REQUEST FAILED: ', e);
          return Promise.reject(e);
        })
    );
  }
}

export default new RestService();
