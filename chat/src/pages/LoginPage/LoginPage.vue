<template>
    <main class="chatMain">
        <h1>ChatMate</h1>
        <div class="chatMain__form" style="width: 400px;">
            <InputComponent :placeholder="'Enter your name'"></InputComponent>
            <RoomSelect :Rooms="Rooms"></RoomSelect>
            <SimpleButtonComponent></SimpleButtonComponent>
        </div>
    </main>
</template>

<script setup>
import { ref, computed } from 'vue';
import InputComponent from '@/components/InputComponent.vue';
import RoomSelect from './components/RoomSelect.vue';
import SimpleButtonComponent from '../../components/SimpleButtonComponent.vue';

const Rooms = ref([
    {
        name: 'Room 534',
        id: 1
    },
    {
        name: 'Room 2',
        id: 2
    },
    {
        name: 'Room 3',
        id: 3
    }
]);


</script>

<style scoped>
h1 {
    text-align: center;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.chatMain {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    overflow: hidden;
}
</style>