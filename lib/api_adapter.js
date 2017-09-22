import request from "request";

// Este módulo apenas imita o que o navegador faz no
// https://painel.dcc.ufmg.br/midea/
// Os TODOS: são coisas para que podemos colocar automaticamente

function sendData(options) {
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

export default {
  command: {
    turn: (res, on_off, username, password, whatMachine) => {

      // First get the login
      let options = { method: 'POST',
        url: 'https://painel.dcc.ufmg.br/midea/login',
        headers: 
         { 'postman-token': '81d56f7b-7fbf-ebcb-5984-6726de132b2d',
           'cache-control': 'no-cache',
           'accept-language': 'pt-BR,en-US;q=0.8,pt;q=0.6,en;q=0.4',
           'accept-encoding': 'gzip, deflate, br',
           referer: 'https://painel.dcc.ufmg.br/midea/',
           accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
           'content-type': 'application/x-www-form-urlencoded',
           'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36',
           'upgrade-insecure-requests': '1',
           'x-devtools-emulate-network-conditions-client-id': '300e2d6b-296e-49a3-b06c-4072defc48dd',
           origin: 'https://painel.dcc.ufmg.br' },
        form: {
          username: username,
          password: password
        }
      };

      var promise = sendData(options);
      // Faz o login, separa os cookies e depois liga a máquina de teste
      promise.then(function(response) {
        if (response.headers.location == 'https://painel.dcc.ufmg.br/midea/') {
          console.log('login OK');

          // TODO: how to detect these params?
          var params = {
            fan: 'number:3',
            temp: '22'
          }

          if (on_off == 'on') {
            params.ligado = 'on';
          }

          let options_to_send = { method: 'POST',
            url: 'https://painel.dcc.ufmg.br/midea/edit/' + whatMachine.toString(),
            headers: 
             { 'postman-token': '7e5fea71-e2a8-f042-9139-618799835e52',
               'cache-control': 'no-cache',
               cookie: response.headers['set-cookie'],
               'accept-language': 'pt-BR,en-US;q=0.8,pt;q=0.6,en;q=0.4',
               'accept-encoding': 'gzip, deflate, br',
               referer: 'https://painel.dcc.ufmg.br/midea/edit/198',
               accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
               'content-type': 'application/x-www-form-urlencoded',
               'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36',
               'upgrade-insecure-requests': '1',
               'x-devtools-emulate-network-conditions-client-id': '300e2d6b-296e-49a3-b06c-4072defc48dd',
               origin: 'https://painel.dcc.ufmg.br' },
            form: params
          }; // end options
          return sendData(options_to_send);
        }
        else {
          console.log('Login error!');
          res.json({ message: 'Error on login, check username or password' });
        }
      }).then(function(response) {
        console.log(response.headers);
        res.json(response);
      });

    },
  }
};
