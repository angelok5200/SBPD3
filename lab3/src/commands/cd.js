const { getDirObj } = require('./helpers');
const { errors } = require('../secure/operation');

module.exports = (state, params) => {
    const { disk, user, currentDir } = state;
    if (params.length !== 1) throw new Error(errors.IncorrectParamsLength(disk, user));
    if(params[0] === '..') {
        const fileNames = (currentDir).split('/').filter(Boolean);
        fileNames.pop();
        return state.currentDir = '/' + fileNames.join('/');
    }
    const dirObj = getDirObj(disk, user, currentDir, params[0]);
    if (!dirObj) throw new Error(errors.UnknownPath(disk, user));
    if (!dirObj.rights.read.includes(user)) throw new Error(errors.PermissionDenied(disk, user));
    if (dirObj.type !== 'directory') throw new Error(errors.NotDir(disk, user));
    state.currentDir += params[0] + '/';
}
