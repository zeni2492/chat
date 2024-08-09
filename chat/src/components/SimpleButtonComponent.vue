<template>
    <div>
        <form action="/chat">
            <button type="submit" @click="click">Submit</button>
        </form>
    </div>
</template>

<script>
import { ref } from 'vue';

</script>

<style scoped>
button {
    width: 100%;
    padding: 5px;
    background: var(--user-navigation);
    outline: none;
    border: none;
    border-radius: 5px;
    color: var(--white);
    cursor: pointer;
    font-size: 1.2rem;
}
</style>