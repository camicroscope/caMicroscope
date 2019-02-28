IsPackageLoading = false;
ImgloaderMode = 'iip';
const params = getUrlVars();
// determine nanoborb or hosted
let file;
if(params.slideId&&params.id&&params.slideId==="local"&&params.id.includes('http://localhost:8888')){
	ImgloaderMode = 'imgbox';
	file = '../../dist/imgbox_package.js';
}else{
	ImgloaderMode = 'iip';
	file = '../../dist/packages.js';
}

loadScript(file,function(){
	IsPackageLoading = true;
})