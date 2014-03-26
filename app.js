define(function(require, exports, module) {

  var Womb                = require( 'Womb/Womb'                  );
  
  var m                   = require( 'Utils/Math'                 );
  var recursiveFunctions  = require( 'Utils/RecursiveFunctions'   );
  
  var fragmentShaders     = require( 'Shaders/fragmentShaders'    );
  var vertexShaders       = require( 'Shaders/vertexShaders'      );
  var physicsShaders      = require( 'Shaders/physicsShaders'     );
  var shaderChunks        = require( 'Shaders/shaderChunks'       );

  var physicsShaders      = require( 'Shaders/physicsShaders'     );
  var physicsParticles    = require( 'Shaders/physicsParticles'   );
  
  var PhysicsSimulator    = require( 'Species/PhysicsSimulator'   );

  var FBOParticles        = require( 'Species/FBOParticles'       );
 
  var FractalBeing       = require( 'Species/Beings/FractalBeing');
 
  var ShaderCreator       = require( 'Shaders/ShaderCreator'  );
  
  /*
   
     Create our womb

  */

  
  womb = new Womb({
    cameraController: 'TrackballControls',
    color:            '#000000',
    failureVideo:     84019684,
    size:             400
  });


  womb.stream = womb.audioController.createNote( 'lib/audio/Holly.mp3' );

  womb.ps = new PhysicsSimulator( womb , {

    textureWidth: 300,
    debug: false,
    velocityShader: physicsShaders.velocity.curl,
    velocityStartingRange:.0000,
    startingPositionRange:[1 , .000002, 0 ],
    positionShader: physicsShaders.positionAudio_4,
    particlesUniforms:        physicsParticles.uniforms.audio,
    particlesVertexShader:    physicsParticles.vertex.audio,
    particlesFragmentShader:  physicsParticles.fragment.audio,

    bounds: 100,
    speed: .3,
    particleParams:   {
        size: 10,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        fog: true, 
        map: THREE.ImageUtils.loadTexture( 'lib/img/particles/lensFlare.png' ),
        opacity:    1,
      }, 
    audio: womb.stream

  });

  womb.ps.particleSystem.scale.multiplyScalar( 1 );
  womb.ps.particleSystem.rotation.x = Math.PI;
  womb.u = {

    texture:    { type: "t", value: womb.stream.texture.texture },
    image:      { type: "t", value: womb.stream.texture.texture },
    color:      { type: "v3", value: new THREE.Vector3( .3 , .01 , .1 ) },
    time:       womb.time,
    pow_noise:  { type: "f" , value: 0.2 },
    pow_audio:  { type: "f" , value: .3 },

  };

  womb.modelLoader.loadFile( 
    'OBJ' , 
    'lib/demoModels/logo.obj' , 

    function( object ){

      if( object[0] instanceof THREE.Mesh ){
      }

      if( object[0] instanceof THREE.Geometry ){
        var geo = object[0];
        geo.computeFaceNormals();
        geo.computeVertexNormals();
        
        geo.verticesNeedUpdate = true;

       
        womb.modelLoader.assignUVs( geo );
        var m = new THREE.Mesh( geo , new THREE.MeshBasicMaterial({
            color:0x000000,
            side: THREE.DoubleSide
          })
        );
        m.scale.multiplyScalar( 5 );


        var newGeo = new THREE.Geometry();
       
        THREE.GeometryUtils.merge( newGeo , m );

        womb.fboParticles = new FBOParticles({
          audioTexture: womb.stream.texture,
          numberOfParticles:1000000,
          particleSize: 100,
          geometry: newGeo
        });

        womb.fboParticles.update = function(){
          this.body.rotation.z += .001;
        }

        womb.fboParticles.particles.scale.multiplyScalar( .05 );
        m.scale.multiplyScalar( .05 );

        womb.fboParticles.body.add( m );
              
      }
    }
  
  );



  womb.modelLoader.loadFile( 'OBJ' , 'lib/demoModels/mug_11530_10.obj' , function( object ){

    if( object[0] instanceof THREE.Mesh ){
    }

    if( object[0] instanceof THREE.Geometry ){
      var geo = object[0];
      geo.computeFaceNormals();
      geo.computeVertexNormals();
      geo.computeBoundingSphere();
      geo.computeBoundingBox();
      
      womb.modelLoader.assignUVs( geo );
     
      womb.onMugLoad( geo);
    }

  });

  womb.onMugLoad = function( geo ){


      womb.loader.loadBarAdd();

      womb.fractal1 = new FractalBeing( womb, {

        geometry: geo,
        texture:    womb.stream.texture,
        opacity: .01,
        texturePower:5,
        noisePower:3,
      
        displacementPower: 0.3,
        displacementOffset: 15.0,

        placementSize: womb.size/20,

        numOf: 10,
        color: new THREE.Vector3( 0.5 , 0.0 , 1.5 ),
        influence: 1,

      });
      womb.fractal1.fractal.material.updateSeed();
      
      womb.looper = womb.audioController.createLooper( womb.stream , {
        beatsPerMinute: 120.1 
      });

      

      // Flute:
      womb.looper.addSequence( 
      
      function( hitInfo ){
        womb.fractal1.body.rotation.z += .5;
        var x = Math.random();
        var y = Math.random();
        var z = Math.random();
        womb.fractal1.fractal.material.uniforms.color.value.set( x * 2 , y / 2 , z ); 
        womb.fractal1.fractal.material.uniforms.opacity.value = Math.random() * .3;
      } , 
      16 , 
      [

        [ 0 , [.4] ],
        [ 1 , [.4] ],
        [ 2 , [.4] ],
        [ 3 , [.4] ],
        
        [ 4 , [.4] ],
        [ 5 , [.4] ],
        [ 6 , [0.0, .25 , .35 , .55 , .85] ],
      

        [ 8 , [.4] ],
        [ 9 , [.4] ],
        [ 11 , [0.0 , .4] ],
        
        [ 12 , [0.0, .25 , .35 , .55 , .85] ],
      ]);



  }


   vertexChunk = [
    
    "nPos = normalize(pos);",
    
    "vec3 offset;",
    
    "offset.x = nPos.x + Time * .3;",
    "offset.y = nPos.y + Time * .2;",
    "offset.z = nPos.z + Time * .24;",
    
    "vec2 a = vec2( abs( nPos.y ) , 0.0 );",
    
    "float audio = texture2D( AudioTexture , a).r;",
    "vDisplacement = NoisePower * snoise3( offset );",
    "vDisplacement += AudioPower * audio * audio;",
   
    "pos *= 1. + .05 * abs( vDisplacement + 3.0 );",

  ];

  fragmentChunk = [

    "color = abs( Color +.3 * abs(normalize(vPos_MV ))  + abs(nPos) + vDisplacement);",
    "vec3 normalColor = normalize( color );",
    "color += .1 * kali3( nPos , -1. * normalColor );",
    "vec3 norm = color + .1 * vNorm;",
    "color =  Color + .5 * normalize( norm * vDisplacement );",

  ];

  womb.loader.addToLoadBar();

  womb.helixShader = new ShaderCreator({
    vertexChunk:   vertexChunk,
    fragmentChunk: fragmentChunk,
    uniforms:{ 
     
      Time:         womb.time,
      Color:        { type:"v3" , value: new THREE.Vector3( .1 , .2 , .3 ) },
      AudioTexture: { type:"t"  , value: womb.stream.texture },
      NoisePower:   { type:"f"  , value: .9 },
      AudioPower:   { type:"f"  , value: 1.4 }
    
    },

  });

  womb.helixShader.material.side = THREE.BackSide;


   womb.modelLoader.loadFile( 'OBJ' , 'lib/demoModels/Lord_Helix.obj' , function( object ){

    if( object[0] instanceof THREE.Mesh ){
    }

    if( object[0] instanceof THREE.Geometry ){
      var geo = object[0];
      geo.computeFaceNormals();
      geo.computeVertexNormals();
      geo.computeBoundingSphere();
      geo.computeBoundingBox();
      
      womb.modelLoader.assignUVs( geo );
     
      womb.onMugLoad( geo);

      var mesh = new THREE.Mesh(
        ///geo,
        new THREE.IcosahedronGeometry( 2000 , 7 ),
        womb.helixShader.material
      );

      //mesh.scale.multiplyScalar( 300 );

      womb.helixBeing = womb.creator.createBeing();

      womb.helixBeing.body.add( mesh );

    // womb.loader.loadBarAdd();


    }

  });




   setTimeout( createTextMeshes, 1000 );


   womb.EVENTS = [];
  
   womb.EVENTS.push(function(){

     womb.cabbibo.enter();

   });

   womb.EVENTS.push(function(){
     womb.presents.enter();
     womb.cabbibo.exit();
   });

   womb.EVENTS.push(function(){
  
     var tween = womb.tweener.createTween({

      time: 1,
      target: new THREE.Vector3( 0 , 0 , 100 ),
      object: womb.camera

    });

     womb.presents.exit();
     womb.holly.enter();
     tween.start();
     womb.fboParticles.enter();

   });

   womb.EVENTS.push( function(){
      var tween = womb.tweener.createTween({

      time: 1,
      target: new THREE.Vector3( 0 , 0 , 50 ),
      object: womb.camera

    });
    womb.holly.exit();
   });
    
   womb.EVENTS.push(function(){

    var tween = womb.tweener.createTween({

      time: 1,
      target: new THREE.Vector3( 100 , 0 , 0 ),
      object: womb.camera

    });

    tween.start();

   });

   womb.EVENTS.push(function(){

     var tween = womb.tweener.createTween({

      time: 1,
      target: new THREE.Vector3( 0 , 0 , -50 ),
      object: womb.camera,
      

    });

     
    
     tween.start();

   });

    womb.EVENTS.push( function(){

     var tween = womb.tweener.createTween({

      time: 1,
      target: new THREE.Vector3(-50, 0 , 0 ),
      object: womb.camera,
     

    });

     tween.start();


   });

  womb.EVENTS.push(function(){


     var tween = womb.tweener.createTween({

      time: 1,
      target: new THREE.Vector3( 0 , 0 , 30 ),
      object: womb.camera,
      callback: function(){
        womb.fractal1.enter();
      }

    });

         
    tween.start();

   });


  womb.EVENTS.push(function(){


     var tween = womb.tweener.createTween({

      time: 4,
      target: new THREE.Vector3( 0 , 0 , 400 ),
      object: womb.camera,
      callback: function(){
        womb.fboParticles.exit();
        
      }

    });

     tween.start();

   });


  womb.EVENTS.push(function(){


     var tween = womb.tweener.createTween({

      time: 3,
      target: new THREE.Vector3( 600 , 600 , 600 ),
      object: womb.camera,
      

    });

     tween.start();

   });

  womb.EVENTS.push(function(){


     var tween = womb.tweener.createTween({

      time: 3,
      target: new THREE.Vector3( 600 , -800 , -1000 ),
      object: womb.camera,
      

    });

     womb.helixBeing.enter();
     tween.start();

   });

  womb.EVENTS.push(function(){


     var tween = womb.tweener.createTween({

      time: 3,
      target: new THREE.Vector3( -1000 , -800 , 1000 ),
      object: womb.camera,
      

      });

      for( var i = 0; i < womb.respects.length; i++ ){
        womb.respects[i].enter();
      } 

    
     tween.start();

   });


  womb.EVENTS.push(function(){
    var tween = womb.tweener.createTween({
      time: 10,
      target: new THREE.Vector3( 0 , 0 , 3000 ),
      object: womb.camera,
      callback:function(){


      var tween1 = womb.tweener.createTween({
        time: 5,
        target: new THREE.Vector3( 3000 , 0 , 3000 ),
        object: womb.camera,
        callback:function(){

        for( var i = 0; i < womb.respects.length; i++ ){
          womb.respects[i].exit();
        }




        }
      });
      tween1.start();


      }
    });

    womb.ps.enter();
    womb.fractal1.exit();
    womb.helixBeing.exit();
    tween.start();
  });


  womb.EVENTS.push(function(){
    var tween = womb.tweener.createTween({
      time: 5,
      target: new THREE.Vector3( -760, 3130, -1443 ),
      object: womb.camera,
    });
    tween.start();
  });


  womb.EVENTS.push(function(){

    console.log('YESSSS');
    var tween = womb.tweener.createTween({
      time: 5,
      target: new THREE.Vector3( 2407, 7500,  -9337 ),
      object: womb.camera,
    });
    tween.start();
  });




  womb.events = {}
  womb.events.currentEvent = 0;
  womb.events.nextEvent = function(){
    console.log( this );
    womb.EVENTS[this.currentEvent]();
    this.currentEvent++;

  }

  //var t = setTimeout( womb.EVENTS.nextEvent , -1000   + offset );

  var offset = 2500;

  var t = setTimeout( womb.events.nextEvent.bind( womb.events ) , 0 + offset );
  var t = setTimeout( womb.events.nextEvent.bind( womb.events ) , 3655 + offset );
  var t = setTimeout( womb.events.nextEvent.bind( womb.events ) , 7337 + offset );
  var t = setTimeout( womb.events.nextEvent.bind( womb.events ) , 11050 + offset );
  var t = setTimeout( womb.events.nextEvent.bind( womb.events ) , 14550 + offset );
  var t = setTimeout( womb.events.nextEvent.bind( womb.events ) , 18500 + offset );
  var t = setTimeout( womb.events.nextEvent.bind( womb.events ) , 22350 + offset );
  var t = setTimeout( womb.events.nextEvent.bind( womb.events ) , 25800 + offset );
  var t = setTimeout( womb.events.nextEvent.bind( womb.events ) , 29560 + offset );
  var t = setTimeout( womb.events.nextEvent.bind( womb.events ) , 44350 + offset );
  var t = setTimeout( womb.events.nextEvent.bind( womb.events ) , 51700 + offset );
  var t = setTimeout( womb.events.nextEvent.bind( womb.events ) , 59050 + offset );
  var t = setTimeout( womb.events.nextEvent.bind( womb.events ) , 73870 + offset );
  var t = setTimeout( womb.events.nextEvent.bind( womb.events ) , 96020 + offset );
  var t = setTimeout( womb.events.nextEvent.bind( womb.events ) , 103300 + offset );

  womb.update = function(){

    womb.camera.lookAt( new THREE.Vector3() );

  }

  womb.addToMouseClickEvents( function(){

    console.log( womb.camera.position );

  });
  
  womb.start = function(){

    womb.stream.play();
  
  }

  function createTextMeshes(){
  
    womb.cabbibo      = createText( 'cabbibo' , 50  );
    womb.presents     = createText( 'presents' , 50 );
    womb.holly        = createText( 'HOLLY' ,  10 );
    womb.holly.body.position.y = 15;
    womb.holly.body.position.z = -12;


    womb.respects = [];
   // womb.respects.push( createText( 'Respect:', 150  ) );
    womb.respects.push( createText( 'FAIRLIGHT' ) );
    womb.respects.push( createText( 'KEWLERS' ) );
    womb.respects.push( createText( 'CNCD' ));
    womb.respects.push( createText( 'XPLSV' ));
    womb.respects.push( createText( 'ILLOGICTREE') );
    womb.respects.push( createText( 'RGBA' ));
    womb.respects.push( createText( 'QUITE' ));
    womb.respects.push( createText( 'STILL' ));

    for( var i = 0; i < womb.respects.length; i++ ){
      var angle = ( (i +1) / (womb.respects.length-1) ) * Math.PI;
      womb.respects[i].body.position = m.toCart( 500 , angle , 0 );
    
      womb.respects[i].body.position.y = womb.respects[i].body.position.z;
      womb.respects[i].body.position.z = 0;
    }
  
  
  };


  function createText(  text  , size ){

    if( !size ) size = 100;
    var u = {
      texture:    { type: "t", value: womb.stream.texture },
      image:      { type: "t", value: womb.stream.texture },

      color:      { type: "v3", value: new THREE.Vector3( 1,  1 , 1 ) },
      time:       womb.time,
      pow_noise:  { type: "f" , value: 0.01 },
      pow_audio:  { type: "f" , value: .04 },
    }
   
    var uniforms =  THREE.UniformsUtils.merge( [
        THREE.ShaderLib['basic'].uniforms,
        u,
    ]);

    var textTexture = womb.textCreator.createTexture( text );
    uniforms.time             = womb.time;
    uniforms.texture.value    = womb.stream.texture;
    uniforms.image.value      = textTexture;

    var material = new THREE.ShaderMaterial( {
      uniforms:       uniforms, 
      vertexShader:   vertexShaders.passThrough,
      fragmentShader: fragmentShaders.audio.color.image.uv_absDiamond_sub,
      transparent:    true,
      fog:            true,
      opacity:        0.1,
      side:           THREE.DoubleSide
    });

     vertexChunk = [
    
      "vec3 nPos = normalize(pos);",
      
      "vec3 offset;",
      
      "offset.x = nPos.x + Time * .3;",
      "offset.y = nPos.y + Time * .2;",
      "offset.z = nPos.z + Time * .24;",
      
      "vec2 a = vec2( abs( nPos.y ) , 0.0 );",
      
      "float audio = texture2D( AudioTexture , a).r;",
      "vDisplacement = NoisePower * snoise3( offset );",
      "vDisplacement += AudioPower * audio * audio;",
    
      "pos *=  1.0 + vDisplacement;"
 

    ];

    fragmentChunk = [

      
      "float audio = texture2D( AudioTexture , vec2( vUv.x , 0.0 ) ).r;",
      "float audio1 = texture2D( AudioTexture , vec2( vUv.y , 0.0 ) ).r;",

      "vec4 image = texture2D( Texture , vUv );",
      "color = image.rgb * vec3( audio , 0.0 , audio1 );",
      "opacity = image.a * (1.0 - vDisplacement);"

    ];

    //womb.loader.addToLoadBar();

    var textShader = new ShaderCreator({
      fragmentChunk: fragmentChunk,
      vertexChunk: vertexChunk,
      uniforms:{ 
       
        Time:         womb.time,
        Color:        { type:"v3" , value: new THREE.Vector3( .1 , .2 , .3 ) },
        AudioTexture: { type:"t"  , value: womb.stream.texture },
        Texture: { type:"t"  , value: textTexture },
        NoisePower:   { type:"f"  , value: .1 + Math.random()*.2 },
        AudioPower:   { type:"f"  , value: .2 + Math.random()*.2 }
      
      },
      transparent: true

    });


    var mesh = new THREE.Mesh( new THREE.PlaneGeometry(size , size )  , textShader.material );
  
    mesh.scale.x *= textTexture.scaledWidth;

    var being = womb.creator.createBeing();
    being.body.add( mesh );
    return being;

  }

});
