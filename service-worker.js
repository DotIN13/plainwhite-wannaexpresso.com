(()=>{var e={86:e=>{e.exports={srcSet:"assets/public/img/8cd466e952b589db4e8462bae2da45b8-1020.webp 1020w",images:[{path:"assets/public/img/8cd466e952b589db4e8462bae2da45b8-1020.webp",width:1020,height:612}],src:"assets/public/img/8cd466e952b589db4e8462bae2da45b8-1020.webp",toString:function(){return"assets/public/img/8cd466e952b589db4e8462bae2da45b8-1020.webp"},width:1020,height:612}},895:()=>{"use strict";try{self["workbox:cacheable-response:6.1.1"]&&_()}catch(e){}},913:()=>{"use strict";try{self["workbox:core:6.1.1"]&&_()}catch(e){}},550:()=>{"use strict";try{self["workbox:expiration:6.1.1"]&&_()}catch(e){}},882:()=>{"use strict";try{self["workbox:navigation-preload:6.1.1"]&&_()}catch(e){}},977:()=>{"use strict";try{self["workbox:precaching:6.1.1"]&&_()}catch(e){}},144:()=>{"use strict";try{self["workbox:recipes:6.1.1"]&&_()}catch(e){}},80:()=>{"use strict";try{self["workbox:routing:6.1.1"]&&_()}catch(e){}},873:()=>{"use strict";try{self["workbox:strategies:6.1.1"]&&_()}catch(e){}}},t={};function s(a){if(t[a])return t[a].exports;var n=t[a]={exports:{}};return e[a](n,n.exports,s),n.exports}s.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return s.d(t,{a:t}),t},s.d=(e,t)=>{for(var a in t)s.o(t,a)&&!s.o(e,a)&&Object.defineProperty(e,a,{enumerable:!0,get:t[a]})},s.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),(()=>{"use strict";s(913);const e=(e,...t)=>{let s=e;return t.length>0&&(s+=` :: ${JSON.stringify(t)}`),s};class t extends Error{constructor(t,s){super(e(t,s)),this.name=t,this.details=s}}s(80);const a=e=>e&&"object"==typeof e?e:{handle:e};class n{constructor(e,t,s="GET"){this.handler=a(t),this.match=e,this.method=s}setCatchHandler(e){this.catchHandler=a(e)}}class r extends n{constructor(e,t,s){super((({url:t})=>{const s=e.exec(t.href);if(s&&(t.origin===location.origin||0===s.index))return s.slice(1)}),t,s)}}const i=e=>new URL(String(e),location.href).href.replace(new RegExp(`^${location.origin}`),"");class c{constructor(){this._routes=new Map,this._defaultHandlerMap=new Map}get routes(){return this._routes}addFetchListener(){self.addEventListener("fetch",(e=>{const{request:t}=e,s=this.handleRequest({request:t,event:e});s&&e.respondWith(s)}))}addCacheListener(){self.addEventListener("message",(e=>{if(e.data&&"CACHE_URLS"===e.data.type){const{payload:t}=e.data;0;const s=Promise.all(t.urlsToCache.map((t=>{"string"==typeof t&&(t=[t]);const s=new Request(...t);return this.handleRequest({request:s,event:e})})));e.waitUntil(s),e.ports&&e.ports[0]&&s.then((()=>e.ports[0].postMessage(!0)))}}))}handleRequest({request:e,event:t}){const s=new URL(e.url,location.href);if(!s.protocol.startsWith("http"))return void 0;const a=s.origin===location.origin,{params:n,route:r}=this.findMatchingRoute({event:t,request:e,sameOrigin:a,url:s});let i=r&&r.handler;const c=e.method;if(!i&&this._defaultHandlerMap.has(c)&&(i=this._defaultHandlerMap.get(c)),!i)return void 0;let o;try{o=i.handle({url:s,request:e,event:t,params:n})}catch(e){o=Promise.reject(e)}const h=r&&r.catchHandler;return o instanceof Promise&&(this._catchHandler||h)&&(o=o.catch((async a=>{if(h){0;try{return await h.handle({url:s,request:e,event:t,params:n})}catch(e){a=e}}if(this._catchHandler)return this._catchHandler.handle({url:s,request:e,event:t});throw a}))),o}findMatchingRoute({url:e,sameOrigin:t,request:s,event:a}){const n=this._routes.get(s.method)||[];for(const r of n){let n;const i=r.match({url:e,sameOrigin:t,request:s,event:a});if(i)return n=i,(Array.isArray(i)&&0===i.length||i.constructor===Object&&0===Object.keys(i).length||"boolean"==typeof i)&&(n=void 0),{route:r,params:n}}return{}}setDefaultHandler(e,t="GET"){this._defaultHandlerMap.set(t,a(e))}setCatchHandler(e){this._catchHandler=a(e)}registerRoute(e){this._routes.has(e.method)||this._routes.set(e.method,[]),this._routes.get(e.method).push(e)}unregisterRoute(e){if(!this._routes.has(e.method))throw new t("unregister-route-but-not-found-with-method",{method:e.method});const s=this._routes.get(e.method).indexOf(e);if(!(s>-1))throw new t("unregister-route-route-not-registered");this._routes.get(e.method).splice(s,1)}}let o;const h=()=>(o||(o=new c,o.addFetchListener(),o.addCacheListener()),o);function l(e,s,a){let i;if("string"==typeof e){const t=new URL(e,location.href);0;i=new n((({url:e})=>e.href===t.href),s,a)}else if(e instanceof RegExp)i=new r(e,s,a);else if("function"==typeof e)i=new n(e,s,a);else{if(!(e instanceof n))throw new t("unsupported-route-type",{moduleName:"workbox-routing",funcName:"registerRoute",paramName:"capture"});i=e}return h().registerRoute(i),i}s(882);const u={googleAnalytics:"googleAnalytics",precache:"precache-v2",prefix:"workbox",runtime:"runtime",suffix:"undefined"!=typeof registration?registration.scope:""},d=e=>[u.prefix,e,u.suffix].filter((e=>e&&e.length>0)).join("-"),p=e=>e||d(u.precache),f=e=>e||d(u.runtime);function w(e,t){const s=new URL(e);for(const e of t)s.searchParams.delete(e);return s.href}class g{constructor(){this.promise=new Promise(((e,t)=>{this.resolve=e,this.reject=t}))}}const m=new Set;s(873);function y(e){return"string"==typeof e?new Request(e):e}class _{constructor(e,t){this._cacheKeys={},Object.assign(this,t),this.event=t.event,this._strategy=e,this._handlerDeferred=new g,this._extendLifetimePromises=[],this._plugins=[...e.plugins],this._pluginStateMap=new Map;for(const e of this._plugins)this._pluginStateMap.set(e,{});this.event.waitUntil(this._handlerDeferred.promise)}fetch(e){return this.waitUntil((async()=>{const{event:s}=this;let a=y(e);if("navigate"===a.mode&&s instanceof FetchEvent&&s.preloadResponse){const e=await s.preloadResponse;if(e)return e}const n=this.hasCallback("fetchDidFail")?a.clone():null;try{for(const e of this.iterateCallbacks("requestWillFetch"))a=await e({request:a.clone(),event:s})}catch(e){throw new t("plugin-error-request-will-fetch",{thrownError:e})}const r=a.clone();try{let e;e=await fetch(a,"navigate"===a.mode?void 0:this._strategy.fetchOptions);for(const t of this.iterateCallbacks("fetchDidSucceed"))e=await t({event:s,request:r,response:e});return e}catch(e){throw n&&await this.runCallbacks("fetchDidFail",{error:e,event:s,originalRequest:n.clone(),request:r.clone()}),e}})())}async fetchAndCachePut(e){const t=await this.fetch(e),s=t.clone();return this.waitUntil(this.cachePut(e,s)),t}cacheMatch(e){return this.waitUntil((async()=>{const t=y(e);let s;const{cacheName:a,matchOptions:n}=this._strategy,r=await this.getCacheKey(t,"read"),i={...n,cacheName:a};s=await caches.match(r,i);for(const e of this.iterateCallbacks("cachedResponseWillBeUsed"))s=await e({cacheName:a,matchOptions:n,cachedResponse:s,request:r,event:this.event})||void 0;return s})())}async cachePut(e,s){const a=y(e);var n;await(n=0,new Promise((e=>setTimeout(e,n))));const r=await this.getCacheKey(a,"write");if(!s)throw new t("cache-put-with-no-response",{url:i(r.url)});const c=await this._ensureResponseSafeToCache(s);if(!c)return!1;const{cacheName:o,matchOptions:h}=this._strategy,l=await self.caches.open(o),u=this.hasCallback("cacheDidUpdate"),d=u?await async function(e,t,s,a){const n=w(t.url,s);if(t.url===n)return e.match(t,a);const r={...a,ignoreSearch:!0},i=await e.keys(t,r);for(const t of i)if(n===w(t.url,s))return e.match(t,a)}(l,r.clone(),["__WB_REVISION__"],h):null;try{await l.put(r,u?c.clone():c)}catch(e){throw"QuotaExceededError"===e.name&&await async function(){for(const e of m)await e()}(),e}for(const e of this.iterateCallbacks("cacheDidUpdate"))await e({cacheName:o,oldResponse:d,newResponse:c.clone(),request:r,event:this.event});return!0}async getCacheKey(e,t){if(!this._cacheKeys[t]){let s=e;for(const e of this.iterateCallbacks("cacheKeyWillBeUsed"))s=y(await e({mode:t,request:s,event:this.event,params:this.params}));this._cacheKeys[t]=s}return this._cacheKeys[t]}hasCallback(e){for(const t of this._strategy.plugins)if(e in t)return!0;return!1}async runCallbacks(e,t){for(const s of this.iterateCallbacks(e))await s(t)}*iterateCallbacks(e){for(const t of this._strategy.plugins)if("function"==typeof t[e]){const s=this._pluginStateMap.get(t),a=a=>{const n={...a,state:s};return t[e](n)};yield a}}waitUntil(e){return this._extendLifetimePromises.push(e),e}async doneWaiting(){let e;for(;e=this._extendLifetimePromises.shift();)await e}destroy(){this._handlerDeferred.resolve()}async _ensureResponseSafeToCache(e){let t=e,s=!1;for(const e of this.iterateCallbacks("cacheWillUpdate"))if(t=await e({request:this.request,response:t,event:this.event})||void 0,s=!0,!t)break;return s||t&&200!==t.status&&(t=void 0),t}}class b{constructor(e={}){this.cacheName=f(e.cacheName),this.plugins=e.plugins||[],this.fetchOptions=e.fetchOptions,this.matchOptions=e.matchOptions}handle(e){const[t]=this.handleAll(e);return t}handleAll(e){e instanceof FetchEvent&&(e={event:e,request:e.request});const t=e.event,s="string"==typeof e.request?new Request(e.request):e.request,a="params"in e?e.params:void 0,n=new _(this,{event:t,request:s,params:a}),r=this._getResponse(n,s,t);return[r,this._awaitComplete(r,n,s,t)]}async _getResponse(e,s,a){let n;await e.runCallbacks("handlerWillStart",{event:a,request:s});try{if(n=await this._handle(s,e),!n||"error"===n.type)throw new t("no-response",{url:s.url})}catch(t){for(const r of e.iterateCallbacks("handlerDidError"))if(n=await r({error:t,event:a,request:s}),n)break;if(!n)throw t}for(const t of e.iterateCallbacks("handlerWillRespond"))n=await t({event:a,request:s,response:n});return n}async _awaitComplete(e,t,s,a){let n,r;try{n=await e}catch(r){}try{await t.runCallbacks("handlerDidRespond",{event:a,request:s,response:n}),await t.doneWaiting()}catch(e){r=e}if(await t.runCallbacks("handlerDidComplete",{event:a,request:s,response:n,error:r}),t.destroy(),r)throw r}}class R extends b{async _handle(e,s){let a,n=await s.cacheMatch(e);if(n)0;else{0;try{n=await s.fetchAndCachePut(e)}catch(e){a=e}0}if(!n)throw new t("no-response",{url:e.url,error:a});return n}}const v={cacheWillUpdate:async({response:e})=>200===e.status||0===e.status?e:null};class x extends b{constructor(e){super(e),this.plugins.some((e=>"cacheWillUpdate"in e))||this.plugins.unshift(v)}async _handle(e,s){const a=s.fetchAndCachePut(e).catch((()=>{}));let n,r=await s.cacheMatch(e);if(r)0;else{0;try{r=await a}catch(e){n=e}}if(!r)throw new t("no-response",{url:e.url,error:n});return r}}s(895);class C{constructor(e={}){this._statuses=e.statuses,this._headers=e.headers}isResponseCacheable(e){let t=!0;return this._statuses&&(t=this._statuses.includes(e.status)),this._headers&&t&&(t=Object.keys(this._headers).some((t=>e.headers.get(t)===this._headers[t]))),t}}class U{constructor(e){this.cacheWillUpdate=async({response:e})=>this._cacheableResponse.isResponseCacheable(e)?e:null,this._cacheableResponse=new C(e)}}function q(e){e.then((()=>{}))}class T{constructor(e,t,{onupgradeneeded:s,onversionchange:a}={}){this._db=null,this._name=e,this._version=t,this._onupgradeneeded=s,this._onversionchange=a||(()=>this.close())}get db(){return this._db}async open(){if(!this._db)return this._db=await new Promise(((e,t)=>{let s=!1;setTimeout((()=>{s=!0,t(new Error("The open request was blocked and timed out"))}),this.OPEN_TIMEOUT);const a=indexedDB.open(this._name,this._version);a.onerror=()=>t(a.error),a.onupgradeneeded=e=>{s?(a.transaction.abort(),a.result.close()):"function"==typeof this._onupgradeneeded&&this._onupgradeneeded(e)},a.onsuccess=()=>{const t=a.result;s?t.close():(t.onversionchange=this._onversionchange.bind(this),e(t))}})),this}async getKey(e,t){return(await this.getAllKeys(e,t,1))[0]}async getAll(e,t,s){return await this.getAllMatching(e,{query:t,count:s})}async getAllKeys(e,t,s){return(await this.getAllMatching(e,{query:t,count:s,includeKeys:!0})).map((e=>e.key))}async getAllMatching(e,{index:t,query:s=null,direction:a="next",count:n,includeKeys:r=!1}={}){return await this.transaction([e],"readonly",((i,c)=>{const o=i.objectStore(e),h=t?o.index(t):o,l=[],u=h.openCursor(s,a);u.onsuccess=()=>{const e=u.result;e?(l.push(r?e:e.value),n&&l.length>=n?c(l):e.continue()):c(l)}}))}async transaction(e,t,s){return await this.open(),await new Promise(((a,n)=>{const r=this._db.transaction(e,t);r.onabort=()=>n(r.error),r.oncomplete=()=>a(),s(r,(e=>a(e)))}))}async _call(e,t,s,...a){return await this.transaction([t],s,((s,n)=>{const r=s.objectStore(t),i=r[e].apply(r,a);i.onsuccess=()=>n(i.result)}))}close(){this._db&&(this._db.close(),this._db=null)}}T.prototype.OPEN_TIMEOUT=2e3;const k={readonly:["get","count","getKey","getAll","getAllKeys"],readwrite:["add","put","clear","delete"]};for(const[e,t]of Object.entries(k))for(const s of t)s in IDBObjectStore.prototype&&(T.prototype[s]=async function(t,...a){return await this._call(s,t,e,...a)});s(550);const N="cache-entries",L=e=>{const t=new URL(e,location.href);return t.hash="",t.href};class E{constructor(e){this._cacheName=e,this._db=new T("workbox-expiration",1,{onupgradeneeded:e=>this._handleUpgrade(e)})}_handleUpgrade(e){const t=e.target.result.createObjectStore(N,{keyPath:"id"});t.createIndex("cacheName","cacheName",{unique:!1}),t.createIndex("timestamp","timestamp",{unique:!1}),(async e=>{await new Promise(((t,s)=>{const a=indexedDB.deleteDatabase(e);a.onerror=()=>{s(a.error)},a.onblocked=()=>{s(new Error("Delete blocked"))},a.onsuccess=()=>{t()}}))})(this._cacheName)}async setTimestamp(e,t){const s={url:e=L(e),timestamp:t,cacheName:this._cacheName,id:this._getId(e)};await this._db.put(N,s)}async getTimestamp(e){return(await this._db.get(N,this._getId(e))).timestamp}async expireEntries(e,t){const s=await this._db.transaction(N,"readwrite",((s,a)=>{const n=s.objectStore(N).index("timestamp").openCursor(null,"prev"),r=[];let i=0;n.onsuccess=()=>{const s=n.result;if(s){const a=s.value;a.cacheName===this._cacheName&&(e&&a.timestamp<e||t&&i>=t?r.push(s.value):i++),s.continue()}else a(r)}})),a=[];for(const e of s)await this._db.delete(N,e.id),a.push(e.url);return a}_getId(e){return this._cacheName+"|"+L(e)}}class P{constructor(e,t={}){this._isRunning=!1,this._rerunRequested=!1,this._maxEntries=t.maxEntries,this._maxAgeSeconds=t.maxAgeSeconds,this._matchOptions=t.matchOptions,this._cacheName=e,this._timestampModel=new E(e)}async expireEntries(){if(this._isRunning)return void(this._rerunRequested=!0);this._isRunning=!0;const e=this._maxAgeSeconds?Date.now()-1e3*this._maxAgeSeconds:0,t=await this._timestampModel.expireEntries(e,this._maxEntries),s=await self.caches.open(this._cacheName);for(const e of t)await s.delete(e,this._matchOptions);this._isRunning=!1,this._rerunRequested&&(this._rerunRequested=!1,q(this.expireEntries()))}async updateTimestamp(e){await this._timestampModel.setTimestamp(e,Date.now())}async isURLExpired(e){if(this._maxAgeSeconds){return await this._timestampModel.getTimestamp(e)<Date.now()-1e3*this._maxAgeSeconds}return!1}async delete(){this._rerunRequested=!1,await this._timestampModel.expireEntries(1/0)}}class K{constructor(e={}){var t;this.cachedResponseWillBeUsed=async({event:e,request:t,cacheName:s,cachedResponse:a})=>{if(!a)return null;const n=this._isResponseDateFresh(a),r=this._getCacheExpiration(s);q(r.expireEntries());const i=r.updateTimestamp(t.url);if(e)try{e.waitUntil(i)}catch(e){0}return n?a:null},this.cacheDidUpdate=async({cacheName:e,request:t})=>{const s=this._getCacheExpiration(e);await s.updateTimestamp(t.url),await s.expireEntries()},this._config=e,this._maxAgeSeconds=e.maxAgeSeconds,this._cacheExpirations=new Map,e.purgeOnQuotaError&&(t=()=>this.deleteCacheAndMetadata(),m.add(t))}_getCacheExpiration(e){if(e===f())throw new t("expire-custom-caches-only");let s=this._cacheExpirations.get(e);return s||(s=new P(e,this._config),this._cacheExpirations.set(e,s)),s}_isResponseDateFresh(e){if(!this._maxAgeSeconds)return!0;const t=this._getDateHeaderTimestamp(e);if(null===t)return!0;return t>=Date.now()-1e3*this._maxAgeSeconds}_getDateHeaderTimestamp(e){if(!e.headers.has("date"))return null;const t=e.headers.get("date"),s=new Date(t).getTime();return isNaN(s)?null:s}async deleteCacheAndMetadata(){for(const[e,t]of this._cacheExpirations)await self.caches.delete(e),await t.delete();this._cacheExpirations=new Map}}function M(e,t){const s=t();return e.waitUntil(s),s}s(977);function A(e){if(!e)throw new t("add-to-cache-list-unexpected-type",{entry:e});if("string"==typeof e){const t=new URL(e,location.href);return{cacheKey:t.href,url:t.href}}const{revision:s,url:a}=e;if(!a)throw new t("add-to-cache-list-unexpected-type",{entry:e});if(!s){const e=new URL(a,location.href);return{cacheKey:e.href,url:e.href}}const n=new URL(a,location.href),r=new URL(a,location.href);return n.searchParams.set("__WB_REVISION__",s),{cacheKey:n.href,url:r.href}}class S{constructor(){this.updatedURLs=[],this.notUpdatedURLs=[],this.handlerWillStart=async({request:e,state:t})=>{t&&(t.originalRequest=e)},this.cachedResponseWillBeUsed=async({event:e,state:t,cachedResponse:s})=>{if("install"===e.type){const e=t.originalRequest.url;s?this.notUpdatedURLs.push(e):this.updatedURLs.push(e)}return s}}}class O{constructor({precacheController:e}){this.cacheKeyWillBeUsed=async({request:e,params:t})=>{const s=t&&t.cacheKey||this._precacheController.getCacheKeyForURL(e.url);return s?new Request(s):e},this._precacheController=e}}let D,W;async function I(e,s){let a=null;if(e.url){a=new URL(e.url).origin}if(a!==self.location.origin)throw new t("cross-origin-copy-response",{origin:a});const n=e.clone(),r={headers:new Headers(n.headers),status:n.status,statusText:n.statusText},i=s?s(r):r,c=function(){if(void 0===D){const e=new Response("");if("body"in e)try{new Response(e.body),D=!0}catch(e){D=!1}D=!1}return D}()?n.body:await n.blob();return new Response(c,i)}class H extends b{constructor(e={}){e.cacheName=p(e.cacheName),super(e),this._fallbackToNetwork=!1!==e.fallbackToNetwork,this.plugins.push(H.copyRedirectedCacheableResponsesPlugin)}async _handle(e,t){const s=await t.cacheMatch(e);return s||(t.event&&"install"===t.event.type?await this._handleInstall(e,t):await this._handleFetch(e,t))}async _handleFetch(e,s){let a;if(!this._fallbackToNetwork)throw new t("missing-precache-entry",{cacheName:this.cacheName,url:e.url});return a=await s.fetch(e),a}async _handleInstall(e,s){this._useDefaultCacheabilityPluginIfNeeded();const a=await s.fetch(e);if(!await s.cachePut(e,a.clone()))throw new t("bad-precaching-response",{url:e.url,status:a.status});return a}_useDefaultCacheabilityPluginIfNeeded(){let e=null,t=0;for(const[s,a]of this.plugins.entries())a!==H.copyRedirectedCacheableResponsesPlugin&&(a===H.defaultPrecacheCacheabilityPlugin&&(e=s),a.cacheWillUpdate&&t++);0===t?this.plugins.push(H.defaultPrecacheCacheabilityPlugin):t>1&&null!==e&&this.plugins.splice(e,1)}}H.defaultPrecacheCacheabilityPlugin={cacheWillUpdate:async({response:e})=>!e||e.status>=400?null:e},H.copyRedirectedCacheableResponsesPlugin={cacheWillUpdate:async({response:e})=>e.redirected?await I(e):e};class j{constructor({cacheName:e,plugins:t=[],fallbackToNetwork:s=!0}={}){this._urlsToCacheKeys=new Map,this._urlsToCacheModes=new Map,this._cacheKeysToIntegrities=new Map,this._strategy=new H({cacheName:p(e),plugins:[...t,new O({precacheController:this})],fallbackToNetwork:s}),this.install=this.install.bind(this),this.activate=this.activate.bind(this)}get strategy(){return this._strategy}precache(e){this.addToCacheList(e),this._installAndActiveListenersAdded||(self.addEventListener("install",this.install),self.addEventListener("activate",this.activate),this._installAndActiveListenersAdded=!0)}addToCacheList(e){const s=[];for(const a of e){"string"==typeof a?s.push(a):a&&void 0===a.revision&&s.push(a.url);const{cacheKey:e,url:n}=A(a),r="string"!=typeof a&&a.revision?"reload":"default";if(this._urlsToCacheKeys.has(n)&&this._urlsToCacheKeys.get(n)!==e)throw new t("add-to-cache-list-conflicting-entries",{firstEntry:this._urlsToCacheKeys.get(n),secondEntry:e});if("string"!=typeof a&&a.integrity){if(this._cacheKeysToIntegrities.has(e)&&this._cacheKeysToIntegrities.get(e)!==a.integrity)throw new t("add-to-cache-list-conflicting-integrities",{url:n});this._cacheKeysToIntegrities.set(e,a.integrity)}if(this._urlsToCacheKeys.set(n,e),this._urlsToCacheModes.set(n,r),s.length>0){const e=`Workbox is precaching URLs without revision info: ${s.join(", ")}\nThis is generally NOT safe. Learn more at https://bit.ly/wb-precache`;console.warn(e)}}}install(e){return M(e,(async()=>{const t=new S;this.strategy.plugins.push(t);for(const[t,s]of this._urlsToCacheKeys){const a=this._cacheKeysToIntegrities.get(s),n=this._urlsToCacheModes.get(t),r=new Request(t,{integrity:a,cache:n,credentials:"same-origin"});await Promise.all(this.strategy.handleAll({params:{cacheKey:s},request:r,event:e}))}const{updatedURLs:s,notUpdatedURLs:a}=t;return{updatedURLs:s,notUpdatedURLs:a}}))}activate(e){return M(e,(async()=>{const e=await self.caches.open(this.strategy.cacheName),t=await e.keys(),s=new Set(this._urlsToCacheKeys.values()),a=[];for(const n of t)s.has(n.url)||(await e.delete(n),a.push(n.url));return{deletedURLs:a}}))}getURLsToCacheKeys(){return this._urlsToCacheKeys}getCachedURLs(){return[...this._urlsToCacheKeys.keys()]}getCacheKeyForURL(e){const t=new URL(e,location.href);return this._urlsToCacheKeys.get(t.href)}async matchPrecache(e){const t=e instanceof Request?e.url:e,s=this.getCacheKeyForURL(t);if(s){return(await self.caches.open(this.strategy.cacheName)).match(s)}}createHandlerBoundToURL(e){const s=this.getCacheKeyForURL(e);if(!s)throw new t("non-precached-url",{url:e});return t=>(t.request=new Request(e),t.params={cacheKey:s,...t.params},this.strategy.handle(t))}}const F=()=>(W||(W=new j),W);class B extends n{constructor(e,t){super((({request:s})=>{const a=e.getURLsToCacheKeys();for(const e of function*(e,{ignoreURLParametersMatching:t=[/^utm_/,/^fbclid$/],directoryIndex:s="index.html",cleanURLs:a=!0,urlManipulation:n}={}){const r=new URL(e,location.href);r.hash="",yield r.href;const i=function(e,t=[]){for(const s of[...e.searchParams.keys()])t.some((e=>e.test(s)))&&e.searchParams.delete(s);return e}(r,t);if(yield i.href,s&&i.pathname.endsWith("/")){const e=new URL(i.href);e.pathname+=s,yield e.href}if(a){const e=new URL(i.href);e.pathname+=".html",yield e.href}if(n){const e=n({url:r});for(const t of e)yield t.href}}(s.url,t)){const t=a.get(e);if(t)return{cacheKey:t}}}),e.strategy)}}s(144);var $,V,G=s(86),Q=s.n(G);Boolean(self.registration&&self.registration.navigationPreload)&&self.addEventListener("activate",(e=>{e.waitUntil(self.registration.navigationPreload.enable().then((()=>{$&&self.registration.navigationPreload.setHeaderValue($)})))})),function(e){F().precache(e)}([{'revision':null,'url':'/assets/public/278d36981969a18c141b.eot?99511044'},{'revision':null,'url':'/assets/public/2a7a066d329dc4bca001.svg?99511044'},{'revision':null,'url':'/assets/public/621874e3f13ded700b5a.woff2?99511044'},{'revision':'0faa94d37352c913c8aa334abff87056','url':'/assets/public/application-bundle.js'},{'revision':'fc73241165b46df46ef18b47f9e1ed7c','url':'/assets/public/application-bundle.js.LICENSE.txt'},{'revision':'101041fcdaae50160976d03083e4037a','url':'/assets/public/application.css'},{'revision':'1040658c2ca3bf10bb6c613cc6101648','url':'/assets/public/archive-bundle.js'},{'revision':'c286ca7e714d397593b1a8bc7073d9ab','url':'/assets/public/archive-bundle.js.LICENSE.txt'},{'revision':null,'url':'/assets/public/b49c722806f2e9810a75.woff?99511044'},{'revision':null,'url':'/assets/public/d9ccf1b12d76fe41fb8f.ttf?99511044'},{'revision':'63c301d85a977e1ce7354c754311fe71','url':'/assets/public/pages-bundle.js'},{'revision':'cdfce3512e633c2ab5f9be7d007e869b','url':'/assets/public/pages-bundle.js.LICENSE.txt'},{'revision':'fb19f0b03e7a344d4d8c4c45c8a77b62','url':'/assets/public/posts-bundle.js'},{'revision':'f2f718882f3deaa36d27c6d3d4e43a26','url':'/assets/public/posts-bundle.js.LICENSE.txt'}]),function(e){const t=F();l(new B(t,e))}(V);const J="offline-fallbacks",z="/offline.html";self.addEventListener("install",(async e=>{e.waitUntil(caches.open(J).then((e=>e.addAll([z,Q().src]))))})),function(e={}){const t=`${e.cachePrefix||"google-fonts"}-stylesheets`,s=`${e.cachePrefix||"google-fonts"}-webfonts`,a=e.maxAgeSeconds||31536e3,n=e.maxEntries||30;l((({url:e})=>"https://fonts.googleapis.com"===e.origin),new x({cacheName:t})),l((({url:e})=>"https://fonts.gstatic.com"===e.origin),new R({cacheName:s,plugins:[new U({statuses:[0,200]}),new K({maxAgeSeconds:a,maxEntries:n})]}))}();const X=new class extends b{constructor(e={}){super(e),this.plugins.some((e=>"cacheWillUpdate"in e))||this.plugins.unshift(v),this._networkTimeoutSeconds=e.networkTimeoutSeconds||0}async _handle(e,s){const a=[];const n=[];let r;if(this._networkTimeoutSeconds){const{id:t,promise:i}=this._getTimeoutPromise({request:e,logs:a,handler:s});r=t,n.push(i)}const i=this._getNetworkPromise({timeoutId:r,request:e,logs:a,handler:s});n.push(i);const c=await s.waitUntil((async()=>await s.waitUntil(Promise.race(n))||await i)());if(!c)throw new t("no-response",{url:e.url});return c}_getTimeoutPromise({request:e,logs:t,handler:s}){let a;return{promise:new Promise((t=>{a=setTimeout((async()=>{t(await s.cacheMatch(e))}),1e3*this._networkTimeoutSeconds)})),id:a}}async _getNetworkPromise({timeoutId:e,request:t,logs:s,handler:a}){let n,r;try{r=await a.fetchAndCachePut(t)}catch(e){n=e}return e&&clearTimeout(e),!n&&r||(r=await a.cacheMatch(t)),r}}({cacheName:"cached-navigations"});l(new class extends n{constructor(e,{allowlist:t=[/./],denylist:s=[]}={}){super((e=>this._match(e)),e),this._allowlist=t,this._denylist=s}_match({url:e,request:t}){if(t&&"navigate"!==t.mode)return!1;const s=e.pathname+e.search;for(const e of this._denylist)if(e.test(s))return!1;return!!this._allowlist.some((e=>e.test(s)))}}((async e=>{try{return await X.handle(e)}catch(e){return caches.match(z,{cacheName:J})}})));let Y=new x({cacheName:"assets",plugins:[new U({statuses:[200]})]});l((({request:e})=>"style"===e.destination||"script"===e.destination||"worker"===e.destination),Y),l(new RegExp("/.*\\.json"),Y);let Z=new R({cacheName:"images",plugins:[new U({statuses:[200]}),new K({maxEntries:36})]});l((({request:e})=>"image"===e.destination),(e=>Z.handle(e).catch((()=>caches.match(Q().src,{cacheName:J})))))})()})();