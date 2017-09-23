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
router.get('/machines', (req, res) => {

  if (!req.headers.cookie) {
    res.status(400).json({ errors: { global: "No Cookie" } });
  }

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

router.get('/machines/:id', (req, res) => {
  console.log('GET /machines/' + req.params.id);

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

router.post('/machines/:id', (req, res) => {
  console.log('POST /machines/' + req.params.id);

  console.log(['ligado', 'swing', 'fan', 'temp'] in Object.keys(req.body));
  console.log(['swing', 'temp'] in Object.keys(req.body));

  var options = { method: 'POST',
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
  };




  // fan:number:2
  // ligado:on
  // swing:on
  // temp:23

  res.json(options);

  // take default values
  // set the values in params
  // do the magic

  // var promise = sendData(options);
  //
  // promise.then((response) => {
  //   res.json(response.body);
  // }).catch((response) => {
  //   console.log(response);
  //   res.status(400).json({ errors: { global: "Error unknow" } });
  // })
});

export default router;
