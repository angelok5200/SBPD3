const { cliQuestions } = require('../cli/rl');
const { onlyInf, changeRights, changeRightsObj } = require('./helpers');
const { getDirObj } = require('./helpers');
const { save } = require('../secure/secure');
const { errors } = require('../secure/operation');

const ynToBool = (answer, disk, user) => {
    if(answer === 'y' || answer === 'Y') return true;
    if (answer === 'n' || answer === 'N') return false;
    throw Error(errors.IncorrectAnswer(disk, user));
};

const existUserByLogin = (allUsers, login) => allUsers.filter(user => user.login === login)[0];

module.exports = async (state, params) => {
    const { disk, user, currentDir } = state;
    if(user !== 'admin') throw new Error(errors.PermissionDenied(disk, user));
    if (params.length !== 1 ) throw new Error(errors.IncorrectParamsLength(disk, user));
    const dirObj = getDirObj(disk, user, currentDir, params[0]);
    if (!dirObj) throw new Error(errors.UnknownPath(disk, user));

    const { login, r, w, d } = await cliQuestions([
        { name: 'login', question: 'User login: ' },
        { name: 'r', question: 'Read (y|N): ' },
        { name: 'w', question: 'Write (y|N): ' },
        { name: 'd', question: 'Delete (y|N): ' },
    ]);
    const allUsers = JSON.parse(disk.files.secure.files.register.content);
    if(!existUserByLogin(allUsers, login)) throw new Error(errors.UnknownUser(disk, user));

    const read = ynToBool(r, disk, user);
    const write = ynToBool(w, disk, user);
    const del = ynToBool(d, disk, user);

    const newRights = changeRightsObj(dirObj.rights, login, read, write, del);

    state.disk = onlyInf(
        changeRights(state.disk, state.currentDir, params[0], login, newRights)
    );
    save(state.disk);
}
