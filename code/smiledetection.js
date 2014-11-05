define(['opencv', 'bluebird'], function( cv, Promise ){

  var cv_readImageAsync = Promise.promisify( cv.readImage );
  Promise.promisifyAll( cv.Matrix.prototype, {suffix: "MyAsync"} ); //the 'Async' prefix is already used by opencv

  var smile = {
    //in degrees of angle, positive values mean counter clockwise rotation
    ROT_180: 180,
ROT_90_CW: -90,
ROT_90_CCW: 90
  };

  smile.find = function(inputImgPath, smileCascadeFile, rotateBy){
    cv.SMILE_CASCADE = smileCascadeFile;

    var facesFound, imageLoaded;

    //Look for a smile in the next found face
    var processNextFace = function(smileFound){
      if(smileFound){
        return smileFound;
      }
      if( facesFound.length < 1 ){
        return false;
      }

      var face = facesFound.pop();
      var faceImg = imageLoaded.roi(face.x, face.y, face.width, face.height);

      //Try and find a smile on the detected face
      return faceImg.detectObjectMyAsync(cv.SMILE_CASCADE, {}).then( function(smiles){
        if( smiles && smiles.length > 0 ){
          var biggestSmile = 0;
          for(var s = 1; s < smiles.length; s++){
            if( smiles[s].width * smiles[s].height > smiles[biggestSmile].width *  smiles[biggestSmile].height ){
              biggestSmile = s;
            }
          }
          //add the face coordinates to the smile coordinates
          smiles[biggestSmile].x += face.x;
          smiles[biggestSmile].y += face.y;
          return processNextFace( smiles[biggestSmile] );
        }

        return processNextFace( false );
      });

    };

    //Process the image with OpenCV to detect faces
    return cv_readImageAsync( inputImgPath ).then( function(im){
      if(rotateBy){
        im.rotate(rotateBy);
      }
      return im;
    }).then( function(im){
      imageLoaded = im; //keep a reference to the image so we can extract part of it later
      return im.detectObjectMyAsync(cv.FACE_CASCADE, {});
    }).then( function(faces){
      facesFound = faces; //An array of positions and dimensions of detected faces on the image
      return processNextFace(false); //Try and find smiles on the detected faces
    });


  };

	return smile;

});

