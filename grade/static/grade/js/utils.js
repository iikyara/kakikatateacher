var showImageByCreateObjectURL = function(blob){
  var img = document.getElementById("result");
  var url = window.URL || window.webkitURL;
  return url.createObjectURL(blob);
}

//loadBinaryImage("/kanji_image/1/", showImageByCreateObjectURL, null);
var loadBinaryImage = function(path, cb, type, image) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function(){
    if (this.readyState == 4 && this.status == 200) {
      image.src = cb(this.response);
    }
  }
  xhr.open('GET', path);
  xhr.responseType = type || 'blob';
  xhr.send();
}

var loadImage = function(path, image){
  loadBinaryImage(path, showImageByCreateObjectURL, null, image);
}

// usually return positive value
function mod(i, j) {
    return (i % j) < 0 ? (i % j) + 0 + (j < 0 ? -j : j) : (i % j + 0);
}
