let basics = {
    'push': {
        main: (vm, args) => {
            for(let i = 0; i < args.length; i++){
                vm.push(args[i]);
            }
        },
    },
    'revpush': {
        main: (vm, args) => {
            for(let i = args.length - 1; i >= 0; i--){
                vm.push(args[i]);
            }
        },
    },
    'log': {
        main: (vm, args) => {
            vm.log(args, 'VM out: ');
        },
    },
    'logstack': {
        main: (vm, args) => {
            vm.log(vm.stack.arr, 'VM stack: ');
        },
    },
    'dup': {
        main: (vm, args) => {
            let a = args[0];
            vm.push(a);
            vm.push(a);
        },
    },
    'noop': {
        main: (vm, args) => {},
    },
    'swap': {
        main: (vm, args) => {
            vm.push(args[1]);
            vm.push(args[0]);
        },
    },
    '+': {
        main: (vm, args) => vm.push(args[0] + args[1]),
    },
    '-': {
        main: (vm, args) => vm.push(args[0] - args[1]),
    },
    '%': {
        main: (vm, args) => {
            vm.push(args[0] % args[1]);
        }
    },
    '*': {
        main: (vm, args) => vm.push(args[0] * args[1]),
    },
    '/': {
        main: (vm, args) => vm.push(args[0] / args[1]),
    },
    '//': {
        main: (vm, args) => vm.push(Math.floor(args[0] / args[1])),
    },
    '>': {
        main: (vm, args) => vm.push(args[0] > args[1] ? 1 : 0),
    },
    '<': {
        main: (vm, args) => vm.push(args[0] < args[1] ? 1 : 0),
    },
    '>=': {
        main: (vm, args) => vm.push(args[0] >= args[1] ? 1 : 0),
    },
    '<=': {
        main: (vm, args) => vm.push(args[0] <= args[1] ? 1 : 0),
    },
    '==': {
        main: (vm, args) => vm.push(args[0] == args[1] ? 1 : 0),
    },
    'random': {
        main: (vm, args) => {
            switch(args.length){
                case 0:
                    vm.push(Math.random());
                    break;
                case 1:
                    vm.push(Math.random() * args[0]);
                    break;
                case 2:
                    vm.push(Math.random() * (args[1] - args[0]) + args[0]);
                    break;
                default:
                    vm.fizzle('invalid number of args for random');
            }
        },
    },
};
let jumps = {
    'jump': {
        main: (vm, args) => {
            let amount = args[0],
                prog = vm.currProg();
            amount = amount - 1;
            vm.addr[vm.currProg()] += amount;
            if (vm.addr[vm.currProg()] < 0) {
                let line = vm.code[prog][vm.addr[prog] - amount].join(' ');
                throw new Error(`jump to <0 at line '${line}', down to ${vm.addr[prog]}`);
            }
        },
    },
    'skip': {
        main: (vm, args) => { vm.addr[vm.currProg()] += 1; },
    },
    '?jump': {
        main: (vm, args) => {
            let amount = args[0] != 0 ? args[1] : args[2],
                prog = vm.currProg();
            amount = amount - 1;
            vm.addr[prog] += amount;
            if (vm.addr[vm.currProg()] < 0) {
                let line = vm.code[prog][vm.addr[prog] - amount].join(' ');
                throw new Error(`jump to <0 at line '${line}', down to ${vm.addr[prog]}`);
            }
        },
    },
    '@jump': {
        main: (vm, args) => {
            let amount = args[0],
                prog = vm.currProg();
            vm.addr[prog] = amount - 1;
            if (vm.addr[vm.currProg()] < 0) {
                let line = vm.code[prog][vm.addr[prog] - amount].join(' ');
                throw new Error(`jump to <0 at line '${line}', down to ${vm.addr[prog]}`);
            }
        },
    },
    'tag': {
        main: (vm, args) => {},
    },
    'goto': {
        main: (vm, args) => {
            let tag = args[0];
            vm.addr = vm
        },
    },
};
let mapping = {
    'map': {
        main: (vm, args) => {
            // map stk 3:fizz 5:buzz default:0
            // map stk 3 fizz 5 buzz default 0
            //  op   0 1    2 3    4       5 6 ; length = 7
            if(args.length % 2 != 1){
                console.log(`Error: map needs an odd number of args: elem, pairs`);
            }
            let elem = args[0];
            let converted = false;
            for(let i=1; i<args.length - 2; i+=2){
                if(elem == args[i]){
                    converted = true;
                    vm.push(args[i+1]);
                }
            }
            if(!converted) {
                vm.push(args[args.length - 1]);
            }
        }
    }
}
function tryFloat(x) {
    let parsed = parseFloat(x);
    return isNaN(parsed) ? x : parsed;
}
function parseToken(raw='a') {
    raw = String(raw);
    let colonI = raw.indexOf(':');
    let quoteI0 = raw.indexOf("'");
    let quoteI1 = raw.lastIndexOf("'");
    if (quoteI0 != quoteI1) {
        // string with quotes
        elem = raw.slice(quoteI0 + 1, quoteI1);
        type = 'str';
    } else if(colonI > -1){
        // TODO: handle maps
        // map
        // let key = parseToken(raw.slice(0, colonI));
        // let val = parseToken(raw.slice(colonI + 1));
        // elem = {};
        // elem[key] = val;
        elem = raw;
        type = 'map';
    } else if (raw == 'null') { 
        // null
        elem = null;
        type = 'null';
    } else if (raw == 'stk') { 
        // null
        elem = raw;
        type = 'stk';
    } else if (raw == 'true' || raw == true) {
        // true -> 1
        elem = 1;
        type = 'num';
    } else if (raw == 'false' || raw ==  false) {
        // false -> 0
        elem = 0;
        type = 'num';
    } else if (!isNaN(parseFloat(raw))) {
        // number
        elem = parseFloat(raw);
        type = 'num';
    } else {
        // string
        elem = raw;
        type = 'str';
    }
    return {val: elem, type};
}
function parseLine(line) {
    let firstChar = line.search(/\S/)
    line = line.slice(firstChar).replace(/:/g, ' ');
    if(firstChar == -1) {
        return [];
    }
    let quoteI0 = line.indexOf("'");
    let quoteI1 = line.lastIndexOf("'");
    let commentI = line.indexOf(';');
    let tokens = commentI > -1 ? line.slice(0, commentI) : line;
    tokens = tokens.split(' ')
                   .filter(e => e != '');
    let op = tokens[0];
    let params = tokens
        .slice(1)
        .filter(tok => tok.length > 0)
        .map(tok => parseToken(tok).val);
    // TODO: bloody 'two words'
    // while (quoteI0 != quoteI1) {
    //     quoteI0 = line.indexOf("'");
    //     quoteI1 = line.indexOf("'", quoteI0);
    // }
    return [op].concat(params);
}
function parseCode(str) {
    return str
        .split('\n')
        .map(parseLine)
        .filter(line => line.length > 0 && line != undefined);
}

