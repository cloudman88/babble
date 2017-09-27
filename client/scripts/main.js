var counter = 0;
console.log('inside client script');

var poll = function() {
    console.log('inside poll');
    var request = new XMLHttpRequest();
    request.addEventListener("load", function (event) {
            console.log('added event listener');
    });
    request.open('GET', 'http://localhost:9000/poll/'+counter, true);

    request.onload = function() {
        console.log('inside onload');
        if (request.status >= 200 && request.status < 400) {
            // Success!
            console.log('inside success');
            console.log('res text: ',request.responseText);
            var data = JSON.parse(this.responseText);
            counter = data.count;
            var elem = document.querySelectorAll('messages');
            elem.textContent = elem.textContent  + data.append;
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

}
//Babble.getMessages(counter, callback)
//Babble.postMessage(message:Object, callback:Function)
//Babble.deleteMessage(id:String, callback:Function)
//Babble.getStats(callback:Function)

poll();

document.getElementById("sbtMsgBtn").addEventListener("click", function() {
    //Babble.postMessage(message:Object, callback:Function)

});