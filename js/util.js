


// the robust solution that mimics jQuery's functionality
function extend(){
    for(var i=1; i<arguments.length; i++)
        for(var key in arguments[i])
            if(arguments[i].hasOwnProperty(key))
                arguments[0][key] = arguments[i][key];
    return arguments[0];
}

/**
	remove /empty a DOM element
*/
function empty(elt){
	while(elt.firstChild) elt.removeChild(elt.firstChild)
}

/*
	ID generator
*/
function randomId(){
	// Math.random should be unique because of its seeding algorithm.
	// Convert it to base 36 (numbers + letters), and grab the first 9 characters
	// after the decimal.
	return `_${Math.random().toString(36).substr(2, 9)}`
}

