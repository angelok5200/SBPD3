const { cliQuestions } = require('../cli/rl');
const { LOGIN_TIME, LOGIN_ATTEMPTS, USERS_LENGTH, ADMIN_PASSWORD_LENGTH, USER_PASSWORD_LENGTH } = require('../secure/access');
const { onlyInf, createDisk, changeRightsObj } = require('./helpers');
const { save } = require('../secure/secure');
const { errors } = require('../secure/operation');

const newUser = (oldUsers, newUserInf) => {
    let find = false;
    const newUserObj = {
        login: newUserInf.login,
        password: newUserInf.password,
        time: Date.now(),
    };
    const newUsers = oldUsers.map(user => {
        if(user.login === newUserInf.login) {
            find = true;
            return newUserObj
        }
        return user
    });
    if(find) return newUsers;
    return [...newUsers, newUserObj];
}

module.exports = async (state, params) => {
    const { disk, user } = state;
    if(user !== 'admin') throw new Error(errors.PermissionDenied(disk, user));
    if (params.length !== 0 ) throw new Error(errors.IncorrectParamsLength(disk, params));

    let done = false;
    const timerId = setTimeout(() => {
        if(!done){
            console.log(`\n${errors.LoginTimePassed(disk, user)}`);
            process.exit();
        }
    }, LOGIN_TIME);
    const allUsers = JSON.parse(disk.files.secure.files.register.content);
    if(allUsers.length >= USERS_LENGTH) throw new Error(errors.ExcessNumberOfUsers(disk, user));
    for (let i = 0; i < LOGIN_ATTEMPTS; i++) {
        const newUserInf = await cliQuestions([
            { name: 'login', question: 'New user login: ' },
            { name: 'password', secure: true },
            { name: 'repeatPassword', secure: true, question: 'Repeat password: ' },
        ]);
        if(newUserInf.password !== newUserInf.repeatPassword) {
            console.log(errors.PasswordNotSame(disk, user));
            continue;
        }
        if(newUserInf.login === 'admin' && newUserInf.password.length < ADMIN_PASSWORD_LENGTH){
            console.log(errors.PasswordShort(disk, user));
            continue;
        }
        if(newUserInf.login !== 'admin' && newUserInf.password.length < USER_PASSWORD_LENGTH){
            console.log(errors.PasswordShort(disk, user));
            continue;
        }
        done = true;
        clearTimeout(timerId);
        const newUsers = newUser(allUsers, newUserInf);
        state.disk = onlyInf(
            createDisk(state.disk, '/secure/', 'register', state.user, 'file', JSON.stringify(newUsers))
        );
        const operationLog = JSON.parse(disk.files.secure.files.operation.content);
        state.disk = onlyInf(
            createDisk(state.disk, '/secure/', 'operation', state.user, 'file', JSON.stringify({
                ...operationLog, [newUserInf.login]:
                    operationLog[newUserInf.login] ? operationLog[newUserInf.login] : [[],[],[],[]]
            }))
        );
        state.disk.rights = changeRightsObj(state.disk.rights, newUserInf.login, true, true, false);
        save(state.disk);
        return;
    }
    clearTimeout(timerId);
    done = true;
    console.log(errors.ExceededLimit(disk, user));
    process.exit();
}
