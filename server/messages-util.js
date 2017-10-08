var serverMsgs = [];

module.exports = {
    //messages.addMessage(message:Object) : Number(id)
    addMessage : function (message){
        console.log('inside addMessage. serverMsgs ',serverMsgs);
        serverMsgs.push(message);
        console.log('lenght ',serverMsgs.length);
        var msgCount =serverMsgs.length; 
        return msgCount;
    },

    //messages.getMessages(counter:Number) : Array(messages)
    getMessages : function(counter) {
        if (serverMsgs!= undefined) return serverMsgs.slice(counter,serverMsgs.length);
        else console.log('serverMsgs is undefined!!');
    },

    getMsgCounter : function() {
        if (serverMsgs!= undefined) return serverMsgs.length;
        else console.log('serverMsgs is undefined!!');
    },

    //messages.deleteMessage(id:String)
    deleteMessage: function(id){
        var stop = false;
        var i = 0;
        while (stop!=true && i< serverMsgs.length){
            console.log(i,': ',serverMsgs[i]);
            var intId = parseInt(id);
            if (serverMsgs[i].timestamp === intId) {
                serverMsgs.splice(i, 1);
                stop=true;
            }            
            i++;
        }
    }
};