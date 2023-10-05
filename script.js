import * as THREE from './js/three.module.js';
import { OrbitControls } from './js/OrbitControls.js';

// Select the container for the scene
const container = document.getElementById('container');

// Create the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({alpha: true,
    antialias: true});
renderer.shadowMap.enabled = true

renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

// Load the panoramic image and create a texture
const loader = new THREE.TextureLoader();
const texture = loader.load('bg.jpg');

// Create a spherical geometry and map the texture to it
const geometry = new THREE.SphereGeometry(500, 60, 40);

// Flip the geometry inside out
geometry.scale(-1, 1, 1);

const material = new THREE.MeshBasicMaterial({
    map: texture
});

const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

// Set up the camera and controls
camera.position.set(0, 10, 13);

const controls = new OrbitControls(camera, renderer.domElement);


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize, false);

class Box extends THREE.Mesh {
    constructor({
      width,
      height,
      depth,
      color = '#00ff00',
      emissive,
      velocity = {
        x: 0,
        y: 0,
        z: 0
      },
      position = {
        x: 0,
        y: 0,
        z: 0
      },
      zAcceleration = false,
      xAcceleration = false
    }) {
      super(
        new THREE.BoxGeometry(width, height, depth),
        new THREE.MeshPhongMaterial({ color: color ,  emissive: emissive, emissiveIntensity: 2, shininess: 0})
      )

      this.width = width
      this.height = height
      this.depth = depth

      this.position.set(position.x, position.y, position.z)

      this.right = this.position.x + this.width / 2
      this.left = this.position.x - this.width / 2

      this.bottom = this.position.y - this.height / 2
      this.top = this.position.y + this.height / 2

      this.front = this.position.z + this.depth / 2
      this.back = this.position.z - this.depth / 2

      this.velocity = velocity
      this.gravity = -0.002

      this.zAcceleration = zAcceleration
      this.xAcceleration = xAcceleration
    }

    updateSides() {
      this.right = this.position.x + this.width / 2
      this.left = this.position.x - this.width / 2

      this.bottom = this.position.y - this.height / 2
      this.top = this.position.y + this.height / 2

      this.front = this.position.z + this.depth / 2
      this.back = this.position.z - this.depth / 2
    }

    update(ground) {
      this.updateSides()

      if (this.zAcceleration && this.velocity.z > 0) this.velocity.z += 0.0003
      if (this.zAcceleration && this.velocity.z < 0) this.velocity.z -= 0.0003
      if (this.xAcceleration && this.velocity.x > 0) this.velocity.x += 0.0003
      if (this.xAcceleration && this.velocity.x < 0) this.velocity.x -= 0.0003

      this.position.x += this.velocity.x
      this.position.z += this.velocity.z

      this.applyGravity(ground)
    }

    applyGravity(ground) {
      this.velocity.y += this.gravity

      // this is where we hit the ground
      if (
        boxCollision({
          box1: this,
          box2: ground
        })
      ) {
        const friction = 0.5
        this.velocity.y *= friction
        this.velocity.y = -this.velocity.y
      } else this.position.y += this.velocity.y
    }
  }

  function boxCollision({ box1, box2 }) {
    const xCollision = box1.right >= box2.left && box1.left <= box2.right
    const yCollision =
      box1.bottom + box1.velocity.y <= box2.top && box1.top >= box2.bottom
    const zCollision = box1.front >= box2.back && box1.back <= box2.front

    return xCollision && yCollision && zCollision
  }

  const cube = new Box({
    width: 1,
    height: 1,
    depth: 1,
    color: '#00f2fe',
    emissive: '#00f2fe',
    velocity: {
      x: 0,
      y: -0.01,
      z: 0
    }, 
    position: {
      x: 0,
      y: 0,
      z: 0
    }
  })
  cube.castShadow = true
  scene.add(cube)

  const ground = new Box({
    width: 50,
    height: 0.5,
    depth: 50,
    color: '#0c1f3d',
    emissive: '#0c1f3d',
    position: {
      x: 0,
      y: -2,
      z: 0
    }
  })

  ground.receiveShadow = true
  scene.add(ground)

  const ground1 = new Box({
    width: 10,
    height: 0.5,
    depth: 10,
    color: '#d900fa',
    emissive: '#d900fa',
    position: {
      x: 0,
      y: -1.999,
      z: 0
    }
  })

  ground1.receiveShadow = true
  scene.add(ground1)

  const light = new THREE.DirectionalLight(0xffffff, 1)
  light.position.y = 5
  light.castShadow = true
  scene.add(light)


  scene.add(new THREE.AmbientLight(0xffffff, 0.5))

  console.log(ground.top)
  console.log(cube.bottom)

  const keys = {
    a: {
      pressed: false
    },
    d: {
      pressed: false
    },
    s: {
      pressed: false
    },
    w: {
      pressed: false
    }
  }

  window.addEventListener('keydown', (event) => {
    switch (event.code) {
      case 'KeyA':
        keys.a.pressed = true
        break
      case 'KeyD':
        keys.d.pressed = true
        break
      case 'KeyS':
        keys.s.pressed = true
        break
      case 'KeyW':
        keys.w.pressed = true
        break
      case 'Space':
        if(cube.position.y <= -0.8){
          cube.velocity.y = 0.1
        }
        break
    }
  })

  window.addEventListener('keyup', (event) => {
    switch (event.code) {
      case 'KeyA':
        keys.a.pressed = false
        break
      case 'KeyD':
        keys.d.pressed = false
        break
      case 'KeyS':
        keys.s.pressed = false
        break
      case 'KeyW':
        keys.w.pressed = false
        break
    }
  })

  const enemies = []
  let score = 0
  let frames = 0
  let spawnRate = 200


