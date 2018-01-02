/*!
 * tools
 * Copyright(c) 2011-2012 Elmer Bulthuis <elmerbulthuis@gmail.com>
 * MIT Licensed
 */


var ErrorStack = require('./ErrorStack');
var ErrorStackEntry = require('./ErrorStackEntry');

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



function fixError(err, filename, lineOffset, columnOffset){
    var stack = ErrorStack.parse(err.stack);

    stack.forEach(function(entry){
        if(entry instanceof ErrorStackEntry && entry.filename == filename){
            entry.line += lineOffset;
            entry.column += columnOffset;
        }
    });

    err.stack = stack.toString();
}

//exports
exports.extend = extend;
exports.fixError = fixError;



