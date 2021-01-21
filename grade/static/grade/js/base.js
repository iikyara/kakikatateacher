var tags = document.getElementsByTagName("a");

for(var i = 0; i < tags.length; i++){
  tags[i].addEventListener('click', function(){
    this.setAttribute('class', 'android-btn active');

    var self = this;
    setTimeout(function () {
      self.removeAttribute('class', 'active');
      self.setAttribute('class', 'android-btn');
    }, 300);
  });
}
