//console.log('mainServerSctiprt0: ',mainServerSctiprt);
//console.log('mainServerSctiprt0id: ',mainServerSctiprt.id);

module.exports = {
     mainServerSctiprt : require('./main.js'),
    //messages.addMessage(message:Object) : Number(id)
    addMessage : function (message){
        console.log('addMessage server');
        console.log('mainServerSctiprt ',mainServerSctiprt);
        mainServerSctiprt.id++;
        message.id = mainServerSctiprt.id;
        console.log('mainServerSctiprt.serverMsgs ',mainServerSctiprt.serverMsgs);
        mainServerSctiprt.serverMsgs.push(message);
        return mainServerSctiprt.idCounter;
    }
};

/*
(function(){
    console.log('inside messages utils');
    // public api
    return {
        addMessage : function(message){
        //function addMessage(message){
        console.log('addMessage server');
        mainServerSctiprt.id++;
        message.id = mainServerSctiprt.id;
        mainServerSctiprt.messages.push(message);
        return mainServerSctiprt.idCounter;
        },        
        // OK
        getNumber: function(){
             return 32;   
        },
    };
})();
*/
//var addMessage = function(message){

//messages.getMessages(counter:Number) : Array(messages)
//messages.deleteMessage(id:String)