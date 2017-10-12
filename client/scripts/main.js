window.Babble = {
    //Babble.postMessage(message:Object, callback:Function)
    postMessage : function postMessage(message, callback){
            var request = new XMLHttpRequest();
            request.open('POST','http://localhost:9000/messages',true);
            request.onload = function () {
                if (request.status >= 200 && request.status < 400) {
                    if (callback!=undefined) callback();
                }
                else{
                    console.log('postMessage error, request status from server',request.status);
                }
            }
            request.onerror = function() {
                console.log('postMessage connection error'); // There was a connection error of some sort    
            }
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
                console.log('added getMessages event listener');
        });
        var url = 'http://localhost:9000/messages?counter='+counter;
        request.open('GET',url, true);
        request.onload = function() {
            if (request.status >= 200 && request.status < 400) { // Success!                
                var data = JSON.parse(this.responseText);
                if (callback!= undefined)
                {
                    callback(data.append);
                }
                poll();  
            }    
            else{
                    console.log('getMessages error, request status from server',request.status);
            }
        };
        request.onerror = function() {
            console.log('getMessages connection error'); // There was a connection error of some sort    
        };
        request.send();
    },

    //Babble.deleteMessage(id:String, callback:Function)
    deleteMessage : function deleteMessage(id,callback){
        var request = new XMLHttpRequest();       
        request.open('DELETE','http://localhost:9000/messages/'+id,true);
        var result;
        request.onload = function () {
            if (request.status >= 200 && request.status < 400) {
                var data = JSON.parse(this.responseText);
                if (callback!= undefined){
                    callback(data,id);
                }
            }
             else{
                    console.log('deleteMessage error, request status from server',request.status);
                }
        }
        request.onerror = function() {
            console.log('deleteMessage connection error'); // There was a connection error of some sort    
        };
        request.send();
    },

    //Babble.getStats(callback:Function)
    getStats : function(callback){
        var request = new XMLHttpRequest();
        request.open('GET','http://localhost:9000/stats',true);
        request.onload = function () {
            if (request.status >= 200 && request.status < 400) {
                var resBody = JSON.parse(this.responseText);
                if (callback!= undefined)  {
                    callback(resBody);}
                    Babble.getStats(updateStats);
                }
				else{
                    console.log('getStats error, request status from server',request.status);
                }
        }
		request.onerror = function() {
            console.log('getStats connection error'); // There was a connection error of some sort    
        };
        request.send();
    },

    logout : function(callback){
        var request = new XMLHttpRequest();
        var ls = JSON.parse(localStorage.getItem('babble'));
        request.open('POST','http://localhost:9000/logout',true);
        request.onload = function () {
            if (request.status >= 200 && request.status < 400) {
                console.log('succes logout ');
            }
            else{
                console.log('logout error, request status from server',request.status);
            }            
        }
        request.onerror = function() {
            console.log('logout connection error'); // There was a connection error of some sort    
        };
        request.send(JSON.stringify({email :ls.userInfo.email }));
    },

    login : function(callback){
        var request = new XMLHttpRequest();
        request.open('POST','http://localhost:9000/login',true);
        request.onload = function () {
            if (request.status >= 200 && request.status < 400) {
                console.log('succes login ');
            }
            else{
            console.log('login error, request status from server',request.status);
            }
        }
        request.onerror = function() {
            console.log('login connection error'); // There was a connection error of some sort    
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

window.onbeforeunload = function(){
   Babble.logout();
   return null;
}

function updateStats(stats){
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
            './images/anonymous-profile-pic.jpg' :
             getGravatarByHash(mesgDetails.emailHash);

    var div = document.createElement('div');
    div.className="my-div";
    div.appendChild(cite);    
    div.appendChild(time);    
        
    var ls = JSON.parse(localStorage.getItem('babble'));
    var clientEmail = ls.userInfo.email;

    if (mesgDetails.email === clientEmail && mesgDetails.email !==''){
        var deleteBtn =  createDeleteButton(mesgDetails.timestamp);

        div.addEventListener("mouseover",function(){
            deleteBtn.style.visibility="visible";
        });
        div.addEventListener("mouseout", function(){
            deleteBtn.style.visibility="hidden";
        });
        div.addEventListener("focus", function(){
            deleteBtn.style.visibility="visible";
        });
        div.addEventListener("focusout", function(){
            deleteBtn.style.visibility="hidden";
        });

        div.appendChild(deleteBtn);    
    }
    div.appendChild(p);    
    div.setAttribute('tabindex','0');

    var li = document.createElement('li');
    li.appendChild(userImg);
    li.appendChild(div);    
    li.id = mesgDetails.timestamp;

    var msgListElement = document.querySelector('.msglist');
    msgListElement.appendChild(li);
    msgListElement.scrollTop = msgListElement.scrollHeight;
}

function createDeleteButton(divId){
        var deleteBtn = document.createElement("BUTTON");
        deleteBtn.type = "submit";
        deleteBtn.style.visibility="hidden";
        deleteBtn.class = "delBtn";
        deleteBtn.setAttribute('aria-label', "delete button");
        deleteBtn.onclick =  function(){ 
            Babble.deleteMessage(divId, removeListItemById);
        };
        
        var deleteBtnImg = document.createElement("img");
        deleteBtnImg.alt = "delete button";
        deleteBtnImg.src = "./images/delete.jpg";        

        deleteBtn.appendChild(deleteBtnImg);
        return deleteBtn;
}

function getGravatarByHash(hash){
    var baseUrl = "//www.gravatar.com/avatar/";    
    return (baseUrl + hash + '?d=wavatar').trim();
}

function removeListItemById(succes,id){
    if (succes==true){
        var msgListElement = document.querySelector('.msglist');   
        for (var i = 0 ; i < msgListElement.childNodes.length; i++) {
            var intId = parseInt(msgListElement.childNodes[i].id);
                if ( intId === id) {
                    msgListElement.removeChild(msgListElement.childNodes[i]);
                    return;
                }
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

function login(isAnonymous){
    var modalElement = document.getElementById('myModal');
    modalElement.style.display = "none";
    var name =(isAnonymous==true) ? '' : document.getElementById("uname").value;
    var email =(isAnonymous==true) ? '' : document.getElementById("uemail").value;
    Babble.register({name,email});
    Babble.getStats(updateStats);
    poll();
    Babble.login();
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
        var msgListElement = document.querySelector('.msglist');
        var clientMsgsCount = msgListElement.childNodes.length;
        Babble.getMessages(clientMsgsCount,updateClientMsgs);
}

function updateClientMsgs(newMsgs){
    //todo check data not null
        var msgListElement = document.querySelector('.msglist');            
        for (i = 0; i < newMsgs.length; i++) {
            var li = document.createElement('li');
            addMessageToClient(newMsgs[i]);
        } 
}