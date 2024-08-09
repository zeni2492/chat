import moment from "moment";

export const botName = "Chat Bot Admin";
export const users = [];

export function userJoin(user) { // when user join room push user to users
    users.push(user);
    return user;
}

export function userLeave(id) { // when user leave room remove user from users
    const index = users.findIndex(user => user.id === id);
    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}

export function getCurrentUser(id) { // get user by id
    return users.find(user => user.id === id);
}

export function getGroupUsers(room) { // get users by room
    return users.filter(user => user.room === room);
}

export function formatMessage(username, text) { // format of messages
    return {
        username,
        text,
        time: moment().format('h:mm a')
    }
}