<template>
  <!-- 游戏视图的容器 -->
  <div id="gameContainer">
    <!-- 包含麻将牌桌的组件 -->
    <MahjongTable />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MahjongTable from '../components/MahjongTable.vue';

export default defineComponent({
  name: 'GameView',
  components: {
    MahjongTable
  }
});
</script>

<style scoped>
#gameContainer {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style>
