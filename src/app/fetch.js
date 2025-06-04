import { config } from '../conf'
import { isDev, limitString } from '../util';
import { remapUrl } from './remapurl.js';
import * as LOG from '../log';

const PROXY_DISABLED = "proxy-disabled";

const DIRECT = "direct";
const HTTP_PROXY = "http-proxy";
const HTTPS_PROXY = "https-proxy";

const DROPBOX_HTML_ERROR = "Dropbox is returning HTML content.";
const GDRIVE_HTML_ERROR = "Google Drive is returning HTML content.";

export function getProxyToUrl(url) {
  let P = config.getCorsProxy() ?
    ((config.isPublicServer() ? "" : window.location.host) + config.getCorsProxy()) : null;
  if (isDev() && config.getCorsProxyDev()) {
    P = config.getCorsProxyDev();
  }
  return (P && P.length > 0) ? `http${window.location.protocol === "https:" ? "s" : ""}://${P}${encodeURIComponent(encodeURI(url))}` : url;
}

export function getContentDispositionFilename(headers) {
  const disposition = headers['content-disposition'];
  if (disposition) {
    //const matches = /filename\*?=['"]?(?:UTF-\d['"]*)?([^;\r\n"']*)['"]?;?/gim.exec(disposition);
    const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/gim.exec(disposition);
    if (matches.length > 1) {
      let match = matches[1];
      match = match.trim();
      if (match.length > 0) {
        // Strip leading quote
        if (match[0] === '"' ||  match[0] === '\'') {
          match = match.substring(1);
        }
        // Strip trailing quote
        if (match.length > 0) {
          if (match[match.length - 1] === '"' || match[match.length - 1] === '\'') {
            match = match.substring(0, match.length - 1);
          }
        }
        console.log(match);
        return match;
      }
    }
  }
  return null;
}

export class FetchAppData {
  constructor(url, addPrefix = false) {
    this.url = remapUrl(url);

    if (addPrefix) {
      // Append https (if not specified)
      const trimmed = this.url.trim();
      const hasScheme = /^https?:\/\//i.test(trimmed);
      this.url =  hasScheme ? trimmed : `https://${trimmed}`;
    }

    this.retries = 1;
    this.proxyDisabled = false;
    this.successMethod = null;
    this.method = null;
    this.updatedUrl = null;
    this.dropboxHtmlIssue = false;
    this.htmlRetries = 10;
  }

  // getRedirect() {
  //   return new Promise((resolve, reject) => {
  //     console.log(this.url)
  //     try {
  //      var xhr = new XMLHttpRequest();
  //      xhr.onload = function() {
  //       alert('onload');
  //        const responseURL = this.responseURL;
  //        if (responseURL != this.url) {
  //         resolve(remapUrl(responseURL));
  //        } else {
  //         resolve(null);
  //        }
  //      }
  //      xhr.onerror= function(e) {
  //       console.log(e);
  //       reject("Error determining redirect");
  //      }
  //      xhr.open('HEAD', this.url, true);
  //     } catch (e) {
  //       console.log(e);
  //       reject("Error determining redirect");
  //     }
  //     xhr.send();
  //   });
  // }

  //P = (isDev() ? (config.getLocalIp() + "/?y=") : config.getCorsProxy());
  P = config.getCorsProxy() ?
    ((config.isPublicServer() ? "" : window.location.host) + config.getCorsProxy()) :
    null;

  getSuccessMethod() {
    return this.successMethod;
  }

  setMethod(method) {
    this.method = method;
  }

  getHeaders(res) {
    const headers = res.headers;
    const headerObj = {};
    if (headers) {
      const keys = headers.keys();
      let header = keys.next();
      while (header.value) {
        headerObj[header.value] = headers.get(header.value);
        header = keys.next();
      }
    }
    return headerObj;
  };

  setRetries(retries) {
    this.retries = retries;
    return this;
  }

  setProxyDisabled(disabled) {
    this.proxyDisabled = disabled;
    return this;
  }

  isProxyDisabled() {
    return this.proxyDisabled || !this.P || this.P.length === 0;
  }

  getFilename(res) {
    const headers = this.getHeaders(res);
    if (headers) {
      return getContentDispositionFilename(headers);
    }
    return null;
  }

  // async fetch(props) {
  //   try {
  //     const redirect = await this.getRedirect();
  //     console.log("#### redirect: " + redirect);
  //     if (redirect !== null) {
  //       return await this._fetch(props, redirect);
  //     }
  //   } catch (e) {
  //   }

  //   return await this._fetch(props, this.url);
  // }

