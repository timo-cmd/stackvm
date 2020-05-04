/*
    literal strings : 'a' 'two words' a abc '23'
    literal numbers : 2.42 -2 0 1
    literal null    : null
    mapping         : val:key 0:0 'a':'35'
        internal mappings?
    conversions     : true:1 false:0
*/
function assert(name, exp, expected) {
    if(exp == expected){
        console.log(`${name} passed!`);
    } else {
        console.log(`${name} failed!`);
    }
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
// assert('json test', literal('ore:false:5'), {'ore': '5'});
let tokens = [ '1',     2, "'3'", 'two words', "'4",  true, 'true', 'ore:iron:6', 'ore:5', 'null', 'stk'];
let types = ['num', 'num', 'str',       'str','str', 'num',  'num',        'map',   'map', 'null', 'stk'];
for(let i=0; i<tokens.length; i++){
    assert(`type check at ${tokens[i]}`, parseToken(tokens[i]).type == types[i], true);
}
function parseLine(line) {
    let quoteI0 = line.indexOf("'");
    let quoteI1 = line.lastIndexOf("'");
    let commentI = line.indexOf(';');
    let tokens = commentI > -1 ? line.slice(0, commentI) : line;
    tokens = tokens.split(' ');
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
        .filter(e => e.length > 0)
        .map(parseLine);
}

let code0 = `
push 4 3 true ore:5
push a           ; bad data, can't wait
sqrt stk stk stk ; ha ha won't work
`;
console.log(parseCode(code0));
