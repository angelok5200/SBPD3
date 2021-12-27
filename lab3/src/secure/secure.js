const { readFileSync, writeFileSync } = require('fs');
const v8 = require('v8');
const { join } = require('path');

const diskPath = join(__dirname, '..', '..', 'Disk:B');

const save = (content) => {
    const encodedContent = v8.serialize(content);
    writeFileSync(diskPath, encodedContent);
}

const decode = () => {
    const content = readFileSync(diskPath);
    return v8.deserialize(content);
}

module.exports = {
    save,
    decode,
    diskPath,
}
