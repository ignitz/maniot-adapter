import express from 'express';
import bodyParser from 'body-parser';
import { sendData } from '../../utils/message';
import { getIndicesOfRegex } from '../../utils/strings';

const router = express.Router();

let template_options = {
  'accept-language': 'pt-BR,en-US;q=0.8,pt;q=0.6,en;q=0.4',
  // TODO: make support gzip
  // 'accept-encoding': 'gzip, deflate, br',
  'accept-encoding': 'deflate, br',
  referer: 'https://painel.dcc.ufmg.br/midea/',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36',
}

// $scope.ligado = 1==0;
// $scope.temp = 25;
// $scope.swing = 1==0;
// $scope.fan = 4;
// if($scope.fan == 4) {
//     $scope.fan = 3;
// }
// $scope.fan_options = [
//             {id: 0, name: 'High'},
//             {id: 1, name: 'Medium'},
//             {id: 2, name: 'Low'},
//             {id: 3, name: 'Auto'},
// //            {id: 4, name: '???'},
//         ];

// get the list of available devices
router.get('/devices', (req, res) => {

  if (!req.headers.cookie) {
    res.status(400).json({ errors: { global: "No Cookie" } });
  }

  console.log(req.headers);

  let options = { method: 'GET',
    url: 'https://painel.dcc.ufmg.br/midea/',
    headers: {
      ...template_options,
      'cache-control': 'no-cache',
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'upgrade-insecure-requests': '1',
      cookie: req.headers.cookie,
    },
  };

  var promise = sendData(options);

  promise.then((response) => {
    let result = [];
    // TODO: Depois tratar gzip
    if (typeof response.body == "string") {
      let string_to_find = 'ng-click="detail\\(\\d+,true\\)';
      getIndicesOfRegex(string_to_find, response.body).forEach((item, index) => {
        let aux_string = response.body.substring(
          item,
          item + 100 < response.body.length ? item + 150 : response.body.length);

        result.push({
          id: aux_string.substring(aux_string.indexOf('(') + 1, aux_string.indexOf(',true')),
          room: aux_string.substring(aux_string.indexOf('>') + 1, aux_string.indexOf('</')),
        });
      });
    }

    res.status(200).json(result);
  }).catch((response) => {
    console.log(response);
    res.status(400).json({ errors: { global: "Error unknow" } });
  })
});

router.get('/devices/:id', (req, res) => {
  console.log('GET /devices/' + req.params.id);

  var options = { method: 'GET',
    url: 'https://painel.dcc.ufmg.br/midea/detail/' + req.params.id,
    headers: {
      ...template_options,
      referer: 'https://painel.dcc.ufmg.br/midea/',
      accept: 'application/json, text/plain, */*',
      cookie: req.headers.cookie,
    },
  };

  var promise = sendData(options);

  promise.then((response) => {
    res.json(JSON.parse(response.body));
  }).catch((response) => {
    console.log(response);
    res.status(400).json({ errors: { global: "Error unknow" } });
  })
});

/*
***************************************************
Nesta rota tem como objetivo enviar comandos para
o ar-condicionado.

O sistema é um pouco confuso mas descobri que é
para ter redundância. Após alguns testes descobri que:

ao enviar temos como atributos possíveis
{
 	"fan": {
		"number": 2
	},
	"ligado": "on",
	"swing": 0,
	"temp": 23
}

// ISSO pra API loka lá
Se o ligado for enviado então liga DUH.
Pra desligar é só não enviar o atributo.
swing é 0 ou 2... WTF???
temp é temperatura... e não temporário DUUUH
fan:number é:

{id: 0, name: 'High'}
{id: 1, name: 'Medium'}
{id: 2, name: 'Low'}
{id: 3, name: 'Auto'}
{id: 4, name: '???'}

O que esta rota faz é dar um GET nos dados (pra saber
quais estão setados) pra enviar de volta caso o
usuário não especifique quando for utilizar o POST.
***************************************************
*/
router.post('/devices/:id', (req, res) => {
  console.log('POST /devices/' + req.params.id);

  if (req.body.hasOwnProperty('ligado')) {
    // provavelmente ligado é ON.

    // Decidi que deve ser enviado obrigatóriamente pelo Maniot
    if (req.body.ligado != 'on' && req.body.ligado != 'off') { // insanity check
      throw new Error(erorr);
    }
  }

  var options = { method: 'GET',
    url: 'https://painel.dcc.ufmg.br/midea/detail/' + req.params.id,
    headers: {
      ...template_options,
      referer: 'https://painel.dcc.ufmg.br/midea/',
      accept: 'application/json, text/plain, */*',
      cookie: req.headers.cookie,
    },
  };

  // take default values
  // set the values in params
  // do the magic

  var promise = sendData(options);

  promise.then((response) => {
    let data = JSON.parse(response.body).device;
    let ligado, temp, swing, fan_number;
    let check_all_keys = true;

    ['onoff', 'estado', 'fan', 'wind_speed', 'set_temp', 'swing'].forEach(
      (item) => {
        check_all_keys &= data.hasOwnProperty(item);
      }
    );

    if (!check_all_keys) {
      console.log('check_all_keys');
      console.log(req);
      console.log(data);
      throw new Error(response);
    }

    ligado = data.onoff == 1 ? 1 : 0;
    fan_number = data.wind_speed;
    temp = data.set_temp;
    swing = data.swing;

    // get request and see what params are in there

    let default_params = {
      fan: {
        number: fan_number,
      },
      temp: temp,
    };

    if (req.body.ligado == 'on') { default_params.ligado = 'on'; };
    if (req.body.hasOwnProperty('swing')) { default_params.swing = data.swing; }
    if (req.body.hasOwnProperty('temp')) { default_params.temp = data.temp; }

    var options_set = { method: 'POST',
      url: 'https://painel.dcc.ufmg.br/midea/edit/' + req.params.id,
      headers: {
        'cache-control': 'no-cache',
        'accept-language': 'pt-BR,en-US;q=0.8,pt;q=0.6,en;q=0.4',
        'accept-encoding': 'gzip, deflate, br',
        referer: 'https://painel.dcc.ufmg.br/midea/edit/' + req.params.id,
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'content-type': 'application/x-www-form-urlencoded',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36',
        'upgrade-insecure-requests': '1',
        origin: 'https://painel.dcc.ufmg.br',
        cookie: req.headers.cookie,
      },
      form: default_params,
    };

    console.log(options_set);
    return sendData(options_set);
  }).then((response) => {
    console.log("Done");
    res.json(response);
  }).catch((response) => {
    console.log(response);
    res.status(400).json({ errors: { global: "Error unknow" } });
  })
});

export default router;
