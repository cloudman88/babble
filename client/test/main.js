
// Client code
var counter = 0;
var poll = function() {
  $.getJSON('/poll/'+counter, function(response) {
    console.log("inside poll");
     counter = response.count;
     var elem = $('#output');
     elem.text(elem.text() + response.append);
     poll();
  });
}
poll();


/*
console.log('hello from client');

var form = document.querySelector('form');
form.addEventListener('submit', function(e) {
    e.preventDefault();
    console.log(form.action);
    var data = '';
    for (var i = 0; i < form.elements.length; i++) {
        var element = form.elements[i];
        if (element.name) {
            data += element.name + '=' + encodeURIComponent(element.value) + '&';
        }
    }

    var xhr = new XMLHttpRequest();
    xhr.open(form.method, form.action);
    if (form.method === 'post') {
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    }
    xhr.addEventListener('load', function (e) { 
        console.log(e.target.responseText); 
    });
    xhr.send(data);
});
*/

