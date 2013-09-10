/*
 * jQuery JavaScript Library v1.4.4
 * http://jquery.com/
 *
 * Copyright 2010, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 * Copyright 2010, The Dojo Foundation
 * Released under the MIT, BSD, and GPL Licenses.
 *
 * Date: Thu Nov 11 19:04:53 2010 -0500
 */
(function(av,az){function i(t,c,E){if(E===az&&t.nodeType===1){E=t.getAttribute("data-"+c);
if(typeof E==="string"){try{E=E==="true"?true:E==="false"?false:E==="null"?null:!O.isNaN(E)?parseFloat(E):Q.test(E)?O.parseJSON(E):E
}catch(B){}O.data(t,c,E)}else{E=az}}return E}function ak(){return false}function I(){return true
}function aX(t,c,B){B[0].type=t;return O.event.handle.apply(c,B)}function z(aa){var X,W,V,U,T,P,S,E,Z,c,B,t=[];
U=[];T=O.data(this,this.nodeType?"events":"__events__");if(typeof T==="function"){T=T.events
}if(!(aa.liveFired===this||!T||!T.live||aa.button&&aa.type==="click")){if(aa.namespace){B=RegExp("(^|\\.)"+aa.namespace.split(".").join("\\.(?:.*\\.)?")+"(\\.|$)")
}aa.liveFired=this;var Y=T.live.slice(0);for(S=0;S<Y.length;S++){T=Y[S];T.origType.replace(ah,"")===aa.type?U.push(T.selector):Y.splice(S--,1)
}U=O(aa.target).closest(U,aa.currentTarget);E=0;for(Z=U.length;E<Z;E++){c=U[E];for(S=0;
S<Y.length;S++){T=Y[S];if(c.selector===T.selector&&(!B||B.test(T.namespace))){P=c.elem;
V=null;if(T.preType==="mouseenter"||T.preType==="mouseleave"){aa.type=T.preType;V=O(aa.relatedTarget).closest(T.selector)[0]
}if(!V||V!==P){t.push({elem:P,handleObj:T,level:c.level})}}}}E=0;for(Z=t.length;E<Z;
E++){U=t[E];if(W&&U.level>W){break}aa.currentTarget=U.elem;aa.data=U.handleObj.data;
aa.handleObj=U.handleObj;B=U.handleObj.origHandler.apply(U.elem,arguments);if(B===false||aa.isPropagationStopped()){W=U.level;
if(B===false){X=false}if(aa.isImmediatePropagationStopped()){break}}}return X}}function ag(t,c){return(t&&t!=="*"?t+".":"")+c.replace(m,"`").replace(a1,"&")
}function aK(t,c,E){if(O.isFunction(c)){return O.grep(t,function(S,P){return !!c.call(S,P,S)===E
})}else{if(c.nodeType){return O.grep(t,function(P){return P===c===E})}else{if(typeof c==="string"){var B=O.grep(t,function(P){return P.nodeType===1
});if(aP.test(c)){return O.filter(c,B,!E)}else{c=O.filter(c,B)}}}}return O.grep(t,function(P){return O.inArray(P,c)>=0===E
})}function aw(t,c){var B=0;c.each(function(){if(this.nodeName===(t[B]&&t[B].nodeName)){var T=O.data(t[B++]),S=O.data(this,T);
if(T=T&&T.events){delete S.handle;S.events={};for(var P in T){for(var E in T[P]){O.event.add(this,P,T[P][E],T[P][E].data)
}}}}})}function aC(t,c){c.src?O.ajax({url:c.src,async:false,dataType:"script"}):O.globalEval(c.text||c.textContent||c.innerHTML||"");
c.parentNode&&c.parentNode.removeChild(c)}function N(t,c,E){var B=c==="width"?t.offsetWidth:t.offsetHeight;
if(E==="border"){return B}O.each(c==="width"?ad:D,function(){E||(B-=parseFloat(O.css(t,"padding"+this))||0);
if(E==="margin"){B+=parseFloat(O.css(t,"margin"+this))||0}else{B-=parseFloat(O.css(t,"border"+this+"Width"))||0
}});return B}function s(t,c,E,B){if(O.isArray(c)&&c.length){O.each(c,function(S,P){E||p.test(t)?B(t,P):s(t+"["+(typeof P==="object"||O.isArray(P)?S:"")+"]",P,E,B)
})}else{if(!E&&c!=null&&typeof c==="object"){O.isEmptyObject(c)?B(t,""):O.each(c,function(S,P){s(t+"["+S+"]",P,E,B)
})}else{B(t,c)}}}function am(t,c){var B={};O.each(y.concat.apply([],y.slice(0,c)),function(){B[this]=t
});return B}function l(t){if(!g[t]){var c=O("<"+t+">").appendTo("body"),B=c.css("display");
c.remove();if(B==="none"||B===""){B="block"}g[t]=B}return g[t]}function aU(c){return O.isWindow(c)?c:c.nodeType===9?c.defaultView||c.parentWindow:false
}var G=av.document,O=function(){function bh(){if(!bg.isReady){try{G.documentElement.doScroll("left")
}catch(bi){setTimeout(bh,1);return}bg.ready()}}var bg=function(bi,bj){return new bg.fn.init(bi,bj)
},bf=av.jQuery,be=av.$,bd,bb=/^(?:[^<]*(<[\w\W]+>)[^>]*$|#([\w\-]+)$)/,a8=/\S/,a9=/^\s+/,a5=/\s+$/,V=/\W/,ab=/\d/,a4=/^<(\w+)\s*\/?>(?:<\/\1>)?$/,aa=/^[\],:{}\s]*$/,T=/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,W=/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,U=/(?:^|:|,)(?:\s*\[)+/g,P=/(webkit)[ \/]([\w.]+)/,bc=/(opera)(?:.*version)?[ \/]([\w.]+)/,ba=/(msie) ([\w.]+)/,a6=/(mozilla)(?:.*? rv:([\w.]+))?/,a7=navigator.userAgent,a3=false,a2=[],Y,S=Object.prototype.toString,X=Object.prototype.hasOwnProperty,E=Array.prototype.push,B=Array.prototype.slice,t=String.prototype.trim,Z=Array.prototype.indexOf,c={};
bg.fn=bg.prototype={init:function(bj,bl){var bi,bm,bk;if(!bj){return this}if(bj.nodeType){this.context=this[0]=bj;
this.length=1;return this}if(bj==="body"&&!bl&&G.body){this.context=G;this[0]=G.body;
this.selector="body";this.length=1;return this}if(typeof bj==="string"){if((bi=bb.exec(bj))&&(bi[1]||!bl)){if(bi[1]){bk=bl?bl.ownerDocument||bl:G;
if(bm=a4.exec(bj)){if(bg.isPlainObject(bl)){bj=[G.createElement(bm[1])];bg.fn.attr.call(bj,bl,true)
}else{bj=[bk.createElement(bm[1])]}}else{bm=bg.buildFragment([bi[1]],[bk]);bj=(bm.cacheable?bm.fragment.cloneNode(true):bm.fragment).childNodes
}return bg.merge(this,bj)}else{if((bm=G.getElementById(bi[2]))&&bm.parentNode){if(bm.id!==bi[2]){return bd.find(bj)
}this.length=1;this[0]=bm}this.context=G;this.selector=bj;return this}}else{if(!bl&&!V.test(bj)){this.selector=bj;
this.context=G;bj=G.getElementsByTagName(bj);return bg.merge(this,bj)}else{return !bl||bl.jquery?(bl||bd).find(bj):bg(bl).find(bj)
}}}else{if(bg.isFunction(bj)){return bd.ready(bj)}}if(bj.selector!==az){this.selector=bj.selector;
this.context=bj.context}return bg.makeArray(bj,this)},selector:"",jquery:"1.4.4",length:0,size:function(){return this.length
},toArray:function(){return B.call(this,0)},get:function(bi){return bi==null?this.toArray():bi<0?this.slice(bi)[0]:this[bi]
},pushStack:function(bj,bk,bi){var bl=bg();bg.isArray(bj)?E.apply(bl,bj):bg.merge(bl,bj);
bl.prevObject=this;bl.context=this.context;if(bk==="find"){bl.selector=this.selector+(this.selector?" ":"")+bi
}else{if(bk){bl.selector=this.selector+"."+bk+"("+bi+")"}}return bl},each:function(bi,bj){return bg.each(this,bi,bj)
},ready:function(bi){bg.bindReady();if(bg.isReady){bi.call(G,bg)}else{a2&&a2.push(bi)
}return this},eq:function(bi){return bi===-1?this.slice(bi):this.slice(bi,+bi+1)},first:function(){return this.eq(0)
},last:function(){return this.eq(-1)},slice:function(){return this.pushStack(B.apply(this,arguments),"slice",B.call(arguments).join(","))
},map:function(bi){return this.pushStack(bg.map(this,function(bk,bj){return bi.call(bk,bj,bk)
}))},end:function(){return this.prevObject||bg(null)},push:E,sort:[].sort,splice:[].splice};
bg.fn.init.prototype=bg.fn;bg.extend=bg.fn.extend=function(){var bi,bq,bn,bk,bm,bo=arguments[0]||{},bl=1,bj=arguments.length,bp=false;
if(typeof bo==="boolean"){bp=bo;bo=arguments[1]||{};bl=2}if(typeof bo!=="object"&&!bg.isFunction(bo)){bo={}
}if(bj===bl){bo=this;--bl}for(;bl<bj;bl++){if((bi=arguments[bl])!=null){for(bq in bi){bn=bo[bq];
bk=bi[bq];if(bo!==bk){if(bp&&bk&&(bg.isPlainObject(bk)||(bm=bg.isArray(bk)))){if(bm){bm=false;
bn=bn&&bg.isArray(bn)?bn:[]}else{bn=bn&&bg.isPlainObject(bn)?bn:{}}bo[bq]=bg.extend(bp,bn,bk)
}else{if(bk!==az){bo[bq]=bk}}}}}}return bo};bg.extend({noConflict:function(bi){av.$=be;
if(bi){av.jQuery=bf}return bg},isReady:false,readyWait:1,ready:function(bj){bj===true&&bg.readyWait--;
if(!bg.readyWait||bj!==true&&!bg.isReady){if(!G.body){return setTimeout(bg.ready,1)
}bg.isReady=true;if(!(bj!==true&&--bg.readyWait>0)){if(a2){var bk=0,bi=a2;for(a2=null;
bj=bi[bk++];){bj.call(G,bg)}bg.fn.trigger&&bg(G).trigger("ready").unbind("ready")
}}}},bindReady:function(){if(!a3){a3=true;if(G.readyState==="complete"){return setTimeout(bg.ready,1)
}if(G.addEventListener){G.addEventListener("DOMContentLoaded",Y,false);av.addEventListener("load",bg.ready,false)
}else{if(G.attachEvent){G.attachEvent("onreadystatechange",Y);av.attachEvent("onload",bg.ready);
var bi=false;try{bi=av.frameElement==null}catch(bj){}G.documentElement.doScroll&&bi&&bh()
}}}},isFunction:function(bi){return bg.type(bi)==="function"},isArray:Array.isArray||function(bi){return bg.type(bi)==="array"
},isWindow:function(bi){return bi&&typeof bi==="object"&&"setInterval" in bi},isNaN:function(bi){return bi==null||!ab.test(bi)||isNaN(bi)
},type:function(bi){return bi==null?String(bi):c[S.call(bi)]||"object"},isPlainObject:function(bi){if(!bi||bg.type(bi)!=="object"||bi.nodeType||bg.isWindow(bi)){return false
}if(bi.constructor&&!X.call(bi,"constructor")&&!X.call(bi.constructor.prototype,"isPrototypeOf")){return false
}for(var bj in bi){}return bj===az||X.call(bi,bj)},isEmptyObject:function(bi){for(var bj in bi){return false
}return true},error:function(bi){throw bi},parseJSON:function(bi){if(typeof bi!=="string"||!bi){return null
}bi=bg.trim(bi);if(aa.test(bi.replace(T,"@").replace(W,"]").replace(U,""))){return av.JSON&&av.JSON.parse?av.JSON.parse(bi):(new Function("return "+bi))()
}else{bg.error("Invalid JSON: "+bi)}},noop:function(){},globalEval:function(bj){if(bj&&a8.test(bj)){var bk=G.getElementsByTagName("head")[0]||G.documentElement,bi=G.createElement("script");
bi.type="text/javascript";if(bg.support.scriptEval){bi.appendChild(G.createTextNode(bj))
}else{bi.text=bj}bk.insertBefore(bi,bk.firstChild);bk.removeChild(bi)}},nodeName:function(bi,bj){return bi.nodeName&&bi.nodeName.toUpperCase()===bj.toUpperCase()
},each:function(bk,bn,bj){var bo,bl=0,bm=bk.length,bi=bm===az||bg.isFunction(bk);
if(bj){if(bi){for(bo in bk){if(bn.apply(bk[bo],bj)===false){break}}}else{for(;bl<bm;
){if(bn.apply(bk[bl++],bj)===false){break}}}}else{if(bi){for(bo in bk){if(bn.call(bk[bo],bo,bk[bo])===false){break
}}}else{for(bj=bk[0];bl<bm&&bn.call(bj,bl,bj)!==false;bj=bk[++bl]){}}}return bk},trim:t?function(bi){return bi==null?"":t.call(bi)
}:function(bi){return bi==null?"":bi.toString().replace(a9,"").replace(a5,"")},makeArray:function(bj,bk){var bi=bk||[];
if(bj!=null){var bl=bg.type(bj);bj.length==null||bl==="string"||bl==="function"||bl==="regexp"||bg.isWindow(bj)?E.call(bi,bj):bg.merge(bi,bj)
}return bi},inArray:function(bj,bk){if(bk.indexOf){return bk.indexOf(bj)}for(var bi=0,bl=bk.length;
bi<bl;bi++){if(bk[bi]===bj){return bi}}return -1},merge:function(bj,bl){var bi=bj.length,bm=0;
if(typeof bl.length==="number"){for(var bk=bl.length;bm<bk;bm++){bj[bi++]=bl[bm]}}else{for(;
bl[bm]!==az;){bj[bi++]=bl[bm++]}}bj.length=bi;return bj},grep:function(bk,bn,bj){var bo=[],bl;
bj=!!bj;for(var bm=0,bi=bk.length;bm<bi;bm++){bl=!!bn(bk[bm],bm);bj!==bl&&bo.push(bk[bm])
}return bo},map:function(bk,bn,bj){for(var bo=[],bl,bm=0,bi=bk.length;bm<bi;bm++){bl=bn(bk[bm],bm,bj);
if(bl!=null){bo[bo.length]=bl}}return bo.concat.apply([],bo)},guid:1,proxy:function(bj,bk,bi){if(arguments.length===2){if(typeof bk==="string"){bi=bj;
bj=bi[bk];bk=az}else{if(bk&&!bg.isFunction(bk)){bi=bk;bk=az}}}if(!bk&&bj){bk=function(){return bj.apply(bi||this,arguments)
}}if(bj){bk.guid=bj.guid=bj.guid||bk.guid||bg.guid++}return bk},access:function(bk,bn,bj,bp,bl,bm){var bi=bk.length;
if(typeof bn==="object"){for(var bo in bn){bg.access(bk,bo,bn[bo],bp,bl,bj)}return bk
}if(bj!==az){bp=!bm&&bp&&bg.isFunction(bj);for(bo=0;bo<bi;bo++){bl(bk[bo],bn,bp?bj.call(bk[bo],bo,bl(bk[bo],bn)):bj,bm)
}return bk}return bi?bl(bk[0],bn):az},now:function(){return(new Date).getTime()},uaMatch:function(bi){bi=bi.toLowerCase();
bi=P.exec(bi)||bc.exec(bi)||ba.exec(bi)||bi.indexOf("compatible")<0&&a6.exec(bi)||[];
return{browser:bi[1]||"",version:bi[2]||"0"}},browser:{}});bg.each("Boolean Number String Function Array Date RegExp Object".split(" "),function(bi,bj){c["[object "+bj+"]"]=bj.toLowerCase()
});a7=bg.uaMatch(a7);if(a7.browser){bg.browser[a7.browser]=true;bg.browser.version=a7.version
}if(bg.browser.webkit){bg.browser.safari=true}if(Z){bg.inArray=function(bi,bj){return Z.call(bj,bi)
}}if(!/\s/.test("\u00a0")){a9=/^[\s\xA0]+/;a5=/[\s\xA0]+$/}bd=bg(G);if(G.addEventListener){Y=function(){G.removeEventListener("DOMContentLoaded",Y,false);
bg.ready()}}else{if(G.attachEvent){Y=function(){if(G.readyState==="complete"){G.detachEvent("onreadystatechange",Y);
bg.ready()}}}}return av.jQuery=av.$=bg}();(function(){O.support={};var X=G.documentElement,V=G.createElement("script"),U=G.createElement("div"),T="script"+O.now();
U.style.display="none";U.innerHTML="   <link/><table></table><a href='/a' style='color:red;float:left;opacity:.55;'>a</a><input type='checkbox'/>";
var S=U.getElementsByTagName("*"),P=U.getElementsByTagName("a")[0],B=G.createElement("select"),E=B.appendChild(G.createElement("option"));
if(!(!S||!S.length||!P)){O.support={leadingWhitespace:U.firstChild.nodeType===3,tbody:!U.getElementsByTagName("tbody").length,htmlSerialize:!!U.getElementsByTagName("link").length,style:/red/.test(P.getAttribute("style")),hrefNormalized:P.getAttribute("href")==="/a",opacity:/^0.55$/.test(P.style.opacity),cssFloat:!!P.style.cssFloat,checkOn:U.getElementsByTagName("input")[0].value==="on",optSelected:E.selected,deleteExpando:true,optDisabled:false,checkClone:false,scriptEval:false,noCloneEvent:true,boxModel:null,inlineBlockNeedsLayout:false,shrinkWrapBlocks:false,reliableHiddenOffsets:true};
B.disabled=true;O.support.optDisabled=!E.disabled;V.type="text/javascript";try{V.appendChild(G.createTextNode("window."+T+"=1;"))
}catch(t){}X.insertBefore(V,X.firstChild);if(av[T]){O.support.scriptEval=true;delete av[T]
}try{delete V.test}catch(W){O.support.deleteExpando=false}X.removeChild(V);if(U.attachEvent&&U.fireEvent){U.attachEvent("onclick",function c(){O.support.noCloneEvent=false;
U.detachEvent("onclick",c)});U.cloneNode(true).fireEvent("onclick")}U=G.createElement("div");
U.innerHTML="<input type='radio' name='radiotest' checked='checked'/>";X=G.createDocumentFragment();
X.appendChild(U.firstChild);O.support.checkClone=X.cloneNode(true).cloneNode(true).lastChild.checked;
O(function(){var Z=G.createElement("div");Z.style.width=Z.style.paddingLeft="1px";
G.body.appendChild(Z);O.boxModel=O.support.boxModel=Z.offsetWidth===2;if("zoom" in Z.style){Z.style.display="inline";
Z.style.zoom=1;O.support.inlineBlockNeedsLayout=Z.offsetWidth===2;Z.style.display="";
Z.innerHTML="<div style='width:4px;'></div>";O.support.shrinkWrapBlocks=Z.offsetWidth!==2
}Z.innerHTML="<table><tr><td style='padding:0;display:none'></td><td>t</td></tr></table>";
var Y=Z.getElementsByTagName("td");O.support.reliableHiddenOffsets=Y[0].offsetHeight===0;
Y[0].style.display="";Y[1].style.display="none";O.support.reliableHiddenOffsets=O.support.reliableHiddenOffsets&&Y[0].offsetHeight===0;
Z.innerHTML="";G.body.removeChild(Z).style.display="none"});X=function(Z){var Y=G.createElement("div");
Z="on"+Z;var aa=Z in Y;if(!aa){Y.setAttribute(Z,"return;");aa=typeof Y[Z]==="function"
}return aa};O.support.submitBubbles=X("submit");O.support.changeBubbles=X("change");
X=V=U=S=P=null}})();var a0={},Q=/^(?:\{.*\}|\[.*\])$/;O.extend({cache:{},uuid:0,expando:"jQuery"+O.now(),noData:{embed:true,object:"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",applet:true},data:function(t,c,S){if(O.acceptData(t)){t=t==av?a0:t;
var P=t.nodeType,E=P?t[O.expando]:null,B=O.cache;if(!(P&&!E&&typeof c==="string"&&S===az)){if(P){E||(t[O.expando]=E=++O.uuid)
}else{B=t}if(typeof c==="object"){if(P){B[E]=O.extend(B[E],c)}else{O.extend(B,c)}}else{if(P&&!B[E]){B[E]={}
}}t=P?B[E]:B;if(S!==az){t[c]=S}return typeof c==="string"?t[c]:t}}},removeData:function(B,c){if(O.acceptData(B)){B=B==av?a0:B;
var T=B.nodeType,S=T?B[O.expando]:B,P=O.cache,E=T?P[S]:S;if(c){if(E){delete E[c];
T&&O.isEmptyObject(E)&&O.removeData(B)}}else{if(T&&O.support.deleteExpando){delete B[O.expando]
}else{if(B.removeAttribute){B.removeAttribute(O.expando)}else{if(T){delete P[S]}else{for(var t in B){delete B[t]
}}}}}}},acceptData:function(t){if(t.nodeName){var c=O.noData[t.nodeName.toLowerCase()];
if(c){return !(c===true||t.getAttribute("classid")!==c)}}return true}});O.fn.extend({data:function(B,c){var U=null;
if(typeof B==="undefined"){if(this.length){var T=this[0].attributes,S;U=O.data(this[0]);
for(var P=0,t=T.length;P<t;P++){S=T[P].name;if(S.indexOf("data-")===0){S=S.substr(5);
i(this[0],S,U[S])}}}return U}else{if(typeof B==="object"){return this.each(function(){O.data(this,B)
})}}var E=B.split(".");E[1]=E[1]?"."+E[1]:"";if(c===az){U=this.triggerHandler("getData"+E[1]+"!",[E[0]]);
if(U===az&&this.length){U=O.data(this[0],B);U=i(this[0],B,U)}return U===az&&E[1]?this.data(E[0]):U
}else{return this.each(function(){var W=O(this),V=[E[0],c];W.triggerHandler("setData"+E[1]+"!",V);
O.data(this,B,c);W.triggerHandler("changeData"+E[1]+"!",V)})}},removeData:function(c){return this.each(function(){O.removeData(this,c)
})}});O.extend({queue:function(t,c,E){if(t){c=(c||"fx")+"queue";var B=O.data(t,c);
if(!E){return B||[]}if(!B||O.isArray(E)){B=O.data(t,c,O.makeArray(E))}else{B.push(E)
}return B}},dequeue:function(t,c){c=c||"fx";var E=O.queue(t,c),B=E.shift();if(B==="inprogress"){B=E.shift()
}if(B){c==="fx"&&E.unshift("inprogress");B.call(t,function(){O.dequeue(t,c)})}}});
O.fn.extend({queue:function(t,c){if(typeof t!=="string"){c=t;t="fx"}if(c===az){return O.queue(this[0],t)
}return this.each(function(){var B=O.queue(this,t,c);t==="fx"&&B[0]!=="inprogress"&&O.dequeue(this,t)
})},dequeue:function(c){return this.each(function(){O.dequeue(this,c)})},delay:function(t,c){t=O.fx?O.fx.speeds[t]||t:t;
c=c||"fx";return this.queue(c,function(){var B=this;setTimeout(function(){O.dequeue(B,c)
},t)})},clearQueue:function(c){return this.queue(c||"fx",[])}});var aO=/[\n\t]/g,ar=/\s+/,d=/\r/g,aR=/^(?:href|src|style)$/,aE=/^(?:button|input)$/i,af=/^(?:button|input|object|select|textarea)$/i,F=/^a(?:rea)?$/i,aB=/^(?:radio|checkbox)$/i;
O.props={"for":"htmlFor","class":"className",readonly:"readOnly",maxlength:"maxLength",cellspacing:"cellSpacing",rowspan:"rowSpan",colspan:"colSpan",tabindex:"tabIndex",usemap:"useMap",frameborder:"frameBorder"};
O.fn.extend({attr:function(t,c){return O.access(this,t,c,true,O.attr)},removeAttr:function(c){return this.each(function(){O.attr(this,c,"");
this.nodeType===1&&this.removeAttribute(c)})},addClass:function(V){if(O.isFunction(V)){return this.each(function(W){var X=O(this);
X.addClass(V.call(this,W,X.attr("class")))})}if(V&&typeof V==="string"){for(var U=(V||"").split(ar),T=0,S=this.length;
T<S;T++){var P=this[T];if(P.nodeType===1){if(P.className){for(var E=" "+P.className+" ",t=P.className,B=0,c=U.length;
B<c;B++){if(E.indexOf(" "+U[B]+" ")<0){t+=" "+U[B]}}P.className=O.trim(t)}else{P.className=V
}}}}return this},removeClass:function(B){if(O.isFunction(B)){return this.each(function(W){var V=O(this);
V.removeClass(B.call(this,W,V.attr("class")))})}if(B&&typeof B==="string"||B===az){for(var c=(B||"").split(ar),U=0,T=this.length;
U<T;U++){var S=this[U];if(S.nodeType===1&&S.className){if(B){for(var P=(" "+S.className+" ").replace(aO," "),t=0,E=c.length;
t<E;t++){P=P.replace(" "+c[t]+" "," ")}S.className=O.trim(P)}else{S.className=""}}}}return this
},toggleClass:function(t,c){var E=typeof t,B=typeof c==="boolean";if(O.isFunction(t)){return this.each(function(S){var P=O(this);
P.toggleClass(t.call(this,S,P.attr("class"),c),c)})}return this.each(function(){if(E==="string"){for(var U,T=0,P=O(this),S=c,V=t.split(ar);
U=V[T++];){S=B?S:!P.hasClass(U);P[S?"addClass":"removeClass"](U)}}else{if(E==="undefined"||E==="boolean"){this.className&&O.data(this,"__className__",this.className);
this.className=this.className||t===false?"":O.data(this,"__className__")||""}}})},hasClass:function(t){t=" "+t+" ";
for(var c=0,B=this.length;c<B;c++){if((" "+this[c].className+" ").replace(aO," ").indexOf(t)>-1){return true
}}return false},val:function(B){if(!arguments.length){var c=this[0];if(c){if(O.nodeName(c,"option")){var U=c.attributes.value;
return !U||U.specified?c.value:c.text}if(O.nodeName(c,"select")){var T=c.selectedIndex;
U=[];var S=c.options;c=c.type==="select-one";if(T<0){return null}var P=c?T:0;for(T=c?T+1:S.length;
P<T;P++){var t=S[P];if(t.selected&&(O.support.optDisabled?!t.disabled:t.getAttribute("disabled")===null)&&(!t.parentNode.disabled||!O.nodeName(t.parentNode,"optgroup"))){B=O(t).val();
if(c){return B}U.push(B)}}return U}if(aB.test(c.type)&&!O.support.checkOn){return c.getAttribute("value")===null?"on":c.value
}return(c.value||"").replace(d,"")}return az}var E=O.isFunction(B);return this.each(function(Y){var W=O(this),X=B;
if(this.nodeType===1){if(E){X=B.call(this,Y,W.val())}if(X==null){X=""}else{if(typeof X==="number"){X+=""
}else{if(O.isArray(X)){X=O.map(X,function(Z){return Z==null?"":Z+""})}}}if(O.isArray(X)&&aB.test(this.type)){this.checked=O.inArray(W.val(),X)>=0
}else{if(O.nodeName(this,"select")){var V=O.makeArray(X);O("option",this).each(function(){this.selected=O.inArray(O(this).val(),V)>=0
});if(!V.length){this.selectedIndex=-1}}else{this.value=X}}}})}});O.extend({attrFn:{val:true,css:true,html:true,text:true,data:true,width:true,height:true,offset:true},attr:function(t,c,S,P){if(!t||t.nodeType===3||t.nodeType===8){return az
}if(P&&c in O.attrFn){return O(t)[c](S)}P=t.nodeType!==1||!O.isXMLDoc(t);var E=S!==az;
c=P&&O.props[c]||c;var B=aR.test(c);if((c in t||t[c]!==az)&&P&&!B){if(E){c==="type"&&aE.test(t.nodeName)&&t.parentNode&&O.error("type property can't be changed");
if(S===null){t.nodeType===1&&t.removeAttribute(c)}else{t[c]=S}}if(O.nodeName(t,"form")&&t.getAttributeNode(c)){return t.getAttributeNode(c).nodeValue
}if(c==="tabIndex"){return(c=t.getAttributeNode("tabIndex"))&&c.specified?c.value:af.test(t.nodeName)||F.test(t.nodeName)&&t.href?0:az
}return t[c]}if(!O.support.style&&P&&c==="style"){if(E){t.style.cssText=""+S}return t.style.cssText
}E&&t.setAttribute(c,""+S);if(!t.attributes[c]&&t.hasAttribute&&!t.hasAttribute(c)){return az
}t=!O.support.hrefNormalized&&P&&B?t.getAttribute(c,2):t.getAttribute(c);return t===null?az:t
}});var ah=/\.(.*)$/,K=/^(?:textarea|input|select)$/i,m=/\./g,a1=/ /g,q=/[^\w\s.|`]/g,e=function(c){return c.replace(q,"\\$&")
},ac={focusin:0,focusout:0};O.event={add:function(Z,X,W,V){if(!(Z.nodeType===3||Z.nodeType===8)){if(O.isWindow(Z)&&Z!==av&&!Z.frameElement){Z=av
}if(W===false){W=ak}else{if(!W){return}}var U,T;if(W.handler){U=W;W=U.handler}if(!W.guid){W.guid=O.guid++
}if(T=O.data(Z)){var P=Z.nodeType?"events":"__events__",S=T[P],E=T.handle;if(typeof S==="function"){E=S.handle;
S=S.events}else{if(!S){Z.nodeType||(T[P]=T=function(){});T.events=S={}}}if(!E){T.handle=E=function(){return typeof O!=="undefined"&&!O.event.triggered?O.event.handle.apply(E.elem,arguments):az
}}E.elem=Z;X=X.split(" ");for(var Y=0,c;P=X[Y++];){T=U?O.extend({},U):{handler:W,data:V};
if(P.indexOf(".")>-1){c=P.split(".");P=c.shift();T.namespace=c.slice(0).sort().join(".")
}else{c=[];T.namespace=""}T.type=P;if(!T.guid){T.guid=W.guid}var B=S[P],t=O.event.special[P]||{};
if(!B){B=S[P]=[];if(!t.setup||t.setup.call(Z,V,c,E)===false){if(Z.addEventListener){Z.addEventListener(P,E,false)
}else{Z.attachEvent&&Z.attachEvent("on"+P,E)}}}if(t.add){t.add.call(Z,T);if(!T.handler.guid){T.handler.guid=W.guid
}}B.push(T);O.event.global[P]=true}Z=null}}},global:{},remove:function(aa,X,W,V){if(!(aa.nodeType===3||aa.nodeType===8)){if(W===false){W=ak
}var U,T,P=0,S,E,Z,c,B,t,Y=aa.nodeType?"events":"__events__",a2=O.data(aa),ab=a2&&a2[Y];
if(a2&&ab){if(typeof ab==="function"){a2=ab;ab=ab.events}if(X&&X.type){W=X.handler;
X=X.type}if(!X||typeof X==="string"&&X.charAt(0)==="."){X=X||"";for(U in ab){O.event.remove(aa,U+X)
}}else{for(X=X.split(" ");U=X[P++];){c=U;S=U.indexOf(".")<0;E=[];if(!S){E=U.split(".");
U=E.shift();Z=RegExp("(^|\\.)"+O.map(E.slice(0).sort(),e).join("\\.(?:.*\\.)?")+"(\\.|$)")
}if(B=ab[U]){if(W){c=O.event.special[U]||{};for(T=V||0;T<B.length;T++){t=B[T];if(W.guid===t.guid){if(S||Z.test(t.namespace)){V==null&&B.splice(T--,1);
c.remove&&c.remove.call(aa,t)}if(V!=null){break}}}if(B.length===0||V!=null&&B.length===1){if(!c.teardown||c.teardown.call(aa,E)===false){O.removeEvent(aa,U,a2.handle)
}delete ab[U]}}else{for(T=0;T<B.length;T++){t=B[T];if(S||Z.test(t.namespace)){O.event.remove(aa,c,t.handler,T);
B.splice(T--,1)}}}}}if(O.isEmptyObject(ab)){if(X=a2.handle){X.elem=null}delete a2.events;
delete a2.handle;if(typeof a2==="function"){O.removeData(aa,Y)}else{O.isEmptyObject(a2)&&O.removeData(aa)
}}}}}},trigger:function(X,V,U,T){var S=X.type||X;if(!T){X=typeof X==="object"?X[O.expando]?X:O.extend(O.Event(S),X):O.Event(S);
if(S.indexOf("!")>=0){X.type=S=S.slice(0,-1);X.exclusive=true}if(!U){X.stopPropagation();
O.event.global[S]&&O.each(O.cache,function(){this.events&&this.events[S]&&O.event.trigger(X,V,this.handle.elem)
})}if(!U||U.nodeType===3||U.nodeType===8){return az}X.result=az;X.target=U;V=O.makeArray(V);
V.unshift(X)}X.currentTarget=U;(T=U.nodeType?O.data(U,"handle"):(O.data(U,"__events__")||{}).handle)&&T.apply(U,V);
T=U.parentNode||U.ownerDocument;try{if(!(U&&U.nodeName&&O.noData[U.nodeName.toLowerCase()])){if(U["on"+S]&&U["on"+S].apply(U,V)===false){X.result=false;
X.preventDefault()}}}catch(P){}if(!X.isPropagationStopped()&&T){O.event.trigger(X,V,T,true)
}else{if(!X.isDefaultPrevented()){var B;T=X.target;var E=S.replace(ah,""),t=O.nodeName(T,"a")&&E==="click",W=O.event.special[E]||{};
if((!W._default||W._default.call(U,X)===false)&&!t&&!(T&&T.nodeName&&O.noData[T.nodeName.toLowerCase()])){try{if(T[E]){if(B=T["on"+E]){T["on"+E]=null
}O.event.triggered=true;T[E]()}}catch(c){}if(B){T["on"+E]=B}O.event.triggered=false
}}}},handle:function(B){var c,U,T,S;U=[];var P=O.makeArray(arguments);B=P[0]=O.event.fix(B||av.event);
B.currentTarget=this;c=B.type.indexOf(".")<0&&!B.exclusive;if(!c){T=B.type.split(".");
B.type=T.shift();U=T.slice(0).sort();T=RegExp("(^|\\.)"+U.join("\\.(?:.*\\.)?")+"(\\.|$)")
}B.namespace=B.namespace||U.join(".");S=O.data(this,this.nodeType?"events":"__events__");
if(typeof S==="function"){S=S.events}U=(S||{})[B.type];if(S&&U){U=U.slice(0);S=0;
for(var t=U.length;S<t;S++){var E=U[S];if(c||T.test(E.namespace)){B.handler=E.handler;
B.data=E.data;B.handleObj=E;E=E.handler.apply(this,P);if(E!==az){B.result=E;if(E===false){B.preventDefault();
B.stopPropagation()}}if(B.isImmediatePropagationStopped()){break}}}}return B.result
},props:"altKey attrChange attrName bubbles button cancelable charCode clientX clientY ctrlKey currentTarget data detail eventPhase fromElement handler keyCode layerX layerY metaKey newValue offsetX offsetY pageX pageY prevValue relatedNode relatedTarget screenX screenY shiftKey srcElement target toElement view wheelDelta which".split(" "),fix:function(t){if(t[O.expando]){return t
}var c=t;t=O.Event(c);for(var E=this.props.length,B;E;){B=this.props[--E];t[B]=c[B]
}if(!t.target){t.target=t.srcElement||G}if(t.target.nodeType===3){t.target=t.target.parentNode
}if(!t.relatedTarget&&t.fromElement){t.relatedTarget=t.fromElement===t.target?t.toElement:t.fromElement
}if(t.pageX==null&&t.clientX!=null){c=G.documentElement;E=G.body;t.pageX=t.clientX+(c&&c.scrollLeft||E&&E.scrollLeft||0)-(c&&c.clientLeft||E&&E.clientLeft||0);
t.pageY=t.clientY+(c&&c.scrollTop||E&&E.scrollTop||0)-(c&&c.clientTop||E&&E.clientTop||0)
}if(t.which==null&&(t.charCode!=null||t.keyCode!=null)){t.which=t.charCode!=null?t.charCode:t.keyCode
}if(!t.metaKey&&t.ctrlKey){t.metaKey=t.ctrlKey}if(!t.which&&t.button!==az){t.which=t.button&1?1:t.button&2?3:t.button&4?2:0
}return t},guid:100000000,proxy:O.proxy,special:{ready:{setup:O.bindReady,teardown:O.noop},live:{add:function(c){O.event.add(this,ag(c.origType,c.selector),O.extend({},c,{handler:z,guid:c.handler.guid}))
},remove:function(c){O.event.remove(this,ag(c.origType,c.selector),c)}},beforeunload:{setup:function(t,c,B){if(O.isWindow(this)){this.onbeforeunload=B
}},teardown:function(t,c){if(this.onbeforeunload===c){this.onbeforeunload=null}}}}};
O.removeEvent=G.removeEventListener?function(t,c,B){t.removeEventListener&&t.removeEventListener(c,B,false)
}:function(t,c,B){t.detachEvent&&t.detachEvent("on"+c,B)};O.Event=function(c){if(!this.preventDefault){return new O.Event(c)
}if(c&&c.type){this.originalEvent=c;this.type=c.type}else{this.type=c}this.timeStamp=O.now();
this[O.expando]=true};O.Event.prototype={preventDefault:function(){this.isDefaultPrevented=I;
var c=this.originalEvent;if(c){if(c.preventDefault){c.preventDefault()}else{c.returnValue=false
}}},stopPropagation:function(){this.isPropagationStopped=I;var c=this.originalEvent;
if(c){c.stopPropagation&&c.stopPropagation();c.cancelBubble=true}},stopImmediatePropagation:function(){this.isImmediatePropagationStopped=I;
this.stopPropagation()},isDefaultPrevented:ak,isPropagationStopped:ak,isImmediatePropagationStopped:ak};
var C=function(t){var c=t.relatedTarget;try{for(;c&&c!==this;){c=c.parentNode}if(c!==this){t.type=t.data;
O.event.handle.apply(this,arguments)}}catch(B){}},o=function(c){c.type=c.data;O.event.handle.apply(this,arguments)
};O.each({mouseenter:"mouseover",mouseleave:"mouseout"},function(t,c){O.event.special[t]={setup:function(B){O.event.add(this,c,B&&B.selector?o:C,t)
},teardown:function(B){O.event.remove(this,c,B&&B.selector?o:C)}}});if(!O.support.submitBubbles){O.event.special.submit={setup:function(){if(this.nodeName.toLowerCase()!=="form"){O.event.add(this,"click.specialSubmit",function(t){var c=t.target,B=c.type;
if((B==="submit"||B==="image")&&O(c).closest("form").length){t.liveFired=az;return aX("submit",this,arguments)
}});O.event.add(this,"keypress.specialSubmit",function(t){var c=t.target,B=c.type;
if((B==="text"||B==="password")&&O(c).closest("form").length&&t.keyCode===13){t.liveFired=az;
return aX("submit",this,arguments)}})}else{return false}},teardown:function(){O.event.remove(this,".specialSubmit")
}}}if(!O.support.changeBubbles){var aj,b=function(t){var c=t.type,B=t.value;if(c==="radio"||c==="checkbox"){B=t.checked
}else{if(c==="select-multiple"){B=t.selectedIndex>-1?O.map(t.options,function(E){return E.selected
}).join("-"):""}else{if(t.nodeName.toLowerCase()==="select"){B=t.selectedIndex}}}return B
},ae=function(t,c){var P=t.target,E,B;if(!(!K.test(P.nodeName)||P.readOnly)){E=O.data(P,"_change_data");
B=b(P);if(t.type!=="focusout"||P.type!=="radio"){O.data(P,"_change_data",B)}if(!(E===az||B===E)){if(E!=null||B){t.type="change";
t.liveFired=az;return O.event.trigger(t,c,P)}}}};O.event.special.change={filters:{focusout:ae,beforedeactivate:ae,click:function(t){var c=t.target,B=c.type;
if(B==="radio"||B==="checkbox"||c.nodeName.toLowerCase()==="select"){return ae.call(this,t)
}},keydown:function(t){var c=t.target,B=c.type;if(t.keyCode===13&&c.nodeName.toLowerCase()!=="textarea"||t.keyCode===32&&(B==="checkbox"||B==="radio")||B==="select-multiple"){return ae.call(this,t)
}},beforeactivate:function(c){c=c.target;O.data(c,"_change_data",b(c))}},setup:function(){if(this.type==="file"){return false
}for(var c in aj){O.event.add(this,c+".specialChange",aj[c])}return K.test(this.nodeName)
},teardown:function(){O.event.remove(this,".specialChange");return K.test(this.nodeName)
}};aj=O.event.special.change.filters;aj.focus=aj.beforeactivate}G.addEventListener&&O.each({focus:"focusin",blur:"focusout"},function(t,c){function B(E){E=O.event.fix(E);
E.type=c;return O.event.trigger(E,null,E.target)}O.event.special[c]={setup:function(){ac[c]++===0&&G.addEventListener(t,B,true)
},teardown:function(){--ac[c]===0&&G.removeEventListener(t,B,true)}}});O.each(["bind","one"],function(t,c){O.fn[c]=function(U,T,S){if(typeof U==="object"){for(var P in U){this[c](P,T,U[P],S)
}return this}if(O.isFunction(T)||T===false){S=T;T=az}var B=c==="one"?O.proxy(S,function(V){O(this).unbind(V,B);
return S.apply(this,arguments)}):S;if(U==="unload"&&c!=="one"){this.one(U,T,S)}else{P=0;
for(var E=this.length;P<E;P++){O.event.add(this[P],U,B,T)}}return this}});O.fn.extend({unbind:function(t,c){if(typeof t==="object"&&!t.preventDefault){for(var E in t){this.unbind(E,t[E])
}}else{E=0;for(var B=this.length;E<B;E++){O.event.remove(this[E],t,c)}}return this
},delegate:function(t,c,E,B){return this.live(c,E,B,t)},undelegate:function(t,c,B){return arguments.length===0?this.unbind("live"):this.die(c,null,B,t)
},trigger:function(t,c){return this.each(function(){O.event.trigger(t,c,this)})},triggerHandler:function(t,c){if(this[0]){var B=O.Event(t);
B.preventDefault();B.stopPropagation();O.event.trigger(B,c,this[0]);return B.result
}},toggle:function(t){for(var c=arguments,B=1;B<c.length;){O.proxy(t,c[B++])}return this.click(O.proxy(t,function(P){var E=(O.data(this,"lastToggle"+t.guid)||0)%B;
O.data(this,"lastToggle"+t.guid,E+1);P.preventDefault();return c[E].apply(this,arguments)||false
}))},hover:function(t,c){return this.mouseenter(t).mouseleave(c||t)}});var aQ={focus:"focusin",blur:"focusout",mouseenter:"mouseover",mouseleave:"mouseout"};
O.each(["live","die"],function(t,c){O.fn[c]=function(X,W,V,U){var S,T=0,P,Y,B=U||this.selector;
U=U?this:O(this.context);if(typeof X==="object"&&!X.preventDefault){for(S in X){U[c](S,W,X[S],B)
}return this}if(O.isFunction(W)){V=W;W=az}for(X=(X||"").split(" ");(S=X[T++])!=null;
){P=ah.exec(S);Y="";if(P){Y=P[0];S=S.replace(ah,"")}if(S==="hover"){X.push("mouseenter"+Y,"mouseleave"+Y)
}else{P=S;if(S==="focus"||S==="blur"){X.push(aQ[S]+Y);S+=Y}else{S=(aQ[S]||S)+Y}if(c==="live"){Y=0;
for(var E=U.length;Y<E;Y++){O.event.add(U[Y],"live."+ag(S,B),{data:W,selector:B,handler:V,origType:S,origHandler:V,preType:P})
}}else{U.unbind("live."+ag(S,B),V)}}}return this}});O.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error".split(" "),function(t,c){O.fn[c]=function(E,B){if(B==null){B=E;
E=null}return arguments.length>0?this.bind(c,E,B):this.trigger(c)};if(O.attrFn){O.attrFn[c]=true
}});av.attachEvent&&!av.addEventListener&&O(av).bind("unload",function(){for(var t in O.cache){if(O.cache[t].handle){try{O.event.remove(O.cache[t].handle.elem)
}catch(c){}}}});(function(){function ab(a9,a8,a6,a7,a5,a4){a5=0;for(var bb=a7.length;
a5<bb;a5++){var ba=a7[a5];if(ba){var bc=false;for(ba=ba[a9];ba;){if(ba.sizcache===a6){bc=a7[ba.sizset];
break}if(ba.nodeType===1&&!a4){ba.sizcache=a6;ba.sizset=a5}if(ba.nodeName.toLowerCase()===a8){bc=ba;
break}ba=ba[a9]}a7[a5]=bc}}}function Y(a9,a8,a6,a7,a5,a4){a5=0;for(var bb=a7.length;
a5<bb;a5++){var ba=a7[a5];if(ba){var bc=false;for(ba=ba[a9];ba;){if(ba.sizcache===a6){bc=a7[ba.sizset];
break}if(ba.nodeType===1){if(!a4){ba.sizcache=a6;ba.sizset=a5}if(typeof a8!=="string"){if(ba===a8){bc=true;
break}}else{if(S.filter(a8,[ba]).length>0){bc=ba;break}}}ba=ba[a9]}a7[a5]=bc}}}var W=/((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,V=0,U=Object.prototype.toString,T=false,P=true;
[0,0].sort(function(){P=false;return 0});var S=function(bb,ba,a7,a8){a7=a7||[];var a6=ba=ba||G;
if(ba.nodeType!==1&&ba.nodeType!==9){return[]}if(!bb||typeof bb!=="string"){return a7
}var a5,bg,bf,bh,be,bd=true,bc=S.isXML(ba),a4=[],a9=bb;do{W.exec("");if(a5=W.exec(a9)){a9=a5[3];
a4.push(a5[1]);if(a5[2]){bh=a5[3];break}}}while(a5);if(a4.length>1&&aa.exec(bb)){if(a4.length===2&&E.relative[a4[0]]){bg=X(a4[0]+a4[1],ba)
}else{for(bg=E.relative[a4[0]]?[ba]:S(a4.shift(),ba);a4.length;){bb=a4.shift();if(E.relative[bb]){bb+=a4.shift()
}bg=X(bb,bg)}}}else{if(!a8&&a4.length>1&&ba.nodeType===9&&!bc&&E.match.ID.test(a4[0])&&!E.match.ID.test(a4[a4.length-1])){a5=S.find(a4.shift(),ba,bc);
ba=a5.expr?S.filter(a5.expr,a5.set)[0]:a5.set[0]}if(ba){a5=a8?{expr:a4.pop(),set:t(a8)}:S.find(a4.pop(),a4.length===1&&(a4[0]==="~"||a4[0]==="+")&&ba.parentNode?ba.parentNode:ba,bc);
bg=a5.expr?S.filter(a5.expr,a5.set):a5.set;if(a4.length>0){bf=t(bg)}else{bd=false
}for(;a4.length;){a5=be=a4.pop();if(E.relative[be]){a5=a4.pop()}else{be=""}if(a5==null){a5=ba
}E.relative[be](bf,a5,bc)}}else{bf=[]}}bf||(bf=bg);bf||S.error(be||bb);if(U.call(bf)==="[object Array]"){if(bd){if(ba&&ba.nodeType===1){for(bb=0;
bf[bb]!=null;bb++){if(bf[bb]&&(bf[bb]===true||bf[bb].nodeType===1&&S.contains(ba,bf[bb]))){a7.push(bg[bb])
}}}else{for(bb=0;bf[bb]!=null;bb++){bf[bb]&&bf[bb].nodeType===1&&a7.push(bg[bb])}}}else{a7.push.apply(a7,bf)
}}else{t(bf,a7)}if(bh){S(bh,a6,a7,a8);S.uniqueSort(a7)}return a7};S.uniqueSort=function(a5){if(a3){T=P;
a5.sort(a3);if(T){for(var a4=1;a4<a5.length;a4++){a5[a4]===a5[a4-1]&&a5.splice(a4--,1)
}}}return a5};S.matches=function(a5,a4){return S(a5,null,null,a4)};S.matchesSelector=function(a5,a4){return S(a4,null,null,[a5]).length>0
};S.find=function(a9,a8,a6){var a7;if(!a9){return[]}for(var a5=0,a4=E.order.length;
a5<a4;a5++){var bb,ba=E.order[a5];if(bb=E.leftMatch[ba].exec(a9)){var bc=bb[1];bb.splice(1,1);
if(bc.substr(bc.length-1)!=="\\"){bb[1]=(bb[1]||"").replace(/\\/g,"");a7=E.find[ba](bb,a8,a6);
if(a7!=null){a9=a9.replace(E.match[ba],"");break}}}}a7||(a7=a8.getElementsByTagName("*"));
return{set:a7,expr:a9}};S.filter=function(bc,bb,a7,a8){for(var a6,a5,bh=bc,bg=[],bi=bb,bf=bb&&bb[0]&&S.isXML(bb[0]);
bc&&bb.length;){for(var be in E.filter){if((a6=E.leftMatch[be].exec(bc))!=null&&a6[2]){var bd,a4,ba=E.filter[be];
a4=a6[1];a5=false;a6.splice(1,1);if(a4.substr(a4.length-1)!=="\\"){if(bi===bg){bg=[]
}if(E.preFilter[be]){if(a6=E.preFilter[be](a6,bi,a7,bg,a8,bf)){if(a6===true){continue
}}else{a5=bd=true}}if(a6){for(var a9=0;(a4=bi[a9])!=null;a9++){if(a4){bd=ba(a4,a6,a9,bi);
var bj=a8^!!bd;if(a7&&bd!=null){if(bj){a5=true}else{bi[a9]=false}}else{if(bj){bg.push(a4);
a5=true}}}}}if(bd!==az){a7||(bi=bg);bc=bc.replace(E.match[be],"");if(!a5){return[]
}break}}}}if(bc===bh){if(a5==null){S.error(bc)}else{break}}bh=bc}return bi};S.error=function(a4){throw"Syntax error, unrecognized expression: "+a4
};var E=S.selectors={order:["ID","NAME","TAG"],match:{ID:/#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,CLASS:/\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,NAME:/\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,ATTR:/\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/,TAG:/^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,CHILD:/:(only|nth|last|first)-child(?:\((even|odd|[\dn+\-]*)\))?/,POS:/:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,PSEUDO:/:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/},leftMatch:{},attrMap:{"class":"className","for":"htmlFor"},attrHandle:{href:function(a4){return a4.getAttribute("href")
}},relative:{"+":function(a6,a5){var a9=typeof a5==="string",a4=a9&&!/\W/.test(a5);
a9=a9&&!a4;if(a4){a5=a5.toLowerCase()}a4=0;for(var a8=a6.length,a7;a4<a8;a4++){if(a7=a6[a4]){for(;
(a7=a7.previousSibling)&&a7.nodeType!==1;){}a6[a4]=a9||a7&&a7.nodeName.toLowerCase()===a5?a7||false:a7===a5
}}a9&&S.filter(a5,a6,true)},">":function(a6,a5){var a9,a4=typeof a5==="string",a8=0,a7=a6.length;
if(a4&&!/\W/.test(a5)){for(a5=a5.toLowerCase();a8<a7;a8++){if(a9=a6[a8]){a9=a9.parentNode;
a6[a8]=a9.nodeName.toLowerCase()===a5?a9:false}}}else{for(;a8<a7;a8++){if(a9=a6[a8]){a6[a8]=a4?a9.parentNode:a9.parentNode===a5
}}a4&&S.filter(a5,a6,true)}},"":function(a6,a5,a9){var a4,a8=V++,a7=Y;if(typeof a5==="string"&&!/\W/.test(a5)){a4=a5=a5.toLowerCase();
a7=ab}a7("parentNode",a5,a8,a6,a4,a9)},"~":function(a6,a5,a9){var a4,a8=V++,a7=Y;
if(typeof a5==="string"&&!/\W/.test(a5)){a4=a5=a5.toLowerCase();a7=ab}a7("previousSibling",a5,a8,a6,a4,a9)
}},find:{ID:function(a5,a4,a6){if(typeof a4.getElementById!=="undefined"&&!a6){return(a5=a4.getElementById(a5[1]))&&a5.parentNode?[a5]:[]
}},NAME:function(a6,a5){if(typeof a5.getElementsByName!=="undefined"){for(var a9=[],a4=a5.getElementsByName(a6[1]),a8=0,a7=a4.length;
a8<a7;a8++){a4[a8].getAttribute("name")===a6[1]&&a9.push(a4[a8])}return a9.length===0?null:a9
}},TAG:function(a5,a4){return a4.getElementsByTagName(a5[1])}},preFilter:{CLASS:function(a7,a6,ba,a4,a9,a8){a7=" "+a7[1].replace(/\\/g,"")+" ";
if(a8){return a7}a8=0;for(var a5;(a5=a6[a8])!=null;a8++){if(a5){if(a9^(a5.className&&(" "+a5.className+" ").replace(/[\t\n]/g," ").indexOf(a7)>=0)){ba||a4.push(a5)
}else{if(ba){a6[a8]=false}}}}return false},ID:function(a4){return a4[1].replace(/\\/g,"")
},TAG:function(a4){return a4[1].toLowerCase()},CHILD:function(a5){if(a5[1]==="nth"){var a4=/(-?)(\d*)n((?:\+|-)?\d*)/.exec(a5[2]==="even"&&"2n"||a5[2]==="odd"&&"2n+1"||!/\D/.test(a5[2])&&"0n+"+a5[2]||a5[2]);
a5[2]=a4[1]+(a4[2]||1)-0;a5[3]=a4[3]-0}a5[0]=V++;return a5},ATTR:function(a6,a5,a9,a4,a8,a7){a5=a6[1].replace(/\\/g,"");
if(!a7&&E.attrMap[a5]){a6[1]=E.attrMap[a5]}if(a6[2]==="~="){a6[4]=" "+a6[4]+" "}return a6
},PSEUDO:function(a6,a5,a8,a4,a7){if(a6[1]==="not"){if((W.exec(a6[3])||"").length>1||/^\w/.test(a6[3])){a6[3]=S(a6[3],null,null,a5)
}else{a6=S.filter(a6[3],a5,a8,true^a7);a8||a4.push.apply(a4,a6);return false}}else{if(E.match.POS.test(a6[0])||E.match.CHILD.test(a6[0])){return true
}}return a6},POS:function(a4){a4.unshift(true);return a4}},filters:{enabled:function(a4){return a4.disabled===false&&a4.type!=="hidden"
},disabled:function(a4){return a4.disabled===true},checked:function(a4){return a4.checked===true
},selected:function(a4){return a4.selected===true},parent:function(a4){return !!a4.firstChild
},empty:function(a4){return !a4.firstChild},has:function(a5,a4,a6){return !!S(a6[3],a5).length
},header:function(a4){return/h\d/i.test(a4.nodeName)},text:function(a4){return"text"===a4.type
},radio:function(a4){return"radio"===a4.type},checkbox:function(a4){return"checkbox"===a4.type
},file:function(a4){return"file"===a4.type},password:function(a4){return"password"===a4.type
},submit:function(a4){return"submit"===a4.type},image:function(a4){return"image"===a4.type
},reset:function(a4){return"reset"===a4.type},button:function(a4){return"button"===a4.type||a4.nodeName.toLowerCase()==="button"
},input:function(a4){return/input|select|textarea|button/i.test(a4.nodeName)}},setFilters:{first:function(a5,a4){return a4===0
},last:function(a6,a5,a7,a4){return a5===a4.length-1},even:function(a5,a4){return a4%2===0
},odd:function(a5,a4){return a4%2===1},lt:function(a5,a4,a6){return a4<a6[3]-0},gt:function(a5,a4,a6){return a4>a6[3]-0
},nth:function(a5,a4,a6){return a6[3]-0===a4},eq:function(a5,a4,a6){return a6[3]-0===a4
}},filter:{PSEUDO:function(a6,a5,a9,a4){var a8=a5[1],a7=E.filters[a8];if(a7){return a7(a6,a9,a5,a4)
}else{if(a8==="contains"){return(a6.textContent||a6.innerText||S.getText([a6])||"").indexOf(a5[3])>=0
}else{if(a8==="not"){a5=a5[3];a9=0;for(a4=a5.length;a9<a4;a9++){if(a5[a9]===a6){return false
}}return true}else{S.error("Syntax error, unrecognized expression: "+a8)}}}},CHILD:function(a7,a6){var bb=a6[1],a4=a7;
switch(bb){case"only":case"first":for(;a4=a4.previousSibling;){if(a4.nodeType===1){return false
}}if(bb==="first"){return true}a4=a7;case"last":for(;a4=a4.nextSibling;){if(a4.nodeType===1){return false
}}return true;case"nth":bb=a6[2];var a9=a6[3];if(bb===1&&a9===0){return true}var a8=a6[0],a5=a7.parentNode;
if(a5&&(a5.sizcache!==a8||!a7.nodeIndex)){var ba=0;for(a4=a5.firstChild;a4;a4=a4.nextSibling){if(a4.nodeType===1){a4.nodeIndex=++ba
}}a5.sizcache=a8}a4=a7.nodeIndex-a9;return bb===0?a4===0:a4%bb===0&&a4/bb>=0}},ID:function(a5,a4){return a5.nodeType===1&&a5.getAttribute("id")===a4
},TAG:function(a5,a4){return a4==="*"&&a5.nodeType===1||a5.nodeName.toLowerCase()===a4
},CLASS:function(a5,a4){return(" "+(a5.className||a5.getAttribute("class"))+" ").indexOf(a4)>-1
},ATTR:function(a6,a5){var a9=a5[1];a9=E.attrHandle[a9]?E.attrHandle[a9](a6):a6[a9]!=null?a6[a9]:a6.getAttribute(a9);
var a4=a9+"",a8=a5[2],a7=a5[4];return a9==null?a8==="!=":a8==="="?a4===a7:a8==="*="?a4.indexOf(a7)>=0:a8==="~="?(" "+a4+" ").indexOf(a7)>=0:!a7?a4&&a9!==false:a8==="!="?a4!==a7:a8==="^="?a4.indexOf(a7)===0:a8==="$="?a4.substr(a4.length-a7.length)===a7:a8==="|="?a4===a7||a4.substr(0,a7.length+1)===a7+"-":false
},POS:function(a6,a5,a8,a4){var a7=E.setFilters[a5[2]];if(a7){return a7(a6,a8,a5,a4)
}}}},aa=E.match.POS,c=function(a5,a4){return"\\"+(a4-0+1)},B;for(B in E.match){E.match[B]=RegExp(E.match[B].source+/(?![^\[]*\])(?![^\(]*\))/.source);
E.leftMatch[B]=RegExp(/(^(?:.|\r|\n)*?)/.source+E.match[B].source.replace(/\\(\d+)/g,c))
}var t=function(a5,a4){a5=Array.prototype.slice.call(a5,0);if(a4){a4.push.apply(a4,a5);
return a4}return a5};try{Array.prototype.slice.call(G.documentElement.childNodes,0)
}catch(Z){t=function(a6,a5){var a8=0,a4=a5||[];if(U.call(a6)==="[object Array]"){Array.prototype.push.apply(a4,a6)
}else{if(typeof a6.length==="number"){for(var a7=a6.length;a8<a7;a8++){a4.push(a6[a8])
}}else{for(;a6[a8];a8++){a4.push(a6[a8])}}}return a4}}var a3,a2;if(G.documentElement.compareDocumentPosition){a3=function(a5,a4){if(a5===a4){T=true;
return 0}if(!a5.compareDocumentPosition||!a4.compareDocumentPosition){return a5.compareDocumentPosition?-1:1
}return a5.compareDocumentPosition(a4)&4?-1:1}}else{a3=function(a7,a6){var ba,a4,a9=[],a8=[];
ba=a7.parentNode;a4=a6.parentNode;var a5=ba;if(a7===a6){T=true;return 0}else{if(ba===a4){return a2(a7,a6)
}else{if(ba){if(!a4){return 1}}else{return -1}}}for(;a5;){a9.unshift(a5);a5=a5.parentNode
}for(a5=a4;a5;){a8.unshift(a5);a5=a5.parentNode}ba=a9.length;a4=a8.length;for(a5=0;
a5<ba&&a5<a4;a5++){if(a9[a5]!==a8[a5]){return a2(a9[a5],a8[a5])}}return a5===ba?a2(a7,a8[a5],-1):a2(a9[a5],a6,1)
};a2=function(a5,a4,a6){if(a5===a4){return a6}for(a5=a5.nextSibling;a5;){if(a5===a4){return -1
}a5=a5.nextSibling}return 1}}S.getText=function(a6){for(var a5="",a7,a4=0;a6[a4];
a4++){a7=a6[a4];if(a7.nodeType===3||a7.nodeType===4){a5+=a7.nodeValue}else{if(a7.nodeType!==8){a5+=S.getText(a7.childNodes)
}}}return a5};(function(){var a5=G.createElement("div"),a4="script"+(new Date).getTime(),a6=G.documentElement;
a5.innerHTML="<a name='"+a4+"'/>";a6.insertBefore(a5,a6.firstChild);if(G.getElementById(a4)){E.find.ID=function(a7,a9,a8){if(typeof a9.getElementById!=="undefined"&&!a8){return(a9=a9.getElementById(a7[1]))?a9.id===a7[1]||typeof a9.getAttributeNode!=="undefined"&&a9.getAttributeNode("id").nodeValue===a7[1]?[a9]:az:[]
}};E.filter.ID=function(a7,a9){var a8=typeof a7.getAttributeNode!=="undefined"&&a7.getAttributeNode("id");
return a7.nodeType===1&&a8&&a8.nodeValue===a9}}a6.removeChild(a5);a6=a5=null})();
(function(){var a4=G.createElement("div");a4.appendChild(G.createComment(""));if(a4.getElementsByTagName("*").length>0){E.find.TAG=function(a6,a9){var a5=a9.getElementsByTagName(a6[1]);
if(a6[1]==="*"){for(var a8=[],a7=0;a5[a7];a7++){a5[a7].nodeType===1&&a8.push(a5[a7])
}a5=a8}return a5}}a4.innerHTML="<a href='#'></a>";if(a4.firstChild&&typeof a4.firstChild.getAttribute!=="undefined"&&a4.firstChild.getAttribute("href")!=="#"){E.attrHandle.href=function(a5){return a5.getAttribute("href",2)
}}a4=null})();G.querySelectorAll&&function(){var a5=S,a4=G.createElement("div");a4.innerHTML="<p class='TEST'></p>";
if(!(a4.querySelectorAll&&a4.querySelectorAll(".TEST").length===0)){S=function(a7,bb,ba,a8){bb=bb||G;
a7=a7.replace(/\=\s*([^'"\]]*)\s*\]/g,"='$1']");if(!a8&&!S.isXML(bb)){if(bb.nodeType===9){try{return t(bb.querySelectorAll(a7),ba)
}catch(be){}}else{if(bb.nodeType===1&&bb.nodeName.toLowerCase()!=="object"){var a9=bb.getAttribute("id"),bd=a9||"__sizzle__";
a9||bb.setAttribute("id",bd);try{return t(bb.querySelectorAll("#"+bd+" "+a7),ba)}catch(bc){}finally{a9||bb.removeAttribute("id")
}}}}return a5(a7,bb,ba,a8)};for(var a6 in a5){S[a6]=a5[a6]}a4=null}}();(function(){var a6=G.documentElement,a5=a6.matchesSelector||a6.mozMatchesSelector||a6.webkitMatchesSelector||a6.msMatchesSelector,a7=false;
try{a5.call(G.documentElement,"[test!='']:sizzle")}catch(a4){a7=true}if(a5){S.matchesSelector=function(ba,a9){a9=a9.replace(/\=\s*([^'"\]]*)\s*\]/g,"='$1']");
if(!S.isXML(ba)){try{if(a7||!E.match.PSEUDO.test(a9)&&!/!=/.test(a9)){return a5.call(ba,a9)
}}catch(a8){}}return S(a9,null,null,[ba]).length>0}}})();(function(){var a4=G.createElement("div");
a4.innerHTML="<div class='test e'></div><div class='test'></div>";if(!(!a4.getElementsByClassName||a4.getElementsByClassName("e").length===0)){a4.lastChild.className="e";
if(a4.getElementsByClassName("e").length!==1){E.order.splice(1,0,"CLASS");E.find.CLASS=function(a6,a7,a5){if(typeof a7.getElementsByClassName!=="undefined"&&!a5){return a7.getElementsByClassName(a6[1])
}};a4=null}}})();S.contains=G.documentElement.contains?function(a5,a4){return a5!==a4&&(a5.contains?a5.contains(a4):true)
}:G.documentElement.compareDocumentPosition?function(a5,a4){return !!(a5.compareDocumentPosition(a4)&16)
}:function(){return false};S.isXML=function(a4){return(a4=(a4?a4.ownerDocument||a4:0).documentElement)?a4.nodeName!=="HTML":false
};var X=function(a7,a6){for(var ba,a4=[],a9="",a8=a6.nodeType?[a6]:a6;ba=E.match.PSEUDO.exec(a7);
){a9+=ba[0];a7=a7.replace(E.match.PSEUDO,"")}a7=E.relative[a7]?a7+"*":a7;ba=0;for(var a5=a8.length;
ba<a5;ba++){S(a7,a8[ba],a4)}return S.filter(a9,a4)};O.find=S;O.expr=S.selectors;O.expr[":"]=O.expr.filters;
O.unique=S.uniqueSort;O.text=S.getText;O.isXMLDoc=S.isXML;O.contains=S.contains})();
var aS=/Until$/,ay=/^(?:parents|prevUntil|prevAll)/,aF=/,/,aP=/^.[^:#\[\.,]*$/,an=Array.prototype.slice,H=O.expr.match.POS;
O.fn.extend({find:function(B){for(var c=this.pushStack("","find",B),T=0,S=0,P=this.length;
S<P;S++){T=c.length;O.find(B,this[S],c);if(S>0){for(var E=T;E<c.length;E++){for(var t=0;
t<T;t++){if(c[t]===c[E]){c.splice(E--,1);break}}}}}return c},has:function(t){var c=O(t);
return this.filter(function(){for(var E=0,B=c.length;E<B;E++){if(O.contains(this,c[E])){return true
}}})},not:function(c){return this.pushStack(aK(this,c,false),"not",c)},filter:function(c){return this.pushStack(aK(this,c,true),"filter",c)
},is:function(c){return !!c&&O.filter(c,this).length>0},closest:function(V,U){var T=[],S,P,E=this[0];
if(O.isArray(V)){var t,B={},c=1;if(E&&V.length){S=0;for(P=V.length;S<P;S++){t=V[S];
B[t]||(B[t]=O.expr.match.POS.test(t)?O(t,U||this.context):t)}for(;E&&E.ownerDocument&&E!==U;
){for(t in B){S=B[t];if(S.jquery?S.index(E)>-1:O(E).is(S)){T.push({selector:t,elem:E,level:c})
}}E=E.parentNode;c++}}return T}t=H.test(V)?O(V,U||this.context):null;S=0;for(P=this.length;
S<P;S++){for(E=this[S];E;){if(t?t.index(E)>-1:O.find.matchesSelector(E,V)){T.push(E);
break}else{E=E.parentNode;if(!E||!E.ownerDocument||E===U){break}}}}T=T.length>1?O.unique(T):T;
return this.pushStack(T,"closest",V)},index:function(c){if(!c||typeof c==="string"){return O.inArray(this[0],c?O(c):this.parent().children())
}return O.inArray(c.jquery?c[0]:c,this)},add:function(t,c){var E=typeof t==="string"?O(t,c||this.context):O.makeArray(t),B=O.merge(this.get(),E);
return this.pushStack(!E[0]||!E[0].parentNode||E[0].parentNode.nodeType===11||!B[0]||!B[0].parentNode||B[0].parentNode.nodeType===11?B:O.unique(B))
},andSelf:function(){return this.add(this.prevObject)}});O.each({parent:function(c){return(c=c.parentNode)&&c.nodeType!==11?c:null
},parents:function(c){return O.dir(c,"parentNode")},parentsUntil:function(t,c,B){return O.dir(t,"parentNode",B)
},next:function(c){return O.nth(c,2,"nextSibling")},prev:function(c){return O.nth(c,2,"previousSibling")
},nextAll:function(c){return O.dir(c,"nextSibling")},prevAll:function(c){return O.dir(c,"previousSibling")
},nextUntil:function(t,c,B){return O.dir(t,"nextSibling",B)},prevUntil:function(t,c,B){return O.dir(t,"previousSibling",B)
},siblings:function(c){return O.sibling(c.parentNode.firstChild,c)},children:function(c){return O.sibling(c.firstChild)
},contents:function(c){return O.nodeName(c,"iframe")?c.contentDocument||c.contentWindow.document:O.makeArray(c.childNodes)
}},function(t,c){O.fn[t]=function(P,E){var B=O.map(this,c,P);aS.test(t)||(E=P);if(E&&typeof E==="string"){B=O.filter(E,B)
}B=this.length>1?O.unique(B):B;if((this.length>1||aF.test(E))&&ay.test(t)){B=B.reverse()
}return this.pushStack(B,t,an.call(arguments).join(","))}});O.extend({filter:function(t,c,B){if(B){t=":not("+t+")"
}return c.length===1?O.find.matchesSelector(c[0],t)?[c[0]]:[]:O.find.matches(t,c)
},dir:function(t,c,E){var B=[];for(t=t[c];t&&t.nodeType!==9&&(E===az||t.nodeType!==1||!O(t).is(E));
){t.nodeType===1&&B.push(t);t=t[c]}return B},nth:function(t,c,E){c=c||1;for(var B=0;
t;t=t[E]){if(t.nodeType===1&&++B===c){break}}return t},sibling:function(t,c){for(var B=[];
t;t=t.nextSibling){t.nodeType===1&&t!==c&&B.push(t)}return B}});var aD=/ jQuery\d+="(?:\d+|null)"/g,aM=/^\s+/,aV=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,aI=/<([\w:]+)/,r=/<tbody/i,f=/<|&#?\w+;/,at=/<(?:script|object|embed|option|style)/i,L=/checked\s*(?:[^=]|=\s*.checked.)/i,aT=/\=([^="'>\s]+\/)>/g,ao={option:[1,"<select multiple='multiple'>","</select>"],legend:[1,"<fieldset>","</fieldset>"],thead:[1,"<table>","</table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],col:[2,"<table><tbody></tbody><colgroup>","</colgroup></table>"],area:[1,"<map>","</map>"],_default:[0,"",""]};
ao.optgroup=ao.option;ao.tbody=ao.tfoot=ao.colgroup=ao.caption=ao.thead;ao.th=ao.td;
if(!O.support.htmlSerialize){ao._default=[1,"div<div>","</div>"]}O.fn.extend({text:function(c){if(O.isFunction(c)){return this.each(function(t){var B=O(this);
B.text(c.call(this,t,B.text()))})}if(typeof c!=="object"&&c!==az){return this.empty().append((this[0]&&this[0].ownerDocument||G).createTextNode(c))
}return O.text(this)},wrapAll:function(t){if(O.isFunction(t)){return this.each(function(B){O(this).wrapAll(t.call(this,B))
})}if(this[0]){var c=O(t,this[0].ownerDocument).eq(0).clone(true);this[0].parentNode&&c.insertBefore(this[0]);
c.map(function(){for(var B=this;B.firstChild&&B.firstChild.nodeType===1;){B=B.firstChild
}return B}).append(this)}return this},wrapInner:function(c){if(O.isFunction(c)){return this.each(function(t){O(this).wrapInner(c.call(this,t))
})}return this.each(function(){var t=O(this),B=t.contents();B.length?B.wrapAll(c):t.append(c)
})},wrap:function(c){return this.each(function(){O(this).wrapAll(c)})},unwrap:function(){return this.parent().each(function(){O.nodeName(this,"body")||O(this).replaceWith(this.childNodes)
}).end()},append:function(){return this.domManip(arguments,true,function(c){this.nodeType===1&&this.appendChild(c)
})},prepend:function(){return this.domManip(arguments,true,function(c){this.nodeType===1&&this.insertBefore(c,this.firstChild)
})},before:function(){if(this[0]&&this[0].parentNode){return this.domManip(arguments,false,function(t){this.parentNode.insertBefore(t,this)
})}else{if(arguments.length){var c=O(arguments[0]);c.push.apply(c,this.toArray());
return this.pushStack(c,"before",arguments)}}},after:function(){if(this[0]&&this[0].parentNode){return this.domManip(arguments,false,function(t){this.parentNode.insertBefore(t,this.nextSibling)
})}else{if(arguments.length){var c=this.pushStack(this,"after",arguments);c.push.apply(c,O(arguments[0]).toArray());
return c}}},remove:function(t,c){for(var E=0,B;(B=this[E])!=null;E++){if(!t||O.filter(t,[B]).length){if(!c&&B.nodeType===1){O.cleanData(B.getElementsByTagName("*"));
O.cleanData([B])}B.parentNode&&B.parentNode.removeChild(B)}}return this},empty:function(){for(var t=0,c;
(c=this[t])!=null;t++){for(c.nodeType===1&&O.cleanData(c.getElementsByTagName("*"));
c.firstChild;){c.removeChild(c.firstChild)}}return this},clone:function(t){var c=this.map(function(){if(!O.support.noCloneEvent&&!O.isXMLDoc(this)){var E=this.outerHTML,B=this.ownerDocument;
if(!E){E=B.createElement("div");E.appendChild(this.cloneNode(true));E=E.innerHTML
}return O.clean([E.replace(aD,"").replace(aT,'="$1">').replace(aM,"")],B)[0]}else{return this.cloneNode(true)
}});if(t===true){aw(this,c);aw(this.find("*"),c.find("*"))}return c},html:function(t){if(t===az){return this[0]&&this[0].nodeType===1?this[0].innerHTML.replace(aD,""):null
}else{if(typeof t==="string"&&!at.test(t)&&(O.support.leadingWhitespace||!aM.test(t))&&!ao[(aI.exec(t)||["",""])[1].toLowerCase()]){t=t.replace(aV,"<$1></$2>");
try{for(var c=0,E=this.length;c<E;c++){if(this[c].nodeType===1){O.cleanData(this[c].getElementsByTagName("*"));
this[c].innerHTML=t}}}catch(B){this.empty().append(t)}}else{O.isFunction(t)?this.each(function(S){var P=O(this);
P.html(t.call(this,S,P.html()))}):this.empty().append(t)}}return this},replaceWith:function(c){if(this[0]&&this[0].parentNode){if(O.isFunction(c)){return this.each(function(t){var E=O(this),B=E.html();
E.replaceWith(c.call(this,t,B))})}if(typeof c!=="string"){c=O(c).detach()}return this.each(function(){var t=this.nextSibling,B=this.parentNode;
O(this).remove();t?O(t).before(c):O(B).append(c)})}else{return this.pushStack(O(O.isFunction(c)?c():c),"replaceWith",c)
}},detach:function(c){return this.remove(c,true)},domManip:function(V,U,T){var S,P,E,t=V[0],B=[];
if(!O.support.checkClone&&arguments.length===3&&typeof t==="string"&&L.test(t)){return this.each(function(){O(this).domManip(V,U,T,true)
})}if(O.isFunction(t)){return this.each(function(W){var X=O(this);V[0]=t.call(this,W,U?X.html():az);
X.domManip(V,U,T)})}if(this[0]){S=t&&t.parentNode;S=O.support.parentNode&&S&&S.nodeType===11&&S.childNodes.length===this.length?{fragment:S}:O.buildFragment(V,this,B);
E=S.fragment;if(P=E.childNodes.length===1?E=E.firstChild:E.firstChild){U=U&&O.nodeName(P,"tr");
P=0;for(var c=this.length;P<c;P++){T.call(U?O.nodeName(this[P],"table")?this[P].getElementsByTagName("tbody")[0]||this[P].appendChild(this[P].ownerDocument.createElement("tbody")):this[P]:this[P],P>0||S.cacheable||this.length>1?E.cloneNode(true):E)
}}B.length&&O.each(B,aC)}return this}});O.buildFragment=function(t,c,S){var P,E,B;
c=c&&c[0]?c[0].ownerDocument||c[0]:G;if(t.length===1&&typeof t[0]==="string"&&t[0].length<512&&c===G&&!at.test(t[0])&&(O.support.checkClone||!L.test(t[0]))){E=true;
if(B=O.fragments[t[0]]){if(B!==1){P=B}}}if(!P){P=c.createDocumentFragment();O.clean(t,c,P,S)
}if(E){O.fragments[t[0]]=B?P:1}return{fragment:P,cacheable:E}};O.fragments={};O.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(t,c){O.fn[t]=function(T){var S=[];
T=O(T);var P=this.length===1&&this[0].parentNode;if(P&&P.nodeType===11&&P.childNodes.length===1&&T.length===1){T[c](this[0]);
return this}else{P=0;for(var E=T.length;P<E;P++){var B=(P>0?this.clone(true):this).get();
O(T[P])[c](B);S=S.concat(B)}return this.pushStack(S,t,T.selector)}}});O.extend({clean:function(X,V,U,T){V=V||G;
if(typeof V.createElement==="undefined"){V=V.ownerDocument||V[0]&&V[0].ownerDocument||G
}for(var S=[],P=0,B;(B=X[P])!=null;P++){if(typeof B==="number"){B+=""}if(B){if(typeof B==="string"&&!f.test(B)){B=V.createTextNode(B)
}else{if(typeof B==="string"){B=B.replace(aV,"<$1></$2>");var E=(aI.exec(B)||["",""])[1].toLowerCase(),t=ao[E]||ao._default,W=t[0],c=V.createElement("div");
for(c.innerHTML=t[1]+B+t[2];W--;){c=c.lastChild}if(!O.support.tbody){W=r.test(B);
E=E==="table"&&!W?c.firstChild&&c.firstChild.childNodes:t[1]==="<table>"&&!W?c.childNodes:[];
for(t=E.length-1;t>=0;--t){O.nodeName(E[t],"tbody")&&!E[t].childNodes.length&&E[t].parentNode.removeChild(E[t])
}}!O.support.leadingWhitespace&&aM.test(B)&&c.insertBefore(V.createTextNode(aM.exec(B)[0]),c.firstChild);
B=c.childNodes}}if(B.nodeType){S.push(B)}else{S=O.merge(S,B)}}}if(U){for(P=0;S[P];
P++){if(T&&O.nodeName(S[P],"script")&&(!S[P].type||S[P].type.toLowerCase()==="text/javascript")){T.push(S[P].parentNode?S[P].parentNode.removeChild(S[P]):S[P])
}else{S[P].nodeType===1&&S.splice.apply(S,[P+1,0].concat(O.makeArray(S[P].getElementsByTagName("script"))));
U.appendChild(S[P])}}}return S},cleanData:function(V){for(var U,T,S=O.cache,P=O.event.special,E=O.support.deleteExpando,t=0,B;
(B=V[t])!=null;t++){if(!(B.nodeName&&O.noData[B.nodeName.toLowerCase()])){if(T=B[O.expando]){if((U=S[T])&&U.events){for(var c in U.events){P[c]?O.event.remove(B,c):O.removeEvent(B,c,U.handle)
}}if(E){delete B[O.expando]}else{B.removeAttribute&&B.removeAttribute(O.expando)}delete S[T]
}}}}});var w=/alpha\([^)]*\)/i,aH=/opacity=([^)]*)/,aq=/-([a-z])/ig,J=/([A-Z])/g,j=/^-?\d+(?:px)?$/i,u=/^-?\d/,h={position:"absolute",visibility:"hidden",display:"block"},ad=["Left","Right"],D=["Top","Bottom"],ai,aY,aG,aW=function(t,c){return c.toUpperCase()
};O.fn.css=function(t,c){if(arguments.length===2&&c===az){return this}return O.access(this,t,c,true,function(P,E,B){return B!==az?O.style(P,E,B):O.css(P,E)
})};O.extend({cssHooks:{opacity:{get:function(t,c){if(c){var B=ai(t,"opacity","opacity");
return B===""?"1":B}else{return t.style.opacity}}}},cssNumber:{zIndex:true,fontWeight:true,opacity:true,zoom:true,lineHeight:true},cssProps:{"float":O.support.cssFloat?"cssFloat":"styleFloat"},style:function(V,U,T,S){if(!(!V||V.nodeType===3||V.nodeType===8||!V.style)){var P,E=O.camelCase(U),t=V.style,B=O.cssHooks[E];
U=O.cssProps[E]||E;if(T!==az){if(!(typeof T==="number"&&isNaN(T)||T==null)){if(typeof T==="number"&&!O.cssNumber[E]){T+="px"
}if(!B||!("set" in B)||(T=B.set(V,T))!==az){try{t[U]=T}catch(c){}}}}else{if(B&&"get" in B&&(P=B.get(V,false,S))!==az){return P
}return t[U]}}},css:function(t,c,S){var P,E=O.camelCase(c),B=O.cssHooks[E];c=O.cssProps[E]||E;
if(B&&"get" in B&&(P=B.get(t,true,S))!==az){return P}else{if(ai){return ai(t,c,E)
}}},swap:function(t,c,P){var E={},B;for(B in c){E[B]=t.style[B];t.style[B]=c[B]}P.call(t);
for(B in c){t.style[B]=E[B]}},camelCase:function(c){return c.replace(aq,aW)}});O.curCSS=O.css;
O.each(["height","width"],function(t,c){O.cssHooks[c]={get:function(S,P,E){var B;
if(P){if(S.offsetWidth!==0){B=N(S,c,E)}else{O.swap(S,h,function(){B=N(S,c,E)})}if(B<=0){B=ai(S,c,c);
if(B==="0px"&&aG){B=aG(S,c,c)}if(B!=null){return B===""||B==="auto"?"0px":B}}if(B<0||B==null){B=S.style[c];
return B===""||B==="auto"?"0px":B}return typeof B==="string"?B:B+"px"}},set:function(E,B){if(j.test(B)){B=parseFloat(B);
if(B>=0){return B+"px"}}else{return B}}}});if(!O.support.opacity){O.cssHooks.opacity={get:function(t,c){return aH.test((c&&t.currentStyle?t.currentStyle.filter:t.style.filter)||"")?parseFloat(RegExp.$1)/100+"":c?"1":""
},set:function(t,c){var P=t.style;P.zoom=1;var E=O.isNaN(c)?"":"alpha(opacity="+c*100+")",B=P.filter||"";
P.filter=w.test(B)?B.replace(w,E):P.filter+" "+E}}}if(G.defaultView&&G.defaultView.getComputedStyle){aY=function(t,c,E){var B;
E=E.replace(J,"-$1").toLowerCase();if(!(c=t.ownerDocument.defaultView)){return az
}if(c=c.getComputedStyle(t,null)){B=c.getPropertyValue(E);if(B===""&&!O.contains(t.ownerDocument.documentElement,t)){B=O.style(t,E)
}}return B}}if(G.documentElement.currentStyle){aG=function(t,c){var S,P,E=t.currentStyle&&t.currentStyle[c],B=t.style;
if(!j.test(E)&&u.test(E)){S=B.left;P=t.runtimeStyle.left;t.runtimeStyle.left=t.currentStyle.left;
B.left=c==="fontSize"?"1em":E||0;E=B.pixelLeft+"px";B.left=S;t.runtimeStyle.left=P
}return E===""?"auto":E}}ai=aY||aG;if(O.expr&&O.expr.filters){O.expr.filters.hidden=function(t){var c=t.offsetHeight;
return t.offsetWidth===0&&c===0||!O.support.reliableHiddenOffsets&&(t.style.display||O.css(t,"display"))==="none"
};O.expr.filters.visible=function(c){return !O.expr.filters.hidden(c)}}var aJ=O.now(),au=/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,M=/^(?:select|textarea)/i,x=/^(?:color|date|datetime|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i,k=/^(?:GET|HEAD)$/,p=/\[\]$/,al=/\=\?(&|$)/,v=/\?/,aZ=/([?&])_=[^&]*/,aN=/^(\w+:)?\/\/([^\/?#]+)/,aA=/%20/g,R=/#.*$/,aL=O.fn.load;
O.fn.extend({load:function(t,c,S){if(typeof t!=="string"&&aL){return aL.apply(this,arguments)
}else{if(!this.length){return this}}var P=t.indexOf(" ");if(P>=0){var E=t.slice(P,t.length);
t=t.slice(0,P)}P="GET";if(c){if(O.isFunction(c)){S=c;c=null}else{if(typeof c==="object"){c=O.param(c,O.ajaxSettings.traditional);
P="POST"}}}var B=this;O.ajax({url:t,type:P,dataType:"html",data:c,complete:function(T,U){if(U==="success"||U==="notmodified"){B.html(E?O("<div>").append(T.responseText.replace(au,"")).find(E):T.responseText)
}S&&B.each(S,[T.responseText,U,T])}});return this},serialize:function(){return O.param(this.serializeArray())
},serializeArray:function(){return this.map(function(){return this.elements?O.makeArray(this.elements):this
}).filter(function(){return this.name&&!this.disabled&&(this.checked||M.test(this.nodeName)||x.test(this.type))
}).map(function(t,c){var B=O(this).val();return B==null?null:O.isArray(B)?O.map(B,function(E){return{name:c.name,value:E}
}):{name:c.name,value:B}}).get()}});O.each("ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split(" "),function(t,c){O.fn[c]=function(B){return this.bind(c,B)
}});O.extend({get:function(t,c,E,B){if(O.isFunction(c)){B=B||E;E=c;c=null}return O.ajax({type:"GET",url:t,data:c,success:E,dataType:B})
},getScript:function(t,c){return O.get(t,null,c,"script")},getJSON:function(t,c,B){return O.get(t,c,B,"json")
},post:function(t,c,E,B){if(O.isFunction(c)){B=B||E;E=c;c={}}return O.ajax({type:"POST",url:t,data:c,success:E,dataType:B})
},ajaxSetup:function(c){O.extend(O.ajaxSettings,c)},ajaxSettings:{url:location.href,global:true,type:"GET",contentType:"application/x-www-form-urlencoded",processData:true,async:true,xhr:function(){return new av.XMLHttpRequest
},accepts:{xml:"application/xml, text/xml",html:"text/html",script:"text/javascript, application/javascript",json:"application/json, text/javascript",text:"text/plain",_default:"*/*"}},ajax:function(a6){var a5=O.extend(true,{},O.ajaxSettings,a6),a4,a3,a2,aa=a5.type.toUpperCase(),X=k.test(aa);
a5.url=a5.url.replace(R,"");a5.context=a6&&a6.context!=null?a6.context:a5;if(a5.data&&a5.processData&&typeof a5.data!=="string"){a5.data=O.param(a5.data,a5.traditional)
}if(a5.dataType==="jsonp"){if(aa==="GET"){al.test(a5.url)||(a5.url+=(v.test(a5.url)?"&":"?")+(a5.jsonp||"callback")+"=?")
}else{if(!a5.data||!al.test(a5.data)){a5.data=(a5.data?a5.data+"&":"")+(a5.jsonp||"callback")+"=?"
}}a5.dataType="json"}if(a5.dataType==="json"&&(a5.data&&al.test(a5.data)||al.test(a5.url))){a4=a5.jsonpCallback||"jsonp"+aJ++;
if(a5.data){a5.data=(a5.data+"").replace(al,"="+a4+"$1")}a5.url=a5.url.replace(al,"="+a4+"$1");
a5.dataType="script";var Y=av[a4];av[a4]=function(a7){if(O.isFunction(Y)){Y(a7)}else{av[a4]=az;
try{delete av[a4]}catch(a8){}}a2=a7;O.handleSuccess(a5,P,a3,a2);O.handleComplete(a5,P,a3,a2);
T&&T.removeChild(U)}}if(a5.dataType==="script"&&a5.cache===null){a5.cache=false}if(a5.cache===false&&X){var V=O.now(),E=a5.url.replace(aZ,"$1_="+V);
a5.url=E+(E===a5.url?(v.test(a5.url)?"&":"?")+"_="+V:"")}if(a5.data&&X){a5.url+=(v.test(a5.url)?"&":"?")+a5.data
}a5.global&&O.active++===0&&O.event.trigger("ajaxStart");V=(V=aN.exec(a5.url))&&(V[1]&&V[1].toLowerCase()!==location.protocol||V[2].toLowerCase()!==location.host);
if(a5.dataType==="script"&&aa==="GET"&&V){var T=G.getElementsByTagName("head")[0]||G.documentElement,U=G.createElement("script");
if(a5.scriptCharset){U.charset=a5.scriptCharset}U.src=a5.url;if(!a4){var S=false;
U.onload=U.onreadystatechange=function(){if(!S&&(!this.readyState||this.readyState==="loaded"||this.readyState==="complete")){S=true;
O.handleSuccess(a5,P,a3,a2);O.handleComplete(a5,P,a3,a2);U.onload=U.onreadystatechange=null;
T&&U.parentNode&&T.removeChild(U)}}}T.insertBefore(U,T.firstChild);return az}var t=false,P=a5.xhr();
if(P){a5.username?P.open(aa,a5.url,a5.async,a5.username,a5.password):P.open(aa,a5.url,a5.async);
try{if(a5.data!=null&&!X||a6&&a6.contentType){P.setRequestHeader("Content-Type",a5.contentType)
}if(a5.ifModified){O.lastModified[a5.url]&&P.setRequestHeader("If-Modified-Since",O.lastModified[a5.url]);
O.etag[a5.url]&&P.setRequestHeader("If-None-Match",O.etag[a5.url])}V||P.setRequestHeader("X-Requested-With","XMLHttpRequest");
P.setRequestHeader("Accept",a5.dataType&&a5.accepts[a5.dataType]?a5.accepts[a5.dataType]+", */*; q=0.01":a5.accepts._default)
}catch(B){}if(a5.beforeSend&&a5.beforeSend.call(a5.context,P,a5)===false){a5.global&&O.active--===1&&O.event.trigger("ajaxStop");
P.abort();return false}a5.global&&O.triggerGlobal(a5,"ajaxSend",[P,a5]);var c=P.onreadystatechange=function(a7){if(!P||P.readyState===0||a7==="abort"){t||O.handleComplete(a5,P,a3,a2);
t=true;if(P){P.onreadystatechange=O.noop}}else{if(!t&&P&&(P.readyState===4||a7==="timeout")){t=true;
P.onreadystatechange=O.noop;a3=a7==="timeout"?"timeout":!O.httpSuccess(P)?"error":a5.ifModified&&O.httpNotModified(P,a5.url)?"notmodified":"success";
var a9;if(a3==="success"){try{a2=O.httpData(P,a5.dataType,a5)}catch(a8){a3="parsererror";
a9=a8}}if(a3==="success"||a3==="notmodified"){a4||O.handleSuccess(a5,P,a3,a2)}else{O.handleError(a5,P,a3,a9)
}a4||O.handleComplete(a5,P,a3,a2);a7==="timeout"&&P.abort();if(a5.async){P=null}}}};
try{var ab=P.abort;P.abort=function(){P&&Function.prototype.call.call(ab,P);c("abort")
}}catch(Z){}a5.async&&a5.timeout>0&&setTimeout(function(){P&&!t&&c("timeout")},a5.timeout);
try{P.send(X||a5.data==null?null:a5.data)}catch(W){O.handleError(a5,P,null,W);O.handleComplete(a5,P,a3,a2)
}a5.async||c();return P}},param:function(t,c){var P=[],E=function(T,S){S=O.isFunction(S)?S():S;
P[P.length]=encodeURIComponent(T)+"="+encodeURIComponent(S)};if(c===az){c=O.ajaxSettings.traditional
}if(O.isArray(t)||t.jquery){O.each(t,function(){E(this.name,this.value)})}else{for(var B in t){s(B,t[B],c,E)
}}return P.join("&").replace(aA,"+")}});O.extend({active:0,lastModified:{},etag:{},handleError:function(t,c,E,B){t.error&&t.error.call(t.context,c,E,B);
t.global&&O.triggerGlobal(t,"ajaxError",[c,t,B])},handleSuccess:function(t,c,E,B){t.success&&t.success.call(t.context,B,E,c);
t.global&&O.triggerGlobal(t,"ajaxSuccess",[c,t])},handleComplete:function(t,c,B){t.complete&&t.complete.call(t.context,c,B);
t.global&&O.triggerGlobal(t,"ajaxComplete",[c,t]);t.global&&O.active--===1&&O.event.trigger("ajaxStop")
},triggerGlobal:function(t,c,B){(t.context&&t.context.url==null?O(t.context):O.event).trigger(c,B)
},httpSuccess:function(t){try{return !t.status&&location.protocol==="file:"||t.status>=200&&t.status<300||t.status===304||t.status===1223
}catch(c){}return false},httpNotModified:function(t,c){var E=t.getResponseHeader("Last-Modified"),B=t.getResponseHeader("Etag");
if(E){O.lastModified[c]=E}if(B){O.etag[c]=B}return t.status===304},httpData:function(t,c,P){var E=t.getResponseHeader("content-type")||"",B=c==="xml"||!c&&E.indexOf("xml")>=0;
t=B?t.responseXML:t.responseText;B&&t.documentElement.nodeName==="parsererror"&&O.error("parsererror");
if(P&&P.dataFilter){t=P.dataFilter(t,c)}if(typeof t==="string"){if(c==="json"||!c&&E.indexOf("json")>=0){t=O.parseJSON(t)
}else{if(c==="script"||!c&&E.indexOf("javascript")>=0){O.globalEval(t)}}}return t
}});if(av.ActiveXObject){O.ajaxSettings.xhr=function(){if(av.location.protocol!=="file:"){try{return new av.XMLHttpRequest
}catch(t){}}try{return new av.ActiveXObject("Microsoft.XMLHTTP")}catch(c){}}}O.support.ajax=!!O.ajaxSettings.xhr();
var g={},A=/^(?:toggle|show|hide)$/,n=/^([+\-]=)?([\d+.\-]+)(.*)$/,ap,y=[["height","marginTop","marginBottom","paddingTop","paddingBottom"],["width","marginLeft","marginRight","paddingLeft","paddingRight"],["opacity"]];
O.fn.extend({show:function(t,c,E){if(t||t===0){return this.animate(am("show",3),t,c,E)
}else{E=0;for(var B=this.length;E<B;E++){t=this[E];c=t.style.display;if(!O.data(t,"olddisplay")&&c==="none"){c=t.style.display=""
}c===""&&O.css(t,"display")==="none"&&O.data(t,"olddisplay",l(t.nodeName))}for(E=0;
E<B;E++){t=this[E];c=t.style.display;if(c===""||c==="none"){t.style.display=O.data(t,"olddisplay")||""
}}return this}},hide:function(t,c,B){if(t||t===0){return this.animate(am("hide",3),t,c,B)
}else{t=0;for(c=this.length;t<c;t++){B=O.css(this[t],"display");B!=="none"&&O.data(this[t],"olddisplay",B)
}for(t=0;t<c;t++){this[t].style.display="none"}return this}},_toggle:O.fn.toggle,toggle:function(t,c,E){var B=typeof t==="boolean";
if(O.isFunction(t)&&O.isFunction(c)){this._toggle.apply(this,arguments)}else{t==null||B?this.each(function(){var P=B?t:O(this).is(":hidden");
O(this)[P?"show":"hide"]()}):this.animate(am("toggle",3),t,c,E)}return this},fadeTo:function(t,c,E,B){return this.filter(":hidden").css("opacity",0).show().end().animate({opacity:c},t,E,B)
},animate:function(t,c,P,E){var B=O.speed(c,P,E);if(O.isEmptyObject(t)){return this.each(B.complete)
}return this[B.queue===false?"each":"queue"](function(){var V=O.extend({},B),T,U=this.nodeType===1,X=U&&O(this).is(":hidden"),S=this;
for(T in t){var W=O.camelCase(T);if(T!==W){t[W]=t[T];delete t[T];T=W}if(t[T]==="hide"&&X||t[T]==="show"&&!X){return V.complete.call(this)
}if(U&&(T==="height"||T==="width")){V.overflow=[this.style.overflow,this.style.overflowX,this.style.overflowY];
if(O.css(this,"display")==="inline"&&O.css(this,"float")==="none"){if(O.support.inlineBlockNeedsLayout){if(l(this.nodeName)==="inline"){this.style.display="inline-block"
}else{this.style.display="inline";this.style.zoom=1}}else{this.style.display="inline-block"
}}}if(O.isArray(t[T])){(V.specialEasing=V.specialEasing||{})[T]=t[T][1];t[T]=t[T][0]
}}if(V.overflow!=null){this.style.overflow="hidden"}V.curAnim=O.extend({},t);O.each(t,function(Z,a4){var ab=new O.fx(S,V,Z);
if(A.test(a4)){ab[a4==="toggle"?X?"show":"hide":a4](t)}else{var aa=n.exec(a4),a2=ab.cur()||0;
if(aa){var Y=parseFloat(aa[2]),a3=aa[3]||"px";if(a3!=="px"){O.style(S,Z,(Y||1)+a3);
a2=(Y||1)/ab.cur()*a2;O.style(S,Z,a2+a3)}if(aa[1]){Y=(aa[1]==="-="?-1:1)*Y+a2}ab.custom(a2,Y,a3)
}else{ab.custom(a2,a4,"")}}});return true})},stop:function(t,c){var B=O.timers;t&&this.queue([]);
this.each(function(){for(var E=B.length-1;E>=0;E--){if(B[E].elem===this){c&&B[E](true);
B.splice(E,1)}}});c||this.dequeue();return this}});O.each({slideDown:am("show",1),slideUp:am("hide",1),slideToggle:am("toggle",1),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(t,c){O.fn[t]=function(P,E,B){return this.animate(c,P,E,B)
}});O.extend({speed:function(t,c,E){var B=t&&typeof t==="object"?O.extend({},t):{complete:E||!E&&c||O.isFunction(t)&&t,duration:t,easing:E&&c||c&&!O.isFunction(c)&&c};
B.duration=O.fx.off?0:typeof B.duration==="number"?B.duration:B.duration in O.fx.speeds?O.fx.speeds[B.duration]:O.fx.speeds._default;
B.old=B.complete;B.complete=function(){B.queue!==false&&O(this).dequeue();O.isFunction(B.old)&&B.old.call(this)
};return B},easing:{linear:function(t,c,E,B){return E+B*t},swing:function(t,c,E,B){return(-Math.cos(t*Math.PI)/2+0.5)*B+E
}},timers:[],fx:function(t,c,B){this.options=c;this.elem=t;this.prop=B;if(!c.orig){c.orig={}
}}});O.fx.prototype={update:function(){this.options.step&&this.options.step.call(this.elem,this.now,this);
(O.fx.step[this.prop]||O.fx.step._default)(this)},cur:function(){if(this.elem[this.prop]!=null&&(!this.elem.style||this.elem.style[this.prop]==null)){return this.elem[this.prop]
}var c=parseFloat(O.css(this.elem,this.prop));return c&&c>-10000?c:0},custom:function(t,c,S){function P(T){return E.step(T)
}var E=this,B=O.fx;this.startTime=O.now();this.start=t;this.end=c;this.unit=S||this.unit||"px";
this.now=this.start;this.pos=this.state=0;P.elem=this.elem;if(P()&&O.timers.push(P)&&!ap){ap=setInterval(B.tick,B.interval)
}},show:function(){this.options.orig[this.prop]=O.style(this.elem,this.prop);this.options.show=true;
this.custom(this.prop==="width"||this.prop==="height"?1:0,this.cur());O(this.elem).show()
},hide:function(){this.options.orig[this.prop]=O.style(this.elem,this.prop);this.options.hide=true;
this.custom(this.cur(),0)},step:function(B){var c=O.now(),T=true;if(B||c>=this.options.duration+this.startTime){this.now=this.end;
this.pos=this.state=1;this.update();this.options.curAnim[this.prop]=true;for(var S in this.options.curAnim){if(this.options.curAnim[S]!==true){T=false
}}if(T){if(this.options.overflow!=null&&!O.support.shrinkWrapBlocks){var P=this.elem,E=this.options;
O.each(["","X","Y"],function(U,V){P.style["overflow"+V]=E.overflow[U]})}this.options.hide&&O(this.elem).hide();
if(this.options.hide||this.options.show){for(var t in this.options.curAnim){O.style(this.elem,t,this.options.orig[t])
}}this.options.complete.call(this.elem)}return false}else{B=c-this.startTime;this.state=B/this.options.duration;
c=this.options.easing||(O.easing.swing?"swing":"linear");this.pos=O.easing[this.options.specialEasing&&this.options.specialEasing[this.prop]||c](this.state,B,0,1,this.options.duration);
this.now=this.start+(this.end-this.start)*this.pos;this.update()}return true}};O.extend(O.fx,{tick:function(){for(var t=O.timers,c=0;
c<t.length;c++){t[c]()||t.splice(c--,1)}t.length||O.fx.stop()},interval:13,stop:function(){clearInterval(ap);
ap=null},speeds:{slow:600,fast:200,_default:400},step:{opacity:function(c){O.style(c.elem,"opacity",c.now)
},_default:function(c){if(c.elem.style&&c.elem.style[c.prop]!=null){c.elem.style[c.prop]=(c.prop==="width"||c.prop==="height"?Math.max(0,c.now):c.now)+c.unit
}else{c.elem[c.prop]=c.now}}}});if(O.expr&&O.expr.filters){O.expr.filters.animated=function(c){return O.grep(O.timers,function(t){return c===t.elem
}).length}}var a=/^t(?:able|d|h)$/i,ax=/^(?:body|html)$/i;O.fn.offset="getBoundingClientRect" in G.documentElement?function(t){var c=this[0],S;
if(t){return this.each(function(T){O.offset.setOffset(this,t,T)})}if(!c||!c.ownerDocument){return null
}if(c===c.ownerDocument.body){return O.offset.bodyOffset(c)}try{S=c.getBoundingClientRect()
}catch(P){}var E=c.ownerDocument,B=E.documentElement;if(!S||!O.contains(B,c)){return S||{top:0,left:0}
}c=E.body;E=aU(E);return{top:S.top+(E.pageYOffset||O.support.boxModel&&B.scrollTop||c.scrollTop)-(B.clientTop||c.clientTop||0),left:S.left+(E.pageXOffset||O.support.boxModel&&B.scrollLeft||c.scrollLeft)-(B.clientLeft||c.clientLeft||0)}
}:function(V){var U=this[0];if(V){return this.each(function(W){O.offset.setOffset(this,V,W)
})}if(!U||!U.ownerDocument){return null}if(U===U.ownerDocument.body){return O.offset.bodyOffset(U)
}O.offset.initialize();var T,S=U.offsetParent,P=U.ownerDocument,E=P.documentElement,t=P.body;
T=(P=P.defaultView)?P.getComputedStyle(U,null):U.currentStyle;for(var B=U.offsetTop,c=U.offsetLeft;
(U=U.parentNode)&&U!==t&&U!==E;){if(O.offset.supportsFixedPosition&&T.position==="fixed"){break
}T=P?P.getComputedStyle(U,null):U.currentStyle;B-=U.scrollTop;c-=U.scrollLeft;if(U===S){B+=U.offsetTop;
c+=U.offsetLeft;if(O.offset.doesNotAddBorder&&!(O.offset.doesAddBorderForTableAndCells&&a.test(U.nodeName))){B+=parseFloat(T.borderTopWidth)||0;
c+=parseFloat(T.borderLeftWidth)||0}S=U.offsetParent}if(O.offset.subtractsBorderForOverflowNotVisible&&T.overflow!=="visible"){B+=parseFloat(T.borderTopWidth)||0;
c+=parseFloat(T.borderLeftWidth)||0}T=T}if(T.position==="relative"||T.position==="static"){B+=t.offsetTop;
c+=t.offsetLeft}if(O.offset.supportsFixedPosition&&T.position==="fixed"){B+=Math.max(E.scrollTop,t.scrollTop);
c+=Math.max(E.scrollLeft,t.scrollLeft)}return{top:B,left:c}};O.offset={initialize:function(){var t=G.body,c=G.createElement("div"),S,P,E,B=parseFloat(O.css(t,"marginTop"))||0;
O.extend(c.style,{position:"absolute",top:0,left:0,margin:0,border:0,width:"1px",height:"1px",visibility:"hidden"});
c.innerHTML="<div style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;'><div></div></div><table style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;' cellpadding='0' cellspacing='0'><tr><td></td></tr></table>";
t.insertBefore(c,t.firstChild);S=c.firstChild;P=S.firstChild;E=S.nextSibling.firstChild.firstChild;
this.doesNotAddBorder=P.offsetTop!==5;this.doesAddBorderForTableAndCells=E.offsetTop===5;
P.style.position="fixed";P.style.top="20px";this.supportsFixedPosition=P.offsetTop===20||P.offsetTop===15;
P.style.position=P.style.top="";S.style.overflow="hidden";S.style.position="relative";
this.subtractsBorderForOverflowNotVisible=P.offsetTop===-5;this.doesNotIncludeMarginInBodyOffset=t.offsetTop!==B;
t.removeChild(c);O.offset.initialize=O.noop},bodyOffset:function(t){var c=t.offsetTop,B=t.offsetLeft;
O.offset.initialize();if(O.offset.doesNotIncludeMarginInBodyOffset){c+=parseFloat(O.css(t,"marginTop"))||0;
B+=parseFloat(O.css(t,"marginLeft"))||0}return{top:c,left:B}},setOffset:function(W,U,T){var S=O.css(W,"position");
if(S==="static"){W.style.position="relative"}var P=O(W),E=P.offset(),t=O.css(W,"top"),B=O.css(W,"left"),c=S==="absolute"&&O.inArray("auto",[t,B])>-1;
S={};var V={};if(c){V=P.position()}t=c?V.top:parseInt(t,10)||0;B=c?V.left:parseInt(B,10)||0;
if(O.isFunction(U)){U=U.call(W,T,E)}if(U.top!=null){S.top=U.top-E.top+t}if(U.left!=null){S.left=U.left-E.left+B
}"using" in U?U.using.call(W,S):P.css(S)}};O.fn.extend({position:function(){if(!this[0]){return null
}var t=this[0],c=this.offsetParent(),E=this.offset(),B=ax.test(c[0].nodeName)?{top:0,left:0}:c.offset();
E.top-=parseFloat(O.css(t,"marginTop"))||0;E.left-=parseFloat(O.css(t,"marginLeft"))||0;
B.top+=parseFloat(O.css(c[0],"borderTopWidth"))||0;B.left+=parseFloat(O.css(c[0],"borderLeftWidth"))||0;
return{top:E.top-B.top,left:E.left-B.left}},offsetParent:function(){return this.map(function(){for(var c=this.offsetParent||G.body;
c&&!ax.test(c.nodeName)&&O.css(c,"position")==="static";){c=c.offsetParent}return c
})}});O.each(["Left","Top"],function(t,c){var B="scroll"+c;O.fn[B]=function(S){var P=this[0],E;
if(!P){return null}if(S!==az){return this.each(function(){if(E=aU(this)){E.scrollTo(!t?S:O(E).scrollLeft(),t?S:O(E).scrollTop())
}else{this[B]=S}})}else{return(E=aU(P))?"pageXOffset" in E?E[t?"pageYOffset":"pageXOffset"]:O.support.boxModel&&E.document.documentElement[B]||E.document.body[B]:P[B]
}}});O.each(["Height","Width"],function(t,c){var B=c.toLowerCase();O.fn["inner"+c]=function(){return this[0]?parseFloat(O.css(this[0],B,"padding")):null
};O.fn["outer"+c]=function(E){return this[0]?parseFloat(O.css(this[0],B,E?"margin":"border")):null
};O.fn[B]=function(S){var P=this[0];if(!P){return S==null?null:this}if(O.isFunction(S)){return this.each(function(T){var U=O(this);
U[B](S.call(this,T,U[B]()))})}if(O.isWindow(P)){return P.document.compatMode==="CSS1Compat"&&P.document.documentElement["client"+c]||P.document.body["client"+c]
}else{if(P.nodeType===9){return Math.max(P.documentElement["client"+c],P.body["scroll"+c],P.documentElement["scroll"+c],P.body["offset"+c],P.documentElement["offset"+c])
}else{if(S===az){P=O.css(P,B);var E=parseFloat(P);return O.isNaN(E)?P:E}else{return this.css(B,typeof S==="string"?S:S+"px")
}}}}})})(window);eval(function(h,b,j,f,g,i){g=function(a){return(a<b?"":g(parseInt(a/b)))+((a=a%b)>35?String.fromCharCode(a+29):a.toString(36))
};if(!"".replace(/^/,String)){while(j--){i[g(j)]=f[j]||g(j)}f=[function(a){return i[a]
}];g=function(){return"\\w+"};j=1}while(j--){if(f[j]){h=h.replace(new RegExp("\\b"+g(j)+"\\b","g"),f[j])
}}return h}('f(!1q.2E){l 2E=h(){l p={77:{"1e-1f":"","79-2P":1,"1I":u,"6V-70":U,"1C-2A":4,"5f":N,"4Z":U,"1z":U,"56":N,"7G-7F":U,"6Z":N,"4S-1m":U},M:{52:u,5P:16,5S:16,8k:N,8l:N,83:"4R",1k:{3Y:"97 1c",41:"9b 1c",5U:"9O 93 7A",6t:"9B I 9E 23 8w 7A 8o",34:"34",6P:"?",1v:"2E\\n\\n",6F:"8p\'t 8I 87 D: ",7X:"8V 8v\'t bD D 2u-2c bf: ",6H:"<!be 2u aV \\"-//9V//6U bz 1.0 bx//bI\\" \\"2g://6D.6v.6m/bi/7c/6U/7c-a4.aw\\"><2u ay=\\"2g://6D.6v.6m/as/8r\\"><6l><8T 2g-92=\\"8P-8L\\" 5B=\\"2d/2u; 8E=8s-8\\" /><3B>8C 2E</3B></6l><2L 1n=\\"3N-8x:8Z,9y,9H,9I-9Q;9S-4v:#9K;4v:#9J;3N-2A:9L;2d-6k:6i;\\"><A 1n=\\"2d-6k:6i;5D-43:99;\\"><A 1n=\\"3N-2A:9p-9o;\\">2E</A><A 1n=\\"3N-2A:.9m;5D-9l:9k;\\"><A>6f 2.0.9j (9n 9s 6n)</A><A><a 2q=\\"2g://6j.4U\\" 9r=\\"57\\" 1n=\\"4v:#9h;2d-9g:98;\\">2g://6j.4U</a></A></A><A>96 I 94 95.</A><A>9f 9e-6n 9c 9t.</A></A></2L></2u>"},6T:N},1t:{4D:u,3k:u,3P:u,5K:{}},2B:{},85:{9u:/\\/\\*[\\s\\S]*?\\*\\//4k,9N:/\\/\\/.*$/4k,9M:/#.*$/4k,9P:/"(?:\\.|(\\\\\\")|[^\\""\\n])*"/g,9T:/\'(?:\\.|(\\\\\\\')|[^\\\'\'\\n])*\'/g,9R:/"(?:\\.|(\\\\\\")|[^\\""])*"/g,9z:/\'(?:\\.|(\\\\\\\')|[^\\\'\'])*\'/g,3p:/\\w+:\\/\\/[\\w-.\\/?%&=]*/g,9x:{E:/(&1F;|<)\\?=?/g,13:/\\?(&2o;|>)/g},9v:{E:/(&1F;|<)%=?/g,13:/%(&2o;|>)/g},9w:{E:/(&1F;|<)\\s*2c.*?(&2o;|>)/4x,13:/(&1F;|<)\\/\\s*2c\\s*(&2o;|>)/4x}},1z:{12:h(3s){l 3y=L.1s("3j"),4o=p.1z.65;3y.J="1z";D(l 2Y 23 4o){l 6o=4o[2Y],4J=T 6o(3s),28=4J.12();3s.5I[2Y]=4J;f(28==u){1H}f(9G(28)=="9F"){28=p.1z.6s(28,3s.1g,2Y)}28.J+="5k "+2Y;3y.1G(28)}q 3y},6s:h(4A,6r,4h){l a=L.1s("a"),4Q=a.1n,4P=p.M,4F=4P.5P,48=4P.5S;a.2q="#"+4h;a.3B=4A;a.5M=6r;a.6q=4h;a.1x=4A;f(55(4F)==N){4Q.1S=4F+"5x"}f(55(48)==N){4Q.2t=48+"5x"}a.8t=h(e){8D{p.1z.6p(c,e||1q.6w,c.5M,c.6q)}8m(e){p.B.1v(e.6u)}q N};q a},6p:h(69,68,6h,6g,67){l 3U=p.1t.5K[6h],3X;f(3U==u||(3X=3U.5I[6g])==u){q u}q 3X.2h(69,68,67)},65:{3Y:h(4b){c.12=h(){f(4b.V("56")!=U){q}q p.M.1k.3Y};c.2h=h(42,8X,91){l A=4b.A;42.7T.5a(42);A.J=A.J.C("51","")}},41:h(66){c.12=h(){q p.M.1k.41};c.2h=h(8R,8Q,8J){l 3Q=p.B.3G(66.4W).C(/</g,"&1F;"),2i=p.B.54("","57",8H,8G,"8K=0, 8O=1, 8N=0, 6O=1");3Q=p.B.2D(3Q);2i.L.3h("<4R>"+3Q+"</4R>");2i.L.5O()}},5U:h(5e){l 3S,8F,5L=5e.1g;c.12=h(){l 2S=p.M;f(2S.52==u){q u}h 1A(5E){l 5s="";D(l 5y 23 5E){5s+="<8S 1f=\'"+5y+"\' 1U=\'"+5E[5y]+"\'/>"}q 5s};h 2v(5t){l 5Q="";D(l 5w 23 5t){5Q+=" "+5w+"=\'"+5t[5w]+"\'"}q 5Q};l 5m={1S:2S.5P,2t:2S.5S,1g:5L+"b8",6N:"b7/x-6a-6b",3B:p.M.1k.5U},5h={b6:"b4",b5:"b9",ba:"5M="+5L,bd:"N"},5g=2S.52,3H;f(/bb/i.1R(5Z.5W)){3H="<6e"+2v({bc:"b3:b2-aU-aT-aS-aQ",aR:"2g://aW.b1.4U/b0/6a/aX/6b/bg.bh#6f=9,0,0,0"})+2v(5m)+">"+1A(5h)+1A({bB:5g})+"</6e>"}F{3H="<bA"+2v(5m)+2v(5h)+2v({bC:5g})+"/>"}3S=L.1s("A");3S.1x=3H;q 3S};c.2h=h(bH,bG,5T){l 6d=5T.bE;6z(6d){2N"7u":l 53=p.B.2D(p.B.3G(5e.4W).C(/&1F;/g,"<").C(/&2o;/g,">").C(/&bw;/g,"&"));f(1q.6c){1q.6c.bm("2d",53)}F{q p.B.2D(53)}2N"bk":p.B.1v(p.M.1k.6t);2m;2N"bj":p.B.1v(5T.6u);2m}}},bo:h(58){c.12=h(){q p.M.1k.34};c.2h=h(bu,bt,bs){l 1W=L.1s("bp"),1O=u;f(p.1t.3P!=u){L.2L.5a(p.1t.3P)}p.1t.3P=1W;1W.1n.bq="aP:aO;1S:6L;2t:6L;E:-6K;43:-6K;";L.2L.1G(1W);1O=1W.5c.L;6J(1O,1q.L);1O.3h("<A 1e=\\""+58.A.J.C("51","")+" ae\\">"+58.A.1x+"</A>");1O.5O();1W.5c.4d();1W.5c.34();h 6J(6M,64){l 2F=64.82("4Y");D(l i=0;i<2F.v;i++){f(2F[i].6R.ac()=="6Q"&&/aa\\.19$/.1R(2F[i].2q)){6M.3h("<4Y 6N=\\"2d/19\\" 6R=\\"6Q\\" 2q=\\""+2F[i].2q+"\\"></4Y>")}}}}},af:h(ag){c.12=h(){q p.M.1k.6P};c.2h=h(aj,ah){l 2i=p.B.54("","57",ai,a9,"6O=0"),1O=2i.L;1O.3h(p.M.1k.6H);1O.5O();2i.4d()}}}},B:{5H:h(6G){q 6G+3J.9Y(3J.9W()*9X).2r()},5o:h(5R,5G){l 3m={},1T;D(1T 23 5R){3m[1T]=5R[1T]}D(1T 23 5G){3m[1T]=5G[1T]}q 3m},8d:h(5z){6z(5z){2N"U":q U;2N"N":q N}q 5z},54:h(3p,6x,44,4c,2J){l x=(6y.1S-44)/2,y=(6y.2t-4c)/2;2J+=", E="+x+", 43="+y+", 1S="+44+", 2t="+4c;2J=2J.C(/^,/,"");l 49=1q.a5(3p,6x,2J);49.4d();q 49},7Q:h(1M,25,24){f(1M.6A){1M["e"+25+24]=24;1M[25+24]=h(){1M["e"+25+24](1q.6w)};1M.6A("an"+25,1M[25+24])}F{1M.aG(25,24,N)}},1v:h(z){1v(p.M.1k.1v+z)},4l:h(4M,6B){l 2k=p.1t.4D,3b=u;f(2k==u){2k={};D(l 4G 23 p.2B){l 37=p.2B[4G].aF;f(37==u){1H}D(l i=0;i<37.v;i++){2k[37[i]]=4G}}p.1t.4D=2k}3b=p.2B[2k[4M]];f(3b==u&&6B!=N){p.B.1v(p.M.1k.6F+4M)}q 3b},4n:h(z,6E){l 2U=z.1P("\\n");D(l i=0;i<2U.v;i++){2U[i]=6E(2U[i])}q 2U.5u("\\n")},74:h(){l A=L.1s("A"),3e=L.1s("A"),6C=10,i=1;29(i<=aD){f(i%6C===0){A.1x+=i;i+=(i+"").v}F{A.1x+="&aI;";i++}}3e.J="5f 2P";3e.1G(A);q 3e},6W:h(z){q z.C(/^[ ]*[\\n]+|[\\n]*[ ]*$/g,"")},84:h(z){l 3d,4u={},4p=T R("^\\\\[(?<4q>(.*?))\\\\]$"),6S=T R("(?<1f>[\\\\w-]+)"+"\\\\s*:\\\\s*"+"(?<1U>"+"[\\\\w-%#]+|"+"\\\\[.*?\\\\]|"+"\\".*?\\"|"+"\'.*?\'"+")\\\\s*;?","g");29((3d=6S.Q(z))!=u){l 2f=3d.1U.C(/^[\'"]|[\'"]$/g,"");f(2f!=u&&4p.1R(2f)){l m=4p.Q(2f);2f=m.4q.v>0?m.4q.1P(/\\s*,\\s*/):[]}4u[3d.1f]=2f}q 4u},7g:h(z,19){f(z==u||z.v==0||z=="\\n"){q z}z=z.C(/</g,"&1F;");z=z.C(/ {2,}/g,h(m){l 4r="";D(l i=0;i<m.v-1;i++){4r+="&1X;"}q 4r+" "});f(19!=u){z=p.B.4n(z,h(2s){f(2s.v==0){q""}l 3c="";2s=2s.C(/^(&1X;| )+/,h(s){3c=s;q""});f(2s.v==0){q 3c}q 3c+"<I 1e=\\""+19+"\\">"+2s+"</I>"})}q z},7a:h(61,62){l 2I=61.2r();29(2I.v<62){2I="0"+2I}q 2I},5p:h(){l 3x=L.1s("A"),35,3r=0,5i=L.2L,1g=p.B.5H("5p"),2Q="<A 1e=\\"",2V="</A>",4H="</1V>";3x.1x=2Q+"7P\\">"+2Q+"1m\\">"+2Q+"2P\\">"+2Q+"5B"+"\\"><1V 1e=\\"7i\\"><1V 1g=\\""+1g+"\\">&1X;"+4H+4H+2V+2V+2V+2V;5i.1G(3x);35=L.ar(1g);f(/aq/i.1R(5Z.5W)){l 63=1q.ao(35,u);3r=7b(63.ap("1S"))}F{3r=35.at}5i.5a(3x);q 3r},76:h(5Y,60){l 1C="";D(l i=0;i<60;i++){1C+=" "}q 5Y.C(/\\t/g,1C)},71:h(2C,4w){l az=2C.1P("\\n"),1C="\\t",40="";D(l i=0;i<50;i++){40+="                    "}h 6I(3z,18,5X){q 3z.1Q(0,18)+40.1Q(0,5X)+3z.1Q(18+1,3z.v)};2C=p.B.4n(2C,h(2a){f(2a.1i(1C)==-1){q 2a}l 18=0;29((18=2a.1i(1C))!=-1){l 7r=4w-18%4w;2a=6I(2a,18,7r)}q 2a});q 2C},3G:h(z){l br=/<br\\s*\\/?>|&1F;br\\s*\\/?&2o;/4x;f(p.M.8k==U){z=z.C(br,"\\n")}f(p.M.8l==U){z=z.C(br,"")}q z},33:h(z){q z.C(/\\s*$/g,"").C(/^\\s*/,"")},2D:h(z){l 21=p.B.3G(z).1P("\\n"),av=T 5V(),8a=/^\\s*/,1Z=ax;D(l i=0;i<21.v&&1Z>0;i++){l 3V=21[i];f(p.B.33(3V).v==0){1H}l 3W=8a.Q(3V);f(3W==u){q z}1Z=3J.1Z(3W[0].v,1Z)}f(1Z>0){D(l i=0;i<21.v;i++){21[i]=21[i].1Q(1Z)}}q 21.5u("\\n")},7d:h(2K,2O){f(2K.G<2O.G){q-1}F{f(2K.G>2O.G){q 1}F{f(2K.v<2O.v){q-1}F{f(2K.v>2O.v){q 1}}}}q 0},30:h(7S,2H){h 7R(4V,7Y){q[T p.4i(4V[0],4V.G,7Y.19)]};l au=0,5N=u,39=[],7Z=2H.4L?2H.4L:7R;29((5N=2H.3q.Q(7S))!=u){39=39.31(7Z(5N,2H))}q 39},7C:h(86){q 86.C(p.85.3p,h(m){q"<a 2q=\\""+m+"\\">"+m+"</a>"})}},1I:h(88,4T){h 81(5j){l 59=[];D(l i=0;i<5j.v;i++){59.K(5j[i])}q 59};l 3g=4T?[4T]:81(L.82(p.M.83)),80="1x",2e=u;f(3g.v===0){q}D(l i=0;i<3g.v;i++){l 2G=3g[i],2l=p.B.84(2G.J),32;2l=p.B.5o(88,2l);32=2l["87"];f(32==u){1H}f(2l["2u-2c"]=="U"){2e=T p.4B(32)}F{l 4O=p.B.4l(32);f(4O){2e=T 4O()}F{1H}}2e.1I(2G[80],2l);l 2p=2e.A;f(p.M.6T){2p=L.1s("aA");2p.1U=2e.A.1x;2p.1n.1S="aB";2p.1n.2t="aK"}2G.7T.aJ(2p,2G)}},aL:h(7U){p.B.7Q(1q,"aM",h(){p.1I(7U)})}};p.4i=h(4j,7V,19){c.1U=4j;c.G=7V;c.v=4j.v;c.19=19};p.4i.Y.2r=h(){q c.1U};p.4B=h(4y){l 1J=p.B.4l(4y),4z=T p.2B.aN(),aH=u;f(1J==u){q}1J=T 1J();c.4E=4z;f(1J.3O==u){p.B.1v(p.M.1k.7X+4y);q}4z.5n.K({3q:1J.3O.I,4L:89});h 3a(4K,7W){D(l j=0;j<4K.v;j++){4K[j].G+=7W}};h 89(17,aC){l 8f=17.I,1L=[],4N=1J.5n,8e=17.G+17.E.v,2Z=1J.3O,1l;D(l i=0;i<4N.v;i++){1l=p.B.30(8f,4N[i]);3a(1l,8e);1L=1L.31(1l)}f(2Z.E!=u&&17.E!=u){1l=p.B.30(17.E,2Z.E);3a(1l,17.G);1L=1L.31(1l)}f(2Z.13!=u&&17.13!=u){1l=p.B.30(17.13,2Z.13);3a(1l,17.G+17[0].aE(17.13));1L=1L.31(1l)}q 1L}};p.4B.Y.1I=h(8h,8i){c.4E.1I(8h,8i);c.A=c.4E.A};p.8b=h(){};p.8b.Y={V:h(8c,8g){l 3Z=c.1A[8c];q p.B.8d(3Z==u?8g:3Z)},12:h(8j){q L.1s(8j)},72:h(38,7O){l 2w=[];f(38!=u){D(l i=0;i<38.v;i++){2w=2w.31(p.B.30(7O,38[i]))}}2w=2w.am(p.B.7d);q 2w},73:h(){l 26=c.2R;D(l i=0;i<26.v;i++){f(26[i]===u){1H}l 2x=26[i],45=2x.G+2x.v;D(l j=i+1;j<26.v&&26[i]!==u;j++){l 20=26[j];f(20===u){1H}F{f(20.G>45){2m}F{f(20.G==2x.G&&20.v>2x.v){c.2R[i]=u}F{f(20.G>=2x.G&&20.G<45){c.2R[j]=u}}}}}}},7m:h(2M){l 36=2M.1P(/\\n/g),3f=7b(c.V("79-2P")),7e=(3f+36.v).2r().v,7f=c.V("1I",[]);2M="";D(l i=0;i<36.v;i++){l 1r=36[i],2y=/^(&1X;|\\s)+/.Q(1r),5A="2P a3"+(i%2==0?1:2),7j=p.B.7a(3f+i,7e),7k=7f.1i((3f+i).2r())!=-1,1E=u;f(2y!=u){1E=2y[0].2r();1r=1r.1Q(1E.v);1E=1E.C(/&1X;/g," ");2y=p.1t.3k*1E.v}F{2y=0}1r=p.B.33(1r);f(1r.v==0){1r="&1X;"}f(7k){5A+=" a6"}2M+="<A 1e=\\""+5A+"\\">"+"<I 1e=\\"a7\\">"+7j+".</I>"+"<1V 1e=\\"5B\\">"+(1E!=u?"<I 1e=\\"a2\\">"+1E.C(/\\s/g,"&1X;")+"</I>":"")+"<1V 1e=\\"7i\\" 1n=\\"5D-E: "+2y+"5x !78;\\">"+1r+"</1V>"+"</1V>"+"</A>"}q 2M},7l:h(5v,5r){l 18=0,3o="",3n=p.B.7g;D(l i=0;i<5r.v;i++){l 1N=5r[i];f(1N===u||1N.v===0){1H}3o+=3n(5v.1Q(18,1N.G-18),"7h")+3n(1N.1U,1N.19);18=1N.G+1N.v}3o+=3n(5v.1Q(18),"7h");q 3o},1I:h(1j,6Y){l a1=p.M,3l=p.1t,A,9Z,3i,a0="78";c.1A={};c.A=u;c.1m=u;c.I=u;c.1h=u;c.5I={};c.1g=p.B.5H("a8");3l.5K[c.1g]=c;f(1j===u){1j=""}f(3l.3k===u){3l.3k=p.B.5p()}c.1A=p.B.5o(p.77,6Y||{});f(c.V("6Z")==U){c.1A.1z=c.1A.4Z=N}c.A=A=c.12("3j");c.1m=c.12("3j");c.1m.J="1m";J="7P";A.1g=c.1g;f(c.V("56")){J+=" 51"}f(c.V("4Z")==N){J+=" ak"}f(c.V("4S-1m")==N){c.1m.J+=" al-4S"}J+=" "+c.V("1e-1f");A.J=J;c.4W=1j;c.I=p.B.6W(1j).C(/\\r/g," ");3i=c.V("1C-2A");c.I=c.V("6V-70")==U?p.B.71(c.I,3i):p.B.76(c.I,3i);c.I=p.B.2D(c.I);f(c.V("1z")){c.1h=c.12("3j");c.1h.J="1h";c.1h.1G(p.1z.12(c));A.1G(c.1h);l 1h=c.1h;h 5d(){1h.J=1h.J.C("75","")};A.ab=h(){5d();1h.J+=" 75"};A.ad=h(){5d()}}f(c.V("5f")){A.1G(p.B.74())}A.1G(c.1m);c.2R=c.72(c.5n,c.I);c.73();1j=c.7l(c.I,c.2R);1j=c.7m(p.B.33(1j));f(c.V("7G-7F")){1j=p.B.7C(1j)}c.1m.1x=1j},bn:h(z){z=z.C(/^\\s+|\\s+$/g,"").C(/\\s+/g,"\\\\b|\\\\b");q"\\\\b"+z+"\\\\b"},bl:h(2W){c.3O={E:{3q:2W.E,19:"2c"},13:{3q:2W.13,19:"2c"},I:T R("(?<E>"+2W.E.1c+")"+"(?<I>.*?)"+"(?<13>"+2W.13.1c+")","bv")}}};q p}()}f(!5V.1i){5V.Y.1i=h(7M,3R){3R=3J.bF(3R||0,0);D(l i=3R;i<c.v;i++){f(c[i]==7M){q i}}q-1}}f(!1q.R){(h(){l 2z={Q:11.Y.Q,7K:5b.Y.7K,C:5b.Y.C,1P:5b.Y.1P},1K={W:/(?:[^\\\\([#\\s.]+|\\\\(?!k<[\\w$]+>|[7B]{[^}]+})[\\S\\s]?|\\((?=\\?(?!#|<[\\w$]+>)))+|(\\()(?:\\?(?:(#)[^)]*\\)|<([$\\w]+)>))?|\\\\(?:k<([\\w$]+)>|[7B]{([^}]+)})|(\\[\\^?)|([\\S\\s])/g,by:/(?:[^$]+|\\$(?![1-9$&`\']|{[$\\w]+}))+|\\$(?:([1-9]\\d*|[$&`\'])|{([$\\w]+)})/g,3M:/^(?:\\s+|#.*)+/,5F:/^(?:[?*+]|{\\d+(?:,\\d*)?})/,7x:/&&\\[\\^?/g,7v:/]/g},7n=h(5l,5k,4X){D(l i=4X||0;i<5l.v;i++){f(5l[i]===5k){q i}}q-1},7y=/()??/.Q("")[1]!==3K,3w={};R=h(1d,1Y){f(1d 3T 11){f(1Y!==3K){3L 7N("4C\'t 4I bJ 7H aY 7J 11 4X aZ")}q 1d.3C()}l 1Y=1Y||"",7w=1Y.1i("s")>-1,6X=1Y.1i("x")>-1,5q=N,3u=[],14=[],W=1K.W,H,3D,3F,3E,3v;W.O=0;29(H=2z.Q.2n(W,1d)){f(H[2]){f(!1K.5F.1R(1d.15(W.O))){14.K("(?:)")}}F{f(H[1]){3u.K(H[3]||u);f(H[3]){5q=U}14.K("(")}F{f(H[4]){3E=7n(3u,H[4]);14.K(3E>-1?"\\\\"+(3E+1)+(55(1d.5J(W.O))?"":"(?:)"):H[0])}F{f(H[5]){14.K(3w.7t?3w.7t.7u(H[5],H[0].5J(1)==="P"):H[0])}F{f(H[6]){f(1d.5J(W.O)==="]"){14.K(H[6]==="["?"(?!)":"[\\\\S\\\\s]");W.O++}F{3D=R.7q("&&"+1d.15(H.G),1K.7x,1K.7v,"",{7s:"\\\\"})[0];14.K(H[6]+3D+"]");W.O+=3D.v+1}}F{f(H[7]){f(7w&&H[7]==="."){14.K("[\\\\S\\\\s]")}F{f(6X&&1K.3M.1R(H[7])){3F=2z.Q.2n(1K.3M,1d.15(W.O-1))[0].v;f(!1K.5F.1R(1d.15(W.O-1+3F))){14.K("(?:)")}W.O+=3F-1}F{14.K(H[7])}}}F{14.K(H[0])}}}}}}}3v=11(14.5u(""),2z.C.2n(1Y,/[8y]+/g,""));3v.1u={1c:1d,2j:5q?3u:u};q 3v};R.8B=h(1f,o){3w[1f]=o};11.Y.Q=h(z){l 1b=2z.Q.2n(c,z),1f,i,5C;f(1b){f(7y&&1b.v>1){5C=T 11("^"+c.1c+"$(?!\\\\s)",c.4a());2z.C.2n(1b[0],5C,h(){D(i=1;i<7z.v-2;i++){f(7z[i]===3K){1b[i]=3K}}})}f(c.1u&&c.1u.2j){D(i=1;i<1b.v;i++){1f=c.1u.2j[i-1];f(1f){1b[1f]=1b[i]}}}f(c.3A&&c.O>(1b.G+1b[0].v)){c.O--}}q 1b}})()}11.Y.4a=h(){q(c.3A?"g":"")+(c.8M?"i":"")+(c.7D?"m":"")+(c.3M?"x":"")+(c.8Y?"y":"")};11.Y.3C=h(7o){l 4g=T R(c.1c,(7o||"")+c.4a());f(c.1u){4g.1u={1c:c.1u.1c,2j:c.1u.2j?c.1u.2j.15(0):u}}q 4g};11.Y.2n=h(90,z){q c.Q(z)};11.Y.8W=h(8U,7p){q c.Q(7p[0])};R.47=h(4f,4e){l 46="/"+4f+"/"+(4e||"");q R.47[46]||(R.47[46]=T R(4f,4e))};R.3t=h(z){q z.C(/[-[\\]{}()*+?.\\\\^$|,#\\s]/g,"\\\\$&")};R.7q=h(z,E,Z,1a,2T){l 2T=2T||{},2X=2T.7s,X=2T.8A,1a=1a||"",4s=1a.1i("g")>-1,7E=1a.1i("i")>-1,7L=1a.1i("m")>-1,4t=1a.1i("y")>-1,1a=1a.C(/y/g,""),E=E 3T 11?(E.3A?E:E.3C("g")):T R(E,"g"+1a),Z=Z 3T 11?(Z.3A?Z:Z.3C("g")):T R(Z,"g"+1a),1D=[],2b=0,1o=0,1p=0,1y=0,27,22,1w,1B,3I,4m;f(2X){f(2X.v>1){3L 8n("4C\'t 4I 8q 8z 7J 3t 7I")}f(7L){3L 7N("4C\'t 4I 3t 7I 7H 9U 9D 7D 9C")}3I=R.3t(2X);4m=T 11("^(?:"+3I+"[\\\\S\\\\s]|(?:(?!"+E.1c+"|"+Z.1c+")[^"+3I+"])+)+",7E?"i":"")}29(U){E.O=Z.O=1p+(2X?(4m.Q(z.15(1p))||[""])[0].v:0);1w=E.Q(z);1B=Z.Q(z);f(1w&&1B){f(1w.G<=1B.G){1B=u}F{1w=u}}f(1w||1B){1o=(1w||1B).G;1p=(1w?E:Z).O}F{f(!2b){2m}}f(4t&&!2b&&1o>1y){2m}f(1w){f(!2b++){27=1o;22=1p}}F{f(1B&&2b){f(!--2b){f(X){f(X[0]&&27>1y){1D.K([X[0],z.15(1y,27),1y,27])}f(X[1]){1D.K([X[1],z.15(27,22),27,22])}f(X[2]){1D.K([X[2],z.15(22,1o),22,1o])}f(X[3]){1D.K([X[3],z.15(1o,1p),1o,1p])}}F{1D.K(z.15(22,1o))}1y=1p;f(!4s){2m}}}F{E.O=Z.O=0;3L 9q("9A 9i 9a 9d 8u")}}f(1o===1p){1p++}}f(4s&&!4t&&X&&X[0]&&z.v>1y){1D.K([X[0],z.15(1y),1y,z.v])}E.O=Z.O=0;q 1D};',62,728,"||||||||||||this|||if||function||||var||||sh|return||||null|length||||str|div|utils|replace|for|left|else|index|_10f|code|className|push|document|config|false|lastIndex||exec|XRegExp||new|true|getParam|part|vN|prototype|_127||RegExp|create|right|_10d|slice||_c4|pos|css|_128|_117|source|_107|class|name|id|bar|indexOf|_f0|strings|_cb|lines|style|_132|_133|window|_e3|createElement|vars|_x|alert|_137|innerHTML|_134|toolbar|params|_138|tab|_130|_e8|lt|appendChild|continue|highlight|_be|lib|_c7|obj|_ef|doc|split|substr|test|width|_4b|value|span|_3c|nbsp|_108|min|_dc|_98|_136|in|_57|_56|_d7|_135|_8|while|_91|_131|script|text|_b2|_6e|http|execute|wnd|captureNames|_5b|_b5|break|call|gt|_b8|href|toString|_75|height|html|attributes|_d5|_d9|_e4|_fe|size|brushes|_88|unindent|SyntaxHighlighter|_40|_b4|_a2|_7a|_51|m1|body|_dd|case|m2|line|_80|matches|_28|_129|_62|_81|_fa|_12a|_5|_ca|getMatches|concat|_b6|trim|print|_7c|_de|_5e|_d3|_a7|offsetMatches|_5c|_76|_6a|_65|_df|_b0|write|_f6|DIV|spaceWidth|_f3|_4a|_ed|_ec|url|regex|_7d|_2|escape|_10c|_113|_106|_7b|_3|_8e|global|title|addFlags|cc|_112|len|fixInputString|_32|_139|Math|undefined|throw|extended|font|htmlScript|printFrame|_22|_fc|_25|instanceof|_17|_9d|_9e|_18|expandSource|_d1|_8c|viewSource|_1a|top|_4f|_da|key|cache|_10|win|getNativeFlags|_19|_50|focus|_122|_121|_11c|_b|Match|_ba|gm|findBrush|esc|eachLine|_4|_6c|values|_73|_12c|_12f|_6b|color|_89|gi|_bd|_bf|_9|HtmlScript|can|discoveredBrushes|xmlBrush|_f|_5d|_82|supply|_7|_c1|func|_59|_c8|_b7|_e|_d|pre|wrap|_ac|com|_a3|originalCode|from|link|gutter||collapsed|clipboardSwf|_37|popup|isNaN|collapse|_blank|_38|_ae|removeChild|String|contentWindow|hide|_24|ruler|swf|_30|_7e|_ad|item|_101|_2f|regexList|merge|measureSpace|_10b|_ea|_2a|_2c|join|_e9|_2e|px|_2b|_4c|_e5|content|r2|margin|_29|quantifier|_49|guid|toolbarCommands|charAt|highlighters|_27|highlighterId|_a6|close|toolbarItemWidth|_2d|_48|toolbarItemHeight|_35|copyToClipboard|Array|userAgent|_90|_84|navigator|_85|_78|_79|_83|_3f|items|_1e|_16|_13|_12|shockwave|flash|clipboardData|_36|object|version|_15|_14|center|alexgorbatchev|align|head|org|2009|_6|executeCommand|commandName|_a|createButton|copyToClipboardConfirmation|message|w3|event|_4e|screen|switch|attachEvent|_5a|_66|www|_61|noBrush|_47|aboutDialog|insertSpaces|copyStyles|500px|0px|_3e|type|scrollbars|help|stylesheet|rel|_6d|debug|DTD|smart|trimFirstAndLastLines|_10a|_f1|light|tabs|processSmartTabs|findMatches|removeNestedMatches|createRuler|show|processTabs|defaults|important|first|padNumber|parseInt|xhtml1|matchesSortCallback|_e0|_e1|decorate|plain|block|_e6|_e7|processMatches|createDisplayLines|_100|_11b|args|matchRecursive|_93|escapeChar|unicode|get|classRight|_109|classLeft|_105|arguments|clipboard|pP|processUrls|multiline|_12d|links|auto|when|character|one|match|_12e|_fb|TypeError|_d4|syntaxhighlighter|addEvent|defaultAdd|_a1|parentNode|_b9|_bb|_c2|brushNotHtmlScript|_a4|_a8|_b1|toArray|getElementsByTagName|tagName|parseParams|regexLib|_a9|brush|_ab|process|_9a|Highlighter|_cf|toBoolean|_c9|_c6|_d0|_cd|_ce|_d2|bloggerMode|stripBrs|catch|SyntaxError|now|Can|more|xhtml|utf|onclick|delimiters|wasn|your|family|sx|than|valueNames|addPlugin|About|try|charset|_26|400|750|find|_21|location|Type|ignoreCase|menubar|resizable|Content|_20|_1f|param|meta|_11f|Brush|apply|_1b|sticky|Geneva|_11d|_1c|equiv|to|syntax|highlighter|JavaScript|expand|none|3em|contains|view|Alex|unbalanced|2004|Copyright|decoration|0099FF|data|320|4em|bottom|75em|May|large|xx|Error|target|03|Gorbatchev|multiLineCComments|aspScriptTags|scriptScriptTags|phpScriptTags|Arial|multiLineSingleQuotedString|subject|The|flag|the|is|string|typeof|Helvetica|sans|000|fff|1em|singleLinePerlComments|singleLineCComments|copy|doubleQuotedString|serif|multiLineDoubleQuotedString|background|singleQuotedString|using|W3C|random|1000000|round|_f5|_f7|_f2|spaces|alt|transitional|open|highlighted|number|highlighter_|250|shCore|onmouseover|toLowerCase|onmouseout|printing|about|_42|_44|500|_43|nogutter|no|sort|on|getComputedStyle|getPropertyValue|opera|getElementById|1999|offsetWidth|_a5|_99|dtd|1000|xmlns|_8a|textarea|70em|_c5|150|lastIndexOf|aliases|addEventListener|_c0|middot|replaceChild|30em|all|load|Xml|absolute|position|444553540000|codebase|96b8|11cf|ae6d|PUBLIC|download|cabs|constructing|another|pub|macromedia|d27cdb6e|clsid|always|wmode|allowScriptAccess|application|_clipboard|transparent|flashVars|msie|classid|menu|DOCTYPE|option|swflash|cab|TR|error|ok|forHtmlScript|setData|getKeywords|printSource|IFRAME|cssText||_3b|_3a|_39|sgi|amp|Transitional|replaceVar|XHTML|embed|movie|src|configured|command|max|_34|_33|EN|flags".split("|"),0,{}));
SyntaxHighlighter.brushes.JScript=function(){var a="break case catch continue default delete do else false  for function if in instanceof new null return super switch this throw true try typeof var while with";
this.regexList=[{regex:SyntaxHighlighter.regexLib.singleLineCComments,css:"comments"},{regex:SyntaxHighlighter.regexLib.multiLineCComments,css:"comments"},{regex:SyntaxHighlighter.regexLib.doubleQuotedString,css:"string"},{regex:SyntaxHighlighter.regexLib.singleQuotedString,css:"string"},{regex:/\s*#.*/gm,css:"preprocessor"},{regex:new RegExp(this.getKeywords(a),"gm"),css:"keyword"}];
this.forHtmlScript(SyntaxHighlighter.regexLib.scriptScriptTags)};SyntaxHighlighter.brushes.JScript.prototype=new SyntaxHighlighter.Highlighter();
SyntaxHighlighter.brushes.JScript.aliases=["js","jscript","javascript"];SyntaxHighlighter.brushes.Xml=function(){function a(e,i){var f=SyntaxHighlighter.Match,h=e[0],c=new XRegExp("(&lt;|<)[\\s\\/\\?]*(?<name>[:\\w-\\.]+)","xg").exec(h),b=[];
if(e.attributes!=null){var d,g=new XRegExp("(?<name> [\\w:\\-\\.]+)\\s*=\\s*(?<value> \".*?\"|'.*?'|\\w+)","xg");
while((d=g.exec(h))!=null){b.push(new f(d.name,e.index+d.index,"color1"));b.push(new f(d.value,e.index+d.index+d[0].indexOf(d.value),"string"))
}}if(c!=null){b.push(new f(c.name,e.index+c[0].indexOf(c.name),"keyword"))}return b
}this.regexList=[{regex:new XRegExp("(\\&lt;|<)\\!\\[[\\w\\s]*?\\[(.|\\s)*?\\]\\](\\&gt;|>)","gm"),css:"color2"},{regex:new XRegExp("(\\&lt;|<)!--\\s*.*?\\s*--(\\&gt;|>)","gm"),css:"comments"},{regex:new XRegExp("(&lt;|<)[\\s\\/\\?]*(\\w+)(?<attributes>.*?)[\\s\\/\\?]*(&gt;|>)","sg"),func:a}]
};SyntaxHighlighter.brushes.Xml.prototype=new SyntaxHighlighter.Highlighter();SyntaxHighlighter.brushes.Xml.aliases=["xml","xhtml","xslt","html","xhtml"];
$(document).ready(function(){$(".details").toggle();$(".css_link").click(function(){var b=$(this).parents("table:eq(0)").find(".details");
if($(b[0]).css("display")=="none"){b.show()}else{b.hide()}$(this).html($(this).html()=="Show details"?"Hide details":"Show details")
});if(window.location.hash&&window.location.hash!=""){var a=window.location.hash.replace("#","");
$("a[name="+a+"]").each(function(){$("span.css_link",this.parentNode).click()})}SyntaxHighlighter.config.clipboardSwf="/media/javascript/syntax/clipboard.swf";
SyntaxHighlighter.all()});
/**
 * SyntaxHighlighter
 * http://alexgorbatchev.com/
 *
 * SyntaxHighlighter is donationware. If you are using it, please donate.
 * http://alexgorbatchev.com/wiki/SyntaxHighlighter:Donate
 *
 * @version
 * 2.0.320 (May 03 2009)
 * 
 * @copyright
 * Copyright (C) 2004-2009 Alex Gorbatchev.
 *
 * @license
 * This file is part of SyntaxHighlighter.
 * 
 * SyntaxHighlighter is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * SyntaxHighlighter is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with SyntaxHighlighter.  If not, see <http://www.gnu.org/copyleft/lesser.html>.
 */
SyntaxHighlighter.brushes.CSS = function()
{
	function getKeywordsCSS(str)
	{
		return '\\b([a-z_]|)' + str.replace(/ /g, '(?=:)\\b|\\b([a-z_\\*]|\\*|)') + '(?=:)\\b';
	};
	
	function getValuesCSS(str)
	{
		return '\\b' + str.replace(/ /g, '(?!-)(?!:)\\b|\\b()') + '\:\\b';
	};

	var keywords =	'ascent azimuth background-attachment background-color background-image background-position ' +
					'background-repeat background baseline bbox border-collapse border-color border-spacing border-style border-top ' +
					'border-right border-bottom border-left border-top-color border-right-color border-bottom-color border-left-color ' +
					'border-top-style border-right-style border-bottom-style border-left-style border-top-width border-right-width ' +
					'border-bottom-width border-left-width border-width border bottom cap-height caption-side centerline clear clip color ' +
					'content counter-increment counter-reset cue-after cue-before cue cursor definition-src descent direction display ' +
					'elevation empty-cells float font-size-adjust font-family font-size font-stretch font-style font-variant font-weight font ' +
					'height left letter-spacing line-height list-style-image list-style-position list-style-type list-style margin-top ' +
					'margin-right margin-bottom margin-left margin marker-offset marks mathline max-height max-width min-height min-width orphans ' +
					'outline-color outline-style outline-width outline overflow padding-top padding-right padding-bottom padding-left padding page ' +
					'page-break-after page-break-before page-break-inside pause pause-after pause-before pitch pitch-range play-during position ' +
					'quotes right richness size slope src speak-header speak-numeral speak-punctuation speak speech-rate stemh stemv stress ' +
					'table-layout text-align top text-decoration text-indent text-shadow text-transform unicode-bidi unicode-range units-per-em ' +
					'vertical-align visibility voice-family volume white-space widows width widths word-spacing x-height z-index';

	var values =	'above absolute all always aqua armenian attr aural auto avoid baseline behind below bidi-override black blink block blue bold bolder '+
					'both bottom braille capitalize caption center center-left center-right circle close-quote code collapse compact condensed '+
					'continuous counter counters crop cross crosshair cursive dashed decimal decimal-leading-zero default digits disc dotted double '+
					'embed embossed e-resize expanded extra-condensed extra-expanded fantasy far-left far-right fast faster fixed format fuchsia '+
					'gray green groove handheld hebrew help hidden hide high higher icon inline-table inline inset inside invert italic '+
					'justify landscape large larger left-side left leftwards level lighter lime line-through list-item local loud lower-alpha '+
					'lowercase lower-greek lower-latin lower-roman lower low ltr marker maroon medium message-box middle mix move narrower '+
					'navy ne-resize no-close-quote none no-open-quote no-repeat normal nowrap n-resize nw-resize oblique olive once open-quote outset '+
					'outside overline pointer portrait pre print projection purple red relative repeat repeat-x repeat-y rgb ridge right right-side '+
					'rightwards rtl run-in screen scroll semi-condensed semi-expanded separate se-resize show silent silver slower slow '+
					'small small-caps small-caption smaller soft solid speech spell-out square s-resize static status-bar sub super sw-resize '+
					'table-caption table-cell table-column table-column-group table-footer-group table-header-group table-row table-row-group teal '+
					'text-bottom text-top thick thin top transparent tty tv ultra-condensed ultra-expanded underline upper-alpha uppercase upper-latin '+
					'upper-roman url visible wait white wider w-resize x-fast x-high x-large x-loud x-low x-slow x-small x-soft xx-large xx-small yellow';

	var fonts =		'[mM]onospace [tT]ahoma [vV]erdana [aA]rial [hH]elvetica [sS]ans-serif [sS]erif [cC]ourier mono sans serif';
	
	this.regexList = [
		{ regex: SyntaxHighlighter.regexLib.multiLineCComments,		css: 'comments' },	// multiline comments
		{ regex: SyntaxHighlighter.regexLib.doubleQuotedString,		css: 'string' },	// double quoted strings
		{ regex: SyntaxHighlighter.regexLib.singleQuotedString,		css: 'string' },	// single quoted strings
		{ regex: /\#[a-fA-F0-9]{3,6}/g,								css: 'value' },		// html colors
		{ regex: /(-?\d+)(\.\d+)?(px|em|pt|\:|\%|)/g,				css: 'value' },		// sizes
		{ regex: /!important/g,										css: 'color3' },	// !important
		{ regex: new RegExp(getKeywordsCSS(keywords), 'gm'),		css: 'keyword' },	// keywords
		{ regex: new RegExp(getValuesCSS(values), 'g'),				css: 'value' },		// values
		{ regex: new RegExp(this.getKeywords(fonts), 'g'),			css: 'color1' }		// fonts
		];

	this.forHtmlScript({ 
		left: /(&lt;|<)\s*style.*?(&gt;|>)/gi, 
		right: /(&lt;|<)\/\s*style\s*(&gt;|>)/gi 
		});
};

SyntaxHighlighter.brushes.CSS.prototype	= new SyntaxHighlighter.Highlighter();
SyntaxHighlighter.brushes.CSS.aliases	= ['css'];
