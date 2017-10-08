var http = require('http'),
    url = require('url'),
    queryUtil = require('querystring'),
    fs = require('fs'),
    clients = [], //responses
    messages = require('./messages-util.js');

http.createServer(function (req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin' : '*',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE'
    });
    // parse URL
    var url_parts = url.parse(req.url);
    console.log(url_parts);
    console.log('inside req: ',req.method);

    if (req.method === 'POST') {
        console.log('inside POST');
        
        if(url_parts.pathname.substr(0, 9) == '/messages') { //new message
            console.log('inside /messages ');
            // message receiving
            var reqBody;
            req.on('data', function(data){        
                reqBody = JSON.parse(data);
            });
            req.on('end', function(){ 
                var msg = { name : reqBody.name, email : reqBody.email ,
                             message : reqBody.message , timestamp: reqBody.timestamp};
                // add message
                var counter = messages.addMessage(JSON.stringify(msg));
                console.log("id : ",counter,"msg : ",msg);
                while(clients.length > 0) {
                    var client = clients.pop();
                    client.end(JSON.stringify( {
                    count: counter,
                    append: [JSON.stringify(msg)] }));
                }
                res.end(JSON.stringify({id:counter})); //return count of msgs
            });
        }
    }   
    else if(req.method == 'GET'){
        console.log('inside GET');
        console.log('url_parts.path',url_parts.path.substr(0, 18));

        if(url_parts.pathname == '/') {
            // file serving
            fs.readFile('../client/index.html', function(err, data) {
                res.end(data);
            });
        } 
        
        else if(url_parts.path.substr(0, 18) == '/messages?counter=') { // polling
                var captured = /counter=([^&]+)/.exec(url_parts.path)[1]; // Value is in [1] ('384' in our case)
                var counter = captured ? captured : 0;     
                console.log('messages utills ', messages);           
                console.log('captured:',captured,'counter:',counter);               
                var msgCounter = messages.getMsgCounter();
                if(msgCounter > counter) {
                    console.log('inside messages.serverMsgs.length > counter');                
                    res.end(JSON.stringify({
                        count: msgCounter,
                        append: messages.getMessages(counter)}));
                } 
                else {
                    console.log('client push ');
                    clients.push(res);
                }
        }
        
        else if(url_parts.pathname.substr(0, 6) == '/stats') { //get statistics
                // todo
        }
        
        else {
            res.end("else end");
        }
    }
    else if(req.method == 'DELETE'){
    //todo
    }
    }).listen(9000, 'localhost');
console.log('Server running on port: '+ 9000);