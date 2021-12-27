const commands = require('../commands/index');
const { createDisk, onlyInf } = require('../commands/helpers');
const { save } = require('../secure/secure');
const { line } = require('./rl');
const { errors } = require('../secure/operation');

const cliLine = async (state) => {
    const answer = await line(state.file ? '' : state.currentDir + ':$ ');
    const [command, ...params] = answer.split(' ');
    const commandFunc = commands[command];
    try{
        if(!commandFunc && !state.file) throw new Error(errors.IncorrectCommand(command));
        else if(state.file){
            state.disk = onlyInf(createDisk(state.disk, state.currentDir, state.file, state.user, 'file', answer));
            save(state.disk);
            delete state.file;
        }
        else {
            await commandFunc(state, params);
        }
    }catch (e) {
        console.log('\x1b[31m%s\x1b[0m', e.message);
    }
    await cliLine(state);
}

module.exports = {
    cliLine,
};
