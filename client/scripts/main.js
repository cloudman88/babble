console.log('inside client script');

window.Babble = {
    //Babble.postMessage(message:Object, callback:Function)
    postMessage : function postMessage(message, callback){
        console.log('inside postMessage');
        console.log('sending msg: ', message );
        var request = new XMLHttpRequest();
        //todo callback
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
        localStorage.setItem('babble',JSON.stringify({ currentMessage: '',
                                                userInfo: { name: userInfo.name,
                                                            email: userInfo.email }}));         
    },

    //Babble.getMessages(counter, callback)
    getMessages : function getMessages(counter,callback){
        var request = new XMLHttpRequest();
        request.addEventListener("load", function (event) {
                console.log('added load event listener');
        });
        var url = 'http://localhost:9000/messages?counter='+counter;
        request.open('GET',url, true);
        request.onload = function() {
            if (request.status >= 200 && request.status < 400) { // Success!                
                console.log('inside success');
                var data = JSON.parse(this.responseText);
                console.log('data: ',data);
                console.log('counter: ',counter);
                if (callback!= undefined)  callback(data.append); //todo
                var msgListElement = document.querySelector('.msglist');            
                for (i = counter; i < data.count; i++) {
                    var li = document.createElement('li');
                    var append = data.append[i-counter];
                    addMessageToClient(append);
                } 
                poll(); 
            } else {
                console.log('inside failure'); // We reached our target server, but it returned an error                
            }
        };
            request.onerror = function() {
            console.log('inside connection error'); // There was a connection error of some sort    
        };
        request.send();
    },

    //Babble.deleteMessage(id:String, callback:Function)
    deleteMessage : function deleteMessage(id,callback){
        console.log('inside deleteMessage, id:' , id);
        var request = new XMLHttpRequest();
        request.open('DELETE','http://localhost:9000/messages/'+id,true);
        var result;
        request.onload = function () {
                if (request.status >= 200 && request.status < 400) {
                    if (callback!= undefined){
                        callback(id);
                    }
                      //  callback(0);  //todo callback. update message on this client
                }
            }
        request.send();
    }
};

window.addEventListener('load',function(){
    //if (window.localStorage || localStorage.userInfo.name =="" || localStorage.userInfo.name =="Anonymous")
    //{    }
    localStorage.setItem('babble',JSON.stringify({ currentMessage: '',
                                                    userInfo: { name: '',
                                                                email: '' }}));        
    var modalElement = document.getElementById('myModal');
    modalElement.style.display = "block";
},false);

function addMessageToClient(mesgDetails){
    console.log('mesgDetails: ',mesgDetails);
    
    var cite = document.createElement('cite');
    if (mesgDetails.name != "") cite.innerText = mesgDetails.name+' ';
    else cite.innerText = "Anonymous ";
    
    console.log('cite user name : ', cite);

    var time =document.createElement('time'); 
    time.innerText = createTimeFromUnix(mesgDetails.timestamp);

    var p = document.createElement('p');
    p.innerText = mesgDetails.message;

    var userImg = document.createElement("img");
    userImg.alt="";
    userImg.className="userPic";
    userImg.src="http://free-icon-rainbow.com/i/icon_04682/icon_046820_256.jpg";
    
    var div = document.createElement('div');
    div.className="my-div";
    div.appendChild(cite);    
    div.appendChild(time);    
    
    
    var ls = JSON.parse(localStorage.getItem('babble'));
    var clientEmail = ls.userInfo.email;

    if (mesgDetails.email === clientEmail && 
        mesgDetails.email !==''){
        var deleteBtn = document.createElement("BUTTON");
        //deleteBtn.hidden = "hidden";
        deleteBtn.type = "submit";
        deleteBtn.class = "delBtn";
        deleteBtn.setAttribute('aria-label', "delete button");
        deleteBtn.onclick =  function(){ 
            Babble.deleteMessage(mesgDetails.timestamp, removeListItemById);
        };
        
        var deleteBtnImg = document.createElement("img");
        deleteBtnImg.alt = "delete button";
        deleteBtnImg.src = "./images/delete.png";
        deleteBtn.appendChild(deleteBtnImg);
        div.appendChild(deleteBtn);    

    }

    

    div.appendChild(p);    

    var li = document.createElement('li');
    li.appendChild(userImg);
    li.appendChild(div);    
    li.id = mesgDetails.timestamp;

    var msgListElement = document.querySelector('.msglist');
    msgListElement.appendChild(li);
    msgListElement.scrollTop = msgListElement.scrollHeight;
}

function removeListItemById(id){
    console.log('inside remove callbacl, id:',id);
   var msgListElement = document.querySelector('.msglist');   
   for (var i = 0 ; i < msgListElement.childNodes.length; i++) {
       var intId = parseInt(msgListElement.childNodes[i].id);
        if ( intId === id) {
            msgListElement.removeChild(msgListElement.childNodes[i]);
        }
   }
}

function createTimeFromUnix(timestamp){
    // multiplied by 1000 so that the argument is in milliseconds, not seconds.
    var date = new Date(timestamp*1000);
    // Hours part from the timestamp
    var hours = date.getHours();
    // Minutes part from the timestamp
    var minutes = "0" + date.getMinutes();
    // Will display time in 10:30 format
    var formattedTime = hours + ':' + minutes.substr(-2);
    console.log('time formattedTime: ', formattedTime);
    return formattedTime;
}

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
                message : document.getElementById('msgBox').value,
                timestamp : Math.round((new Date()).getTime() / 1000),
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

//Babble.getStats(callback:Function)