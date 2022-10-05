console.log("running dynamic load script......");
IsPackageLoading = false;
ImgloaderMode = 'iip';
const params = getUrlVars();
// determine nanoborb or hosted, with or without pathdb
let file;
if (params.mode && params.mode==="pathdb"){
    ImgloaderMode = 'iip';
    PathDbMods().then(x=>{IsPackageLoading = true})
}
else if(params.slideId&&params.id&&params.slideId==="local"&&params.id.includes('http://localhost:8888')){
    ImgloaderMode = 'imgbox';
    NanoBorbMods()
    init_LocalStore()
    IsPackageLoading = true;
}else{
    ImgloaderMode = 'iip';
    IsPackageLoading = true;
    // no mods to perform as of now
}
