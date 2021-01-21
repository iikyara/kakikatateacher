window.onload = function(){
  var images = document.getElementsByName('kanji_img');

  for(var i = 0; i < images.length; i++){
    var id = images[i].kanji_id;
    loadImage('/kanji_image/'+id+'/', images[i]);
  }
}

let openStampWindow = function(){
  document.getElementById("stamp-info-toggle").checked = true;
};

let closeStampWindwo = function(){
  document.getElementById("stamp-info-toggle").checked = false;
};

$(function(){
  var queryString = window.location.search;
  var queryObject = new Object();
  if(queryString){
    queryString = queryString.substring(1);
    var parameters = queryString.split('&');

    for (var i = 0; i < parameters.length; i++) {
      var element = parameters[i].split('=');

      var paramName = decodeURIComponent(element[0]);
      var paramValue = decodeURIComponent(element[1]);

      queryObject[paramName] = paramValue;
    }
  }

  if('s' in queryObject){
    openStampWindow();
  }
});
