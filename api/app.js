const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 5000;

const { getAuthCode } = require('./methods');

// CORs
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(
  bodyParser.json(),
  bodyParser.urlencoded({
    extended: true
  })
);

app.get('/', (req, res) => {
  res.status(200).send('online');
});

app.get('/auth-code', getAuthCode);

app.listen(port, () => {
  console.log(`App running... on port ${port}`);
});