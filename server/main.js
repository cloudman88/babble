
var http = require('http'),
url = require('url'),
queryUtil = require('querystring');

fs = require('fs'),
clients = [],
messages = ["first msg"];

http.createServer(function (req, res) {
   // parse URL
   var url_parts = url.parse(req.url);
   console.log(url_parts);

if (req.method === 'POST') {
        var requestBody = '';
        req.on('data', function(chunk) {
                        console.log('chucnk ', chunk);
            requestBody += chunk.toString();
        });
        req.on('end', function() {
            var data = queryUtil.parse(requestBody);
            console.log('we have all the data ', data);
                messages.push(requestBody);
    while(clients.length > 0) {
    var client = clients.pop();
    client.end(JSON.stringify( {
    count: messages.length,
    append: requestBody+"\n"}));
}  
        })
        

    }
   
   if(url_parts.pathname == '/') {
      // file serving
      fs.readFile('../client/index.html', function(err, data) {
         res.end(data);
      });
   } 
   else if(url_parts.pathname.substr(0, 5) == '/poll') {
        // polling code here
    var count = url_parts.pathname.replace(/[^0-9]*/, '');
    console.log(count);
    if(messages.length > count) {
        res.end(JSON.stringify( {
        count: messages.length,
        append: messages.slice(count).join("\n")+"\n"
        }));
    } 
    else {
        clients.push(res);
    } 
   }
   else if(url_parts.pathname.substr(0, 5) == '/msg/') {
   // message receiving
   var msg = unescape(url_parts.pathname.substr(5));
    messages.push(msg);
    while(clients.length > 0) {
    var client = clients.pop();
    client.end(JSON.stringify( {
    count: messages.length,
    append: msg+"\n"}));
  }
  res.end();
}}).listen(8080, 'localhost');
console.log('Server running.');

/*
var http = require('http');
var urlUtil = require('url');
var queryUtil = require('querystring');

var server = http.createServer(function(request, response) {

    response.setHeader('Access-Control-Allow-Origin', '*');

    if (request.method === 'GET') {
                    console.log('inside GET ');

        var url = urlUtil.parse(request.url);
        var data = queryUtil.parse(url.query);
        console.log(data.message);
        if (!data.message) {
            response.writeHead(400);
        }
        response.end();
    } else if (request.method === 'POST') {
        console.log('inside POST ');
        var requestBody = '';
        request.on('data', function(chunk) {
            requestBody += chunk.toString();
        });
        request.on('end', function() {
            var data = queryUtil.parse(requestBody);
            console.log('we have all the data ', data);
            response.end('thank you');
        });
    } else {
        response.writeHead(405);
        response.end();
    }
});

server.listen(9097);
console.log('listening...');
*/
