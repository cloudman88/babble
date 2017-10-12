var http = require('http'),
    url = require('url'),
    queryUtil = require('querystring'),
    fs = require('fs'),
    clients = [], //responses
    statsResponses = [],
    md5 = require('md5'),
    usersCounter = 0,
    messages = require('./messages-util.js');

http.createServer(function (req, res) {
    res.setHeader('Content-Type', 'text/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // parse URL
    var url_parts = url.parse(req.url);
    console.log('inside req: ',req.method);

    if (req.method === 'POST') {        
        if ((url_parts.pathname.includes("messages?counter")) || //GET
            (url_parts.pathname.includes("stats")) || //GET
            (url_parts.pathname.includes("messages?")) || //GET
            (url_parts.pathname.includes("/messages/"))) { //DELETE
            methodNotAllowedError(res,url_parts.pathname,req.method);
        }

        else if(url_parts.pathname.substr(0, 9) == '/messages') { //new message        
            // message receiving
            var reqBody;
            req.on('data', function(data){        
                reqBody = JSON.parse(data);
            });
            req.on('end', function(){ 
                var msg = { name : reqBody.name, email : reqBody.email ,
                            message : reqBody.message , timestamp: reqBody.timestamp,
                            emailHash: md5(reqBody.email)};
                
                var counter = messages.addMessage(msg);            
                while(clients.length > 0) {
                    var client = clients.pop();
                    client.end(JSON.stringify( {
                    count: counter,
                    append: [msg] }));
                }
                 sendStatsResponses();
                res.end(JSON.stringify({id:counter})); //return count of msgs
            });
        }

        else if(url_parts.pathname.substr(0, 6) == '/login') { 
            req.on('data', function(data){
            });
            req.on('end', function(){
                usersCounter++;
                sendStatsResponses();                
                res.end();
            });
        }

        else if(url_parts.pathname.substr(0, 7) == '/logout') { 

            req.on('data', function(data){
            });
            req.on('end', function(){ 
                usersCounter--;
                sendStatsResponses();
                res.end();
            });
        }
        else {
            nonExistentURLError(res,url_parts.pathname);
        }

    }   
    else if(req.method == 'GET'){        
        if ((url_parts.pathname.includes("login")) || //POST
            (url_parts.pathname.includes("logout")) || //POST
            (url_parts.pathname.includes("/messages/")) || //DELETE
            (url_parts.pathname.includes("/messages" && !(url_parts.pathname.includes("messages?counter"))))  //POST
            ) {
                methodNotAllowedError(res,url_parts.pathname,req.method); 
        }

        else if(url_parts.pathname == '/') {
            // file serving
            fs.readFile('../client/index.html', function(err, data) {
                res.end(data);
            });
        }
        
        else if(url_parts.path.substr(0, 10) == '/messages?') { // polling
                if (url_parts.path.substr(0, 18) == '/messages?counter='){
                    var captured = /counter=([^&]+)/.exec(url_parts.path)[1];               
                    var counter = captured ? captured : 0;
                    if (isFinite(String(counter))==true){
                        var msgCounter = messages.getMsgCounter();
                        if(msgCounter > counter) {
                            res.end(JSON.stringify({
                                count: msgCounter,
                                append: messages.getMessages(counter)}));
                        }
                        else {
                            clients.push(res);
                        }
                    }
                    else{
                        badRequestError(res,url_parts.path,req.method);
                    } 
                }
                else{
                        badRequestError(res,url_parts.path,req.method);
                }
        }
        
        else if(url_parts.pathname.substr(0, 6) == '/stats') { //get statistics: num of messages and num of users                                            
                    statsResponses.push(res);
        }
        
        else {
            nonExistentURLError(res,url_parts.pathname);
        }
    }

    else if (req.method == 'OPTIONS'){                
        res.writeHead(204); //OPTIONS request (sometimes sent automatically by the browser)
        res.end();
    }

    else if(req.method == 'DELETE'){
         if ((url_parts.pathname.includes("login")) || //POST
            (url_parts.pathname.includes("logout")) || //POST
            (url_parts.pathname.includes("messages?")) || //GET
            (url_parts.pathname.includes("messages?counter")) || //GET
            (url_parts.pathname.includes("stats")) || //GET
            (url_parts.pathname.includes("/messages" && !(url_parts.pathname.includes("/messages/"))))  //POST
            ) {
               methodNotAllowedError(res,url_parts.pathname,req.method);
        }

        else if(url_parts.path.substr(0, 10) == '/messages/') {
                var id = url_parts.path.substr(10, url_parts.path.length); 
                 if (isFinite(String(id))==true){
                    var countBeforeDelete = messages.getMsgCounter();
                    messages.deleteMessage(id);
                    var countAfterDelete = messages.getMsgCounter();
                    if (countBeforeDelete > countAfterDelete){
                        sendStatsResponses();
                        res.end(JSON.stringify(true));          
                    }
                    else{
                        res.end(JSON.stringify(false));
                    }
                 }
                 else {
                     badRequestError(res,url_parts.path,req.method);
                 }
        }
        else{
          nonExistentURLError(res,url_parts.pathname);
        }
    //todo
    }
    }).listen(9000, 'localhost');
console.log('Server running on port: '+ 9000);

function sendStatsResponses(){
        while(statsResponses.length > 0) {
            var statsRes = statsResponses.pop();
            statsRes.end(JSON.stringify( {users:usersCounter , messages:messages.getMsgCounter()}));
        }
}

function methodNotAllowedError(res,path,reqMethod){
    console.log("method: ",path," is not allowed in request method of type ",reqMethod);
    res.writeHead(405);  //405 = method not allowed
    res.end(); 
}

function nonExistentURLError(res,path){
    console.log("URL: ",path,"  not found ");
    res.writeHead(404); // 404 = non-existent URLs (not found)
    res.end();
}

function badRequestError(res,path,reqMethod){
    console.log("Invalid data sent in URL: ",path," method typed ",reqMethod);
    res.writeHead(400); // 400 = bad request
    res.end();
}