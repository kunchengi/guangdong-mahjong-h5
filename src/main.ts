import { createApp } from 'vue'
import App from './App.vue'
import { PerspectiveCamera, Scene, WebGLRenderer } from 'three';

const app = createApp(App);

// 创建Three.js场景
const scene = new Scene();
// 创建Three.js相机，视角为75度，宽高比为浏览器窗口的宽高比，视野从0.1到1000
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// 创建Three.js渲染器
const renderer = new WebGLRenderer();
// 设置渲染器的大小为浏览器窗口的大小
renderer.setSize(window.innerWidth, window.innerHeight);
// 将渲染器的DOM元素添加到body中
document.body.appendChild(renderer.domElement);

// 设置相机位置
camera.position.z = 5;

/**
* @description 动画
* @param
* @return void
* @status public
*/
function animate() {
    // 使动画循环渲染
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();
  
  app.mount('#app');