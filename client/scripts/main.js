console.log('inside client script');

window.Babble = {
    //Babble.postMessage(message:Object, callback:Function)
    postMessage : function postMessage(message, callback){

        try{
            console.log('inside postMessage, the msg: ',message);
            var request = new XMLHttpRequest();
            request.open('POST','http://localhost:9000/messages',true);
            request.onload = function () {
                if (request.status >= 200 && request.status < 400) {
                    //todo callback     
                    if (callback!=undefined) callback();
                  //  updateStatsMsg();
                }
                else{
                    console.log('request.status postMessage',request.status);
                }
            }
            request.onerror = function() {
                console.log('inside postMessage connection error'); // There was a connection error of some sort    
            }
            request.send(JSON.stringify(message));
        }
        catch(e){
                console.log('postmessage e: ',e);
        }

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
                console.log('added getMessages event listener');
        });
        var url = 'http://localhost:9000/messages?counter='+counter;
        request.open('GET',url, true);
        request.onload = function() {
            if (request.status >= 200 && request.status < 400) { // Success!                
                var data = JSON.parse(this.responseText);
                console.log('counter: ',counter,' data: ',data);
                if (callback!= undefined)
                {
                    callback(counter,data); //todo
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
               // updateStatsMsg();
                //  callback(0);  //todo callback. update message on this client
            }
        }
        request.send();
    },

    //Babble.getStats(callback:Function)
    getStats : function(callback){
        console.log('getStats');
        var request = new XMLHttpRequest();
        request.open('GET','http://localhost:9000/stats',true);
        request.onload = function () {
            if (request.status >= 200 && request.status < 400) {
                var resBody = JSON.parse(this.responseText);
                console.log('getStats resBody: ',resBody);
                if (callback!= undefined)  {
                    console.log('getStats callback is defined');
                    callback(resBody);}
                    Babble.getStats(updateStats);
                }
				else {
                console.log('getStats failure'); // We reached our target server, but it returned an error                
            }
        }
		request.onerror = function() {
            console.log('getStats connection error'); // There was a connection error of some sort    
        };
        request.send();
    },

    logout : function(callback){
        console.log('babble logout');
        var request = new XMLHttpRequest();
        var ls = JSON.parse(localStorage.getItem('babble'));
        request.open('POST','http://localhost:9000/logout',true);
        request.onload = function () {
            if (request.status >= 200 && request.status < 400) {
                console.log('succes logout ');
            }
        }
        request.send(JSON.stringify({email :ls.userInfo.email }));
    },

    login : function(callback){
        try{
            console.log('babble login');
            var request = new XMLHttpRequest();
            request.open('POST','http://localhost:9000/login',true);
            request.onload = function () {
                if (request.status >= 200 && request.status < 400) {
                    console.log('succes login ');
                }
                else {
                    console.log('request.status login ',request.status);
                }
            }
            request.send();
        }
        catch(e){   
            console.log('e: ',e);
        }
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

window.onbeforeunload = function(){
   console.log('logging out..');
   Babble.logout();
   return null;
}

function updateStats(stats){
    console.log('inside update stats');
    updateStatsMsg(stats.messages);
    updateStatsUsers(stats.users);
}

function updateStatsMsg(msgsCount){
    var statsMsgElement = document.getElementById("statsMsg");        
    if (msgsCount!==undefined) {
        statsMsgElement.innerText = msgsCount;
    }   
    else {
        var msgListElement = document.querySelector('.msglist');
        statsMsgElement.innerText = msgListElement.childNodes.length;
    } 
}

function updateStatsUsers(usersCount){
    var statsUsersElement = document.getElementById("statsUsers");
    var clientUsersCount =parseInt(statsUsersElement.innerHTML);
    statsUsersElement.innerText = usersCount;
    console.log('clientUsersCount: ',clientUsersCount,'usersCount :',usersCount);
}

function addMessageToClient(mesgDetails){
    
    var cite = document.createElement('cite');
    cite.innerText =  (mesgDetails.name != "") ? mesgDetails.name+' ' : "Anonymous ";    

    var time =document.createElement('time'); 
    time.innerText = createTimeFromUnix(mesgDetails.timestamp);

    var p = document.createElement('p');
    p.innerText = mesgDetails.message;

    var userImg = document.createElement("img");
    userImg.alt="";
    userImg.className="userPic";
    
    userImg.src = (mesgDetails.email ==='') ? 
            "http://free-icon-rainbow.com/i/icon_04682/icon_046820_256.jpg" :
             getGravatarByHash(mesgDetails.emailHash);

    var div = document.createElement('div');
    div.className="my-div";
    div.appendChild(cite);    
    div.appendChild(time);    
        
    var ls = JSON.parse(localStorage.getItem('babble'));
    var clientEmail = ls.userInfo.email;

    if (mesgDetails.email === clientEmail && mesgDetails.email !==''){
        var deleteBtn = document.createElement("BUTTON");
        deleteBtn.type = "submit";
        deleteBtn.class = "delBtn";
        deleteBtn.setAttribute('aria-label', "delete button");
        deleteBtn.onclick =  function(){ 
            Babble.deleteMessage(mesgDetails.timestamp, removeListItemById);
        };
        
        var deleteBtnImg = document.createElement("img");
        deleteBtnImg.alt = "delete button";
        deleteBtnImg.src = "./images/delete.jpg";
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

function getGravatarByHash(hash){
    var baseUrl = "//www.gravatar.com/avatar/";    
    return (baseUrl + hash + '?d=wavatar').trim();
}

function removeListItemById(id){
   console.log('inside remove li, id:',id);
   var msgListElement = document.querySelector('.msglist');   
   for (var i = 0 ; i < msgListElement.childNodes.length; i++) {
       var intId = parseInt(msgListElement.childNodes[i].id);
        if ( intId === id) {
            msgListElement.removeChild(msgListElement.childNodes[i]);
        }
   }
}

function createTimeFromUnix(timestamp){   
    var date = new Date(timestamp*1000);  // multiplied by 1000 to get args is in milliseconds.
    var hours = date.getHours();  // Hours part from the timestamp   
    var minutes = "0" + date.getMinutes();  // Minutes part from the timestamp    
    var formattedTime = hours + ':' + minutes.substr(-2); // Display time fomat 10:30 
    return formattedTime;
}

function login(){ //todo anonymous with uname,uemail
    var modalElement = document.getElementById('myModal');
    modalElement.style.display = "none";
    Babble.register({
        name : document.getElementById("uname").value,
        email : document.getElementById("uemail").value
    });
    Babble.getStats(updateStats);
    Babble.login();
    poll();
}

document.getElementById("msgform").addEventListener('submit', function(event) {
    event.preventDefault();
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
        Babble.getMessages(clientMsgsCount,updateClientMsgs);
}

function updateClientMsgs(counter,data){
    //todo check data not null
        var msgListElement = document.querySelector('.msglist');            
        for (i = counter; i < data.count; i++) {
            var li = document.createElement('li');
            var append = data.append[i-counter];
            addMessageToClient(append);
        } 
}