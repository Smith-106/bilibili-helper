var x={16:"360P 流畅",32:"480P 标清",64:"720P 准高清",80:"1080P 高清",112:"1080P 高码率",120:"4K 超高清",125:"HDR 真彩"},B="bilibili-helper-host",G="bilibili-helper-ext-content-script",Q="ffmpeg.worker.js",Y="ffmpeg-core.js",S="ffmpeg-core.wasm",$="ffmpeg-core.worker.js",P="//api.bilibili.com/x/player/wbi/playurl";var V={credentials:"include"},E={OK:0,FAILED_TO_FETCH:-1,INVALID_RESPONSE:-2,VIP_ONLY:-10403,UNKNOWN:-99999};var f=(...e)=>{},w=()=>location.hostname==="www.bilibili.com"||location.hostname==="bilibili.com",O=window.navigator.userAgent.indexOf("Edg/")!==-1,j=()=>/\/video\/(av|bv)[0-9a-zA-Z]+/i.test(window.location.pathname),y=()=>/\/bangumi\/play\/\S+/i.test(window.location.pathname),C=e=>{if(!e)return"未知大小";let i=1024*1024*1024,d=1024*1024,o=1024;return e>=i?`${(e/i).toFixed(2)}GB`:e>=d?`${(e/d).toFixed(2)}MB`:e>=o?`${(e/o).toFixed(2)}KB`:e+"B"},M=()=>localStorage.bilibili_helper_download_mode!=="normal",k=()=>localStorage.bilibili_helper_merge_mode!=="off",h=()=>localStorage.bilibili_helper_show==="hide",F=()=>{let{manifest:e,baseUrl:i}=JSON.parse(document.getElementById(G).dataset.internals);return{...e,baseUrl:i}};var A=e=>new Promise(i=>{let d=0,o=setInterval(()=>{d++;let a=document.querySelector(e);(a||d>100)&&(clearInterval(o),o=null,i(a))},300)}),X=async e=>{await A("#bilibili-player .squirtle-quality-wrap, #bilibili-player .bpx-player-ctrl-quality")&&e()},H=e=>{e.customElements.define(B,class extends HTMLDivElement{constructor(){super()}},{extends:"div"})},I=()=>{let e=document.getElementById(B);if(e){let i=e.shadowRoot.querySelector("#bilibliHelperLogs");i&&(i.innerHTML="")}},v=(...e)=>{f("[B站下载助手]",...e);let i=document.getElementById(B);if(i){let d=i.shadowRoot.querySelector("#bilibliHelperLogs");if(d){let o=`<p>${e.map(a=>{if(a.message)return esc(a.message);if(typeof a=="object")try{return esc(JSON.stringify(a))}catch{return esc(a)}return esc(a)}).join(" ")}</p>`;d.innerHTML+=o,d.scrollTop=d.scrollHeight}}},m0=async()=>{let e=await A(".squirtle-quality-select-list li.active, .bpx-player-ctrl-quality-menu .bpx-state-active");if(!e)return null;let i=+e.dataset.value;if(i===0){let d=e.parentElement.querySelector("li:first-child");d&&(i=+(d.dataset.value||0))}return f("quality from player is",i),i};var z=async()=>{let e=localStorage.bilibili_player_settings&&`${localStorage.bilibili_player_settings}`!="undefined"&&+JSON.parse(localStorage.bilibili_player_settings).setting_config.defquality||120;return e=await m0()||e,e};var u0="0.12.1",I0=`https://unpkg.com/@ffmpeg/core@${u0}/dist/umd/ffmpeg-core.js`,u;(function(e){e.LOAD="LOAD",e.EXEC="EXEC",e.WRITE_FILE="WRITE_FILE",e.READ_FILE="READ_FILE",e.DELETE_FILE="DELETE_FILE",e.RENAME="RENAME",e.CREATE_DIR="CREATE_DIR",e.LIST_DIR="LIST_DIR",e.DELETE_DIR="DELETE_DIR",e.ERROR="ERROR",e.DOWNLOAD="DOWNLOAD",e.PROGRESS="PROGRESS",e.LOG="LOG"})(u||(u={}));var b0=(()=>{let e=0;return()=>e++})(),z0=new Error("unknown message type"),v0=new Error("ffmpeg is not loaded, call `await ffmpeg.load()` first"),g0=new Error("called FFmpeg.terminate()"),D0=new Error("failed to import ffmpeg-core.js"),e0=class{#e=null;#a={};#d={};#o=[];#t=[];loaded=!1;constructor({worker:e}){this.#e=e,this.#r()}#r=()=>{this.#e&&(this.#e.onmessage=({data:{id:e,type:i,data:d}})=>{switch(i){case u.LOAD:this.loaded=!0,this.#a[e](d);break;case u.EXEC:case u.WRITE_FILE:case u.READ_FILE:case u.DELETE_FILE:case u.RENAME:case u.CREATE_DIR:case u.LIST_DIR:case u.DELETE_DIR:this.#a[e](d);break;case u.LOG:this.#o.forEach(o=>o(d));break;case u.PROGRESS:this.#t.forEach(o=>o(d));break;case u.ERROR:this.#d[e](d);break}delete this.#a[e],delete this.#d[e]})};#i=({type:e,data:i},d=[])=>this.#e?new Promise((o,a)=>{let r=b0();this.#e&&this.#e.postMessage({id:r,type:e,data:i},d),this.#a[r]=o,this.#d[r]=a}):Promise.reject(v0);on(e,i){e==="log"?this.#o.push(i):e==="progress"&&this.#t.push(i)}off(e,i){e==="log"?this.#o=this.#o.filter(d=>d!==i):e==="progress"&&(this.#t=this.#t.filter(d=>d!==i))}load=(e={})=>(this.#e||(this.#e=new Worker(new URL("./worker.js",import.meta.url),{type:"module"}),this.#r()),this.#i({type:u.LOAD,data:e}));exec=(e,i=-1)=>this.#i({type:u.EXEC,data:{args:e,timeout:i}});terminate=()=>{let e=Object.keys(this.#d);for(let i of e)this.#d[i](g0),delete this.#d[i],delete this.#a[i];this.#e&&(this.#e.terminate(),this.#e=null,this.loaded=!1)};writeFile=(e,i)=>{let d=[];return i instanceof Uint8Array&&d.push(i.buffer),this.#i({type:u.WRITE_FILE,data:{path:e,data:i}},d)};readFile=(e,i="binary")=>this.#i({type:u.READ_FILE,data:{path:e,encoding:i}});deleteFile=e=>this.#i({type:u.DELETE_FILE,data:{path:e}});rename=(e,i)=>this.#i({type:u.RENAME,data:{oldPath:e,newPath:i}});createDir=e=>this.#i({type:u.CREATE_DIR,data:{path:e}});listDir=e=>this.#i({type:u.LIST_DIR,data:{path:e}});deleteDir=e=>this.#i({type:u.DELETE_DIR,data:{path:e}})},f0=new Error("failed to get response body reader"),E0=new Error("failed to complete download"),B0="Content-Length",x0=e=>new Promise((i,d)=>{let o=new FileReader;o.onload=()=>{let{result:a}=o;a instanceof ArrayBuffer?i(new Uint8Array(a)):i(new Uint8Array)},o.onerror=a=>{d(Error(`File could not be read! Code=${a?.target?.error?.code||-1}`))},o.readAsArrayBuffer(e)}),D=async e=>{let i;if(typeof e=="string")/data:_data\/([a-zA-Z]*);base64,([^"]*)/.test(e)?i=atob(e.split(",")[1]).split("").map(d=>d.charCodeAt(0)):i=await(await fetch(e)).arrayBuffer();else if(e instanceof URL)i=await(await fetch(e)).arrayBuffer();else if(e instanceof File||e instanceof Blob)i=await x0(e);else return new Uint8Array;return new Uint8Array(i)};var C0=async(e,i)=>{let d=await fetch(e),o;try{let a=parseInt(d.headers.get(B0)||"-1"),r=d.body?.getReader();if(!r)throw f0;let N=[],t=0;for(;;){let{done:l,value:p}=await r.read(),m=p?p.length:0;if(l){if(a!=-1&&a!==t)throw E0;i&&i({url:e,total:a,received:t,delta:m,done:l});break}N.push(p),t+=m,i&&i({url:e,total:a,received:t,delta:m,done:l})}let n=new Uint8Array(t),c=0;for(let l of N)n.set(l,c),c+=l.length;o=n.buffer}catch(a){console.log("failed to send download progress event: ",a),o=await d.arrayBuffer(),i&&i({url:e,total:o.byteLength,received:o.byteLength,delta:0,done:!0})}return o},J=async(e,i,d=!1,o)=>{let a=d?await C0(e,o):await(await fetch(e)).arrayBuffer(),r=new Blob([a],{type:i});return URL.createObjectURL(r)};var W=async e=>{try{if(e==="next2025"&&window.__PLAYURL_HYDRATE_DATA__)return{data:window.__PLAYURL_HYDRATE_DATA__,code:0,status:"success"};let d=await(await window.fetch(window.location.href,V)).text(),o=d.match(/<script>window.__INITIAL_STATE__=(.+?)<\/script>/);if(o&&o[1]){let N=JSON.parse(o[1].replace(";(function(){var s;(s=document.currentScript||document.scripts[document.scripts.length-1]).parentNode.removeChild(s);}());",""));return f("initial state:",N),{code:E.OK,data:N}}let a=d.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/);if(a&&a[1]){let t=JSON.parse(a[1]).props.pageProps.dehydratedState.queries[0].state;return t.status==="success"&&(t.code=E.OK),f("initial state:",t),t}return{code:E.INVALID_RESPONSE,message:"获取视频信息失败，可以尝试清除浏览器cookies和缓存后重试"}}catch(i){return f("获取视频信息失败：",i),await networkErrorHandler()}},q={ffmpegInstance:null,ffmpegUsedFiles:new Set,blobUrls:new Set},q0=e=>{q.blobUrls.add(e)},T0=async e=>{if(q.ffmpegInstance)return q.ffmpegInstance;let i=new e0({worker:new Worker(await J(`${e}/${Q}`,"text/javascript"),{type:"module"})});i.on("log",({message:d})=>{f("ffmpeg log:",d)});try{await i.load({coreURL:await J(`${e}/${Y}`,"text/javascript"),wasmURL:await J(`${e}/${S}`,"application/wasm"),workerURL:await J(`${e}/${$}`,"text/javascript")})}catch(d){f("ffmpeg load error:",d)}return q.ffmpegInstance=i,i},_0=async(e,i,d)=>{let o=`${Date.now()}${Math.random()}`,a=await T0(e),r=`${o}_audio.mp4`,N=`${o}_video.mp4`,t=`${o}_merged.mp4`;await a.writeFile(r,await D(i)),await a.writeFile(N,await D(d)),await a.exec(`-i ${N} -i ${r} -vcodec copy -acodec copy ${t}`.split(" "));let n=await a.readFile(t),c=()=>{a.deleteFile(r).catch(l=>f(l)),a.deleteFile(N).catch(l=>f(l))};return q.ffmpegUsedFiles.add(t),[n.buffer,c]};var U=(e,i,d)=>{let o=i,a=i;if(o.dash||a.durl){let{dash:r,accept_description:N,accept_quality:t,video_codecid:n,support_formats:c}=o,{durl:l}=a;t&&t.forEach((s,b)=>{x[s]=N?.[b]||x[s]}),Object.values(c).forEach(s=>{x[s.quality]=s.new_description||s.display_desc||x[s.quality]}),v("下载链接:");let p=r?.video?.find(s=>`${s.codecid}`==`${n}`&&`${s.id}`==`${d}`)??r?.video?.[0],m=r?.audio?.[0];return m&&(v("-".repeat(20)),v("音频："),v("&nbsp;&nbsp;&nbsp;&nbsp;主链接：",m.base_url),m.backup_url&&m.backup_url.length&&m.backup_url.forEach((s,b)=>{v(`&nbsp;&nbsp;&nbsp;&nbsp;备用链接 ${b+1}：`,s)})),p&&(v("-".repeat(20)),v("视频："),v("&nbsp;&nbsp;&nbsp;&nbsp;主链接：",p.base_url),p.backup_url&&p.backup_url.length&&p.backup_url.forEach((s,b)=>{v(`&nbsp;&nbsp;&nbsp;&nbsp;备用链接 ${b+1}：`,s)})),l?.length&&(v("-".repeat(20)),l.forEach((s,b)=>{v(`视频分段${b+1}：`),v("&nbsp;&nbsp;&nbsp;&nbsp;主链接：",s.url),s.backup_url&&s.backup_url.length&&s.backup_url.forEach((g,_)=>{v(`&nbsp;&nbsp;&nbsp;&nbsp;备用链接 ${_+1}：`,g)})})),{code:E.OK,dash:m&&p?{audio:m,video:p}:void 0,durl:a.durl,qualityDescription:x[p?.id??d]}}else return e?e.code===E.VIP_ONLY?(e.message="该视频只能登陆大会员账号之后下载，如登录后仍然报错，可以尝试清除浏览器cookies和缓存后重试",e):typeof e.code<"u"?e:{code:E.INVALID_RESPONSE,message:"该视频暂时不支持下载，可以尝试清除浏览器cookies和缓存后重试"}:(f("params:",[e,i,d]),{code:E.UNKNOWN,message:"未知错误"})},i0=async(e=120,i)=>U(null,i,e),d0=async(e,i,d,o=120)=>{let a=`${P}?qn=${o}&fnver=0&fnval=4048&fourk=1&avid=${e}&bvid=${i}&cid=${d}`,N=await(await window.fetch(a,V)).json();if(f("视频信息",N),N.code!==E.OK)return U({code:N.code,message:N.message},null,o);let t=N.data;return U(null,t,o)},a0=(e,i,d,o)=>{let a=new Blob([e],{type:"application/octet-stream"}),r=document.createElement("a"),N=URL.createObjectURL(a);q0(N),r.setAttribute("href",N),r.setAttribute("download",i),r.setAttribute("style","margin-left:10px"),r.innerHTML="（如果没有弹出下载，请点击这里保存）",d.appendChild(r);let t=new MouseEvent("click",{bubbles:!0,cancelable:!0,view:window});r.dispatchEvent(t),a=null,o?.()},o0=async(e,i,d)=>{let o=null;try{let a=await window.fetch(e),r=a.headers.get("content-length"),N=i||parseInt(r,10),t=0;return o=setInterval(()=>{d(t,N)},1e3),await new Response(new ReadableStream({start(c){let l=a.body.getReader(),p=()=>{l.read().then(({done:m,value:s})=>{if(m){c.close();return}t+=s.byteLength,c.enqueue(s),p()}).catch(m=>{c.error(m)})};p()}})).blob()}finally{o&&(clearInterval(o),o=null)}},R=async(e,{url:i,size:d},o,a)=>{e.classList.add("disabled");try{let r=await o0(i,d,(t,n)=>{let g=n?Math.ceil(t/n*100):0;a.innerHTML=` 正在下载 - ${t}/${n||"?"}${n?" - "+g+"%":""}<span class="b-bar${n?"":" b-indet"}"><i style="width:${n?g:35}%"></i></span>`});a.innerHTML=" 已下载完成";let N=(new URL(i).pathname.toLowerCase().match(/\.[a-z0-9]+?$/)||[".mp4"])[0];N==".m4s"&&(N=".mp4"),a0(r,o+N,a,()=>{r=null})}finally{e.classList.remove("disabled")}},t0=async(e=!0,i,d,o,a)=>{if(d.length===1)return R(i,d[0],o,a);if(d.length>2)throw new Error("该视频分段过多，请在兼容模式下载");i.classList.add("disabled");let r=d.map(async({url:N,size:t},n)=>{let c=t,l=e?`${n===0?"音频":"视频"}`:`分段${n+1}`,p=document.createElement("li"),bT=document.createElement("span"),bR=document.createElement("span"),bRi=document.createElement("i");bR.className="b-bar",bR.appendChild(bRi),p.appendChild(bT),p.appendChild(bR),a.appendChild(p);let m=await o0(N,t,(s,b)=>{let g=b?Math.ceil(s/b*100):0;bT.textContent=`${l} (${C(c||t)}) 正在下载 - ${s}/${b||"?"}${b?" - "+g+"%":""}`,bR.classList.toggle("b-indet",!b),bRi.style.width=(b?g:0)+"%",c=b});return bR.classList.remove("b-indet"),bRi.style.width="100%",bT.textContent=`${l} (${C(c)}) 已下载完成，等待合并`,m});try{let[N,t]=await Promise.all(r);a.innerHTML="合并中，所需时间取决于视频大小...<span class=\"b-bar b-indet\"><i></i></span>";let{baseUrl:n}=F(),[c,l]=await _0(n,N,t);a.innerHTML="已完成",a0(c,o+".mp4",a),l(),N=null,t=null,c=null}finally{i.classList.remove("disabled")}};window.addEventListener("beforeunload",async()=>{await Promise.all([...Array.from(q.ffmpegUsedFiles).map(e=>ffmpeg.deleteFile(e).catch(i=>(f(i),Promise.resolve()))),...Array.from(q.blobUrls).map(e=>{try{URL.revokeObjectURL(e)}catch(i){f(i)}return Promise.resolve()}),new Promise(e=>{try{q.ffmpegInstance.terminate()}catch(i){f(i)}e()})])},!0);var r0=(e,i,d)=>{let o={current:!1};setTimeout(()=>{o.current||d()},3e3),window.XMLHttpRequest=class extends i{constructor(){super(),this.addEventListener("load",()=>{if(this.responseURL.includes("/playurl")){let r=new URLSearchParams(this.responseURL),N=r.get("avid"),t=r.get("cid"),n=r.get("bvid"),c=r.get("ep_id"),l=JSON.parse(this.responseText),p=l.result?l.result.video_info||l.result:l.data;p.avid=+N,p.cid=+t,p.bvid=n?+n:void 0,p.ep_id=c?+c:void 0,f("视频信息:",p),e(p),o.current=!0}},{capture:!0,passive:!0})}}};var N0=`p,
a,
div,
span,
li,
i,
b,
strong,
input,
button,
label {
  font-size: inherit;
}
li {
  margin-bottom: 5px;
}
p {
  margin: 0;
  line-height: 1.5;
}
h1 {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
}
h3 {
  font-size: 16px;
  margin: 1em 0;
}
#title {
  font-size: 16px;
  font-weight: normal;
}
#content {
  display: flex;
  width: 100%;
  font-size: 14px;
  position: relative;
}
a {
  color: #00a1d6 !important;
  text-decoration: none;
}
a:hover {
  text-decoration: underline;
}
a.disabled {
  color: #666 !important;
}
a.disabled:hover {
  text-decoration: none;
  cursor: not-allowed;
}
#side-bar {
  flex: 3;
  padding: 20px;
  border-right: 1px solid #ccc;
  margin-right: -1px;
}
#main {
  flex: 7;
  padding: 20px;
  border-left: 1px solid #ccc;
}
#notice-frame {
  width: 100%;
  padding: 0;
}
.donate {
  border-top: 1px solid #ccc;
  padding-top: 10px;
}
.setting-item {
  margin-bottom: 8px;
}
.setting-item .label {
  font-weight: bold;
  width: 6em;
  display: inline-block;
  text-align: right;
}
.desc {
  padding-left: 6em;
}
#actions {
  position: absolute;
  right: 0;
  top: 0;
}
.btn-large {
  border: 0 none;
  background: #f45a8d;
  border-radius: 6px;
  color: #fff;
  padding: 10px 20px;
}
#toggle {
  border-radius: 0 0 0 6px;
  outline: none;
  cursor: pointer;
}
.hide #side-bar {
  display: none;
}
.hide #main {
  display: none;
}
.hide #toggle {
  border-radius: 6px 0 0 0;
}
.hide #actions {
  position: static;
}

