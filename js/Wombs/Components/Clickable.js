define(function(require, exports, module) {

  require( 'lib/three.min' );


  function onHoverOver(){

    this.hovered = true;
    var f = this.clickableParams.onHoverOver.bind( this );
    f();
  }

  function onHoverOut(){

    this.hovered = false;
    var f = this.clickableParams.onHoverOut.bind( this );
    f();
  
  }

  function onClick(){

    if( this.hovered == true ){
      var f = this.clickableParams.onClick.bind( this );
      f();
    }

  }

  function Clickable( mesh , parameters ){

    params = _.defaults( parameters || {} , {

      onClick:      function(){},
      onHoverOver:  function(){},
      onHoverOut:   function(){},

    });

    mesh.clickableParams = params;

    mesh._onHoverOver = onHoverOver.bind( mesh );
    mesh._onHoverOut  = onHoverOut.bind(  mesh );
    mesh._onClick     = onClick.bind(     mesh );

    womb.addToMouseClickEvents( mesh._onClick ); 
    womb.raycaster.addCheckedMesh( mesh );
 
    return mesh;

  }

  
  module.exports = Clickable;


});
