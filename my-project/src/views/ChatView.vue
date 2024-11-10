<template>
	<div class="about w-full flex justify-between">
		<div class="w-1/5 bg-white h-screen flex flex-col">
			<ChatUsersComponent :sendMessage="sendMessage" @removeUser="sendMessageOrKickUser" />
			<div class="mt-auto w-full">
				<SimpleButtonComponent @click="router.push('/')">Выход</SimpleButtonComponent>
			</div>
		</div>
		<div class=" w-full max-h-screen overflow-auto m-auto" ref="messagesContainer">
			<div class=" pb-12 mx-6">
				<MessageComponent />
			</div>
			<div class="absolute  bottom-0 w-5/6 bg-white flex flex-row ">
				<inputComponent v-model="message" :value="message" @keydown.enter.prevent="sendMessageOrKickUser" />
				<button @click.prevent="sendMessageOrKickUser"><img class="w-10 h-10" src="../assets/sendMessage.svg"
						alt=""></button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ref as fbRef, getDatabase, push, onValue, remove } from 'firebase/database'
import { v4 as uuidv4 } from 'uuid'

import MessageComponent from "./ChatComponents/MessageComponent.vue";
import inputComponent from "./ChatComponents/InputMessageComponent.vue";
import ChatUsersComponent from './ChatComponents/ChatUsersComponent.vue'
import SimpleButtonComponent from '@/components/SimpleButtonComponent.vue'

const router = useRouter()

const message = ref<string>('')

const roomName = sessionStorage.getItem('roomName')
const userName = sessionStorage.getItem('UserName')

interface IMessage {
	id: string
	text: string,
	user: string,
	timestamp: string
}

const messagesContainer = ref<HTMLElement | null>(null)

function sendMessage() {
	const roomName = sessionStorage.getItem('roomName')
	const userName = sessionStorage.getItem('UserName')
	if (!userName) {
		console.error('User is not authorized to send messages')
		return
	}

	const db = getDatabase()

	// Отправка сообщения
	const roomMessageRef = fbRef(db, `messages/${roomName}`)
	const newMessage: IMessage = {
		id: uuidv4(),
		text: message.value,
		user: userName,
		timestamp: new Date().toLocaleString()
	}
	push(roomMessageRef, newMessage)
}

function sendMessageOrKickUser() {
	const db = getDatabase()
	const id = sessionStorage.getItem('id')
	const userRef = fbRef(db, `users/${roomName}/${id}`)

	onValue(userRef, (snapshot) => {
		if (!snapshot.exists()) {
			remove(userRef)
			router.push('/')
			return
		}
		else if (message.value.length > 0) {
			sendMessage()
			message.value = ''
		}
	})
}

</script>