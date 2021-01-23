let score_img = document.getElementById("current_img");

const image_ids = [
  document.getElementById("default_img").value,
  document.getElementById("phase1_img").value,
  document.getElementById("phase2_img").value,
  document.getElementById("phase3_img").value,
  document.getElementById("phase4_img").value,
];
const phase_toggles = [
  document.getElementById("phase1_advice-toggle"),
  document.getElementById("phase2_advice-toggle"),
  document.getElementById("phase3_advice-toggle"),
  document.getElementById("phase4_advice-toggle"),
];
const heads = [
  document.getElementById("phase1_head"),
  document.getElementById("phase2_head"),
  document.getElementById("phase3_head"),
  document.getElementById("phase4_head"),
];
let currentPhase = -1;

let changeCurrentPhase = function(phase){
  var nextPhase = phase;
  if(phase == currentPhase){
    nextPhase = 0;
  }

  for(var i = 0; i < phase_toggles.length; i++){
    phase_toggles[i].checked = false;
  }

  loadImage('/kanji_image/'+ image_ids[nextPhase] +'/', score_img);
  if(nextPhase != 0){
    phase_toggles[nextPhase - 1].checked = true;
  }

  currentPhase = nextPhase;
};

window.onload = function(){
  for(var i = 0; i < heads.length; i++){
    (function(){
      var num = i + 1;
      heads[i].onclick = function(){
        console.log(num);
        changeCurrentPhase(num);
      };
    })();
  }

  changeCurrentPhase(0);
  // var images = document.getElementsByName('kanji_img');
  //
  // for(var i = 0; i < images.length; i++){
  //   var id = images[i].kanji_id;
  //   loadImage('/kanji_image/'+id+'/', images[i]);
  // }
};
