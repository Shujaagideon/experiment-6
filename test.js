import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'

import vertex from './shaders/vertex'
import fragment from './shaders/fragment'

import * as dat from 'dat.gui'
// import datGuiImage from 'dat.gui.image'
// datGuiImage(dat)
import gsap from 'gsap'
import helix from '../assets/helix2.glb';
import capsule from '../assets/capsule.gltf';
import pebbles from '../assets/pebbles.gltf';
import logo from '../assets/logo.glb';
import whiteMatcap from '../assets/matcap2.jpg';
import blueMatcap from '../assets/matcap-blue.jpg';
import glassMatcap from '../assets/matcap-glass.jpg';
import redMatcap from '../assets/matcap-red.jpg';
import normal from '../assets/normal1.jpg';
import normal2 from '../assets/normal2.jpg';

import { TimelineMax } from 'gsap'
import { LoadingManager, OrthographicCamera, TorusGeometry } from 'three'
import main from './main'
let OrbitControls = require('three-orbit-controls')(THREE);

// const createInputEvents = require('simple-input-events')
// const event = createInputEvents(window);



export default class Template {
    constructor(selector, sections) {
        
        this.loadManager = new THREE.LoadingManager();
        this.imgLoader = new THREE.TextureLoader(this.loadManager);
        this.matcaps = {
            helix: this.imgLoader.load(whiteMatcap),
            glass: this.imgLoader.load(glassMatcap),
            logo: this.imgLoader.load(redMatcap),
            blue: this.imgLoader.load(blueMatcap),
            normal: this.imgLoader.load(normal),
            normal2: this.imgLoader.load(normal2),
        }
        this.loader = new GLTFLoader(this.loadManager);
        this.matcaps.normal.wrapS = THREE.RepeatWrapping;
        this.matcaps.normal.wrapT = THREE.RepeatWrapping;
        this.matcaps.normal.repeat.set( 3, 3 );

        this.matcaps.normal2.wrapS = THREE.RepeatWrapping;
        this.matcaps.normal2.wrapT = THREE.RepeatWrapping;
        this.matcaps.normal2.repeat.set( 5, 5 );
        this.images =[];

        // getting the heights of the containing windows
        this.container = selector;
        this.sections = sections;
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.helix = new THREE.Object3D();
        this.logo = new THREE.Object3D();
        this.capsule = new THREE.Object3D();
        this.pebbles = new THREE.Object3D();
        this.helixes = new THREE.Object3D();
        this.helixesParent = new THREE.Object3D();
        this.points = new THREE.Object3D();

        this.mixer = new THREE.AnimationMixer();

        // ---------- materials -----------//

        this.helixmaterial = new THREE.MeshMatcapMaterial({
            matcap: this.matcaps.helix,
            bumpMap: this.matcaps.normal,
            bumpScale: 0.15,
            transparent: true,
            opacity: 1,
        });
        
        this.logomaterial = new THREE.MeshMatcapMaterial({
            matcap: this.matcaps.logo,
            bumpMap: this.matcaps.normal,
            bumpScale: 0.05,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0,
        });

        this.helixesmat;

        this.boxpos = [];
        this.helixParticlepos = [];
        
        this.logochildren = [];
        this.pebblematerials = [];

        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2('#BDBCC6', 0.0013)
        this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true, logarithmicDepthBuffer: true});
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.width, this.height);

        this.container.appendChild(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(
            50, this.width / this.height,
            0.001,
            1000
        );


        // let frustumSize = 10;
        // let aspect = window.innerWidth / window.innerHeight;
        // this.camera = new THREE.OrthographicCamera(frustumSize* aspect / -2, frustumSize*aspect);
        this.camera.position.set(0, 0, 4);
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.time = 0;

        this.paused = false;
        this.materials = [];

        this.loadItems();
        this.loadManager.onLoad = ()=>{
            this.setupResize();
            this.tabEvents();
            this.animations();
            new main().pinSections();
            this.render();
        }
        
        

        // this.settings();
    }

    getRandomProperty(obj, num) {
        let keys = Object.keys(obj);
        return obj[keys[Math.floor(Math.random() * (keys.length-num))]];
    }

    loadItems(){

        // ---------- helix ----------//
        this.loader.load(helix,(gltf)=>{
            
            gltf.scene.traverse(child=>{
                if(child.material && child.material.type === 'MeshStandardMaterial'){
                    child.material = this.helixmaterial;
                }
            })
            this.helix.add(gltf.scene);
            this.scene.add(this.helix);
        })

         // ---------- helix copies----------//
        this.loader.load(helix,(gltf)=>{
            gltf.scene.traverse(child=>{
                if(child.material && child.material.type === 'MeshStandardMaterial'){
                    for (let i = 0; i < child.geometry.attributes.color.count; i++) {
                        if(child.geometry.attributes.color.getY(i) !== 1){
                            console.log('red')
                            child.geometry.attributes.color.setXYZ(i, 5, 5, 8);
                        }
                    }
                    child.material = new THREE.MeshMatcapMaterial({
                        matcap: this.matcaps.helix,
                        bumpMap: this.matcaps.normal,
                        bumpScale: 0.15,
                        vertexColors: true,
                        transparent: true,
                        opacity: 0,
                    })

                    this.helixesmat = child.material;
                }
            })
            this.helixes.add(gltf.scene);
            this.helixes.position.z -=45
            // this.helixes.position.y -=10
            this.helixes.position.x = 20
            this.helixes.rotation.x = -Math.PI/2.7
            this.helixes.rotation.y = -Math.PI/5
            this.scene.add(this.helixes);
        })

        // ----------- logo -------------//
        this.loader.load(logo,(gltf)=>{
            gltf.scene.traverse(child=>{
                if(child.isMesh){
                    child.material = this.logomaterial;
                    // child.rotation.z += Math.PI/2.4;
                    child.rotation.y = Math.PI/2;
                    child.position.z = 2;
                    child.scale.multiplyScalar(0.3);
                    this.logochildren.push(child);
                }
            })
            this.logo.add(gltf.scene);
            this.logo.rotation.x = Math.PI/2;
            this.scene.add(this.logo);
        })

        // ----------- pebbles -----------//
        this.loader.load(pebbles,(gltf)=>{
            let pebbleMatcaps = [this.matcaps.helix, this.matcaps.glass, this.matcaps.blue]
            console.log(gltf);
            gltf.scene.traverse(child=>{
                if(child.material){
                    child.material = new THREE.MeshMatcapMaterial({
                        matcap: pebbleMatcaps[Math.round(Math.random() * (pebbleMatcaps.length-1))],
                        bumpMap: this.matcaps.normal,
                        bumpScale: 0.05,
                        transparent: true,
                        opacity: 0,
                    })
                    this.pebblematerials.push(child.material);
                }
            })
            this.mixer1 = new THREE.AnimationMixer(gltf.scene);
            // this.mixer1.time = 0.3;
            // this.mixer1.setTime(0);
            this.action = this.mixer1.clipAction(gltf.animations[0]);
            this.action.play();

            this.pebbles.add(gltf.scene);
            this.pebbles.position.z -=38;
            this.pebbles.position.x +=20;
            this.scene.add(this.pebbles);
        })

        // --------- Capsules --------------//
        this.loader.load(capsule,(gltf)=>{
            console.log(gltf)
            gltf.scene.traverse(child=>{
                if(child.name === 'Top3'){
                    child.material = new THREE.MeshMatcapMaterial({
                        matcap: this.matcaps.glass,
                        bumpMap: this.matcaps.normal,
                        bumpScale: 0.05,
                        transparent: true,
                        opacity: 0,
                    })
                    this.pebblematerials.push(child.material);
                }
                else if(child.name === 'Bottom1'){
                    child.material = new THREE.MeshMatcapMaterial({
                        matcap: this.matcaps.blue,
                        bumpMap: this.matcaps.normal,
                        bumpScale: 0.05,
                        transparent: true,
                        opacity: 0,
                    })
                    this.pebblematerials.push(child.material);
                }
            })
            this.mixer2 = new THREE.AnimationMixer(gltf.scene);
            // this.mixer2.time = 1;
            // this.mixer2.setTime(0);
            this.action = this.mixer2.clipAction(gltf.animations[0]);
            this.action.play();
            
            this.capsule.add(gltf.scene);
            this.capsule.position.z -=38;
            this.capsule.position.x +=20;
            // this.capsule.scale.multiplyScalar(1.1);
            this.scene.add(this.capsule);
        })
        
        // -------- Helix particles -----------//
        this.helixBoxGeom = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        this.helixSphereGeom = new THREE.SphereGeometry(0.08);
        let geom = [this.helixBoxGeom, this.helixSphereGeom];
        this.helixparticleMat = new THREE.MeshMatcapMaterial({
            transparent: true,
            opacity: 1,
            depthTest: false,
        });
        let number = 1000;

        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                for (let k = 0; k < 10; k++) {
                    this.boxpos.push([(i/2)-(5/2),(j/2)-(5/2),(k/2)-(5/2)]);
                }
            }
        }

        for (let i = 0; i < number; i++) {
            let theta =  0.02 * Math.PI * 2 * (Math.floor(i/8));
            let radius =   0.3 * ((i%8) - 5);

            let x = radius * Math.cos(theta);
            let y = 0.1 * (Math.floor(i/8)-50);
            let z = radius * Math.sin(theta);

            let mat = this.helixparticleMat.clone();
            mat.matcap = this.getRandomProperty(this.matcaps, 3);
            this.particle = new THREE.Mesh(geom[Math.round(Math.random())], mat);
            this.particle.rotateOnAxis(new THREE.Vector3(Math.PI/2,0,0), Math.PI/2);
            // this.particle.position.set(pos[i][0]-5, pos[i][1]-5, pos[i][2]-5);
            this.helixParticlepos.push([x, y, z]);

            this.points.add(this.particle);
            this.helixesParent.rotation.z = Math.PI/6;
            this.helixesParent.rotation.x = -Math.PI/12;
            this.points.position.z = -5;
            this.points.position.x = 2;
            this.helixesParent.add(this.points);
            this.scene.add(this.helixesParent);
        }

    }
    postprocessing(){

    }

    animations(){
        this.sections.forEach((sect, i)=>{
            if(i === 0){
                gsap.fromTo(this.helix.rotation,{
                    scrollTrigger:{
                        trigger: sect,
                        start: 'top 5%',
                        end: '+=1000',
                        scrub: true,
                    },
                    x: -Math.PI/3,
                    y: -Math.PI/4.5,
                    z: this.helix.rotation.z,
                },{
                    scrollTrigger:{
                        trigger: sect,
                        start: 'top 5%',
                        end: '+=1000',
                        scrub: true,
                    },
                    x: 0,
                    y: -Math.PI/12,
                    z: this.helix.rotation.z + 10,
                })
                gsap.fromTo(this.helix.position,{
                    scrollTrigger:{
                        trigger: sect,
                        start: 'top 5%',
                        end: '+=1000',
                        scrub: true,
                    },
                    x: 30,
                    y: -20,
                    z: -60,
                },{
                    scrollTrigger:{
                        trigger: sect,
                        start: 'top 5%',
                        end: '+=1000',
                        scrub: true,
                        onLeave:()=>{
                            gsap.to(this.helixmaterial,{
                                opacity: 0,
                                duration: 1,
                                ease: 'Power.easeIn'
                            })
                        },
                        onEnterBack:()=>{
                            gsap.to(this.helixmaterial,{
                                opacity: 1,
                                duration: 0.4,
                                ease: 'Power.easeIn'
                            })
                            gsap.to(this.logomaterial,{
                                opacity: 0,
                                duration: 0.4,
                                ease: 'Power.easeIn'
                            })
                        }
                    },
                    x: 30,
                    y: 0,
                    z: -120,
                })
            }
            else if(i === 1){
                this.logochildren.forEach(child=>{
                    gsap.fromTo(child.rotation,{
                        scrollTrigger:{
                            trigger: sect,
                            start: 'top 5%',
                            end: '+=4000',
                            scrub: true,
                            
                        },
                        z: child.rotation.z,
                    },{
                        scrollTrigger:{
                            trigger: sect,
                            start: 'top 5%',
                            end: '+=4000',
                            scrub: true,
                        },
                        z: child.rotation.z + 5,
                    })
                })
                gsap.fromTo(this.logo.rotation,{
                    scrollTrigger:{
                        trigger: sect,
                        start: 'top 5%',
                        end: '+=4000',
                        scrub: true,
                        onEnter:()=>{
                            gsap.to(this.logomaterial,{
                                opacity: 1,
                                duration: 0.2,
                                ease: 'Power.easeIn'
                            })
                        }
                    },
                    x: 0,
                    y: -Math.PI/2,
                    z: 0,
                },{
                    scrollTrigger:{
                        trigger: sect,
                        start: 'top 5%',
                        end: '+=4000',
                        scrub: true,
                    },
                    x: 0,
                    y: -Math.PI/2.4,
                    z: Math.PI/6,
                })
                gsap.fromTo(this.logo.position,{
                    scrollTrigger:{
                        trigger: sect,
                        start: 'top 5%',
                        end: '+=4000',
                        scrub: true,
                    },
                    x: 5.5,
                    y: 0,
                    z: -10,
                    onStart:()=>{
                        this.logo.position.set(5.5, 0, -10)
                    }
                },{
                    scrollTrigger:{
                        trigger: sect,
                        start: 'top 5%',
                        end: '+=4000',
                        scrub: true,
                        onLeave:()=>{
                            gsap.to(this.logomaterial,{
                                opacity: 0,
                                duration: 0.4,
                                ease: 'Power.easeIn'
                            })
                            gsap.to(this.pebblematerials,{
                                opacity: 1,
                                duration: 0.2,
                                ease: 'Power.easeIn'
                            })
                        },
                        onEnterBack:()=>{
                            gsap.to(this.logomaterial,{
                                opacity: 1,
                                duration: 0.2,
                                ease: 'Power.easeIn'
                            })
                            gsap.to(this.pebblematerials,{
                                opacity: 0,
                                duration: 0.2,
                                ease: 'Power.easeIn'
                            })
                        }
                    },
                    x: 4.8,
                    y: -.5,
                    z: 0,
                })
            }
            else if(i === 2){
                gsap.from(this.mixer1,{
                    scrollTrigger:{
                        trigger: sect,
                        start: 'top -250%',
                        end: '+=4000',
                        markers: true,
                        scrub: true,
                        onUpdate:(t)=>{
                            this.mixer1.setTime(t.progress * 2)
                            this.mixer2.setTime(t.progress * 2)
                        },
                        onLeave:()=>{
                            gsap.to(this.pebblematerials,{
                                opacity: 0,
                                duration: 0.3,
                                ease: 'Power.easeIn'
                            })
                        },
                        onEnterBack:()=>{
                            gsap.to(this.pebblematerials,{
                                opacity: 1,
                                duration: 0.2,
                                ease: 'Power.easeIn'
                            })
                        }
                    }
                })
            }
            else if(i === 3){
                gsap.to(this.helixesmat,{
                    opacity: 1,
                    scrollTrigger:{
                        trigger: sect,
                        start: 'top -650%',
                        end: '+=3000',
                        markers: true,
                        scrub: true,
                        onUpdate:(t)=>{
                        },
                        onLeave:()=>{
                            gsap.to(this.helixesmat,{
                                opacity: 0,
                                duration: 0.3,
                                ease: 'Power.easeIn'
                            })
                        },
                        onEnterBack:()=>{
                            gsap.to(this.helixesmat,{
                                opacity: 1,
                                duration: 0.2,
                                ease: 'Power.easeIn'
                            })
                        }
                    }
                })
            }
            else if(i === 4){
                this.points.children.forEach(child=>{
                    gsap.fromTo(child.position,{
                        scrollTrigger:{
                            trigger: sect,
                            start: 'top 5%',
                            end: '+=4000',
                            scrub: true,
                        },
                        x: child.rotation.z,
                        y: child.rotation.z,
                        z: child.rotation.z,
                    },{
                        scrollTrigger:{
                            trigger: sect,
                            start: 'top 5%',
                            end: '+=4000',
                            scrub: true,
                        },
                        x: child.rotation.z + 5,
                        y: child.rotation.z + 5,
                        z: child.rotation.z + 5,
                    })
                })
                gsap.fromTo(this.logo.position,{
                    scrollTrigger:{
                        trigger: sect,
                        start: 'top 5%',
                        end: '+=4000',
                        scrub: true,
                    },
                    x: 5.5,
                    y: 0,
                    z: -10,
                    onStart:()=>{
                        this.logo.position.set(5.5, 0, -10)
                    }
                },{
                    scrollTrigger:{
                        trigger: sect,
                        start: 'top 5%',
                        end: '+=4000',
                        scrub: true,
                        onLeave:()=>{
                            gsap.to(this.logomaterial,{
                                opacity: 0,
                                duration: 0.4,
                                ease: 'Power.easeIn'
                            })
                            gsap.to(this.pebblematerials,{
                                opacity: 1,
                                duration: 0.2,
                                ease: 'Power.easeIn'
                            })
                        },
                        onEnterBack:()=>{
                            gsap.to(this.logomaterial,{
                                opacity: 1,
                                duration: 0.2,
                                ease: 'Power.easeIn'
                            })
                            gsap.to(this.pebblematerials,{
                                opacity: 0,
                                duration: 0.2,
                                ease: 'Power.easeIn'
                            })
                        }
                    },
                    x: 4.8,
                    y: -.5,
                    z: 0,
                })
            }
        })
    }
    settings() {
        let that = this;
        this.settings = {
            time: 0,
        };
        this.gui = new dat.GUI();
        this.gui.add(this.settings, 'time', 0, 100, 0.01);
        this.gui.addImage(this.settings, 'texturePath').onChange((image) => {
            body.append(image);
        });
    }

    setupResize() {
        window.addEventListener('resize', this.resize.bind(this));
    }

    resize() {
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.renderer.setSize(this.width, this.height);
        this.camera.aspect = this.width / this.height;

        this.imageAspect = 853 / 1280;
        let a1; let a2;
        if (this.height / this.width > this.imageAspect) {
            a1 = (this.width / this.height) * this.imageAspect;
            a2 = 1;
        } else {
            a2 = (this.height / this.width) * this.imageAspect;
            a1 = 1;
        }
        this.material.uniforms.resolution.value.x = this.width;
        this.material.uniforms.resolution.value.y = this.height;
        this.material.uniforms.resolution.value.z = a1;
        this.material.uniforms.resolution.value.w = a2;
        this.camera.updateProjectionMatrix();
    }

    addObjects() {
        let that = this;
        this.material = new THREE.ShaderMaterial({
            extensions: {
                derivatives: '#extension GL_OES_standard_derivatives : enable'
            },
            side: THREE.DoubleSide,
            uniforms: {
                time: { type: "f", value: 0 },
                uTexture: { type: "t", value: null },
                resolution: { type: "v4", value: new THREE.Vector4() },
                uvRate: {
                    value: new THREE.Vector2(1, 1)
                }
            },
            // wireframe: true,
            // transparent: true,
            vertexShader: vertex,
            fragmentShader: fragment
        });

        this.geometry = new THREE.PlaneBufferGeometry(1, 1, 50, 50);

        this.plane = new THREE.Mesh(this.geometry, this.material);
        // this.scene.add(this.plane);
    }

    tabEvents() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stop()
            } else {
                this.play();
            }
        });
    }
    stop() {
        this.paused = true;
    }

    play() {
        this.paused = false;
    }

    render() {
        if (this.paused) return;
        this.time += 0.05;
        // if(this.mixer1) this.mixer1.update(this.time * 0.0003);
        // if(this.mixer2) this.mixer2.update(this.time * 0.0003);
        this.helix.rotation.z += 0.004;
        this.points.rotation.y = this.time * 0.1;
        if(this.logo.children.length > 0){
            this.logo.children[0].children.forEach(child=>{
                child.rotation.z += 0.004;
            });
        }
        if(this.points.children.length > 0){
            this.points.children.forEach(child=>{
                child.rotation.y = this.time * 0.05;
            });
        }

        requestAnimationFrame(this.render.bind(this));
        this.renderer.render(this.scene, this.camera);
    }
}