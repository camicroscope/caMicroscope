console.log("running dynamic load script......");
IsPackageLoading = false;
ImgloaderMode = 'iip';
const params = getUrlVars();
// determine nanoborb or hosted, with or without pathdb
let file;
if (params.mode && params.mode==="pathdb"){
    ImgloaderMode = 'iip';
    await PathDbMods()
}
else if(params.slideId&&params.id&&params.slideId==="local"&&params.id.includes('http://localhost:8888')){
    ImgloaderMode = 'imgbox';
    NanoBorbMods()
    init_LocalStore()
}else{
    ImgloaderMode = 'iip';
    // no mods to perform as of now
}
IsPackageLoading=true;
