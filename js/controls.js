
/*
 * Nick Sullivan
 * http://github.com/ncksllvn
 * controls.js
 * this file contains the camera controller and event handlers
 */

var ONE_BUTTON=49;      // key codes for the onkeydown handler
var TWO_BUTTON=50;
 
// function to control the sliders (jQuery)
$( function(){

    var particle_span=$( '#electron-amount' )
        .html( shown_electrons );
        
    var intensity_span= $( '#intensity' )
        .html( intensity );
    
    var ELECTRON_RANGE=MAX_ELECTRONS-MIN_ELECTRONS;
    
    var INTENSITY_RANGE=MAX_INTENSITY-MIN_INTENSITY;
    
    $('#electron-control')
        .simpleSlider()
        .simpleSlider('setValue', (shown_electrons-MIN_ELECTRONS)/MAX_ELECTRONS )
        .bind('slider:ready slider:changed',         
            function (event, data) {
            
                var val=MIN_ELECTRONS + data.value*ELECTRON_RANGE;
            
                while (val > shown_electrons)
                    shown_electrons++;
                
                while (val < shown_electrons)
                   electrons[--shown_electrons].sleep();
                    
                 particle_span.html( shown_electrons );
                 
    }); 
    
    $( '#intensity-control' )
        .simpleSlider()
        .simpleSlider( 'setValue', (intensity-MIN_INTENSITY)/MAX_INTENSITY )
        .bind('slider:ready slider:changed', 
            function (event, data) {
                
                intensity=parseInt( MIN_INTENSITY + data.value*INTENSITY_RANGE );
                intensity_span.html( intensity );
            
    });
    
    $( '#background-button' ).on( 'click', 
        function(){
            on_key_down( { keyCode : ONE_BUTTON } );
    });
    
    $( '#sphere-button' ).on( 'click', 
        function(){
            on_key_down( { keyCode : TWO_BUTTON } );
    });
    
    // register the event listeners
    document.addEventListener( 'keydown', on_key_down, false );
    document.addEventListener( 'onmousedrag', on_mouse_drag, false );
    window.addEventListener( 'resize', on_window_resize, false ); 
    onload();
});


/* 
   on_mouse_drag handles the onmousedrag event
   note: onmousedrag is a CUSTOM event (see mouse.js)
   desc: rotates the scene when the user drag with their mouse
*/
function on_mouse_drag(){
    var z_vec=new THREE.Vector3( 0, 0, 1);
    var drag_vec=new THREE.Vector3( mouse.dx, mouse.dy, 0);
    var axis=new THREE.Vector3().crossVectors(z_vec, drag_vec);
    var degrees=SENSITIVITY*drag_vec.length();
    rotation_matrix.identity();
    if (drag_vec.length()>0)  // if length() returns 0, this will cause NaN's
        rotation_matrix.rotateByAxis( axis, degrees );
}

// maintain the aspect ratio on the resize event
function on_window_resize() {  
	var window_half_x = window.innerWidth / 2;
	var window_half_y = window.innerHeight / 2;
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

// handles all key events and dishes out the work
function on_key_down(event){

    switch( event.keyCode ){
    
        case ONE_BUTTON:
            document.body.style.backgroundColor=
                ( document.body.style.backgroundColor=='white' ) ? 'black' : 'white';
            break;
            
        case TWO_BUTTON:
            sphere.visible=!sphere.visible;
            
        default: 
            break;
            
    }
    
}

