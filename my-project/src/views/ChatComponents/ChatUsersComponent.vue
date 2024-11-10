<template>
    <div class="border-b-2 max-h-screen overflow-auto">
        <h1 class="border-b-2 p-2">
            Room : {{ RoomName }}
        </h1>
        <div class="ml-2 flex flex-row items-center">
            Users :
            <div><input class="w-4/5 outline-none border-b-2 ml-2 text-sm" v-model="FindUser" type="text"></div>
        </div>
        <div class="flex flex-row items-center mt-2  ml-2" v-for="user in searchedUsers " :key="user.id">
            <img class="cursor-pointer w-10 h-10 mr-2" src="../../assets/userIcon.svg" alt="">
            <div class="flex w-full flex-row items-center justify-between">
                <span class="font-bold" :class="userName == user.Login ? 'text-green-600' : 'text-black'">{{ user.Login }}</span>
                <button v-if="IsAdminStatus" @click="$emit('removeUser',kickUser(user.id) )"   class="ml-auto"><img class="w-5 h-5" src="@/assets/trashCan.svg" alt=""></button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref as fbRef, getDatabase, onValue, remove } from 'firebase/database'
import { ref, Ref, computed,defineEmits} from 'vue'

const Users: Ref<IUsers[]> = ref([])
const FindUser = ref<string>('')
const RoomName = sessionStorage.getItem('roomName') ?? sessionStorage.getItem('newRoomName');
const userName = sessionStorage.getItem('UserName')
const IsAdminStatus = sessionStorage.getItem('isAdmin')

interface IUsers {
    id: string,
    isAdmin: boolean,
    Login: string
}

const getUsers = async () => {
  const db = getDatabase()
  const roomRef = fbRef(db, `users/${RoomName}`)

  onValue(roomRef, (snapshot) => {
    const users = Object.values(snapshot.val()) as IUsers[]
    const uniqueUsers = [...new Set(users.map((user) => JSON.stringify(user)))].map((user) => JSON.parse(user))
    Users.value = uniqueUsers

    uniqueUsers.forEach((user) => {
      user.isAdmin = IsAdminStatus === 'true' ? true : false
    })
  })
}

getUsers()

const searchedUsers = computed(() => {
  if (FindUser.value.trim() === '') {
    return Users.value
  } else {
    const filteredUsers = Users.value.filter((user) => user.Login && user.Login.toLowerCase().includes(FindUser.value.toLowerCase()))
    return filteredUsers
  }
})

const emit = defineEmits(['removeUser'])


function kickUser(userId: string) {
  const db = getDatabase()
  const userRef = fbRef(db, `users/${RoomName}/${userId}`)
  remove(userRef)
}

// const checkUserExist = (id: string): Promise<boolean> => {
//   const db = getDatabase()
//   const roomRef = fbRef(db, `users/${RoomName}/${id}`)
//   return new Promise((resolve, reject) => {
//     onValue(roomRef, (snapshot) => {
//       if (!snapshot.exists()) {
//         console.error('User does not exist in the database')
//         resolve(false)
//       } else {
//         resolve(true)
//       }
//     }, (error) => {
//       reject(error)
//     })
//   })
// }



</script>