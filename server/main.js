var http = require('http'),
url = require('url'),
queryUtil = require('querystring'),
port = 9000;

fs = require('fs'),
clients = [], //responses
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
    console.log('inside req: ',req.method);

    if (req.method === 'POST') {
        console.log('inside POST');
        if(url_parts.pathname.substr(0, 9) == '/messages') { //new message
            console.log('inside /messages ');
            // message receiving
            // console.log('url_parts.pathname: ',url_parts.pathname);
            var reqDetails;
            req.on('data', function(data){
              //  console.log('req data: ',data.toString());
                reqDetails = JSON.parse(data);
            });
            req.on('end', function(){
               // console.log("req end");
                var msg = { name : reqDetails.name, email : reqDetails.email , message : reqDetails.message};
                // add message
                messages.push(JSON.stringify(msg));
                console.log("msg : ",msg);
                console.log("msg stringify: ",JSON.stringify(msg));
                console.log("messages: ",messages);
               // console.log("messages parse: ",JSON.parse(messages));
                while(clients.length > 0) {
                    var client = clients.pop();
                    client.end(JSON.stringify( {
                    count: messages.length,
                    append: [JSON.stringify(msg)] }));
                }
                res.end(JSON.stringify({id:42}));
            });


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
                // polling code here
                var count = url_parts.pathname.replace(/[^0-9]*/, '');
                console.log('inside poll, count: ',count,'messages.length: ', messages.length);
                if(messages.length > count) {
                    console.log('inside messages.length > count');
                //    console.log('test3: ',JSON.stringify({count: messages.length,append: messages.slice(count-1).join("\n")+"\n"}));
                //    console.log('test4: ',JSON.stringify({count: messages.length,append: messages.slice(count).join("\n")+"\n"}));
                //    console.log('test4444: ',JSON.parse(messages.slice(count).join("\n")+"\n"));                   
                   
                    var x = messages.slice(count); 
                    console.log('x: ',x);  
                    var appendMsg = x.map(JSON.parse);
                    console.log('appendMsg: ',appendMsg);       
                    //console.log('test5: ',messages[count].message);                
                //    console.log('test6: ',messages[count]);                
                    res.end(JSON.stringify({
                        count: messages.length,
                        append: messages.slice(count)}));
                } 
                else {
                    console.log('client push ');
                    clients.push(res);
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