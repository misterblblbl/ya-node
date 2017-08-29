const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');
const path = require('path');

const port = 7777;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));

app.use('/', routes);

app.set('port', port);
const server = app.listen(app.get('port'), () => {
  console.log(`Express running → PORT ${server.address().port}`);
});