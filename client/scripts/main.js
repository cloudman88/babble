console.log('inside client script');

window.Babble = {
    //Babble.postMessage(message:Object, callback:Function)
    postMessage : function postMessage(message, callback){
        console.log('inside postMessage');
        var request = new XMLHttpRequest();
        request.open('POST','http://localhost:9000/messages',true);
        //    var result;
        //    request.onload = function () {
        //            if (request.status >= 200 && request.status < 400) {
            
        //            }
        //        }
        request.send(JSON.stringify(message));
    },

    //Babble.register(userInfo:Object)
    register : function register(userInfo){        
        if (userInfo.email !=""){
            localStorage.setItem('babble',JSON.stringify({ currentMessage: '',
                                                            userInfo: { name: userInfo.name,
                                                                        email: userInfo.email }}));        
        }
        else {
            localStorage.setItem('babble',JSON.stringify({ currentMessage: '',
                                                            userInfo: { name: "Anonymmous",
                                                                        email: '' }}));        
        }
    },

    //Babble.getMessages(counter, callback)
    getMessages : function getMessages(counter,callback){
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
                console.log('counter: ',counter);       
                var msgListElement = document.querySelector('.msglist');            
                for (i = counter; i < data.count; i++) {
                    var li = document.createElement('li');
                    var append = JSON.parse(data.append[i-counter]);
                    console.log('test00: ',append.message);                
                    li.appendChild(document.createTextNode(append.message));                    
                    msgListElement.appendChild(li);
                } 
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
};

window.addEventListener('load',function(){
    var modalElement = document.getElementById('myModal');
    modalElement.style.display = "block";
},false);


function login(){
    var modalElement = document.getElementById('myModal');
    modalElement.style.display = "none";
    Babble.register({
        name : document.getElementById("uname").value,
        email : document.getElementById("uemail").value
    });
}

document.getElementById("msgform").addEventListener('submit', function(event) {
    event.preventDefault();
    console.log('inside click event listener');
    var eventDetails = JSON.parse(localStorage.getItem('babble'));
    Babble.postMessage({name : eventDetails.userInfo.name,
                email : eventDetails.userInfo.email,
                message : document.getElementById('msgBox').value
    });
    document.getElementById("msgBox").value="";
},false);

function poll() {
        console.log('inside poll');
        var msgListElement = document.querySelector('.msglist');
        var clientMsgsCount = msgListElement.children.length;
        Babble.getMessages(clientMsgsCount);
}

poll();

//Babble.deleteMessage(id:String, callback:Function)
//Babble.getStats(callback:Function)