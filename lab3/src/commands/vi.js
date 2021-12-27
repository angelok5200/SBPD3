const { save } = require('../secure/secure');
const { createDisk, getDirObj, onlyInf } = require('./helpers');
const { write } = require('../cli/rl');
const { errors } = require('../secure/operation');

module.exports = (state, params) => {
    const { disk, user, currentDir } = state;
    if (params.length !== 1) throw new Error(errors.IncorrectParamsLength(disk, user));
    let dirObj = getDirObj(disk, user, currentDir, params[0]);
    if (!dirObj) {
        state.disk = onlyInf(createDisk(disk, currentDir, params[0], user, 'file'));
        save(state.disk);
        dirObj = getDirObj(disk, user, currentDir, params[0]);
    }else {
        if (!dirObj.rights.write.includes(user)) throw new Error(errors.PermissionDenied(disk, user));
        if (!dirObj.rights.read.includes(user)) throw new Error(errors.PermissionDenied(disk, user));
        if (dirObj.type !== 'file') throw new Error(errors.NotFile(disk, user));
    }
    state.file = params[0];
    write('\n' + dirObj.content);
}
