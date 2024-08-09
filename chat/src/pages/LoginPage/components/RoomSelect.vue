<template>
    <div>
        <div>
            <select name="" id="">
                <option selected value=""></option>
                <option v-for="Room in Rooms" value="Room.name">{{ Room.name }}</option> <!--iterating over rooms-->
            </select>
        </div>
    </div>
</template>

<script setup>
import { ref, defineProps } from 'vue';

const props = defineProps({ // defining props
    Rooms: {
        type: Object,
        required: true
    }
});
</script>

<style scoped>
select {
    width: 100%;
    padding: 12px 20px;
    margin: 8px 0;
    display: inline-block;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
    font-size: 1.2rem;
}

option {
    font-size: 1.2rem;

}
</style>