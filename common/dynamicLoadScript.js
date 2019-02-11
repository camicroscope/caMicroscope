IsLoading = false;
const params = getUrlVars();
// determine nanoborb or hosted
let file;
if(params.slideId&&params.id&&params.slideId==="local"&&params.id.includes('http://localhost:8888')){
	file = '../../dist/imgbox_package.js';
}else{
	file = '../../dist/package.js';
}

loadScript(file,function(){
	IsLoading = true;
})