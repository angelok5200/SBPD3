const { cliQuestions } = require('../cli/rl');

const verifyUser = (allUsers, userData) => {
    const [ selectedUser ] = allUsers.filter(user => user.login === userData.login && user.password === userData.password);
    return selectedUser;
}

const LOGIN_TIME = 1000 * 60;
const LOGIN_ATTEMPTS = 4;
const USERS_LENGTH = 9;
const TIME_VALID = 1000 * 60 * 60 * 24;
const ADMIN_PASSWORD_LENGTH = 7;
const USER_PASSWORD_LENGTH = 7;

const verifyUserWithRules = async (disk, attempts = LOGIN_ATTEMPTS, time = LOGIN_TIME) => {
    let done = false;
    const timerId = setTimeout(() => {
        if(!done){
            console.log('\nLogin time is passed');
            process.exit();
        }
    }, time);
    const allUsers = JSON.parse(disk.files.secure.files.register.content);
    for (let i = 0; i < attempts; i++) {
        const userData = await cliQuestions([
            { name: 'login', question: 'User login: '},
            { name: 'password', secure: true }
        ]);
        const selectedUser = verifyUser(allUsers, userData);
        if (!selectedUser) console.log('Incorrect login or password');
        else if(selectedUser.time && Date.now() - selectedUser.time > TIME_VALID) {
            console.log('Password has expired. Contact the administrator for help')
        }
        else {
            done = true
            if(selectedUser.time) {
                console.log('Your password is valid until ' + new Date(selectedUser.time + TIME_VALID));
            }
            return userData;
        }
    }
    clearTimeout(timerId);
    done = true;
    console.log('You have exceeded the login limit');
    process.exit();
}

module.exports = {
    verifyUser,
    LOGIN_ATTEMPTS,
    LOGIN_TIME,
    USERS_LENGTH,
    ADMIN_PASSWORD_LENGTH,
    USER_PASSWORD_LENGTH,
    verifyUserWithRules,
}
