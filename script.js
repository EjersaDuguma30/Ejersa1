import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import {OrbitControls} from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js";

const loader=document.querySelector("#loader");
window.addEventListener("load",()=>setTimeout(()=>loader.classList.add("hide"),1200));
const nav=document.querySelector(".nav");window.addEventListener("scroll",()=>nav.classList.toggle("scrolled",scrollY>50));

function makeHotel(container,compact=false){
 const scene=new THREE.Scene();scene.background=new THREE.Color(compact?0xd9d5cc:0x151515);
 const camera=new THREE.PerspectiveCamera(45,container.clientWidth/container.clientHeight,.1,1000);
 camera.position.set(compact?10:13,compact?8:7,compact?13:15);
 const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(container.clientWidth,container.clientHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;container.appendChild(renderer.domElement);
 const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.06;controls.minDistance=compact?7:10;controls.maxDistance=compact?25:30;controls.maxPolarAngle=Math.PI*.48;controls.target.set(0,2,0);

 scene.add(new THREE.HemisphereLight(0xfff2dc,0x202a3b,2.2));
 const sun=new THREE.DirectionalLight(0xffe1b0,4);sun.position.set(7,13,5);sun.castShadow=true;scene.add(sun);
 const fill=new THREE.PointLight(0x7aa8ff,18,30);fill.position.set(-7,5,3);scene.add(fill);

 const hotel=new THREE.Group();scene.add(hotel);
 const mat=(color,rough=.5,metal=0)=>new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal});
 const wall=mat(0xd9d0c1,.72), dark=mat(0x252525,.35), glass=new THREE.MeshPhysicalMaterial({color:0x9bc9e8,transparent:true,opacity:.35,roughness:.1,metalness:.1});
 const addBox=(x,y,z,sx,sy,sz,m,parent=hotel)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o};
 // podium
 addBox(0,.25,0,20,.5,15,dark); addBox(0,5,0,17,9,12,wall);
 // glass facade
 addBox(0,4.8,6.03,15,7.8,.12,glass);
 // entrance
 addBox(0,2.2,6.12,3.5,4.3,.18,dark);
 // roof
 addBox(0,9.8,0,18,.5,13,dark);
 // side wings
 addBox(-8,3,-.2,2.5,6,10,wall);addBox(8,3,-.2,2.5,6,10,wall);
 // windows
 for(let x=-6;x<=6;x+=3){for(let y=3;y<=7;y+=2){addBox(x,y,6.16,1.6,1.1,.08,glass)}}
 // columns
 for(let x=-7;x<=7;x+=3.5)addBox(x,2.4,6.25,.22,4.8,.22,dark);
 // lobby interior floor and desk
 addBox(0,.58,3.8,12,.12,3.5,mat(0x8b6f50,.45,0.1));addBox(0,1.4,2.7,4,.9,1,dark);
 // sofa
 addBox(-4,1.1,2.8,2.5,.7,1.1,mat(0x8e9b91,.8));addBox(4,1.1,2.8,2.5,.7,1.1,mat(0x8e9b91,.8));
 // rooftop pool
 const pool=new THREE.Mesh(new THREE.BoxGeometry(7,.25,4),new THREE.MeshPhysicalMaterial({color:0x5db9d5,transparent:true,opacity:.75,roughness:.05}));pool.position.set(0,10.15,1);pool.userData.focus="pool";hotel.add(pool);
 // palm-like decorative trees
 for(let x of [-6,6]){const trunk=addBox(x,3.2,3.2,.18,5,.18,mat(0x5b3c27,.8));for(let i=0;i<5;i++){const leaf=new THREE.Mesh(new THREE.ConeGeometry(.35,2,6),mat(0x365a42,.9));leaf.position.set(x+(i-2)*.35,5.8,3.2);leaf.rotation.z=(i-2)*.25;hotel.add(leaf)}}
 // glowing entrance
 const glow=new THREE.PointLight(0xffc36a,12,9);glow.position.set(0,2.5,6.8);hotel.add(glow);
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:compact?0xc4bfb5:0x111111,roughness:.9}));floor.rotation.x=-Math.PI/2;floor.position.y=0;floor.receiveShadow=true;scene.add(floor);
 // stars/particles
 const geo=new THREE.BufferGeometry(), pts=[];for(let i=0;i<600;i++)pts.push((Math.random()-.5)*80,Math.random()*30,(Math.random()-.5)*80);geo.setAttribute("position",new THREE.Float32BufferAttribute(pts,3));scene.add(new THREE.Points(geo,new THREE.PointsMaterial({color:0xffffff,size:.045,transparent:true,opacity:.55})));
 let target=null;
 const focus={reception:new THREE.Vector3(0,2,5),lounge:new THREE.Vector3(-4,2.5,3),pool:new THREE.Vector3(0,10,2)};
 function setFocus(name){target=focus[name]||focus.reception}
 function animate(){requestAnimationFrame(animate);hotel.rotation.y+=.00045;controls.update();if(target){controls.target.lerp(target,.035);camera.position.lerp(target.clone().add(new THREE.Vector3(8,5,9)),.035);if(camera.position.distanceTo(target)<.7)target=null}renderer.render(scene,camera)}
 animate();
 new ResizeObserver(()=>{camera.aspect=container.clientWidth/container.clientHeight;camera.updateProjectionMatrix();renderer.setSize(container.clientWidth,container.clientHeight)}).observe(container);
 return {setFocus};
}
const hero=makeHotel(document.querySelector("#hero3d"),false);
const lobby=makeHotel(document.querySelector("#lobby3d"),true);
document.querySelector("#enterLobby").onclick=()=>document.querySelector("#lobby").scrollIntoView({behavior:"smooth"});
document.querySelectorAll("[data-focus]").forEach(b=>b.onclick=()=>lobby.setFocus(b.dataset.focus));
document.querySelector("#check").onclick=()=>alert("Demo booking system: connect this form to your real booking backend.");
document.querySelector(".hamb").onclick=()=>document.querySelector(".nav nav").classList.toggle("open");
const s=document.createElement("style");s.textContent="@media(max-width:850px){.nav nav.open{display:flex;position:absolute;top:78px;left:0;right:0;background:#181814f2;padding:25px;flex-direction:column;gap:18px}}";document.head.appendChild(s);