import request from 'request';

export function sendData(options) {
  return new Promise(function(resolve, reject) {
    request(options, function (error, response, body) {
      if (error) throw new Error(erorr);
      if (error) reject(response);
      resolve(response);
    });
  });
}

// Isso não vou usar mais, pode ser útil no futuro
function parseCookies (set_cookie_string) {
  return new Promise(function(resolve, reject) {
    if (!set_cookie_string) reject(resolve);
    var list = {},
    rc = set_cookie_string[0]; // fix, get only a single cookie
    rc && rc.split(';').forEach(function( cookie ) {
      var parts = cookie.split('=');
      list[parts.shift().trim()] = decodeURI(parts.join('='));
    });
    console.log(list);
    resolve(list);
  });
}
