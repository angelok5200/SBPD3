const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const write = (content) => rl.write(content);

const toBegin = () => {
    readline.cursorTo(process.stdout, 0, 0);
    readline.clearScreenDown(process.stdout);
}

const line = (path) => new Promise(resolve => rl.question(path, data => resolve(data)));

const password = (question = 'Password: ') => new Promise(resolve => {
    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) process.stdin.setRawMode(true);
    let password = '';
    let done = false;
    toBegin();
    write(question);
    process.stdin.on('keypress', (chunk, key) => {
        if(!done){
            if(key.name === 'return') {
                done = true;
                resolve(password);
            }
            else if(password && key.name === 'backspace') password = password.substring(0, password.length - 1);
            else {
                toBegin();
                write(question);
                password += key.name;
            }
        }
    });
})

const cliQuestions = async (questionsArr, counter = 0) => {
    const { question, name, secure } = questionsArr[counter];
    let answer;
    if(secure) answer = await password(question);
    else answer = await line(question);
    if(counter === questionsArr.length - 1) return { [name]: answer };
    return { [name]: answer, ...(await cliQuestions(questionsArr, counter + 1)) }
}

module.exports = {
    write,
    line,
    password,
    toBegin,
    cliQuestions,
}
