var images = document.getElementsByName('kanji_img');

for(var i = 0; i < images.length; i++){
  var id = images[i].kanji_id;
  loadImage('/kanji_image/'+id+'/', images[i]);
}
