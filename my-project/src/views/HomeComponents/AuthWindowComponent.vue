<template>
    <div
        class="container w-2/6 flex justify-center items-center bg-white opacity-80 shadow-lg rounded-md flex-col p-10">
        <div class="container__Join flex-col w-3/4" v-if="CreateOrJoinRoom">
            <div>
                <p class="text-headers">Login</p>
                <inputComponent v-model="Login" :value="Login" />
            </div>
            <div class="mt-5">
                <p class="text-headers">Room Name</p>
                <inputComponent v-model="RoomName" :value="RoomName" />
            </div>
            <div class="mt-5">
                <SimpleButtonComponent @click.prevent="SaveUserInDataBase">Submit</SimpleButtonComponent>
            </div>
        </div>

        <div class="createRoom__container w-3/4">
            <div class="createRoom__create flex-col w-full " v-if="!CreateOrJoinRoom">
                <div>
                    <p class="text-headers">User Name</p>
                    <inputComponent v-model="Login" :value="Login" />
                </div>
                <div>
                    <p class="text-headers mt-2">Room name</p>
                    <inputComponent v-model="NewRoomName" :value="NewRoomName" />
                </div>
                <div class="mt-5">
                    <SimpleButtonComponent @click.prevent="CreateRoom">Create room</SimpleButtonComponent>
                </div>
            </div>
        </div>

        <div class="switch_button mt-5 w-3/4 text-xl">
            <SimpleButtonComponent @click="CreateOrJoinRoom = !CreateOrJoinRoom">
                {{ CreateOrJoinRoom ? 'Create Room'
            : 'Join Room' }}</SimpleButtonComponent>
        </div>
    </div>

</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getDatabase, update, get, ref as fbRef } from 'firebase/database'
import { v4 as uuidv4 } from 'uuid'

import inputComponent from '@/components/inputComponent.vue'
import SimpleButtonComponent from '@/components/SimpleButtonComponent.vue'

const router = useRouter()

const Login = ref<string>('')
const RoomName = ref<string>('')

const NewRoomName = ref<string>('')
const CreateOrJoinRoom = ref<boolean>(true)

interface IUserData {
    id: string,
    IsAdmin: boolean,
    Login: string
}

interface IROOM {
    id: string;
    name: string;
    users: IUserData[];
}

const checkRoomExistence = async (roomName: string) => { // function that checks if the room exists
    const db = getDatabase() // connect to the database
    const rooms = fbRef(db, 'rooms') // path to rooms section
    const roomsData = await get(rooms).then((snapshot) => snapshot.val())  // get the rooms from the database
    return roomsData && roomsData[roomName] // return the room
}

const checkUserExistence = async (roomName: string, login: string) => { // function that checks if the user exists
    const db = getDatabase() 
    const usersRef = fbRef(db, 'users')
    const usersData = await get(usersRef).then((snapshot) => snapshot.val())
    const cleanUsersData = removeUndefinedValues(usersData)
    if (cleanUsersData[roomName] && Array.isArray(cleanUsersData[roomName])) { // check if the room exists and is an array
        return cleanUsersData[roomName].some((user: IUserData) => user.Login === login) // check if the user exists
    } else {
        return false
    }
}

const SaveUserInDataBase = async () => {
    if (Login.value && RoomName.value) { // check is user and room fields filled
        const roomExist = await checkRoomExistence(RoomName.value) // check if the room exists
        if (!roomExist) { // if the room doesn't exist it suggest to create one
            alert('Комната не существует')
            CreateOrJoinRoom.value = false
            return
        }

        const userExist = await checkUserExistence(RoomName.value, Login.value) // check if the user exists
        let UserData: IUserData; 

        if (userExist) { // if the user exists it redirects to the chat and save his data
            const roomId = roomExist.id 
            sessionStorage.setItem('roomName', RoomName.value)
            sessionStorage.setItem('UserName', Login.value)
            router.push({ name: 'Chat', params: { roomId } })
            return
        }

        UserData = {
            id: uuidv4(),
            IsAdmin: roomExist.users.length === 0, // если пользователь первый, то он админ
            Login: Login.value
        }

        const cleanUserData = removeUndefinedValues(UserData) // clean data from undefined values
        await updateUserInDatabase(RoomName.value, cleanUserData) // update user in database

        sessionStorage.setItem('roomName', RoomName.value)
        sessionStorage.setItem('UserName', Login.value)
        sessionStorage.setItem('id', UserData.id)
        sessionStorage.setItem('isAdmin', UserData.IsAdmin.toString()) // сохраняем статус администратора

        Login.value = ''
        router.push({ name: 'Chat', params: { roomId: roomExist.id } }) // if user doesn't exist it redirects to the chat with saved data
    }
}

