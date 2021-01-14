let player = document.getElementById('player');
let snapshotCanvas = document.getElementById('snapshot');
let snapshotImage;
let width = snapshotCanvas.width;
let height = snapshotCanvas.height;
let c_width, c_height;
let isResizing = false;

let startScan = function(callback) {
  const canvasContext = snapshotCanvas.getContext("2d");
  canvasContext.drawImage(player, 0, 0, width, height);
  imgurl = snapshotCanvas.toDataURL();
  var img = new Image();
  img.src = imgurl;
  snapshotImage = img;
  console.log(player.videoWidth, player.videoHeight);  
};

let handleSuccess = function(stream) {
  // カメラストリームをプレイヤーのデータに設定
  player.srcObject = stream;

  startScan((scanResult) => {
    // このページの呼び出し元に読み取り結果を返す
  });
};

var rot = 0;
let rotate = function(isRight){
  var angle = isRight ? 90 : -90;
  rot += angle;
  var scale = ((rot%180==90) & (width / height > c_width / c_height)) ? width / c_width : height / c_height;
  const context = snapshotCanvas.getContext("2d");
  context.clearRect(0, 0, width, height);
  context.translate(width/2, height/2);
  context.rotate(rot * Math.PI / 180);
  context.scale(scale, scale);
  context.drawImage(snapshotImage, -width/2, -height/2, width, height);
  context.scale(1 / scale, 1 / scale);
  context.rotate(-rot * Math.PI / 180);
  context.translate(-width/2, -height/2);
};

// このメソッドを呼び出すことでユーザーにブラウザがカメラを使用することを許可するかの確認ダイアログが表示され、
// 許可されれば handleSuccess が呼ばれる
// navigator.mediaDevices.getUserMedia({
//   video: {facingMode: "environment", width: width, height: height},
//   audio: false
// }).then(handleSuccess)
// .catch(err => {
//   console.log(JSON.stringify(err));
// });

function syncVideo(video, options) {
  if(isResizing) return;
  isResizing = true;
  if (video.srcObject) {
    video.srcObject.getVideoTracks().forEach(function(camera) { camera.stop(); });
  }
  navigator.mediaDevices.getUserMedia(options).then(function(stream) {
    video.srcObject = stream;
    video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
    video.play();
    isResizing = false;
  }).catch(function(err) {
    alert(err.message);
    isResizing = false;
  });
}

let resizeEL = function(){
  var w = window.innerWidth;
  var h = window.innerHeight;
  c_width = w;
  c_height = h;
  console.log(w, h);
  const options = { video: { facingMode: "environment",
    width:{ min:0, max:w }, height: { min:0, max:w }, aspectRatio:w/h } };
  syncVideo(player, options);
};

window.addEventListener('resize', resizeEL, false);
resizeEL();

//画像フォームのやつ
/*
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
      var img_src = $('<img>').attr('src', reader.result);
      $('#image_selector-label').html(img_src);
    }
    reader.readAsDataURL(file);
  });

  //フォームが送信されたときのイベント
  $('#image_form').on('submit', function(e){
    e.preventDefault();
  });
  $('#image_form').change(function(e){
    e.preventDefault();

    $('#results').html("");
    $('#noresults').hide();

    var formData = new FormData($(this).get(0));
    var url = '/image_to_info_as_html/';
    $.ajax({
      type: 'POST',
      url: url,
      data: formData,
      processData: false,
      dataType: "json",
      contentType: false
    }).done(function(data){
      //console.log(data)
      if(!data['success']){
        console.log('Server Error');
        $('#results').html("");
        $('#noresults').show();
        return;
      }
      elem_results = $('#results');
      elem_results.html("")
      if(data['data'].length == 0){
        $('#results').html("");
        $('#noresults').show();
        return;
      }
      $('#noresults').hide();
      for(var i = 0; i < data['data'].length; i++){
        var elem = $($.parseHTML(data['data'][i]));
        elem_results.append(elem);
      }
      $("[name=add_button]").on('click', click_add);
    }).fail(function(){
      console.log('Ajax Error')
    });
  });

  var click_add = function(event){
    //イベント源のidを取得
    var button_id = event.target.id;
    //var id = parseInt(button_id.substr(4));
    var target_info = $("#book" + button_id.substr(4));
    //console.log(target_info);
    //formの作成
    var form = $('<form></form>', {
      name : 'book_form',
      method : 'POST',
      action : '/confirm_add/'
    });
    //isbnデータを格納するhidden要素を追加
    form.append(
      $('<input />', {
        type : 'hidden',
        name : 'title',
        value : target_info.find("[name=title]").html()
      }),
      $('<input />', {
        type : 'hidden',
        name : 'isbn',
        value : target_info.find("[name=isbn]").html()
      }),
      $('<input />', {
        type : 'hidden',
        name : 'authors',
        value : target_info.find("[name=authors]").html()
      }),
      $('<input />', {
        type : 'hidden',
        name : 'publisher',
        value : target_info.find("[name=publisher]").html()
      }),
      $('<input />', {
        type : 'hidden',
        name : 'thumbnail',
        value : target_info.find("[name=thumbnail]").attr("src")
      })
    );
    //ページに追加（送信するため）
    $("body").append(form);
    //console.log(form);
    //フォームを送信
    form.submit();
  };

  $('#image_selector-label').on('drop', function(e){
    e.preventDefault();
    $('#image_selector')[0].files = e.dataTransfer.files;
  });
});
*/