class Stack {
    constructor(maxSize=10) {
        this.arr = new Array(maxSize);
        this.ptr = 0;
        this.maxSize = maxSize;
    }
    log(firstChar='[', sep=', ', lastChar=']') {
        console.log(`${firstChar}${this.arr.join(sep)}${lastChar} at ${this.ptr}, top -> ${this.top()}`);
    }
    push(x) {
        this.arr[this.ptr++] = x;
        if(this > this.maxSize) {
            throw new Error('Stack overflow!');
        }
    }
    pop() {
        if(this.ptr < 1)
            throw new Error('Popping at bottom of stack!');
        else
            return this.arr[--this.ptr];
    }
    top() {
        return this.arr[this.ptr - 1];
    }
    reset() {
        this.arr = [];
        this.ptr = 0;
    }
}

class VM {
    constructor(maxSize=10, instructions=basics, strict=true) {
        this.strict = strict;
        this.instructions = instructions;
        this.mem = {};
        this.stack = new Stack(maxSize);
        this.pop = this.stack.pop.bind(this.stack);
        this.push = this.stack.push.bind(this.stack);
        this.top = this.stack.top.bind(this.stack);
        this.addr = {};
        this.code = {};
        this.progStack = [];
        this.stacks = {main: this.stack};
    }
    fizzle(err){
        console.log('Fizzle stack:');
        if(this.strict){
            throw new Error('STRICT FIZZLE! ' + err);
        } else {
            console.log('IGNORED FIZZLE! ' + err);
        }
    }
    log(msg, pre='VM :'){ console.log(pre + msg); }
    processArgs(args=[]) {
        if(args.length > 0){
            // dereference *x to mem[x]
            args = args.map(e => (e[0] == '*' ? this.mem[e.slice(1)] : e));
            // pop stack elements into 'stk'
            args = args.reverse().map(e => e == 'stk' ? this.pop() : e).reverse();
        }
            return args;
    }
    load(map) { Object.assign(this.code, map); }
    currProg() { return this.progStack[this.progStack.length - 1]; }
    execute(codeName='main') {
        let code = this.code[codeName];
        this.progStack.push(codeName);
        this.addr[codeName] = 0;
        while (this.addr[codeName] < code.length){
            let line = code[this.addr[codeName]];
            let op = line[0],
                params = this.processArgs(line.slice(1));
            this.sayExec && this.log(`${op} [${params.join(', ')}]`, 'exec> ');
            // TODO: fix this
            if(op != undefined && line != undefined){

                this.instructions[op].main(this, params);
            }
            this.addr[codeName] += 1;
        }
        this.progStack.pop();
    }
}

let code1raw = `
    push 0                    ; 
    + 1 stk                   ; 

    dup stk                   ;
    % stk 15                  ; 
        == 0 stk              ; 
        ?jump stk 1 3         ; 
        log 'fizzbuzz'        ; 
        @jump 1               ; 

    dup stk                   ;
    % stk 5                   ; 
        == 0 stk              ; 
        ?jump stk 1 3         ; 
        log 'buzz'            ; 
        @jump 1               ; 

    dup stk                   ;
    % stk 3                   ; 
        == 0 stk              ; 
        ?jump stk 1 3         ; if //3, write fizz then go back
        log 'fizz'            ; else, 
        @jump 1               ;  

    dup stk
    log stk
    dup stk
    >= stk 100
    ?jump stk 2 1
    @jump 1 
    log done`,
    code2raw = `
    push 1 2 3
    > stk 2
    if stk
        log goodpath
        == stk 2
        if stk
            log goodpath2
        else
        end-if
    else
        log 'bad path'
    end-if
`,
    code1 = parseCode(code1raw),
    code2 = parseCode(code2raw);

console.log(code1);
let instr = Object.assign({}, basics, jumps, mapping);
let vm = new VM(maxSize=5, instructions=instr, strict=true);
vm.load({main: code1});
// vm.sayExec = true;
vm.execute('main');
// let start = Date.now();
// let end = Date.now();
// console.log(`execution took ${end - start} ms`);
