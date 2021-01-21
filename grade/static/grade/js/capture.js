let sectionList = [
  document.getElementsByName('section1'),
  document.getElementsByName('section2'),
  document.getElementsByName('section3'),
  document.getElementsByName('section4'),
];
let activateClass = "activate_sec";

let snapshotImage = document.getElementById('snapshot');
//let snapshotCanvas = document.getElementById('snapshot');
let rotateField = document.getElementsByName('rotate')[0];
const rotate_classes = ['rotate0', 'rotate90', 'rotate180', 'rotate270'];
let rot = 0;

window.onresize = function(){
  // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
  let vh = window.innerHeight * 0.01;
  // Then we set the value in the --vh custom property to the root of the document
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};

/* controller */
let activateSection = function(sec){
  for(var i = 0; i < sectionList.length; i++){
    var secs = sectionList[i];
    for(var j = 0; j < secs.length; j++){
      secs[j].classList.remove(activateClass);
    }
  }
  if(sec == 2){
    document.getElementById("section2-toggle").checked = true;
    var secs = sectionList[0];
    for(var j = 0; j < secs.length; j++){
      secs[j].classList.add(activateClass);
    }
  }
  else{
    document.getElementById("section2-toggle").checked = false;
  }
  var secs = sectionList[sec - 1];
  for(var j = 0; j < secs.length; j++){
    secs[j].classList.add(activateClass);
  }
};
$(function(){
  activateSection(1);
});

/* phase 1 */
$(function(){
  // アップロードするファイルを選択
  $('input[type=file]').change(function() {
    var file = $(this).prop('files')[0];

    // 画像以外は処理を停止
    if (! file.type.match('image.*')) {
      // クリア
      $(this).val('');
      return;
    }

    // 画像表示
    var reader = new FileReader();
    reader.onload = function() {
      snapshot.src = reader.result;
      rot = 0;
      rotateAngle(rot);

      activateSection(2);
    }
    reader.readAsDataURL(file);
  });
});

/* phase 2 */
let rotateAngle = function(angle){
  for(var i = 0; i < rotate_classes.length; i++){
    snapshotImage.classList.remove(rotate_classes[i]);
  }
  var rotcls = rotate_classes[mod(angle, rotate_classes.length)];
  console.log(rotcls);
  snapshotImage.classList.add(rotcls);
};

let rotate = function(isRight){
  rot += isRight ? 1 : -1;
  rotateAngle(rot);
};

let sendImage = function(){
  //document.getElementById('imageform_form').submit();
  document.getElementById('submit_button').click();
};

let retake = function(){
  activateSection(1);
};

// csrf_tokenの取得に使う
function getCookie(name) {
  var cookieValue = null;
  if (document.cookie && document.cookie !== '') {
      var cookies = document.cookie.split(';');
      for (var i = 0; i < cookies.length; i++) {
          var cookie = jQuery.trim(cookies[i]);
          // Does this cookie string begin with the name we want?
          if (cookie.substring(0, name.length + 1) === (name + '=')) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
              break;
          }
      }
  }
  return cookieValue;
}

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

$(function($) {
  //var csrf_token = getCookie("csrftoken");
  $('#imageform_form').submit(function(event) {
    // HTMLでの送信をキャンセル
    event.preventDefault();

    //値を設定
    rotateField.value = mod(rot, 4);

    // 操作対象のフォーム要素を取得
    var $form = $(this);

    // 送信ボタンを取得
    // （後で使う: 二重送信を防止する。）
    var $button = $form.find('button');

    var formData = new FormData($(this).get(0));

    activateSection(3);

    console.log($form);

    // 送信
    $.ajax({
      url: $form.attr('action'),
      type: $form.attr('method'),
      data: formData,
      processData: false,
      contentType: false,
      dataType: "json",

      // 送信前
      beforeSend: function(xhr, settings) {
        // ボタンを無効化し、二重送信を防止
        $button.attr('disabled', true);

        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
          xhr.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));
        }
      },
      // 応答後
      complete: function(xhr, textStatus) {
          // ボタンを有効化し、再送信を許可
          $button.attr('disabled', false);
      },

      // 通信成功時の処理
      success: function(result, textStatus, xhr) {
        console.log(result);
        if(result.isSuccess){
          var id = result.id;
          window.location.href = "/score/" + id + "/?s=1";
        }
        else {
          activateSection(4);
        }
      },

      // 通信失敗時の処理
      error: function(xhr, textStatus, error) {
        activateSection(4);
      }
    });
  });
});
