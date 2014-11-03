var app = module.exports = require('express')();

app._wrapStart = function(context){
  

  //Setup a RequireJS context
  var requirejs = require('requirejs');
  var moduleRequire = require;
    
  context.nodeRequire = moduleRequire;
  var wrapContext = requirejs.config(context);

  //Load the wrap main code
  wrapContext(['underscore-template-additions', 'main'], function(UTA, wrap){
    // assign the lodash template engine to render .html files
    var templates = new UTA();
    templates.cacheTemplates = false;//app.get('env') == 'development' ? false : true;
    app.set('views', __dirname+"/views");
    app.engine('html',templates.forExpress());
        // set .html as the default extension
    //app.set('view engine','.html');
    //Set view directory to the wrap root
    console.log( "Dirname:", __dirname);
    

    wrap(app, __dirname, __dirname+'/assets', __dirname+'/../../tmp');
  });
};
