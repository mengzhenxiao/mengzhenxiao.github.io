var express = require('express')
var app = express()
var fs = require('fs');


app.listen(8000, function () {
  console.log('Example app listening on port 8000!')
})

app.use('/im_week1',express.static('public'));
