var counter = 0;
var userInfo = { name :'',email:''};
localStorage.setItem('babble',JSON.stringify({ currentMessage: '',
                                                 userInfo: {  name: '',
                                                             email: '' } }));
console.log('inside client script');

var poll = function() {
    console.log('inside poll');
    var request = new XMLHttpRequest();
    request.addEventListener("load", function (event) {
            console.log('added load event listener');
    });
    request.open('GET', 'http://localhost:9000/poll/'+counter, true);

    request.onload = function() {
        console.log('inside onload');
        if (request.status >= 200 && request.status < 400) {
            // Success!
            console.log('inside success');
            console.log('res text: ',request.response);

            var data = JSON.parse(this.responseText);
            console.log('data1: ',data);
            console.log('data2: ',data.message);
            console.log('data3: ',data.currentMessage);
            counter = data.count;
            var elem = document.querySelectorAll('#messages');
            //elem[0].innerHTML= elem[0].innerHTML+data.append;
            elem.append(document.createElement(data.append));
            //elem.textContent = elem.textContent  + data.append;
            // poll();
        } else {
            console.log('inside failure');
            // We reached our target server, but it returned an error
        }
    };
    request.onerror = function() {
        console.log('inside connection error');
        // There was a connection error of some sort    
    };
                
    request.send();      
}

//Babble.register(userInfo:Object)
function postMessage(message, callback){
    console.log('inside postMessage');

    var request = new XMLHttpRequest();
    request.open('POST','http://localhost:9000/messages',false);
    var result;
    request.onload = function () {
            if (request.status >= 200 && request.status < 400) {
                result = JSON.parse(request.responseText);
            }
        }
    request.send(JSON.stringify(message));
    var resultInJson = JSON.stringify(result);
    console.log('resultInJson :',resultInJson);
    return resultInJson;
}
//Babble.getMessages(counter, callback)
//Babble.postMessage(message:Object, callback:Function)
//Babble.deleteMessage(id:String, callback:Function)
//Babble.getStats(callback:Function)

var element = document.getElementById("sbtMsgBtn");
if(element){
    element.addEventListener("click", function() {
        //Babble.postMessage(message:Object, callback:Function)
        console.log('inside click event listener');
        var eventDetails = JSON.parse(localStorage.getItem('babble'));
        postMessage({name : eventDetails.userInfo.name,
                    email : eventDetails.userInfo.email,
                    message : document.getElementById('msgBox').value
        })
    });
}
else {
        console.log('else click event listener');
}

poll();