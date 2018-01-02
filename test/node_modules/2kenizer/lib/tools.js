/*!
 * tools
 * Copyright(c) 2011-2012 Elmer Bulthuis <elmerbulthuis@gmail.com>
 * MIT Licensed
 */

var fs = require('fs');






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
    return data.toString();
}

exports.extend = extend;
exports.toString = toString;










function allDirectories(root, path){
    var result = [];

    path = path || '.';
    
    fs.readdirSync(root + '/' + path)
    .filter(function(file){
        var fileStat = fs.statSync(root + '/' + path + '/' + file);
        return fileStat.isDirectory();
    })
    .forEach(function(file) {
        result.push(path + '/' + file);
        allDirectories(root, path + '/' + file)
        .forEach(function(dir){
            result.push(dir);
        })
        ;
    })
    ;

    return result;
}

function allFiles(root, path){
    var result = [];

    path = path || '.';
    
    allDirectories(root, path)
    .forEach(function(path){
        fs.readdirSync(root + '/' + path)
        .filter(function(file){
            var fileStat = fs.statSync(root + '/' + path + '/' + file);
            return fileStat.isFile();
        })
        .forEach(function(file) {
            result.push(path + '/' + file);
        })
        ;
    })
    ;

    return result;
}

exports.allDirectories = allDirectories;
exports.allFiles = allFiles;






