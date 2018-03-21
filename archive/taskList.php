<html>

    <head>
        <title>caMicroscope Tasklist</title>
        <link rel="stylesheet" href="http://cdn.datatables.net/1.10.12/css/jquery.dataTables.min.css" />
        <link rel="stylesheet" href="https://cdn.datatables.net/1.10.12/css/jquery.dataTables.min.css" />
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" integrity="sha384-1q8mTJOASx8j1Au+a5WDVnPi2lkFfwwEAa8hDDdjZlpLegxhjVME1fgjWPGmkzs7" crossorigin="anonymous">
        <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.2.4/jquery.min.js"></script>
        <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.6/js/bootstrap.min.js"> </script> 
        <script type="text/javascript">
          var CAMIC_URL = "http://dragon.cci.emory.edu/camicroscope3/osdCamicroscope.php?tissueId="
        </script>
        <style>
            body{
                font-family: Helvetica, Arial, Verdana;
            }
            .btn{
              width: 180px;
            }
            .pending{
                background: #FBC02D;
                border: 1px solid #000;
                border-radius: 4px;
                padding: 6px 10px;
                margin: 0;
            }
            #dataTable_wrapper, #username{
              width: 700px;
              margin: 0 auto;
            }
            #username{
              padding: 10px 0;
            }
        </style>


    </head>
    <body>
        <h2 style="
    padding: 14px;
    background: #1976D2;
    color: #fff;
    font-size: 22px;

    margin: 0px 0px 20px 0px;
    box-shadow: 3px 3px 3px #ccc;" > caMicroscope TaskList</h2>
        
        <h4 id="username"></h4>
        <table id="dataTable"  class="display" >

        </table>

        <script type="text/javascript" src='http://cdn.datatables.net/1.10.12/js/jquery.dataTables.min.js'>
        </script>
        <script type="text/javascript">
            console.log(jQuery);
            var username = "<?php echo $_GET['username']; ?>";
            var url = "api/Data/taskList.php?username="+username;
            $(document).ready(function() {
                console.log(url);
                console.log(username);
                $("#username").html("Tasklist for: "+username);
                $.get(url, function(data){
                    var data = JSON.parse(data);
                    console.log(data);
                    var tasksArr =[];
                    for(var i in data){
                      var task = data[i];
                      console.log(task);
                      var row = [i];
                      //row.push(task.imageID);
                      row.push('<a target="_blank" href="'+CAMIC_URL+task.imageID+'&username='+username+ '">'+ task.imageID+'</a>')
                      var completedID = "completed"+String(i);
                      var pendingID = "pending"+String(i);
                      var activeID = "active"+String(i);
                      var btnID = "btn"+String(i);
                      console.log(completedID);
                      if(task.status == "pending"){
                        row.push('<div id="'+btnID+'" class="dropdown"><button type="button" class="btn btn-danger dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Pending'+
                        '<span class="caret"></span></button>'+ '<ul class="dropdown-menu" aria-labelledby="dropdownMenu1"><li><a href="#" class="makeActive" id="'+ activeID +'">Active</a></li><li><a href="#" class="makeCompleted" id="'+completedID+'">Completed</a></li></ul> ' + '</div>');


                      }
                      if(task.status == "active"){
                      row.push('<div  id="'+btnID+'" class="dropdown"><button type="button" class="btn btn-warning dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Active'+
                      '<span class="caret"></span></button>'+ '<ul class="dropdown-menu" aria-labelledby="dropdownMenu1"><li><a href="#" class="makePending" id="'+pendingID+'">Pending</a></li><li><a href="#" class="makeCompleted" id="'+ completedID+'">Completed</a></li></ul> ' + '</div>')

                      }
                      if(task.status == "completed"){
                       row.push('<div  id="'+btnID+'" class="dropdown"><button type="button" class="btn btn-success dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Completed'+
                      '<span class="caret"></span></button>'+ '<ul class="dropdown-menu" aria-labelledby="dropdownMenu1"><li><a href="#" class="makePending" id="'+pendingID+'">Pending</a></li><li><a href="#" class="makeActive" id="'+activeID+'" >Active</a></li></ul> ' + '</div>')                       
                      }          
                      //row.push(task.status);
                      console.log(row);
                      tasksArr.push(row);
                    }

                    $("#dataTable").DataTable({
                        data: tasksArr,
                        columns: [
                            {"title": "taskID"}, 
                            {"title": "imageID"}, 
                            {"title": "status"}
                        ]
                    });
                    console.log(tasksArr);
                    var registerCallBacks = function(){

                        $(".makeActive").on("click", function(event){
                          console.log(event);
                          var elem = $(this);
                          var id = elem.attr("id");
                          console.log($(this).attr("id"));
                          taskID = id.split("active")[1];
                          console.log(taskID);
                          var payLoad = {"taskID": taskID, "username": username, "status": "active"};
                          console.log(payLoad);

                          $.post("api/Data/updateTask.php", JSON.stringify(payLoad)).done(function(data){
                            console.log(data); console.log("posted");
                            //elem.html("Active");
                            console.log(elem);
                            console.log("#btn"+taskID);
                            var completedID = "completed"+taskID;
                            var pendingID = "pending"+taskID;
                            $("#btn"+taskID).html('<button type="button" class="btn btn-warning dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Active'+
                      '<span class="caret"></span></button>'+ '<ul class="dropdown-menu" aria-labelledby="dropdownMenu1"><li><a href="#" class="makePending" id="'+pendingID+'">Pending</a></li><li><a href="#" class="makeCompleted" id="'+ completedID+'">Completed</a></li></ul> ' );
                            console.log("done");
                            registerCallBacks();
                          });

                          //console.log(event.data);
                        })
                        $(".makeCompleted").on("click", function(event){
                          console.log(event);
                          var elem = $(this);
                          var id = elem.attr("id");
                          console.log($(this).attr("id"));
                          taskID = id.split("completed")[1];
                          console.log(taskID);
                          var payLoad = {"taskID": taskID, "username": username, "status": "completed"};
                          console.log(payLoad);
                          $.post("api/Data/updateTask.php", JSON.stringify(payLoad)).done(function(data){
                            var completedID = "completed"+taskID;
                            var pendingID = "pending"+taskID;
                            var activeID = "active"+taskID;

                            $("#btn"+taskID).html('<button type="button" class="btn btn-success dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Completed'+
                      '<span class="caret"></span></button>'+ '<ul class="dropdown-menu" aria-labelledby="dropdownMenu1"><li><a href="#" class="makePending" id="'+pendingID+'">Pending</a></li><li><a href="#" class="makeActive" id="'+activeID+'" >Active</a></li></ul> ');
                            registerCallBacks();
                            console.log(data); console.log("posted");
                        
                          });

                          //console.log(event.data);
                        })
                         $(".makePending").on("click", function(event){
                          console.log(event);
                          var elem = $(this);
                          var id = elem.attr("id");
                          console.log($(this).attr("id"));
                          taskID = id.split("pending")[1];
                          console.log(taskID);
                          var payLoad = {"taskID": taskID, "username": username, "status": "pending"};
                          console.log(payLoad);
                          $.post("api/Data/updateTask.php", JSON.stringify(payLoad)).done(function(data){
                            console.log(data); console.log("posted");
                            var completedID = "completed"+taskID;
                            var pendingID = "pending"+taskID;
                            var activeID = "active"+taskID;
                            $("#btn"+taskID).html('<button type="button" class="btn btn-danger dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Pending'+
                        '<span class="caret"></span></button>'+ '<ul class="dropdown-menu" aria-labelledby="dropdownMenu1"><li><a href="#" class="makeActive" id="'+ activeID +'">Active</a></li><li><a href="#" class="makeCompleted" id="'+completedID+'">Completed</a></li></ul> '); 
                          });
                          registerCallBacks();

                          //console.log(event.data);
                        })                       
                    };
                    registerCallBacks();
                })
            } );
        </script> 
    </body>

</html>
