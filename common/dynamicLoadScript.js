console.log("running dynamic load script......");
IsPackageLoading = false;
ImgloaderMode = 'iip';
const params = getUrlVars();
// determine nanoborb or hosted, with or without pathdb
let file;
if (params.mode && params.mode==="pathdb"){
	ImgloaderMode = 'iip';
	file = '../../dist/pathdb_package.js';
}else if(params.slideId&&params.id&&params.slideId==="local"&&params.id.includes('http://localhost:8888')){
	ImgloaderMode = 'imgbox';
	file = '../../dist/imgbox_package.js';
}else{
	ImgloaderMode = 'iip';
	file = '../../dist/packages.js';
}

loadScript(file,function(){
	IsPackageLoading = true;
})
