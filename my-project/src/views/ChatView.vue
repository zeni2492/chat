<template>
	<main class="about w-full flex justify-between">
		<aside class="UserAside w-1/5 bg-white h-screen flex flex-col" :class="{ hidden: showUsers }">
			<ChatUsersComponent :sendMessage="sendMessage" @removeUser="sendMessageOrKickUser" />
			<div class="DesktopButton mt-auto w-full" >
				<SimpleButtonComponent class="font-bold" @click="router.push('/')">Exit</SimpleButtonComponent>
			</div>
		</aside>
		<div class=" w-full max-h-screen overflow-auto m-auto" ref="messagesContainer">
			<div class="messages pb-12 mx-6">
				<MessageComponent />
			</div>
			<form class="inputMessage absolute  bottom-0 w-5/6 bg-white flex flex-row ">
				<span @click="showUsers = !showUsers" class="more cursor-pointer justify-center items-center"><img
						class=" w-10 h-10" src="@/assets/more.svg" alt=""></span>
				<inputComponent v-model="message" :value="message" @keydown.enter.prevent="sendMessageOrKickUser" />
				<button @click.prevent="sendMessageOrKickUser"><img class="w-10 h-10" src="../assets/sendMessage.svg"
						alt=""></button>
			</form>
		</div>
	</main>
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

const messagesContainer = ref<HTMLElement | null>(null) // 

const mediaQuery = window.matchMedia('(max-width: 760px)'); // check if the screen is less than 760px and it does switching variable from false to true and back
const showUsers = ref(mediaQuery.matches);

mediaQuery.addEventListener('change', (event) => {
	showUsers.value = event.matches;
});

function sendMessage() { // send message
	const roomName = sessionStorage.getItem('roomName') // gets the room name
	const userName = sessionStorage.getItem('UserName') // gets the user name
	if (!userName) { // if the user name is not found
		console.error('User is not authorized to send messages')
		return
	}

	const db = getDatabase() // gets the database

	// send message
	const roomMessageRef = fbRef(db, `messages/${roomName}`)
	const newMessage: IMessage = { // create a new message
		id: uuidv4(),
		text: message.value,
		user: userName,
		timestamp: new Date().toLocaleString()
	}
	push(roomMessageRef, newMessage)
}

function sendMessageOrKickUser() {
	const db = getDatabase()
	const id = sessionStorage.getItem('id') ?? '' // gets the user id or empty string

	const userRef = fbRef(db, `users/${roomName}/${id}`) 

	const isAdmin = sessionStorage.getItem('isAdmin') ?? 'false' // gets the admin role or empty string

	if (isAdmin === 'true') { // if the user is an admin
		sendMessage()
		onValue(userRef, (snapshot) => { // checks if the user is in the room
			if (snapshot.exists() && snapshot.val() !== null) {
				const UserId = snapshot.val().id
				kickUser(UserId)
			}
		})
	} else {
		onValue(userRef, (snapshot) => {
			if (!snapshot.exists()) {
				try {
					alert('you were kicked')
					kickUser(id)
				} catch (error) {
					console.log(error);
				}
			} else {
				sendMessage()
			}
		})
	}
}

const kickUser = (userId: string) => {
	const db = getDatabase()
	const userRef = fbRef(db, `users/${roomName}/${userId}`)
	remove(userRef)
}

</script>


<style scoped>
.more {
	display: none;
}

.UserAside {
	transition: 0.3s ease;
	width: 20%;
}

.hidden {
	width: 0px;
}

.exitMobileButton{
	display: none
}

@media screen and (min-width: 761px) {
	.UserAside {
		width: 20%;
	}
}

@media screen and (max-width: 760px) {
	.UserAside {
		width: 100%;
		position: absolute;
	}

	.UserAside:not(.hidden) {
		width: 100%;
		position: absolute;
	}


	.inputMessage {
		width: 100% !important;

	}

	.more {
		display: block;
	}
	.DesktopButton{
		display: none
	}

	.exitMobileButton{
		display: block
	}
}
</style>