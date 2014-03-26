define(function(require, exports, module) {

  var Womb                = require( 'Womb/Womb'                  );
  var m                   = require( 'Utils/Math'                 );

  var fragmentShaders     = require( 'Shaders/fragmentShaders'    );
  var vertexShaders       = require( 'Shaders/vertexShaders'      );
  var shaderChunks        = require( 'Shaders/shaderChunks'       );

  var TextCreator         = require( 'Womb/textures/TextTexture'  );
  var Raycaster           = require( 'Womb/Raycaster'             );


  function FilterAudioLinks( womb , params ){

    this.womb = womb;

    this.womb.loader.addToLoadBar();

    var self = this;
    this.params = _.defaults( params || {} , {

      spin: .001,
      color: new THREE.Vector3( .3 , .5 , 1.9 ),
      radius: 10,
      size:   .3,
      modelScale: 1,
      audioPower: 0.5,
      noisePower: 0.1,
      vertexShader:   vertexShaders.audio.noise.position,
      fragmentShader: fragmentShaders.audio.color.image.sample_pos_diamond,
      geo: new THREE.CubeGeometry( 1 , 1 , 1 , 10 , 10 ,10 ),
      numOf: 50,
      audio: womb.audioController.createLoop( '/lib/audio/loops/dontReallyCare/1.mp3' ),
      mainTitle: 'Hello World',
      links:[
  
        [ '/lib/img/icons/avalon_1.png'  , 'AVALON EMERSON' , 'https://soundcloud.com/avalonemerson' ],
        [ '/lib/img/icons/iceeHot_1.png' , 'ICEE HOT' , 'http://iceehot.com' ],
        [ '/lib/img/icons/cabbibo_1.png' , 'CABBIBO' , 'http://cabbibo.com' ],
        [ '/lib/img/icons/twitter_1.png' , 'TWITTER' , "http://twitter.com/share?text=Watch%20the%20new%20interactive%20video%20for%20%22Quoi%22,%20a%20track%20from%20@avalon_emerson%20on%20@ICEEHOT;%20visualized%20by%20@cabbibo%20&url=http://wom.bs/quoi/" ],
        [ '/lib/img/icons/facebook_1.png' , 'FACEBOOK' , "http://www.facebook.com/sharer.php?u=http://wom.bs/quoi" ],
        [ '/lib/img/icons/soundcloud_1.png' , 'SOUNDCLOUD' , "https://soundcloud.com/avalonemerson" ]
      ]

    });

    this.audio = this.params.audio;    
    
    this.being = this.womb.creator.createBeing();

    this.scene = this.being.scene;
    console.log( this.scene );

    this.texture = this.audio.texture.texture;

    var self = this;

    this.geo = this.params.geo;

    this.links = [];

    this.u = {
      
      time:       womb.time,

      pow_noise:  { type: "f"  , value: 0.01 },
      pow_audio:  { type: "f"  , value: .04 },

      texture:    { type: "t"  , value: null  },
      image:      { type: "t"  , value: null  },
      color:      { type: "v3" , value: this.params.color },

    }

    // Makes sure our womb has a textCreator!
  
    if( !this.womb.textCreator )
      this.womb.textCreator = new TextCreator( this.womb );

    this.t_CENTER = this.womb.textCreator.createTexture( this.params.mainTitle );

    this.u_CENTER= THREE.UniformsUtils.merge( [
        THREE.ShaderLib['basic'].uniforms,
        this.u,
    ]);

    this.u_CENTER.time          = this.womb.time;
    this.u_CENTER.image.value   = this.t_CENTER;
    this.u_CENTER.texture.value = this.texture;
    this.u_CENTER.color.value   = this.params.color; 

    this.m_CENTER = new THREE.ShaderMaterial( {
      uniforms:       this.u_CENTER, 
      vertexShader:   this.params.vertexShader,
      fragmentShader: this.params.fragmentShader,
      transparent:    true,
      fog:            true,
      opacity:        0.1,
      side:           THREE.DoubleSide
    });

    this.CENTER = new THREE.Mesh(
      new THREE.PlaneGeometry( 30 , 30 , 100 , 100 ),
      this.m_CENTER
    );

    this.CENTER.scale.x = this.t_CENTER.scaledWidth;
    this.CENTER.scale.y = this.t_CENTER.scaledHeight;

    this.scene.add( this.CENTER );

    for( var i = 0; i < this.params.links.length; i++ ){

      var l = this.params.links[i];
      var link = this.createLink( l[0] , l[1] , l[2] );
      link.scale.multiplyScalar( this.params.size );
      link.position.y = ( (i % 2 ) -.5)  * 160;
      link.position.x = ( ( i % 3 ) - 1 ) * 100;


      this.scene.add( link );


    }

    var c = this.womb.container;
    
    document.addEventListener( 'click', this.click.bind( this ));
    c.addEventListener( 'mousedown', this.mouseDown.bind( this ));
    c.addEventListener( 'mouseup', this.mouseUp.bind( this ));



    this.womb.loader.loadBarAdd();

    this.being.update = this.update.bind( this );

  }


  FilterAudioLinks.prototype.createLink = function( image , text , link ){

    var image = this.womb.imageLoader.load( image );
 
    var uniforms =  THREE.UniformsUtils.merge( [
        THREE.ShaderLib['basic'].uniforms,
        this.u,
    ]);

    uniforms.time             = this.womb.time;
    uniforms.image.value      = image;
    uniforms.texture.value    = this.audio.texture.texture;

    var material = new THREE.ShaderMaterial( {
      uniforms:       uniforms, 
      vertexShader:   vertexShaders.passThrough,
      fragmentShader: fragmentShaders.audio.color.image.uv_absDiamond_sub,
      transparent:    true,
      fog:            true,
      opacity:        0.1,
      //side:           THREE.DoubleSide
    });

    if( !this.womb.raycaster ){
      this.womb.raycaster = new Raycaster( this.womb );

      console.log( 'Raycaster Created' );
    }

    var rc = this.womb.raycaster;
    rc.addToMeshHoveredOverEvents( this.onMeshHoveredOver.bind( this ) );
    rc.addToMeshHoveredOutEvents(  this.onMeshHoveredOut.bind( this )  );

    var mesh = new THREE.Mesh( this.params.geo  , material );
    text = this.womb.textCreator.createTexture( text );
    
    mesh.image  = image;
    mesh.text   = text;
    mesh.link   = link;

    this.links.push( mesh );
    return mesh;


  }


  FilterAudioLinks.prototype.update = function(){

  }

  FilterAudioLinks.prototype.click = function( e ){

  }


  FilterAudioLinks.prototype.mouseDown = function(){

    for( var i = 0; i < this.links.length; i++ ){

      var l = this.links[i];

      if( l.active ){
        l.selected = true;
      }


    }

  }

  FilterAudioLinks.prototype.mouseUp = function(){

    for( var i = 0; i < this.links.length; i++ ){

      var l = this.links[i];

      if( l.selected && l.active ){
        window.open( l.link , '_blank' );
      }else{
        l.selected = false;
      }

    }

  }



  FilterAudioLinks.prototype.onMeshHoveredOver = function(object){

    this.audio.filter.frequency.value = 2000;
    for( var i = 0; i < this.links.length; i++ ){

      var l = this.links[i];

      if( object == l ){
        object.active = true;


        this.CENTER.material.uniforms.image.value = object.text;
        this.CENTER.scale.x = object.text.scaledWidth;
        this.CENTER.scale.y = object.text.scaledHeight;
        this.scene.add( this.CENTER );

        object.material.uniforms.color.value = new THREE.Vector3( 1.0 , 1.0 , 1.0 );

      }

    }

     

  }

  FilterAudioLinks.prototype.onMeshHoveredOut = function(object){

    this.audio.filter.frequency.value = 1200;

     for( var i = 0; i < this.links.length; i++ ){

      var l = this.links[i];

      if( object == l ){

        object.active = false;
        object.selected = false;
        
        this.scene.remove( this.CENTER );
        object.material.uniforms.color.value = this.params.color;
      
      }

    }


  }


  FilterAudioLinks.prototype.update = function(){

    for( var i = 0; i < this.links.length; i++ ){

      this.links[i].rotation.x += Math.sin( i ) * .02;
      this.links[i].rotation.y += Math.cos( i ) * .02;
      this.links[i].rotation.z += Math.sin( i * 55.3 ) * .02;

    }


  }


  FilterAudioLinks.prototype.enter = function(){
    this.audio.play();
    this.audio.gain.gain.value = 0.0
    this.audio.fadeIn( 10 );
    this.audio.turnOnFilter();
    this.being.enter();
  }

  FilterAudioLinks.prototype.exit = function(){
    this.audio.fadeOut();
    this.being.exit();
  }

  module.exports = FilterAudioLinks;

});
