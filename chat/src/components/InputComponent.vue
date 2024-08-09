<template>
    <form>
        <div>
            <input type="text" :placeholder="placeholder" @input="watchChange" v-model="message">
        </div>
    </form>
</template>

<script setup>
import { defineProps, ref } from 'vue';

const props = defineProps({
    placeholder: String,
});

const message = ref('');

function watchChange() {
    console.log(message.value);
}
</script>

<style scoped>
input {
    width: 100%;
    padding: 12px 20px;
    margin: 8px 0;
    display: inline-block;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
    font-size: 1.2rem;
}
</style>