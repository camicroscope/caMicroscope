$("#canvas").click(function(e){
     getPosition(e); 
});


var pointSize = 3;   // Change according to the size of the point

// Event will be a click event which can be retrieved as first parameter in the addEventListener(function(event{}));
// or in jQuery with $("selector").click(function(event){});
function getPosition(event){
     var rect = canvas.getBoundingClientRect();
     var x = event.clientX - rect.left;  // x == the location of the click in the document - the location (relative to the left) of the canvas in the document
     var y = event.clientY - rect.top;   // y == the location of the click in the document - the location (relative to the top) of the canvas in the document
        
    console.log(rect + " " + x + " " + y);
    drawCoordinates(x,y);
    
}

function drawCoordinates(x,y){	
  	var ctx = document.getElementById("canvas").getContext("2d");


  	ctx.fillStyle = "#ff2626"; // Red color

    ctx.beginPath();  //Start path
    //arc function(start x, start y, radius, startAngle, endAngle, anticlockwise?:bool)
    ctx.arc(x, y, pointSize, 0, Math.PI * 2, true);  // Draw a point using the arc function of the canvas with a point structure
    ctx.fill();   // Close the path and fill

}