a.btn {
  border: 0 none;
  background: #f45a8d;
  text-decoration: none !important;
  color: #fff !important;
  border-radius: 3px;
  padding: 5px 10px;
  display: inline-block;
}
.settings {
  border-left: 5px solid #ccc;
  background: #eee;
  padding: 16px 16px 8px 0;
}
.size {
  margin: 0 5px;
}
#bilibliHelperLogs {
  margin-top: 10px;
  max-width: 600px;
  max-height: 400px;
  overflow: auto;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
  line-height: 1.2;
  background: rgb(50, 50, 50);
  color: rgb(154, 180, 90);
  white-space: normal;
  word-break: break-all;
  word-wrap: break-word;
  font-size: 12px;
}
:focus-visible{outline: 2px solid #00a1d6;outline-offset: 2px}
#content{transition: opacity .22s ease, transform .22s ease}
.hide #content{opacity: 0;pointer-events: none}
#durls{max-height: 220px;overflow: auto;margin-top: 4px}
#durls li, #batch-progress li{transition: background .15s ease;border-radius: 4px;padding: 2px 4px;animation: b-fade .25s ease}
#durls li:hover, #batch-progress li:hover{background: #f7f9fa}
@keyframes b-fade{from{opacity: 0;transform: translateY(2px)}to{opacity: 1;transform: none}}
.progress{font-size: 12px;color: #5b6b7b}
.b-ep{display: inline-block;max-width: 58ch;vertical-align: bottom;overflow: hidden;text-overflow: ellipsis;white-space: nowrap}
.b-ok{color: #2ba471}
.b-fail{color: #e35d5d}
.b-skip{color: #b58500}
.b-bar{position: relative;display: block;height: 4px;background: #e8e8ea;border-radius: 2px;overflow: hidden;margin-top: 3px;min-width: 160px}
.b-bar>i{position: absolute;left: 0;top: 0;bottom: 0;width: 0;background: #f45a8d;transition: width .3s ease;border-radius: 2px}
.b-bar.b-indet>i{width: 35%!important;animation: b-indet 1.1s ease-in-out infinite}
@keyframes b-indet{0%{left: -40%}100%{left: 105%}}
.b-running{opacity: .75;cursor: progress;pointer-events: none}
.b-celebrate{animation: b-pulse .7s ease;color: #2ba471}
@keyframes b-pulse{0%{transform: scale(1.08)}100%{transform: scale(1)}}
a.btn, .btn-large, .btn-ghost{transition: filter .15s ease, border-color .15s ease, color .15s ease}
.btn-large:hover{filter: brightness(1.1)}
.btn-large:active{filter: brightness(.95)}
.btn-ghost{background: #fff;border: 1px solid #ccc;color: #5b6b7b;border-radius: 3px;padding: 6px 12px;cursor: pointer}
.btn-ghost:hover{border-color: #f45a8d;color: #f45a8d}
.beg{margin-top: 14px;font-size: 12px;color: #8a939b}
#title{word-break: break-all}
@media (max-width: 900px){#side-bar{display: none}#main{flex: 1;border-left: 0;margin-left: 0;padding: 14px 16px}}
.b-copy{margin-left: 8px;font-size: 12px;cursor: pointer}
`;var n0=`<h1 style="margin-top: 0;">B站下载助手</h1>
<p style="margin-bottom: 10px;"><a target="_blank" href="https://docs.qq.com/doc/DQ2lhaWRpS0tubVVF">使用教程及常见问题解答</a></p>
<div class="settings">
  <div class="setting-item">
    <span class="label">清晰度：</span>
    <span>请在页面中B站自己的播放器内切换清晰度</span>
  </div>
  <div class="setting-item">
    <span class="label">下载模式：</span>
    <label><input id="setting-download-mode-advanced" checked name="setting-download-mode" type="radio" /> 高级</label>
    <label><input id="setting-download-mode-normal" name="setting-download-mode" type="radio" /> 兼容</label>
    <p class="desc">高级模式支持自动重命名和合并下载，但会占用较大的系统运行内存<br />兼容模式直接使用浏览器的默认下载，资源占用很小，但不支持自动重命名和合并下载</p>
  </div>
  <div class="setting-item" id="setting-advanced">
    <span class="label">合并下载：</span>
    <label><input id="setting-merge-on" checked name="setting-merge" type="radio"> 开</label>
    <label><input id="setting-merge-off" name="setting-merge" type="radio"> 关</label>
    <p class="desc">高级模式下载过程中请<strong style="color: red;">不要</strong>刷新或关闭页面，也<strong
        style="color: red;">不要</strong>切换分集和清晰度</p>
  </div>
</div>`;var l0=({title:e,code:i,message:d,quality:o,dash:a,durl:r})=>{if(i!==E.OK)return`<strong>${esc(d)}</strong>`;let N=o?`[${o}] `:"";return a||r?`${N}<strong>${esc(e)}</strong> 的下载地址：`:`<strong>出错了:( ${esc(d)}</strong>`},L=({title:e,code:i,dash:d,durl:o})=>{if(i!==E.OK)return"";let a=!!d,r=[];if(a?r=[{url:d.audio.base_url,size:d.audio.size},{url:d.video.base_url,size:d.video.size}]:r=o,!M())return r.map((N,t)=>{let n=a?`${e}_${t===0?"音频":"视频"}`:`${e}_分段${t+1}`,c=a?`${t===0?"音频":"视频"}`:`分段${t+1}`;return`
          <li>
            <a title="${esc(n)}" download="${esc(n)}.mp4" href="${N.url}">${esc(c)}（请点右键选择链接另存为，直接点击无法下载）</a>
            <span class="size">(${C(N.size)})</span>
          </li>
        `}).join("");if(M()&&(!k()||!a))return r.map((N,t)=>{let n=encodeURIComponent(JSON.stringify(N)),c=a?`${e}_${t===0?"音频":"视频"}`:`${e}_分段${t+1}`,l=a?`${t===0?"音频":"视频"}`:`分段${t+1}`;return`
          <li>
            <a role="button" title="${esc(c)}" mode="advanced" merge="off" href="#nogo" durl="${n}">${esc(l)}</a>
            <span class="size">(${C(N.size)})</span>
            <span durl="${n}" class="progress"></span>
          </li>
        `}).join("");if(M()&&a&&k()){let N=encodeURIComponent(JSON.stringify(r)),t=0;return r.forEach(n=>t+=n.size),`
      <li>
        <a role="button" title="${esc(e)}" durls="${N}" mode="advanced" type="${a?"a+v":"v"}" merge="on" href="#nogo">合并下载</a>
        <span class="size">(共${C(t)})</span>
        <ul style="margin-top: 8px;" durls="${N}" class="progress"></ul>
      </li>
    `}},J0=e=>{let i=e.getElementById("notice-frame");i.onload=()=>{i.contentWindow.postMessage({action:"getHeight"},"https://csser.top");let d=F();i.contentWindow.postMessage({action:"setVersion",version:{name:d.version,code:parseInt(d.version.replace(/\./g,""),10)}},"https://csser.top"),i.contentWindow.postMessage({action:"setTheme",theme:"null"},"https://csser.top")},window.addEventListener("message",d=>{if(d.origin==="https://csser.top"&&d.data&&d.data.action==="reportHeight"&&(i.style.height=d.data.height+10+"px"),d.origin==="https://csser.top"&&d.data&&d.data.action==="showBilibilihelperindooorsmanNoticeDialog"){let o=d.data.notices;o&&o.length>0&&o.forEach(a=>{})}}),i.src=`https://csser.top/bilibili/notice.html?t=${Date.now()}`,window.addEventListener("resize",()=>{i.contentWindow.postMessage({action:"getHeight"},"https://csser.top")})},Z0=e=>{let i=e.getElementById("setting-download-mode-advanced"),d=e.getElementById("setting-download-mode-normal"),o=e.getElementById("setting-merge-on"),a=e.getElementById("setting-merge-off"),r=e.getElementById("setting-advanced"),N=e.getElementById("durls"),t=e.getElementById("toggle"),n=e.getElementById("actions"),c=e.getElementById("content"),l=document.getElementById(B),p=()=>{i.disabled=!0,d.disabled=!0,o.disabled=!0,a.disabled=!0},m=()=>{i.disabled=!1,d.disabled=!1,o.disabled=!1,a.disabled=!1};M()?(i.checked=!0,d.checked=!1,r.style.display="block"):(i.checked=!1,d.checked=!0,r.style.display="none"),k()?(o.checked=!0,a.checked=!1):(o.checked=!1,a.checked=!0);let s=()=>{e.buildDownloadLinks()};i.addEventListener("change",()=>{i.checked?(localStorage.bilibili_helper_download_mode="advanced",r.style.display="block"):(localStorage.bilibili_helper_download_mode="normal",r.style.display="none"),s()}),d.addEventListener("change",()=>{d.checked?(localStorage.bilibili_helper_download_mode="normal",r.style.display="none"):(localStorage.bilibili_helper_download_mode="advanced",r.style.display="block"),s()}),o.addEventListener("change",()=>{localStorage.bilibili_helper_merge_mode=o.checked?"on":"off",s()}),a.addEventListener("change",()=>{localStorage.bilibili_helper_merge_mode=a.checked?"off":"on",s()}),N.addEventListener("click",b=>{let g=b.target;if(g.tagName.toLowerCase()==="a"&&g.getAttribute("mode")==="advanced"){if(b.preventDefault(),b.stopPropagation(),g.classList.contains("disabled"))return;let _=null,K=g.getAttribute("title");g.getAttribute("merge")==="on"?(_=e.querySelector(`ul[durls="${g.getAttribute("durls")}"]`),p(),t0(!0,g,JSON.parse(decodeURIComponent(g.getAttribute("durls"))),K,_).then(m)):(_=e.querySelector(`span[durl="${g.getAttribute("durl")}"]`),p(),R(g,JSON.parse(decodeURIComponent(g.getAttribute("durl"))),K,_).then(m))}}),t.addEventListener("click",()=>{h()?(localStorage.bilibili_helper_show="show",c.classList.remove("hide"),t.innerHTML="收起",l.classList.remove("hide"),n.style.top="0",e.getElementById("notice-frame").contentWindow.postMessage({action:"getHeight"},"https://csser.top")):(localStorage.bilibili_helper_show="hide",c.classList.add("hide"),l.classList.add("hide"),t.innerHTML="打开B站下载助手",n.style.top="0"),t.setAttribute("aria-expanded",!h())}),l.addEventListener("scroll",()=>{n.style.top=l.scrollTop+"px"})},T=({code:e,title:i,dash:d,quality:o,message:a,loading:r,durl:N})=>{let t=document.getElementById(B),n=null,c=' <svg aria-hidden="true" focusable="false" style="vertical-align: middle" width="50px" height="50px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" class="lds-pacman"><g ng-attr-style="display:{{config.showBean}}" style="display:block"><circle cx="62.0973" cy="50" r="4" ng-attr-fill="{{config.c2}}" fill="#00a1d6"><animate attributeName="cx" calcMode="linear" values="95;35" keyTimes="0;1" dur="1" begin="-0.67s" repeatCount="indefinite"></animate><animate attributeName="fill-opacity" calcMode="linear" values="0;1;1" keyTimes="0;0.2;1" dur="1" begin="-0.67s" repeatCount="indefinite"></animate></circle><circle cx="82.4973" cy="50" r="4" ng-attr-fill="{{config.c2}}" fill="#00a1d6"><animate attributeName="cx" calcMode="linear" values="95;35" keyTimes="0;1" dur="1" begin="-0.33s" repeatCount="indefinite"></animate><animate attributeName="fill-opacity" calcMode="linear" values="0;1;1" keyTimes="0;0.2;1" dur="1" begin="-0.33s" repeatCount="indefinite"></animate></circle><circle cx="42.2973" cy="50" r="4" ng-attr-fill="{{config.c2}}" fill="#00a1d6"><animate attributeName="cx" calcMode="linear" values="95;35" keyTimes="0;1" dur="1" begin="0s" repeatCount="indefinite"></animate><animate attributeName="fill-opacity" calcMode="linear" values="0;1;1" keyTimes="0;0.2;1" dur="1" begin="0s" repeatCount="indefinite"></animate></circle></g><g ng-attr-transform="translate({{config.showBeanOffset}} 0)" transform="translate(-15 0)"><path d="M50 50L20 50A30 30 0 0 0 80 50Z" ng-attr-fill="{{config.c1}}" fill="#f45a8d" transform="rotate(10.946 50 50)"><animateTransform attributeName="transform" type="rotate" calcMode="linear" values="0 50 50;45 50 50;0 50 50" keyTimes="0;0.5;1" dur="1s" begin="0s" repeatCount="indefinite"></animateTransform></path><path d="M50 50L20 50A30 30 0 0 1 80 50Z" ng-attr-fill="{{config.c1}}" fill="#f45a8d" transform="rotate(-10.946 50 50)"><animateTransform attributeName="transform" type="rotate" calcMode="linear" values="0 50 50;-45 50 50;0 50 50" keyTimes="0;0.5;1" dur="1s" begin="0s" repeatCount="indefinite"></animateTransform></path></g></svg>';t?(n=t.shadowRoot,n.getElementById("title").innerHTML=r?"加载中"+c:l0({title:i,code:e,message:a,quality:o,dash:d,durl:N}),n.getElementById("durls").innerHTML=r?"":L({title:i,code:e,dash:d,durl:N}),n.getElementById("batchBox")&&W0(n),n.getElementById("d-style").textContent=!d&&N?"#setting-advanced{display:none!important}":""):(t=document.createElement(B),t.id=B,t.style.cssText=`display:block;overflow:auto;position:fixed;z-index:${Number.MAX_SAFE_INTEGER};bottom:0;left:0;right:0;max-height:50%;width:100%;background: #fff;border-top: 1px solid #ccc;box-shadow: rgba(0, 0, 0, 0.2) 0 -5px 10px;`,h()?t.classList.add("hide"):t.classList.remove("hide"),t.innerHTML=`<style>
      #${B}.hide{
        width:auto!important;
        left:auto!important;
        background:transparent!important;
        border:0 none!important;
        border-radius: 6px 0 0 0;
        box-shadow: rgba(0, 0, 0, 0.2) -5px -5px 10px!important;
      }
      .player-fullscreen-fix #${B} {
        z-index: 9!important;
      }
    </style>`,document.body.appendChild(t),n=t.attachShadow({mode:"open"}),n.innerHTML=`
      <style>${N0}</style>
      <div id="content" ${h()?'class="hide"':""}>
        <div id="side-bar">
          <div class="notice">
            <iframe id="notice-frame" title="扩展公告" frameborder="0"></iframe>
          </div>
        </div>
        <div id="main">
          <style id="d-style">${!d&&N?"#setting-advanced{display:none!important}":""}</style>
          ${n0}
          <h3 id="title">${r?"加载中"+c:l0({title:i,code:e,message:a,quality:o,dash:d,durl:N})}</h3>
          <ul id="durls">
            ${r?"":L({title:i,code:e,dash:d,durl:N})}
          </ul>
          <div id="batchBox" style="display:none;">
            <div class="setting-item" style="border-top:1px solid #ccc;padding-top:10px;">
              <span class="label">合集：</span>
              <button id="batch-btn" class="btn-large" style="padding:6px 14px;">批量下载合集</button>
              <button id="batch-cancel" class="btn-ghost" style="display:none;" aria-label="取消批量下载">取消</button>
              <span id="batch-status" role="status" aria-live="polite"></span>
            </div>
            <div class="setting-item" style="margin-top:6px;">
              <label>清晰度：<select id="batch-qn" aria-label="批量下载清晰度" style="margin-left:4px;padding:2px 6px;border:1px solid #ccc;border-radius:3px;background:#fff;">
                <option value="">跟随播放器</option>
                <option value="16">360P 流畅</option>
                <option value="32">480P 标清</option>
                <option value="64">720P 准高清</option>
                <option value="80">1080P 高清</option>
                <option value="112">1080P 高码率</option>
                <option value="120">4K 超高清</option>
                <option value="125">HDR 真彩</option>
              </select></label>
            </div>
            <div class="setting-item" id="batch-resume" style="display:none;">
              <label><input id="batch-skip" type="checkbox"> 跳过上次已下载的集数</label>
              <button id="batch-clear" class="btn-ghost" style="padding:3px 8px;font-size:12px;margin-left:8px;">清空记录</button>
            </div>
            <p class="desc" style="margin-top:6px;">固定使用高级模式：逐集自动重命名并合并音视频（兼容模式的浏览器直接下载不适用于批量，会被浏览器多文件下载拦截且无重命名/合并）；清晰度由上方选择，默认跟随播放器。过程中请勿刷新/关闭页面或切换分集</p>
            <ul id="batch-progress" style="margin:8px 0 0 2em;max-height:220px;overflow:auto;"></ul>
          </div>
          <div id="bilibliHelperLogs">
            <h4>解析日志：</h4>
          </div>
          <div class="beg">
            如果这个工具确实帮到了您，烦请给个<a class="btn" style="padding:3px 8px;font-size:12px;" href="${O?"https://microsoftedge.microsoft.com/addons/detail/cagicamgdlbdmonbclkpgiabbldodgae":"https://chromewebstore.google.com/detail/bfcbfobhcjbkilcbehlnlchiinokiijp"}" target="_blank">五星好评</a>，谢谢😊
          </div>
        </div>
        <div id="actions">
          <button id="toggle" class="btn-large" aria-controls="content" aria-expanded="${h()?"false":"true"}">${h()?"打开B站下载助手":"收起"}</button>
        </div>
      </div>
    `,Z0(n),J0(n),W0(n)),n.buildDownloadLinks=()=>{n.getElementById("durls").innerHTML=L({title:i,code:e,dash:d,durl:N})}},s0=async()=>{let e=await W(),i=await z();if(e.code)return T({code:e.code,quality:x[i],title:e.data.videoData.title});let d=e.data.videoData,o=d.aid,a=d.bvid,r=d.cid;v("av:",o,"bvid:",a,"cid:",r);let N,t;if(d.pages.length>1){let m=location.search.match(/p=(\d+)/),s=d.pages[0];m&&m[1]&&(s=d.pages.find(b=>""+b.page==""+m[1])),N=s.page,t=s.part,r=s.cid}let{code:n,dash:c,qualityDescription:l,message:p}=await d0(o,a,r,i);if(n===E.OK){let m=`${d.title}`;N&&t&&(m=`${d.title}_P${N}_${t}`),T({code:n,title:m,quality:l,dash:c,message:p})}else T({code:n,message:p})},c0=async e=>{let i=e?"next":"next2025",d=i==="next2025",o=await W(i),a=o,r=await z();if(o.code)return T({code:o.code,quality:x[r],title:d?a.data.result.supplement.ogv_episode_info.long_title:o.data.seasonInfo.mediaInfo.title});let N=d?[]:o.data.seasonInfo.mediaInfo.episodes,t=d?a.data.result.supplement.ogv_episode_info.episode_id:e.ep_id,n=d?{}:N.find(g=>t===g.ep_id),c=d?a.data.result.supplement.ogv_episode_info:void 0;v("ep id:",t,"quality:",x[r]);let{code:l,dash:p,qualityDescription:m,message:s,durl:b}=await i0(r,d?{...a.data.result.video_info,dash:a.data.result.video_info.dash,avid:a.data.result.arc.aid,cid:a.data.result.arc.cid}:e);if(p||b){let g=d?`${document.title.split("-")?.[0]}_${c.index_title}_${c.long_title}`:`${o.data.seasonInfo.mediaInfo.title}_${n.titleFormat||n.title||""}_${n.long_title||""}`;T({code:l,title:g,dash:p,message:s,quality:m,durl:b})}else T({code:l,message:s})},p0=(e,i)=>{let d=""+window.location.href,o=!1;(async()=>{let a=await A(".bpx-player-ctrl-quality-result");if(a){let r=a.textContent;new MutationObserver(t=>{if(t[0]?.type==="childList"){let n=t[0]?.addedNodes?.[0]?.textContent??r;r!==n&&(r=n,I(),o=!0,e())}}).observe(a,{childList:!0})}})(),i.interval=window.setInterval(()=>{let a=window.location.href;d!==a?(d=a,I(),o=!0,e()):o||(o=!0,e())},1e3)};var esc=e=>String(e==null?"":e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[t]??t));
var Bx=()=>{let e=window.__INITIAL_STATE__,i=e&&e.videoData&&e.videoData.ugc_season;if(!i||!i.sections)return[];let d=[];return i.sections.forEach(o=>{(o.episodes||[]).forEach(a=>{d.some(t=>t.cid===a.cid)||d.push({aid:a.aid,bvid:a.bvid,cid:a.cid,title:(a.arc&&a.arc.title)||a.title||"av"+a.aid})})}),d};
var bx0={running:!1,cancel:!1,lastStatus:"",failLog:[]};
var bx1=e=>String(e==null?"":e).replace(/[\\/:*?"<>|]/g,"_").slice(0,80);
var bx2=e=>new Promise(i=>setTimeout(i,e));
var bx5=e=>{try{let t=JSON.parse(localStorage.getItem("bilibili_helper_batch_done")||"{}");return t[e]&&t[e].cids||[]}catch{return[]}};
var bx6=(e,t)=>{try{let i=JSON.parse(localStorage.getItem("bilibili_helper_batch_done")||"{}"),d=i[e]||{cids:[]};d.cids.includes(t)||d.cids.push(t),i[e]=d,localStorage.setItem("bilibili_helper_batch_done",JSON.stringify(i))}catch{}};
var bx7=(e,t)=>{try{let i=JSON.parse(localStorage.getItem("bilibili_helper_batch_done")||"{}");i[e]&&(i[e].cids=i[e].cids.filter(d=>d!==t),localStorage.setItem("bilibili_helper_batch_done",JSON.stringify(i)))}catch{}};
var W0=e=>{let t=e.getElementById("batchBox");if(!t)return;let i=e.getElementById("batch-btn"),d=e.getElementById("batch-cancel"),o=e.getElementById("batch-status");i&&!i.dataset.bound&&(i.dataset.bound="1",i.addEventListener("click",()=>Dx(e)),d.addEventListener("click",()=>{bx0.cancel=!0,o.textContent=" 已请求取消，当前集完成后停止",bx0.lastStatus=o.textContent}),e.getElementById("batch-clear").addEventListener("click",()=>{let n=window.__INITIAL_STATE__,r=n&&n.videoData&&n.videoData.ugc_season;try{let u=JSON.parse(localStorage.getItem("bilibili_helper_batch_done")||"{}");r&&r.id&&u[r.id]&&(delete u[r.id],localStorage.setItem("bilibili_helper_batch_done",JSON.stringify(u)))}catch(a){a}W0(e)}),(()=>{let s=e.getElementById("batch-qn");if(!s)return;s.value=localStorage.getItem("bilibili_helper_batch_qn")||"";s.addEventListener("change",()=>{localStorage.bilibili_helper_batch_qn=s.value})})());let n=Bx().length,r=window.__INITIAL_STATE__,u=r&&r.videoData&&r.videoData.ugc_season,c=u&&u.id?bx5(u.id):[],a=e.getElementById("batch-resume");a.style.display=c.length?"block":"none";let f=`批量下载合集（共${n}集）`;i.textContent=bx0.running?`批量下载中…（${bx0.lastStatus.trim()||"进行中"}）`:f,t.style.display=n?"block":"none",bx0.running?(i.disabled=!0,i.classList.add("b-running"),d.style.display=""):(i.disabled=!1,i.classList.remove("b-running"),d.style.display="none"),o.textContent=bx0.running||bx0.lastStatus?bx0.lastStatus:""};
var Dx=async e=>{
  if(bx0.running)return;
  let t=Bx();
  if(!t.length)return v("未找到合集信息");
  bx0.running=!0,bx0.cancel=!1,bx0.failLog=[];
  let i=e.getElementById("batch-btn"),d=e.getElementById("batch-cancel"),o=e.getElementById("batch-status"),r=e.getElementById("batch-progress"),u=e.getElementById("batch-skip"),c=window.__INITIAL_STATE__,f=c&&c.videoData&&c.videoData.ugc_season,P=f&&f.id||"unknown",Q0=0,Q1=0,Q2=0;
  o.textContent="",o.classList.remove("b-celebrate"),i.disabled=!0,i.classList.add("b-running"),d.style.display="",r.innerHTML="";
  let n=await z(),qnO=localStorage.getItem("bilibili_helper_batch_qn");qnO&&(n=+qnO);
  v("开始批量下载合集，共",t.length,"集，目标画质",x[n]||n);
  let s=new Set(q.blobUrls);
  for(let a=0;a<t.length;a++){
    if(bx0.cancel)break;
    let h=t[a],m=bx1(h.title),p=document.createElement("li");
    p.innerHTML=`<span class="b-ep" title="${esc(m)}">${a+1}/${t.length} ${esc(m)}</span> 等待`,r.appendChild(p);
    if(u&&u.checked&&bx5(P).includes(h.cid)){Q2++,p.classList.add("b-skip"),p.innerHTML=`<span class="b-ep" title="${esc(m)}">${a+1}/${t.length} ${esc(m)}</span> ↷ 上次已下载，跳过`,o.textContent=` 正在处理 ${a+1}/${t.length}（成功${Q0} 跳过${Q2} 失败${Q1}）`,bx0.lastStatus=o.textContent;continue}
    o.textContent=` 正在处理 ${a+1}/${t.length}（成功${Q0} 跳过${Q2} 失败${Q1}）`,bx0.lastStatus=o.textContent;
    try{
      let N=await d0(h.aid,h.bvid,h.cid,n);
      if(N.code!==E.OK){let w=N.code===E.VIP_ONLY?"（该集为充电/大会员专属，请确认已登录并已充电）":"";throw new Error((N.message||"获取下载地址失败")+w)}
      if(N.dash){
        let S=[{url:N.dash.audio.base_url,size:N.dash.audio.size},{url:N.dash.video.base_url,size:N.dash.video.size}],_=document.createElement("ul");
        _.className="progress",p.appendChild(_);
        let w=new Set(q.ffmpegUsedFiles);
        await t0(!0,p,S,`${String(a+1).padStart(3,"0")}_${m}`,_),Q0++,p.classList.add("b-ok"),p.innerHTML=`<span class="b-ep" title="${esc(m)}">${a+1}/${t.length} ${esc(m)}</span> ✔ 已保存`,bx6(P,h.cid);
        let K=[...q.ffmpegUsedFiles].find(V=>!w.has(V));
        K&&(q.ffmpegUsedFiles.delete(K),q.ffmpegInstance.deleteFile(K).catch(()=>{})),[...q.blobUrls].filter(V=>!s.has(V)).forEach(V=>{setTimeout(()=>{try{URL.revokeObjectURL(V)}catch(G1){G1}q.blobUrls.delete(V)},6e4),s.add(V)})
      }else if(N.durl&&N.durl.length===1){let X1=document.createElement("ul");X1.className="progress",p.appendChild(X1),await R(p,{url:N.durl[0].url,size:N.durl[0].size},`${String(a+1).padStart(3,"0")}_${m}`,X1),Q0++,p.classList.add("b-ok"),p.innerHTML=`<span class="b-ep" title="${esc(m)}">${a+1}/${t.length} ${esc(m)}</span> ✔ 已保存`}
      else throw new Error("未返回DASH地址，已跳过")
    }catch(N){
      Q1++,p.classList.add("b-fail"),p.innerHTML=`<span class="b-ep" title="${esc(m)}">${a+1}/${t.length} ${esc(m)}</span> ✘ ${esc(N.message||N)}`,bx0.failLog.push(`${a+1}. ${h.title} — ${N.message||N}`),bx7(P,h.cid)
    }
    await bx2(1e3)
  }
  if(bx0.cancel)o.textContent=` 已取消（成功${Q0} 跳过${Q2} 失败${Q1}）`;
  else if(Q1===0)o.textContent=` 🎉 全部完成：成功${Q0} 跳过${Q2} 失败0`,o.classList.add("b-celebrate"),setTimeout(()=>o.classList.remove("b-celebrate"),900);
  else o.textContent=` 全部完成：成功${Q0} 跳过${Q2} 失败${Q1}（常见原因：未登录/未充电/视频不可见）`;
  bx0.lastStatus=o.textContent;
  if(bx0.failLog.length){let K=document.createElement("a");K.href="#nogo",K.className="btn-ghost b-copy",K.textContent="复制失败清单",K.addEventListener("click",V=>{V.preventDefault();let G1=bx0.failLog.join("\n");(navigator.clipboard?navigator.clipboard.writeText(G1):Promise.reject(new Error("no clipboard"))).then(()=>{K.textContent="已复制"},()=>{window.prompt("复制失败清单（Ctrl+C）",G1)})}),o.appendChild(K)}
  i.disabled=!1,i.classList.remove("b-running"),d.style.display="none",bx0.running=!1
};
var Z={videoInfo:null,interval:0},y0=async e=>{let i=XMLHttpRequest;H(e);let d=async()=>{if(Z.interval&&e.clearInterval(Z.interval),!w()||!j()&&!y())return;p0(async()=>{w()&&(T({loading:!0}),j()&&(v("这是一个投稿视频"),s0()),y()&&(v("这是一个番剧"),c0(Z.videoInfo)))},Z)};y()?r0(o=>{Z.videoInfo=o,X(d)},i,()=>{X(d)}):X(d)};y0(window);
