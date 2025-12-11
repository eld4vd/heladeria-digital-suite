import{R as O,r as c}from"./react-vendor-DKUHWr44.js";var W={color:void 0,size:void 0,className:void 0,style:void 0,attr:void 0},R=O.createContext&&O.createContext(W),J=["attr","size","title"];function X(e,t){if(e==null)return{};var r=ee(e,t),a,o;if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(e);for(o=0;o<s.length;o++)a=s[o],!(t.indexOf(a)>=0)&&Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}function ee(e,t){if(e==null)return{};var r={};for(var a in e)if(Object.prototype.hasOwnProperty.call(e,a)){if(t.indexOf(a)>=0)continue;r[a]=e[a]}return r}function $(){return $=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var r=arguments[t];for(var a in r)Object.prototype.hasOwnProperty.call(r,a)&&(e[a]=r[a])}return e},$.apply(this,arguments)}function M(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter(function(o){return Object.getOwnPropertyDescriptor(e,o).enumerable})),r.push.apply(r,a)}return r}function D(e){for(var t=1;t<arguments.length;t++){var r=arguments[t]!=null?arguments[t]:{};t%2?M(Object(r),!0).forEach(function(a){te(e,a,r[a])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):M(Object(r)).forEach(function(a){Object.defineProperty(e,a,Object.getOwnPropertyDescriptor(r,a))})}return e}function te(e,t,r){return t=re(t),t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function re(e){var t=ae(e,"string");return typeof t=="symbol"?t:t+""}function ae(e,t){if(typeof e!="object"||!e)return e;var r=e[Symbol.toPrimitive];if(r!==void 0){var a=r.call(e,t);if(typeof a!="object")return a;throw new TypeError("@@toPrimitive must return a primitive value.")}return(t==="string"?String:Number)(e)}function B(e){return e&&e.map((t,r)=>O.createElement(t.tag,D({key:r},t.attr),B(t.child)))}function Ye(e){return t=>O.createElement(ie,$({attr:D({},e.attr)},t),B(e.child))}function ie(e){var t=r=>{var{attr:a,size:o,title:s}=e,i=X(e,J),n=o||r.size||"1em",l;return r.className&&(l=r.className),e.className&&(l=(l?l+" ":"")+e.className),O.createElement("svg",$({stroke:"currentColor",fill:"currentColor",strokeWidth:"0"},r.attr,a,i,{className:l,style:D(D({color:e.color||r.color},r.style),e.style),height:n,width:n,xmlns:"http://www.w3.org/2000/svg"}),s&&O.createElement("title",null,s),e.children)};return R!==void 0?O.createElement(R.Consumer,null,r=>t(r)):t(W)}let oe={data:""},se=e=>typeof window=="object"?((e?e.querySelector("#_goober"):window._goober)||Object.assign((e||document.head).appendChild(document.createElement("style")),{innerHTML:" ",id:"_goober"})).firstChild:e||oe,ne=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,le=/\/\*[^]*?\*\/|  +/g,H=/\n+/g,x=(e,t)=>{let r="",a="",o="";for(let s in e){let i=e[s];s[0]=="@"?s[1]=="i"?r=s+" "+i+";":a+=s[1]=="f"?x(i,s):s+"{"+x(i,s[1]=="k"?"":t)+"}":typeof i=="object"?a+=x(i,t?t.replace(/([^,])+/g,n=>s.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,l=>/&/.test(l)?l.replace(/&/g,n):n?n+" "+l:l)):s):i!=null&&(s=/^--/.test(s)?s:s.replace(/[A-Z]/g,"-$&").toLowerCase(),o+=x.p?x.p(s,i):s+":"+i+";")}return r+(t&&o?t+"{"+o+"}":o)+a},h={},G=e=>{if(typeof e=="object"){let t="";for(let r in e)t+=r+G(e[r]);return t}return e},ce=(e,t,r,a,o)=>{let s=G(e),i=h[s]||(h[s]=(l=>{let u=0,p=11;for(;u<l.length;)p=101*p+l.charCodeAt(u++)>>>0;return"go"+p})(s));if(!h[i]){let l=s!==e?e:(u=>{let p,d,f=[{}];for(;p=ne.exec(u.replace(le,""));)p[4]?f.shift():p[3]?(d=p[3].replace(H," ").trim(),f.unshift(f[0][d]=f[0][d]||{})):f[0][p[1]]=p[2].replace(H," ").trim();return f[0]})(e);h[i]=x(o?{["@keyframes "+i]:l}:l,r?"":"."+i)}let n=r&&h.g?h.g:null;return r&&(h.g=h[i]),((l,u,p,d)=>{d?u.data=u.data.replace(d,l):u.data.indexOf(l)===-1&&(u.data=p?l+u.data:u.data+l)})(h[i],t,a,n),i},de=(e,t,r)=>e.reduce((a,o,s)=>{let i=t[s];if(i&&i.call){let n=i(r),l=n&&n.props&&n.props.className||/^go/.test(n)&&n;i=l?"."+l:n&&typeof n=="object"?n.props?"":x(n,""):n===!1?"":n}return a+o+(i??"")},"");function N(e){let t=this||{},r=e.call?e(t.p):e;return ce(r.unshift?r.raw?de(r,[].slice.call(arguments,1),t.p):r.reduce((a,o)=>Object.assign(a,o&&o.call?o(t.p):o),{}):r,se(t.target),t.g,t.o,t.k)}let K,A,T;N.bind({g:1});let v=N.bind({k:1});function ue(e,t,r,a){x.p=t,K=e,A=r,T=a}function w(e,t){let r=this||{};return function(){let a=arguments;function o(s,i){let n=Object.assign({},s),l=n.className||o.className;r.p=Object.assign({theme:A&&A()},n),r.o=/ *go\d+/.test(l),n.className=N.apply(r,a)+(l?" "+l:"");let u=e;return e[0]&&(u=n.as||e,delete n.as),T&&u[0]&&T(n),K(u,n)}return o}}var pe=e=>typeof e=="function",k=(e,t)=>pe(e)?e(t):e,fe=(()=>{let e=0;return()=>(++e).toString()})(),U=(()=>{let e;return()=>{if(e===void 0&&typeof window<"u"){let t=matchMedia("(prefers-reduced-motion: reduce)");e=!t||t.matches}return e}})(),me=20,_="default",Y=(e,t)=>{let{toastLimit:r}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,r)};case 1:return{...e,toasts:e.toasts.map(i=>i.id===t.toast.id?{...i,...t.toast}:i)};case 2:let{toast:a}=t;return Y(e,{type:e.toasts.find(i=>i.id===a.id)?1:0,toast:a});case 3:let{toastId:o}=t;return{...e,toasts:e.toasts.map(i=>i.id===o||o===void 0?{...i,dismissed:!0,visible:!1}:i)};case 4:return t.toastId===void 0?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(i=>i.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let s=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(i=>({...i,pauseDuration:i.pauseDuration+s}))}}},C=[],Z={toasts:[],pausedAt:void 0,settings:{toastLimit:me}},b={},q=(e,t=_)=>{b[t]=Y(b[t]||Z,e),C.forEach(([r,a])=>{r===t&&a(b[t])})},Q=e=>Object.keys(b).forEach(t=>q(e,t)),ge=e=>Object.keys(b).find(t=>b[t].toasts.some(r=>r.id===e)),z=(e=_)=>t=>{q(t,e)},ye={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},be=(e={},t=_)=>{let[r,a]=c.useState(b[t]||Z),o=c.useRef(b[t]);c.useEffect(()=>(o.current!==b[t]&&a(b[t]),C.push([t,a]),()=>{let i=C.findIndex(([n])=>n===t);i>-1&&C.splice(i,1)}),[t]);let s=r.toasts.map(i=>{var n,l,u;return{...e,...e[i.type],...i,removeDelay:i.removeDelay||((n=e[i.type])==null?void 0:n.removeDelay)||e?.removeDelay,duration:i.duration||((l=e[i.type])==null?void 0:l.duration)||e?.duration||ye[i.type],style:{...e.style,...(u=e[i.type])==null?void 0:u.style,...i.style}}});return{...r,toasts:s}},he=(e,t="blank",r)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...r,id:r?.id||fe()}),E=e=>(t,r)=>{let a=he(t,e,r);return z(a.toasterId||ge(a.id))({type:2,toast:a}),a.id},m=(e,t)=>E("blank")(e,t);m.error=E("error");m.success=E("success");m.loading=E("loading");m.custom=E("custom");m.dismiss=(e,t)=>{let r={type:3,toastId:e};t?z(t)(r):Q(r)};m.dismissAll=e=>m.dismiss(void 0,e);m.remove=(e,t)=>{let r={type:4,toastId:e};t?z(t)(r):Q(r)};m.removeAll=e=>m.remove(void 0,e);m.promise=(e,t,r)=>{let a=m.loading(t.loading,{...r,...r?.loading});return typeof e=="function"&&(e=e()),e.then(o=>{let s=t.success?k(t.success,o):void 0;return s?m.success(s,{id:a,...r,...r?.success}):m.dismiss(a),o}).catch(o=>{let s=t.error?k(t.error,o):void 0;s?m.error(s,{id:a,...r,...r?.error}):m.dismiss(a)}),e};var ve=1e3,xe=(e,t="default")=>{let{toasts:r,pausedAt:a}=be(e,t),o=c.useRef(new Map).current,s=c.useCallback((d,f=ve)=>{if(o.has(d))return;let g=setTimeout(()=>{o.delete(d),i({type:4,toastId:d})},f);o.set(d,g)},[]);c.useEffect(()=>{if(a)return;let d=Date.now(),f=r.map(g=>{if(g.duration===1/0)return;let j=(g.duration||0)+g.pauseDuration-(d-g.createdAt);if(j<0){g.visible&&m.dismiss(g.id);return}return setTimeout(()=>m.dismiss(g.id,t),j)});return()=>{f.forEach(g=>g&&clearTimeout(g))}},[r,a,t]);let i=c.useCallback(z(t),[t]),n=c.useCallback(()=>{i({type:5,time:Date.now()})},[i]),l=c.useCallback((d,f)=>{i({type:1,toast:{id:d,height:f}})},[i]),u=c.useCallback(()=>{a&&i({type:6,time:Date.now()})},[a,i]),p=c.useCallback((d,f)=>{let{reverseOrder:g=!1,gutter:j=8,defaultPosition:F}=f||{},I=r.filter(y=>(y.position||F)===(d.position||F)&&y.height),V=I.findIndex(y=>y.id===d.id),L=I.filter((y,S)=>S<V&&y.visible).length;return I.filter(y=>y.visible).slice(...g?[L+1]:[0,L]).reduce((y,S)=>y+(S.height||0)+j,0)},[r]);return c.useEffect(()=>{r.forEach(d=>{if(d.dismissed)s(d.id,d.removeDelay);else{let f=o.get(d.id);f&&(clearTimeout(f),o.delete(d.id))}})},[r,s]),{toasts:r,handlers:{updateHeight:l,startPause:n,endPause:u,calculateOffset:p}}},we=v`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,Oe=v`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,Ee=v`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,je=w("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${we} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${Oe} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${Ee} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,Pe=v`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,Ce=w("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${Pe} 1s linear infinite;
`,$e=v`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,De=v`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,ke=w("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${$e} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${De} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,Ne=w("div")`
  position: absolute;
`,ze=w("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,Ie=v`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,Se=w("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${Ie} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,Ae=({toast:e})=>{let{icon:t,type:r,iconTheme:a}=e;return t!==void 0?typeof t=="string"?c.createElement(Se,null,t):t:r==="blank"?null:c.createElement(ze,null,c.createElement(Ce,{...a}),r!=="loading"&&c.createElement(Ne,null,r==="error"?c.createElement(je,{...a}):c.createElement(ke,{...a})))},Te=e=>`
0% {transform: translate3d(0,${e*-200}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,_e=e=>`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${e*-150}%,-1px) scale(.6); opacity:0;}
`,Fe="0%{opacity:0;} 100%{opacity:1;}",Le="0%{opacity:1;} 100%{opacity:0;}",Re=w("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,Me=w("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,He=(e,t)=>{let r=e.includes("top")?1:-1,[a,o]=U()?[Fe,Le]:[Te(r),_e(r)];return{animation:t?`${v(a)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${v(o)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}},We=c.memo(({toast:e,position:t,style:r,children:a})=>{let o=e.height?He(e.position||t||"top-center",e.visible):{opacity:0},s=c.createElement(Ae,{toast:e}),i=c.createElement(Me,{...e.ariaProps},k(e.message,e));return c.createElement(Re,{className:e.className,style:{...o,...r,...e.style}},typeof a=="function"?a({icon:s,message:i}):c.createElement(c.Fragment,null,s,i))});ue(c.createElement);var Be=({id:e,className:t,style:r,onHeightUpdate:a,children:o})=>{let s=c.useCallback(i=>{if(i){let n=()=>{let l=i.getBoundingClientRect().height;a(e,l)};n(),new MutationObserver(n).observe(i,{subtree:!0,childList:!0,characterData:!0})}},[e,a]);return c.createElement("div",{ref:s,className:t,style:r},o)},Ge=(e,t)=>{let r=e.includes("top"),a=r?{top:0}:{bottom:0},o=e.includes("center")?{justifyContent:"center"}:e.includes("right")?{justifyContent:"flex-end"}:{};return{left:0,right:0,display:"flex",position:"absolute",transition:U()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${t*(r?1:-1)}px)`,...a,...o}},Ke=N`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,P=16,Ze=({reverseOrder:e,position:t="top-center",toastOptions:r,gutter:a,children:o,toasterId:s,containerStyle:i,containerClassName:n})=>{let{toasts:l,handlers:u}=xe(r,s);return c.createElement("div",{"data-rht-toaster":s||"",style:{position:"fixed",zIndex:9999,top:P,left:P,right:P,bottom:P,pointerEvents:"none",...i},className:n,onMouseEnter:u.startPause,onMouseLeave:u.endPause},l.map(p=>{let d=p.position||t,f=u.calculateOffset(p,{reverseOrder:e,gutter:a,defaultPosition:t}),g=Ge(d,f);return c.createElement(Be,{id:p.id,key:p.id,onHeightUpdate:u.updateHeight,className:p.visible?Ke:"",style:g},p.type==="custom"?k(p.message,p):o?o(p):c.createElement(We,{toast:p,position:d}))}))},qe=m;export{Ze as F,Ye as G,qe as z};