// Animation loop
let lastTime = 0;
const rotationSpeed = 0.00005;


window.addEventListener("keydown", (e) => {
  if(event.key === "Enter"){
    document.querySelector(".UI").style.display = `none`
    animate()
  }
})

function animate1() {
    const animationId = requestAnimationFrame(animate1)


    renderer.render(scene, camera);    

    cube.update(ground)
    

}


function animate() {
    const animationId = requestAnimationFrame(animate)


    renderer.render(scene, camera);


    cube.velocity.x = 0
    cube.velocity.z = 0
    if (keys.a.pressed) cube.velocity.x = -0.2
    else if (keys.d.pressed) cube.velocity.x = 0.2

    if (keys.s.pressed) cube.velocity.z = 0.2
    else if (keys.w.pressed) cube.velocity.z = -0.2



    cube.update(ground)
    enemies.forEach((enemy) => {
      enemy.update(ground)
      score = enemies.length
      const counter = document.querySelector('#counter')
      counter.innerHTML = score
      if (
        boxCollision({
          box1: cube,
          box2: enemy
        })
      ) {
        cancelAnimationFrame(animationId)
      }else if(cube.position.y <- 5){
        cancelAnimationFrame(animationId)
      }
    })

    if (frames % spawnRate === 0) {
        if (spawnRate > 20) spawnRate -= 20
        let xrandom = (Math.random() - 0.5) * 50
        let zrandom = (Math.random() - 0.5) * 50
        let xrandomspawn = 0
        let zrandomspawn = 0

        if(-5 < xrandom < 5 && -5 < zrandom < 5) {
          const decider = Math.random() - 0.5
          if(decider > 0){
            if(xrandom > 0){
              xrandom = xrandom + 5
            }else {
              xrandom = xrandom - 5
            }
          }else{
            if(zrandom > 0){
              zrandom = zrandom + 5
            }else {
              zrandom = zrandom - 5
            }
          }
        }
        if(
          xrandom > 5 && zrandom > 5 || 
          xrandom < -5 && zrandom < -5 ||
          xrandom > 5 && zrandom < -5 ||
          xrandom < -5 && zrandom > 5 
          ){
          const decider = Math.random() - 0.5
          if(decider > 0){
            if(xrandom > 0){
              console.log("WW")
              xrandom = xrandom - 5
            }else {
              xrandom = xrandom + 5
            }
          }else{
            if(zrandom > 0){
              zrandom = zrandom - 5
            }else {
              zrandom = zrandom + 5
            }
          }
        }

        

      const enemy = new Box({
        width: 1,
        height: 1,
        depth: 1,
        position: {
          x: xrandom,
          y: 0,
          z: zrandom
        },
        velocity: {
          x: 0.01 * -xrandom,
          y: 0,
          z: 0.01 * -zrandom
        },
        color: '#b8030a',
        emissive: '#b8030a',
        zAcceleration: true,
        xAcceleration: true
      })
      enemy.castShadow = true
      scene.add(enemy)
      enemies.push(enemy)
    }

    frames++
}

animate1();






