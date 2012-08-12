var saveAnnotations=function(iid,annot)
{
      var IP="http://localhost";
      var jsonRequest = new Request.JSON({url: IP+'/bio/api/annotation.php', onSuccess: function(e){
		console.log("saved");
		}}).post({'iid':iid,'annot':annot});
};
