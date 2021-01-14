var ImageForm = function(){
  this.image = null;
  this.url = null;

  this.form = '#imageform_form';
  this.selector_label = '#imageform_selector-label';
};
ImageForm.prototype = {
  init: function(url){
    this.url = url;
  },
  setImage: function(image){
    this.image = image;
  },
  getImage: function(){
      return this.image;
  },
  sendForm: function(){

  },
}
