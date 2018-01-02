/*!
 * tools
 * Copyright(c) 2011-2012 Elmer Bulthuis <elmerbulthuis@gmail.com>
 * MIT Licensed
 */
function extend(o) {
    var argumentCount = arguments.length;
    for (var argumentIndex = 1; argumentIndex < argumentCount; argumentIndex++) {
        var argument = arguments[argumentIndex];
        if(!argument) continue;
        for (var argumentKey in argument) {
            o[argumentKey] = argument[argumentKey];
        }
    }
    return o;
}



function toString(data) {
    if(typeof data == 'undefined') return '';
    if(data === null) return '';
    return buffer.toString();
}


function countLines(data){
    var newlines = data.match(/\n/g);
    if(!newlines) return 0;
    else return data.match(/\n/g).length;
}


function stringifyWithLines(data){
    var re = /[^\n]+((?:\r?\n)*)/g;
    var lines = [];
    var match = re.exec(data);
    while(match != null){
        lines.push(JSON.stringify(match[0]) + match[1]);
        match = re.exec(data);
    }
    return lines.join('+');
}


//exports
exports.extend = extend;
exports.toString = toString;
exports.countLines = countLines;
exports.stringifyWithLines = stringifyWithLines;


