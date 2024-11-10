<template>
  <input class="bg-green-500 w-full p-2 rounded-md  text-xl outline-none placeholder:opacity-100" v-model="model" />
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