const updateUserInDatabase = async (roomName: string, userData: IUserData) => {
    const db = getDatabase() // connect to the database
    const usersRef = fbRef(db, `users/${roomName}`) // path to users section

    try {
        await get(usersRef).then((snapshot) => {
            const users = snapshot.val() // get the users from the database

            if (users) {
                const existingUser = (Object.values(users) as IUserData[]).find((user) => user.Login === userData.Login) // if user already exist it doesn`t save to data again

                if (existingUser) {
                    // обновляем существующего пользователя
                    users[existingUser.id] = userData
                } else {
                    // добавляем нового пользователя
                    users[userData.id] = userData
                }

                const updatedUsers: { [key: string]: IUserData } = {}
                Object.keys(users).forEach((key) => { // remove undefined values
                    updatedUsers[key] = users[key]
                })

                update(usersRef, updatedUsers) // update the users in the database
            } else {
                // если пользователей нет, добавляем нового пользователя
                update(usersRef, { [userData.id]: userData }) // if users don't exist, add new user
            }
        })
    } catch (error) {
        console.error(error)
    }
}

function removeUndefinedValues(obj:any): any {
    return Object.entries(obj) // convert object to array
        .filter(([_, v]) => v !== undefined) // remove undefined values
        .reduce((acc, [k, v]) => ({ ...acc, [k]: v === Object(v) ? removeUndefinedValues(v) : v }), {}) // convert back to object
}
const CreateRoom = async () => { // async function that creates a new room
    const db = getDatabase()
    const roomsRef = fbRef(db, 'rooms')

    try {
        const rooms = await get(roomsRef).then((snapshot) => snapshot.val())

        if (rooms && rooms[NewRoomName.value]) { // check if the room already exists
            alert('Такая комната уже существует')
            CreateOrJoinRoom.value = true
            return
        }

        const userData: IUserData = {
            id: uuidv4(),
            IsAdmin: true,
            Login: Login.value
        }
        await update(fbRef(db, 'users'), { [NewRoomName.value]: [userData] })

        const roomData: IROOM = {
            id: uuidv4(), // add uniq id to every room
            name: NewRoomName.value,
            users: [userData]
        }

        await update(roomsRef, { [NewRoomName.value]: roomData }) // add new room

        sessionStorage.setItem('roomName', NewRoomName.value)
        sessionStorage.setItem('UserName', Login.value)
        sessionStorage.setItem('isAdmin', 'true')

        NewRoomName.value = ''
        Login.value = ''

        router.push({ name: 'Chat', params: { roomId: roomData.id } })
    } catch (error) {
        console.error(error)
    }
}
</script>

<style scoped>
@media screen and (max-width: 760px) {
    .container {
        width: 90%;
    }

    .container__Join {
        width: 80%;
        font-size: 14px;
    }

    .createRoom__container {
        display: flex;
        justify-content: center;
    }

    .createRoom__create {
        width: 100%;
    }

    .text-headers {
        font-size: 24px;
    }
}

@media screen and (max-width:1050px) {
    .container {
        width: 80%;
    }

    .container__Join {
        width: 70%;
        font-size: 14px;
    }

    .createRoom__container {
        width: 100%;
        display: flex;
        justify-content: center;
    }

    .createRoom__create {
        width: 80%;
    }

    .switch_button {
        width: 70%;
    }
}
</style>