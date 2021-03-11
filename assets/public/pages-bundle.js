/*! For license information please see pages-bundle.js.LICENSE.txt */
(()=>{var e={5124:(e,t,n)=>{var r={"./doves.jpeg":7902};function o(e){var t=i(e);return n(t)}function i(e){if(!n.o(r,e)){var t=new Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}return r[e]}o.keys=function(){return Object.keys(r)},o.resolve=i,e.exports=o,o.id=5124},5164:(e,t,n)=>{var r={"./doves.jpeg":4638};function o(e){var t=i(e);return n(t)}function i(e){if(!n.o(r,e)){var t=new Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}return r[e]}o.keys=function(){return Object.keys(r)},o.resolve=i,e.exports=o,o.id=5164},7902:(e,t,n)=>{e.exports={srcSet:n.p+"img/023ee23384c2a3be3caded60706e0eca-320.avif 320w,"+n.p+"img/90a9a550ad8d5d1313733b5660b967ce-540.avif 540w",images:[{path:n.p+"img/023ee23384c2a3be3caded60706e0eca-320.avif",width:320,height:193},{path:n.p+"img/90a9a550ad8d5d1313733b5660b967ce-540.avif",width:540,height:326}],src:n.p+"img/023ee23384c2a3be3caded60706e0eca-320.avif",toString:function(){return n.p+"img/023ee23384c2a3be3caded60706e0eca-320.avif"},width:320,height:193}},4638:(e,t,n)=>{e.exports={srcSet:n.p+"img/c7ef21e162aaf9e7b1fb8add3b5f9d02-320.webp 320w,"+n.p+"img/16f4ed86087eebe091136d92f34d3ea1-540.webp 540w",images:[{path:n.p+"img/c7ef21e162aaf9e7b1fb8add3b5f9d02-320.webp",width:320,height:193},{path:n.p+"img/16f4ed86087eebe091136d92f34d3ea1-540.webp",width:540,height:326}],src:n.p+"img/c7ef21e162aaf9e7b1fb8add3b5f9d02-320.webp",toString:function(){return n.p+"img/c7ef21e162aaf9e7b1fb8add3b5f9d02-320.webp"},width:320,height:193}},1739:()=>{!function(){"use strict";var e={compile:function(e){return t.template.replace(t.pattern,(function(n,r){const o=t.middleware(r,e[r],t.template);return void 0!==o?o:e[r]||n}))},setOptions:function(e){t.pattern=e.pattern||t.pattern,t.template=e.template||t.template,"function"==typeof e.middleware&&(t.middleware=e.middleware)}};const t={};t.pattern=/\{(.*?)\}/g,t.template="",t.middleware=function(){};var n=function(e,t){var n=t.length,r=e.length;if(r>n)return!1;if(r===n)return e===t;e:for(var o=0,i=0;o<r;o++){for(var c=e.charCodeAt(o);i<n;)if(t.charCodeAt(i++)===c)continue e;return!1}return!0},r=new function(){this.matches=function(e,t){return n(t.toLowerCase(),e.toLowerCase())}};var o=new function(){this.matches=function(e,t){return!!e&&(e=e.trim().toLowerCase(),(t=t.trim().toLowerCase()).split(" ").filter((function(t){return e.indexOf(t)>=0})).length===t.split(" ").length)}};var i={put:function(e){if(l(e))return d(e);if(t=e,Boolean(t)&&"[object Array]"===Object.prototype.toString.call(t))return function(e){const t=[];u();for(let n=0,r=e.length;n<r;n++)l(e[n])&&t.push(d(e[n]));return t}(e);var t;return},clear:u,search:function(e){if(!e)return[];return function(e,t,n,r){const o=[];for(let i=0;i<e.length&&o.length<r.limit;i++){const c=f(e[i],t,n,r);c&&o.push(c)}return o}(a,e,s.searchStrategy,s).sort(s.sort)},setOptions:function(e){s=e||{},s.fuzzy=e.fuzzy||!1,s.limit=e.limit||10,s.searchStrategy=e.fuzzy?r:o,s.sort=e.sort||c,s.exclude=e.exclude||[]}};function c(){return 0}const a=[];let s={};function u(){return a.length=0,a}function l(e){return Boolean(e)&&"[object Object]"===Object.prototype.toString.call(e)}function d(e){return a.push(e),a}function f(e,t,n,r){for(const o in e)if(!h(e[o],r.exclude)&&n.matches(e[o],t))return e}function h(e,t){for(let n=0,r=t.length;n<r;n++){const r=t[n];if(new RegExp(r).test(e))return!0}return!1}s.fuzzy=!1,s.limit=10,s.searchStrategy=s.fuzzy?r:o,s.sort=c,s.exclude=[];var p={load:function(e,t){const n=window.XMLHttpRequest?new window.XMLHttpRequest:new ActiveXObject("Microsoft.XMLHTTP");n.open("GET",e,!0),n.onreadystatechange=function(e,t){return function(){if(4===e.readyState&&200===e.status)try{t(null,JSON.parse(e.responseText))}catch(e){t(e,null)}}}(n,t),n.send()}};var m=function e(t){if(!function(e){if(!e)return!1;return void 0!==e.required&&e.required instanceof Array}(t))throw new Error("-- OptionsValidator: required options missing");if(!(this instanceof e))return new e(t);const n=t.required;this.getRequiredOptions=function(){return n},this.validate=function(e){const t=[];return n.forEach((function(n){void 0===e[n]&&t.push(n)})),t}},g={merge:function(e,t){const n={};for(const r in e)n[r]=e[r],void 0!==t[r]&&(n[r]=t[r]);return n},isJSON:function(e){try{return!!(e instanceof Object&&JSON.parse(JSON.stringify(e)))}catch(e){return!1}}};!function(t){let n,r={searchInput:null,resultsContainer:null,json:[],success:Function.prototype,searchResultTemplate:'<li><a href="{url}" title="{desc}">{title}</a></li>',templateMiddleware:Function.prototype,sortMiddleware:function(){return 0},noResultsText:"No results found",limit:10,fuzzy:!1,debounceTime:null,exclude:[]};const o=["searchInput","resultsContainer","json"],c=m({required:o});function a(e){i.put(e),r.searchInput.addEventListener("input",(function(e){var t,o,i;i=e.which,-1===[13,16,20,37,38,39,40,91].indexOf(i)&&(s(),t=function(){l(e.target.value)},(o=r.debounceTime)?(clearTimeout(n),n=setTimeout(t,o)):t.call())}))}function s(){r.resultsContainer.innerHTML=""}function u(e){r.resultsContainer.innerHTML+=e}function l(t){(function(e){return e&&e.length>0})(t)&&(s(),function(t,n){const o=t.length;if(0===o)return u(r.noResultsText);for(let r=0;r<o;r++)t[r].query=n,u(e.compile(t[r]))}(i.search(t),t))}function d(e){throw new Error("SimpleJekyllSearch --- "+e)}t.SimpleJekyllSearch=function(t){var n;c.validate(t).length>0&&d("You must specify the following required options: "+o),r=g.merge(r,t),e.setOptions({template:r.searchResultTemplate,middleware:r.templateMiddleware}),i.setOptions({fuzzy:r.fuzzy,limit:r.limit,sort:r.sortMiddleware,exclude:r.exclude}),g.isJSON(r.json)?a(r.json):(n=r.json,p.load(n,(function(e,t){e&&d("failed to get JSON ("+n+")"),a(t)})));const s={search:l};return"function"==typeof r.success&&r.success.call(s),s}}(window)}()}},t={};function n(r){if(t[r])return t[r].exports;var o=t[r]={exports:{}};return e[r](o,o.exports,n),o.exports}n.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return n.d(t,{a:t}),t},n.d=(e,t)=>{for(var r in t)n.o(t,r)&&!n.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},n.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),(()=>{var e;n.g.importScripts&&(e=n.g.location+"");var t=n.g.document;if(!e&&t&&(t.currentScript&&(e=t.currentScript.src),!e)){var r=t.getElementsByTagName("script");r.length&&(e=r[r.length-1].src)}if(!e)throw new Error("Automatic publicPath is not supported in this browser");e=e.replace(/#.*$/,"").replace(/\?.*$/,"").replace(/\/[^\/]+$/,"/"),n.p=e})(),(()=>{"use strict";function e(e){let t={};return e.keys().map((n=>t[n.replace(/^\.\//,"")]=e(n))),t}const t=e(n(5124)),r=e(n(5164)),o={get section(){return delete this.section,document.querySelector("section.mood-content")},get focus(){let e=document.querySelector(".mood.focus");return e||document.querySelector(".mood")},get all(){return delete this.all,this.all=document.querySelectorAll(".mood")},get count(){return delete this.count,this.count=this.all.length},get buttonPrev(){return delete this.buttonPrev,this.buttonPrev=document.querySelector(".mood-button--prev")},get buttonNext(){return delete this.buttonNext,this.buttonNext=document.querySelector(".mood-button--next")},get track(){return delete this.track,this.track=document.querySelector(".mood-track")},get index(){return parseInt(this.track.dataset.moodFocus)},set index(e){this.track.dataset.moodFocus=e,this.center(!1,e)},center(e=!1,t=this.index){this.all.forEach(((n,r)=>{n.classList.toggle("focus",r==t),r==t&&e&&n.scrollIntoView({block:"nearest",inline:"center",behavior:"smooth"})}))}};function i(){let e=o.count-1;o.index=o.index+1<=e?o.index+1:e,o.center(!0)}function c(){o.index=o.index-1>=0?o.index-1:0,o.center(!0)}function a(){o.buttonPrev.classList.toggle("hide",!o.track.scrollLeft),o.buttonNext.classList.toggle("hide",o.track.scrollLeft>=.8*(o.track.scrollWidth-o.track.offsetWidth))}function s(){let e=o.track.getBoundingClientRect(),t=e.left+e.width/2;o.all.forEach(((e,n)=>{let r=e.getBoundingClientRect(),i=r.left+r.width/2;Math.abs(i-t)<.2*r.width&&(o.index=n)}))}function u(){document.querySelectorAll(".mood-header-image").forEach(((e,n)=>{!function(e,t,n,r=!0,o={original:!0}){const i=document.createElement("picture"),c=document.createElement("img");c.alt=e.dataset.caption;const a=t[t.length-1];c.src=a.src,c.loading=r?"lazy":"eager",o.original?(c.width=a.width,c.height=a.height):(c.width=o.width,c.height=o.height),t.forEach((e=>{const t=document.createElement("source");t.srcset=e.srcSet,t.sizes=n,t.type="image/"+e.src.split(".").pop(),i.appendChild(t)})),i.appendChild(c),e.appendChild(i)}(e,[t[e.dataset.path],r[e.dataset.path]],"(max-width: 1024px) 280px, (max-width: 1600px) 484px, 484px",n>1)}))}window.addEventListener("DOMContentLoaded",(function(){document.querySelector(".mood")&&(u(),o.buttonPrev.addEventListener("click",c),o.buttonNext.addEventListener("click",i),o.track.addEventListener("scroll",a),o.track.addEventListener("scroll",s))}))})(),(()=>{"use strict";n(1739);window.addEventListener("DOMContentLoaded",(()=>{if(document.getElementById("searchbar")){window.SimpleJekyllSearch({searchInput:document.getElementById("searchbar"),resultsContainer:document.getElementById("search-results"),json:"/search.json",searchResultTemplate:'<a href="{url}" target="_blank">{title}</a>',noResultsText:""}),/Safari/.test(navigator.userAgent)&&!/Chrome/.test(navigator.userAgent)&&(document.body.firstElementChild.tabIndex=1);var e=document.querySelector(".labelgroup.search"),t=e.querySelector("#searchbar"),n=e.querySelector(".posts-label"),r=e.querySelector(".search-results"),o=n.scrollWidth;n.style.width=o+"px",e.addEventListener("click",(function(o){r.style.display=null,n.style.width="0",e.classList.add("focus-within"),t.focus(),o.stopPropagation()}),!1),e.addEventListener("mouseleave",(function(){document.body.onclick=i}));var i=function(t){r.style.display="none",e.classList.remove("focus-within"),n.style.width=o+"px",document.body.onclick=null}}}),!1)})()})();