var saveAnnotations=function(iid,annot)
{
      var IP="http://170.140.138.125";
      var jsonRequest = new Request.JSON({url: IP+'/bio/api/annotation.php', onSuccess: function(e){
		console.log("saved");
		}}).post({'iid':iid,'annot':annot});
};
