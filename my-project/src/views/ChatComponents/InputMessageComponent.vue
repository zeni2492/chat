<template>
    <input class="bg-white w-full p-2 border-l-2 h-auto  text-xl outline-none placeholder:opacity-100" v-model="model" />
  </template>
  
  <script setup lang="ts">
  import { defineProps,ref } from 'vue'
  
  const props = defineProps({
    value: {
      type: String,
      required: true
    }
  })
  
  const model = ref(props.value)
  
  </script>
  
  
  <style>
  ::placeholder{
    opacity:1;
  }
  </style>
  
  