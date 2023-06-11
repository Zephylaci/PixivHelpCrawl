import{C as $,c as w,_ as p,a as h,l as D,o as G,E as H}from"./index.c8ca1af3.js";import{r as l}from"./react-venders.669d625f.js";import{m as J,n as K}from"./RouteContext.0a09958b.js";import{W as L}from"./button.ce6ccd71.js";var M=globalThis&&globalThis.__rest||function(t,r){var a={};for(var e in t)Object.prototype.hasOwnProperty.call(t,e)&&r.indexOf(e)<0&&(a[e]=t[e]);if(t!=null&&typeof Object.getOwnPropertySymbols=="function")for(var o=0,e=Object.getOwnPropertySymbols(t);o<e.length;o++)r.indexOf(e[o])<0&&Object.prototype.propertyIsEnumerable.call(t,e[o])&&(a[e[o]]=t[e[o]]);return a},Q=function(r){var a,e=r.prefixCls,o=r.className,u=r.checked,v=r.onChange,s=r.onClick,x=M(r,["prefixCls","className","checked","onChange","onClick"]),n=l.exports.useContext($),C=n.getPrefixCls,d=function(m){v==null||v(!u),s==null||s(m)},f=C("tag",e),g=w(f,(a={},p(a,"".concat(f,"-checkable"),!0),p(a,"".concat(f,"-checkable-checked"),u),a),o);return l.exports.createElement("span",h({},x,{className:g,onClick:d}))},U=Q,X=globalThis&&globalThis.__rest||function(t,r){var a={};for(var e in t)Object.prototype.hasOwnProperty.call(t,e)&&r.indexOf(e)<0&&(a[e]=t[e]);if(t!=null&&typeof Object.getOwnPropertySymbols=="function")for(var o=0,e=Object.getOwnPropertySymbols(t);o<e.length;o++)r.indexOf(e[o])<0&&Object.prototype.propertyIsEnumerable.call(t,e[o])&&(a[e[o]]=t[e[o]]);return a},Y=new RegExp("^(".concat(J.join("|"),")(-inverse)?$")),Z=new RegExp("^(".concat(K.join("|"),")$")),ee=function(r,a){var e,o=r.prefixCls,u=r.className,v=r.style,s=r.children,x=r.icon,n=r.color,C=r.onClose,d=r.closeIcon,f=r.closable,g=f===void 0?!1:f,c=X(r,["prefixCls","className","style","children","icon","color","onClose","closeIcon","closable"]),m=l.exports.useContext($),I=m.getPrefixCls,R=m.direction,_=l.exports.useState(!0),k=D(_,2),W=k[0],P=k[1];l.exports.useEffect(function(){"visible"in c&&P(c.visible)},[c.visible]);var O=function(){return n?Y.test(n)||Z.test(n):!1},z=h({backgroundColor:n&&!O()?n:void 0},v),N=O(),i=I("tag",o),A=w(i,(e={},p(e,"".concat(i,"-").concat(n),N),p(e,"".concat(i,"-has-color"),n&&!N),p(e,"".concat(i,"-hidden"),!W),p(e,"".concat(i,"-rtl"),R==="rtl"),e),u),T=function(b){b.stopPropagation(),C==null||C(b),!b.defaultPrevented&&("visible"in c||P(!1))},F=function(){return g?d?l.exports.createElement("span",{className:"".concat(i,"-close-icon"),onClick:T},d):l.exports.createElement(H,{className:"".concat(i,"-close-icon"),onClick:T}):null},V="onClick"in c||s&&s.type==="a",q=G(c,["visible"]),E=x||null,B=E?l.exports.createElement(l.exports.Fragment,null,E,l.exports.createElement("span",null,s)):s,j=l.exports.createElement("span",h({},q,{ref:a,className:A,style:z}),B,F());return V?l.exports.createElement(L,null,j):j},y=l.exports.forwardRef(ee);y.displayName="Tag";y.CheckableTag=U;var le=y;export{le as T};
