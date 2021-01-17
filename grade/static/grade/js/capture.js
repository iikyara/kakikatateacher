let player = document.getElementById('player');
let snapshotCanvas = document.getElementById('snapshot');
let snapshotImage;
let width = snapshotCanvas.width;
let height = snapshotCanvas.height;
let c_width, c_height;
let isResizing = false;

/* 画像撮影用 */

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

/* 変換 */
let canvasToBlob = function(canvas){
  var type = 'image/png';
  var dataurl = canvas.toDataURL(type);
  var bin = atob(dataurl.split(',')[1]);
  var buffer = new Uint8Array(bin.length);
  for(var i = 0; i < bin.length; i++){
    buffer[i] = bin.charCodeAt(i);
  }
  var blob = new Blob([buffer.buffer], {type: type});
  return blob;
}

/* 画像送信用 */

let sendImageUrl = "/analyzing/";

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

let sendImage = function(){
  //csrf_tokenを取得
  var csrf_token = getCookie("csrftoken");
  console.log(csrf_token);
  var data = {
    data : snapshotCanvas.toDataURL("image/png"),
  };
  var param = {
    method: "POST",
    headers:{
      "csrfmiddlewaretoken" : csrf_token,
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify(data)
  };

  let file = canvasToBlob(snapshotCanvas);
  let fd = new FormData();
  fd.append('image', file);

  console.log(file.size);

  $.ajax({
    type: "POST",
    url: sendImageUrl,
    data: data,
    contentType: "application/json; charset=utf-8",
    beforeSend: function(xhr, settings){
      if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
          xhr.setRequestHeader("X-CSRFToken", csrf_token);
      }
    },
    success: function(data){
      console.log(data);
      json = data
      if(json.isSuccess){
        console.log("ええ感じ");
      }
      else{
        console.log("解析でエラー");
      }
    },
    error: function(xhr, status, error){
      console.log(status + "\n" + "Status: " + xhr.status + "\n" + error);
    }
  });
};

function hexToBase64(str) {
    return btoa(String.fromCharCode.apply(null, str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" ")));
}

function decodeImageBuffer(buffer){
  var mime;
  console.log(buffer);
  console.log(typeof buffer);
  var a = new Uint8Array(buffer);
  console.log(a);
  var nb = a.length;
  console.log(nb);
  if (nb < 4)
    return null;
  var b0 = a[0];
  var b1 = a[1];
  var b2 = a[2];
  var b3 = a[3];
  if (b0 == 0x89 && b1 == 0x50 && b2 == 0x4E && b3 == 0x47)
    mime = 'image/png';
  else if (b0 == 0xff && b1 == 0xd8)
    mime = 'image/jpeg';
  else if (b0 == 0x47 && b1 == 0x49 && b2 == 0x46)
    mime = 'image/gif';
  else
    return null;
  var binary = "";
  for (var i = 0; i < nb; i++)
    binary += String.fromCharCode(a[i]);
  var base64 = window.btoa(binary);
  return 'data:' + mime + ';base64,' + base64;
}

var showImageByCreateObjectURL = function(blob){
  var img = document.getElementById("result");
  var url = window.URL || window.webkitURL;
  img.src = url.createObjectURL(blob);
}

var loadBinaryImage = function(path, cb, type) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function(){
    if (this.readyState == 4 && this.status == 200) {
      cb(this.response);
    }
  }
  xhr.open('GET', path);
  xhr.responseType = type || 'blob';
  xhr.send();
}

loadBinaryImage("/kanji_image/1/", showImageByCreateObjectURL, null);

let getImage = function(id){
  // 送信
  $.ajax({
      url: "/kanji_image/" + id + "/",
      type: "GET",
      processData: false,
      contentType: false,
      responseType: "blob",

      // 送信前
      beforeSend: function(xhr, settings) {
          if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
              xhr.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));
          }
      },
      // 応答後
      complete: function(xhr, textStatus) {

      },

      // 通信成功時の処理
      success: function(result, textStatus, xhr) {
        //console.log(result);
        document.getElementById('result').src = decodeImageBuffer(result);
      },

      // 通信失敗時の処理
      error: function(xhr, textStatus, error) {}
  });
};


jQuery(function($) {
  //var csrf_token = getCookie("csrftoken");
    $('#imageform_form').submit(function(event) {
        // HTMLでの送信をキャンセル
        event.preventDefault();

        // 操作対象のフォーム要素を取得
        var $form = $(this);

        // 送信ボタンを取得
        // （後で使う: 二重送信を防止する。）
        var $button = $form.find('button');

        var formData = new FormData($(this).get(0));

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
                getImage(result.id);
              }
            },

            // 通信失敗時の処理
            error: function(xhr, textStatus, error) {}
        });
    });
});

//getImage(1);

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
