import express from 'express';
import { sendData } from '../../utils/message';

const router = express.Router();

router.post('/login', (req, res) => {
  // TODO: check if have username and password
  let username = req.body.username;
  let password = req.body.password;

  let options = { method: 'POST',
    url: 'https://painel.dcc.ufmg.br/midea/login',
    headers:
     {
       'cache-control': 'no-cache',
       'accept-language': 'pt-BR,en-US;q=0.8,pt;q=0.6,en;q=0.4',
       'accept-encoding': 'gzip, deflate, br',
       referer: 'https://painel.dcc.ufmg.br/midea/',
       accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
       'content-type': 'application/x-www-form-urlencoded',
       'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36',
       'upgrade-insecure-requests': '1',
       origin: 'https://painel.dcc.ufmg.br' },
  };

  options = {...options,
    form: {
    username: username,
    password: password
  }}

  var promise = sendData(options);

  promise.then((response) => {
    if (response.headers.location == 'https://painel.dcc.ufmg.br/midea/') {
      res.status(200).json({
        message: "OK",
        cookies: response.headers['set-cookie'] });
    }
    else {
      throw new Error(erorr);
    }
  }).catch((response) => {
    console.log('Erro');
    res.status(400).json({ errors: { global: "Invalid credentials" } });
  });
});

export default router;
