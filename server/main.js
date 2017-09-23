
var http = require('http'),
url = require('url'),
queryUtil = require('querystring'),
port = 9000;

fs = require('fs'),
clients = [],
messages = [];

http.createServer(function (req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin' : '*',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE'
    });
    // parse URL
    var url_parts = url.parse(req.url);
    console.log(url_parts);
    console.log('inside req ');

    if (req.method === 'POST') {
        console.log('inside POST');
        if(url_parts.pathname.substr(0, 9) == '/messages') { //new message
            console.log('inside /messages ');
            // message receiving
            console.log('url_parts.pathname: ',url_parts.pathname);
            var msg = unescape(url_parts.pathname.substr(10));
            console.log('POST msg: ',msg);
            messages.push(msg);
            console.log('client.lenght: ',clients.length);
            while(clients.length > 0) {
                var client = clients.pop();
                client.end(JSON.stringify( {
                count: messages.length,
                append: msg+"\n"}));
            }
            res.end("msg end");
        }
    }   
    else if(req.method == 'GET'){
        console.log('inside GET');
        if(url_parts.pathname == '/') {
            // file serving
            fs.readFile('../client/index.html', function(err, data) {
                res.end(data);
            });
        } 
        else if(url_parts.pathname.substr(0, 5) == '/poll') { //change to /messages?counter=XX 
                console.log('inside /poll');
                // polling code here
                var count = url_parts.pathname.replace(/[^0-9]*/, '');
                console.log('count in /poll:',count);
                console.log('the messages: ',messages);
                if(messages.length > count) {
                    console.log('inside messages.length > count');
                    res.end(JSON.stringify({count: messages.length,append: messages.slice(count).join("\n")+"\n"}));
                } 
                else {
                    console.log('client push ');
                    clients.push(res);
                    res.end('{}');
                }
        }else if(url_parts.pathname.substr(0, 6) == '/stats') { //get statistics
                // todo
        }
        else {
            res.end("else end");
        }
    }
    else if(req.method == 'DELETE'){
    //todo
    }
    }).listen(port, 'localhost');
console.log('Server running on port: '+ port);