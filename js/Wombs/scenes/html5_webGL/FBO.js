define(function(require, exports, module) {

  var Womb                = require( 'wombs/Womb'                             );

  var AntiSerpenski       = require( 'wombs/scenes/html5_webGL/AntiSerpenski' );
  var Ring                = require( 'wombs/scenes/html5_webGL/Ring'          );
  var Text                = require( 'wombs/scenes/html5_webGL/Text'          );
  var Image               = require( 'wombs/scenes/html5_webGL/Image'         );
  var Fan                 = require( 'wombs/scenes/html5_webGL/Fan'           );
  var Random              = require( 'wombs/scenes/html5_webGL/Random'        );
  var Head                = require( 'wombs/scenes/html5_webGL/Head'          );
  var World               = require( 'wombs/scenes/html5_webGL/World'         );
  var Stars               = require( 'wombs/scenes/html5_webGL/Stars'         );
  var MeshDemo            = require( 'wombs/scenes/html5_webGL/MeshDemo'      );
  var Thing               = require( 'wombs/scenes/html5_webGL/Thing'         );


  function Digital( womb, params ){

    this.womb = womb;

    this.womb.loader.addToLoadBar();

    this.scenes = [];

    this.events = [];
    this.currentEvent = 0;

    this.head = this.womb.digital.alteredQualia;

    this.webGL = new Text( womb , {

      text: 'WebGL',
      color: new THREE.Vector3( 2.5 , 1.5 , 1.5 ),
      geo:  new THREE.CubeGeometry( 50 , 50 , 50 , 10 , 10 , 10 )

    });

    this.shaders = new Text( womb , {

      text: 'SHADERS',
      color: new THREE.Vector3( 2.5 , 1.5 , 1.5 ),
      geo:  new THREE.CubeGeometry( 50 , 50 , 50 , 10 , 10 , 10 )

    });


    this.xyz = new Text( womb , {

      text: 'XYZ',
      color: new THREE.Vector3( 2.5 , 1.5 , 1.5 ),
      geo:  new THREE.CubeGeometry( 50 , 50 , 50 , 10 , 10 , 10 )

    });

    this.rgb = new Text( womb , {

      text: 'RGB',
      color: new THREE.Vector3( 2.5 , 1.5 , 1.5 ),
      geo:  new THREE.CubeGeometry( 50 , 50 , 50 , 10 , 10 , 10 )

    });


    this.meshDemo = new MeshDemo( womb , {

      geo: new THREE.CubeGeometry( 50 , 50 , 50 , 10  , 10 , 10 )

    });

    this.thing = new Thing( womb , {

      geo: new THREE.CubeGeometry( 100 , 100 , 100 , 30  , 30 , 30 )

    });

 
 


    this.events.push( function(){

      this.webGL.enter();
    
    });

    this.events.push( function(){

      this.shaders.enter();


      var self = this;
      var t = this.womb.tweener.createTween({
        type: 'position',
        object: self.webGL.scene,
        target: new THREE.Vector3( 0 , -50 , -100 ),
        time: 1
      });
      t.start();

      this.webGL.world.update = function(){

        this.scene.rotation.x += .001;
        this.scene.rotation.y += .003;
        this.scene.rotation.z += .002;

      }


      var t = this.womb.tweener.createTween({
        type: 'position',
        object: self.shaders.scene,
        target: new THREE.Vector3( 0 , 70 , 0 ),
        time: 1
      });
      t.start();

    });

    this.events.push( function(){
     
      this.xyz.enter();
      this.webGL.exit();
  
    });

    this.events.push( function(){

     
      this.rgb.enter();

      var self = this;
      var t = this.womb.tweener.createTween({
        type: 'position',
        object: self.xyz.scene,
        target: new THREE.Vector3( -50 , 0 , 0 ),
        time: 1
      });
      t.start();

      var t = this.womb.tweener.createTween({
        type: 'position',
        object: self.rgb.scene,
        target: new THREE.Vector3( 50 , 0 , 0 ),
        time: 1
      });
      t.start();


    });


    this.events.push( function(){

      this.shaders.exit();

      var self = this;
      var t = this.womb.tweener.createTween({
        type: 'position',
        object: self.xyz.scene,
        target: new THREE.Vector3( 0 , 80 , 0 ),
        time: 1
      });
      t.start();

      var t = this.womb.tweener.createTween({
        type: 'position',
        object: self.rgb.scene,
        target: new THREE.Vector3( 100 , 0 , 0 ),
        time: 1
      });
      t.start();



      this.meshDemo.enter();
      this.meshDemo.addParticles();

    });

    this.events.push( function(){

      var self = this;
      var t = this.womb.tweener.createTween({
        type: 'position',
        object: self.xyz.scene,
        target: new THREE.Vector3( 0 , -80 , 0 ),
        time: 1
      });
      t.start();
      var t = this.womb.tweener.createTween({
        type: 'position',
        object: self.rgb.scene,
        target: new THREE.Vector3( 0 , 80 , 0 ),
        time: 1
      });
      t.start();

      this.meshDemo.addMesh();

    });

       
    this.events.push( function(){

      this.rgb.exit();
      this.xyz.exit();

      this.meshDemo.exit();
      this.thing.enter();

    });

    this.events.push( function(){

      this.thing.exit();

    });

    this.womb.loader.loadBarAdd();

    //this.world.update = this.update.bind( this );

  }


  Digital.prototype.triggerEvent = function( e ){

    this.events[e].bind( this )();

  }


  Digital.prototype.nextEvent = function(){

    this.triggerEvent( this.currentEvent );
    this.currentEvent ++;

  }
   

  Digital.prototype.enter = function(){


  }

  Digital.prototype.exit = function(){
  
  }

  module.exports = Digital;

});
