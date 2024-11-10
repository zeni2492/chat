<template>
    <main v-for="message in messagesList" :key="message.id" class=" flex flex-col items-start mt-2" :class="userName=== message.user ? 'items-end' : 'items-start'">
        <h2 class="text-right  text-clip mx-2" :class="userName === message.user ? 'text-white' : 'text-black'">{{message.user}}</h2>
        <div class="container p-1 max-w-96 inline-block rounded-xl" :class="userName=== message.user ? 'bg-green-800' : 'bg-blue-800'">
            <h2 class="container__text text-xl break-all text-white">
                {{ message.text }}
            </h2>
            <div class=" text-sm text-right mt-2 ml-1 text-white">
                 {{ message.timestamp }}
            </div>
        </div>
    </main>
</template>


<script setup lang="ts">
//component to display messages

import { ref } from 'vue'
import { ref as fbRef, getDatabase, onValue } from 'firebase/database'
const db = getDatabase()

const messagesRef = fbRef(db, `messages/${sessionStorage.getItem('roomName')}`)
const userName = sessionStorage.getItem('UserName')

interface Message {
  id: string;
  user: string;
  text: string;
  timestamp: string;
}

const messagesList = ref<Message[]>([]) // initialize with an empty array

onValue(messagesRef, (snapshot) => { // get the messages from the database
  const messages = snapshot.val();
  messagesList.value = messages
})
</script>