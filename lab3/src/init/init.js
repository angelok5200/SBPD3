const { save } = require('../secure/secure');
const initData = require('./initData.json');
const { existsSync } = require('fs');
const { diskPath } = require('../secure/secure');

const initDisk = () => {
    if(existsSync(diskPath)) return;
    save(initData);
}

module.exports = {
    initDisk,
}
