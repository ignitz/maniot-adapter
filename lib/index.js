import express from 'express'; // server and api, router, etc
import bodyParser from 'body-parser'; // encode e decode json

import users from './routes/adapter/users';
import devices from './routes/adapter/devices';

const app = express();

/* configure body-Parser
******************************************/
// I have no idea what i'm doing
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080; // set our port

// Routes
var router = express.Router(); // instance of route

app.use('/api/adapter', users);
app.use('/api/adapter', devices);

// default route to GET
router.get('/', function (req, res) {
	res.json({ message: 'Welcome to API!' });
});

// Start Server
app.listen(8080, () => console.log("Running on localhost:8080"));
