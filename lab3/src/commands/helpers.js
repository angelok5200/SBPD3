const onlyInf = (content) => JSON.parse(JSON.stringify(content));
const { errors } = require('../secure/operation');

const getDirObj = (disk, user, currentDir, file = '') => {
    let obj = disk;
    (currentDir + file).split('/').filter(Boolean).forEach(name => {
        try {
            obj = obj.files[name];
        } catch (e) {
            throw new Error(errors.UnknownPath(disk, user));
        }
    });
    return obj;
}

const delLoop = (disk, keys, count = 0) => {
    if (keys.length - 1 === count) return {...disk, files: {...disk.files, [keys[count]]: undefined}};
    return {
        ...disk, files: {
            ...disk.files, [keys[count]]: delLoop(disk.files, keys, count + 1
            )
        }
    }
}

const deletedDisk = (disk, currentDir, file = '') => {
    const fileNames = (currentDir + file).split('/').filter(Boolean);
    return delLoop(disk, fileNames, 0);
}

const crtLoop = (disk, keys, count = 0, user = 'admin', type = 'directory', content = '') => {
    if (keys.length - 1 === count) return {
        ...disk, files: {
            ...disk.files, [keys[count]]: {
                type,
                rights: {
                    read: Object.keys({ admin: true, [user]: true }),
                    write: Object.keys({ admin: true, [user]: true }),
                    delete: Object.keys({ admin: true, [user]: true }),
                },
                files: type === 'directory' ? {} : undefined,
                content: type === 'file' ? content : undefined,
            }
        }
    };
    return {
        ...disk, files: {
            ...disk.files, [keys[count]]: crtLoop(disk.files[keys[count]], keys, count + 1, user, type, content
            )
        }
    }
}

const createDisk = (disk, currentDir, file = '', user = 'admin', type = 'directory', content = '') => {
    const fileNames = (currentDir + file).split('/').filter(Boolean);
    return crtLoop(disk, fileNames, 0, user, type, content);
}

const rightsLoop = (disk, keys, count = 0, user, newRights) => {
    if (keys.length - 1 === count) return { ...disk, files: {
            ...disk.files, [keys[count]]: { ...disk.files[keys[count]], rights: newRights }
    }};
    return {
        ...disk, files: {
            ...disk.files, [keys[count]]: rightsLoop(disk.files[keys[count]], keys, count + 1, user, newRights)
        }
    }
}

const changeRights = (disk, currentDir, file = '', user = 'admin', newRights) => {
    const fileNames = (currentDir + file).split('/').filter(Boolean);
    return rightsLoop(disk, fileNames, 0, user, newRights);
}

const changeRightsObj = (oldRights, user, newRead = false, newWrite = false, newDel = false) => {
    const read = oldRights.read.includes(user) || !newRead ? oldRights.read : [...oldRights.read, user];
    const write = oldRights.write.includes(user) || !newWrite ? oldRights.write : [...oldRights.write, user];
    const del = oldRights.delete.includes(user) || !newDel ? oldRights.delete : [...oldRights.delete, user];
    return { read, write, delete: del };
};

module.exports = {
    getDirObj,
    delLoop,
    deletedDisk,
    crtLoop,
    createDisk,
    onlyInf,
    rightsLoop,
    changeRights,
    changeRightsObj,
}
