console.log('inside client script');

window.Babble = {
    //Babble.postMessage(message:Object, callback:Function)
    postMessage : function postMessage(message, callback){
        console.log('inside postMessage');
        console.log('sending msg: ', message );
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
                    var append = JSON.parse(data.append[i-counter]);
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
    cite.innerText = mesgDetails.name+' ';
    console.log('cite user name : ', cite);

    var d = new Date();
    d.setTime(mesgDetails.timestamp*1000);
    console.log('time d: ', d);

    // create timestampFromUnix()
    var time =document.createElement('time'); 
    // Create a new JavaScript Date object based on the timestamp
    // multiplied by 1000 so that the argument is in milliseconds, not seconds.
    var date = new Date(mesgDetails.timestamp*1000);
    // Hours part from the timestamp
    var hours = date.getHours();
    // Minutes part from the timestamp
    var minutes = "0" + date.getMinutes();
    // Will display time in 10:30:23 format
    var formattedTime = hours + ':' + minutes.substr(-2);
    console.log('time formattedTime: ', formattedTime);
    time.innerText = formattedTime;
    
    var p = document.createElement('p');
    p.innerText = mesgDetails.message;
   // p.appendChild(cite);
   // p.appendChild(time);

    var userImg = document.createElement("img");
    userImg.alt="";
    userImg.className="userPic";
    userImg.src="http://free-icon-rainbow.com/i/icon_04682/icon_046820_256.jpg";
    
  //  li.appendChild(cite);
  //  li.appendChild(time);
    
//    cite.className="my-p";
//    time.className="my-p";
//    p.className="my-p";

    var div = document.createElement('div');
    div.className="my-div";
    div.appendChild

    var li = document.createElement('li');
    div.appendChild(cite);    
    div.appendChild(time);    
    div.appendChild(p);    
    li.appendChild(userImg);
    li.appendChild(div);    
    var msgListElement = document.querySelector('.msglist');
    msgListElement.appendChild(li);

    msgListElement.scrollTop = msgListElement.scrollHeight;
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

//Babble.deleteMessage(id:String, callback:Function)
//Babble.getStats(callback:Function)