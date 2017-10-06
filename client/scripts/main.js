var counter = 0;
var userInfo = { name :'',email:''};
localStorage.setItem('babble',JSON.stringify({ currentMessage: '',
                                                 userInfo: {  name: '',
                                                             email: '' } }));
console.log('inside client script');

//var modalElement = document.getElementById('id01');
//modalElement.style.display = "block";

var element = document.getElementById("msgform");
//var element = document.querySelector(".msg-form");

if(element){
    console.log('inside element');
    element.addEventListener('submit', function(event) {
        event.preventDefault();
        //Babble.postMessage(message:Object, callback:Function)
        console.log('inside click event listener');
        var eventDetails = JSON.parse(localStorage.getItem('babble'));
        postMessage({name : eventDetails.userInfo.name,
                    email : eventDetails.userInfo.email,
                    message : document.getElementById('msgBox').value
        });
        return false;
      //  event.returnValue = false;
     //   event.cancelBubble = true;
    },false);
}
else {
        console.log('else click event listener');
}

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
            var data = JSON.parse(this.responseText);
            console.log('test: ',data);

            counter = data.count;
            console.log('counter: ',counter);

            var msgListElement = document.querySelector('.msglist');
            var msgCount = msgListElement.children.length;
            for (i = msgCount; i < counter; i++) {
                var li = document.createElement('li');
                var append = JSON.parse(data.append[i-msgCount]);
                console.log('test00: ',append.message);                
                li.appendChild(document.createTextNode(append.message));
                 
                msgListElement.appendChild(li);
            }
            poll();
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

function postMessage(message, callback){
    console.log('inside postMessage');
    var request = new XMLHttpRequest();
    request.open('POST','http://localhost:9000/messages',true);
//    var result;
//    request.onload = function () {
//            if (request.status >= 200 && request.status < 400) {
//                result = JSON.parse(request.responseText);
//            }
//        }
    request.send(JSON.stringify(message));
//    var resultInJson = JSON.stringify(result);
   // return resultInJson;
}

poll();

//Babble.register(userInfo:Object)

//Babble.getMessages(counter, callback)
//Babble.postMessage(message:Object, callback:Function)
//Babble.deleteMessage(id:String, callback:Function)
//Babble.getStats(callback:Function)