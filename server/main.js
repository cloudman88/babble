var http = require('http'),
    url = require('url'),
    queryUtil = require('querystring'),
    fs = require('fs'),
    clients = [], //responses
    md5 = require('md5'),
    messages = require('./messages-util.js');

http.createServer(function (req, res) {
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // parse URL
    var url_parts = url.parse(req.url);
    console.log('inside req: ',req.method);

    if (req.method === 'POST') {
        
        if(url_parts.pathname.substr(0, 9) == '/messages') { //new message        
            console.log('inside /messages ');
            // message receiving
            var reqBody;
            req.on('data', function(data){        
                reqBody = JSON.parse(data);
            });
            req.on('end', function(){ 
                var msg = { name : reqBody.name, email : reqBody.email ,
                             message : reqBody.message , timestamp: reqBody.timestamp,
                            emailHash: md5(reqBody.email)};
                // add message
                var counter = messages.addMessage(msg);
                console.log("id : ",counter,"msg : ",msg);
                while(clients.length > 0) {
                    var client = clients.pop();
                    client.end(JSON.stringify( {
                    count: counter,
                    append: [msg] }));
                }
                res.end(JSON.stringify({id:counter})); //return count of msgs
            });
        }

        if(url_parts.pathname.substr(0, 6) == '/login') { 
            //add user to users
            console.log('inside login ');
            // message receiving
            var reqBody;
            req.on('data', function(data){        
                reqBody = JSON.parse(data);
            });
            req.on('end', function(){ 
                // add message
                var counter = messages.addMessage(msg);
                console.log("id : ",counter,"msg : ",msg);

                res.end(JSON.stringify({id:counter})); //return count of msgs
            });
        }

    }   
    else if(req.method == 'GET'){        

        if(url_parts.pathname == '/') {
            // file serving
            fs.readFile('../client/index.html', function(err, data) {
                res.end(data);
            });
        } 
        
        else if(url_parts.path.substr(0, 18) == '/messages?counter=') { // polling
                var captured = /counter=([^&]+)/.exec(url_parts.path)[1];
                var counter = captured ? captured : 0;     
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

    else if (req.method == 'OPTIONS'){
        res.writeHead(204);
        res.end();
    }

    else if(req.method == 'DELETE'){
        if(url_parts.path.substr(0, 10) == '/messages/') {
                var id = url_parts.path.substr(10, url_parts.path.length); 
                console.log('id in delete: ',id);               
                messages.deleteMessage(id);
        }
        res.end(JSON.stringify(true));
    //todo
    }
    }).listen(9000, 'localhost');
console.log('Server running on port: '+ 9000);