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
                
                var counter = messages.addMessage(msg);
                console.log("id : ",counter,"msg : ",msg);
                console.log("new msg clients.length : ",clients.length);
                
                while(clients.length > 0) {
                    var client = clients.pop();
                    client.end(JSON.stringify( {
                    count: counter,
                    append: [msg] }));
                }
                console.log('new msg statsResponses.length ',statsResponses.length);
                console.log('new msg responseBody in login ',{users:usersCounter , messages:messages.getMsgCounter()});
                
                try {
                    while(statsResponses.length > 0) {
                        console.log('new msg looop');
                        var statsRes = statsResponses.pop();
                        statsRes.end(JSON.stringify( {users:usersCounter , messages:messages.getMsgCounter()}));
                    }
                }
                catch(e){
                    console.log("error caught:",e);
                }

                res.end(JSON.stringify({id:counter})); //return count of msgs
            });
        }

        else if(url_parts.pathname.substr(0, 6) == '/login') { 
            //todo add user to users
            console.log('## inside login ');
            req.on('data', function(data){
                // reqBody = JSON.parse(data);
            });
            req.on('end', function(){
                usersCounter++;
                console.log('usersCounter after ++ ',usersCounter);
                console.log('statsResponses.length ',statsResponses.length);
                console.log('responseBody in login ',{users:usersCounter , messages:messages.getMsgCounter()});
                while(statsResponses.length > 0) {
                    console.log('looop');
                    var statsRes = statsResponses.pop();
                    statsRes.end(JSON.stringify( {users:usersCounter , messages:messages.getMsgCounter()}));
                }
                res.end(JSON.stringify(true));
            });
        }

        else if(url_parts.pathname.substr(0, 7) == '/logout') { 
            //todo add user to users
            console.log('## inside logout ');
            req.on('data', function(data){
             //   reqBody = JSON.parse(data);
            });
            req.on('end', function(){ 
                usersCounter--;
                console.log('usersCounter after -- ',usersCounter);    
                console.log('statsResponses.length  ',statsResponses.length);    
                console.log('responseBody in logout ',{users:usersCounter , messages:messages.getMsgCounter()});
                while(statsResponses.length > 0) {
                    var statsRes = statsResponses.pop();
                    statsRes.end(JSON.stringify( {users:usersCounter , messages:messages.getMsgCounter()}));
                }
                res.end();
            });
        }
        else {
            console.log('inside else!!!');
            console.log(req.url);
            res.writeHead(404); // 404 non-existent URLs (not found)
            res.end(); // 404 non-existent URLs (not found)
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
        
        else if(url_parts.pathname.substr(0, 6) == '/stats') { //get statistics: num of messages and num of users                                            
                    console.log('statsResponses push ');
                    statsResponses.push(res);
        }
        
        else {
            res.writeHead(404); // 404 non-existent URLs (not found)
            res.end();
        }
    }

    else if (req.method == 'OPTIONS'){
        res.writeHead(204); //OPTIONS request (sometimes sent automatically by the browser)
        res.end();
    }

    else if(req.method == 'DELETE'){
        if(url_parts.path.substr(0, 10) == '/messages/') {
                var id = url_parts.path.substr(10, url_parts.path.length); 
                console.log('id in delete: ',id);               
                var countBeforeDelete = messages.getMsgCounter();
                messages.deleteMessage(id);
                var countAfterDelete = messages.getMsgCounter();
                if (countBeforeDelete > countAfterDelete){
                    while(statsResponses.length > 0) {
                        var statsRes = statsResponses.pop();
                        statsRes.end(JSON.stringify( {users:usersCounter , messages:messages.getMsgCounter() }));
                    }
                    res.end(JSON.stringify(true));          
                }
                else{
                    res.end(JSON.stringify(false));
                }
        }
        else{
           res.writeHead(404); // 404 non-existent URLs (not found)
            res.end();
        }
    //todo
    }
    }).listen(9000, 'localhost');
console.log('Server running on port: '+ 9000);