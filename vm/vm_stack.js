var instructions = [
    // stack ops
    'pop', 'push', 'jmp',
    // basic arithmetic
    '+', '-', '/', '*', '^',
    // externals
    'log'
];
function tryFloat(x) {
    let parsed = parseFloat(x);
    return isNaN(parsed) ? x : parsed;
}
class VM {
    constructor(maxSize=10, instructions, strict=true) {
        this.stack = new Array(maxSize);
        this.stackPtr = 0;
        this.maxSize = maxSize;
        this.strict = strict;
        this.instructions = instructions;
        this.mem = {};
    }
    fizzle(msg){
        console.log('Fizzle stack:');
        if(this.strict){
            throw new Error('FIZZLE! ' + msg);
        } else {
            console.log('FIZZLE! ' + msg);
        }
    }
    disp() {
        console.log('[' + this.stack.join('|') + '] at ' + this.stackPtr + ", top -> " + this.top());
        console.log(this.mem);
    }
    push(x) {
        this.stack[this.stackPtr++] = x;
        this.stackPtr > this.maxSize && this.fizzle('stack overflow');
    }
    pop() {
        if(this.stackPtr < 1)
            this.fizzle('popping at bottom of stack');
        else
            return this.stack[--this.stackPtr];
    }
    top() {
        return this.stack[this.stackPtr - 1];
    }
    reset() {
        this.stack = [];
        this.stackPtr = 0;
    }
    log(msg, pre='VM :'){
        console.log(pre + msg);
    }
    execute(code) {
        let verbose = this.verbose;
        let i = 0;
        let vm = this;
        for(let i = 0; i < code.length; i++){
            let instr = code[i];
            switch(instr){
                case 'pop':{
                    this.pop();
                    break;}
                case 'push':{
                    i++;
                    this.push(tryFloat(code[i]));
                    break;}
                case 'swap':{
                    let b = pop(),
                        a = pop();
                    this.push(a);
                    this.push(b);
                    break;}
                case 'log':{
                    this.log(this.top());
                    break;}
                case '+':{
                    let b = this.pop(),
                        a = this.pop();
                    this.push(a + b);
                    break;}
                case '-':{
                    let b = this.pop(),
                        a = this.pop();
                    this.push(a - b);
                    break;}
                case '*':{
                    let b = this.pop(),
                        a = this.pop();
                    this.push(a * b);
                    break;}
                case '^':{
                    let b = this.pop(),
                        a = this.pop();
                    this.push(Math.pow(a, b));
                    break;}
                case '/':{
                    let b = this.pop(),
                        a = this.pop();
                    this.push(a / b);
                    break;}
                case '%':{
                    let b = this.pop(),
                        a = this.pop();
                    this.push(a % b);
                    break;}
                case '!':{
                    let a = this.pop();
                    this.push(!a ? 1 : 0);
                    break;}
                case '>':{
                    let b = this.pop(),
                        a = this.pop();
                    this.push(a > b ? 1 : 0);
                    break;}
                case '>=':{
                    let b = this.pop(),
                        a = this.pop();
                    this.push(a >= b ? 1 : 0);
                    break;}
                case '<':{
                    let b = this.pop(),
                        a = this.pop();
                    this.push(a < b ? 1 : 0);
                    break;}
                case '<=':{
                    let b = this.pop(),
                        a = this.pop();
                    this.push(a <= b ? 1 : 0);
                    break;}
                case '==':{
                    let b = this.pop(),
                        a = this.pop();
                    this.push(a == b ? 1 : 0);
                    break;}
                case '!=':{
                    let b = this.pop(),
                        a = this.pop();
                    this.push(a != b ? 1 : 0);
                    break;}
                case 'jmp':{
                    let jump = this.pop();
                    i += jump;
                    verbose && this.log('jumped by ' + jump + ' to ' + i + ': ' + code[i]);
                    break;}
                case '?jmp':{
                    let ifFalse = this.pop(),
                        ifTrue = this.pop(),
                        trueOrNot = this.pop(),
                        jump = trueOrNot ? ifTrue : ifFalse;
                    i += jump;
                    verbose && this.log('?jumped by ' + jump + ' to ' + i + ': ' + code[i]);
                    break;}
                case '@jmp':{
                    let ifFalse = this.pop(),
                        ifTrue = this.pop(),
                        trueOrNot = this.pop(),
                        jump = trueOrNot ? ifTrue : ifFalse;
                    i = jump;
                    verbose && this.log('@jumped to ' + jump + ' : ' + code[i]);
                    break;}
                case 'tag':{
                    i += 1;
                    verbose && this.log('tagging ' + code[i]);
                    break;}
                case 'goto':{
                    let jump = this.pop();
                    i = code.indexOf('#' + jump);
                    verbose && this.log('going to first ' + jump + ' to ' + i);
                    break;}
                case '?goto':{
                    let ifFalse = this.pop(),
                        ifTrue = this.pop(),
                        trueOrNot = this.pop(),
                        jump = trueOrNot ? ifTrue : ifFalse;
                    i = code.indexOf('#' + jump);
                    verbose && this.log('?goto to tag ' + jump + ' at ' + i);
                    break;}
                case 'dup':{
                    let a = this.pop();
                    this.push(a);
                    this.push(a);
                    break;}
                case 'setmem':{
                    let val = this.pop(),
                        key = this.pop();
                    this.mem[key] = val;
                    break;}
                case 'getmem':{
                    let val = this.mem[this.pop()];
                    this.push(val == undefined ? null : val);
                    break;}
                default:{
                    this.fizzle('instruction not recognised: ' + instr);
                }
            }
        }
    }
}
function randomCode(len){
    let code = [];
    for(let i = 0; i < len; i++){
        let index = ~~(Math.random() * (instructions.length * 1.5));
        if(index >= instructions.length) {
            code.push('push');
            code.push(~~(Math.random() * 10));
        } else {
            code.push(instructions[index]);
        }
    }
    return code;
}

let vm = new VM(maxSize=5, instructions=instructions, strict=true),
    code0 = ['push', '4', 'push', '4', '*', 'log'],
    code1 = 'push 0 push 1 + dup log push 10 >= push 14 push 1 @jmp push DONE log'.split(' '),
    
    code2 = 'push 0 tag ##add1 push 1 + dup log push 10 > push #done push #add1 ?goto tag ##done push DONE! log'.split(' '),
    code3 = '#include <stdio.h> #include <stdlib.h> int main(){ while(1) malloc(1024); // little comment }'.split(' ');

// vm.verbose = 1;
vm.strict = 0;
vm.execute(code3);
vm.disp();
// let rc = randomCode(10);
// console.log(rc.join(' '));
// vm.strict = 0;
// vm.execute(rc);
