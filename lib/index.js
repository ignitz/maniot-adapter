import express from 'express'; // server and api, router, etc
import bodyParser from 'body-parser'; // encode e decode json
import api_adapter from './api_adapter';

var api = express();

// configure body-parser
api.use(bodyParser.urlencoded({ extended: true }));
api.use(bodyParser.json());

var port = process.env.PORT || 8080; // set our port

// Routes
var router = express.Router(); // instance of route

// default route to GET
router.get('/', function (req, res) {
	res.json({ message: 'Welcome to API!' });
});

// Routes de Login
router.route('/turnon')
  .get(function (req, res) {
    res.json({ message: 'Nope' });
  })
  .post(function (req, res) {
    console.log('turnon');
    console.log(req.body);
    api_adapter.command.turn(res, 'on', req.body.username, req.body.password, 196);
  });

router.route('/turnoff')
  .get(function (req, res) {
    res.json({ message: 'Nope' });
  })
  .post(function (req, res) {
    console.log('turnoff');
    console.log(req.body);
    api_adapter.command.turn(res, 'off', req.body.username, req.body.password, 196);
  });

// register routes
api.use('/api', router);

// start server
api.listen(port);
console.log('Magic happens on port ' + port);