const { spawn } = require('child_process');

const args = process.argv;
const [,, arg] = args;

let script, isValidArg = true;
if (arg === 'g') script = 'gui';
else if (arg === 'h') script = 'headless';
else {
    script = 'headless';
    isValidArg = false;
}

spawn('yarn', ['run', `test:${script}`, ...args.slice(isValidArg ? 3 : 2)], {
    stdio: 'inherit'
});