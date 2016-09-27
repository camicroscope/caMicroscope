$("#canvas").click(function(e){
    getPosition(e); 
});

var pointSize = 3;   // Change according to the size of the point

function getPosition(event) {
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;  
    var y = event.clientY - rect.top;   
        
    console.log(rect + " " + x + " " + y);
    drawCoordinates(x,y);   
}

function drawCoordinates(x,y) {	
    var ctx = document.getElementById("canvas").getContext("2d");
    ctx.fillStyle = "#ff2626"; // Red color

    ctx.beginPath();  //Start path
    //arc function(start x, start y, radius, startAngle, endAngle, anticlockwise?:bool)
    ctx.arc(x, y, pointSize, 0, Math.PI * 2, true);  // Draw a point using the arc function of the canvas with a point structure
    ctx.fill();   // Close the path and fill
}