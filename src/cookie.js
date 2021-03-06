'use strict';

const EMPTY = Object.create(null);

function parseCookieStr(name, val, options) {
  let str = `${name}=${encodeURIComponent(val)}`;
  options.maxAge && (str += '; Max-Age=' + options.maxAge);
  options.domain && (str += '; Domain=' + options.domain);
  options.path && (str += '; Path=' + options.path);
  options.httpOnly !== false && (str += '; HttpOnly');
  options.secure && (str += '; Secure');
  options.sameSite && (str += '; SameSite=Strict');
  return str;
}

class CookieStore {
  constructor(ctx) {
    this._cookie = ctx._originRequest.headers.cookie || '';
    this._cookieToSend = [];
  }
  get(name) {
    if (this._cookie === '') {
      return null;
    }
    let idx = 0;
    let c = 0;
    let p0 = 0;
    while(true) {
      idx = this._cookie.indexOf(name, idx);
      if (idx < 0) {
        return null;
      }
      p0 = idx + name.length;
      if (p0 >= this._cookie.length) {
        return null;
      }
      if (idx > 0) {
        c = this._cookie.charCodeAt(idx - 1);
        if (c !== 32 && c!== 61 && c !== 59) {
          idx = p0;
          continue;
        }
      }
      idx = p0;
      c = this._cookie.charCodeAt(idx);
      if (c === 32 || c === 61) {
        break;
      }
    }

    p0 = -1;
    let p1 = -1;
    while(idx < this._cookie.length) {
      c = this._cookie.charCodeAt(idx);
      if (p0 < 0 && c !== 32 && c !== 61) {
        p0 = idx;
      }
      if (c === 59) {
        p1 = idx;
        break;
      }
      idx++;
    }
    if (p0 < 0) {
      return '';
    }
    return this._cookie.substring(p0, p1 < 0 ? this._cookie.length : p1);
  }
  set(name, val, options = EMPTY) {
    this._cookieToSend.push(parseCookieStr(name, val, options));
  }
}

module.exports = CookieStore;
