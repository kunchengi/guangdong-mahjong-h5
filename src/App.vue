<template>
  <GameView />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import GameView from './views/GameView.vue';
export default defineComponent({
  name: 'App',
  components: {
    GameView
  }
});
</script>

<style>
html,
body,
#app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
