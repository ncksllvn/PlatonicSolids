
/*
* Nick Sullivan
* http://github.com/ncksllvn
* file: platonic.js
*
* This file contains only the primary/fun functions that manipulate the vertices.
* The controls file has (mostly) everything that deals with user interaction, including
* how the sphere is rotated, and the onscreen slider.
*
* Note that this project uses the amazing three.js (https://github.com/mrdoob/three.js/)
*/

var camera, scene, renderer;                // see THREE.js documentation

var geo_container, sphere, platonic;        // main geometric objects

var WINDOW_HALF_X=window.innerWidth / 2,    // important for maintaining aspect ratio
    WINDOW_HALF_Y=window.innerHeight / 2;   
    
var rotation_matrix=new THREE.Matrix4(),    // performs the rotation when on mouse drag
    SENSITIVITY=0.005;                      // change this to adjust drag/rotation sensitivity

var RADIUS=100;                             // the radius of the circle.

var MAX_PARTICLES=20,                       // the maximum amount of particles allowed on screen
    MIN_PARTICLES=0,                        // the minimum amount...
    shown_particles=3;                      // the number of particles currently showing
    
var MIN_INTENSITY=0,                        // lowest force of particles
    MAX_INTENSITY=600,                      // strongest force of particles
    intensity=30;                           // current speed of particles

// called after the controls are set up
function onload(){
    init();
    on_enter_frame();
}

/*
 * large function that does all of the necessary setting up for THREE.js
 */
function init(){
    scene=new THREE.Scene();                                     // holds all geometry
    renderer = new THREE.WebGLRenderer();                        // renders the scene
    renderer.setSize( window.innerWidth, window.innerHeight);    // sets the screen size
    document.body.appendChild( renderer.domElement );            // appends the renderer - a <canvas> - to the scene
    
    camera = new THREE.PerspectiveCamera(       // most common type of camera
        60,                                     // field of view
        window.innerWidth / window.innerHeight, // aspect ratio: always use this, or else it'll look squished
        1,                                      // near clipping-plane: objects closer than this won't be rendered
        10000                                   // far clipping-plane: objects further away won't be rendered
    );
    
    sphere = new THREE.Mesh( new THREE.SphereGeometry(
            RADIUS*.90,                                              // radius
            20,                                                      // # of segments along width
            20                                                       // # of segments along height
        ), new THREE.MeshBasicMaterial ({                             // fill in the sphere with a material
            color:              0x057d9f,
            wireframe:          true
        }) 
    );  
    
    platonic=new THREE.ParticleSystem( new THREE.Geometry(),         // the container for our particles
        new THREE.ParticleBasicMaterial ({                           // that we will manipulate later
            wireframe:          true,
            size:               25,
            map:                THREE.ImageUtils.loadTexture(
                                    "images/particle.png"
                                ),
            blending:           THREE.AdditiveBlending  ,
            transparent:        true,
            depthWrite:		    false,
            sizeAttenuation:    true
        }) 
    );    

    /* fill up platonic with particles */
    init_platonic();

    /* create a container for mouse drag rotations */
    geo_container = new THREE.Object3D();  
    geo_container.add( sphere );
    geo_container.add( platonic );
    
    /* add that container to the scene */
    scene.add( geo_container );
    
    /* set up camera */
    camera.position.z = -RADIUS*2.5;
    camera.lookAt( scene.position );

 }
/* 
 * called every frame of animation
 * tradition as3 name for the function called every frame (~60 fps)
 */
function on_enter_frame(){

    /* request this function again for the next frame */
    requestAnimationFrame( on_enter_frame );
    
    /* rotate the sphere (see controls.js) */
    if (mouse.is_dragging){
        geo_container.applyMatrix( rotation_matrix );
        rotation_matrix.identity();
    }
    
    /* animate those particles that need animating */
    platonic.geometry.vertices
        .slice( 0, shown_particles )
        .forEach(update_position);
    
    /* inform THREE.js that we've moved the particles */
    platonic.geometry.verticesNeedUpdate=true;
    
    /* rotate the sphere */
    sphere.rotation.y-=0.003;
    
    
    /* let the renderer do its thing */
    renderer.render( scene, camera );
}

/*
 * the fun part
 * controls all of the particles that should be updated
 */
function update_position(particle, index){

    // loop through all the particles, applying their "push" to this particle
    platonic.geometry.vertices
        .slice( index, shown_particles )
        .forEach(
            function(other_particle){
            
                var force = Math.inverse(
                        particle.distanceToSquared( other_particle )
                        ) * intensity;
                
                var other_particle_force = other_particle.clone()
                    .multiplyScalar( force )
                    .negate();
                
                var this_particle_force = particle.clone()
                    .multiplyScalar( force )
                    .negate();
                
                other_particle.add( this_particle_force );
                particle.add( other_particle_force );
    });
    
    // move the particle back onto the sphere
    particle.show();
}


/*
 * fills our platonic array with lots of particles
 *
 * Note the way this is working:
 * I am adding the maximum amount of vertices to our platonic geometry now,
 * because vertices added during runtime are very costly. So, the ones that
 * are not shown are simply moved off screen and are not interacted with by 
 * other vertices.
 *
 */

function init_platonic(){
    for (var i=0; i<MAX_PARTICLES; i++){
        platonic.geometry.vertices.push( new THREE.Vector3.random(i) );
        if (i<shown_particles)
            platonic.geometry.vertices[i].show();
        else
            platonic.geometry.vertices[i].be_gone();
    }
}



