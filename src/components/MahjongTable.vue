<template>
    <div id="mahjongTableContainer"></div>
  </template>
  
  <script lang="ts">
  import { defineComponent, onMounted, onUnmounted } from 'vue';
  import { MahjongSceneService } from '@/service/MahjongSceneService';
  
  export default defineComponent({
    name: 'MahjongTable',
    setup() {
      const sceneService = new MahjongSceneService();
  
      onMounted(() => {
        const container = document.getElementById('mahjongTableContainer');
        if (container) {
          sceneService.init(container);
        }
      });
  
      onUnmounted(() => {
        sceneService.cleanup();
      });
    }
  });
  </script>
  
  <style scoped>
  #mahjongTableContainer {
    width: 100%;
    height: 100vh;
    overflow: hidden;
  }
  </style>
  