<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { io } from 'socket.io-client'
import { RouterView } from 'vue-router';
const socket = ref()

onMounted(() => {
  socket.value = io('http://localhost:3001')
})
</script>

<template>
  <RouterView></RouterView>
</template>

<style>
body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