  async fetch(props) {
    let { P } = this;
    const { retries, proxyDisabled } = this;
    let url = this.url;
    const s = url.toLowerCase().startsWith("https");
    const h = s => (s ? "https://" : "http://");

    // try {
    //   const redirect = await this.getRedirect();
    //   console.log("#### redirect: " + redirect);
    //   if (redirect !== null) {
    //     // return await this._fetch(props, redirect);
    //   }
    // } catch (e) {
    // }

    if (isDev() && config.getCorsProxyDev()) {
      P = config.getCorsProxyDev();
    }

    const getText = async r => {
      const text = await r.text();
      if (r.status === 404) {
        return "404 (Not found)";
      }
      return `${r.status}: ${limitString(text, 80)}`;
    };

    const checkDropboxHtml = async (res) => {
      const isDropbox = url.indexOf("dropbox") !== -1;
      const isGDrive = url.indexOf("drive.google.com") !== -1;

      if (isDropbox || isGDrive) {
        const headers = this.getHeaders(res);
        const ctype = headers["content-type"];
        const disposition = headers["content-disposition"];
        if (ctype && (disposition === undefined) && (ctype.indexOf("text/html") !== -1)) {
          if (isGDrive) {
            const body = await res.text();
            const search = "name=\"uuid\" value=\"";
            const idIndex = body.indexOf(search);
            let uuid = null;
            if (idIndex !== -1) {
              uuid = body.substring(search.length + idIndex);
              const qidx = uuid.indexOf("\"");
              if (qidx !== -1) {
                uuid = uuid.substring(0, qidx);
              }
              const idx = url.indexOf("?");
              if (idx !== -1) {
                this.updatedUrl = `https://drive.usercontent.google.com/download${url.substring(idx)}&uuid=${uuid}`;
                throw GDRIVE_HTML_ERROR;
              }
            }
          } else {
            this.dropboxHtmlIssue = true;
            throw DROPBOX_HTML_ERROR;
          }
        }
      }
    }

    const doFetch = async url => {
      const res = await fetch(url, props);
      if (res.ok) {
        return res;
      } else {
        throw new Error(await getText(res));
      }
    }

    const directFetch = async (url) => {
      res = await doFetch(url);
      await checkDropboxHtml(res);
      if (!res) throw new Error("result is undefined");
      this.successMethod = DIRECT;
      return res;
    }

    const httpProxyFetch = async (url) => {
      if (!this.isProxyDisabled()) {
        res = await doFetch(`${h(s)}${P}${encodeURIComponent(encodeURI(url))}`);
        await checkDropboxHtml(res);
        if (!res) throw new Error("result is undefined");
        this.successMethod = HTTP_PROXY;
        return res;
      }
      throw Error(PROXY_DISABLED);
    }

    const httpsProxyFetch = async (url) => {
      if (!this.isProxyDisabled()) {
        res = await doFetch(`${h(!s)}${P}${encodeURIComponent(encodeURI(url))}`);
        await checkDropboxHtml(res);
        if (!res) throw new Error("result is undefined");
        this.successMethod = HTTPS_PROXY;
        return res;
      }
      throw Error(PROXY_DISABLED);
    }

    const methods = [];
    if (this.method === DIRECT) {
      methods.push(directFetch);
    } else if (this.method === HTTP_PROXY) {
      methods.push(httpProxyFetch);
    } else if (this.method === HTTPS_PROXY) {
      methods.push(httpsProxyFetch);
    }

    if (this.method !== DIRECT) {
      methods.push(directFetch);
    }
    if (this.method !== HTTP_PROXY) {
      methods.push(httpProxyFetch);
    }
    if (this.method !== HTTPS_PROXY) {
      methods.push(httpsProxyFetch);
    }

    let res = null;
    let error = null;
    for (let x = 0; x <= retries; x++) {
      if (x > 0) {
        LOG.info("Retry: " + x);
      }
      try {
        return await methods[0](url);
      } catch (e) {
        if (e.message !== PROXY_DISABLED) {
          LOG.error(e);
          error = e;
        }
        try {
          return await methods[1](url);
        } catch (e) {
          if (e.message !== PROXY_DISABLED) {
            LOG.error(e);
            error = e;
          }
          try {
            return await methods[2](url);
          } catch (e) {
            if (e.message !== PROXY_DISABLED) {
              LOG.error(e);
              error = e;
            }
          }
        }
      }

      if (this.dropboxHtmlIssue) {
        this.dropboxHtmlIssue = false;
        LOG.info("Dropbox HTML content issue.")
        if (this.htmlRetries-- > 0) {
          LOG.info("Retrying Dropbox HTML error...: " + (this.htmlRetries + 1));
          x = 0;
        }
      }

      if (this.updatedUrl && this.updatedUrl !== url) {
        url = this.updatedUrl;
        LOG.info("Updated URL: " + url);
        if (this.htmlRetries-- > 0) {
          LOG.info("Retrying HTML error...: " + (this.htmlRetries + 1));
          x = 0;
        }
      }
    }

    throw error;
  }
}
