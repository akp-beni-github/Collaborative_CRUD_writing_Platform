//basic exercise 
const express = require('express');
const app = express();
const port = 3000;

app.get('/word', (req, res) => {  //client make get request get from /root api endpoint //now server need to send something back so it handle request and send response back to client with helloworld
  res.send('Hello World!'); //server sernd back thru /root endpoint
});

app.get('/pic', (req, res) => {
    res.download("./testingpic.png");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

