const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/', (req, res) => {
  res.sendFile(path.join('index.html'));
});

router.post('/success', (req, res) => {
  var data = '{"status": "success"}';
  res.end(data);
});

router.post('/error', (req, res) => {
  var data = '{"status": "error", "reason": "Some strange mistake happened"}';
  res.statusCode = 500;
  res.end(data);
});

var status = 'progress';

router.post('/progress', (req, res) => {
  var data = status === 'progress' ?
    `{"status": "${status}", "timeout": 5000}` :
    '{"status": "success"}';
  console.log(status);

  res.end(data);
  setTimeout(function() {
    status = 'success';
  }, 10000);
});

module.exports = router;