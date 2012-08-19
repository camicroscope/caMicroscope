var saveAnnotations=function(iid,annot)
{
      var IP="http://localhost";
      var jsonRequest = new Request.JSON({url: IP+'/bio/api/annot2.php', onSuccess: function(e){
		console.log("saved");
		}}).post({'annot':annot});
}

