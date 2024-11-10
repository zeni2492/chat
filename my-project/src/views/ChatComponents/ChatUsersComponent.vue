<template>
    <main class="body border-b-2 max-h-screen overflow-auto">
        <header class="border-b-2 p-2 w-full flex justify-between items-center">
            <h1>Room : {{ RoomName }}</h1>
            <aside class="exitMobileButton mt-auto text-sm bg-green-500 w-10 rounded-full items-center justify-center text-white text-center"><button @click="$router.push('/')" class="w-full flex justify-center items-center">Exit</button></aside>
        </header>
        <div class="ml-2 flex flex-row items-center border-none whitespace-nowrap">
            Users :
            <div class="w-full"><input class="searchUser w-4/5 outline-none border-b-2 ml-2 text-sm" v-model="FindUser" type="text"></div>
        </div>
        <div class="flex flex-row items-center mt-2  ml-2" v-for="user in searchedUsers " :key="user.id">
            <img class="cursor-pointer w-10 h-10 mr-2" src="../../assets/userIcon.svg" alt="">
            <div class="flex w-full flex-row items-center justify-between">
                <span class="font-bold" :class="userName == user.Login ? 'text-green-600' : 'text-black'">{{ user.Login }}</span>
                <button v-if="!isAdmin && user.id !== id" @click="$emit('removeUser',kickUser(user.id) )"   class="ml-auto mr-2"><img class="w-5 h-5" src="@/assets/trashCan.svg" alt=""></button>
            </div>
        </div>
    </main>
</template>

<script setup lang="ts">
import { ref as fbRef, getDatabase, onValue, remove } from 'firebase/database'
import { ref, Ref, computed,defineEmits} from 'vue'

const Users: Ref<IUsers[]> = ref([])// initialize with an empty array
const FindUser = ref<string>('')
const RoomName = sessionStorage.getItem('roomName') ?? sessionStorage.getItem('newRoomName');
const userName = sessionStorage.getItem('UserName')
const id = sessionStorage.getItem('id')

const isAdmin = ref(false)

interface IUsers {
    id: string,
    isAdmin: boolean,
    Login: string
}

const getUsers = async () => { // async function that updates the Users array
  const db = getDatabase()
  const roomRef = fbRef(db, `users/${RoomName}`) // get the users from the database

  onValue(roomRef, (snapshot) => { 
    const users = Object.values(snapshot.val()) as IUsers[]
    const uniqueUsers = [...new Set(users.map((user) => JSON.stringify(user)))].map((user) => JSON.parse(user))// remove duplicates
    Users.value = uniqueUsers
  })
}

getUsers()

const searchedUsers = computed(() => { // computed property that returns the filtered users
  if (FindUser.value.trim() === '') {
    return Users.value
  } else {
    const filteredUsers = Users.value.filter((user) => user.Login && user.Login.toLowerCase().includes(FindUser.value.toLowerCase())) // filter the users based on the search query
    return filteredUsers
  }
})

const emit = defineEmits(['removeUser'])

function kickUser(userId: string) { // function that removes a user by its id
  const db = getDatabase()
  const userRef = fbRef(db, `users/${RoomName}/${userId}`) //query the database for the user
  remove(userRef)
}
</script>

<style scoped>

.exitMobileButton{
    display: none
}
.searchUser{
    width: 80% !important;
}

@media screen and (max-width: 760px) {
    .exitMobileButton{
        display: block
    }

}
</style>