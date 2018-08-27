// loading.js
function Loading(){

}
Loading.open = function(parentNode ,text = 'loading...'){
	if(!Loading.instance) Loading.instance = Loading.createInstance();
  Loading.text.textContent = text;
  parentNode.appendChild(Loading.instance);
  
}
Loading.instance = null;
Loading.text = null;
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
Loading.close = function(){
	Loading.instance.parentNode.removeChild(Loading.instance);
}

// const node = document.getElementsByClassName('parent');

// Load.open(node[0]);

// setTimeout(Load.close, 3000);
// setTimeout(function(){
// console.log('test');
// Load.open(node[0],'executing . . .');
// }, 6000);


// const list = [
// 	{id:123,elt:document.createElement('div')},
//   {id:321,elt:document.createElement('span')}
//   ];
//  list.forEach(item => console.log(item));