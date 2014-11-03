define(["opencv"], function( cv ){

	var smile = {
		//in degrees of angle, positive values mean counter clockwise rotation
		ROT_180: 180,
                ROT_90_CW: -90,
                ROT_90_CCW: 90
	};

	smile.find = function(inputImgPath, smileCascadeFile, callback, rotateBy){
		cv.SMILE_CASCADE = smileCascadeFile;
		//cv.SMILE_CASCADE = __dirname+"/cascades/haarcascade_smile.xml";
		//cv.SMILE_CASCADE = __dirname+"/cascades/smiled_04.xml"; //https://github.com/hromi/SMILEsmileD
		
		var facesFound;
		var imageLoaded;

		var processNextFace = function(smileFound){
			if(smileFound){
				callback( smileFound );
				return;
			}
			if( facesFound.length < 1 ){
				callback( false );
				return;
			}
			var face = facesFound.pop();
                        var faceImg = imageLoaded.roi(face.x, face.y, face.width, face.height);
                        faceImg.detectObject(cv.SMILE_CASCADE, {}, function(err, smiles){
			    if( smiles && smiles.length > 0 ){
				console.log(smiles.length + " smile(s) found");
				var biggestSmile = 0;
				for(var s = 1; s < smiles.length; s++){
					if( smiles[s].width * smiles[s].height > smiles[biggestSmile].width *  smiles[biggestSmile].height ){
						biggestSmile = s;
					}
				}
				//add the face coordinates to the smile coordinates
				smiles[biggestSmile].x += face.x;
				smiles[biggestSmile].y += face.y;
				processNextFace( smiles[biggestSmile] );
			    }else{
				processNextFace( false );
			    }
                        });

		};

		cv.readImage( inputImgPath, function(err, im){
		  if(rotateBy){
			im.rotate(rotateBy);
		  }
		  imageLoaded = im;

		  im.detectObject(cv.FACE_CASCADE, {}, function(err, faces){
		    console.log("Found "+faces.length+" faces.");
		    facesFound = faces;
 		    processNextFace(false);
		  });

		});

	}

	return smile;

});

