define(['jquery','modernizr','image!assets/img/banana.gif'], function($, Modernizr, bananaImg){ 
  //Called if get user media was rejected
  var errorCallback = function(e) {
    console.log('Should inform the user that she can use image upload instead', e);
    useImageUpload(); 
  };

  var videoConstraints = {
    video: {
      mandatory: {
        maxWidth: 640,
maxHeight: 360
      }
    }
  };

  var photoConstraints = {
    minWidth: 640,
minHeight: 360,
maxSize: '5mb'
  };

  function showBanana(parentElement, smile){
    var banana = $(bananaImg).addClass('banana');
    //var banana = $('<img class="banana" src="assets/img/banana.gif">');
    banana.css('width',smile.width+"px");
    banana.css('height',smile.height+"px");
    banana.css('position', 'absolute');
    banana.css('top',parentElement.offsetTop + smile.y +"px");
    banana.css('left',parentElement.offsetLeft + smile.x +"px");
    $('body').append(banana);
  }

  function hideBanana(){
    $(".banana").remove();
  }

  //Let the user upload an image from their device
  function useImageUpload(){

    $('#actionArea').empty().append(
        'Select a picture from your device<br>'+
        '<input id="selectImg" type="file"/><br>'+
        '<img src=""><br>'+
        '<button class="submit-btn" style="display: none">Send picture</button>'
        );

    var selectImg = document.querySelector("input");
    var img = document.querySelector("img");
    var submitBtn = document.querySelector('.submit-btn');
    var fr = new FileReader();

    submitBtn.addEventListener('click', sendToServer, false);

    fr.onload = function(e){
      img.src = this.result; 
      $(submitBtn).css('display','');
    };

    selectImg.addEventListener("change", function(){
      hideBanana();
      fr.readAsDataURL(selectImg.files[0]);
    });

    function sendToServer(){
      var imgData = img.src;
      $.post('./verify',{ img: imgData  }, function(data){
        if(data){
          showBanana(img, data);
        }
      });
    }
  }

  //Let the user take a selfie using the web cam
  function useCamera(stream){
    $('#actionArea').empty().append(
        '<video autoplay></video>'+
        '<img style="display: none;" src="">'+
        '<canvas style="display: none;"></canvas>'+
        '<br>'+
        '<button data-toggleText="Click to take a new shot" class="snap-btn">Click to snap!</button>'+
        '<button class="submit-btn" style="display: none">Send picture</button>'
        );

    var streamPaused = false;
    var video = document.querySelector('video');
    var snapBtn = document.querySelector('.snap-btn');
    var submitBtn = document.querySelector('.submit-btn');
    var canvas = document.querySelector("canvas");

    canvas.width = videoConstraints.video.mandatory.maxWidth;
    canvas.height = videoConstraints.video.mandatory.maxHeight;

    var ctx = canvas.getContext('2d');

    snapBtn.addEventListener('click', snapshot, false);
    submitBtn.addEventListener('click', sendToServer, false);

    video.src = window.URL.createObjectURL( stream );
    video.onloadedmetadata = function(e){
      console.log("Metadata:", e);
    };

    function snapshot() {
      hideBanana();
      if ( !stream ) {
        alert("Can't take picture since there is no video stream!");
        return;
      }
      streamPaused = !streamPaused;
      var toggleTxt = $(snapBtn).text();
      $(snapBtn).text( $(snapBtn).attr('data-toggleText') );
      $(snapBtn).attr('data-toggleText', toggleTxt);
      if( streamPaused ){
        video.pause();
        $(video).addClass("flash");
        setTimeout( function(){ $(video).addClass("snap"); }, 250 );
        ctx.drawImage(video, 0, 0);
        document.querySelector('img').src = canvas.toDataURL('image/png');
        $(submitBtn).css('display','');
      }else{
        $(video).removeClass("flash snap");
        //user wants to take another shot
        $(submitBtn).css('display','none'); 
        video.play();
      }
    }

    function sendToServer(){
      var imgData = canvas.toDataURL("image/png");
      $.post('./verify',{ img: imgData  }, function(data){
        if(data){
          showBanana(video, data);
        }
      });
    }
  }

  if (Modernizr.canvas && Modernizr.getusermedia){
    var gUM = Modernizr.prefixed('getUserMedia', navigator);
    gUM(videoConstraints, useCamera, errorCallback);
  }else{
    useImageUpload();
  }
});
