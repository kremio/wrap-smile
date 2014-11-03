define(['module', 'smiledetection', 'fs', 'exif'], function(module, smile, fs, exif){
   /*var SmileWrap = {
    go: function(req, res){
      try{
        res.render( "/index", {wrapBaseURL: wrapBaseURL } );
      }catch(e){
        console.log(e);
        res.send(404, e);
      }
    },

    verify: function(req, res){
      var imgType = req.body.img.match(/^data:image\/(png|jpeg);base64,/)[1];
      var base64Data = req.body.img.replace(/^data:image\/(png|jpeg);base64,/,"");
      var tmpFileName = __tmpFolder + "/" + (new Date()).getTime()+"."+imgType;

      console.log("Saving image file", tmpFileName);
      
      fs.writeFile( tmpFileName, base64Data, 'base64', function(err) {
        if(err){	  
          console.log(err);
          res(500,'Could not save image:'+err.message);
          return;
        }

        //check for EXIF metadata
        if(imgType === 'jpeg'){ 
          var ExifImage = exif.ExifImage;
          var jpegBuffer = new Buffer(base64Data, 'base64');
          try {
            new ExifImage({ image : jpegBuffer }, function (error, exifData) {
              if (error){
                console.log('Error: '+error.message);
                res(500,'Error reading metadata:'+err);
              }else{
                //check if the orientation is provided
                if( exifData.image && exifData.image.Orientation && exifData.image.Orientation != 1 ){
                  //need to rotate image before smile detection
                  var rotateBy = 0;
                  switch( exifData.image.Orientation ){
                    case 3: rotateBy = smile.ROT_180; break;
                    case 6: rotateBy = smile.ROT_90_CW; break;
                    case 8: rotateBy = smile.ROT_90_CCW; break;
                  }
                  //Check for smiles
                  smile.find( tmpFileName, __assets+"/cascades/smiled_04.xml", function(isSmiling){
                    res.send(200, isSmiling);
                  }, rotateBy);
                }
              }
            });
          } catch (error) {
            console.log('Error: ' + error.message);
            res(500,'Error reading metadata:'+err);
          }
        }else{	
          //Check for smiles
          smile.find( tmpFileName, __assets+"/cascades/smiled_04.xml", function(isSmiling){
            res.send(200, isSmiling);
          });
        } 
		  });

    }
  };
*/
  var wrapBaseURL =  module.config().wrapBaseURL;


  var routes = function(app, __dirname,  __assets, __tmpFolder){
    app.get(wrapBaseURL+'/route/go', function(req, res){
      try{
       res.render( "./main", {wrapBaseURL: wrapBaseURL } );
      }catch(e){
        console.log(e);
        res.send(404, e);
      }
    });

    app.all(wrapBaseURL+'/route/verify', function(req, res){
      console.log("Smile wrap verify");

      var imgType = req.body.img.match(/^data:image\/(png|jpeg);base64,/)[1];
      var base64Data = req.body.img.replace(/^data:image\/(png|jpeg);base64,/,"");
      var tmpFileName = __tmpFolder + "/" + (new Date()).getTime()+"."+imgType;

      console.log("Saving image file", tmpFileName);
      
      fs.writeFile( tmpFileName, base64Data, 'base64', function(err) {
        if(err){	  
          console.log(err);
          res(500,'Could not save image:'+err.message);
          return;
        }

        //check for EXIF metadata
        if(imgType === 'jpeg'){ 
          var ExifImage = exif.ExifImage;
          var jpegBuffer = new Buffer(base64Data, 'base64');
          try {
            new ExifImage({ image : jpegBuffer }, function (error, exifData) {
              if (error){
                console.log('Error: '+error.message);
                res(500,'Error reading metadata:'+err);
              }else{
                //check if the orientation is provided
                if( exifData.image && exifData.image.Orientation && exifData.image.Orientation != 1 ){
                  //need to rotate image before smile detection
                  var rotateBy = 0;
                  switch( exifData.image.Orientation ){
                    case 3: rotateBy = smile.ROT_180; break;
                    case 6: rotateBy = smile.ROT_90_CW; break;
                    case 8: rotateBy = smile.ROT_90_CCW; break;
                  }
                  //Check for smiles
                  smile.find( tmpFileName, __assets+"/cascades/smiled_04.xml", function(isSmiling){
                    res.send(200, isSmiling);
                  }, rotateBy);
                }
              }
            });
          } catch (error) {
            console.log('Error: ' + error.message);
            res(500,'Error reading metadata:'+err);
          }
        }else{	
          //Check for smiles
          smile.find( tmpFileName, __assets+"/cascades/smiled_04.xml", function(isSmiling){
            res.send(200, isSmiling);
          });
        } 
		  });

    });
  };


  return routes;
});
