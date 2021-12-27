const { save } = require('../secure/secure');
const { createDisk, getDirObj, onlyInf } = require('./helpers');
const { errors } = require('../secure/operation');

module.exports = (state, params) => {
    const { disk, user, currentDir } = state;
    if (params.length !== 1) throw new Error(errors.IncorrectParamsLength(disk, user));
    let dirObj = getDirObj(disk, user, currentDir);
    if (!dirObj) throw new Error(errors.UnknownPath(disk, user));
    if (!dirObj.rights.write.includes(user)) throw new Error(errors.PermissionDenied(disk, user));
    state.disk = onlyInf(createDisk(disk, currentDir, params[0], user));
    save(state.disk);
}
