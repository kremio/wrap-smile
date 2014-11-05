define(['module', 'session', 'smiledetection', 'fs', 'exif', 'bluebird'], function(module, Session, smile, fs, exif, Promise){

  Promise.promisifyAll( fs );
  var exifAsync = Promise.promisify( exif.ExifImage );

  var wrapBaseURL =  module.config().wrapBaseURL;


  var routes = function(app, __dirname,  __assets, __tmpFolder){
  
    app.get(wrapBaseURL+'/', function(req, res){
      try{
       res.render( "main", {wrapBaseURL: wrapBaseURL, wrapData: Session.getWrapData(req) } );
      }catch(e){
        console.log(e);
        res.send(404, e);
      }
    });

    app.all(wrapBaseURL+'/verify', function(req, res){
      console.log("Smile wrap verify");

      var imgType = req.body.img.match(/^data:image\/(png|jpeg);base64,/)[1];
      var base64Data = req.body.img.replace(/^data:image\/(png|jpeg);base64,/,"");
      var tmpFileName = __tmpFolder + "/" + (new Date()).getTime()+"."+imgType;


      console.log("Saving image file", tmpFileName); 
      fs.writeFileAsync( tmpFileName, base64Data, 'base64').then( function() {
        if(imgType === 'jpeg'){ 
          //check for EXIF metadata
          var jpegBuffer = new Buffer(base64Data, 'base64');
          return exifAsync({ image : jpegBuffer }).then( function (exifData) {
            var rotateBy = false;
            //check if the orientation is provided
            if( exifData.image && exifData.image.Orientation && exifData.image.Orientation != 1 ){
              //need to rotate image before smile detection
              switch( exifData.image.Orientation ){
                case 3: rotateBy = smile.ROT_180; break;
                case 6: rotateBy = smile.ROT_90_CW; break;
                case 8: rotateBy = smile.ROT_90_CCW; break;
              }
            }
            return rotateBy;
          });
        }else{
          return false; //don't perform any rotation prior to the detection
        }
      }).then( function( rotateBy){ //Smile detection
          return smile.find( tmpFileName, __assets+"/cascades/smiled_04.xml", rotateBy );
      }).then( function(isSmiling){ //Return result back to client
        if(isSmiling){ //Mark the wrap as completed and save any extra info
          var wrapData = Session.getWrapData(req);
          wrapData.completed = true;
          wrapData.extra = { image: tmpFileName };
          Session.setWrapData(req, wrapData);
        }
        res.send(200, isSmiling);
      }).catch( function(err){
        console.log(err);
        res(500,'Could not analyze image:'+err.message);
        return;
      });
     
   });

  };//End of HTTP handlers



  return routes;
});
