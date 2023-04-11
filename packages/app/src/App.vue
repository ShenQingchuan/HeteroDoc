<script setup lang="ts">
import NaiveContext from './components/context/naiveUIContext.vue'
</script>

<template>
  <NaiveContext>
    <router-view />
  </NaiveContext>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>
