/**
 * [Loading description]
 * @constructor 
 */
function Loading(){

}
/**
 * @property {Element} the only instance of the loading page
 * 
 */
Loading.instance = null;

/**
 * @property {Element} the text element of Loading page.
 */
Loading.text = null;
Loading.open = function(parentNode ,text = 'loading...',zIndex=999){
	if(!Loading.instance) Loading.instance = Loading.createInstance();
  if(parentNode !== Loading.instance.parentNode) Loading.close();
  Loading.instance.style.zIndex = zIndex;
  Loading.text.textContent = text;
  Loading.pp = parentNode.style.position;
  parentNode.style.position = 'absolute';
  parentNode.appendChild(Loading.instance);
}

/**
 * factory mothed to create a instance of Loading class/page
 * @return {Element} the container of Loading page/element
 */
Loading.createInstance = function(){

	const cover = document.createElement('div');
  cover.classList.add('cover');
  
  const block = document.createElement('div');
  block.classList.add('block');
  const text = document.createElement('span');
 
  Loading.text = text;
  const bar = document.createElement('div');
  bar.classList.add('bar');
  
  block.appendChild(text);
  block.appendChild(bar);
  cover.appendChild(block);
  
  return cover;
  
}
/**
 * Close the loading hint page
 */
Loading.close = function(){
	if(!Loading.instance || !Loading.instance.parentNode)return;
    Loading.instance.parentNode.style.position = Loading.pp;
    Loading.instance.parentNode.removeChild(Loading.instance);

}