<template>
    <div
        class="container w-2/6 flex justify-center items-center bg-white opacity-80 shadow-lg rounded-md flex-col p-10">
        <div class="container__Join flex-col w-3/4" v-if="CreateOrJoinRoom">
            <div>
                <p class="text-headers">Логин</p>
                <inputComponent v-model="Login" :value="Login" />
            </div>
            <div class="mt-5">
                <p class="text-headers">Название комнаты</p>
                <inputComponent v-model="RoomName" :value="RoomName" />
            </div>
            <div class="mt-5">
                <SimpleButtonComponent @click.prevent="SaveUserInDataBase">Войти</SimpleButtonComponent>
            </div>
        </div>

        <div class="createRoom__container w-3/4">
            <div class="createRoom__create flex-col w-full " v-if="!CreateOrJoinRoom">
                <div>
                    <p class="text-headers">User Name</p>
                    <inputComponent v-model="Login" :value="Login" />
                </div>
                <div>
                    <p class="text-headers">Название комнаты</p>
                    <inputComponent v-model="NewRoomName" :value="NewRoomName" />
                </div>
                <div class="mt-5">
                    <SimpleButtonComponent @click.prevent="CreateRoom">Создать комнату</SimpleButtonComponent>
                </div>
            </div>
        </div>

        <div class="switch_button mt-5 w-3/4 text-xl">
            <SimpleButtonComponent @click="CreateOrJoinRoom = !CreateOrJoinRoom">
                {{ CreateOrJoinRoom ? 'Создать комнату'
            : 'Присоединится к комнате' }}</SimpleButtonComponent>
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

const checkRoomExistence = async (roomName: string) => {
    const db = getDatabase()
    const rooms = fbRef(db, 'rooms')
    const roomsData = await get(rooms).then((snapshot) => snapshot.val())
    return roomsData && roomsData[roomName]
}

const checkUserExistence = async (roomName: string, login: string) => {
    const db = getDatabase()
    const usersRef = fbRef(db, 'users')
    const usersData = await get(usersRef).then((snapshot) => snapshot.val())
    const cleanUsersData = removeUndefinedValues(usersData)
    if (cleanUsersData[roomName] && Array.isArray(cleanUsersData[roomName])) {
        return cleanUsersData[roomName].some((user: IUserData) => user.Login === login)
    } else {
        return false
    }
}

const SaveUserInDataBase = async () => {
    if (Login.value && RoomName.value) {
        const roomExist = await checkRoomExistence(RoomName.value)
        if (!roomExist) {
            alert('Комната не существует')
            CreateOrJoinRoom.value = false
            return
        }

        const userExist = await checkUserExistence(RoomName.value, Login.value)
        let UserData: IUserData; // объявляем переменную здесь

        if (userExist) {
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

        const cleanUserData = removeUndefinedValues(UserData)
        await updateUserInDatabase(RoomName.value, cleanUserData)

        sessionStorage.setItem('roomName', RoomName.value)
        sessionStorage.setItem('UserName', Login.value)
        sessionStorage.setItem('id', UserData.id)
        sessionStorage.setItem('isAdmin', UserData.IsAdmin.toString()) // сохраняем статус администратора

        Login.value = ''
        router.push({ name: 'Chat', params: { roomId: roomExist.id } })
    }
}

const updateUserInDatabase = async (roomName: string, userData: IUserData) => {
    const db = getDatabase()
    const usersRef = fbRef(db, `users/${roomName}`)

    try {
        await get(usersRef).then((snapshot) => {
            const users = snapshot.val()

            if (users) {
                const existingUser = (Object.values(users) as IUserData[]).find((user) => user.Login === userData.Login)

                if (existingUser) {
                    // обновляем существующего пользователя
                    users[existingUser.id] = userData
                } else {
                    // добавляем нового пользователя
                    users[userData.id] = userData
                }

                const updatedUsers: { [key: string]: IUserData } = {}
                Object.keys(users).forEach((key) => {
                    updatedUsers[key] = users[key]
                })

                update(usersRef, updatedUsers)
            } else {
                // если пользователей нет, добавляем нового пользователя
                update(usersRef, { [userData.id]: userData })
            }
        })
    } catch (error) {
        console.error(error)
    }
}

function removeUndefinedValues(obj:any): any {
    return Object.entries(obj)
        .filter(([_, v]) => v !== undefined)
        .reduce((acc, [k, v]) => ({ ...acc, [k]: v === Object(v) ? removeUndefinedValues(v) : v }), {})
}
const CreateRoom = async () => {
    const db = getDatabase()
    const roomsRef = fbRef(db, 'rooms')

    try {
        const rooms = await get(roomsRef).then((snapshot) => snapshot.val())

        if (rooms && rooms[NewRoomName.value]) {
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
            id: uuidv4(),
            name: NewRoomName.value,
            users: [userData]
        }

        await update(roomsRef, { [NewRoomName.value]: roomData })

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