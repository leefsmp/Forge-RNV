!function(t,e){"use strict";"undefined"!=typeof define&&define.amd?define("canvgModule",["rgbcolor","stackblur"],e):"undefined"!=typeof module&&module.exports&&(module.exports=e(require("rgbcolor"),require("stackblur"))),t.canvg=e(t.RGBColor,t.stackBlur)}("undefined"!=typeof window?window:this,function(t,e){function n(t){var e=[0,0,0],i=function(i,n){var s=t.match(i);null!=s&&(e[n]+=s.length,t=t.replace(i," "))};return t=t.replace(/:not\(([^\)]*)\)/g,"     $1 "),t=t.replace(/{[\s\S]*/gm," "),i(o,1),i(l,0),i(h,1),i(u,2),i(c,1),i(f,1),t=t.replace(/[\*\s\+>~]/g," "),t=t.replace(/[#\.]/g," "),i(m,2),e.join("")}function s(s){var r={opts:s};r.FRAMERATE=30,r.MAX_VIRTUAL_PIXELS=3e4,r.log=function(t){},1==r.opts.log&&"undefined"!=typeof console&&(r.log=function(t){console.log(t)}),r.init=function(t){var e=0;r.UniqueId=function(){return"canvg"+ ++e},r.Definitions={},r.Styles={},r.StylesSpecificity={},r.Animations=[],r.Images=[],r.ctx=t,r.ViewPort=new function(){this.viewPorts=[],this.Clear=function(){this.viewPorts=[]},this.SetCurrent=function(t,e){this.viewPorts.push({width:t,height:e})},this.RemoveCurrent=function(){this.viewPorts.pop()},this.Current=function(){return this.viewPorts[this.viewPorts.length-1]},this.width=function(){return this.Current().width},this.height=function(){return this.Current().height},this.ComputeSize=function(t){return null!=t&&"number"==typeof t?t:"x"==t?this.width():"y"==t?this.height():Math.sqrt(Math.pow(this.width(),2)+Math.pow(this.height(),2))/Math.sqrt(2)}}},r.init(),r.ImagesLoaded=function(){for(var t=0;t<r.Images.length;t++)if(!r.Images[t].loaded)return!1;return!0},r.trim=function(t){return t.replace(/^\s+|\s+$/g,"")},r.compressSpaces=function(t){return t.replace(/[\s\r\t\n]+/gm," ")},r.ajax=function(t){var e;return e=window.XMLHttpRequest?new XMLHttpRequest:new ActiveXObject("Microsoft.XMLHTTP"),e?(e.open("GET",t,!1),e.send(null),e.responseText):null},r.parseXml=function(t){if("undefined"!=typeof Windows&&void 0!==Windows.Data&&void 0!==Windows.Data.Xml){var e=new Windows.Data.Xml.Dom.XmlDocument,i=new Windows.Data.Xml.Dom.XmlLoadSettings;return i.prohibitDtd=!1,e.loadXml(t,i),e}if(!window.DOMParser)return t=t.replace(/<!DOCTYPE svg[^>]*>/,""),(e=new ActiveXObject("Microsoft.XMLDOM")).async="false",e.loadXML(t),e;try{var n=new DOMParser;return n.parseFromString(t,"image/svg+xml")}catch(e){return(n=new DOMParser).parseFromString(t,"text/xml")}},r.Property=function(t,e){this.name=t,this.value=e},r.Property.prototype.getValue=function(){return this.value},r.Property.prototype.hasValue=function(){return null!=this.value&&""!==this.value},r.Property.prototype.numValue=function(){if(!this.hasValue())return 0;var t=parseFloat(this.value);return(this.value+"").match(/%$/)&&(t/=100),t},r.Property.prototype.valueOrDefault=function(t){return this.hasValue()?this.value:t},r.Property.prototype.numValueOrDefault=function(t){return this.hasValue()?this.numValue():t},r.Property.prototype.addOpacity=function(e){var i=this.value;if(null!=e.value&&""!=e.value&&"string"==typeof this.value){var n=new t(this.value);n.ok&&(i="rgba("+n.r+", "+n.g+", "+n.b+", "+e.numValue()+")")}return new r.Property(this.name,i)},r.Property.prototype.getDefinition=function(){var t=this.value.match(/#([^\)'"]+)/);return t&&(t=t[1]),t||(t=this.value),r.Definitions[t]},r.Property.prototype.isUrlDefinition=function(){return 0==this.value.indexOf("url(")},r.Property.prototype.getFillStyleDefinition=function(t,e){var i=this.getDefinition();if(null!=i&&i.createGradient)return i.createGradient(r.ctx,t,e);if(null!=i&&i.createPattern){if(i.getHrefAttribute().hasValue()){var n=i.attribute("patternTransform");i=i.getHrefAttribute().getDefinition(),n.hasValue()&&(i.attribute("patternTransform",!0).value=n.value)}return i.createPattern(r.ctx,t)}return null},r.Property.prototype.getDPI=function(t){return 96},r.Property.prototype.getEM=function(t){var e=12,i=new r.Property("fontSize",r.Font.Parse(r.ctx.font).fontSize);return i.hasValue()&&(e=i.toPixels(t)),e},r.Property.prototype.getUnits=function(){return(this.value+"").replace(/[0-9\.\-]/g,"")},r.Property.prototype.toPixels=function(t,e){if(!this.hasValue())return 0;var i=this.value+"";if(i.match(/em$/))return this.numValue()*this.getEM(t);if(i.match(/ex$/))return this.numValue()*this.getEM(t)/2;if(i.match(/px$/))return this.numValue();if(i.match(/pt$/))return this.numValue()*this.getDPI(t)*(1/72);if(i.match(/pc$/))return 15*this.numValue();if(i.match(/cm$/))return this.numValue()*this.getDPI(t)/2.54;if(i.match(/mm$/))return this.numValue()*this.getDPI(t)/25.4;if(i.match(/in$/))return this.numValue()*this.getDPI(t);if(i.match(/%$/))return this.numValue()*r.ViewPort.ComputeSize(t);var n=this.numValue();return e&&n<1?n*r.ViewPort.ComputeSize(t):n},r.Property.prototype.toMilliseconds=function(){if(!this.hasValue())return 0;var t=this.value+"";return t.match(/s$/)?1e3*this.numValue():(t.match(/ms$/),this.numValue())},r.Property.prototype.toRadians=function(){if(!this.hasValue())return 0;var t=this.value+"";return t.match(/deg$/)?this.numValue()*(Math.PI/180):t.match(/grad$/)?this.numValue()*(Math.PI/200):t.match(/rad$/)?this.numValue():this.numValue()*(Math.PI/180)};var o={baseline:"alphabetic","before-edge":"top","text-before-edge":"top",middle:"middle",central:"middle","after-edge":"bottom","text-after-edge":"bottom",ideographic:"ideographic",alphabetic:"alphabetic",hanging:"hanging",mathematical:"alphabetic"};return r.Property.prototype.toTextBaseline=function(){return this.hasValue()?o[this.value]:null},r.Font=new function(){this.Styles="normal|italic|oblique|inherit",this.Variants="normal|small-caps|inherit",this.Weights="normal|bold|bolder|lighter|100|200|300|400|500|600|700|800|900|inherit",this.CreateFont=function(t,e,i,n,s,a){var o=null!=a?this.Parse(a):this.CreateFont("","","","","",r.ctx.font);return{fontFamily:s||o.fontFamily,fontSize:n||o.fontSize,fontStyle:t||o.fontStyle,fontWeight:i||o.fontWeight,fontVariant:e||o.fontVariant,toString:function(){return[this.fontStyle,this.fontVariant,this.fontWeight,this.fontSize,this.fontFamily].join(" ")}}};var t=this;this.Parse=function(e){for(var i={},n=r.trim(r.compressSpaces(e||"")).split(" "),s={fontSize:!1,fontStyle:!1,fontWeight:!1,fontVariant:!1},a="",o=0;o<n.length;o++)s.fontStyle||-1==t.Styles.indexOf(n[o])?s.fontVariant||-1==t.Variants.indexOf(n[o])?s.fontWeight||-1==t.Weights.indexOf(n[o])?s.fontSize?"inherit"!=n[o]&&(a+=n[o]):("inherit"!=n[o]&&(i.fontSize=n[o].split("/")[0]),s.fontStyle=s.fontVariant=s.fontWeight=s.fontSize=!0):("inherit"!=n[o]&&(i.fontWeight=n[o]),s.fontStyle=s.fontVariant=s.fontWeight=!0):("inherit"!=n[o]&&(i.fontVariant=n[o]),s.fontStyle=s.fontVariant=!0):("inherit"!=n[o]&&(i.fontStyle=n[o]),s.fontStyle=!0);return""!=a&&(i.fontFamily=a),i}},r.ToNumberArray=function(t){for(var e=r.trim(r.compressSpaces((t||"").replace(/,/g," "))).split(" "),i=0;i<e.length;i++)e[i]=parseFloat(e[i]);return e},r.Point=function(t,e){this.x=t,this.y=e},r.Point.prototype.angleTo=function(t){return Math.atan2(t.y-this.y,t.x-this.x)},r.Point.prototype.applyTransform=function(t){var e=this.x*t[0]+this.y*t[2]+t[4],i=this.x*t[1]+this.y*t[3]+t[5];this.x=e,this.y=i},r.CreatePoint=function(t){var e=r.ToNumberArray(t);return new r.Point(e[0],e[1])},r.CreatePath=function(t){for(var e=r.ToNumberArray(t),i=[],n=0;n<e.length;n+=2)i.push(new r.Point(e[n],e[n+1]));return i},r.BoundingBox=function(t,e,n,s){this.x1=Number.NaN,this.y1=Number.NaN,this.x2=Number.NaN,this.y2=Number.NaN,this.x=function(){return this.x1},this.y=function(){return this.y1},this.width=function(){return this.x2-this.x1},this.height=function(){return this.y2-this.y1},this.addPoint=function(t,e){null!=t&&((isNaN(this.x1)||isNaN(this.x2))&&(this.x1=t,this.x2=t),t<this.x1&&(this.x1=t),t>this.x2&&(this.x2=t)),null!=e&&((isNaN(this.y1)||isNaN(this.y2))&&(this.y1=e,this.y2=e),e<this.y1&&(this.y1=e),e>this.y2&&(this.y2=e))},this.addX=function(t){this.addPoint(t,null)},this.addY=function(t){this.addPoint(null,t)},this.addBoundingBox=function(t){this.addPoint(t.x1,t.y1),this.addPoint(t.x2,t.y2)},this.addQuadraticCurve=function(t,e,i,n,s,a){var r=t+2/3*(i-t),o=e+2/3*(n-e),l=r+1/3*(s-t),h=o+1/3*(a-e);this.addBezierCurve(t,e,r,l,o,h,s,a)},this.addBezierCurve=function(t,e,n,s,a,r,o,l){var h=[t,e],u=[n,s],c=[a,r],f=[o,l];for(this.addPoint(h[0],h[1]),this.addPoint(f[0],f[1]),i=0;i<=1;i++){var m=function(t){return Math.pow(1-t,3)*h[i]+3*Math.pow(1-t,2)*t*u[i]+3*(1-t)*Math.pow(t,2)*c[i]+Math.pow(t,3)*f[i]},p=6*h[i]-12*u[i]+6*c[i],d=-3*h[i]+9*u[i]-9*c[i]+3*f[i],y=3*u[i]-3*h[i];if(0!=d){var v=Math.pow(p,2)-4*y*d;if(!(v<0)){var g=(-p+Math.sqrt(v))/(2*d);0<g&&g<1&&(0==i&&this.addX(m(g)),1==i&&this.addY(m(g)));var x=(-p-Math.sqrt(v))/(2*d);0<x&&x<1&&(0==i&&this.addX(m(x)),1==i&&this.addY(m(x)))}}else{if(0==p)continue;var b=-y/p;0<b&&b<1&&(0==i&&this.addX(m(b)),1==i&&this.addY(m(b)))}}},this.isPointInBox=function(t,e){return this.x1<=t&&t<=this.x2&&this.y1<=e&&e<=this.y2},this.addPoint(t,e),this.addPoint(n,s)},r.Transform=function(t){var e=this;this.Type={},this.Type.translate=function(t){this.p=r.CreatePoint(t),this.apply=function(t){t.translate(this.p.x||0,this.p.y||0)},this.unapply=function(t){t.translate(-1*this.p.x||0,-1*this.p.y||0)},this.applyToPoint=function(t){t.applyTransform([1,0,0,1,this.p.x||0,this.p.y||0])}},this.Type.rotate=function(t){var e=r.ToNumberArray(t);this.angle=new r.Property("angle",e[0]),this.cx=e[1]||0,this.cy=e[2]||0,this.apply=function(t){t.translate(this.cx,this.cy),t.rotate(this.angle.toRadians()),t.translate(-this.cx,-this.cy)},this.unapply=function(t){t.translate(this.cx,this.cy),t.rotate(-1*this.angle.toRadians()),t.translate(-this.cx,-this.cy)},this.applyToPoint=function(t){var e=this.angle.toRadians();t.applyTransform([1,0,0,1,this.p.x||0,this.p.y||0]),t.applyTransform([Math.cos(e),Math.sin(e),-Math.sin(e),Math.cos(e),0,0]),t.applyTransform([1,0,0,1,-this.p.x||0,-this.p.y||0])}},this.Type.scale=function(t){this.p=r.CreatePoint(t),this.apply=function(t){t.scale(this.p.x||1,this.p.y||this.p.x||1)},this.unapply=function(t){t.scale(1/this.p.x||1,1/this.p.y||this.p.x||1)},this.applyToPoint=function(t){t.applyTransform([this.p.x||0,0,0,this.p.y||0,0,0])}},this.Type.matrix=function(t){this.m=r.ToNumberArray(t),this.apply=function(t){t.transform(this.m[0],this.m[1],this.m[2],this.m[3],this.m[4],this.m[5])},this.unapply=function(t){var e=this.m[0],i=this.m[2],n=this.m[4],s=this.m[1],a=this.m[3],r=this.m[5],o=1/(e*(1*a-0*r)-i*(1*s-0*r)+n*(0*s-0*a));t.transform(o*(1*a-0*r),o*(0*r-1*s),o*(0*n-1*i),o*(1*e-0*n),o*(i*r-n*a),o*(n*s-e*r))},this.applyToPoint=function(t){t.applyTransform(this.m)}},this.Type.SkewBase=function(t){this.base=e.Type.matrix,this.base(t),this.angle=new r.Property("angle",t)},this.Type.SkewBase.prototype=new this.Type.matrix,this.Type.skewX=function(t){this.base=e.Type.SkewBase,this.base(t),this.m=[1,0,Math.tan(this.angle.toRadians()),1,0,0]},this.Type.skewX.prototype=new this.Type.SkewBase,this.Type.skewY=function(t){this.base=e.Type.SkewBase,this.base(t),this.m=[1,Math.tan(this.angle.toRadians()),0,1,0,0]},this.Type.skewY.prototype=new this.Type.SkewBase,this.transforms=[],this.apply=function(t){for(var e=0;e<this.transforms.length;e++)this.transforms[e].apply(t)},this.unapply=function(t){for(var e=this.transforms.length-1;e>=0;e--)this.transforms[e].unapply(t)},this.applyToPoint=function(t){for(var e=0;e<this.transforms.length;e++)this.transforms[e].applyToPoint(t)};for(var i=r.trim(r.compressSpaces(t)).replace(/\)([a-zA-Z])/g,") $1").replace(/\)(\s?,\s?)/g,") ").split(/\s(?=[a-z])/),n=0;n<i.length;n++){var s=r.trim(i[n].split("(")[0]),a=i[n].split("(")[1].replace(")",""),o=this.Type[s];if(void 0!==o){var l=new o(a);l.type=s,this.transforms.push(l)}}},r.AspectRatio=function(t,e,i,n,s,a,o,l,h,u){var c=(e=(e=r.compressSpaces(e)).replace(/^defer\s/,"")).split(" ")[0]||"xMidYMid",f=e.split(" ")[1]||"meet",m=i/n,p=s/a,d=Math.min(m,p),y=Math.max(m,p);"meet"==f&&(n*=d,a*=d),"slice"==f&&(n*=y,a*=y),h=new r.Property("refX",h),u=new r.Property("refY",u),h.hasValue()&&u.hasValue()?t.translate(-d*h.toPixels("x"),-d*u.toPixels("y")):(c.match(/^xMid/)&&("meet"==f&&d==p||"slice"==f&&y==p)&&t.translate(i/2-n/2,0),c.match(/YMid$/)&&("meet"==f&&d==m||"slice"==f&&y==m)&&t.translate(0,s/2-a/2),c.match(/^xMax/)&&("meet"==f&&d==p||"slice"==f&&y==p)&&t.translate(i-n,0),c.match(/YMax$/)&&("meet"==f&&d==m||"slice"==f&&y==m)&&t.translate(0,s-a)),"none"==c?t.scale(m,p):"meet"==f?t.scale(d,d):"slice"==f&&t.scale(y,y),t.translate(null==o?0:-o,null==l?0:-l)},r.Element={},r.EmptyProperty=new r.Property("EMPTY",""),r.Element.ElementBase=function(t){this.attributes={},this.styles={},this.stylesSpecificity={},this.children=[],this.attribute=function(t,e){var i=this.attributes[t];return null!=i?i:(1==e&&(i=new r.Property(t,""),this.attributes[t]=i),i||r.EmptyProperty)},this.getHrefAttribute=function(){for(var t in this.attributes)if("href"==t||t.match(/:href$/))return this.attributes[t];return r.EmptyProperty},this.style=function(t,e,i){var n=this.styles[t];if(null!=n)return n;var s=this.attribute(t);if(null!=s&&s.hasValue())return this.styles[t]=s,s;if(1!=i){var a=this.parent;if(null!=a){var o=a.style(t);if(null!=o&&o.hasValue())return o}}return 1==e&&(n=new r.Property(t,""),this.styles[t]=n),n||r.EmptyProperty},this.render=function(t){if("none"!=this.style("display").value&&"hidden"!=this.style("visibility").value){if(t.save(),this.style("mask").hasValue()){var e=this.style("mask").getDefinition();null!=e&&e.apply(t,this)}else if(this.style("filter").hasValue()){var i=this.style("filter").getDefinition();null!=i&&i.apply(t,this)}else this.setContext(t),this.renderChildren(t),this.clearContext(t);t.restore()}},this.setContext=function(t){},this.clearContext=function(t){},this.renderChildren=function(t){for(var e=0;e<this.children.length;e++)this.children[e].render(t)},this.addChild=function(t,e){var i=t;e&&(i=r.CreateElement(t)),i.parent=this,"title"!=i.type&&this.children.push(i)},this.addStylesFromStyleDefinition=function(){for(var e in r.Styles)if("@"!=e[0]&&a(t,e)){var i=r.Styles[e],n=r.StylesSpecificity[e];if(null!=i)for(var s in i){var o=this.stylesSpecificity[s];void 0===o&&(o="000"),n>o&&(this.styles[s]=i[s],this.stylesSpecificity[s]=n)}}};var e=new RegExp("^[A-Z-]+$");if(null!=t&&1==t.nodeType){for(o=0;o<t.attributes.length;o++){var i=t.attributes[o],n=function(t){return e.test(t)?t.toLowerCase():t}(i.nodeName);this.attributes[n]=new r.Property(n,i.value)}if(this.addStylesFromStyleDefinition(),this.attribute("style").hasValue())for(var s=this.attribute("style").value.split(";"),o=0;o<s.length;o++)if(""!=r.trim(s[o])){var l=s[o].split(":"),h=r.trim(l[0]),u=r.trim(l[1]);this.styles[h]=new r.Property(h,u)}this.attribute("id").hasValue()&&null==r.Definitions[this.attribute("id").value]&&(r.Definitions[this.attribute("id").value]=this);for(o=0;o<t.childNodes.length;o++){var c=t.childNodes[o];if(1==c.nodeType&&this.addChild(c,!0),this.captureTextNodes&&(3==c.nodeType||4==c.nodeType)){var f=c.value||c.text||c.textContent||"";""!=r.compressSpaces(f)&&this.addChild(new r.Element.tspan(c),!1)}}}},r.Element.RenderedElementBase=function(t){this.base=r.Element.ElementBase,this.base(t),this.setContext=function(t){if(this.style("fill").isUrlDefinition()?null!=(i=this.style("fill").getFillStyleDefinition(this,this.style("fill-opacity")))&&(t.fillStyle=i):this.style("fill").hasValue()&&("currentColor"==(e=this.style("fill")).value&&(e.value=this.style("color").value),"inherit"!=e.value&&(t.fillStyle="none"==e.value?"rgba(0,0,0,0)":e.value)),this.style("fill-opacity").hasValue()){var e=new r.Property("fill",t.fillStyle);e=e.addOpacity(this.style("fill-opacity")),t.fillStyle=e.value}if(this.style("stroke").isUrlDefinition()){var i=this.style("stroke").getFillStyleDefinition(this,this.style("stroke-opacity"));null!=i&&(t.strokeStyle=i)}else this.style("stroke").hasValue()&&("currentColor"==(n=this.style("stroke")).value&&(n.value=this.style("color").value),"inherit"!=n.value&&(t.strokeStyle="none"==n.value?"rgba(0,0,0,0)":n.value));if(this.style("stroke-opacity").hasValue()){var n=new r.Property("stroke",t.strokeStyle);n=n.addOpacity(this.style("stroke-opacity")),t.strokeStyle=n.value}if(this.style("stroke-width").hasValue()){var s=this.style("stroke-width").toPixels();t.lineWidth=0==s?.001:s}if(this.style("stroke-linecap").hasValue()&&(t.lineCap=this.style("stroke-linecap").value),this.style("stroke-linejoin").hasValue()&&(t.lineJoin=this.style("stroke-linejoin").value),this.style("stroke-miterlimit").hasValue()&&(t.miterLimit=this.style("stroke-miterlimit").value),this.style("stroke-dasharray").hasValue()&&"none"!=this.style("stroke-dasharray").value){var a=r.ToNumberArray(this.style("stroke-dasharray").value);void 0!==t.setLineDash?t.setLineDash(a):void 0!==t.webkitLineDash?t.webkitLineDash=a:void 0===t.mozDash||1==a.length&&0==a[0]||(t.mozDash=a);var o=this.style("stroke-dashoffset").numValueOrDefault(1);void 0!==t.lineDashOffset?t.lineDashOffset=o:void 0!==t.webkitLineDashOffset?t.webkitLineDashOffset=o:void 0!==t.mozDashOffset&&(t.mozDashOffset=o)}if(void 0!==t.font&&(t.font=r.Font.CreateFont(this.style("font-style").value,this.style("font-variant").value,this.style("font-weight").value,this.style("font-size").hasValue()?this.style("font-size").toPixels()+"px":"",this.style("font-family").value).toString()),this.style("transform",!1,!0).hasValue()&&new r.Transform(this.style("transform",!1,!0).value).apply(t),this.style("clip-path",!1,!0).hasValue()){var l=this.style("clip-path",!1,!0).getDefinition();null!=l&&l.apply(t)}this.style("opacity").hasValue()&&(t.globalAlpha=this.style("opacity").numValue())}},r.Element.RenderedElementBase.prototype=new r.Element.ElementBase,r.Element.PathElementBase=function(t){this.base=r.Element.RenderedElementBase,this.base(t),this.path=function(t){return null!=t&&t.beginPath(),new r.BoundingBox},this.renderChildren=function(t){this.path(t),r.Mouse.checkPath(this,t),""!=t.fillStyle&&("inherit"!=this.style("fill-rule").valueOrDefault("inherit")?t.fill(this.style("fill-rule").value):t.fill()),""!=t.strokeStyle&&t.stroke();var e=this.getMarkers();if(null!=e){if(this.style("marker-start").isUrlDefinition()&&(i=this.style("marker-start").getDefinition()).render(t,e[0][0],e[0][1]),this.style("marker-mid").isUrlDefinition())for(var i=this.style("marker-mid").getDefinition(),n=1;n<e.length-1;n++)i.render(t,e[n][0],e[n][1]);this.style("marker-end").isUrlDefinition()&&(i=this.style("marker-end").getDefinition()).render(t,e[e.length-1][0],e[e.length-1][1])}},this.getBoundingBox=function(){return this.path()},this.getMarkers=function(){return null}},r.Element.PathElementBase.prototype=new r.Element.RenderedElementBase,r.Element.svg=function(t){this.base=r.Element.RenderedElementBase,this.base(t),this.baseClearContext=this.clearContext,this.clearContext=function(t){this.baseClearContext(t),r.ViewPort.RemoveCurrent()},this.baseSetContext=this.setContext,this.setContext=function(t){t.strokeStyle="rgba(0,0,0,0)",t.lineCap="butt",t.lineJoin="miter",t.miterLimit=4,void 0!==t.font&&void 0!==window.getComputedStyle&&(t.font=window.getComputedStyle(t.canvas).getPropertyValue("font")),this.baseSetContext(t),this.attribute("x").hasValue()||(this.attribute("x",!0).value=0),this.attribute("y").hasValue()||(this.attribute("y",!0).value=0),t.translate(this.attribute("x").toPixels("x"),this.attribute("y").toPixels("y"));var e=r.ViewPort.width(),i=r.ViewPort.height();if(this.attribute("width").hasValue()||(this.attribute("width",!0).value="100%"),this.attribute("height").hasValue()||(this.attribute("height",!0).value="100%"),void 0===this.root){e=this.attribute("width").toPixels("x"),i=this.attribute("height").toPixels("y");var n=0,s=0;this.attribute("refX").hasValue()&&this.attribute("refY").hasValue()&&(n=-this.attribute("refX").toPixels("x"),s=-this.attribute("refY").toPixels("y")),"visible"!=this.attribute("overflow").valueOrDefault("hidden")&&(t.beginPath(),t.moveTo(n,s),t.lineTo(e,s),t.lineTo(e,i),t.lineTo(n,i),t.closePath(),t.clip())}if(r.ViewPort.SetCurrent(e,i),this.attribute("viewBox").hasValue()){var a=r.ToNumberArray(this.attribute("viewBox").value),o=a[0],l=a[1];e=a[2],i=a[3],r.AspectRatio(t,this.attribute("preserveAspectRatio").value,r.ViewPort.width(),e,r.ViewPort.height(),i,o,l,this.attribute("refX").value,this.attribute("refY").value),r.ViewPort.RemoveCurrent(),r.ViewPort.SetCurrent(a[2],a[3])}}},r.Element.svg.prototype=new r.Element.RenderedElementBase,r.Element.rect=function(t){this.base=r.Element.PathElementBase,this.base(t),this.path=function(t){var e=this.attribute("x").toPixels("x"),i=this.attribute("y").toPixels("y"),n=this.attribute("width").toPixels("x"),s=this.attribute("height").toPixels("y"),a=this.attribute("rx").toPixels("x"),o=this.attribute("ry").toPixels("y");return this.attribute("rx").hasValue()&&!this.attribute("ry").hasValue()&&(o=a),this.attribute("ry").hasValue()&&!this.attribute("rx").hasValue()&&(a=o),a=Math.min(a,n/2),o=Math.min(o,s/2),null!=t&&(t.beginPath(),t.moveTo(e+a,i),t.lineTo(e+n-a,i),t.quadraticCurveTo(e+n,i,e+n,i+o),t.lineTo(e+n,i+s-o),t.quadraticCurveTo(e+n,i+s,e+n-a,i+s),t.lineTo(e+a,i+s),t.quadraticCurveTo(e,i+s,e,i+s-o),t.lineTo(e,i+o),t.quadraticCurveTo(e,i,e+a,i),t.closePath()),new r.BoundingBox(e,i,e+n,i+s)}},r.Element.rect.prototype=new r.Element.PathElementBase,r.Element.circle=function(t){this.base=r.Element.PathElementBase,this.base(t),this.path=function(t){var e=this.attribute("cx").toPixels("x"),i=this.attribute("cy").toPixels("y"),n=this.attribute("r").toPixels();return null!=t&&(t.beginPath(),t.arc(e,i,n,0,2*Math.PI,!0),t.closePath()),new r.BoundingBox(e-n,i-n,e+n,i+n)}},r.Element.circle.prototype=new r.Element.PathElementBase,r.Element.ellipse=function(t){this.base=r.Element.PathElementBase,this.base(t),this.path=function(t){var e=(Math.sqrt(2)-1)/3*4,i=this.attribute("rx").toPixels("x"),n=this.attribute("ry").toPixels("y"),s=this.attribute("cx").toPixels("x"),a=this.attribute("cy").toPixels("y");return null!=t&&(t.beginPath(),t.moveTo(s,a-n),t.bezierCurveTo(s+e*i,a-n,s+i,a-e*n,s+i,a),t.bezierCurveTo(s+i,a+e*n,s+e*i,a+n,s,a+n),t.bezierCurveTo(s-e*i,a+n,s-i,a+e*n,s-i,a),t.bezierCurveTo(s-i,a-e*n,s-e*i,a-n,s,a-n),t.closePath()),new r.BoundingBox(s-i,a-n,s+i,a+n)}},r.Element.ellipse.prototype=new r.Element.PathElementBase,r.Element.line=function(t){this.base=r.Element.PathElementBase,this.base(t),this.getPoints=function(){return[new r.Point(this.attribute("x1").toPixels("x"),this.attribute("y1").toPixels("y")),new r.Point(this.attribute("x2").toPixels("x"),this.attribute("y2").toPixels("y"))]},this.path=function(t){var e=this.getPoints();return null!=t&&(t.beginPath(),t.moveTo(e[0].x,e[0].y),t.lineTo(e[1].x,e[1].y)),new r.BoundingBox(e[0].x,e[0].y,e[1].x,e[1].y)},this.getMarkers=function(){var t=this.getPoints(),e=t[0].angleTo(t[1]);return[[t[0],e],[t[1],e]]}},r.Element.line.prototype=new r.Element.PathElementBase,r.Element.polyline=function(t){this.base=r.Element.PathElementBase,this.base(t),this.points=r.CreatePath(this.attribute("points").value),this.path=function(t){var e=new r.BoundingBox(this.points[0].x,this.points[0].y);null!=t&&(t.beginPath(),t.moveTo(this.points[0].x,this.points[0].y));for(var i=1;i<this.points.length;i++)e.addPoint(this.points[i].x,this.points[i].y),null!=t&&t.lineTo(this.points[i].x,this.points[i].y);return e},this.getMarkers=function(){for(var t=[],e=0;e<this.points.length-1;e++)t.push([this.points[e],this.points[e].angleTo(this.points[e+1])]);return t.length>0&&t.push([this.points[this.points.length-1],t[t.length-1][1]]),t}},r.Element.polyline.prototype=new r.Element.PathElementBase,r.Element.polygon=function(t){this.base=r.Element.polyline,this.base(t),this.basePath=this.path,this.path=function(t){var e=this.basePath(t);return null!=t&&(t.lineTo(this.points[0].x,this.points[0].y),t.closePath()),e}},r.Element.polygon.prototype=new r.Element.polyline,r.Element.path=function(t){this.base=r.Element.PathElementBase,this.base(t);var e=this.attribute("d").value;e=e.replace(/,/gm," ");for(i=0;i<2;i++)e=e.replace(/([MmZzLlHhVvCcSsQqTtAa])([^\s])/gm,"$1 $2");e=(e=e.replace(/([^\s])([MmZzLlHhVvCcSsQqTtAa])/gm,"$1 $2")).replace(/([0-9])([+\-])/gm,"$1 $2");for(var i=0;i<2;i++)e=e.replace(/(\.[0-9]*)(\.)/gm,"$1 $2");e=e.replace(/([Aa](\s+[0-9]+){3})\s+([01])\s*([01])/gm,"$1 $3 $4 "),e=r.compressSpaces(e),e=r.trim(e),this.PathParser=new function(t){this.tokens=t.split(" "),this.reset=function(){this.i=-1,this.command="",this.previousCommand="",this.start=new r.Point(0,0),this.control=new r.Point(0,0),this.current=new r.Point(0,0),this.points=[],this.angles=[]},this.isEnd=function(){return this.i>=this.tokens.length-1},this.isCommandOrEnd=function(){return!!this.isEnd()||null!=this.tokens[this.i+1].match(/^[A-Za-z]$/)},this.isRelativeCommand=function(){switch(this.command){case"m":case"l":case"h":case"v":case"c":case"s":case"q":case"t":case"a":case"z":return!0}return!1},this.getToken=function(){return this.i++,this.tokens[this.i]},this.getScalar=function(){return parseFloat(this.getToken())},this.nextCommand=function(){this.previousCommand=this.command,this.command=this.getToken()},this.getPoint=function(){var t=new r.Point(this.getScalar(),this.getScalar());return this.makeAbsolute(t)},this.getAsControlPoint=function(){var t=this.getPoint();return this.control=t,t},this.getAsCurrentPoint=function(){var t=this.getPoint();return this.current=t,t},this.getReflectedControlPoint=function(){return"c"!=this.previousCommand.toLowerCase()&&"s"!=this.previousCommand.toLowerCase()&&"q"!=this.previousCommand.toLowerCase()&&"t"!=this.previousCommand.toLowerCase()?this.current:new r.Point(2*this.current.x-this.control.x,2*this.current.y-this.control.y)},this.makeAbsolute=function(t){return this.isRelativeCommand()&&(t.x+=this.current.x,t.y+=this.current.y),t},this.addMarker=function(t,e,i){null!=i&&this.angles.length>0&&null==this.angles[this.angles.length-1]&&(this.angles[this.angles.length-1]=this.points[this.points.length-1].angleTo(i)),this.addMarkerAngle(t,null==e?null:e.angleTo(t))},this.addMarkerAngle=function(t,e){this.points.push(t),this.angles.push(e)},this.getMarkerPoints=function(){return this.points},this.getMarkerAngles=function(){for(var t=0;t<this.angles.length;t++)if(null==this.angles[t])for(var e=t+1;e<this.angles.length;e++)if(null!=this.angles[e]){this.angles[t]=this.angles[e];break}return this.angles}}(e),this.path=function(t){var e=this.PathParser;e.reset();var i=new r.BoundingBox;for(null!=t&&t.beginPath();!e.isEnd();)switch(e.nextCommand(),e.command){case"M":case"m":s=e.getAsCurrentPoint();for(e.addMarker(s),i.addPoint(s.x,s.y),null!=t&&t.moveTo(s.x,s.y),e.start=e.current;!e.isCommandOrEnd();){s=e.getAsCurrentPoint();e.addMarker(s,e.start),i.addPoint(s.x,s.y),null!=t&&t.lineTo(s.x,s.y)}break;case"L":case"l":for(;!e.isCommandOrEnd();){var n=e.current,s=e.getAsCurrentPoint();e.addMarker(s,n),i.addPoint(s.x,s.y),null!=t&&t.lineTo(s.x,s.y)}break;case"H":case"h":for(;!e.isCommandOrEnd();){a=new r.Point((e.isRelativeCommand()?e.current.x:0)+e.getScalar(),e.current.y);e.addMarker(a,e.current),e.current=a,i.addPoint(e.current.x,e.current.y),null!=t&&t.lineTo(e.current.x,e.current.y)}break;case"V":case"v":for(;!e.isCommandOrEnd();){var a=new r.Point(e.current.x,(e.isRelativeCommand()?e.current.y:0)+e.getScalar());e.addMarker(a,e.current),e.current=a,i.addPoint(e.current.x,e.current.y),null!=t&&t.lineTo(e.current.x,e.current.y)}break;case"C":case"c":for(;!e.isCommandOrEnd();){var o=e.current,l=e.getPoint(),h=e.getAsControlPoint(),u=e.getAsCurrentPoint();e.addMarker(u,h,l),i.addBezierCurve(o.x,o.y,l.x,l.y,h.x,h.y,u.x,u.y),null!=t&&t.bezierCurveTo(l.x,l.y,h.x,h.y,u.x,u.y)}break;case"S":case"s":for(;!e.isCommandOrEnd();){var o=e.current,l=e.getReflectedControlPoint(),h=e.getAsControlPoint(),u=e.getAsCurrentPoint();e.addMarker(u,h,l),i.addBezierCurve(o.x,o.y,l.x,l.y,h.x,h.y,u.x,u.y),null!=t&&t.bezierCurveTo(l.x,l.y,h.x,h.y,u.x,u.y)}break;case"Q":case"q":for(;!e.isCommandOrEnd();){var o=e.current,h=e.getAsControlPoint(),u=e.getAsCurrentPoint();e.addMarker(u,h,h),i.addQuadraticCurve(o.x,o.y,h.x,h.y,u.x,u.y),null!=t&&t.quadraticCurveTo(h.x,h.y,u.x,u.y)}break;case"T":case"t":for(;!e.isCommandOrEnd();){var o=e.current,h=e.getReflectedControlPoint();e.control=h;u=e.getAsCurrentPoint();e.addMarker(u,h,h),i.addQuadraticCurve(o.x,o.y,h.x,h.y,u.x,u.y),null!=t&&t.quadraticCurveTo(h.x,h.y,u.x,u.y)}break;case"A":case"a":for(;!e.isCommandOrEnd();){var o=e.current,c=e.getScalar(),f=e.getScalar(),m=e.getScalar()*(Math.PI/180),p=e.getScalar(),d=e.getScalar(),u=e.getAsCurrentPoint(),y=new r.Point(Math.cos(m)*(o.x-u.x)/2+Math.sin(m)*(o.y-u.y)/2,-Math.sin(m)*(o.x-u.x)/2+Math.cos(m)*(o.y-u.y)/2),v=Math.pow(y.x,2)/Math.pow(c,2)+Math.pow(y.y,2)/Math.pow(f,2);v>1&&(c*=Math.sqrt(v),f*=Math.sqrt(v));var g=(p==d?-1:1)*Math.sqrt((Math.pow(c,2)*Math.pow(f,2)-Math.pow(c,2)*Math.pow(y.y,2)-Math.pow(f,2)*Math.pow(y.x,2))/(Math.pow(c,2)*Math.pow(y.y,2)+Math.pow(f,2)*Math.pow(y.x,2)));isNaN(g)&&(g=0);var x=new r.Point(g*c*y.y/f,g*-f*y.x/c),b=new r.Point((o.x+u.x)/2+Math.cos(m)*x.x-Math.sin(m)*x.y,(o.y+u.y)/2+Math.sin(m)*x.x+Math.cos(m)*x.y),P=function(t){return Math.sqrt(Math.pow(t[0],2)+Math.pow(t[1],2))},E=function(t,e){return(t[0]*e[0]+t[1]*e[1])/(P(t)*P(e))},w=function(t,e){return(t[0]*e[1]<t[1]*e[0]?-1:1)*Math.acos(E(t,e))},B=w([1,0],[(y.x-x.x)/c,(y.y-x.y)/f]),C=[(y.x-x.x)/c,(y.y-x.y)/f],T=[(-y.x-x.x)/c,(-y.y-x.y)/f],V=w(C,T);E(C,T)<=-1&&(V=Math.PI),E(C,T)>=1&&(V=0);var M=1-d?1:-1,S=B+M*(V/2),k=new r.Point(b.x+c*Math.cos(S),b.y+f*Math.sin(S));if(e.addMarkerAngle(k,S-M*Math.PI/2),e.addMarkerAngle(u,S-M*Math.PI),i.addPoint(u.x,u.y),null!=t){var E=c>f?c:f,D=c>f?1:c/f,A=c>f?f/c:1;t.translate(b.x,b.y),t.rotate(m),t.scale(D,A),t.arc(0,0,E,B,B+V,1-d),t.scale(1/D,1/A),t.rotate(-m),t.translate(-b.x,-b.y)}}break;case"Z":case"z":null!=t&&t.closePath(),e.current=e.start}return i},this.getMarkers=function(){for(var t=this.PathParser.getMarkerPoints(),e=this.PathParser.getMarkerAngles(),i=[],n=0;n<t.length;n++)i.push([t[n],e[n]]);return i}},r.Element.path.prototype=new r.Element.PathElementBase,r.Element.pattern=function(t){this.base=r.Element.ElementBase,this.base(t),this.createPattern=function(t,e){var i=this.attribute("width").toPixels("x",!0),n=this.attribute("height").toPixels("y",!0),s=new r.Element.svg;s.attributes.viewBox=new r.Property("viewBox",this.attribute("viewBox").value),s.attributes.width=new r.Property("width",i+"px"),s.attributes.height=new r.Property("height",n+"px"),s.attributes.transform=new r.Property("transform",this.attribute("patternTransform").value),s.children=this.children;var a=document.createElement("canvas");a.width=i,a.height=n;var o=a.getContext("2d");this.attribute("x").hasValue()&&this.attribute("y").hasValue()&&o.translate(this.attribute("x").toPixels("x",!0),this.attribute("y").toPixels("y",!0));for(var l=-1;l<=1;l++)for(var h=-1;h<=1;h++)o.save(),s.attributes.x=new r.Property("x",l*a.width),s.attributes.y=new r.Property("y",h*a.height),s.render(o),o.restore();return t.createPattern(a,"repeat")}},r.Element.pattern.prototype=new r.Element.ElementBase,r.Element.marker=function(t){this.base=r.Element.ElementBase,this.base(t),this.baseRender=this.render,this.render=function(t,e,i){t.translate(e.x,e.y),"auto"==this.attribute("orient").valueOrDefault("auto")&&t.rotate(i),"strokeWidth"==this.attribute("markerUnits").valueOrDefault("strokeWidth")&&t.scale(t.lineWidth,t.lineWidth),t.save();var n=new r.Element.svg;n.attributes.viewBox=new r.Property("viewBox",this.attribute("viewBox").value),n.attributes.refX=new r.Property("refX",this.attribute("refX").value),n.attributes.refY=new r.Property("refY",this.attribute("refY").value),n.attributes.width=new r.Property("width",this.attribute("markerWidth").value),n.attributes.height=new r.Property("height",this.attribute("markerHeight").value),n.attributes.fill=new r.Property("fill",this.attribute("fill").valueOrDefault("black")),n.attributes.stroke=new r.Property("stroke",this.attribute("stroke").valueOrDefault("none")),n.children=this.children,n.render(t),t.restore(),"strokeWidth"==this.attribute("markerUnits").valueOrDefault("strokeWidth")&&t.scale(1/t.lineWidth,1/t.lineWidth),"auto"==this.attribute("orient").valueOrDefault("auto")&&t.rotate(-i),t.translate(-e.x,-e.y)}},r.Element.marker.prototype=new r.Element.ElementBase,r.Element.defs=function(t){this.base=r.Element.ElementBase,this.base(t),this.render=function(t){}},r.Element.defs.prototype=new r.Element.ElementBase,r.Element.GradientBase=function(t){this.base=r.Element.ElementBase,this.base(t),this.stops=[];for(var e=0;e<this.children.length;e++){var i=this.children[e];"stop"==i.type&&this.stops.push(i)}this.getGradient=function(){},this.gradientUnits=function(){return this.attribute("gradientUnits").valueOrDefault("objectBoundingBox")},this.attributesToInherit=["gradientUnits"],this.inheritStopContainer=function(t){for(var e=0;e<this.attributesToInherit.length;e++){var i=this.attributesToInherit[e];!this.attribute(i).hasValue()&&t.attribute(i).hasValue()&&(this.attribute(i,!0).value=t.attribute(i).value)}},this.createGradient=function(t,e,i){var n=this;this.getHrefAttribute().hasValue()&&(n=this.getHrefAttribute().getDefinition(),this.inheritStopContainer(n));var s=function(t){return i.hasValue()?new r.Property("color",t).addOpacity(i).value:t},a=this.getGradient(t,e);if(null==a)return s(n.stops[n.stops.length-1].color);for(var o=0;o<n.stops.length;o++)a.addColorStop(n.stops[o].offset,s(n.stops[o].color));if(this.attribute("gradientTransform").hasValue()){var l=r.ViewPort.viewPorts[0],h=new r.Element.rect;h.attributes.x=new r.Property("x",-r.MAX_VIRTUAL_PIXELS/3),h.attributes.y=new r.Property("y",-r.MAX_VIRTUAL_PIXELS/3),h.attributes.width=new r.Property("width",r.MAX_VIRTUAL_PIXELS),h.attributes.height=new r.Property("height",r.MAX_VIRTUAL_PIXELS);var u=new r.Element.g;u.attributes.transform=new r.Property("transform",this.attribute("gradientTransform").value),u.children=[h];var c=new r.Element.svg;c.attributes.x=new r.Property("x",0),c.attributes.y=new r.Property("y",0),c.attributes.width=new r.Property("width",l.width),c.attributes.height=new r.Property("height",l.height),c.children=[u];var f=document.createElement("canvas");f.width=l.width,f.height=l.height;var m=f.getContext("2d");return m.fillStyle=a,c.render(m),m.createPattern(f,"no-repeat")}return a}},r.Element.GradientBase.prototype=new r.Element.ElementBase,r.Element.linearGradient=function(t){this.base=r.Element.GradientBase,this.base(t),this.attributesToInherit.push("x1"),this.attributesToInherit.push("y1"),this.attributesToInherit.push("x2"),this.attributesToInherit.push("y2"),this.getGradient=function(t,e){var i="objectBoundingBox"==this.gradientUnits()?e.getBoundingBox():null;this.attribute("x1").hasValue()||this.attribute("y1").hasValue()||this.attribute("x2").hasValue()||this.attribute("y2").hasValue()||(this.attribute("x1",!0).value=0,this.attribute("y1",!0).value=0,this.attribute("x2",!0).value=1,this.attribute("y2",!0).value=0);var n="objectBoundingBox"==this.gradientUnits()?i.x()+i.width()*this.attribute("x1").numValue():this.attribute("x1").toPixels("x"),s="objectBoundingBox"==this.gradientUnits()?i.y()+i.height()*this.attribute("y1").numValue():this.attribute("y1").toPixels("y"),a="objectBoundingBox"==this.gradientUnits()?i.x()+i.width()*this.attribute("x2").numValue():this.attribute("x2").toPixels("x"),r="objectBoundingBox"==this.gradientUnits()?i.y()+i.height()*this.attribute("y2").numValue():this.attribute("y2").toPixels("y");return n==a&&s==r?null:t.createLinearGradient(n,s,a,r)}},r.Element.linearGradient.prototype=new r.Element.GradientBase,r.Element.radialGradient=function(t){this.base=r.Element.GradientBase,this.base(t),this.attributesToInherit.push("cx"),this.attributesToInherit.push("cy"),this.attributesToInherit.push("r"),this.attributesToInherit.push("fx"),this.attributesToInherit.push("fy"),this.getGradient=function(t,e){var i=e.getBoundingBox();this.attribute("cx").hasValue()||(this.attribute("cx",!0).value="50%"),this.attribute("cy").hasValue()||(this.attribute("cy",!0).value="50%"),this.attribute("r").hasValue()||(this.attribute("r",!0).value="50%");var n="objectBoundingBox"==this.gradientUnits()?i.x()+i.width()*this.attribute("cx").numValue():this.attribute("cx").toPixels("x"),s="objectBoundingBox"==this.gradientUnits()?i.y()+i.height()*this.attribute("cy").numValue():this.attribute("cy").toPixels("y"),a=n,r=s;this.attribute("fx").hasValue()&&(a="objectBoundingBox"==this.gradientUnits()?i.x()+i.width()*this.attribute("fx").numValue():this.attribute("fx").toPixels("x")),this.attribute("fy").hasValue()&&(r="objectBoundingBox"==this.gradientUnits()?i.y()+i.height()*this.attribute("fy").numValue():this.attribute("fy").toPixels("y"));var o="objectBoundingBox"==this.gradientUnits()?(i.width()+i.height())/2*this.attribute("r").numValue():this.attribute("r").toPixels();return t.createRadialGradient(a,r,0,n,s,o)}},r.Element.radialGradient.prototype=new r.Element.GradientBase,r.Element.stop=function(t){this.base=r.Element.ElementBase,this.base(t),this.offset=this.attribute("offset").numValue(),this.offset<0&&(this.offset=0),this.offset>1&&(this.offset=1);var e=this.style("stop-color",!0);""===e.value&&(e.value="#000"),this.style("stop-opacity").hasValue()&&(e=e.addOpacity(this.style("stop-opacity"))),this.color=e.value},r.Element.stop.prototype=new r.Element.ElementBase,r.Element.AnimateBase=function(t){this.base=r.Element.ElementBase,this.base(t),r.Animations.push(this),this.duration=0,this.begin=this.attribute("begin").toMilliseconds(),this.maxDuration=this.begin+this.attribute("dur").toMilliseconds(),this.getProperty=function(){var t=this.attribute("attributeType").value,e=this.attribute("attributeName").value;return"CSS"==t?this.parent.style(e,!0):this.parent.attribute(e,!0)},this.initialValue=null,this.initialUnits="",this.removed=!1,this.calcValue=function(){return""},this.update=function(t){if(null==this.initialValue&&(this.initialValue=this.getProperty().value,this.initialUnits=this.getProperty().getUnits()),this.duration>this.maxDuration){if("indefinite"==this.attribute("repeatCount").value||"indefinite"==this.attribute("repeatDur").value)this.duration=0;else if("freeze"!=this.attribute("fill").valueOrDefault("remove")||this.frozen){if("remove"==this.attribute("fill").valueOrDefault("remove")&&!this.removed)return this.removed=!0,this.getProperty().value=this.parent.animationFrozen?this.parent.animationFrozenValue:this.initialValue,!0}else this.frozen=!0,this.parent.animationFrozen=!0,this.parent.animationFrozenValue=this.getProperty().value;return!1}this.duration=this.duration+t;var e=!1;if(this.begin<this.duration){var i=this.calcValue();this.attribute("type").hasValue()&&(i=this.attribute("type").value+"("+i+")"),this.getProperty().value=i,e=!0}return e},this.from=this.attribute("from"),this.to=this.attribute("to"),this.values=this.attribute("values"),this.values.hasValue()&&(this.values.value=this.values.value.split(";")),this.progress=function(){var t={progress:(this.duration-this.begin)/(this.maxDuration-this.begin)};if(this.values.hasValue()){var e=t.progress*(this.values.value.length-1),i=Math.floor(e),n=Math.ceil(e);t.from=new r.Property("from",parseFloat(this.values.value[i])),t.to=new r.Property("to",parseFloat(this.values.value[n])),t.progress=(e-i)/(n-i)}else t.from=this.from,t.to=this.to;return t}},r.Element.AnimateBase.prototype=new r.Element.ElementBase,r.Element.animate=function(t){this.base=r.Element.AnimateBase,this.base(t),this.calcValue=function(){var t=this.progress();return t.from.numValue()+(t.to.numValue()-t.from.numValue())*t.progress+this.initialUnits}},r.Element.animate.prototype=new r.Element.AnimateBase,r.Element.animateColor=function(e){this.base=r.Element.AnimateBase,this.base(e),this.calcValue=function(){var e=this.progress(),i=new t(e.from.value),n=new t(e.to.value);if(i.ok&&n.ok){var s=i.r+(n.r-i.r)*e.progress,a=i.g+(n.g-i.g)*e.progress,r=i.b+(n.b-i.b)*e.progress;return"rgb("+parseInt(s,10)+","+parseInt(a,10)+","+parseInt(r,10)+")"}return this.attribute("from").value}},r.Element.animateColor.prototype=new r.Element.AnimateBase,r.Element.animateTransform=function(t){this.base=r.Element.AnimateBase,this.base(t),this.calcValue=function(){for(var t=this.progress(),e=r.ToNumberArray(t.from.value),i=r.ToNumberArray(t.to.value),n="",s=0;s<e.length;s++)n+=e[s]+(i[s]-e[s])*t.progress+" ";return n}},r.Element.animateTransform.prototype=new r.Element.animate,r.Element.font=function(t){this.base=r.Element.ElementBase,this.base(t),this.horizAdvX=this.attribute("horiz-adv-x").numValue(),this.isRTL=!1,this.isArabic=!1,this.fontFace=null,this.missingGlyph=null,this.glyphs=[];for(var e=0;e<this.children.length;e++){var i=this.children[e];"font-face"==i.type?(this.fontFace=i,i.style("font-family").hasValue()&&(r.Definitions[i.style("font-family").value]=this)):"missing-glyph"==i.type?this.missingGlyph=i:"glyph"==i.type&&(""!=i.arabicForm?(this.isRTL=!0,this.isArabic=!0,void 0===this.glyphs[i.unicode]&&(this.glyphs[i.unicode]=[]),this.glyphs[i.unicode][i.arabicForm]=i):this.glyphs[i.unicode]=i)}},r.Element.font.prototype=new r.Element.ElementBase,r.Element.fontface=function(t){this.base=r.Element.ElementBase,this.base(t),this.ascent=this.attribute("ascent").value,this.descent=this.attribute("descent").value,this.unitsPerEm=this.attribute("units-per-em").numValue()},r.Element.fontface.prototype=new r.Element.ElementBase,r.Element.missingglyph=function(t){this.base=r.Element.path,this.base(t),this.horizAdvX=0},r.Element.missingglyph.prototype=new r.Element.path,r.Element.glyph=function(t){this.base=r.Element.path,this.base(t),this.horizAdvX=this.attribute("horiz-adv-x").numValue(),this.unicode=this.attribute("unicode").value,this.arabicForm=this.attribute("arabic-form").value},r.Element.glyph.prototype=new r.Element.path,r.Element.text=function(t){this.captureTextNodes=!0,this.base=r.Element.RenderedElementBase,this.base(t),this.baseSetContext=this.setContext,this.setContext=function(t){this.baseSetContext(t);var e=this.style("dominant-baseline").toTextBaseline();null==e&&(e=this.style("alignment-baseline").toTextBaseline()),null!=e&&(t.textBaseline=e)},this.getBoundingBox=function(){var t=this.attribute("x").toPixels("x"),e=this.attribute("y").toPixels("y"),i=this.parent.style("font-size").numValueOrDefault(r.Font.Parse(r.ctx.font).fontSize);return new r.BoundingBox(t,e-i,t+Math.floor(2*i/3)*this.children[0].getText().length,e)},this.renderChildren=function(t){this.x=this.attribute("x").toPixels("x"),this.y=this.attribute("y").toPixels("y"),this.attribute("dx").hasValue()&&(this.x+=this.attribute("dx").toPixels("x")),this.attribute("dy").hasValue()&&(this.y+=this.attribute("dy").toPixels("y")),this.x+=this.getAnchorDelta(t,this,0);for(var e=0;e<this.children.length;e++)this.renderChild(t,this,this,e)},this.getAnchorDelta=function(t,e,i){var n=this.style("text-anchor").valueOrDefault("start");if("start"!=n){for(var s=0,a=i;a<e.children.length;a++){var r=e.children[a];if(a>i&&r.attribute("x").hasValue())break;s+=r.measureTextRecursive(t)}return-1*("end"==n?s:s/2)}return 0},this.renderChild=function(t,e,i,n){var s=i.children[n];s.attribute("x").hasValue()?(s.x=s.attribute("x").toPixels("x")+e.getAnchorDelta(t,i,n),s.attribute("dx").hasValue()&&(s.x+=s.attribute("dx").toPixels("x"))):(s.attribute("dx").hasValue()&&(e.x+=s.attribute("dx").toPixels("x")),s.x=e.x),e.x=s.x+s.measureText(t),s.attribute("y").hasValue()?(s.y=s.attribute("y").toPixels("y"),s.attribute("dy").hasValue()&&(s.y+=s.attribute("dy").toPixels("y"))):(s.attribute("dy").hasValue()&&(e.y+=s.attribute("dy").toPixels("y")),s.y=e.y),e.y=s.y,s.render(t);for(var n=0;n<s.children.length;n++)e.renderChild(t,e,s,n)}},r.Element.text.prototype=new r.Element.RenderedElementBase,r.Element.TextElementBase=function(t){this.base=r.Element.RenderedElementBase,this.base(t),this.getGlyph=function(t,e,i){var n=e[i],s=null;if(t.isArabic){var a="isolated";(0==i||" "==e[i-1])&&i<e.length-2&&" "!=e[i+1]&&(a="terminal"),i>0&&" "!=e[i-1]&&i<e.length-2&&" "!=e[i+1]&&(a="medial"),i>0&&" "!=e[i-1]&&(i==e.length-1||" "==e[i+1])&&(a="initial"),void 0!==t.glyphs[n]&&null==(s=t.glyphs[n][a])&&"glyph"==t.glyphs[n].type&&(s=t.glyphs[n])}else s=t.glyphs[n];return null==s&&(s=t.missingGlyph),s},this.renderChildren=function(t){var e=this.parent.style("font-family").getDefinition();if(null==e)""!=t.fillStyle&&t.fillText(r.compressSpaces(this.getText()),this.x,this.y),""!=t.strokeStyle&&t.strokeText(r.compressSpaces(this.getText()),this.x,this.y);else{var i=this.parent.style("font-size").numValueOrDefault(r.Font.Parse(r.ctx.font).fontSize),n=this.parent.style("font-style").valueOrDefault(r.Font.Parse(r.ctx.font).fontStyle),s=this.getText();e.isRTL&&(s=s.split("").reverse().join(""));for(var a=r.ToNumberArray(this.parent.attribute("dx").value),o=0;o<s.length;o++){var l=this.getGlyph(e,s,o),h=i/e.fontFace.unitsPerEm;t.translate(this.x,this.y),t.scale(h,-h);var u=t.lineWidth;t.lineWidth=t.lineWidth*e.fontFace.unitsPerEm/i,"italic"==n&&t.transform(1,0,.4,1,0,0),l.render(t),"italic"==n&&t.transform(1,0,-.4,1,0,0),t.lineWidth=u,t.scale(1/h,-1/h),t.translate(-this.x,-this.y),this.x+=i*(l.horizAdvX||e.horizAdvX)/e.fontFace.unitsPerEm,void 0===a[o]||isNaN(a[o])||(this.x+=a[o])}}},this.getText=function(){},this.measureTextRecursive=function(t){for(var e=this.measureText(t),i=0;i<this.children.length;i++)e+=this.children[i].measureTextRecursive(t);return e},this.measureText=function(t){var e=this.parent.style("font-family").getDefinition();if(null!=e){var i=this.parent.style("font-size").numValueOrDefault(r.Font.Parse(r.ctx.font).fontSize),n=0,s=this.getText();e.isRTL&&(s=s.split("").reverse().join(""));for(var a=r.ToNumberArray(this.parent.attribute("dx").value),o=0;o<s.length;o++)n+=(this.getGlyph(e,s,o).horizAdvX||e.horizAdvX)*i/e.fontFace.unitsPerEm,void 0===a[o]||isNaN(a[o])||(n+=a[o]);return n}var l=r.compressSpaces(this.getText());if(!t.measureText)return 10*l.length;t.save(),this.setContext(t);var h=t.measureText(l).width;return t.restore(),h}},r.Element.TextElementBase.prototype=new r.Element.RenderedElementBase,r.Element.tspan=function(t){this.captureTextNodes=!0,this.base=r.Element.TextElementBase,this.base(t),this.text=r.compressSpaces(t.value||t.text||t.textContent||""),this.getText=function(){return this.children.length>0?"":this.text}},r.Element.tspan.prototype=new r.Element.TextElementBase,r.Element.tref=function(t){this.base=r.Element.TextElementBase,this.base(t),this.getText=function(){var t=this.getHrefAttribute().getDefinition();if(null!=t)return t.children[0].getText()}},r.Element.tref.prototype=new r.Element.TextElementBase,r.Element.a=function(t){this.base=r.Element.TextElementBase,this.base(t),this.hasText=t.childNodes.length>0;for(var e=0;e<t.childNodes.length;e++)3!=t.childNodes[e].nodeType&&(this.hasText=!1);this.text=this.hasText?t.childNodes[0].value:"",this.getText=function(){return this.text},this.baseRenderChildren=this.renderChildren,this.renderChildren=function(t){if(this.hasText){this.baseRenderChildren(t);var e=new r.Property("fontSize",r.Font.Parse(r.ctx.font).fontSize);r.Mouse.checkBoundingBox(this,new r.BoundingBox(this.x,this.y-e.toPixels("y"),this.x+this.measureText(t),this.y))}else if(this.children.length>0){var i=new r.Element.g;i.children=this.children,i.parent=this,i.render(t)}},this.onclick=function(){window.open(this.getHrefAttribute().value)},this.onmousemove=function(){r.ctx.canvas.style.cursor="pointer"}},r.Element.a.prototype=new r.Element.TextElementBase,r.Element.image=function(t){this.base=r.Element.RenderedElementBase,this.base(t);var e=this.getHrefAttribute().value;if(""!=e){var i=e.match(/\.svg$/);if(r.Images.push(this),this.loaded=!1,i)this.img=r.ajax(e),this.loaded=!0;else{this.img=document.createElement("img"),1==r.opts.useCORS&&(this.img.crossOrigin="Anonymous");var n=this;this.img.onload=function(){n.loaded=!0},this.img.onerror=function(){r.log('ERROR: image "'+e+'" not found'),n.loaded=!0},this.img.src=e}this.renderChildren=function(t){var e=this.attribute("x").toPixels("x"),n=this.attribute("y").toPixels("y"),s=this.attribute("width").toPixels("x"),a=this.attribute("height").toPixels("y");0!=s&&0!=a&&(t.save(),i?t.drawSvg(this.img,e,n,s,a):(t.translate(e,n),r.AspectRatio(t,this.attribute("preserveAspectRatio").value,s,this.img.width,a,this.img.height,0,0),t.drawImage(this.img,0,0)),t.restore())},this.getBoundingBox=function(){var t=this.attribute("x").toPixels("x"),e=this.attribute("y").toPixels("y"),i=this.attribute("width").toPixels("x"),n=this.attribute("height").toPixels("y");return new r.BoundingBox(t,e,t+i,e+n)}}},r.Element.image.prototype=new r.Element.RenderedElementBase,r.Element.g=function(t){this.base=r.Element.RenderedElementBase,this.base(t),this.getBoundingBox=function(){for(var t=new r.BoundingBox,e=0;e<this.children.length;e++)t.addBoundingBox(this.children[e].getBoundingBox());return t}},r.Element.g.prototype=new r.Element.RenderedElementBase,r.Element.symbol=function(t){this.base=r.Element.RenderedElementBase,this.base(t),this.render=function(t){}},r.Element.symbol.prototype=new r.Element.RenderedElementBase,r.Element.style=function(t){this.base=r.Element.ElementBase,this.base(t);for(var e="",i=0;i<t.childNodes.length;i++)e+=t.childNodes[i].data;e=e.replace(/(\/\*([^*]|[\r\n]|(\*+([^*\/]|[\r\n])))*\*+\/)|(^[\s]*\/\/.*)/gm,"");for(var s=(e=r.compressSpaces(e)).split("}"),i=0;i<s.length;i++)if(""!=r.trim(s[i]))for(var a=s[i].split("{"),o=a[0].split(","),l=a[1].split(";"),h=0;h<o.length;h++){var u=r.trim(o[h]);if(""!=u){for(var c=r.Styles[u]||{},f=0;f<l.length;f++){var m=l[f].indexOf(":"),p=l[f].substr(0,m),d=l[f].substr(m+1,l[f].length-m);null!=p&&null!=d&&(c[r.trim(p)]=new r.Property(r.trim(p),r.trim(d)))}if(r.Styles[u]=c,r.StylesSpecificity[u]=n(u),"@font-face"==u)for(var y=c["font-family"].value.replace(/"/g,""),v=c.src.value.split(","),g=0;g<v.length;g++)if(v[g].indexOf('format("svg")')>0)for(var x=v[g].indexOf("url"),b=v[g].indexOf(")",x),P=v[g].substr(x+5,b-x-6),E=r.parseXml(r.ajax(P)).getElementsByTagName("font"),w=0;w<E.length;w++){var B=r.CreateElement(E[w]);r.Definitions[y]=B}}}},r.Element.style.prototype=new r.Element.ElementBase,r.Element.use=function(t){this.base=r.Element.RenderedElementBase,this.base(t),this.baseSetContext=this.setContext,this.setContext=function(t){this.baseSetContext(t),this.attribute("x").hasValue()&&t.translate(this.attribute("x").toPixels("x"),0),this.attribute("y").hasValue()&&t.translate(0,this.attribute("y").toPixels("y"))};var e=this.getHrefAttribute().getDefinition();this.path=function(t){null!=e&&e.path(t)},this.getBoundingBox=function(){if(null!=e)return e.getBoundingBox()},this.renderChildren=function(t){if(null!=e){var i=e;"symbol"==e.type&&((i=new r.Element.svg).type="svg",i.attributes.viewBox=new r.Property("viewBox",e.attribute("viewBox").value),i.attributes.preserveAspectRatio=new r.Property("preserveAspectRatio",e.attribute("preserveAspectRatio").value),i.attributes.overflow=new r.Property("overflow",e.attribute("overflow").value),i.children=e.children),"svg"==i.type&&(this.attribute("width").hasValue()&&(i.attributes.width=new r.Property("width",this.attribute("width").value)),this.attribute("height").hasValue()&&(i.attributes.height=new r.Property("height",this.attribute("height").value)));var n=i.parent;i.parent=null,i.render(t),i.parent=n}}},r.Element.use.prototype=new r.Element.RenderedElementBase,r.Element.mask=function(t){this.base=r.Element.ElementBase,this.base(t),this.apply=function(t,e){var i=this.attribute("x").toPixels("x"),n=this.attribute("y").toPixels("y"),s=this.attribute("width").toPixels("x"),a=this.attribute("height").toPixels("y");if(0==s&&0==a){for(var o=new r.BoundingBox,l=0;l<this.children.length;l++)o.addBoundingBox(this.children[l].getBoundingBox());var i=Math.floor(o.x1),n=Math.floor(o.y1),s=Math.floor(o.width()),a=Math.floor(o.height())}var h=e.attribute("mask").value;e.attribute("mask").value="";var u=document.createElement("canvas");u.width=i+s,u.height=n+a;var c=u.getContext("2d");this.renderChildren(c);var f=document.createElement("canvas");f.width=i+s,f.height=n+a;var m=f.getContext("2d");e.render(m),m.globalCompositeOperation="destination-in",m.fillStyle=c.createPattern(u,"no-repeat"),m.fillRect(0,0,i+s,n+a),t.fillStyle=m.createPattern(f,"no-repeat"),t.fillRect(0,0,i+s,n+a),e.attribute("mask").value=h},this.render=function(t){}},r.Element.mask.prototype=new r.Element.ElementBase,r.Element.clipPath=function(t){this.base=r.Element.ElementBase,this.base(t),this.apply=function(t){var e=CanvasRenderingContext2D.prototype.beginPath;CanvasRenderingContext2D.prototype.beginPath=function(){};var i=CanvasRenderingContext2D.prototype.closePath;CanvasRenderingContext2D.prototype.closePath=function(){},e.call(t);for(var n=0;n<this.children.length;n++){var s=this.children[n];if(void 0!==s.path){var a=null;s.style("transform",!1,!0).hasValue()&&(a=new r.Transform(s.style("transform",!1,!0).value)).apply(t),s.path(t),CanvasRenderingContext2D.prototype.closePath=i,a&&a.unapply(t)}}i.call(t),t.clip(),CanvasRenderingContext2D.prototype.beginPath=e,CanvasRenderingContext2D.prototype.closePath=i},this.render=function(t){}},r.Element.clipPath.prototype=new r.Element.ElementBase,r.Element.filter=function(t){this.base=r.Element.ElementBase,this.base(t),this.apply=function(t,e){var i=e.getBoundingBox(),n=Math.floor(i.x1),s=Math.floor(i.y1),a=Math.floor(i.width()),r=Math.floor(i.height()),o=e.style("filter").value;e.style("filter").value="";for(var l=0,h=0,u=0;u<this.children.length;u++){var c=this.children[u].extraFilterDistance||0;l=Math.max(l,c),h=Math.max(h,c)}var f=document.createElement("canvas");f.width=a+2*l,f.height=r+2*h;var m=f.getContext("2d");m.translate(-n+l,-s+h),e.render(m);for(u=0;u<this.children.length;u++)"function"==typeof this.children[u].apply&&this.children[u].apply(m,0,0,a+2*l,r+2*h);t.drawImage(f,0,0,a+2*l,r+2*h,n-l,s-h,a+2*l,r+2*h),e.style("filter",!0).value=o},this.render=function(t){}},r.Element.filter.prototype=new r.Element.ElementBase,r.Element.feMorphology=function(t){this.base=r.Element.ElementBase,this.base(t),this.apply=function(t,e,i,n,s){}},r.Element.feMorphology.prototype=new r.Element.ElementBase,r.Element.feComposite=function(t){this.base=r.Element.ElementBase,this.base(t),this.apply=function(t,e,i,n,s){}},r.Element.feComposite.prototype=new r.Element.ElementBase,r.Element.feColorMatrix=function(t){function e(t,e,i,n,s,a){return t[i*n*4+4*e+a]}function i(t,e,i,n,s,a,r){t[i*n*4+4*e+a]=r}function n(t,e){var i=s[t];return i*(i<0?e-255:e)}this.base=r.Element.ElementBase,this.base(t);var s=r.ToNumberArray(this.attribute("values").value);switch(this.attribute("type").valueOrDefault("matrix")){case"saturate":var a=s[0];s=[.213+.787*a,.715-.715*a,.072-.072*a,0,0,.213-.213*a,.715+.285*a,.072-.072*a,0,0,.213-.213*a,.715-.715*a,.072+.928*a,0,0,0,0,0,1,0,0,0,0,0,1];break;case"hueRotate":var o=s[0]*Math.PI/180,l=function(t,e,i){return t+Math.cos(o)*e+Math.sin(o)*i};s=[l(.213,.787,-.213),l(.715,-.715,-.715),l(.072,-.072,.928),0,0,l(.213,-.213,.143),l(.715,.285,.14),l(.072,-.072,-.283),0,0,l(.213,-.213,-.787),l(.715,-.715,.715),l(.072,.928,.072),0,0,0,0,0,1,0,0,0,0,0,1];break;case"luminanceToAlpha":s=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,.2125,.7154,.0721,0,0,0,0,0,0,1]}this.apply=function(t,s,a,r,o){for(var l=t.getImageData(0,0,r,o),a=0;a<o;a++)for(var s=0;s<r;s++){var h=e(l.data,s,a,r,o,0),u=e(l.data,s,a,r,o,1),c=e(l.data,s,a,r,o,2),f=e(l.data,s,a,r,o,3);i(l.data,s,a,r,o,0,n(0,h)+n(1,u)+n(2,c)+n(3,f)+n(4,1)),i(l.data,s,a,r,o,1,n(5,h)+n(6,u)+n(7,c)+n(8,f)+n(9,1)),i(l.data,s,a,r,o,2,n(10,h)+n(11,u)+n(12,c)+n(13,f)+n(14,1)),i(l.data,s,a,r,o,3,n(15,h)+n(16,u)+n(17,c)+n(18,f)+n(19,1))}t.clearRect(0,0,r,o),t.putImageData(l,0,0)}},r.Element.feColorMatrix.prototype=new r.Element.ElementBase,r.Element.feGaussianBlur=function(t){this.base=r.Element.ElementBase,this.base(t),this.blurRadius=Math.floor(this.attribute("stdDeviation").numValue()),this.extraFilterDistance=this.blurRadius,this.apply=function(t,i,n,s,a){void 0!==e.canvasRGBA?(t.canvas.id=r.UniqueId(),t.canvas.style.display="none",document.body.appendChild(t.canvas),e.canvasRGBA(t.canvas.id,i,n,s,a,this.blurRadius),document.body.removeChild(t.canvas)):r.log("ERROR: StackBlur.js must be included for blur to work")}},r.Element.feGaussianBlur.prototype=new r.Element.ElementBase,r.Element.title=function(t){},r.Element.title.prototype=new r.Element.ElementBase,r.Element.desc=function(t){},r.Element.desc.prototype=new r.Element.ElementBase,r.Element.MISSING=function(t){r.log("ERROR: Element '"+t.nodeName+"' not yet implemented.")},r.Element.MISSING.prototype=new r.Element.ElementBase,r.CreateElement=function(t){var e=t.nodeName.replace(/^[^:]+:/,"");e=e.replace(/\-/g,"");var i=null;return i=void 0!==r.Element[e]?new r.Element[e](t):new r.Element.MISSING(t),i.type=t.nodeName,i},r.load=function(t,e){r.loadXml(t,r.ajax(e))},r.loadXml=function(t,e){r.loadXmlDoc(t,r.parseXml(e))},r.loadXmlDoc=function(t,e){r.init(t);var i=function(e){for(var i=t.canvas;i;)e.x-=i.offsetLeft,e.y-=i.offsetTop,i=i.offsetParent;return window.scrollX&&(e.x+=window.scrollX),window.scrollY&&(e.y+=window.scrollY),e};1!=r.opts.ignoreMouse&&(t.canvas.onclick=function(t){var e=i(new r.Point(null!=t?t.clientX:event.clientX,null!=t?t.clientY:event.clientY));r.Mouse.onclick(e.x,e.y)},t.canvas.onmousemove=function(t){var e=i(new r.Point(null!=t?t.clientX:event.clientX,null!=t?t.clientY:event.clientY));r.Mouse.onmousemove(e.x,e.y)});var n=r.CreateElement(e.documentElement);n.root=!0,n.addStylesFromStyleDefinition();var s=!0,a=function(){r.ViewPort.Clear(),t.canvas.parentNode&&r.ViewPort.SetCurrent(t.canvas.parentNode.clientWidth,t.canvas.parentNode.clientHeight),1!=r.opts.ignoreDimensions&&(n.style("width").hasValue()&&(t.canvas.width=n.style("width").toPixels("x"),t.canvas.style.width=t.canvas.width+"px"),n.style("height").hasValue()&&(t.canvas.height=n.style("height").toPixels("y"),t.canvas.style.height=t.canvas.height+"px"));var i=t.canvas.clientWidth||t.canvas.width,a=t.canvas.clientHeight||t.canvas.height;if(1==r.opts.ignoreDimensions&&n.style("width").hasValue()&&n.style("height").hasValue()&&(i=n.style("width").toPixels("x"),a=n.style("height").toPixels("y")),r.ViewPort.SetCurrent(i,a),null!=r.opts.offsetX&&(n.attribute("x",!0).value=r.opts.offsetX),null!=r.opts.offsetY&&(n.attribute("y",!0).value=r.opts.offsetY),null!=r.opts.scaleWidth||null!=r.opts.scaleHeight){var o=null,l=null,h=r.ToNumberArray(n.attribute("viewBox").value);null!=r.opts.scaleWidth&&(n.attribute("width").hasValue()?o=n.attribute("width").toPixels("x")/r.opts.scaleWidth:isNaN(h[2])||(o=h[2]/r.opts.scaleWidth)),null!=r.opts.scaleHeight&&(n.attribute("height").hasValue()?l=n.attribute("height").toPixels("y")/r.opts.scaleHeight:isNaN(h[3])||(l=h[3]/r.opts.scaleHeight)),null==o&&(o=l),null==l&&(l=o),n.attribute("width",!0).value=r.opts.scaleWidth,n.attribute("height",!0).value=r.opts.scaleHeight,n.style("transform",!0,!0).value+=" scale("+1/o+","+1/l+")"}1!=r.opts.ignoreClear&&t.clearRect(0,0,i,a),n.render(t),s&&(s=!1,"function"==typeof r.opts.renderCallback&&r.opts.renderCallback(e))},o=!0;r.ImagesLoaded()&&(o=!1,a()),r.intervalID=setInterval(function(){var t=!1;if(o&&r.ImagesLoaded()&&(o=!1,t=!0),1!=r.opts.ignoreMouse&&(t|=r.Mouse.hasEvents()),1!=r.opts.ignoreAnimation)for(var e=0;e<r.Animations.length;e++)t|=r.Animations[e].update(1e3/r.FRAMERATE);"function"==typeof r.opts.forceRedraw&&1==r.opts.forceRedraw()&&(t=!0),t&&(a(),r.Mouse.runEvents())},1e3/r.FRAMERATE)},r.stop=function(){r.intervalID&&clearInterval(r.intervalID)},r.Mouse=new function(){this.events=[],this.hasEvents=function(){return 0!=this.events.length},this.onclick=function(t,e){this.events.push({type:"onclick",x:t,y:e,run:function(t){t.onclick&&t.onclick()}})},this.onmousemove=function(t,e){this.events.push({type:"onmousemove",x:t,y:e,run:function(t){t.onmousemove&&t.onmousemove()}})},this.eventElements=[],this.checkPath=function(t,e){for(var i=0;i<this.events.length;i++){var n=this.events[i];e.isPointInPath&&e.isPointInPath(n.x,n.y)&&(this.eventElements[i]=t)}},this.checkBoundingBox=function(t,e){for(var i=0;i<this.events.length;i++){var n=this.events[i];e.isPointInBox(n.x,n.y)&&(this.eventElements[i]=t)}},this.runEvents=function(){r.ctx.canvas.style.cursor="";for(var t=0;t<this.events.length;t++)for(var e=this.events[t],i=this.eventElements[t];i;)e.run(i),i=i.parent;this.events=[],this.eventElements=[]}},r}var a,r=function(t,e,i){if(null!=t||null!=e||null!=i){"string"==typeof t&&(t=document.getElementById(t)),null!=t.svg&&t.svg.stop();var n=s(i||{});1==t.childNodes.length&&"OBJECT"==t.childNodes[0].nodeName||(t.svg=n);var a=t.getContext("2d");void 0!==e.documentElement?n.loadXmlDoc(a,e):"<"==e.substr(0,1)?n.loadXml(a,e):n.load(a,e)}else for(var o=document.querySelectorAll("svg"),l=0;l<o.length;l++){var h=o[l],u=document.createElement("canvas");u.width=h.clientWidth,u.height=h.clientHeight,h.parentNode.insertBefore(u,h),h.parentNode.removeChild(h);var c=document.createElement("div");c.appendChild(h),r(u,c.innerHTML)}};void 0!==Element.prototype.matches?a=function(t,e){return t.matches(e)}:void 0!==Element.prototype.webkitMatchesSelector?a=function(t,e){return t.webkitMatchesSelector(e)}:void 0!==Element.prototype.mozMatchesSelector?a=function(t,e){return t.mozMatchesSelector(e)}:void 0!==Element.prototype.msMatchesSelector?a=function(t,e){return t.msMatchesSelector(e)}:void 0!==Element.prototype.oMatchesSelector?a=function(t,e){return t.oMatchesSelector(e)}:("function"!=typeof jQuery&&"function"!=typeof Zepto||(a=function(t,e){return $(t).is(e)}),void 0===a&&(a=Sizzle.matchesSelector));var o=/(\[[^\]]+\])/g,l=/(#[^\s\+>~\.\[:]+)/g,h=/(\.[^\s\+>~\.\[:]+)/g,u=/(::[^\s\+>~\.\[:]+|:first-line|:first-letter|:before|:after)/gi,c=/(:[\w-]+\([^\)]*\))/gi,f=/(:[^\s\+>~\.\[:]+)/g,m=/([^\s\+>~\.\[:]+)/g;return"undefined"!=typeof CanvasRenderingContext2D&&(CanvasRenderingContext2D.prototype.drawSvg=function(t,e,i,n,s,a){var o={ignoreMouse:!0,ignoreAnimation:!0,ignoreDimensions:!0,ignoreClear:!0,offsetX:e,offsetY:i,scaleWidth:n,scaleHeight:s};for(var l in a)a.hasOwnProperty(l)&&(o[l]=a[l]);r(this.canvas,t,o)}),r});
(function(){ 'use strict';

    var namespace = AutodeskNamespace('Autodesk.Viewing.Extensions.Markups.Core.Utils');
    var av = Autodesk.Viewing;
    var avp = Autodesk.Viewing.Private;

    // Change these constants to alter the default sizes in pixels of strokes and fonts.
    namespace.MARKUP_DEFAULT_STROKE_WIDTH_IN_PIXELS = 5;
    namespace.MARKUP_DEFAULT_FONT_WIDTH_IN_PIXELS = 12;
    namespace.MARKUP_DEFAULT_HITAREAS_MARGIN_IN_PIXELS = 15;

    /**
     * // isTouchDevice is an LMV function. Hammer is included by LMV as well
     * @returns {boolean}
     */
    namespace.isTouchDevice = function() {
        // isTouchDevice() is an LMV function.
        // Hammer (a touch detection lib) is packaged with LMV as well
        if (av.isTouchDevice && typeof Hammer === "function") {
            return av.isTouchDevice();
        }
        return false;
    };

    //// SVG  //////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     *
     * @param type
     * @returns {Element}
     */
    namespace.createSvgElement = function(type) {

        // See https://developer.mozilla.org/en-US/docs/Web/API/Document/createElementNS
        var namespace = 'http://www.w3.org/2000/svg';
        return  document.createElementNS(namespace, type);
    };

    /**
     *
     * @param {Element} svg - an SVGElement
     * @returns {Element} svg param is returned back
     */
    namespace.setSvgParentAttributes = function(svg) {

        // See: https://developer.mozilla.org/en-US/docs/Web/SVG/Namespaces_Crash_Course
        svg.setAttribute('version', '1.1'); // Notice that this is the SVG version, not the "MARKUP DATA VERSION"!
        svg.setAttribute('baseProfile', 'full');
        return svg;
    };

    namespace.createMarkupPathSvg = function() {

        var svg = namespace.createSvgElement('g');
        svg.setAttribute('cursor', 'inherit');
        svg.setAttribute('pointer-events', 'none');

        var markup = namespace.createSvgElement('path');
        markup.setAttribute('id', 'markup');

        var hitarea = namespace.createSvgElement('path');
        hitarea.setAttribute('id', 'hitarea');
        hitarea.setAttribute('fill', 'transparent');
        hitarea.setAttribute('stroke', 'transparent');

        svg.markup = markup;
        svg.hitarea = hitarea;

        svg.appendChild(markup);
        svg.appendChild(hitarea);

        return svg;
    };

    namespace.setAttributeToMarkupSvg = function(svg, attribute, value) {

        svg.markup.setAttribute(attribute, value);
    };

    namespace.updateMarkupPathSvgHitarea = function(svg, editor) {

        var markup = svg.markup;
        var hitarea = svg.hitarea;

        var hitareaMargin = editor.sizeFromClientToMarkups(0, namespace.MARKUP_DEFAULT_HITAREAS_MARGIN_IN_PIXELS).y;
        hitareaMargin += parseFloat(markup.getAttribute('stroke-width')) + hitareaMargin;

        var markupFill = markup.getAttribute('fill');
        var markupStroke = markup.getAttribute('stroke');
        var strokeEnabled = markupStroke !== '' && markupStroke !== 'none';
        var fillEnabled = markupFill !== '' && markupFill !== 'none';

        hitarea.setAttribute('d', markup.getAttribute('d'));
        hitarea.setAttribute('stroke-width', hitareaMargin);
        hitarea.setAttribute('transform', markup.getAttribute('transform'));

        if (editor.duringEditMode && !editor.navigating) {
            if (strokeEnabled && fillEnabled) {
                svg.setAttribute('pointer-events', 'painted');
                return;
            }

            if (strokeEnabled) {
                svg.setAttribute('pointer-events', 'stroke');
                return;
            }

            if (fillEnabled) {
                svg.setAttribute('pointer-events', 'fill');
                return;
            }
        }

        svg.setAttribute('pointer-events', 'none');
    };
    
    namespace.createMarkupTextSvg = function() {

        var svg = namespace.createSvgElement('g');
        svg.setAttribute('cursor', 'default');

        var clipperId = 'markup-clipper-' + namespace.getUniqueID();
        var clipperUrl = 'url(#' + clipperId + ')';

        var clipper = namespace.createSvgElement('clipPath');
        clipper.setAttribute('id', clipperId);
        clipper.removeAttribute('pointer-events');
        clipper.rect = namespace.createSvgElement('rect');
        clipper.appendChild(clipper.rect);

        var background = namespace.createSvgElement('rect');
        background.setAttribute('id', 'markup-background');

        var markup = namespace.createSvgElement('text');
        markup.setAttribute('id', 'markup');
        background.removeAttribute('pointer-events');

        var hitarea = namespace.createSvgElement('rect');
        hitarea.setAttribute('id', 'hitarea');
        hitarea.setAttribute('fill', 'transparent');
        hitarea.setAttribute('stroke', 'none');
        hitarea.setAttribute('stroke-width', '0');

        var clippedArea = namespace.createSvgElement('g');
        clippedArea.setAttribute('clip-path', clipperUrl);
        clippedArea.appendChild(clipper);
        clippedArea.appendChild(background);
        clippedArea.appendChild(markup);

        svg.appendChild(clippedArea);
        svg.appendChild(hitarea);

        svg.clipper = clipper;
        svg.background = background;
        svg.markup = markup;
        svg.hitarea = hitarea;

        return svg;
    };

    namespace.setMarkupTextSvgTransform = function(svg, transform, textTransform) {

        svg.clipper.rect.setAttribute('transform', transform);
        svg.background.setAttribute('transform', transform);
        svg.markup.setAttribute('transform', textTransform);
        svg.hitarea.setAttribute('transform', transform);
    };

    namespace.updateMarkupTextSvgHitarea = function(svg, w, h, editor) {

        var hitarea = svg.hitarea;
        var hitareaMargin = editor.sizeFromClientToMarkups(0, namespace.MARKUP_DEFAULT_HITAREAS_MARGIN_IN_PIXELS).y;

        hitarea.setAttribute('x', -hitareaMargin);
        hitarea.setAttribute('y', -hitareaMargin);
        hitarea.setAttribute('width', w + hitareaMargin * 2);
        hitarea.setAttribute('height', h + hitareaMargin * 2);
        svg.setAttribute("pointer-events", editor.navigating ? "none" : "painted");
    };

    namespace.updateMarkupTextSvgBackground = function(svg, w, h, color) {

        var background = svg.background;

        background.setAttribute('x', 0);
        background.setAttribute('y', 0);
        background.setAttribute('width', w);
        background.setAttribute('height', h);
        background.setAttribute('fill', color);
    };

    namespace.updateMarkupTextSvgClipper = function(svg, w, h) {

        var clipper = svg.clipper;

        clipper.rect.setAttribute('x', 0);
        clipper.rect.setAttribute('y', 0);
        clipper.rect.setAttribute('width', w);
        clipper.rect.setAttribute('height', h);
    };

    /**
     * Helper function that injects metadata for the whole Markup document.
     * Metadata includes: version.
     * @param {Element} svg - an SVGElement
     * @param {Object} metadata - Dictionary with attributes
     */
    namespace.addSvgMetadata = function(svg ,metadata) {

        var metadataNode = document.createElementNS('http://www.w3.org/2000/svg', 'metadata');
        var dataVersionNode = document.createElement('markup_document');

        metadataNode.appendChild(dataVersionNode);

        // NOTE: We could iterate over the properties, but we don't because these are the only ones supported
        dataVersionNode.setAttribute("data-model-version", metadata["data-model-version"]); // Version. For example: "1"

        svg.insertBefore(metadataNode, svg.firstChild);
        return metadataNode;
    };

    /**
     * Helper function that injects metadata for specific markup svg nodes.
     * @param {Element} markupNode - an SVGElement for the markup
     * @param {Object} metadata - Dictionary where all key/value pairs are added as metadata entries.
     * @returns {Element}
     */
    namespace.addMarkupMetadata = function(markupNode, metadata) {

        var metadataNode = document.createElementNS('http://www.w3.org/2000/svg', 'metadata');
        var dataVersionNode = document.createElement('markup_element');

        metadataNode.appendChild(dataVersionNode);
        for (var key in metadata) {
            if (metadata.hasOwnProperty(key)) {
                dataVersionNode.setAttribute(key, metadata[key]);
            }
        }

        markupNode.insertBefore(metadataNode, markupNode.firstChild);
        return metadataNode;
    };

    /**
     * Removes al metadata nodes from an Svg node structure.
     * Method will remove all metadata nodes from children nodes as well.
     * @param svgNode
     */
    namespace.removeAllMetadata = function(svgNode) {

        if (svgNode.getElementsByTagName) {
            var nodes = svgNode.getElementsByTagName("metadata");
            for (var i=0; i<nodes.length; ++i) {
                var metadataNode = nodes[i];
                metadataNode.parentNode && metadataNode.parentNode.removeChild(metadataNode);
            }
        }

        // Transverse children nodes
        var svgChildren = svgNode.children || svgNode.childNodes;
        if (svgChildren) {
            for (i=0; i<svgChildren.length; ++i) {
                this.removeAllMetadata(svgChildren[i]);
            }
        }
    };

    /**
     * Utility function that transfers children from an Html/Svg node into another one.
     * @param nodeFrom - The node instance from where children will be taken.
     * @param nodeInto - The node that's going to parent the transferred children.
     */
    namespace.transferChildNodes = function(nodeFrom, nodeInto) {

        var svgChildren = nodeFrom.children || nodeFrom.childNodes;
        var tmpArray = [];
        for (var i=0; i<svgChildren.length; ++i){
            tmpArray.push(svgChildren[i]); // Avoid appendChild
        }
        tmpArray.forEach(function(node){
            nodeInto.appendChild(node);
        });
    };

    /**
     * Generate a unique id.
     * @returns {string}
     */
    namespace.getUniqueID = function() {
        return THREE.Math.generateUUID();
    };

    /**
     * To ensure all clip paths have unique ids, we search all clip paths belonging to markups and return a grater id.
     * TODO: This method will not be used for fixing clip path ids. Instead use getUniqueID. This method should be
     * deprecated.
     * @returns {number}
     */
    namespace.getClipPathId = function() {

        var clippers = document.getElementsByTagName('clipPath');
        var clippersCount = clippers.length;
        var maxId = 0;

        for (var i = 0; i < clippersCount; ++i) {

            var clipperId = clippers[i].id;
            if (clipperId.indexOf('markup-clipper-') === -1 ) {
                continue;
            }
            clipperId = clipperId.replace('markup-clipper-', '');
            maxId = Math.max(maxId, clipperId);
        }
        return maxId+1;
    };

    /**
     * Serializes an SVG node into a String.
     * @param domNode
     * @returns {string}
     */
    namespace.svgNodeToString = function(domNode){

        function removeHitareas(svg, hitareas) {

            var hitarea = svg.hitarea;
            var hitareaParent = hitarea && hitarea.parentNode;

            if (hitareaParent) {

                hitareas.push({hitarea: hitarea, parent: hitareaParent});
                hitareaParent.removeChild(hitarea);
            }

            var children = svg.childNodes;
            var childrenCount = children.length;

            for(var i = 0; i < childrenCount; ++i) {
                removeHitareas(children.item(i), hitareas);
            }
        }

        function addHitareas(hitareas) {

            var hitareasCount = hitareas.length;
            for(var i = 0; i < hitareasCount; ++i) {

                var hitarea = hitareas[i];
                hitarea.parent.appendChild(hitarea.hitarea);
            }
        }

        var result;
        try {
            var hitareas = [];
            removeHitareas(domNode, hitareas);

            var xmlSerializer = new XMLSerializer();
            result = xmlSerializer.serializeToString(domNode);

            addHitareas(hitareas);

        } catch (err) {
            result = '';
            console.warn('svgNodeToString failed to generate string representation of domNode.');
        }
        return result;
    };

    namespace.stringToSvgNode = function(stringNode){

        var node = null;
        try {
            var domParser = new DOMParser();
            var doc = domParser.parseFromString(stringNode, "text/xml");
            node = doc.firstChild; // We should only be getting 1 child anyway.
        } catch (err) {
            node = null;
            console.warn('stringToSvgNode failed to generate an HTMLElement from its string representation.');
        }
        return node;
    };

    /**
     * Injects functions and members to a client object which will
     * receive the ability to dispatch events.
     * Mechanism is the same as in Autodesk.Viewing.Viewer.
     *
     * Note: All of the code here comes from Autodesk.Viewing.Viewer
     *
     * @param {Object} client - Object that will become an event dispatcher.
     */
    namespace.addTraitEventDispatcher = function(client) {

        // Inject member variable
        client.listeners = {};

        // Inject functions
        client.addEventListener = function(type, listener) {
            if (typeof this.listeners[type] == "undefined"){
                this.listeners[type] = [];
            }
            this.listeners[type].push(listener);
        };
        client.hasEventListener = function (type, listener) {
            if (this.listeners === undefined) return false;
            var listeners = this.listeners;
            if (listeners[ type ] !== undefined && listeners[ type ].indexOf(listener) !== -1) {
                return true;
            }
            return false;
        };
        client.removeEventListener = function(type, listener) {
            if (this.listeners[type] instanceof Array){
                var li = this.listeners[type];
                for (var i=0, len=li.length; i < len; i++){
                    if (li[i] === listener){
                        li.splice(i, 1);
                        break;
                    }
                }
            }
        };
        client.dispatchEvent = function(event) {
            if (typeof event == "string"){
                event = { type: event };
            }
            if (!event.target){
                event.target = this;
            }

            if (!event.type){
                throw new Error("event type unknown.");
            }

            if (this.listeners[event.type] instanceof Array) {
                var typeListeners = this.listeners[event.type].slice();
                for (var i=0; i < typeListeners.length; i++) {
                    typeListeners[i].call(this, event);
                }
            }
        };
    };

    /**
     * Removes the EventDispatcher trait
     *
     * @param {Object} client
     */
    namespace.removeTraitEventDispatcher = function(client) {

        try {
            delete client.listeners;
            delete client.addEventListener;
            delete client.hasEventListener;
            delete client.removeEventListener;
            delete client.dispatchEvent;
        } catch (e) {
            // nothing
        }
    };

    //// Math  /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Calculates the pixel position in client space coordinates of a point in world space.
     * @param {THREE.Vector3} point Point in world space coordinates.
     * @param viewer
     * @param snap Round values to closest pixel center.
     * @returns {THREE.Vector3} Point transformed and projected into client space coordinates.
     */
    namespace.worldToClient = function(point, viewer, snap) {

        var p = namespace.worldToViewport(point, viewer);
        var result = namespace.viewportToClient(p.x, p.y, viewer);
        result.z = 0;

        // snap to the center of the
        if (snap) {
            result.x = Math.floor(result.x) + 0.5;
            result.y = Math.floor(result.y) + 0.5;
        }

        return result;
    };

    namespace.clientToWorld = function(clientX, clientY, depth, viewer) {

        var point = namespace.clientToViewport(clientX, clientY, viewer);
        point.z = depth;

        point.unproject(viewer.impl.camera);
        return point;
    };

    namespace.clientToViewport = function(clientX, clientY, viewer) {

        return viewer.impl.clientToViewport(clientX, clientY);
    };

    namespace.viewportToClient = function(viewportX, viewportY, viewer) {

        return viewer.impl.viewportToClient(viewportX, viewportY);
    };

    /**
     * Calculates the world position of a point in client space coordinates.
     * @param {Object} point - { x:Number, y:Number, z:Number }
     * @param {Object} viewer - LMV instance
     * @returns {THREE.Vector3}
     */
    namespace.worldToViewport = function(point, viewer) {

        var p = new THREE.Vector3();

        p.x = point.x;
        p.y = point.y;
        p.z = point.z;

        p.project(viewer.impl.camera);
        return p;
    };

    namespace.metersToModel = function(meters, viewer) {

        var modelToMeter = viewer.model.getUnitScale();
        var meterToModel = 1 / modelToMeter;

        return meterToModel * meters;
    };

    namespace.radiansToDegrees = function (radians) {

        return radians * (180 / Math.PI);
    };

    namespace.degreesToRadians = function(degrees) {

        return degrees * (Math.PI / 180);
    };

    /**
     *
     * @param value
     * @returns {number}
     */
    namespace.sign = function (value) {

        return (value >= 0) ? 1 : -1;
    };

    /**
     *
     * @param pointA
     * @param pointB
     * @param range
     * @param editor
     * @returns {boolean}
     */
    namespace.areMarkupsPointsInClientRange = function(pointA, pointB, range, editor){

        range = editor.sizeFromClientToMarkups(0, range).y;

        var dx = pointA.x - pointB.x;
        var dy = pointA.y - pointB.y;

        return range * range >= dx * dx + dy * dy;
    };

    //// LMV ui ////////////////////////////////////////////////////////////////////////////////////////////////////////

    namespace.hideLmvUi = function(viewer) {

        // If the viewer is no gui, then there is nothing to hide
        if(!viewer.toolbar) {
            return;
        }

        // Exit other tools and hide HudMessages.
        viewer.setActiveNavigationTool();

        namespace.dismissLmvHudMessage();
        namespace.hideLmvPanels(true, viewer);
        namespace.hideLmvToolsAndPanels(viewer);
    };

    namespace.restoreLmvUi = function(viewer) {

        // If the viewer is no gui, then there is nothing to hide
        if(!viewer.toolbar) {
            return;
        }

        namespace.dismissLmvHudMessage();
        namespace.hideLmvPanels(false, viewer);
        namespace.showLmvToolsAndPanels(viewer);
    };

    /**
     *
     * @param hide
     * @param viewer
     */
    namespace.hideLmvPanels = function(hide, viewer) {

        var dockingPanels = viewer.dockingPanels;

        // Panels may not be present when dealing with an instance of Viewer3D.js
        // (as opposed to an instance of GuiViewer3D.js)
        if (!dockingPanels) return;

        for (var i = 0; i < dockingPanels.length; ++i) {

            var panel = dockingPanels[i];
            var panelContainer = panel.container;

            if (panelContainer.classList.contains("dockingPanelVisible")) {
                panelContainer.style.display = hide ? "none" : "block";

                // Call the visibility changed notification if any additional
                // stuff needs to be done (update the date i.e. PropertyPanel, etc).
                panel.visibilityChanged();
            }
        }
    };

    /**
     * Shows panels and tools in the viewer.
     * @param viewer
     */
    namespace.showLmvToolsAndPanels = function(viewer) {

        // Restore view cube.
        if(viewer && viewer.model && !viewer.model.is2d()) {
            viewer.displayViewCube(true, false);
        }

        // TODO: Find or ask for a better way to restore this buttons.
        // Hide home and info button.
        var home = document.getElementsByClassName('homeViewWrapper');
        var info = document.getElementsByClassName('infoButton');
        var anim = document.getElementsByClassName('toolbar-animationSubtoolbar');

        if (home.length > 0) {
            home[0].style.display = '';
        }

        if (info.length > 0) {
            info[0].style.display = '';
        }

        if (anim.length > 0) {
            anim[0].style.display = '';
        }

        // toolbar is absent when dealing with an instance of Viewer3D (instead of GuiViewer3D)
        if (viewer.toolbar) {
            var viewerContainer = viewer.toolbar.container;
            var viewerContainerChildrenCount = viewerContainer.children.length;
            for(var i = 0; i < viewerContainerChildrenCount; ++i) {
                viewerContainer.children[i].style.display = "";
            }
        }
    };

    /**
     * Hides panels and tools in the viewer.
     * @param viewer
     */
    namespace.hideLmvToolsAndPanels = function(viewer) {

        // Hide Panels and tools.
        if (viewer && viewer.model && !viewer.model.is2d()) {
            viewer.displayViewCube(false, false);
        }

        // TODO: Find or ask for a better way to hide this buttons.
        // Hide home and info button.
        var home = document.getElementsByClassName('homeViewWrapper');
        var info = document.getElementsByClassName('infoButton');
        var anim = document.getElementsByClassName('toolbar-animationSubtoolbar');

        if (home.length > 0) {
            home[0].style.display = 'none';
        }

        if (info.length > 0) {
            info[0].style.display = 'none';
        }

        if (anim.length > 0) {
            anim[0].style.display = 'none';

            var animator = viewer.impl.keyFrameAnimator;
            if (animator && !animator.isPaused) {
                animator.pauseCameraAnimations();
                animator.pause();

                var playButton = viewer.modelTools.getControl('toolbar-animationPlay');
                if (playButton) {
                    playButton.setIcon('toolbar-animationPauseIcon');
                    playButton.setToolTip('Pause');
                }
            }
        }

        // toolbar is absent when dealing with an instance of Viewer3D (instead of GuiViewer3D)
        if (viewer.toolbar) {
            var viewerContainer = viewer.toolbar.container;
            var viewerContainerChildrenCount = viewerContainer.children.length;
            for(var i = 0; i < viewerContainerChildrenCount; ++i) {
                viewerContainer.children[i].style.display = "none";
            }
        }
    };

    /**
     * Dismisses all LMV HudMessages
     */
    namespace.dismissLmvHudMessage = function() {

        // Using try/catch block since we are accessing the Private namespace of LMV.
        try {
            var keepDismissing = true;
            while (keepDismissing) {
                keepDismissing = Autodesk.Viewing.Private.HudMessage.dismiss();
            }
        } catch (ignore) {
            // Failing to show the message is an okay fallback scenario
            console.warn("[CO2]Failed to dismiss LMV HudMessage");
        }
    };

    //// Styles ////////////////////////////////////////////////////////////////////////////////////////////////////////

    namespace.createStyle = function(attributes, editor) {

        var style = {};

        for(var i = 0; i < attributes.length; ++i) {

            style[attributes[i]] = null;
        }

        var defaults = namespace.getStyleDefaultValues(style, editor);

        for(var i = 0; i < attributes.length; ++i) {

            var attribute = attributes[i];
            style[attribute] = defaults[attribute].values[defaults[attribute].default].value;
        }

        return style;
    };

    /**
     *
     * @param source
     * @param destination
     * @returns {*}
     */
    namespace.copyStyle = function(source, destination) {

        for(var attribute in destination) {
            if (source.hasOwnProperty(attribute)) {
                destination[attribute] = source[attribute];
            }
        }

        return destination;
    };

    /**
     *
     * @param source
     * @returns {{}}
     */
    namespace.cloneStyle = function(source) {

        var clone = {};

        for(var attribute in source) {
            clone[attribute] = source[attribute];
        }

        return clone;
    };

    namespace.getStrokeWidth = function(widthInPixels, editor) {

        var size = editor.sizeFromClientToMarkups(0, widthInPixels);
        return size.y;
    };

    /**
     * Creates markups from a parsed svg string child
     * @param child - child of a parsed SVG string
     * @param editor - MarkupsCore
     * @returns {*} Markup Object
     */
    namespace.createMarkupFromSVG = function(child, editor) {
        // var self = this;
        var meta = child.childNodes[0].childNodes[0] || '';

        var getCurrentStyle = function(editor, metadata) {

            var source = ['stroke-width', 'stroke-color', 'stroke-opacity', 'fill-color', 'fill-opacity',
                'font-family', 'font-size','font-style','font-weight','stroke-linejoin'];
            var style = {};
            for (var i=0; i < source.length; i++) {
                var value = metadata.getAttribute(source[i]);
                if(value == null) {
                    continue;
                }
                switch (source[i]) {
                    case 'font-size':
                    case 'stroke-width':
                    case 'stroke-opacity':
                    case 'fill-opacity':
                        style[source[i]] = parseFloat(value);
                        break;
                    case 'stroke-linejoin':
                        break;
                    case 'font-family':
                    case 'font-style':
                    case 'font-weight':
                    case 'stroke-color':
                    case 'fill-color':
                        style[source[i]] = value;
                        break;
                    default:
                        avp.logger.warn('Style not recognized.');
                        break;
                }
            }
            return style;
        };

        var isClosed = function() {
            var path = child.childNodes[1] || '';
            var closed = false;
            if (typeof path !== 'string'){
                var d = path.getAttribute('d').split(' ');
                if (d[d.length-1].toLowerCase() === 'z'){
                    closed = true;
                }
            }
            return closed;
        };

        var getLocations = function() {
            var locations = [];
            var locStr = meta.getAttribute('locations').split(" ") || '';

            for(var i=0; i< locStr.length; i+=2) {
                var pointPair = {x:parseFloat(locStr[i]), y:parseFloat(locStr[i+1])};
                locations.push( pointPair )
            }
            return locations;
        };

        var getAttributeVector = function(attribute) {
            var posVec = new THREE.Vector3();
            var strPos = meta.getAttribute(attribute).split(" ") || '';
            posVec.x = parseFloat(strPos[0]);
            posVec.y = parseFloat(strPos[1]);
            return posVec;
        };

        var getPosition = function() {
            return getAttributeVector('position');
        };

        var getSize = function() {
            return getAttributeVector('size');
        };

        var getRotation = function() {
            var strRot = meta.getAttribute('rotation') || '';
            return parseFloat(strRot);
        };

        var getText = function() {
            return meta.getAttribute('text') || '';
        };

        if (typeof meta !== 'string') {
            // get the type of the child
            var namespace = Autodesk.Viewing.Extensions.Markups.Core;
            var position, size, rotation, locations, tail, head, closed, text;
            var id = editor.getId();
            var style = getCurrentStyle(editor, meta);
            var type = meta.getAttribute('type') || '';
            var markup = null;
            var createMarkup;
            switch(type) {
                case namespace.MARKUP_TYPE_ARROW:
                    tail = getAttributeVector('tail');
                    head = getAttributeVector('head');
                    createMarkup = new namespace.CreateArrow(editor, id, tail, head, style);
                    break;

                case namespace.MARKUP_TYPE_RECTANGLE:
                    position = getPosition();
                    size = getSize();
                    rotation = getRotation();
                    createMarkup = new namespace.CreateRectangle(editor, id, position, size, rotation, style);
                    break;

                case namespace.MARKUP_TYPE_TEXT:
                    position = getPosition();
                    size = getSize();
                    text = getText();
                    createMarkup = new namespace.CreateText(editor, id, position, size, text, style );
                    break;

                case namespace.MARKUP_TYPE_CIRCLE:
                    position = getPosition();
                    size = getSize();
                    rotation = getRotation();
                    createMarkup = new namespace.CreateCircle(editor, id, position, size, rotation, style);
                    break;

                case namespace.MARKUP_TYPE_CLOUD:
                    position = getPosition();
                    size = getSize();
                    rotation = getRotation();
                    createMarkup = new namespace.CreateCloud(editor, id, position, size, rotation, style);
                    break;

                case namespace.MARKUP_TYPE_FREEHAND:
                    position = getPosition();
                    size = getSize();
                    rotation = getRotation();
                    locations = getLocations();
                    createMarkup = new namespace.CreateFreehand(editor, id, position, size, rotation, locations, style);
                    break;

                case namespace.MARKUP_TYPE_POLYLINE:
                    position = getPosition();
                    size = getSize();
                    rotation = getRotation();
                    locations = getLocations();
                    closed = isClosed();
                    createMarkup = new namespace.CreatePolyline(editor, id, position, size, rotation, locations, style, closed);
                    break;

                case namespace.MARKUP_TYPE_POLYCLOUD:
                    position = getPosition();
                    size = getSize();
                    rotation = getRotation();
                    locations = getLocations();
                    closed = isClosed();
                    createMarkup = new namespace.CreatePolycloud(editor, id, position, size, rotation, locations, style, closed);
                    break;

                case namespace.MARKUP_TYPE_HIGHLIGHT:
                    position = getPosition();
                    size = getSize();
                    rotation = getRotation();
                    locations = getLocations();
                    createMarkup = new namespace.CreateHighlight(editor, id, position, size, rotation, locations, style);
                    break;

                default:
                    createMarkup = null;
                    break;
            }
            if (createMarkup){
                createMarkup.addToHistory = false;
                createMarkup.execute();
                markup = editor.getMarkup(id);
            }
            return markup;
        }
    };
    
    /**
     *
     * @param style
     * @param editor
     * @returns {{}}
     */
    namespace.getStyleDefaultValues = function(style, editor) {

        function getWidths(normalWidth) {

            return {
                values: [
                    {name:'Thin', value: normalWidth / 2},
                    {name:'Normal', value: normalWidth},
                    {name:'Thick', value: normalWidth * 2},
                    {name:'Very Thick', value: normalWidth * 4}],
                default: 1
            };
        }

        function getLineJoins() {

            return {
                values: [
                    {name:'Miter', value: 'miter'},
                    {name:'Round', value: 'round'},
                    {name:'Bevel', value: 'bevel'}],
                default: 0
            };
        }

        function getFontSizes(normalWidth) {

            return {
                values: [
                    {name:'Thin', value: normalWidth /  2},
                    {name:'Normal', value: normalWidth},
                    {name:'Thick', value: normalWidth *  2}],
                default: 1
            };
        }

        function getColors() {

            return {
                values: [
                    {name:'red', value: '#ff0000'},
                    {name:'green', value: '#00ff00'},
                    {name:'blue', value: '#0000ff'},
                    {name:'white', value: '#ffffff'},
                    {name:'black', value: '#000000'},
                    {name:'yellow', value: '#ffff00'}],
                default: 0
            };
        }

        function getOpacities(defaultTransparent) {

            return {
                values: [
                    {name:'100%', value: 1.00},
                    {name:'75%', value:  0.75},
                    {name:'50%', value: 0.50},
                    {name:'25%', value: 0.25},
                    {name:'0%', value: 0.00}],
                default: (defaultTransparent ? 4 : 0)
            };
        }

        function getFontFamilies() {

            // TODO: Localize?
            // TODO: Validate fonts with design
            // Source: http://www.webdesigndev.com/web-development/16-gorgeous-web-safe-fonts-to-use-with-css
            return {
                values:[
                    {name:'Arial', value: 'Arial'},
                    {name:'Arial Black', value: 'Arial Black'},
                    {name:'Arial Narrow', value: 'Arial Narrow'},
                    {name:'Century Gothic', value: 'Century Gothic'},
                    {name:'Courier New', value: 'Courier New'},
                    {name:'Georgia', value: 'Georgia'},
                    {name:'Impact', value: 'Impact'},
                    {name:'Lucida Console', value: 'Lucida Console'},
                    {name:'Tahoma', value: 'Tahoma'},
                    {name:'Verdana', value: 'Verdana'}
                ],
                default: 0
            };
        }

        function getFontStyles() {
            return {
                values:[
                    {name:'Normal', value: 'normal'},
                    {name:'Italic', value: 'italic'}],
                default: 0
            };
        }

        function getFontWeights() {
            return {
                values:[
                    {name:'Normal', value: 'normal'},
                    {name:'Bold', value: 'bold'}],
                default: 0};
        }

        var values = namespace.cloneStyle(style);
        var normaStrokeWidth = namespace.getStrokeWidth(namespace.MARKUP_DEFAULT_STROKE_WIDTH_IN_PIXELS, editor);
        var normaFontWidth = namespace.getStrokeWidth(namespace.MARKUP_DEFAULT_FONT_WIDTH_IN_PIXELS, editor);

        for(var attribute in values) {

            switch(attribute) {
                case 'stroke-width':
                    values[attribute] = getWidths(normaStrokeWidth);
                    break;

                case 'stroke-linejoin':
                    values[attribute] = getLineJoins();
                    break;

                case 'font-size':
                    values[attribute] = getFontSizes(normaFontWidth);
                    break;

                case 'font-family':
                    values[attribute] = getFontFamilies();
                    break;

                case 'font-style':
                    values[attribute] = getFontStyles();
                    break;

                case 'font-weight':
                    values[attribute] = getFontWeights();
                    break;

                case 'stroke-color':
                case 'fill-color':
                    values[attribute] = getColors();
                    break;

                case 'stroke-opacity':
                    var defaultTransparent = false;
                    values[attribute] = getOpacities(defaultTransparent);
                    break;

                case 'fill-opacity':
                    var defaultTransparent = true;
                    values[attribute] = getOpacities(defaultTransparent);
                    break;

                default:
                    break;
            }
        }

        return values;
    };

    namespace.composeRGBAString = function(hexRGBString, opacity) {

        if(!hexRGBString || !opacity || opacity <= 0) {
            return 'none';
        }

        return ['rgba(' +
            parseInt('0x' + hexRGBString.substr(1,2)), ',',
            parseInt('0x' + hexRGBString.substr(3,2)), ',',
            parseInt('0x' + hexRGBString.substr(5,2)), ',', opacity, ')'].join('');
    };

    //// Id Target Collision ///////////////////////////////////////////////////////////////////////////////////////////

    /**
     *
     * @param x0
     * @param y0
     * @param x1
     * @param y1
     * @param idTarget
     */
    namespace.checkLineSegment = function(x0, y0, x1, y1, idTarget) {

        var deviceRatio = window.devicePixelRatio || 1;

        x0 *= deviceRatio;
        y0 *= deviceRatio;
        x1 *= deviceRatio;
        y1 *= deviceRatio;

        var idTargetWidth = idTarget.width;
        var idTargetHeight = idTarget.height;
        var idTargetBuffer = idTarget.buffer;

        x0 = Math.round(x0);
        x1 = Math.round(x1);
        y0 = Math.round(idTargetHeight - y0);
        y1 = Math.round(idTargetHeight - y1);

        function point(x, y) {

            x = Math.round(x);
            y = Math.round(y);

            var dx = 0;
            var dy = 0;

            for(var j = -deviceRatio; j <= deviceRatio; j+=deviceRatio*2){
                dy += check(x,y+j) ? j : 0;
            }

            for(var i = -deviceRatio; i <= deviceRatio; i+=deviceRatio*2){
                dx += check(x+i,y) ? i : 0;
            }

            return {
                x: Math.round(x / deviceRatio + dx),
                y: Math.round((idTargetHeight - y) / deviceRatio - dy)};
        }

        function check(x, y) {

            // Probably better to clip line at the beginning.
            if (x < 0 || x >= idTargetWidth ||
                y < 0 || y >= idTargetHeight) {
                return false;
            }

            var index = (y * idTargetWidth + x) *4;
            return (
                idTargetBuffer[index  ] !== 0xFF ||
                idTargetBuffer[index+1] !== 0xFF ||
                idTargetBuffer[index+2] !== 0xFF);
        }

        // DDA Line algorithm
        var dx = (x1 - x0);
        var dy = (y1 - y0);

        var m = dx !== 0 ? dy / dx : 1;
        var x = x0;
        var y = y0;

        if (dx !== 0 && Math.abs(m) <= 1) {

            if (x0 <= x1) {
                for (; x <= x1; ++x, y += m) {
                    if (check(x, Math.round(y))) {
                        return point(x, y);
                    }
                }
            } else {
                for (; x >= x1; --x, y -= m) {
                    if (check(x, Math.round(y))) {
                        return point(x, y);
                    }
                }
            }
        } else {

            m = dx !== 0 ? 1/m : 0;
            if (y0 <= y1) {
                for (; y <= y1; ++y, x += m) {
                    if (check(Math.round(x), y)) {
                        return point(x, y);
                    }
                }
            } else {
                for (; y >= y1; --y, x -= m) {
                    if (check(Math.round(x), y)) {
                        return point(x, y);
                    }
                }
            }
        }
    };

    /**
     *
     * @param polygon
     * @param idTarget
     */
    namespace.checkPolygon = function(polygon, idTarget) {

        // Return if incorrect parameters.
        if(!polygon || polygon.verxtexCount < 3 || !idTarget) {
            return null;
        }

        var deviceRatio = window.devicePixelRatio || 1;

        var idTargetWidth = idTarget.width;
        var idTargetHeight = idTarget.height;
        var idTargetBuffer = idTarget.buffer;

        var vertexCount = polygon.vertexCount;
        var xVertices = Float32Array.from(polygon.xVertices); // Clone to scale by device pixel ratio and to
        var yVertices = Float32Array.from(polygon.yVertices); // change y coordinates to OpenGL style.

        function point(x, y) {

            var dx = 0;
            var dy = 0;

            for(var j = -deviceRatio; j <= deviceRatio; j+=deviceRatio*2){
                dy += check(x,y+j) ? j : 0;
            }

            for(var i = -deviceRatio; i <= deviceRatio; i+=deviceRatio*2){
                dx += check(x+i,y) ? i : 0;
            }

            return {
                x: Math.round(x / deviceRatio) + dx,
                y: Math.round((idTargetHeight - y) / deviceRatio - dy)};
        }

        function check(x, y) {

            if (x < 0 || x >= idTargetWidth ||
                y < 0 || y >= idTargetHeight) {
                return false;
            }

            var index = (y * idTargetWidth + x) * 4;
            return (
                idTargetBuffer[index  ] !== 0xFF ||
                idTargetBuffer[index+1] !== 0xFF ||
                idTargetBuffer[index+2] !== 0xFF) && isInsidePolygon(x, y);
        }

        function isInsidePolygon(x, y) {

            var result = false;
            var vertexCount = polygon.vertexCount;
            for(var i = 0, j = vertexCount-1; i < vertexCount; j = i++) {

                if (((yVertices[i] > y) != (yVertices[j] > y)) &&
                     (x < (xVertices[j] - xVertices[i]) * (y - yVertices[i]) / (yVertices[j] - yVertices[i]) + xVertices[i]) ) {
                    result = !result;
                }
            }
            return result;
        }

        // Change coordinates to OpenGL style and calculate polygon's bounding box.
        var bbX0 = Number.POSITIVE_INFINITY;
        var bbY0 = Number.POSITIVE_INFINITY;
        var bbX1 = Number.NEGATIVE_INFINITY;
        var bbY1 = Number.NEGATIVE_INFINITY;

        for(var i = 0; i < vertexCount; ++i) {

            var bbX = xVertices[i] = xVertices[i] * deviceRatio;
            var bbY = yVertices[i] = idTargetHeight - yVertices[i] * deviceRatio;

            bbX0 = Math.min(bbX0, bbX);
            bbY0 = Math.min(bbY0, bbY);
            bbX1 = Math.max(bbX1, bbX);
            bbY1 = Math.max(bbY1, bbY);
        }

        if (bbX1 < 0 || bbX0 > idTargetWidth ||
            bbY1 < 0 || bbY0 > idTargetHeight) {
            return null;
        }

        var bbW = Math.round(bbX1 - bbX0);
        var bbH = Math.round(bbY1 - bbY0);

        var bbCenterX = Math.round((bbX0 + bbX1)*0.5);
        var bbCenterY = Math.round((bbY0 + bbY1)*0.5);

        // Check
        var x = bbCenterX;
        var y = bbCenterY;

        var w = 1;
        var h = 1;

        do {

            var endX = x + w;
            var endY = y + h;

            for(; x < endX; ++x) {
                if (check(x,y)) {
                    return point(x,y);
                }
            }

            for(; y < endY; ++y) {
                if (check(x,y)) {
                    return point(x,y);
                }
            }

            if (w < bbW) {
                endX = x - ++w; ++w;
            } else {
                endX = x - w;
            }

            if (h < bbH) {
                endY = y - ++h; ++h;
            } else {
                endY = y - h;
            }

            for(; x > endX; --x) {
                if (check(x,y)) {
                    return point(x,y);
                }
            }

            for(; y > endY; --y) {
                if (check(x,y)) {
                    return point(x,y);
                }
            }
        } while(w < bbW || h < bbH);
     };

    //// CSS ///////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     *
     * @returns {*}
     */
    namespace.createStyleSheet = function() {

        var style = document.createElement("style");

        // This is WebKit hack.
        style.appendChild(document.createTextNode(""));
        document.head.appendChild(style);

        return style.sheet;
    };

    /**
     *
     * @param styleSheet
     * @param selector
     * @param styles
     * @param index
     */
    namespace.addRuleToStyleSheet = function(styleSheet, selector, styles, index) {

        if("insertRule" in styleSheet) {
            styleSheet.insertRule(selector + "{" + styles + "}", index);
        }
        else if("addRule" in styleSheet) {
            styleSheet.addRule(selector, styles, index);
        }
    };

    //// SVG ///////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     *
     * @param lines
     * @param style
     * @param editor
     */
    namespace.measureTextLines = function(lines, style, editor) {

        // Measure div style is line style with some custom layout properties.
        var fontSize = editor.sizeFromMarkupsToClient(0, style['font-size']).y;

        var measureStyle = new namespace.DomElementStyle()
            .setAttribute('font-family', style['font-family'])
            .setAttribute('font-size', fontSize + 'px')
            .setAttribute('font-weight', style['font-weight'] ? 'bold' : '')
            .setAttribute('font-style', style['font-style'] ? 'italic' : '')

            .removeAttribute(['top', 'left', 'width', 'height', 'overflow-y'])
            .setAttribute('position','absolute')
            .setAttribute('white-space','nowrap')
            .setAttribute('float','left')
            .setAttribute('visibility','hidden')
            .getStyleString();

        // Create measure div.
        var measure = document.createElement('div');

        measure.setAttribute('style', measureStyle);
        editor.viewer.container.appendChild(measure);

        // Measure.
        var result = [];

        var linesCount = lines.length;
        for(var i = 0; i < linesCount; ++i) {

            measure.innerHTML = lines[i];
            result.push({
                line: lines[i],
                width: measure.clientWidth,
                height: measure.clientHeight
            });
        }

        // Remove measure div and return result.
        editor.viewer.container.removeChild(measure);
        return result;
    };

    namespace.createArcTo = function(x, y, xRadius, yRadius, relative, path) {

        path.push(relative ? 'a' : 'A');
        path.push(xRadius);
        path.push(yRadius);
        path.push(0);
        path.push(1);
        path.push(1);
        path.push(x);
        path.push(y);

        return path;
    };

    namespace.createEllipsePath = function (x, y, w, h, relative, path) {

        var halfW = w * 0.5;
        var halfH = h * 0.5;

        path.push(relative ? 'm' : 'M');
        path.push(x);
        path.push(y);

        namespace.createArcTo(w, 0, halfW, halfH, true, path);
        namespace.createArcTo(-w, 0, halfW, halfH, true, path);

        path.push('z');
    };

    namespace.createRectanglePath = function (x, y, w, h, relative, path) {

        path.push(relative ? 'm' : 'M');
        path.push(x);
        path.push(y);
        path.push('l');
        path.push(w);
        path.push(0);
        path.push('l');
        path.push(0);
        path.push(h);
        path.push('l');
        path.push(-w);
        path.push(0);
        path.push('z');
    };

    namespace.renderToCanvas = function(svg, viewBox, width, height, ctx, callback) {

        // Creating a new svg element, that will be drawn into the canvas.
        var tmpSvg = namespace.createSvgElement('svg');
        
        if (!av.isIE11) {
            tmpSvg.setAttribute('xmlns','http://www.w3.org/2000/svg');    
        }

        tmpSvg.setAttribute('width',width);
        tmpSvg.setAttribute('height',height);
        tmpSvg.setAttribute('viewBox',viewBox);
        viewBox = viewBox.split(' ');
        var markupGroup = svg.parentNode.cloneNode(true);

        // SVG coordinates are inversed to the viewer coordinates, so we have to swap them here.
        markupGroup.setAttribute('transform','translate(0,' + (2 * parseFloat(viewBox[1]) + parseFloat(viewBox[3])) +') scale(1,-1)');

        // Adding the markup itself to the temp SVG
        tmpSvg.appendChild(markupGroup);
        
        // Get the SVG as string
        var temp = document.createElement('div');
        var node = tmpSvg.cloneNode(true);
        temp.appendChild(node);
        var data = temp.innerHTML;
        
        tmpSvg = temp = node = null;

        var renderWithCanvg = function() {
            canvg(ctx.canvas, data, {ignoreMouse: true, ignoreDimensions: true, ignoreClear: true, renderCallback: callback});
        };

        // IE11 blocks 'tainted' canvas for security reasons. canvg is a library that solves that issue, and draws on the canvas without tainting it.
        if (av.isIE11) {
            renderWithCanvg();
        }
        else {
            var img = new Image();

            img.onload = function() {
                ctx.drawImage(img, 0, 0);
                callback();
            };

            img.onerror = function() {
                renderWithCanvg();
            };

            img.src = 'data:image/svg+xml;base64,' + window.btoa(unescape( encodeURIComponent( data )));
        }
    };

})();

(function(){ 'use strict';

    AutodeskNamespace('Autodesk.Viewing.Extensions.Markups.Core');

    /**
     * Base class for all markup edit actions.
     *
     * EditActions encapsulate {@link Autodesk.Viewing.Extensions.Markups.Core.Markup  Markup}
     * operations (such as creation, edition and deletion) that hook into the undo/redo system.
     *
     * The minimum set of methods to implement on an EditAction extension are:
     * - execute()
     * - undo()
     * - redo()
     *
     * A good set of classes to check their implementation are:
     * - [CreateCircle]{@link Autodesk.Viewing.Extensions.Markups.Core.CreateCircle}.
     * - [DeleteCircle]{@link Autodesk.Viewing.Extensions.Markups.Core.DeleteCircle}.
     * - [SetCircle]{@link Autodesk.Viewing.Extensions.Markups.Core.SetCircle}.
     *
     * @tutorial feature_markup
     * @constructor
     * @memberof Autodesk.Viewing.Extensions.Markups.Core
     *
     * @param {Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore} editor
     * @param {String} type - An identifier for the EditAction.
     * @param {number} targetId - The id of the markup being affected.
     * @category Extensions
     */
    function EditAction(editor, type, targetId) {

        this.type =  type;
        this.editor = editor;
        this.targetId = targetId;
        this.addToHistory = true;
        this.selectOnExecution = true;
    }

    Autodesk.Viewing.Extensions.Markups.Core.EditAction = EditAction;

    /**
     * Performs the action.
     */
    Autodesk.Viewing.Extensions.Markups.Core.EditAction.prototype.execute = function() {

        this.editor.actionManager.execute(this);
    };

    /**
     * @abstract
     */
    Autodesk.Viewing.Extensions.Markups.Core.EditAction.prototype.redo = function() {

    };

    /**
     * @abstract
     */
    Autodesk.Viewing.Extensions.Markups.Core.EditAction.prototype.undo = function() {

    };

    /**
     * Provides a mechanism to merge consecutive actions of the same type.
     * @param {Autodesk.Viewing.Extensions.Markups.Core.EditAction} action - Action to check if it can be merged with 'this'.
     * @returns {boolean} Returns true if merge has been applied. Parameter will be discarded.
     */
    Autodesk.Viewing.Extensions.Markups.Core.EditAction.prototype.merge = function(action) {

        return false;
    };

    /**
     * Provides a mechanism to check whether the action yields no results.
     * @returns {boolean} Returns true if no changes happen with this action.
     */
    Autodesk.Viewing.Extensions.Markups.Core.EditAction.prototype.isIdentity = function() {

        return false;
    };

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;
    var namespaceUtils = Autodesk.Viewing.Extensions.Markups.Core.Utils;

    /**
     *
     * @param historySize
     * @constructor
     */
    function EditActionManager(historySize) {

        this.historySize = historySize;

        this.undoStack = [];
        this.redoStack = [];

        namespaceUtils.addTraitEventDispatcher(this);
    }

    /*
     * Event types
     */
    namespace.EVENT_HISTORY_CHANGED = "EVENT_HISTORY_CHANGED";

    var proto = EditActionManager.prototype;

    /**
     *
     * @param action
     */
    proto.execute = function(action) {

        var redoStack = this.redoStack;
        var undoStack = this.undoStack;

        redoStack.splice(0, redoStack.length);

        action.redo();

        var group = this.getEditActionGroup();
        if (group.isOpen()) {
            group.addAction(action);
        } else {
            group.open();
            group.addAction(action);
            group.close();
        }

        if (undoStack.length > this.historySize) {
            undoStack.splice(0,1);
        }

        var targetId = action.selectOnExecution ? action.targetId : -1;
        this.dispatchEvent(
            {type: namespace.EVENT_HISTORY_CHANGED, data: {action: 'execute', targetId: targetId}});
    };

    proto.beginActionGroup = function() {

        var undoStack = this.undoStack;
        var undoStackCount = undoStack.length;
        var group = null;

        if (undoStackCount === 0 || undoStack[undoStackCount-1].isClosed()) {

            group = this.getEditActionGroup();
            group.open();
        } else {
            console.warn('Markups - Undo/Redo - Action edit group already open.');
        }
    };

    proto.closeActionGroup = function() {

        var undoStack = this.undoStack;
        var undoStackCount = undoStack.length;

        if (undoStackCount === 0) {

            console.warn('Markups - Undo/Redo - There is no action edit group to close.');
            return;
        }

        var group = undoStack[undoStackCount-1];
        if(!group.close()) {
            console.warn('Markups - Undo/Redo - Action edit group already closed.');
        }

        if (group.isEmpty()) {
            undoStack.pop();
        }
    };

    proto.cancelActionGroup = function() {

        var undoStack = this.undoStack;
        var undoStackCount = undoStack.length;

        if (undoStackCount === 0) {

            console.warn('Markups - Undo/Redo - There is no action edit group to close.');
            return;
        }

        var group = undoStack[undoStackCount-1];
        if(!group.close()) {
            console.warn('Markups - Undo/Redo - Action edit group already closed.');
            return;
        }

        group.undo();
        undoStack.pop();

        this.dispatchEvent(
            {type: namespace.EVENT_HISTORY_CHANGED, data: {action: 'cancel', targetId: -1}});
    };

    proto.undo = function() {

        var undoStack = this.undoStack;
        var redoStack = this.redoStack;

        if (undoStack.length === 0) {
            return;
        }

        var group = undoStack.pop();
        var targetId = group.undo();

        redoStack.push(group);

        this.dispatchEvent(
            {type: namespace.EVENT_HISTORY_CHANGED, data: {action:'undo', targetId: targetId}});
    };

    proto.redo = function() {

        var undoStack = this.undoStack;
        var redoStack = this.redoStack;

        if (redoStack.length === 0) {
            return;
        }

        var group = redoStack.pop();
        var targetId = group.redo();

        undoStack.push(group);

        this.dispatchEvent(
            {type: namespace.EVENT_HISTORY_CHANGED, data: {action:'redo', targetId: targetId}});
    };

    proto.clear = function() {

        this.undoStack.splice(0, this.undoStack.length);
        this.redoStack.splice(0, this.redoStack.length);

        this.dispatchEvent(
            {type: namespace.EVENT_HISTORY_CHANGED, data: {action:'clear', targetId: -1}});
    };

    proto.isUndoStackEmpty = function() {

        return this.undoStack.length === 0;
    };

    proto.isRedoStackEmpty = function() {

        return this.redoStack.length === 0;
    };

    /**
     *
     * @return action
     * @private
     */
    proto.getEditActionGroup = function() {

        var undoStack = this.undoStack;
        var undoStackCount = this.undoStack.length;

        var group = null;

        if (undoStackCount === 0 || undoStack[undoStackCount-1].isClosed()) {
            group = new namespace.EditActionGroup();
            undoStack.push(group);
        } else {
            group = undoStack[undoStackCount-1];
        }

        return group;
    };

    namespace.EditActionManager = EditActionManager;

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;
    var namespaceUtils = Autodesk.Viewing.Extensions.Markups.Core.Utils;

    /**
     * Base class for all markup edit modes.
     *
     * An EditMode is responsible for handling user input to create and edit a
     * [Markup]{@link Autodesk.Viewing.Extensions.Markups.Core.Markup}.
     *
     * Any class extending Markup should contain at least the following methods:
     * - deleteMarkup()
     * - onMouseDown()
     * - onMouseMove()
     *
     * A good reference is the Circle EditMode implementation available in
     * [EditModeCircle.js]{@link Autodesk.Viewing.Extensions.Markups.Core.EditModeCircle}.
     *
     * @tutorial feature_markup
     * @constructor
     * @memberof Autodesk.Viewing.Extensions.Markups.Core
     *
     * @param {Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore} editor - Markups extension.
     * @param {String} type - An identifier for the EditMode type. Not to be confused by the Markup's id.
     * @param {Array} styleAttributes - Attributes for customization.
     * @constructor
     * @category Extensions
     */
    function EditMode(editor, type, styleAttributes) {

        this.editor = editor;
        this.viewer = editor.viewer;
        this.type = type;
        this.selectedMarkup = null;
        this.dragging = false;
        this.draggingAnnotationIniPosition = null;
        this.draggingMouseIniPosition = new THREE.Vector2();
        this.initialX = 0;
        this.initialY = 0;
        this.minSize = 9; // In pixels
        this.creating = false;
        this.size = {x: 0, y: 0};
        this.style = namespaceUtils.createStyle(styleAttributes, this.editor);
        this.style = namespaceUtils.copyStyle(editor.getDefaultStyle(), this.style);

        this.CREATION_METHOD_DRAG = 'CREATION_METHOD_DRAG';
        this.CREATION_METHOD_CLICK = 'CREATION_METHOD_CLICK';
        this.CREATION_METHOD_CLICKS = 'CREATION_METHOD_CLICKS';
        this.creationMethod = this.CREATION_METHOD_DRAG;

        namespaceUtils.addTraitEventDispatcher(this);
    }

    // Event types //
    namespace.EVENT_EDITMODE_CREATION_BEGIN = "EVENT_EDITMODE_CREATION_BEGIN";
    namespace.EVENT_EDITMODE_CREATION_END = "EVENT_EDITMODE_CREATION_END";
    namespace.EVENT_MARKUP_DESELECT = "EVENT_MARKUP_DESELECT";

    var proto = EditMode.prototype;

    proto.destroy = function() {

        this.unselect();
        namespaceUtils.removeTraitEventDispatcher(this);
    };

    proto.unselect = function() {

        var fireEv = false;
        var selectedMarkup = this.selectedMarkup;
        if (selectedMarkup) {
            selectedMarkup.unselect();
            this.selectedMarkup = null;
            fireEv = true;
        }

        this.editor.editFrame.setMarkup(null);

        if (fireEv) {
            this.dispatchEvent({ type: namespace.EVENT_MARKUP_DESELECT });
        }
    };

    proto.creationBegin = function() {

        if (this.creating) {
            return;
        }

        this.creating = true;
        this.dispatchEvent({ type: namespace.EVENT_EDITMODE_CREATION_BEGIN });
    };

    proto.creationEnd = function() {

        if(!this.creating) {
            return;
        }

        if (this.creationMethod !== this.CREATION_METHOD_CLICK) {

            if (this.selectedMarkup && !this.isMinSizeValid()) {

                this.creationCancel();
            } else {

                if (this.creationMethod === this.CREATION_METHOD_DRAG) {
                    this.finishDragging();
                }

                if (this.selectedMarkup) {

                    // Opened on mouse down.
                    this.editor.closeActionGroup();
                    this.unselect();
                }
            }
        }

        this.creating = false;
        this.dispatchEvent({ type: namespace.EVENT_EDITMODE_CREATION_END });
    };

    proto.creationCancel = function() {

        this.editor.cancelActionGroup();
        this.creationEnd();
        this.selectedMarkup = null; // No need to call unselect
    };

    /**
     *
     * @param style
     */
    proto.setStyle = function(style) {

        this.style = style;

        var selectedMarkup = this.selectedMarkup;
        if(!selectedMarkup) {
            return;
        }

        var setStyle = new namespace.SetStyle(this.editor, selectedMarkup, style);
        setStyle.execute();
    };

    proto.getStyle = function() {

        return this.style;
    };

    proto.setSelection = function(markup) {

        if (this.selectedMarkup !== markup) {
            this.unselect();
            markup && markup.select();
        }

        this.selectedMarkup = markup;

        var editor = this.editor;
        markup && editor.bringToFront(markup);

        if(!this.creating) {
            editor.editFrame.setMarkup(markup);
        }
    };

    proto.getSelection = function() {

        return this.selectedMarkup;
    };

    /**
     *
     * @param [markup] If provided deletes markup (has to have same type that the edit mode), otherwise deletes selected one.
     * @param [cantUndo] If true to not add deletion to undo history.
     * @returns {boolean}
     */
    proto.deleteMarkup = function (markup, cantUndo) {

        return false;
    };

    /**
     * Used by classes extending EditMode to validate the minimum size (in screen coordinates) of the markup.
     * See minSize attribute
     * @return {Boolean} Whether current size is valid for creating the markup
     * @private
     */
    proto.isMinSizeValid = function() {

        if (this.minSize !== 0) {

            var tmp = this.editor.sizeFromMarkupsToClient(this.size.x, this.size.y);
            return (tmp.x*tmp.x + tmp.y*tmp.y) >= (this.minSize * this.minSize);

        }
        return true;
    };

    /**
     * @private
     */
    proto.startDragging = function() {

        var selectedMarkup = this.selectedMarkup;
        var mousePosition = this.editor.getMousePosition();

        if (selectedMarkup) {

            this.dragging = true;
            this.draggingAnnotationIniPosition = selectedMarkup.getClientPosition();
            this.draggingMouseIniPosition.set(mousePosition.x, mousePosition.y);
        }
    };

    /**
     * @private
     */
    proto.finishDragging = function() {

        var dragging = this.dragging;
        var selectedMarkup = this.selectedMarkup;

        this.dragging = false;

        if (selectedMarkup && dragging) {

            selectedMarkup.finishDragging();
        }
    };

    /**
     *
     * @returns {{x: number, y: number}}
     */
    proto.getFinalMouseDraggingPosition = function() {

        var editor = this.editor;
        var bounds = editor.getBounds();
        var mousePosition = editor.getMousePosition();

        var initialX = this.initialX;
        var initialY = this.initialY;

        var finalX = Math.min(Math.max(bounds.x, mousePosition.x), bounds.x + bounds.width);
        var finalY = Math.min(Math.max(bounds.y, mousePosition.y), bounds.y + bounds.height);

        if (finalX == initialX &&
            finalY == initialY) {
            finalX++;
            finalY++;
        }

        // Make equal x/y when shift is down
        if (editor.input.makeSameXY) {
            var dx = Math.abs(finalX - initialX);
            var dy = Math.abs(finalY - initialY);

            var maxDelta = Math.max(dx, dy);

            // These calculations have the opportunity to go beyond 'bounds'.
            finalX = initialX + maxDelta * namespaceUtils.sign(finalX - initialX);
            finalY = initialY + maxDelta * namespaceUtils.sign(finalY - initialY);
        }

        return { x:finalX, y:finalY };
    };

    proto.notifyAllowNavigation = function(allows) {

    };

    proto.onMouseMove = function (event) {

    };

    proto.onMouseDown = function () {

    };

    /**
     * Handler to mouse up events, used to start annotations creation.
     * It will cancel the creation of a markup if its minSize conditions are not met.
     *
     * @param {MouseEvent} event Mouse event.
     * @private
     */
    proto.onMouseUp = function(event) {

        if (this.creationMethod !== this.CREATION_METHOD_DRAG) {
            return;
        }

        this.creationEnd();
    };

    proto.onMouseDoubleClick = function(event) {

        if (this.creationMethod !== this.CREATION_METHOD_CLICKS) {
            return;
        }

        this.creationEnd();
    };

    /**
     * Notify the markup that the displayed markups are being saved so edit mode can finish current editions.
     */
    proto.onSave = function() {

        if (this.creating) {
            this.creationCancel();
        }
    };

    /**
     *
     * @returns {{x: *, y: *}}
     */
    proto.getDraggingPosition = function () {

        var mousePosition = this.editor.getMousePosition();

        var dx = mousePosition.x - this.draggingMouseIniPosition.x;
        var dy = mousePosition.y - this.draggingMouseIniPosition.y;

        return {
            x: this.draggingAnnotationIniPosition.x + dx,
            y: this.draggingAnnotationIniPosition.y + dy
        };
    };

    /**
     *
     * @param x
     * @param y
     * @param bounds
     * @returns {boolean}
     * @orivate
     */
    proto.isInsideBounds = function (x, y, bounds) {

        return x >= bounds.x && x <= bounds.x + bounds.width &&
               y >= bounds.y && y <= bounds.y + bounds.height;
    };

    /*
     * Decides whether to use the snapper in the current edit mode or not.
     * 
     * @returns {boolean}
     */
    proto.useWithSnapping = function () {
        return true;
    };

    namespace.EditMode = EditMode;

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;

    /**
     * Base class for editing Pen tools (currently freehand and highlighter)
     *
     * Any class extending EditModePen should contain at least the following methods:
     * - createPen()
     * - deletePen()
     * - setPen()
     *
     * @param editor
     * @constructor
     */
    function EditModePen(editor, type, styleAttributes) {
        namespace.EditMode.call(this, editor, type, styleAttributes);
    }

    EditModePen.prototype = Object.create(namespace.EditMode.prototype);

    var proto = EditModePen.prototype;

    proto.deleteMarkup = function(markup, cantUndo) {

        markup = markup || this.selectedMarkup;
        if (markup && markup.type == this.type) {
            var deleteMarkup = this.deletePen(markup);
            deleteMarkup.addToHistory = !cantUndo;
            deleteMarkup.execute();
            return true;
        }
        return false;
    };

    /**
     * Handler to mouse move events, used to create markups.
     * @param {MouseEvent} event Mouse event.
     * @private
     */
    proto.onMouseMove = function(event) {

        namespace.EditMode.prototype.onMouseMove.call( this, event );

        var selectedMarkup = this.selectedMarkup;
        if(!selectedMarkup || !this.creating) {
            return;
        }

        var editor = this.editor;
        var mousePosition = editor.getMousePosition();
        var movements = this.movements;

        var location = editor.clientToMarkups(mousePosition.x, mousePosition.y);
        movements.push(location);

        // determine the position of the top-left and bottom-right points
        var minFn = function(collection, key){
            var targets = collection.map(function(item){
                return item[key];
            });
            return Math.min.apply(null, targets);
        };

        var maxFn = function(collection, key){
            var targets = collection.map(function(item){
                return item[key];
            });
            return Math.max.apply(null, targets);
        };

        var l = minFn(movements, 'x');
        var t = minFn(movements, 'y');
        var r = maxFn(movements, 'x');
        var b = maxFn(movements, 'y');

        var width = r - l;  // Already in markup coords space
        var height = b - t; // Already in markup coords space

        var position = {
            x: l + width * 0.5,
            y: t + height * 0.5
        };
        var size = this.size = {x: width, y: height};

        // Adjust points to relate from the shape's center
        var locations = movements.map(function(point){
            return {
                x: point.x - position.x,
                y: point.y - position.y
            };
        });

        var setPen = this.setPen(position, size, locations);

        setPen.execute();
    };

    /**
     * Handler to mouse down events, used to start markups creation.
     * @private
     */
    proto.onMouseDown = function() {

        namespace.EditMode.prototype.onMouseDown.call(this);

        if (this.selectedMarkup) {
            return;
        }

        var editor = this.editor;

        editor.snapper && editor.snapper.clearSnapped();
        var mousePosition = editor.getMousePosition();

        this.initialX = mousePosition.x;
        this.initialY = mousePosition.y;

        //set the starting point
        var position = editor.clientToMarkups(this.initialX, this.initialY);
        this.movements = [position];

        var size = this.size = editor.sizeFromClientToMarkups(1, 1);

        // Create pen.
        editor.beginActionGroup();

        var markupId = editor.getId();
        var create = this.createPen(markupId, position, size, 0, [{x: 0, y: 0 }]);

        create.execute();

        this.selectedMarkup = editor.getMarkup(markupId);
        this.creationBegin();
    };

    proto.createPen = function() {
        console.error('createPen not implemented');
    };

    proto.deletePen = function() {
        console.error('deletePen not implemented');
    };

    proto.setPen = function() {
        console.error('setPen not implemented');
    };

    proto.useWithSnapping = function () {
        return false;
    };

    namespace.EditModePen = EditModePen;

})();
(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;
    var namespaceUtils = Autodesk.Viewing.Extensions.Markups.Core.Utils;
    var av = Autodesk.Viewing;

    /**
     * Base class for all markups.
     *
     * A Markup is a class that is capable of rendering itself as an Svg node.<br>
     * It can also render itself into a canvas-2d context.
     * Component within {@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore MarkupsCore} extension.
     *
     * Any class extending Markup should contain at least the following methods:
     * - getEditMode()
     * - set()
     * - updateStyle()
     * - setParent()
     * - setRotation()
     * - setSize()
     * - setPosition()
     * - renderToCanvas()
     * - setMetadata()
     *
     * A good reference is the rectangle markup implementation available in
     * [MarkupRectangle.js]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupRectangle}.
     *
     * @tutorial feature_markup
     * @constructor
     * @memberof Autodesk.Viewing.Extensions.Markups.Core
     *
     * @param {number} id - Identifier, populated with return value of {@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore#getId getId()}.
     * @param {Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore} editor - Markups extension
     * @param {Array} styleAttributes - Attributes for customization. Related to {@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore#setStyle setStyle()}.
     * @constructor
     * @category Extensions
     */
    function Markup(id, editor, styleAttributes) {

        this.id = id;
        this.type = "";
        this.editor = editor;
        this.viewer = editor.viewer;
        this.position = {x: 0, y: 0};
        this.size = {x:0, y:0};
        this.rotation = 0;
        this.style = namespaceUtils.createStyle(styleAttributes, this.editor);
        this.style = namespaceUtils.copyStyle(editor.getDefaultStyle(), this.style);
        this.highlightColor = '#FAFF3C';
        this.constraintWidth = false;
        this.constraintHeight = false;
        this.constraintRotation = false;
        this.highlighted = false;
        this.selected = false;

        namespaceUtils.addTraitEventDispatcher(this);
    }

    /*
     * Constants
     */
    namespace.MARKUP_TYPE_ARROW = "arrow";
    namespace.MARKUP_TYPE_TEXT = "label";
    namespace.MARKUP_TYPE_RECTANGLE = "rectangle";
    namespace.MARKUP_TYPE_CIRCLE = "ellipse";
    namespace.MARKUP_TYPE_CLOUD = "cloud";
    namespace.MARKUP_TYPE_FREEHAND = "freehand";
    namespace.MARKUP_TYPE_HIGHLIGHT = "highlight";
    namespace.MARKUP_TYPE_POLYLINE = "polyline";
    namespace.MARKUP_TYPE_POLYCLOUD = "polycloud";


    var proto = Markup.prototype;
    namespace.Markup = Markup;

    proto.destroy = function () {

        this.unselect();
        this.setParent(null);
    };

    /**
     * Specifies the parent layer which will contain the markup.
     * @param {HTMLElement} parent
     */
    proto.setParent = function(parent) {

        var div = this.shape;
        div.parentNode && div.parentNode.removeChild(div);
        parent && parent.appendChild(div);
    };

    /**
     * Clones (deep-copy) the markup. Used internally by the copy/cut/paste mechanism in
     * {@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore MarkupsCore}.
     *
     * @returns {Autodesk.Viewing.Extensions.Markups.Core.Markup} clone of the current markup
     */
    proto.clone = function() {

        var clone = Object.create(this.__proto__);
        var overrides = this.getCloneOverrides();

        for (var name in this) {

            if(!this.hasOwnProperty(name)) {
                continue;
            }

            var member = this[name];

            // Is there an override for this member?
            if (overrides.hasOwnProperty(name)) {
                clone[name] = overrides[name];
                continue;
            }

            // Member has a clone function?
            if (member['clone'] instanceof Function) {
                clone[name] = member.clone();
                continue;
            }

            // Is it a function?
            if (member instanceof Function) {
                clone[name] = member.bind(clone);
                continue;
            }

            // Is it an html node?
            if (member.nodeType) {
                clone[name] = member.cloneNode(true);
                continue;
            }

            // Just a plain object?
            if (member instanceof Object) {
                clone[name] = JSON.parse(JSON.stringify(member));
                continue;
            }

            // Ok, it seems it's just a primitive type.
            clone[name] = member;
        }

        this.cloneShape(clone);
        return clone;
    };

    proto.cloneShape = function(clone) {

        clone.shape.markup = clone.shape.childNodes.item(0);
        clone.shape.hitarea = clone.shape.childNodes.item(1);
        clone.bindDomEvents();
    };

    /**
     * Used internally by
     * {@link Autodesk.Viewing.Extensions.Markups.Core.Markup#clone clone()},
     * provides a mechanism to avoid cloning specific attributes.<br>
     * Developers only need to override this method when creating new Markup types.
     * When overriding, first call the super() implementation and then include additional attribute/value pairs to it.
     * @returns {Object} containing attributes that need not to be cloned.
     */
    proto.getCloneOverrides = function() {

        return {
            viewer: this.viewer,
            editor: this.editor,
            hammer: null,
            listeners: {}
        }
    };

    /**
     * Used internally to select a markup.<br>
     * Fires event Autodesk.Viewing.Extensions.Markups.Core.EVENT_MARKUP_SELECTED.
     */
    proto.select = function () {

        if (this.selected) {
            return;
        }

        this.selected = true;
        this.highlighted = false;
        this.updateStyle();
        this.dispatchEvent({type: namespace.EVENT_MARKUP_SELECTED, markup: this});
    };

    /**
     * Used internally to signal that the current markup has been unselected.<br>
     * No event is fired.
     */
    proto.unselect = function() {

        this.selected = false;
    };

    proto.highlight = function(highlight) {

        if (this.interactionsDisabled) {
            return;
        }

        this.highlighted = highlight;
        this.updateStyle();
    };

    /**
     * Returns a copy of the markup's style.
     * @returns {Object}
     */
    proto.getStyle = function() {

        return namespaceUtils.cloneStyle(this.style);
    };

    /**
     * Used internally to set the style object. Triggers a re-render of the markup (Svg)
     * @param {Object} style - Dictionary with key/value pairs
     */
    proto.setStyle = function(style) {

        namespaceUtils.copyStyle(style, this.style);
        this.updateStyle();
    };

    /**
     * Used internally and implemented by specific Markup types to render themselves as Svg.
     */
    proto.updateStyle = function () {

    };

    /**
     * Used internally to notify the markup that it is now being edited.<br>
     * Fires event Autodesk.Viewing.Extensions.Markups.Core.EVENT_MARKUP_ENTER_EDITION.
     */
    proto.edit = function() {

        this.dispatchEvent({type: namespace.EVENT_MARKUP_ENTER_EDITION, markup: this});
    };

    /**
     * Used internally to signal that it is no longer being edited.<br>
     * Fires event Autodesk.Viewing.Extensions.Markups.Core.EVENT_MARKUP_CANCEL_EDITION.
     */
    proto.cancel = function() {

        this.dispatchEvent({type: namespace.EVENT_MARKUP_CANCEL_EDITION, markup: this});
    };

    /**
     * Used internally to signal that the markup is being deleted.<br>
     * Fires event Autodesk.Viewing.Extensions.Markups.Core.EVENT_MARKUP_DELETE_EDITION.
     */
    proto.deleteMarkup = function() {

        this.dispatchEvent({type: namespace.EVENT_MARKUP_DELETE_EDITION, markup: this});
    };

    /**
     * Used internally to get the {@link Autodesk.Viewing.Extensions.Markups.Core.EditMode EditMode}
     * associated with the current Markup.<br>
     * Implemented by classes extending this one.
     * @returns {Autodesk.Viewing.Extensions.Markups.Core.EditMode}
     */
    proto.getEditMode = function() {

        console.warn('EditMode of markup type' + this.type + ' not defined.' );
        return null;
    };

    /**
     * Used internally to get the markup's position in browser pixel space.<br>
     * Notice that (0,0) is top left.<br>
     * See also
     * [getClientSize()]{@link Autodesk.Viewing.Extensions.Markups.Core.Markup#getClientSize}.
     * @returns {*}
     */
    proto.getClientPosition = function() {

        var position = this.position;
        return this.editor.positionFromMarkupsToClient(position.x, position.y);
    };

    /**
     * Used internally to get the markup's bounding rect in browser pixel space.<br>
     * See also
     * [getClientPosition()]{@link Autodesk.Viewing.Extensions.Markups.Core.Markup#getClientPosition}.
     * @returns {*}
     */
    proto.getClientSize = function () {

        var size = this.size;
        return this.editor.sizeFromMarkupsToClient(size.x, size.y);
    };

    /**
     * Changes the rotation of the markup to the given angle.
     * This gets called by the Autodesk.Viewing.Extensions.Markups.Core.SetRotation edit action
     *
     * @param {Number} angle
     */
    proto.setRotation = function(angle) {

        this.rotation = angle;
        this.updateStyle();
    };

    proto.getRotation = function () {

        return this.rotation;
    };

    /**
     * Used by the EditFrame to move the markup in Client Space coordinates
     * @param {Number} x - New X location for the markup. Notice that markups are centered on this value.
     * @param {Number} y - New Y location for the markup. Notice that markups are centered on this value.
     */
    proto.setPosition = function(x,y) {

        this.position.x = x;
        this.position.y = y;

        this.updateStyle();
    };

    /**
     * Changes the position and size of the markup.
     * This gets called by the Autodesk.Viewing.Extensions.Markups.Core.SetSize edit action
     * @param {{x: Number, y: Number}} position
     * @param {Number} width
     * @param {Number} height
     */
    proto.setSize = function (position, width, height) {

        this.position.x = position.x;
        this.position.y = position.y;
        this.size.x = width;
        this.size.y = height;

        this.updateStyle();
    };

    proto.isWidthConstrained = function() {

        return this.constraintWidth;
    };

    proto.isHeightConstrained = function() {

        return this.constraintHeight;
    };

    proto.isRotationConstrained = function() {

        return this.constraintRotation;
    };

    /**
     * Used to disable highlight on annotations while a new annotation is being created.
     * @param {Boolean} disable - Whether (mouse) interactions are enable.
     */
    proto.disableInteractions = function(disable) {

        this.interactionsDisabled = disable;
    };

    /**
     *
     * @param width
     */
    proto.setStrokeWidth = function(width) {

    };

    proto.constrainsToBounds = function(bounds) {

    };

    proto.onMouseDown = function(event) {

        if (this.interactionsDisabled) {
            return;
        }

        this.select();
        this.editor.editFrame.startDrag(event);
    };

    /**
     *
     * @param idTarget
     * @returns *
     */
    proto.generatePoint3d = function(idTarget) {

        var viewer = this.viewer;
        var polygon = this.generateBoundingPolygon();

        function checkLineSegment(a, b) {

            var point2d = namespaceUtils.checkLineSegment(a.x, a.y, b.x, b.y, idTarget);
            var point3d = point2d && viewer.clientToWorld(point2d.x, point2d.y);
            return point3d && point3d.point;
        }

        function checkPolygon(polygon) {

            var point2d = namespaceUtils.checkPolygon(polygon, idTarget);
            var point3d = point2d && viewer.clientToWorld(point2d.x, point2d.y);
            return point3d && point3d.point;
        }

        // Try to avoid expensive calculations by checking some lines segments first.
        // If line check cannot find a point the costly one by area is used.
        // A ----midAB---- B
        // |               |
        // |     center    |
        // |               |
        // C --------------D

        var xVertices = polygon.xVertices;
        var yVertices = polygon.yVertices;

        var midAB = new THREE.Vector2(xVertices[0] + xVertices[1], yVertices[0] + yVertices[1]).multiplyScalar(0.5);
        var midAC = new THREE.Vector2(xVertices[0] + xVertices[3], yVertices[0] + yVertices[3]).multiplyScalar(0.5);
        var midDB = new THREE.Vector2(xVertices[2] + xVertices[1], yVertices[2] + yVertices[1]).multiplyScalar(0.5);
        var midDC = new THREE.Vector2(xVertices[2] + xVertices[3], yVertices[2] + yVertices[3]).multiplyScalar(0.5);
        var center = midAC.clone().add(midDB).multiplyScalar(0.5);

        var point3d =
            checkLineSegment(center, midDB) ||
            checkLineSegment(center, midAC) ||
            checkLineSegment(center, midAB) ||
            checkLineSegment(center, midDC);

        return point3d || checkPolygon(polygon);
    };

    /**
     *
     * @returns {{min: {x: number, y: number}, max: {x: number, y: number}}}
     */
    proto.generateBoundingBox = function() {

        var boundingBox = {min: {x: 0,y: 0}, max: {x: 0, y: 0}};

        // Get bounding box from markup bounding polygon.
        var polygon = this.generateBoundingPolygon();

        var vertexCount = polygon.vertexCount;
        var xVertices = polygon.xVertices;
        var yVertices = polygon.yVertices;

        var bbX0 = Number.POSITIVE_INFINITY;
        var bbY0 = Number.POSITIVE_INFINITY;
        var bbX1 = Number.NEGATIVE_INFINITY;
        var bbY1 = Number.NEGATIVE_INFINITY;

        for(var i = 0; i < vertexCount; ++i) {

            var bbX = xVertices[i];
            var bbY = yVertices[i];

            bbX0 = Math.min(bbX0, bbX);
            bbY0 = Math.min(bbY0, bbY);
            bbX1 = Math.max(bbX1, bbX);
            bbY1 = Math.max(bbY1, bbY);
        }

        boundingBox.min.x = bbX0;
        boundingBox.min.y = bbY0;
        boundingBox.max.x = bbX1;
        boundingBox.max.y = bbY1;

        return boundingBox;
    };

    /**
     *
     * @returns {{vertexCount: number, xVertices: Float32Array, yVertices: Float32Array}}
     */
    proto.generateBoundingPolygon = function() {

        var position = this.getClientPosition();
        var halfSize = this.getClientSize();

        halfSize.x *= 0.5;
        halfSize.y *= 0.5;

        var lt = new THREE.Vector3(-halfSize.x,-halfSize.y).add(position);
        var rt = new THREE.Vector3( halfSize.x,-halfSize.y).add(position);
        var rb = new THREE.Vector3( halfSize.x, halfSize.y).add(position);
        var lb = new THREE.Vector3(-halfSize.x, halfSize.y).add(position);

        if (this.rotation !== 0) {

            var m1 = new THREE.Matrix4().makeTranslation(-position.x, -position.y, 0);
            var m2 = new THREE.Matrix4().makeRotationZ(this.rotation);
            var m3 = new THREE.Matrix4().makeTranslation(position.x, position.y, 0);
            var transform = m3.multiply(m2).multiply(m1);

            lt.applyMatrix4(transform);
            rt.applyMatrix4(transform);
            rb.applyMatrix4(transform);
            lb.applyMatrix4(transform);
        }

        return { // packed for fast access in test algorithm.
            vertexCount: 4,
            xVertices : new Float32Array([lt.x, rt.x, rb.x, lb.x]),
            yVertices : new Float32Array([lt.y, rt.y, rb.y, lb.y])
        };
    };

    /**
     * Implemented by extending classes.<br>
     * Gets called automatically when
     * [generateData()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore#generateData}
     * @returns {null|Element} - Either null (default) or the metadata Svg node
     */
    proto.setMetadata = function() {

        return null; // No metadata is injected by default.
    };

    proto.bindDomEvents = function() {

        if (namespaceUtils.isTouchDevice()) {

            this.hammer = new Hammer.Manager(this.shape, {
                recognizers: [
                    av.GestureRecognizers.singletap
                ],
                inputClass: Hammer.TouchInput
            });

            this.onSingleTapBinded = function(event) {

                this.onMouseDown(event);
            }.bind(this);

            this.hammer.on("singletap", this.onSingleTapBinded);
        }

        this.shape.addEventListener("mousedown", this.onMouseDown.bind(this), true );
        this.shape.addEventListener("mouseout", function(){this.highlight(false);}.bind(this));
        this.shape.addEventListener("mouseover", function(){this.highlight(true);}.bind(this));
    };

    proto.renderToCanvas = function(ctx, viewBox, width, height, callback) {

        namespaceUtils.renderToCanvas(this.shape, viewBox, width, height, ctx, callback);
    };

    proto.getPath = function() {

    };

    proto.getTransform = function() {

        return [
            'translate(', this.position.x, ',', this.position.y, ')',
            'rotate(', namespaceUtils.radiansToDegrees(-this.rotation), ')'
        ].join(' ');
    };

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;
    var namespaceUtils = Autodesk.Viewing.Extensions.Markups.Core.Utils;

    /**
     * Base class for Pen Markup rendering (currently freehand and highlighter)
     *
     * Derived classes must implement getEditMode()
     * @param id
     * @param editor
     * @constructor
     */
    function MarkupPen(id, editor) {

        var styleAttributes = ['stroke-width', 'stroke-color','stroke-opacity'];
        namespace.Markup.call(this, id, editor, styleAttributes);

        this.shape = namespaceUtils.createMarkupPathSvg();

        this.bindDomEvents();
    }

    MarkupPen.prototype = Object.create(namespace.Markup.prototype);
    MarkupPen.prototype.constructor = MarkupPen;

    var proto = MarkupPen.prototype;

    /**
     * Sets top-left and bottom-right values in client space coordinates (2d).
     *
     * @param position
     * @param size
     * @param locations
     */
    proto.set = function(position, size, locations) {

        this.rotation = 0; // Reset angle //
        this.locations = locations.concat();

        this.size.x = (size.x === 0) ? 1 : size.x;
        this.size.y = (size.y === 0) ? 1 : size.y;

        this.setSize(position, size.x, size.y);
        this.updateStyle();
    };

    /**
     * Applies data values into DOM element style/attribute(s)
     *
     */
    proto.updateStyle = function(cssStyle) {

        var style = this.style;
        var shape = this.shape;
        var path = this.getPath().join(' ');

        var strokeWidth = this.style['stroke-width'];
        var strokeColor = this.highlighted ? this.highlightColor : namespaceUtils.composeRGBAString(style['stroke-color'], style['stroke-opacity']);
        var fillColor = 'none';
        var transform = this.getTransform();

        namespaceUtils.setAttributeToMarkupSvg(shape, 'd', path);
        namespaceUtils.setAttributeToMarkupSvg(shape, 'stroke-width', strokeWidth);
        namespaceUtils.setAttributeToMarkupSvg(shape, 'stroke-linejoin', 'round');
        namespaceUtils.setAttributeToMarkupSvg(shape, 'stroke-linecap', 'square');
        namespaceUtils.setAttributeToMarkupSvg(shape, 'stroke', strokeColor);
        namespaceUtils.setAttributeToMarkupSvg(shape, 'fill', fillColor);
        namespaceUtils.setAttributeToMarkupSvg(shape, 'transform', transform);
        if (cssStyle) {
            namespaceUtils.setAttributeToMarkupSvg(shape, 'style', cssStyle);
        }
        namespaceUtils.updateMarkupPathSvgHitarea(shape, this.editor);
    };

    /**
     * Changes the position and size of the markup.
     * This gets called by the Autodesk.Viewing.Extensions.Markups.Core.SetSize edit action
     * @param {{x: Number, y: Number}} position
     * @param {Number} width
     * @param {Number} height
     */
    proto.setSize = function (position, width, height) {

        width = (width === 0 ? 1 : width);
        height = (height === 0 ? 1 : height);

        var locations = this.locations;
        var locationsCount = locations.length;

        var scaleX = width / this.size.x;
        var scaleY = height / this.size.y;

        for(var i = 0; i < locationsCount; ++i) {

            var point = locations[i];

            point.x *= scaleX;
            point.y *= scaleY;
        }

        this.position.x = position.x;
        this.position.y = position.y;

        this.size.x = width;
        this.size.y = height;

        this.updateStyle();
    };

    proto.setMetadata = function() {

        var metadata = namespaceUtils.cloneStyle(this.style);

        metadata.type = this.type;
        metadata.position = [this.position.x, this.position.y].join(" ");
        metadata.size = [this.size.x, this.size.y].join(" ");
        metadata.rotation = String(this.rotation);
        metadata.locations = this.locations.map(function(point){
            return [point.x, point.y].join(" ");
        }).join(" ");

        return namespaceUtils.addMarkupMetadata(this.shape, metadata);
    };

    proto.getPath = function() {

        var path = [];
        var locations = this.locations;
        var locationsCount = locations.length;

        if (locationsCount > 1) {

            path.push('M');
            path.push(locations[0].x);
            path.push(locations[0].y);

            for (var i = 1; i < locationsCount; ++i) {

                var locationA = locations[i - 1];
                var locationB = locations[i];

                path.push('l');
                path.push(locationB.x - locationA.x);
                path.push(locationB.y - locationA.y);
            }
        }

        return path;
    };

    namespace.MarkupPen = MarkupPen;

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core.Utils;

    /**
     * Curring object which generate a string that can be used
     * as a Dom element's 'style' value.
     *
     * @constructor
     */
    function DomElementStyle() {

        this.reset();
    }

    /*
     * Constants
     */
    var BROWSER_PREFIXES = ['-ms-', '-webkit-', '-moz-', '-o-'];

    var proto = DomElementStyle.prototype;

    proto.reset = function() {

        this.attributes = {};
        this.dirty = false;
        this.styleString = '';

        return this;
    };

    /**
     *
     * @param {String} key
     * @param {*} value
     * @param {Object} [options]
     * @param {Boolean} [options.allBrowsers] - Whether to add browser prefix to key
     * @returns {Autodesk.Viewing.Extensions.Markups.Core.Utils.DomeElemStyle}
     */
    proto.setAttribute = function(key, value, options) {

        this.attributes[key] = value;

        if (options && options.allBrowsers) {
            var that = this;
            BROWSER_PREFIXES.forEach(function(prefix){
                that.attributes[(prefix+key)] = value;
            });
        }
        this.dirty = true; // Could be optimized
        return this;
    };

    /**
     * Removes one or more attributes
     * @param {String|Array} key - Key or Keys to be removed
     * @returns {Autodesk.Viewing.Extensions.Markups.Core.Utils.DomElemStyle} this
     */
    proto.removeAttribute = function(key) {

        if (!Array.isArray(key)) {
            key = [key];
        }

        var self = this;
        key.forEach(function(k) {
            if (k in self.attributes) {
                delete self.attributes[k];
                self.dirty = true;
            }
        });
        return this;
    };

    /**
     * Gets the String representation of this style object
     * @returns {string}
     */
    proto.getStyleString = function() {

        if (this.dirty) {
            this.styleString = generateStyle(this.attributes);
            this.dirty = false;
        }
        return this.styleString;
    };

    /**
     * Clones the current Object
     *
     * @returns {Autodesk.Viewing.Extensions.Markups.Core.Utils.DomElemStyle}
     */
    proto.clone = function() {

        var clone = new namespace.DomElementStyle();
        var attributes = this.attributes;

        for (var key in attributes) {
            clone.setAttribute(key, attributes[key]);
        }
        return clone;
    };

    /**
     * Generates the style value string. Non mutable function.
     *
     * @param {Object} attributes
     * @private
     */
    function generateStyle(attributes) {

        var elements = [];
        for (var key in attributes) {
            var val = attributes[key];
            elements.push(key);
            elements.push(':');
            elements.push(val);
            elements.push('; ');
        }
        return elements.join('');
    }

    namespace.DomElementStyle = DomElementStyle;

})();

 (function () { 'use strict';

     var namespace = Autodesk.Viewing.Extensions.Markups.Core;
     var namespaceUtils = Autodesk.Viewing.Extensions.Markups.Core.Utils;
     var av = Autodesk.Viewing;

    /**
     * A component to handle the selection of markups.
     *
     *
     *      Sample
     *
     *      var containingDiv = document.getElementById('containingDiv3d-app-wrapper');
     *      var selectionComponent = new EditFrame(containingDiv);
     *      selectionComponent.setSelection(100, 100, 300, 150, 0);
     *
     * @param {HTMLElement} containingDiv The container where the selection layer will live.
     * @param {Object} editor
     * @constructor
     */
    function EditFrame(containingDiv, editor) {

        this.containingDiv = containingDiv;
        this.editor = editor;
        this.selectionLayer = createSelectionLayer();

        this.frameMargin = 10;

        this.selection = {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            rotation: 0,
            element: null,
            active: false,
            dragging: false,
            resizing: false,
            //a dictionary of all the drag points
            //the key for each drag point will be its cardinal/ordinal direction
            handle: {}
        };

        createSelectorBox.bind(this)();

        if (namespaceUtils.isTouchDevice()) {
            this.hammer = new Hammer.Manager(this.selectionLayer, {
                recognizers: [
                    av.GestureRecognizers.drag,
                    av.GestureRecognizers.doubletap,
                    av.GestureRecognizers.doubletap2,
                ],
                inputClass: Hammer.TouchInput
            });

            this.onHammerDragBinded = this.onHammerDrag.bind(this);
            this.onHammerDoubleTapBinded = this.onHammerDoubleTap.bind(this);

            this.hammer.on("dragstart dragmove dragend", this.onHammerDragBinded);
            this.hammer.on("doubletap", this.onHammerDoubleTapBinded);
            this.hammer.on("doubletap2", this.onHammerDoubleTapBinded);
        }

        handleSelectionBoxDragging.bind(this)();
        handleSelectionBoxResizing.bind(this)();
        handleSelectionDoubleClick.bind(this)();
        handleSelectionBoxRotating.bind(this)();

        //add the selection into the container given to us
        this.containingDiv.appendChild(this.selectionLayer);

        namespaceUtils.addTraitEventDispatcher(this);
    }

    // Constants //
    namespace.EVENT_EDITFRAME_EDITION_START = "EVENT_EDITFRAME_EDITION_START";
    namespace.EVENT_EDITFRAME_EDITION_END = "EVENT_EDITFRAME_EDITION_END";

    var BORDER_COLOR = 'rgba(30, 30, 255, 0.30)';
    var BACKGROUND = 'gainsboro';

    var proto = EditFrame.prototype;

    /**
     * Draws a selection box with the given attributes
     *
     * @param {number} x - The x coordinate to place the selection box
     * @param {number} y - The y coordinate to place the selection box
     * @param {number} width - The width of the selection box
     * @param {number} height - The height of the selection box
     * @param {number} rotation - The amount of degrees to rotate the selection box
     */
    proto.setSelection = function (x, y, width, height, rotation) {

        var margin = this.frameMargin;
        var doubleMargin = margin * 2;


        updateSelectorBoxDimensions.bind(this)(width + doubleMargin, height + doubleMargin);
        updateSelectorBoxPosition.bind(this)(x - margin, y - margin, rotation);
        updateSelectionBoxState.bind(this)(true); //activate the selection box
        this.selectionLayer.style.visibility = 'visible';
    };

    /**
     * Displays the selection box based on the position, dimension, and rotation of a given markup
     *
     * @param {Autodesk.Viewing.Extensions.Markups.Core.Markup} markup - the markup that should appear as selected
     */
    proto.setMarkup = function (markup) {

        this.hammer && this.hammer.set({enable: markup !== null});
        this.markup = markup;

        updateSelectionBoxState.bind(this)(false);

        if (markup) {
            var size = markup.getClientSize(),
                position = markup.getClientPosition(),
                width = size.x,
                height = size.y,
                rotation = markup.getRotation();

            this.setSelection(position.x - (width / 2), position.y - (height / 2), width, height, rotation);

            this.enableResizeHandles();
            this.enableRotationHandle();
        }
    };

    proto.startDrag = function (event) {

        this.onMouseMove = this._onRepositionMouseMove.bind(this);
        this.onMouseUp = this._onRepositionMouseUp.bind(this);
        this._onRepositionMouseDown(event, this.editor.getMousePosition());
    };

     proto.isActive = function() {
        return this.selection.active;
     };

    proto.isDragging = function () {

        return this.selection.dragging;
    };

    proto.isResizing = function () {

        return this.selection.resizing;
    };

    proto.isRotating = function () {

        return this.selection.rotating;
    };

    proto.onMouseMove = function (event) {

        //dummy fn
    };

    proto.onMouseUp = function (event) {
        //dummy fn
    };

     proto.onHammerDrag = function(event) {

         function updateEditorInput(input, parent, event) {

             //TODO: Change this when refactoring input in edit frame.
             var rect = parent.getBoundingClientRect();
             input.mousePosition.x = event.pageX - rect.left;
             input.mousePosition.y = event.pageY - rect.top;
         }

        //console.log('EditFrame drag ' + event.type);
         convertEventHammerToMouse(event);
         switch (event.type) {
             case 'dragstart':
                 updateEditorInput(this.editor.input, this.editor.svg, event);
                 this.editor.callSnapperMouseDown();
                 // Check whether to translate, rotate or resize
                 if (isRotatePoint(event.target)) {
                     // Rotate
                     this._onRotationMouseDown(event);
                 } else if (isDragPoint(event.target)) {
                     // Resize
                     this._onResizeMouseDown(event);
                 } else {
                     this.startDrag(event);
                 }
                 event.preventDefault();
                 break;
             case 'dragmove':
                 updateEditorInput(this.editor.input, this.editor.svg, event);
                 this.editor.callSnapperMouseMove();
                 this.onMouseMove(event);
                 event.preventDefault();
                 break;
             case 'dragend':
                 updateEditorInput(this.editor.input, this.editor.svg, event);
                 this.onMouseUp(event);
                 event.preventDefault();
                 break;
         }
     };

    proto.onHammerDoubleTap = function(event) {

        function updateEditorInput(input, parent, event) {

            //TODO: Change this when refactoring input in edit frame.
            var rect = parent.getBoundingClientRect();
            input.mousePosition.x = event.pageX - rect.left;
            input.mousePosition.y = event.pageY - rect.top;
        }

        convertEventHammerToMouse(event);
        updateEditorInput(this.editor.input, this.editor.svg, event);

        this.selection.dragging = false;
        this.editor.editMode && this.editor.editMode.onMouseDoubleClick(this.markup);
    };

    proto.enableResizeHandles = function () {

        var markup = this.markup;
        var handle;

        if (markup.isHeightConstrained() || markup.isWidthConstrained()) {
            //hide all the handles
            for (var direction in this.selection.handle) {
                handle = this.selection.handle[direction];
                if(handle) handle.style.display = 'none';
            }

            //show only the resize points that are allowed
            if (markup.isHeightConstrained()) {
                this.selection.handle['w'].style.display = 'block';
                this.selection.handle['e'].style.display = 'block';
            }
            if (markup.isWidthConstrained()) {
                this.selection.handle['n'].style.display = 'block';
                this.selection.handle['s'].style.display = 'block';
            }
        } else {
            //no constraints, show all resize handles
            for (var direction in this.selection.handle) {
                handle = this.selection.handle[direction];
                if(handle) handle.style.display = 'block';
            }
        }
    };

    proto.enableRotationHandle = function () {

        var markup = this.markup;
        var handle = this.selection.rotationHandle;
        var display = markup.isRotationConstrained() ? 'none' : 'block';
        handle.style.display = display;
    };

     function convertEventHammerToMouse(event) {
         // Convert Hammer touch-event X,Y into mouse-event X,Y.
         event.pageX = event.pointers[0].clientX;
         event.pageY = event.pointers[0].clientY;
     }

    /**
     * Creates an element spanning the full height and width of its parent.
     * It serves as our surface to draw the selection box.
     *
     * @return {HTMLElement}
     */
    function createSelectionLayer() {

        var selectionLayer = document.createElement('div');
        selectionLayer.style.position = 'absolute';
        selectionLayer.style.top = 0;
        selectionLayer.style.bottom = 0;
        selectionLayer.style.left = 0;
        selectionLayer.style.right = 0;
        //don't let the selection box be visible outside the selection layer
        selectionLayer.style.overflow = 'hidden';
        selectionLayer.style.visibility = 'hidden';
        togglePointerEvents(selectionLayer, false);
        return selectionLayer;
    }

    /**
     * Creates a single drag point with the corresponding styles
     *
     * @param {number} diameter - The size of the drag point
     * @param {string} position - The cardinal(n, s, w, e) or ordinal(nw, nw, sw, se) direction of the point
     * @return {HTMLElement}
     */
    function createDragPoint(width, position) {

        var point = document.createElement('div');
        point.style.position = 'absolute';
        point.style.height = width + 'px';
        point.style.width = width + 'px';
        point.style.background = BACKGROUND;
        point.style.borderColor = BORDER_COLOR;
        point.style.borderWidth = '1px';
        point.style.borderStyle = 'solid';

        setResizeCursor(point, position);
        point.className = 'selector-drag-point autodesk-markups-extension-core-make-me-bigger sdp-handle-' + position;
        point.setAttribute('data-sdp-handle', position);

        var placementOffset = -width - 2; // - 2 -> border x2
        //set the position of the drag points based on the position
        switch (position) {
            case 'n':
                point.style.top = placementOffset + 'px';
                point.style.left = 'calc(50% - ' + (width/2) + 'px)';
                point.style.position = 'relative';
                point.style.margin = 0;
                break;
            case 's':
                point.style.top = 'calc(100% - ' + (width+2) + 'px)';
                point.style.left = 'calc(50% - ' + (width/2) + 'px)';
                point.style.position = 'relative';
                point.style.margin = 0;
                break;
            case 'w':
                point.style.left = placementOffset + 'px';
                point.style.top = '50%';
                point.style.transform = 'translate3d(0, -50%, 0)';
                break;
            case 'e':
                point.style.right = placementOffset + 'px';
                point.style.top = '50%';
                point.style.transform = 'translate3d(0, -50%, 0)';
                break;
            case 'nw':
                point.style.top = placementOffset + 'px';
                point.style.left = placementOffset + 'px';
                break;
            case 'ne':
                point.style.top = placementOffset + 'px';
                point.style.right = placementOffset + 'px';
                break;
            case 'sw':
                point.style.bottom = placementOffset + 'px';
                point.style.left = placementOffset + 'px';
                break;
            case 'se':
                point.style.bottom = placementOffset + 'px';
                point.style.right = placementOffset + 'px';
                break;
        }
        return point;
    }

    function createRotatePoint () {

        var diameter = 18;
        var pointBorderWidth = 1;
        var point = document.createElement('div');
        point.style.position = 'absolute';
        point.style.background = BACKGROUND;
        point.style.border = pointBorderWidth + 'px solid rgba(30, 30, 255, 0.25)';
        point.style.height = diameter + 'px';
        point.style.width = diameter + 'px';
        point.style.borderRadius = (diameter / 2) + pointBorderWidth + 'px';
        point.style.boxSizing = 'border-box';
        point.classList.add('selector-rotate-point');
        point.style.left = '50%';
        point.style.transform = 'translate3d(-50%, 0px, 0px)';
        point.style.top = '-70px';
        point.classList.add('autodesk-markups-extension-core-make-me-bigger');

        return point;
    }

    function setResizeCursor (element, direction) {

        var cursor;
        switch(direction) {
            case 'n':
            case 's':
                cursor = 'ns-resize';
                break;
            case 'w':
            case 'e':
                cursor = 'ew-resize';
                break;
            case 'ne':
            case 'sw':
                cursor = 'nesw-resize';
                break;
            case 'nw':
            case 'se':
                cursor = 'nwse-resize';
                break;
        }
        element.style.cursor = cursor;
    }

    /**
     * Creates the 8 drag points of the selection box.
     *
     * @this EditFrame
     */
    function createDragPoints(selector) {

        var pointWidth = 16;

        ['n', 's', 'w', 'e', 'nw', 'ne', 'sw', 'se'].forEach(function (direction) {
            //store the drag point and put it in the DOM
            this.selection.handle[direction] = createDragPoint(pointWidth, direction);
            selector.appendChild(this.selection.handle[direction]);
        }.bind(this));
    }

    /**
     * Determines if an element is a drag point
     *
     * @return {boolean}
     */
    function isDragPoint(element) {

        return matchesSelectorAux(element, '.selector-drag-point');
    }

    /**
     * Determines if an element is a rotate point
     *
     * @return {boolean}
     */
    function isRotatePoint(element) {

        return matchesSelectorAux(element, '.selector-rotate-point');
    }

    /**
     * Creates the element that will be used as the selection box. It also
     * takes care of adding the drag handles
     *
     * @return {HTMLElement} - the selection box
     * @this EditFrame
     */
    function createSelectorBox() {

        var borderWidth = 1;
        var selectorBox = document.createElement('div');
        selectorBox.style.position = 'absolute';
        selectorBox.style.border = borderWidth + 'px solid ' + BORDER_COLOR;
        selectorBox.style.zIndex = 1;
        selectorBox.style.cursor = 'move';
        selectorBox.style.boxSizing = 'border-box';
        togglePointerEvents(selectorBox, true);
        selectorBox.classList.add('selector-box');
        createDragPoints.bind(this)(selectorBox);
        this.selection.rotationHandle = createRotatePoint();
        selectorBox.appendChild(this.selection.rotationHandle);
        //store the selector box
        this.selection.element = selectorBox;

        //add the selection box to the selection layer
        this.selectionLayer.appendChild(this.selection.element);

        //we are just creating the box, start it out hidden
        updateSelectionBoxState.bind(this)(false);

        return selectorBox;
    }

    /**
     * Utility to create the CSS translate3d value from a given 2d point
     *
     * @param {number} x - coordinate
     * @param {number} y - coordinate
     * @return {string}
     */
    function toTranslate3d(x, y) {

        return 'translate3d(' + x + 'px,' + y + 'px,0)';
    }


    /**
     * Updates the display state of the selection box
     *
     * @param {boolean} active - The new state of the the selection box
     * @this EditFrame
     */
    function updateSelectionBoxState(active) {

        this.selection.active = active;
        this.selection.element.style.display = active ? 'block' : 'none';
    }

    /**
     * Updates the position and rotation of the selection box.
     *
     * @param {number} x - The x coordinate to place the selection box
     * @param {number} y - The y coordinate to place the selection box
     * @param {number} rotation - The amount of degrees to rotate the selection box
     * @this EditFrame
     */
    function updateSelectorBoxPosition(x, y, rotation) {

        this.selection.x = x;
        this.selection.y = y;
        this.selection.rotation = rotation;
        var size = this.markup.getClientSize();
        //TODO: consider DomElementStyle

        size.x += this.frameMargin * 2;
        size.y += this.frameMargin * 2;

        this.selection.element.style.msTransform = toTranslate3d(x, y) + ' rotate(' + rotation + 'rad)';
        this.selection.element.style.msTransformOrigin = (size.x / 2) + 'px ' + (size.y / 2) + 'px';
        this.selection.element.style.webkitTransform = toTranslate3d(x, y) + ' rotate(' + rotation + 'rad)';
        this.selection.element.style.webkitTransformOrigin = (size.x / 2) + 'px ' + (size.y / 2) + 'px';
        this.selection.element.style.transform = toTranslate3d(x, y) + ' rotate(' + rotation + 'rad)';
        this.selection.element.style.transformOrigin = (size.x / 2) + 'px ' + (size.y / 2) + 'px';
    }

    /**
     * Updates the dimensions of the selection box (width and height).
     *
     * @param {number} width - The new width of the selection box
     * @param {number} height - The new height of the selection box
     * @this EditFrame
     */
    function updateSelectorBoxDimensions(width, height) {

        this.selection.width = width;
        this.selection.height = height;
        this.selection.element.style.width = width + 'px';
        this.selection.element.style.height = height + 'px';
    }

    /**
     * Attaches all the necessary listeners to handle a drag action.
     *
     * @this EditFrame
     */
    function handleSelectionBoxDragging () {

        this.selection.element.addEventListener('mousedown', this._onRepositionMouseDown.bind(this));
    }
    var ignoreFirstMouseMove = false;
    proto._onRepositionMouseDown = function (event, cursor) {

        // ignore the first mouse move for the Microsoft Surface
        ignoreFirstMouseMove = !av.isMobileDevice() && av.isTouchDevice();
        //a synthetic start means that the event was triggered manually and not as a
        //result of a mousedown on the edit frame
        var syntheticStart = !(event instanceof MouseEvent);

        //during a real mousedown, ignore events originating from a resizing handle
        if (!syntheticStart && (isDragPoint(event.target) || isRotatePoint(event.target))) return;

        //get the cursor position
        cursor = syntheticStart ?  cursor : this.editor.getMousePosition();

        //store the initial cursor and axis constrains
        this.initialCursor = cursor;
        this.initialPosition = this.markup.getClientPosition();
        this.areAxisConstrained = false;
        this.axisConstrains = new THREE.Vector2(1,1);

        //update the function that will handle the mousemove and mouseup events
        this.onMouseMove = this._onRepositionMouseMove.bind(this);
        this.onMouseUp = this._onRepositionMouseUp.bind(this);

        if (this.selection.dragging)
            return;

        this.selection.dragging = true;
        this.editor.beginActionGroup();

        //if alt down I drop a clone.
        if (event && event.altKey) {
            var editor = this.editor;
            var cloneMarkup = new namespace.CloneMarkup(editor, editor.getId(), this.markup, this.markup.position);
            cloneMarkup.execute();
        }

        this.dispatchEvent({ type: namespace.EVENT_EDITFRAME_EDITION_START }); // Moving around
    };

    proto._onRepositionMouseMove = function(event) {

        // This check is needed for selecting markups on devices that have touch screen + mouse (eg: Microsoft Surface)
        if (ignoreFirstMouseMove) {
            ignoreFirstMouseMove = false;
            return;
        }
        //ignore mousemove events if the dragging state hasn't been activated
        if (!this.selection.dragging) return;

        //get the position of the cursor relative to selection layer
        var cursor = this.editor.getMousePosition();

        //constrain axis if shift key is down.
        var constrainAxis = this.editor.input.constrainAxis;
        if (this.areAxisConstrained !== constrainAxis) {
            this.areAxisConstrained = constrainAxis;
            this.axisConstrains = constrainAxis ? new THREE.Vector2(0, 0) : new THREE.Vector2(1,1);

            this.initialPosition.x += cursor.x - this.initialCursor.x;
            this.initialPosition.y += cursor.y - this.initialCursor.y;

            this.initialCursor.x = cursor.x;
            this.initialCursor.y = cursor.y;
        }

        //determine how many pixel we have to shift the
        //selection box to keep the cursor on the drag point
        var movement = {
            x: cursor.x - this.initialCursor.x,
            y: cursor.y - this.initialCursor.y
        };

        var deadZone = 15;
        if (this.axisConstrains.x === 0 && this.axisConstrains.y === 0) {

            if (Math.abs(movement.x) > deadZone) {
                this.axisConstrains.x = 1;
                movement.x += movement.x < 0 ?  deadZone : -deadZone;
            } else
            if (Math.abs(movement.y) > deadZone) {
                this.axisConstrains.y = 1;
                movement.y += movement.y < 0 ?  deadZone : -deadZone;
            }
        }

        var x = this.initialPosition.x + movement.x * this.axisConstrains.x;
        var y = this.initialPosition.y + movement.y * this.axisConstrains.y;

        updateSelectorBoxPosition.bind(this)(x, y, this.selection.rotation);

        //tell the markup to start transforming
        //the markup expects an (x, y) coordinate that
        //uses an origin at the center, adjust our x, y because
        //our origin starts at the top left
        var position = this.editor.positionFromClientToMarkups(x, y);
        var setPosition = new namespace.SetPosition(this.editor, this.markup, position);
        setPosition.execute();
    };

    proto._onRepositionMouseUp = function () {

        this.last = null;

        //this should never be called after the mouse up because we are no longer repositioning
        this.onMouseMove = function () {/*do nothing*/};
        this.onMouseUp = function () {/*do nothing*/};

        if(!this.selection.dragging) {
            return;
        }

        this.editor.closeActionGroup();
        this.selection.dragging = false;
        this.dispatchEvent({ type: namespace.EVENT_EDITFRAME_EDITION_END }); // Moving around
    };

    proto._onResizeMouseDown = function (event) {
        var target = event.target;

        //is the target where the mousedown occurred a drag point
        if (!isDragPoint(target)) {
            return;
        }

        //keep a reference to the point where the drag started
        this.selection.handle.resizing = target;
        //figure out which direction this point should resize
        var direction = this.selection.handle.resizing.getAttribute('data-sdp-handle');
        //set the cursor position for the entire layer
        this.containingDiv.style.cursor = direction + '-resize';

        var cursor = this.editor.getMousePosition();

        var position = this.markup.getClientPosition();
        var size = this.markup.getClientSize();

        //store the center
        this.initial = {
            x: position.x,
            y: position.y,
            width: size.x,
            height: size.y,
            mouseX: cursor.x,
            mouseY: cursor.y
        };

        this.onMouseMove = this._onResizeMouseMove.bind(this);
        this.onMouseUp = this._onResizeMouseUp.bind(this);

        if (this.selection.resizing) {
            return;
        }

        this.selection.resizing = true;
        this.editor.beginActionGroup();

        //notify the markup that dragging has started
        this.dispatchEvent({ type: namespace.EVENT_EDITFRAME_EDITION_START }); // Resizing
    };

    proto._onResizeMouseMove = function (event) {

        if (!this.selection.resizing) return;

        var cursor = this.editor.getMousePosition();
        var initial = this.initial;

        var movement = {
            x: cursor.x - initial.mouseX,
            y: cursor.y - initial.mouseY
        };

        var vector = new THREE.Vector3(movement.x, movement.y, 0);
        var undoRotation = new THREE.Matrix4().makeRotationZ(-this.selection.rotation);
        movement = vector.applyMatrix4(undoRotation);

        var x = initial.x,
            y = initial.y,
            width = initial.width,
            height = initial.height;

        var localSpaceDelta = new THREE.Vector3();

        //get the direction of the arrow being dragged
        var direction = this.selection.handle.resizing.getAttribute('data-sdp-handle');

        // TODO: Make a mechanism to configure and use this feature from Markups Core.
        // If shift is pressed, figure aspect ratio is maintained.
        if (this.editor.input.keepAspectRatio && ['nw', 'ne', 'sw', 'se'].indexOf(direction) !== -1) {

            var delta = new THREE.Vector3(movement.x, movement.y, 0);
            switch (direction){
                case 'nw': movement.set(-initial.width,-initial.height, 0); break;
                case 'ne': movement.set( initial.width,-initial.height, 0); break;
                case 'sw': movement.set( initial.width,-initial.height, 0); break;
                case 'se': movement.set( initial.width, initial.height, 0); break;
            }
            movement.normalize();
            movement = delta.projectOnVector(movement);
        }

        var translations = {
            n: function () {
                height -= movement.y;
                localSpaceDelta.y = movement.y;
            },
            s: function () {
                height += movement.y;
                localSpaceDelta.y = movement.y;
            },
            w: function () {
                width -= movement.x;
                localSpaceDelta.x = movement.x;
            },
            e: function () {
                width += movement.x;
                localSpaceDelta.x = movement.x;
            },
            nw: function () {
                this.n();
                this.w();
            },
            ne: function () {
                this.n();
                this.e();
            },
            sw: function () {
                this.s();
                this.w();
            },
            se: function () {
                this.s();
                this.e();
            }
        };

        translations[direction]();

        var redoRotation = new THREE.Matrix4().makeRotationZ(this.selection.rotation);
        var actualDelta = localSpaceDelta.applyMatrix4(redoRotation);

        var newPos = this.editor.positionFromClientToMarkups(
            x + (actualDelta.x * 0.5),
            y + (actualDelta.y * 0.5));

        var newSize = this.editor.sizeFromClientToMarkups(width, height);
        var setSize = new namespace.SetSize(this.editor, this.markup, newPos, newSize.x, newSize.y);
        setSize.execute();
    };

    proto._onResizeMouseUp = function (event) {
        this.selection.resizing = false;
        this.selection.handle.resizing = null;
        this.containingDiv.style.cursor = '';

        this.editor.closeActionGroup();
        this.dispatchEvent({ type: namespace.EVENT_EDITFRAME_EDITION_END }); // Resizing

        //this should never be called after the mouse up because we are no longer resizing
        this.onMouseMove = function () {/*do nothing*/
        };
        this.onMouseUp = function () {/*do nothing*/
        };
    };


    /**
     * Attaches all the necessary listeners to handle a resizing action.
     *
     * @this EditFrame
     */
    function handleSelectionBoxResizing() {
        this.selectionLayer.addEventListener('mousedown', this._onResizeMouseDown.bind(this));
    }

    function handleSelectionBoxRotating () {

        this.selection.element.addEventListener('mousedown', this._onRotationMouseDown.bind(this));
    }

    var initialRotation;
    var initialHandlePosition;

    proto._onRotationMouseDown = function (event) {

        //ignore anything not coming from the rotation point
        if (!isRotatePoint(event.target)) return;

        this.editor.beginActionGroup();
        this.selection.rotating = true;

        //store the initial cursor
        initialHandlePosition = this.editor.getMousePosition();

        initialRotation = this.selection.rotation || 0;

        //update the function that will handle the mousemove and mouseup events
        this.onMouseMove = this._onRotationMouseMove.bind(this);
        this.onMouseUp = this._onRotationMouseUp.bind(this);

        this.dispatchEvent({ type: namespace.EVENT_EDITFRAME_EDITION_START }); // Rotating
    };

     proto._onRotationMouseMove = function (event) {

        //ignore mousemove events if the dragging state hasn't been activated
        if (!this.selection.rotating) return;

        var cursor = this.editor.getMousePosition();
        var position = this.markup.getClientPosition();

        var r = getAngleBetweenPoints(position, cursor);
        var r2 = getAngleBetweenPoints(position, initialHandlePosition);
        var rotation = r - r2 + initialRotation;

        // TODO: Make a mechanism to configure and use this feature from Markups Core.
        if (this.editor.input.snapRotations) {
            var snap = namespaceUtils.degreesToRadians(22.5);
            rotation = Math.ceil(rotation / snap) * snap;
        }

         //pass rotation as degrees
         updateSelectorBoxPosition.bind(this)(this.selection.x, this.selection.y, rotation);

        //convert to radians
        var setRotation = new namespace.SetRotation(this.editor, this.markup, rotation);
        setRotation.execute();
    };

    proto._onRotationMouseUp = function (event) {

        this.selection.rotating = false;
        initialRotation = null;
        initialHandlePosition = null;
        this.editor.closeActionGroup();
        this.dispatchEvent({ type: namespace.EVENT_EDITFRAME_EDITION_END }); // Rotating
    };

    /**
     * Attaches double click listener and pass events to markup, markups such as text use it to enter text edit
     * mode.
     *
     * @this EditFrame
     */
    function handleSelectionDoubleClick() {

        var doubleClick = function (event) {
            this.selection.dragging = false;
            var editMode = this.editor.editMode;
            editMode && editMode.onMouseDoubleClick(this.markup);
        }.bind(this);

        var selectorBoxWrapper = this.selectionLayer;
        selectorBoxWrapper.addEventListener('dblclick', doubleClick);
    }

    function togglePointerEvents(element, state) {

        element.style.pointerEvents = state ? 'auto' : 'none';
    }

    function getAngleBetweenPoints (p1, p2) {

        return Math.atan2(p2.y - p1.y, p2.x - p1.x);
    }

     function matchesSelectorAux(domElem, selector) {
         if (domElem.matches) return domElem.matches(selector); //Un-prefixed
         if (domElem.msMatchesSelector) return domElem.msMatchesSelector(selector);  //IE
         if (domElem.mozMatchesSelector) return domElem.mozMatchesSelector(selector); //Firefox (Gecko)
         if (domElem.webkitMatchesSelector) return domElem.webkitMatchesSelector(selector); // Opera, Safari, Chrome
         return false;
     }

     namespace.EditFrame = EditFrame;

 })();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;
    var namespaceUtils = Autodesk.Viewing.Extensions.Markups.Core.Utils;

    /**
     *
     * @param id
     * @param editor
     * @constructor
     */
    function MarkupArrow(id, editor) {

        var styleAttributes = ['stroke-width', 'stroke-color', 'stroke-opacity'];
        namespace.Markup.call(this, id, editor, styleAttributes);

        this.type = namespace.MARKUP_TYPE_ARROW;
        this.constraintHeight = true;

        // Create head and tail.
        this.head = new THREE.Vector3();
        this.tail = new THREE.Vector3();
        this.size.y = this.style['stroke-width'] * 3;
        this.shape = namespaceUtils.createMarkupPathSvg();

        this.bindDomEvents();
    }

    MarkupArrow.prototype = Object.create(namespace.Markup.prototype);
    MarkupArrow.prototype.constructor = MarkupArrow;

    var proto = MarkupArrow.prototype;

    proto.getEditMode = function() {

        return new namespace.EditModeArrow(this.editor);
    };

    /**
     * Sets top-left and bottom-right values in client space coordinates (2d).
     * Notice that for the arrow, the top left is the "tail" of the arrow and
     * the bottom right is the "head" of it.
     *
     * @param {Number} xO - tail
     * @param {Number} yO - tail
     * @param {Number} xF - head
     * @param {Number} yF - head
     */
    proto.set = function(xO, yO, xF, yF) {

        var vO = new THREE.Vector2(xO, yO);
        var vF = new THREE.Vector2(xF, yF);
        var vDir = vF.clone().sub(vO).normalize();

        this.size.x = vO.distanceTo(vF); // TODO: Clamp min length
        this.rotation = Math.acos(vDir.dot(new THREE.Vector2(1,0)));
        this.rotation = yF > yO ? (Math.PI*2)-this.rotation : this.rotation;

        var head = this.head;
        var tail = this.tail;

        head.set(xF, yF, 0);
        tail.set(xO, yO, 0);

        this.position.x = tail.x + (head.x - tail.x) * 0.5;
        this.position.y = tail.y + (head.y - tail.y) * 0.5;

        this.updateStyle();
    };

    /**
     * Changes the rotation of the markup to the given angle.
     * This gets called by the Autodesk.Viewing.Extensions.Markups.Core.SetRotation edit action
     *
     * @param {Number} angle
     */
    proto.setRotation = function(angle) {

        this.rotation = angle;

        var xF = Math.cos(-angle);
        var yF = Math.sin(-angle);
        var vFDir = new THREE.Vector2(xF, yF); // already normalized
        vFDir.multiplyScalar(this.size.x*0.5);

        var vCenter = new THREE.Vector2(this.position.x, this.position.y);
        var vO = vCenter.clone().sub(vFDir);
        var vF = vCenter.clone().add(vFDir);

        this.head.set(vF.x, vF.y, 0);
        this.tail.set(vO.x, vO.y, 0);

        this.updateStyle();
    };

    /**
     * Changes the position and size of the markup.
     * This gets called by the namespace.SetSize edit action
     * @param {{x: Number, y: Number}} position - arrow's center
     * @param {Number} width - Arrow's length
     * @param {Number} height - We ignore this one because we use the arrow's stroke width instead
     */
    proto.setSize = function(position, width, height) {

        var xF = Math.cos(-this.rotation);
        var yF = Math.sin(-this.rotation);
        var vFDir = new THREE.Vector2(xF, yF); // already normalized
        vFDir.multiplyScalar(width*0.5);

        var vCenter = new THREE.Vector2(position.x, position.y);
        var vO = vCenter.clone().sub(vFDir);
        var vF = vCenter.clone().add(vFDir);

        this.head.set(vF.x, vF.y, 0);
        this.tail.set(vO.x, vO.y, 0);

        this.position.x = position.x;
        this.position.y = position.y;
        this.size.x = width;

        this.updateStyle();
    };

    proto.updateStyle = function() {

        var style = this.style;
        var shape = this.shape;
        var strokeWidth = style['stroke-width'];
        var strokeColor = this.highlighted ? this.highlightColor : namespaceUtils.composeRGBAString(style['stroke-color'], style['stroke-opacity']);
        var transform = this.getTransform();

        this.size.y = strokeWidth * 3;
        this.style['fill-color'] = style['stroke-color'];
        this.style['fill-opacity'] = style['stroke-opacity'];

        namespaceUtils.setAttributeToMarkupSvg(shape, 'd', this.getPath().join(' '));
        namespaceUtils.setAttributeToMarkupSvg(shape, 'stroke-width', strokeWidth);
        namespaceUtils.setAttributeToMarkupSvg(shape, 'stroke', strokeColor);
        namespaceUtils.setAttributeToMarkupSvg(shape, 'fill', strokeColor);
        namespaceUtils.setAttributeToMarkupSvg(shape, 'transform', transform);
        namespaceUtils.updateMarkupPathSvgHitarea(shape, this.editor);
    };

    /**
     * Used by the EditFrame to move the markup in Client Space coordinates
     * @param {Number} x - New X location for the markup. Notice that markups are centered on this value.
     * @param {Number} y - New Y location for the markup. Notice that markups are centered on this value.
     */
    proto.setPosition = function (x, y) {

        var head = this.head;
        var tail = this.tail;

        var dx = head.x - tail.x;
        var dy = head.y - tail.y;

        var xo = x + dx * 0.5;
        var yo = y + dy * 0.5;

        head.x = xo;
        head.y = yo;

        tail.x = xo - dx;
        tail.y = yo - dy;

        this.position.x = tail.x + (head.x - tail.x) * 0.5;
        this.position.y = tail.y + (head.y - tail.y) * 0.5;

        this.updateStyle();
    };

    proto.generatePoint3d = function(idTarget) {

        var head = this.editor.positionFromMarkupsToClient(this.head.x, this.head.y);
        var tail = this.editor.positionFromMarkupsToClient(this.tail.x, this.tail.y);

        var direction = head.clone().sub(tail).normalize();

        var point2d = namespaceUtils.checkLineSegment(head.x, head.y, head.x + direction.x * 200, head.y + direction.y * 200, idTarget);
        var point3d = point2d && this.viewer.clientToWorld(point2d.x, point2d.y);

        return point3d && point3d.point;
    };

    proto.setMetadata = function() {

        var metadata = namespaceUtils.cloneStyle(this.style);

        metadata.type = this.type;
        metadata.head = [this.head.x, this.head.y].join(" ");
        metadata.tail = [this.tail.x, this.tail.y].join(" ");
        metadata.rotation = String(this.rotation);

        return namespaceUtils.addMarkupMetadata(this.shape, metadata);
    };

    proto.getPath = function() {

        // To build the arrow we need 7 points in total
        // The 'default' arrow built here has the following characteristics:
        //
        // 1. It is built horizontally facing right
        // 2. It's bounding rectangle has length: this.size.x
        // 3. It's bounding rectangle has height: 2 * this.strokeWidth
        // 4. The arrow tail's thickness is: this.strokeWidth
        // 5. The arrow head's length is: 2/3 of (point 3)
        // 6. The arrow head's thickness is: (point 3)
        // 7. The arrow generated is centered in its local (0,0), meaning that
        //    two points are placed with negative x values, and all other have
        //    positive x values:
        //
        //                            (3)\
        //                              \  \
        //             (1)-------------(2)   \
        //              |         (0)        (4)
        //             (7)-------------(6)   /
        //                              /  /
        //                            (5)/
        //

        var sizeX = this.size.x;
        var sizeY = this.size.y;
        var sizeYOver3 = sizeY/3;
        var strokeWidth = this.style['stroke-width'];
        var tailW = sizeX - strokeWidth * 3;
        var headW = sizeX - tailW;
        var spikeOffset = strokeWidth * 0.3;

        return [
            'M', -sizeX * 0.5        , -sizeY * 0.5 + sizeYOver3,    // (1)
            'l',  tailW              ,  0,                           // (2)
            'l', -spikeOffset        , -sizeYOver3,                  // (3)
            'l',  headW + spikeOffset,  sizeYOver3 * 1.5,            // (4)
            'l', -headW - spikeOffset,  sizeYOver3 * 1.5,            // (5)
            'l',  spikeOffset        , -sizeYOver3,                  // (6)
            'l', -tailW              ,  0,                           // (7)
            'z'
        ];
    };

    namespace.MarkupArrow = MarkupArrow;

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;
    var namespaceUtils = Autodesk.Viewing.Extensions.Markups.Core.Utils;

    /**
     *
     * @param id
     * @param editor
     * @constructor
     */
    function MarkupCircle(id, editor) {

        var styleAttributes = ['stroke-width', 'stroke-color', 'stroke-opacity', 'fill-color', 'fill-opacity'];
        namespace.Markup.call(this, id, editor, styleAttributes);

        this.type = namespace.MARKUP_TYPE_CIRCLE;
        this.shape = namespaceUtils.createMarkupPathSvg();

        this.bindDomEvents();
    }

    MarkupCircle.prototype = Object.create(namespace.Markup.prototype);
    MarkupCircle.prototype.constructor = MarkupCircle;

    var proto = MarkupCircle.prototype;

    proto.getEditMode = function() {

        return new namespace.EditModeCircle(this.editor);
    };

    proto.set = function(position, size) {

        this.setSize(position, size.x, size.y);
    };

    /**
     * Applies data values into DOM element style/attribute(s)
     *
     */
    proto.updateStyle = function() {

        var style = this.style;
        var shape = this.shape;
        var path = this.getPath().join(' ');

        var strokeWidth = this.style['stroke-width'];
        var strokeColor = this.highlighted ? this.highlightColor : namespaceUtils.composeRGBAString(style['stroke-color'], style['stroke-opacity']);
        var fillColor = namespaceUtils.composeRGBAString(style['fill-color'], style['fill-opacity']);
        var transform = this.getTransform();

        namespaceUtils.setAttributeToMarkupSvg(shape, 'd', path);
        namespaceUtils.setAttributeToMarkupSvg(shape, 'stroke-width', strokeWidth);
        namespaceUtils.setAttributeToMarkupSvg(shape, 'stroke', strokeColor);
        namespaceUtils.setAttributeToMarkupSvg(shape, 'fill', fillColor);
        namespaceUtils.setAttributeToMarkupSvg(shape, 'transform', transform);
        namespaceUtils.updateMarkupPathSvgHitarea(shape, this.editor);
    };

    proto.setMetadata = function() {

        var metadata = namespaceUtils.cloneStyle(this.style);

        metadata.type = this.type;
        metadata.position = [this.position.x, this.position.y].join(" ");
        metadata.size = [this.size.x, this.size.y].join(" ");
        metadata.rotation = String(this.rotation);

        return namespaceUtils.addMarkupMetadata(this.shape, metadata);
    };

    proto.getPath = function() {

        var size = this.size;
        if (size.x === 1 || size.y === 1) {
            return [''];
        }

        var strokeWidth = this.style['stroke-width'];

        var w = size.x;
        var h = size.y;

        var ellipseW = w - strokeWidth;
        var ellipseH = h - strokeWidth;

        var halfStrokeWidth  = strokeWidth * 0.5;

        var ellipseX = halfStrokeWidth - w * 0.5;
        var ellipseY = 0;

        var path = [];
        namespaceUtils.createEllipsePath(ellipseX, ellipseY, ellipseW, ellipseH, false, path);

        return path;
    };

    namespace.MarkupCircle = MarkupCircle;

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;
    var namespaceUtils = Autodesk.Viewing.Extensions.Markups.Core.Utils;

    /**
     *
     * @param id
     * @param editor
     * @constructor
     */
    function MarkupCloud(id, editor) {

        var styleAttributes = ['stroke-width', 'stroke-linejoin', 'stroke-color', 'stroke-opacity', 'fill-color', 'fill-opacity'];
        namespace.Markup.call(this, id, editor, styleAttributes);

        this.type = namespace.MARKUP_TYPE_CLOUD;
        this.shape = namespaceUtils.createMarkupPathSvg();

        this.bindDomEvents();
    }

    MarkupCloud.prototype = Object.create(namespace.Markup.prototype);
    MarkupCloud.prototype.constructor = MarkupCloud;

    var proto = MarkupCloud.prototype;

    proto.getEditMode = function() {

        return new namespace.EditModeCloud(this.editor);
    };

    /**
     * Sets position and size in markup space coordinates.
     * @param {Object} position
     * @param {Object} size
     */
    proto.set = function(position, size) {

        this.setSize(position, size.x, size.y);
    };

    /**
     * Applies data values into DOM element style/attribute(s)
     *
     */
    proto.updateStyle = function() {

        var style = this.style;
        var shape = this.shape;
        var path = this.getPath().join(' ');

        var strokeWidth = this.style['stroke-width'];
        var strokeColor = this.highlighted ? this.highlightColor : namespaceUtils.composeRGBAString(style['stroke-color'], style['stroke-opacity']);
        var fillColor = namespaceUtils.composeRGBAString(style['fill-color'], style['fill-opacity']);
        var transform = this.getTransform();

        namespaceUtils.setAttributeToMarkupSvg(shape, 'd', path);
        namespaceUtils.setAttributeToMarkupSvg(shape, 'stroke-width', strokeWidth);
        namespaceUtils.setAttributeToMarkupSvg(shape, 'stroke', strokeColor);
        namespaceUtils.setAttributeToMarkupSvg(shape, 'fill', fillColor);
        namespaceUtils.setAttributeToMarkupSvg(shape, 'transform', transform);
        namespaceUtils.updateMarkupPathSvgHitarea(shape, this.editor);
    };

    proto.setMetadata = function() {

        var metadata = namespaceUtils.cloneStyle(this.style);

        metadata.type = this.type;
        metadata.position = [this.position.x, this.position.y].join(" ");
        metadata.size = [this.size.x, this.size.y].join(" ");
        metadata.rotation = String(this.rotation);

        return namespaceUtils.addMarkupMetadata(this.shape, metadata);
    };

    /**
     * Helper function that creates intermediate points given the
     * current position and size.
     * @returns {Array}
     */
    proto.getPath = function() {

        var position = this.position;
        var size = this.size;
        var strokeWidth = this.style['stroke-width'];
        var radius = strokeWidth * 2;

        function createArcTo(x, y, xRadius, yRadius, path) {

            path.push('a');
            path.push(xRadius);
            path.push(yRadius);
            path.push(0);
            path.push(1);
            path.push(1);
            path.push(x);
            path.push(y);

            return path;
        }

        function createCorner(corner, xRadius, yRadius, strokeWidth, path) {

            switch(corner) {

                case 'LT':
                    return createArcTo( xRadius,-yRadius, xRadius, yRadius, path);
                    break;

                case 'RT':
                    return createArcTo( xRadius, yRadius, xRadius, yRadius, path);
                    break;

                case 'RB':
                    return createArcTo(-xRadius, yRadius, xRadius, yRadius, path);
                    break;

                case 'LB':
                    return createArcTo(-xRadius,-yRadius, xRadius, yRadius, path);
                    break;
            }
        }

        function getSideParameters(x1, x2, radius, strokeWidth) {

            var diameter = radius * 2;
            var length = Math.abs(x2 - x1 - strokeWidth);
            var count = Math.round(length / diameter);

            diameter += (length - diameter * count) / count;
            radius = diameter * 0.5;

            var xValueInset = diameter * 0.05;
            var yValueOffset = radius * 3.5 / 3.0;

            return {
                count: count,
                radius: radius,
                diameter: diameter,
                p1: {x: xValueInset, y: -yValueOffset },
                p2: {x: diameter - xValueInset, y: -yValueOffset},
                p3: {x: diameter, y: 0}
            };
        }

        function createTSide(hSidesParameters, path){

            var sp = hSidesParameters;
            for(var i = 0; i < sp.count; ++i) {

                path.push('c');
                path.push(sp.p1.x);
                path.push(sp.p1.y);
                path.push(sp.p2.x);
                path.push(sp.p2.y);
                path.push(sp.p3.x);
                path.push(sp.p3.y);
            }

            return path;
        }

        function createRSide(vSidesParameters, path){

            var sp = vSidesParameters;
            for(var i = 0; i < sp.count; ++i) {
                path.push('c');
                path.push(-sp.p1.y);
                path.push(sp.p1.x);
                path.push(-sp.p2.y);
                path.push(sp.p2.x);
                path.push(-sp.p3.y);
                path.push(sp.p3.x);
            }

            return path;
        }

        function createBSide(hSidesParameters, path){

            var sp = hSidesParameters;
            for(var i = 0; i < sp.count; ++i) {
                path.push('c');
                path.push(-sp.p1.x);
                path.push(-sp.p1.y);
                path.push(-sp.p2.x);
                path.push(-sp.p2.y);
                path.push(-sp.p3.x);
                path.push(-sp.p3.y);
            }

            return path;
        }

        function createLSide(vSidesParameters, path){

            var sp = vSidesParameters;
            for(var i = 0; i < sp.count; ++i) {
                path.push('c');
                path.push(sp.p1.y);
                path.push(-sp.p1.x);
                path.push(sp.p2.y);
                path.push(-sp.p2.x);
                path.push(sp.p3.y);
                path.push(-sp.p3.x);
            }

            return path;
        }

        var l = position.x;
        var t = position.y;
        var r = position.x + size.x;
        var b = position.y + size.y;

        var minSize = radius * 5;
        var path = [];

        if (size.x < minSize || size.y < minSize) {

            var w = size.x - strokeWidth;
            var h = size.y - strokeWidth;
            var x =-size.x * 0.5;
            var y = 0;

            namespaceUtils.createEllipsePath(x, y, w, h, false, path);
        } else {

            var hSidesParameters = getSideParameters(l, r, radius, strokeWidth);
            var vSidesParameters = getSideParameters(t, b, radius, strokeWidth);

            var cornerSizeX = hSidesParameters.diameter;
            var cornerSizeY = vSidesParameters.diameter;
            var cornerRadiusX = hSidesParameters.radius;
            var cornerRadiusY = vSidesParameters.radius;

            hSidesParameters = getSideParameters(l + cornerSizeX, r - cornerSizeX, radius, strokeWidth);
            vSidesParameters = getSideParameters(t + cornerSizeY, b - cornerSizeY, radius, strokeWidth);

            var halfStrokeWidth = strokeWidth * 0.5;
            var x =-size.x * 0.5 + halfStrokeWidth + cornerRadiusX;
            var y =-size.y * 0.5 + halfStrokeWidth + cornerRadiusY * 2;

            path.push('M');
            path.push(x);
            path.push(y);

            createCorner('LT', cornerRadiusX, cornerRadiusY, strokeWidth, path);
            createTSide(hSidesParameters, path);
            createCorner('RT', cornerRadiusX, cornerRadiusY, strokeWidth, path);
            createRSide(vSidesParameters, path);
            createCorner('RB', cornerRadiusX, cornerRadiusY, strokeWidth, path);
            createBSide(hSidesParameters, path);
            createCorner('LB', cornerRadiusX, cornerRadiusY, strokeWidth, path);
            createLSide(vSidesParameters, path);
        }

        path.push('z');
        return path;
    };

    namespace.MarkupCloud = MarkupCloud;

})();

(function() { 'use strict';

    var namespace = AutodeskNamespace('Autodesk.Viewing.Extensions.Markups.Core');

    /**
     * Fired whenever the drawing tool changes. For example, when the Arrow drawing
     * tool changes into the Rectangle drawing tool.
     * See [MarkupsCore.changeEditMode()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore/#changeEditMode}
     * for a list of all supported drawing tools (EditModes).
     * 
     * @event Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore#EVENT_EDITMODE_CHANGED
     * @type {string}
     */
    namespace.EVENT_EDITMODE_CHANGED = "EVENT_EDITMODE_CHANGED";

    /**
     * Fired when Edit mode has been enabled, which allows the end user to start
     * drawing markups over the Viewer canvas.
     * See also [MarkupsCore.enterEditMode()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore/#enterEditMode}.
     * 
     * @event Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore#EVENT_EDITMODE_ENTER
     * @type {string}
     */
    namespace.EVENT_EDITMODE_ENTER = "EVENT_EDITMODE_ENTER";

    /**
     * Fired when Edit mode has been disabled, preventing the end user from
     * drawing markups over the Viewer canvas.
     * See also [MarkupsCore.leaveEditMode()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore/#leaveEditMode}.
     * 
     * @event Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore#EVENT_EDITMODE_LEAVE
     * @type {string}
     */
    namespace.EVENT_EDITMODE_LEAVE = "EVENT_EDITMODE_LEAVE";

    /**
     * Fired when a drawn markup has been selected by the end user with a click command.
     * 
     * @event Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore#EVENT_MARKUP_SELECTED
     * @type {string}
     */
    namespace.EVENT_MARKUP_SELECTED = "EVENT_MARKUP_SELECTED";

    /**
     * Fired when a drawn markup is being dragged over the Viewer canvas.
     * 
     * @event Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore#EVENT_MARKUP_DRAGGING
     * @type {string}
     */
    namespace.EVENT_MARKUP_DRAGGING = "EVENT_MARKUP_DRAGGING";

    /**
     * Internal usage only.
     * 
     * @event Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore#EVENT_MARKUP_ENTER_EDITION
     * @type {string}
     * @private
     */
    namespace.EVENT_MARKUP_ENTER_EDITION = "EVENT_MARKUP_ENTER_EDITION";

    /**
     * Internal usage only.
     * 
     * @event Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore#EVENT_MARKUP_CANCEL_EDITION
     * @type {string}
     * @private
     */
    namespace.EVENT_MARKUP_CANCEL_EDITION = "EVENT_MARKUP_CANCEL_EDITION";

    /**
     * Internal usage only.
     * 
     * @event Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore#EVENT_MARKUP_DELETE_EDITION
     * @type {string}
     * @private
     */
    namespace.EVENT_MARKUP_DELETE_EDITION = "EVENT_MARKUP_DELETE_EDITION";


})();
(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;

    /**
     *
     * @param id
     * @param editor
     * @constructor
     */
    function MarkupFreehand(id, editor) {

        namespace.MarkupPen.call(this, id, editor);
        this.type = namespace.MARKUP_TYPE_FREEHAND;
    }

    MarkupFreehand.prototype = Object.create(namespace.MarkupPen.prototype);
    MarkupFreehand.prototype.constructor = MarkupFreehand;

    var proto = MarkupFreehand.prototype;

    proto.getEditMode = function() {

        return new namespace.EditModeFreehand(this.editor);
    };


    /**
     * Applies data values into DOM element style/attribute(s)
     *
     */
    proto.updateStyle = function() {

        var cssStyle = 'mix-blend-mode: normal';
        namespace.MarkupPen.prototype.updateStyle.call(this, cssStyle);

    };

    namespace.MarkupFreehand = MarkupFreehand;

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;

    /**
     *
     * @param id
     * @param editor
     * @constructor
     */
    function MarkupHighlight(id, editor) {

        namespace.MarkupPen.call(this, id, editor);
        this.type = namespace.MARKUP_TYPE_HIGHLIGHT;
    }

    MarkupHighlight.prototype = Object.create(namespace.MarkupPen.prototype);
    MarkupHighlight.prototype.constructor = MarkupHighlight;

    var proto = MarkupHighlight.prototype;

    proto.getEditMode = function() {

        return new namespace.EditModeHighlight(this.editor);
    };


    /**
     * Applies data values into DOM element style/attribute(s)
     *
     */
    proto.updateStyle = function() {

        var cssStyle = 'mix-blend-mode: multiply';
        namespace.MarkupPen.prototype.updateStyle.call(this, cssStyle);

    };

    namespace.MarkupHighlight = MarkupHighlight;

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;
    var namespaceUtils = Autodesk.Viewing.Extensions.Markups.Core.Utils;

    /**
     *
     * @param id
     * @param editor
     * @constructor
     */
    function MarkupPolyline(id, editor) {

        var styleAttributes = ['stroke-width', 'stroke-color','stroke-opacity', 'fill-color', 'fill-opacity'];
        namespace.Markup.call(this, id, editor, styleAttributes);

        this.type = namespace.MARKUP_TYPE_POLYLINE;
        this.shape = namespaceUtils.createMarkupPathSvg('path');

        this.bindDomEvents();
    }

    MarkupPolyline.prototype = Object.create(namespace.Markup.prototype);
    MarkupPolyline.prototype.constructor = MarkupPolyline;

    var proto = MarkupPolyline.prototype;

    proto.getEditMode = function() {

        return new namespace.EditModePolyline(this.editor);
    };

    /**
     * Sets top-left and bottom-right values in client space coordinates (2d).
     *
     * @param position
     * @param size
     * @param locations
     * @param closed
     */
    proto.set = function(position, size, locations, closed) {

        this.rotation = 0; // Reset angle //
        this.locations = locations.concat();

        this.size.x = (size.x === 0) ? 1 : size.x;
        this.size.y = (size.y === 0) ? 1 : size.y;

        this.closed = closed;

        this.setSize(position, size.x, size.y);
        this.updateStyle();
    };


    /**
     * Applies data values into DOM element style/attribute(s)
     *
     */
    proto.updateStyle = function() {

        var style = this.style;
        var shape = this.shape;

        var strokeWidth = this.style['stroke-width'];
        var strokeColor = this.highlighted ? this.highlightColor : namespaceUtils.composeRGBAString(style['stroke-color'], style['stroke-opacity']);
        var fillColor = this.closed ? namespaceUtils.composeRGBAString(style['fill-color'], style['fill-opacity']) : 'none';
        var transform = this.getTransform();

        namespaceUtils.setAttributeToMarkupSvg(shape, 'd',  this.getPath().join(' '));
        namespaceUtils.setAttributeToMarkupSvg(shape, 'stroke-width', strokeWidth);
        namespaceUtils.setAttributeToMarkupSvg(shape, 'stroke', strokeColor);
        namespaceUtils.setAttributeToMarkupSvg(shape, 'fill', fillColor);
        namespaceUtils.setAttributeToMarkupSvg(shape, 'transform', transform);
        namespaceUtils.updateMarkupPathSvgHitarea(shape, this.editor);
    };

    /**
     * Changes the position and size of the markup.
     * This gets called by the Autodesk.Viewing.Extensions.Markups.Core.SetSize edit action
     * @param {{x: Number, y: Number}} position
     * @param {Number} width
     * @param {Number} height
     */
    proto.setSize = function (position, width, height) {

        width = (width === 0 ? 1 : width);
        height = (height === 0 ? 1 : height);

        var locations = this.locations;
        var locationsCount = locations.length;

        var scaleX = width / this.size.x;
        var scaleY = height / this.size.y;

        for(var i = 0; i < locationsCount; ++i) {

            var point = locations[i];

            point.x *= scaleX;
            point.y *= scaleY;
        }

        this.position.x = position.x;
        this.position.y = position.y;

        this.size.x = width;
        this.size.y = height;

        this.updateStyle();
    };

    proto.setMetadata = function() {

        var metadata = namespaceUtils.cloneStyle(this.style);

        metadata.type = this.type;
        metadata.position = [this.position.x, this.position.y].join(" ");
        metadata.size = [this.size.x, this.size.y].join(" ");
        metadata.rotation = String(this.rotation);
        metadata.locations = this.locations.map(function(point){
            return [point.x, point.y].join(" ");
        }).join(" ");

        return namespaceUtils.addMarkupMetadata(this.shape, metadata);
    };

    proto.getPath = function() {

        var path = [];
        var locations = this.locations;
        var locationsCount = locations.length;

        if (locationsCount === 0) {
            return ' ';
        }

        path.push('M');
        path.push(locations[0].x);
        path.push(locations[0].y);

        for (var i = 1; i < locationsCount; ++i) {

            var locationA = locations[i - 1];
            var locationB = locations[i];

            path.push('l');
            path.push(locationB.x - locationA.x);
            path.push(locationB.y - locationA.y);
        }

        this.closed && path.push('z');
        return path;
    };

    namespace.MarkupPolyline = MarkupPolyline;

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;
    var namespaceUtils = Autodesk.Viewing.Extensions.Markups.Core.Utils;

    /**
     *
     * @param id
     * @param editor
     * @constructor
     */
    function MarkupPolycloud(id, editor) {

        var styleAttributes = ['stroke-width', 'stroke-color','stroke-opacity', 'fill-color', 'fill-opacity'];
        namespace.Markup.call(this, id, editor, styleAttributes);

        this.type = namespace.MARKUP_TYPE_POLYCLOUD;
        this.locations = [];
        this.shape = namespaceUtils.createMarkupPathSvg();

        this.bindDomEvents();
    }

    MarkupPolycloud.prototype = Object.create(namespace.Markup.prototype);
    MarkupPolycloud.prototype.constructor = MarkupPolycloud;

    var proto = MarkupPolycloud.prototype;

    proto.getEditMode = function() {

        return new namespace.EditModePolycloud(this.editor);
    };

    /**
     *
     * Sets top-left and bottom-right values in client space coordinates (2d).
     * @param position
     * @param size
     * @param locations
     * @param closed
     */
    proto.set = function(position, size, locations, closed) {

        this.rotation = 0; // Reset angle //
        this.locations = locations.concat();

        this.size.x = (size.x === 0) ? 1 : size.x;
        this.size.y = (size.y === 0) ? 1 : size.y;

        this.closed = closed;

        this.setSize(position, size.x, size.y);
        this.updateStyle();
    };

    /**
     * Applies data values into DOM element style/attribute(s)
     *
     */
    proto.updateStyle = function() {

        var style = this.style;
        var shape = this.shape;
        var path = this.getPath().join(' ');

        var strokeWidth = this.style['stroke-width'];
        var strokeColor = this.highlighted ? this.highlightColor : namespaceUtils.composeRGBAString(style['stroke-color'], style['stroke-opacity']);
        var fillColor = this.closed ? namespaceUtils.composeRGBAString(style['fill-color'], style['fill-opacity']) : 'none';
        var transform = this.getTransform();

        namespaceUtils.setAttributeToMarkupSvg(shape, 'd', path);
        namespaceUtils.setAttributeToMarkupSvg(shape, 'stroke-width', strokeWidth);
        namespaceUtils.setAttributeToMarkupSvg(shape, 'stroke', strokeColor);
        namespaceUtils.setAttributeToMarkupSvg(shape, 'fill', fillColor);
        namespaceUtils.setAttributeToMarkupSvg(shape, 'transform', transform);
        namespaceUtils.updateMarkupPathSvgHitarea(shape, this.editor);
    };

    /**
     * Changes the position and size of the markup.
     * This gets called by the Autodesk.Viewing.Extensions.Markups.Core.SetSize edit action
     * @param {{x: Number, y: Number}} position
     * @param {Number} width
     * @param {Number} height
     */
    proto.setSize = function (position, width, height) {

        width = (width === 0 ? 1 : width);
        height = (height === 0 ? 1 : height);

        var locations = this.locations;
        var locationsCount = locations.length;

        var scaleX = width / this.size.x;
        var scaleY = height / this.size.y;

        for(var i = 0; i < locationsCount; ++i) {

            var point = locations[i];

            point.x *= scaleX;
            point.y *= scaleY;
        }

        this.position.x = position.x;
        this.position.y = position.y;

        this.size.x = width;
        this.size.y = height;

        this.updateStyle();
    };

    proto.setMetadata = function() {

        var metadata = namespaceUtils.cloneStyle(this.style);

        metadata.type = this.type;
        metadata.position = [this.position.x, this.position.y].join(" ");
        metadata.size = [this.size.x, this.size.y].join(" ");
        metadata.rotation = String(this.rotation);
        metadata.locations = this.locations.map(function(point){
            return [point.x, point.y].join(" ");
        }).join(" ");

        return namespaceUtils.addMarkupMetadata(this.shape, metadata);
    };

    proto.getPath = function() {

        function getOrientation(locations) {

            switch (locations.length) {

                case 0:
                case 1:
                    return 1;
                case 2:

                    var fstPoint = locations[0];
                    var sndPoint = locations[1];

                    return fstPoint.y > sndPoint.y ? 1 : -1;
                default:

                    var pointA = locations[0];
                    var pointB = locations[1];
                    var pointC = locations[2];

                    var orientation =
                        (pointB.x - pointA.x) * (pointB.y + pointA.y) +
                        (pointC.x - pointB.x) * (pointC.y + pointB.y);

                    return orientation < 0 ? 1 : -1;
            }
        }

        function getSides(locations, closed) {

            var locationsCount = locations.length;

            var sides = [];
            var sidesCount = locationsCount - (closed ? 0 : 1);

            for(var i = 0; i < sidesCount; ++i) {

                var locationA = locations[i];
                var locationB = locations[(i+1)%locationsCount];

                var dx = locationB.x - locationA.x;
                var dy = locationB.y - locationA.y;

                var length = Math.sqrt(dx * dx + dy * dy);

                sides.push({
                    index: i,
                    pointA: new THREE.Vector3(locationA.x, locationA.y, 0),
                    pointB: new THREE.Vector3(locationB.x, locationB.y, 0),
                    vecAB:  new THREE.Vector3(dx / length, dy / length, 0),
                    vecBA:  new THREE.Vector3(-dx / length, -dy / length, 0),
                    length: length
                });
            }

            return sides;
        }

        function updateSides(sides, corners, radius) {

            var diameter = radius * 2;
            var sidesCount = sides.length;

            for(var i = 0; i < sidesCount; ++i) {

                var side = sides[i];
                var cornerA = corners[i];
                var cornerB = corners[(i+1)%sidesCount];

                side.bodyA = side.vecAB.clone().multiplyScalar(cornerA.radius).add(side.pointA);
                side.bodyB = side.vecBA.clone().multiplyScalar(cornerB.radius).add(side.pointB);

                side.body = side.bodyB.clone().sub(side.bodyA).length();
                side.bodyCount = Math.round(side.body / diameter);
                side.bodyDiameter = diameter + (side.body - diameter * side.bodyCount) / side.bodyCount;
                side.bodyRadius = side.bodyDiameter * 0.5;
            }
        }

        function getCorners(sides, radius, closed) {

            var corners = [];
            var sidesCount = sides.length;

            for(var i = 0; i < sidesCount; ++i) {

                var sideA = sides[i !== 0 ? i-1 : sidesCount-1];
                var sideB = sides[i];
                var large = sideA.vecBA.clone().cross(sideB.vecAB).z < 0;

                var sidesTooShort = sideA.length < radius || sideB.length < radius;
                if (sidesTooShort || (i === 0 && !closed)) {

                    corners.push({
                        pointA: sideB.pointA.clone(),
                        pointB: sideB.pointA.clone(),
                        radius: 0,
                        large: false
                    });
                } else {

                    corners.push({
                        pointA: sideB.pointA.clone().add(sideA.vecBA.clone().multiplyScalar(radius)),
                        pointB: sideB.pointA.clone().add(sideB.vecAB.clone().multiplyScalar(radius)),
                        radius: radius,
                        large: large
                    });
                }
            }

            return corners;
        }

        function createSidePath(side, orientation, path) {

            var radius = side.bodyRadius;
            var diameter = side.bodyDiameter;

            var xValueInset = diameter * 0.05;
            var yValueOffset = radius * 3.5 / 3.0;

            var p1 = new THREE.Vector3(xValueInset, orientation * -yValueOffset);
            var p2 = new THREE.Vector3(diameter - xValueInset, orientation * -yValueOffset);
            var p3 = new THREE.Vector3(diameter, 0);

            var angle = Math.acos(side.vecAB.x) * (side.vecAB.y < 0 ? -1 : 1);
            var rotation = new THREE.Matrix4().makeRotationZ(angle);

            p1.applyMatrix4(rotation);
            p2.applyMatrix4(rotation);
            p3.applyMatrix4(rotation);

            var count = side.bodyCount;
            for (var i = 0; i < count; ++i) {

                path.push('c');
                path.push(p1.x);
                path.push(p1.y);
                path.push(p2.x);
                path.push(p2.y);
                path.push(p3.x);
                path.push(p3.y);
            }
        }

        function createCornerPath(corner, first, orientation, path) {

            if (first) {

                path.push('M');
                path.push(corner.pointA.x);
                path.push(corner.pointA.y);
            }

            var large = orientation === 1 ? corner.large : !corner.large;

            if (corner.radius !== 0) {

                path.push('a');
                path.push(corner.radius);
                path.push(corner.radius);
                path.push(0);
                path.push(large ? 1 : 0);
                path.push(orientation === 1 ? 1 : 0);
                path.push(corner.pointB.x - corner.pointA.x);
                path.push(corner.pointB.y - corner.pointA.y);
            }
            return path;
        }


        var strokeWidth = this.style['stroke-width'];
        var radius = strokeWidth * 2;
        var orientation = getOrientation(this.locations);
        var closed = this.closed;
        var path = [];

        var sides = getSides(this.locations, closed);
        var corners = getCorners(sides, radius, closed);
        var cornersCount = corners.length;

        updateSides(sides, corners, radius);

        for(var i = 0; i < cornersCount; ++i) {

            createCornerPath(corners[i], i === 0, orientation, path);
            createSidePath(sides[i], orientation, path);
        }

        closed && path.push('z');
        return path;
    };

    namespace.MarkupPolycloud = MarkupPolycloud;

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;
    var namespaceUtils = Autodesk.Viewing.Extensions.Markups.Core.Utils;

    /**
     * Rectangle markup.
     *
     * Implements a Rectangle [Markup]{@link Autodesk.Viewing.Extensions.Markups.Core.Markup}.
     * Included in documentation as an example of how to create
     * a specific markup type. Developers are encourage to look into this class's source code and copy
     * as much code as they need. Find link to source code below.
     *
     * @tutorial feature_markup
     * @constructor
     * @memberof Autodesk.Viewing.Extensions.Markups.Core
     * @extends Autodesk.Viewing.Extensions.Markups.Core.Markup
     *
     * @param {number} id
     * @param {Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore} editor
     * @constructor
     * @category Extensions
     */
    function MarkupRectangle(id, editor) {

        var styleAttributes = ['stroke-width', 'stroke-color', 'stroke-opacity', 'fill-color', 'fill-opacity'];
        namespace.Markup.call(this, id, editor, styleAttributes);

        this.type = namespace.MARKUP_TYPE_RECTANGLE;
        this.shape = namespaceUtils.createMarkupPathSvg();

        this.bindDomEvents();
    }

    MarkupRectangle.prototype = Object.create(namespace.Markup.prototype);
    MarkupRectangle.prototype.constructor = MarkupRectangle;

    var proto = MarkupRectangle.prototype;

    proto.getEditMode = function() {

        return new namespace.EditModeRectangle(this.editor);
    };

    /**
     * Sets position and size in markup space coordinates
     * @param {Object} position
     * @param {Object} size
     */
    proto.set = function(position, size) {

        this.position.x = position.x;
        this.position.y = position.y;
        this.size.x = size.x;
        this.size.y = size.y;

        this.updateStyle();
    };

    /**
     * Applies data values into DOM element style/attribute(s)
     *
     */
    proto.updateStyle = function() {

        var style = this.style;
        var shape = this.shape;
        var path = this.getPath().join(' ');

        var strokeWidth = this.style['stroke-width'];
        var strokeColor = this.highlighted ? this.highlightColor : namespaceUtils.composeRGBAString(style['stroke-color'], style['stroke-opacity']);
        var fillColor = namespaceUtils.composeRGBAString(style['fill-color'], style['fill-opacity']);
        var transform = this.getTransform();

        namespaceUtils.setAttributeToMarkupSvg(shape, 'd', path);
        namespaceUtils.setAttributeToMarkupSvg(shape, 'stroke-width', strokeWidth);
        namespaceUtils.setAttributeToMarkupSvg(shape, 'stroke', strokeColor);
        namespaceUtils.setAttributeToMarkupSvg(shape, 'fill', fillColor);
        namespaceUtils.setAttributeToMarkupSvg(shape, 'transform', transform);
        namespaceUtils.updateMarkupPathSvgHitarea(shape, this.editor);
    };

    proto.setMetadata = function() {

        var metadata = namespaceUtils.cloneStyle(this.style);

        metadata.type = this.type;
        metadata.position = [this.position.x, this.position.y].join(" ");
        metadata.size = [this.size.x, this.size.y].join(" ");
        metadata.rotation = String(this.rotation);

        return namespaceUtils.addMarkupMetadata(this.shape, metadata);
    };

    proto.getPath = function() {

        var strokeWidth = this.style['stroke-width'];

        var w = this.size.x - strokeWidth;
        var h = this.size.y - strokeWidth;
        var x =-w * 0.5;
        var y =-h * 0.5;

        var path = [];
        namespaceUtils.createRectanglePath(x, y, w, h, false, path);

        return path;
    };

    namespace.MarkupRectangle = MarkupRectangle;

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;
    var namespaceUtils = Autodesk.Viewing.Extensions.Markups.Core.Utils;

    // LMV ViewerLMV-2170 [Markup] [PDF] Text markup missing/cutoff for normal sized text.
    // If the font size of an SVG text is too small, the text is not rendered independently of its final screen size.
    // To solve the issue we multiply font size by 100 and scale down the text in its transform.
    var FONT_SIZE_SCALE = 100;

    /**
     * Arrow Markup.
     * @constructor
     */
    function MarkupText(id, editor, size) {

        var styleAttributes = [
            'font-size',
            'stroke-color',
            'stroke-opacity',
            'fill-color',
            'fill-opacity',
            'font-family',
            'font-style',
            'font-weight'
        ];

        namespace.Markup.call(this, id, editor, styleAttributes);

        this.type = namespace.MARKUP_TYPE_TEXT;
        this.shape = namespaceUtils.createMarkupTextSvg();
        this.constraintRotation = true;
        this.size.x = size.x;
        this.size.y = size.y;
        this.currentText = "";
        this.currentTextLines = [""];
        this.textDirty = true;
        this.textSize = {x: 0, y: 0};

        // Note: We could have this property be a style property.
        // However, there is no need for this property to be exposed to the user for alteration
        // This value is a percentage of the font size used to offset vertically 2 text lines
        // of the same paragraph.
        // Notice that this value is used by EditorTextInput.js
        this.lineHeight = 130;

        this.bindDomEvents();
    }

    MarkupText.prototype = Object.create(namespace.Markup.prototype);
    MarkupText.prototype.constructor = MarkupText;

    var proto = MarkupText.prototype;

    proto.getEditMode = function() {

        return new namespace.EditModeText(this.editor);
    };

    /**
     *
     * @param {String} position
     * @param {String} size
     * @param {String} textString
     * @param {Array} textLines
     */
    proto.set = function(position, size, textString, textLines) {

        this.position.x = position.x;
        this.position.y = position.y;
        this.size.x = size.x;
        this.size.y = size.y;

        this.setText(textString, textLines);
    };

    proto.setSize = function(position, width, height) {

        this.position.x = position.x;
        this.position.y = position.y;
        this.size.x = width;
        this.size.y = height;

        this.updateStyle();
    };

    proto.setStyle = function(style) {

        namespaceUtils.copyStyle(style, this.style);
        this.updateStyle();
    };

    /**
     *
     * @param {String} text
     */
    proto.setText = function(text) {

        this.currentText = text;
        this.updateStyle();
    };

    /**
     * Returns the raw string value
     * @returns {String}
     */
    proto.getText = function() {

        return this.currentText;
    };

    /**
     * Returns a shallow copy of the text lines used for rendering SVG text
     * @returns {Array.<String>}
     */
    proto.getTextLines = function() {

        return this.currentTextLines.concat();
    };

    /**
     * Applies data values into DOM element style/attribute(s)
     *
     */
    proto.updateStyle = function() {

        function applyState() {

            var style = this.style;
            var shape = this.shape;
            var fontSize = this.style['font-size'];
            var fontFamily = this.style['font-family'];
            var fontWeight = this.style['font-weight'];
            var fontStyle =  this.style['font-style'];
            var strokeColor = this.highlighted ? this.highlightColor : namespaceUtils.composeRGBAString(style['stroke-color'], style['stroke-opacity']);
            var fillColor = namespaceUtils.composeRGBAString(style['fill-color'], style['fill-opacity']);

            this.rebuildTextSvg();

            namespaceUtils.setAttributeToMarkupSvg(shape, 'font-family', fontFamily);
            namespaceUtils.setAttributeToMarkupSvg(shape, 'font-size', fontSize * FONT_SIZE_SCALE);
            namespaceUtils.setAttributeToMarkupSvg(shape, 'fill', strokeColor);
            namespaceUtils.setAttributeToMarkupSvg(shape, 'font-weight', fontWeight);
            namespaceUtils.setAttributeToMarkupSvg(shape, 'font-style', fontStyle);

            var editor = this.editor;
            var transform = this.getTransform();
            var textTransform = this.getTextTransform();
            var textSize = this.textSize;

            namespaceUtils.setMarkupTextSvgTransform(shape, transform, textTransform);
            namespaceUtils.updateMarkupTextSvgBackground(shape, textSize.x, textSize.y, fillColor);
            namespaceUtils.updateMarkupTextSvgClipper(shape, textSize.x, textSize.y);
            namespaceUtils.updateMarkupTextSvgHitarea(shape, textSize.x, textSize.y, editor);

            this.applyingStyle = false;
        }

        this.applyingStyle = this.applyingStyle || false;
        if(!this.applyingStyle) {
            this.applyingStyle = true;
            // Markup text will create svg element after exit text input. 
            // If user input some texts in text input, then click save directly, 
            // the markup text can't be saved correctly.
            // So applying the style immediately and then applying it again 
            // during the next frame for google browsers
            applyState.bind(this)();

            requestAnimationFrame(applyState.bind(this));
        }
    };

    /**
     * Re-creates SVG tags that render SVG text.
     * Each line is placed around tspan tags which are vertically offset to each other.
     */
    proto.rebuildTextSvg = function() {

        // TODO: Remove the need to get text values from an object in edit mode, should be a function.
        // editMode needs to be set to load markups in view mode
        var editMode = this.editor.duringEditMode ? this.editor.editMode : this.getEditMode();
        if (editMode && editMode.type === this.type) {
            var style = namespaceUtils.cloneStyle(editMode.textInputHelper.style);
            var text = editMode.textInputHelper.textArea.value;
            this.currentTextLines = editMode.textInputHelper.getTextValuesForMarkup(this).lines;
            if (editMode.selectedMarkup !== this) {
                editMode.textInputHelper.textArea.value = text;
                editMode.textInputHelper.setStyle(style);
            }
        }

        var markup = namespaceUtils.createSvgElement('text');
        markup.setAttribute('id', 'markup');
        markup.setAttribute('alignment-baseline', 'middle');

        this.shape.childNodes[0].removeChild(this.shape.markup);
        this.shape.childNodes[0].appendChild(markup);
        this.shape.markup = markup;

        // For each line, create a tspan, add as child and offset it vertically.
        var dx = 0;
        var dy = 0;
        var yOffset = this.getLineHeight() * FONT_SIZE_SCALE;

        this.currentTextLines.forEach(function(line){

            var tspan = namespaceUtils.createSvgElement('tspan');

            tspan.setAttribute('x', dx);
            tspan.setAttribute('y', dy);
            tspan.textContent = line;

            markup.appendChild(tspan);
            dy += yOffset;
        }.bind(this));

        var polygon = this.generateBoundingPolygon();
        var textSize = this.editor.sizeFromClientToMarkups(
            polygon.xVertices[1] - polygon.xVertices[0],
            polygon.yVertices[2] - polygon.yVertices[0]);

        this.textSize.x = Math.min(textSize.x, this.size.x);
        this.textSize.y = Math.min(textSize.y, this.size.y);
    };

    /**
     *
     * @returns {{vertexCount: number, xVertices: Float32Array, yVertices: Float32Array}}
     */
    proto.generateBoundingPolygon = function() {

        function getTextSize(lines, style, editor) {

            var size = {w:0, h:0};

            var lines = namespaceUtils.measureTextLines(lines, style, editor);
            var linesCount = lines.length;

            for(var i = 0; i < linesCount; ++i) {

                var line = lines[i];

                size.w = Math.max(size.w, line.width);
                size.h = size.h + line.height;
            }

            if (size.h !== 0) {
                size.h += editor.sizeFromMarkupsToClient(0, style['font-size'] * 0.25).y;
            }

            return size;
        }

        var position = this.getClientPosition();
        var size = this.getClientSize();
        var textSize = getTextSize(this.currentTextLines, this.style, this.editor);

        var w = Math.min(size.x, textSize.w);
        var h = Math.min(size.y, textSize.h);

        var lt = new THREE.Vector2(-size.x * 0.5,-size.y * 0.5).add(position);
        var rt = new THREE.Vector2( lt.x + w, lt.y);
        var rb = new THREE.Vector2( rt.x, rt.y + h);
        var lb = new THREE.Vector2( lt.x, rb.y);

        return { // packed for fast access in test algorithm.
            vertexCount: 4,
            xVertices : new Float32Array([lt.x, rt.x, rb.x, lb.x]),
            yVertices : new Float32Array([lt.y, rt.y, rb.y, lb.y])
        };
    };

    proto.setMetadata = function() {

        var metadata = namespaceUtils.cloneStyle(this.style);

        metadata.type = this.type;
        metadata.position = [this.position.x, this.position.y].join(" ");
        metadata.size = [this.size.x, this.size.y].join(" ");
        metadata.text = String(this.currentText);

        return namespaceUtils.addMarkupMetadata(this.shape, metadata);
    };

    /**
     * Helper method that returns the font size in client space coords.
     * @returns {Number}
     */
    proto.getClientFontSize = function() {

        return this.editor.sizeFromMarkupsToClient(0, this.style['font-size']).y;
    };

    proto.getLineHeight = function() {

        return this.style['font-size'];
    };

    proto.getTransform = function() {

        var x = this.position.x - this.size.x * 0.5;
        var y = this.position.y + this.size.y * 0.5;

        return [
            'translate(', x, ',', y, ')',
            'rotate(', namespaceUtils.radiansToDegrees(-this.rotation), ')',
            'scale(1,-1)'
        ].join(' ');
    };

    proto.getTextTransform = function() {

        var lineHeight = this.getLineHeight();

        var x = this.position.x - this.size.x * 0.5;
        var y = this.position.y + this.size.y * 0.5 - lineHeight;

        return [
            'translate(', x, ',', y, ')',
            'rotate(', namespaceUtils.radiansToDegrees(-this.rotation), ')',
            'scale(' + (1/FONT_SIZE_SCALE) + ',' + (-1/FONT_SIZE_SCALE) + ')'
        ].join(' ');
    };

    proto.cloneShape = function(clone) {
        
        clone.shape = namespaceUtils.createMarkupTextSvg();
        clone.bindDomEvents();
    };

    namespace.MarkupText = MarkupText;

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;

    function MarkupTool() {

        Autodesk.Viewing.ToolInterface.call(this);
        this.names = ["markups.core"];
        this.panTool = null;
        this.allowNav = false;

        this.coreExt = null;
        this.hotkeysEnabled = true;

        var _ctrlDown = false;
        var _shiftDown = false;

        // Non-ToolInterface methods //

        this.allowNavigation = function(allow) {
            this.allowNav = allow;
        };
        this.setCoreExtension = function(coreExt) {
            this.coreExt = coreExt;
        };
        this.setHotkeysEnabled = function(enabled) {
            this.hotkeysEnabled = enabled;
        };


        // ToolInterface methods //

        this.activate = function(name, viewerApi) {
            this.panTool = viewerApi.toolController.getTool("pan");
            if (this.panTool) {
                this.panTool.activate("pan"); // TODO: What if we want "zoom" here?
            }
        };
        this.deactivate = function(name) {
            if (this.panTool) {
                this.panTool.deactivate("pan");
            }
            this.panTool = null;
        };

        this.handleKeyDown = function(event, keyCode) {

            if (!this.coreExt.editMode) {
                return false;
            }

            if (!this.hotkeysEnabled) {
                return true; // Consume event
            }

            // Don't propagate key handling down to tool //

            switch (keyCode) {
                case Autodesk.Viewing.KeyCode.CONTROL: _ctrlDown = true; break;
                case Autodesk.Viewing.KeyCode.SHIFT: _shiftDown = true; break;

                case Autodesk.Viewing.KeyCode.x: _ctrlDown && !this.allowNav && this.coreExt.cut(); break;
                case Autodesk.Viewing.KeyCode.c: _ctrlDown && !this.allowNav && this.coreExt.copy(); break;
                case Autodesk.Viewing.KeyCode.v: _ctrlDown && !this.allowNav && this.coreExt.paste(); break;
                case Autodesk.Viewing.KeyCode.d:
                    if (_ctrlDown && !this.allowNav) {
                        // Duplicate
                        this.coreExt.copy();
                        this.coreExt.paste();
                    }
                    break;
                case Autodesk.Viewing.KeyCode.z:
                    if (_ctrlDown && !_shiftDown && !this.allowNav) {
                        this.coreExt.undo();
                    }
                    else if (_ctrlDown && _shiftDown && !this.allowNav) {
                        this.coreExt.redo(); // Also support Ctrl+Y
                    }
                    break;
                case Autodesk.Viewing.KeyCode.y: _ctrlDown && !this.allowNav && this.coreExt.redo(); break; // Also support ctrl+shift+z
                case Autodesk.Viewing.KeyCode.ESCAPE: this.coreExt.onUserCancel(); break;

                case Autodesk.Viewing.KeyCode.BACKSPACE: // Fall through
                case Autodesk.Viewing.KeyCode.DELETE:
                    var selectedMarkup = this.coreExt.getSelection();
                    if (selectedMarkup) {
                        this.coreExt.deleteMarkup(selectedMarkup);
                    }
                    break;
                case Autodesk.Viewing.KeyCode.F12:
                    return false; // To allow opening developer console.
                    break;
                default: break;
            }

            return true; // Consume event
        };
        this.handleKeyUp = function(event, keyCode) {

            if (!this.coreExt.editMode) {
                return false;
            }

            if (!this.hotkeysEnabled) {
                return true; // Consume event
            }

            // Don't propagate key handling down to tool

            switch (keyCode) {
                case Autodesk.Viewing.KeyCode.CONTROL: _ctrlDown = false; break;
                case Autodesk.Viewing.KeyCode.SHIFT: _shiftDown = false; break;
                default: break;
            }

            return true; // Consume event ONLY
        };

        this.update = function() {
            if (this.allowNav && this.panTool && this.panTool.update) {
                return this.panTool.update();
            }
            return false;
        };

        this.handleSingleClick = function( event, button ) {
            if (this.allowNav) {
                // If pan tool won't handle single click, then pass over the event.
                if (this.panTool && this.panTool.handleSingleClick)
                    return this.panTool.handleSingleClick(event, button);
                else
                    return false;
            }
            return true; // Consume event
        };
        this.handleDoubleClick = function( event, button ) {
            if (this.allowNav) {
                // If pan tool won't handle double click, then pass over the event
                if (this.panTool && this.panTool.handleDoubleClick) {
                    return this.panTool.handleDoubleClick(event, button);
                }
                else
                    return false;
            }
            return true; // Consume event
        };
        this.handleSingleTap = function( event ) {
            if (this.allowNav) {
                // If pan tool won't handle single tap, then pass over the event
                if (this.panTool && this.panTool.handleSingleTap) {
                    return this.panTool.handleSingleTap(event);
                }
                else
                    return false;
            }
            return true; // Consume event
        };
        this.handleDoubleTap = function( event ) {
            if (this.allowNav) {
                // If pan tool won't handle double tap, then pass over the event
                if (this.panTool && this.panTool.handleDoubleTap) {
                    return this.panTool.handleDoubleTap(event);
                }
                else
                    return false;
            }
            return true; // Consume event
        };
        this.handleWheelInput = function(delta) {
            if (this.allowNav) {
                // If pan tool won't handle wheel input, then pass over the event
                if (this.panTool && this.panTool.handleWheelInput) {
                    return this.panTool.handleWheelInput(delta);
                }
                else
                    return false;
            }
            return true; // Consume event
        };
        this.handleButtonDown = function(event, button) {
            if (this.allowNav) {
                // If pan tool won't handle button down, then pass over the event
                if (this.panTool && this.panTool.handleButtonDown) {
                    return this.panTool.handleButtonDown(event, button);
                }
                else
                    return false;
            }
            return true; // Consume event
        };
        this.handleButtonUp = function(event, button) {
            if (this.allowNav) {
                // If pan tool won't handle button up, then pass over the event
                if (this.panTool && this.panTool.handleButtonUp) {
                    return this.panTool.handleButtonUp(event, button);
                }
                else
                    return false;
            }
            return true; // Consume event
        };
        this.handleMouseMove = function(event) {
            if (this.allowNav) {
                // If pan tool won't handle button move, then pass over the event
                if (this.panTool && this.panTool.handleMouseMove) {
                    return this.panTool.handleMouseMove(event);
                }
                else
                    return false;
            }
            return true; // Consume event
        };
        this.handleGesture = function(event) {
            if (this.allowNav) {
                // If pan tool won't handle gesture, then pass over the event
                if (this.panTool && this.panTool.handleGesture) {
                    return this.panTool.handleGesture(event);
                }
                else
                    return false;
            }
            return true; // Consume event
        };
        this.handleBlur = function(event) {
            if (this.allowNav) {
                // If pan tool won't handle blur, then pass over the event
                if (this.panTool && this.panTool.handleBlur) {
                    return this.panTool.handleBlur(event);
                }
                else
                    return false;
            }
            return true; // Consume event
        };
    }

    namespace.MarkupTool = MarkupTool;
})();

(function(){ 'use strict';

    var namespace = AutodeskNamespace('Autodesk.Viewing.Extensions.Markups.Core');
    var namespaceUtils = AutodeskNamespace('Autodesk.Viewing.Extensions.Markups.Core.Utils');
    var avem = Autodesk.Viewing.Extensions.Measure;
    var MeasureCommon = Autodesk.Viewing.Extensions.Measure.Functions;

    var PERSPECTIVE_MODE_SCALE = 1000;

    /**
     * Extension that allows end users to draw 2D markups on top of 2D and 3D models.
     *
     * @tutorial feature_markup
     * @param {Autodesk.Viewing.Viewer3D} viewer - Viewer instance used to operate on.
     * @param {object} options - Same Dictionary object passed into [Viewer3D]{@link Autodesk.Viewing.Viewer3D}'s constructor.
     * [show()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore/#show}.
     * @param {boolean} [options.markupDisableHotkeys] - Disables hotkeys for copy, cut, paste, duplicate, undo, redo and deselect.
     * @param {Autodesk.Viewing.ToolInterface} [options.markupToolClass] - Class override for input handling.
     * Use it to override/extend default hotkeys and/or mouse/gesture input.
     * @memberof Autodesk.Viewing.Extensions.Markups.Core
     * @constructor
     * @category Extensions
     */
    function MarkupsCore(viewer, options) {

        Autodesk.Viewing.Extension.call(this, viewer, options);

        this.options = this.options || {};
        this.markups = [];
        this.styles = {};

        this.activeLayer = '';
        this.duringViewMode = false;
        this.duringEditMode = false;

        this.svgLayersMap = {};

        // Add action manager.
        this.actionManager = new namespace.EditActionManager( 50 ); // history of 50 actions.
        this.actionManager.addEventListener(namespace.EVENT_HISTORY_CHANGED, this.onEditActionHistoryChanged.bind(this));

        this.nextId = 0; // Used to identify markups by id during an edit session.

        // Clipboard.
        this.clipboard = new namespace.Clipboard(this);

        // Default Input handler.
        this.input = new namespace.InputHandler();

        // Extension will dispatch events.
        namespaceUtils.addTraitEventDispatcher(this);

        // Handled events.
        this.onCameraChangeBinded = this.onCameraChange.bind(this);
        this.onViewerResizeBinded = function(event) {
            // This is ugly, but we need to do this twice
            var self = this;
            // First usage is to avoid a blinking scenario
            self.onViewerResize(event);
            requestAnimationFrame(function(){
                // Second one is to actually make it work on some resize scenarios.
                // Check the unlikely scenario that we are no longer in view mode.
                if (self.duringViewMode) {
                    self.onViewerResize(event);
                }
            });
        }.bind(this);

        this.onMarkupSelectedBinded = this.onMarkupSelected.bind(this);
        this.onMarkupEnterEditionBinded = this.onMarkupEnterEdition.bind(this);
        this.onMarkupCancelEditionBinded = this.onMarkupCancelEdition.bind(this);
        this.onMarkupDeleteEditionBinded = this.onMarkupDeleteEdition.bind(this);
        this.onToolChangeBinded = this.onToolChange.bind(this);

        // Adds some css styles that create a bigger mouse area over certain elements, used mostly in mobile.
        var sheet = namespaceUtils.createStyleSheet();
        namespaceUtils.addRuleToStyleSheet(
            sheet,
            '.autodesk-markups-extension-core-make-me-bigger:after',
            'content:""; position:absolute; top:-10px; bottom:-10px; left:-10px; right:-10px;',
            0);
    }

    MarkupsCore.prototype = Object.create(Autodesk.Viewing.Extension.prototype);
    MarkupsCore.prototype.constructor = MarkupsCore;
    namespace.MarkupsCore = MarkupsCore;

    var proto = MarkupsCore.prototype;

    proto.load = function () {

        // Add layer where annotations will actually live
        var svg = this.svg = namespaceUtils.createSvgElement('svg');
        namespaceUtils.setSvgParentAttributes(svg);

        // NOTE: Required since LMV renders Y coordinates upwards,
        // while browser's Y coordinates goes downwards.
        var svgStyle = new namespaceUtils.DomElementStyle();
        svgStyle.setAttribute('position', 'absolute');
        svgStyle.setAttribute('left', '0');
        svgStyle.setAttribute('top', '0');
        svgStyle.setAttribute('transform', 'scale(1,-1)', { allBrowsers: true});
        svgStyle.setAttribute('transformOrigin', '0, 0', { allBrowsers: true});
        svg.setAttribute('style', svgStyle.getStyleString());

        this.bounds = {x:0, y:0, width:0, height:0};

        this.input.attachTo(this);

        //Instantiate edit frame.
        this.editFrame = new namespace.EditFrame(this.viewer.container, this);
        this.editFrame.addEventListener(namespace.EVENT_EDITFRAME_EDITION_START, function(){this.disableMarkupInteractions(true);}.bind(this));
        this.editFrame.addEventListener(namespace.EVENT_EDITFRAME_EDITION_END, function(){this.disableMarkupInteractions(false);}.bind(this));

        // Register tool
        var toolClass = this.options.markupToolClass || namespace.MarkupTool;
        this.changeMarkupTool(toolClass, !this.options.markupDisableHotkeys);

        this.snapper = new Autodesk.Viewing.Extensions.Measure.Snapper(this.viewer, {markupMode:true});
        this.viewer.toolController.registerTool(this.snapper);

        return true;
    };

    /**
     * Change the markup tool's class in order to implement a different behaviour to the UI.
     * @param {Autodesk.Viewing.Extensions.Markups.Core.MarkupTool} toolClass - Implementation or extension of MarkupTool's class.
     * @param {boolean} enableHotKeys - Whether to enable markup's hot-keys or not.
     */
    proto.changeMarkupTool = function(toolClass, enableHotKeys) {
        if (this.markupTool) {
            this.viewer.toolController.deregisterTool(this.markupTool);
            this.markupTool = null;
        }

        this.markupTool = new toolClass();
        this.markupTool.setCoreExtension(this);
        this.markupTool.setHotkeysEnabled(enableHotKeys);
        this.viewer.toolController.registerTool(this.markupTool);
    };

    proto.unload = function() {

        this.hide();

        this.input.detachFrom(this);

        if (this.markupTool) {
            this.viewer.toolController.deregisterTool(this.markupTool);
            this.markupTool = null;
        }

        if (this.snapper) {
            this.viewer.toolController.deregisterTool(this.snapper);
            this.snapper = null;
        }

        var svg = this.svg;
        if (svg && this.onMouseDownBinded) {
            svg.removeEventListener("mousedown", this.onMouseDownBinded);
            this.onMouseDownBinded = null;
        }
        if (svg.parentNode) {
            svg.parentNode.removeChild(svg);
        }
        this.editModeSvgLayerNode = null;
        this.svg = null;

        return true;
    };

    /**
     * Toggle in and out of Edit mode. In Edit mode the user is able to draw markups on the canvas.
     *
     * See also
     * [enterEditMode()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore/#enterEditMode} and
     * [leaveEditMode()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore/#leaveEditMode}
     */
    MarkupsCore.prototype.toggleEditMode = function() {

        if (this.duringEditMode) {
            this.leaveEditMode();
        } else {
            this.enterEditMode();
        }
    };

    /**
     * Enables mouse interactions and mobile device gestures over the Viewer canvas to create or draw markups.
     *
     * Exit Edit mode by calling [leaveEditMode()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore/#leaveEditMode}.
     *
     * See also
     * [show()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore/#show}
     * @param {string} layerId - [optional] Identifier for the layer of markups to be edited. Example "Layer1".
     * @returns {boolean} Returns true if editMode is active
     */
    MarkupsCore.prototype.enterEditMode = function(layerId) {

        function disableLayerMarkups(layer, disable){
            if (layer){
                var layerMarkups = layer.markups;
                for (var k = 0; k < layerMarkups.length; k++){
                    var m = layerMarkups[k];
                    m.disableInteractions(disable);
                }
            }
        }
        if (layerId) {
            if (!this.svgLayersMap[layerId]) {
                // if layerId is supplied but it does not exist in the svgLayerMap then create the new layer
                console.warn("No such layer exists.");
                return false;
            }
        }

        // If not currently shown, then show
        if (!this.duringViewMode) {
            if (!this.show()){
                return false; // Failed to enter view mode.
            }
        }

        // Initialize the edit mode layer if it does not exist
        if(!this.editModeSvgLayerNode) {
            var parSvg = namespaceUtils.createSvgElement('g');
            this.editModeSvgLayerNode = {
                markups: [],
                svg: parSvg
            };
            this.editModeSvgLayerNode.svg.setAttribute('cursor', 'default');
        }


        if ((this.editModeSvgLayerNode.svg.parentNode != this.svg) || !layerId) {
            this.svg.appendChild(this.editModeSvgLayerNode.svg);
        }
        this.svg.setAttribute('cursor', 'crosshair');


        if (layerId) {
            var layer = this.svgLayersMap[layerId];
            // If the layer exists in the layer map, use the information stored for that specific layer.
            if (layer) {
                // Remove the edit layer when entering edit mode of a specific edit mode.
                var editModeLayerParentNode = this.editModeSvgLayerNode.svg.parentNode;
                editModeLayerParentNode && editModeLayerParentNode.removeChild(this.editModeSvgLayerNode.svg);

                // disable the markups in the editModeLayer
                disableLayerMarkups(this.editModeSvgLayerNode, true);

                // Enable interactions for markups in the current edit layer and disable interactions for markups in
                // the other layers.
                for (var key in this.svgLayersMap){
                    var markups = this.svgLayersMap[key].markups;
                    for (var i = 0; i < markups.length; i++) {
                        var markup = markups[i];
                        if (key !== layerId.toString()){
                            // disable all not in the current layer.
                            markup.disableInteractions(true);
                        } else {
                            // enable all markups in current layer.
                            markup.disableInteractions(false);
                        }
                    }
                }

                // assign the current layer to the global active layer
                this.activeLayer = layerId;
                this.editingLayer = layerId;
                var svgParent = layer.svg;

                // remove previous svg layer child from svg
                svgParent.parentNode && this.svg.removeChild(svgParent);

                // reassign the markups in that layer to the global markups list
                this.markups = layer.markups.slice();

                // re-append svg layer child to svg to make it the top most layer
                this.svg.appendChild(svgParent);
            }
        } else {
            // disable interactions for the previous markups
            // Example: enterEditMode(layer) -> enterEditMode()
            if (this.editingLayer) {
                for (var k = 0; k < this.markups.length; k++) {
                    var m = this.markups[k];
                    m.disableInteractions(true);
                }
                disableLayerMarkups(this.editModeSvgLayerNode, false);
            }
            this.editingLayer = '';
            if (!this.editModeSvgLayerNode) {
                this.markups = [];
            }else{
                this.markups = this.editModeSvgLayerNode.markups.slice();
            }
            this.activeLayer = '';
        }

        this.input.enterEditMode();
        this.activateTool(true);
        this.styles = {}; // Clear EditMode styles.
        this.defaultStyle = null;
        this.duringEditMode = true;
        this.changeEditMode(new namespace.EditModeArrow(this));
        this.actionManager.clear();
        this.dispatchEvent({ type:namespace.EVENT_EDITMODE_ENTER });
        this.allowNavigation(false);
        return true;
    };

    /**
     * Exits Edit mode.
     *
     * See also [enterEditMode()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore/#enterEditMode}.
     *
     * @returns {boolean} Returns true if Edit mode has been deactivated
     */
    MarkupsCore.prototype.leaveEditMode = function() {

        var NOT_IN_EDIT_MODE = true;
        var WE_ARE_STILL_IN_EDIT_MODE = false;

        if (!this.duringEditMode || !this.duringViewMode) {
            return NOT_IN_EDIT_MODE;
        }

        var viewer = this.viewer;
        if (!viewer) {
            return WE_ARE_STILL_IN_EDIT_MODE; // something is very wrong...
        }

        this.editMode.destroy();
        this.editMode = null;
        this.duringEditMode = false;

        if (this.snapper) {
            this.snapper.indicator.clearOverlays();
            this.snapper.clearSnapped();
        }

        // Remove the edit layer
        if (this.editModeSvgLayerNode && this.editModeSvgLayerNode.svg.parentNode){
            this.svg.removeChild(this.editModeSvgLayerNode.svg);
        }
        this.svg.setAttribute('cursor', 'default');

        this.input.leaveEditMode();
        this.editFrame.setMarkup(null);
        this.activateTool(true);

        this.allowNavigation(true);
        this.dispatchEvent({ type:namespace.EVENT_EDITMODE_LEAVE });
        return NOT_IN_EDIT_MODE;
    };

    /**
     * Toggle between visible markups, i.e., show() and hidden markups, i.e., hide().
     */
    MarkupsCore.prototype.toggle = function() {

        if (this.duringViewMode) {
            this.hide();
        } else {
            this.show();
        }
    };

    /**
     * Enables loading of previously saved markups.
     * Exit Edit mode by calling [hide()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore/#hide}.
     *
     * See also
     * [enterEditMode()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore/#enterEditMode}.
     * @returns {boolean} Whether it successfully entered view mode or not.
     */
    MarkupsCore.prototype.show = function() {

        var viewer = this.viewer;
        if (!viewer || !viewer.model || !this.svg) {
            return false;
        }

        // Return if already showing or in edit-mode.
        // Notice that edit mode requires that we are currently show()-ing.
        if (this.duringViewMode || this.duringEditMode) {
            return true;
        }

        viewer.addEventListener(Autodesk.Viewing.CAMERA_CHANGE_EVENT, this.onCameraChangeBinded);
        viewer.addEventListener(Autodesk.Viewing.VIEWER_RESIZE_EVENT, this.onViewerResizeBinded);

        // Add parent svg of all markups.
        viewer.container.appendChild(this.svg);

        this.input.enterViewMode();
        namespaceUtils.hideLmvUi(viewer);

        // TODO: Nasty hack, currently there is no API to disable mouse highlighting in 3d models.
        // TODO: We nuke rollover function in viewer, for now, public api will be added soon.
        this.onViewerRolloverObject = viewer.impl.rolloverObject;
        viewer.impl.rolloverObject = function(){};

        this.activateTool(true);
        var camera = viewer.impl.camera;
        this.onViewerResize({ width: camera.clientWidth, height: camera.clientHeight });

        // See function loadMarkups() for when the actual SVG gets added onstage //
        this.svgLayersMap = {};
        this.duringViewMode = true;
        this.allowNavigation(true);
        return true;
    };

    /**
     * Removes any markup currently overlaid on the viewer. It exits Edit mode if it is active.
     *
     * See also
     * [show()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore/#show}
     * @returns {boolean} Whether it successfully left view mode or not.
     */
    MarkupsCore.prototype.hide = function() {

        var RESULT_HIDE_OK = true;
        var RESULT_HIDE_FAIL = false;

        var viewer = this.viewer;
        if (!viewer || !this.duringViewMode) {
            return RESULT_HIDE_OK;
        }

        if (this.duringEditMode) {
            if (!this.leaveEditMode()) {
                return RESULT_HIDE_FAIL;
            }
        }

        viewer.removeEventListener(Autodesk.Viewing.CAMERA_CHANGE_EVENT, this.onCameraChangeBinded);
        viewer.removeEventListener(Autodesk.Viewing.VIEWER_RESIZE_EVENT, this.onViewerResizeBinded);

        var svg = this.svg;
        svg.parentNode && svg.parentNode.removeChild(svg);

        // Remove all Markups and metadata (if any)
        this.unloadMarkupsAllLayers();
        namespaceUtils.removeAllMetadata(svg);

        this.input.leaveViewMode();
        namespaceUtils.restoreLmvUi(viewer);
        this.viewer.impl.rolloverObject = this.onViewerRolloverObject;

        this.activateTool(false);
        this.duringViewMode = false;
        return RESULT_HIDE_OK;
    };

    /**
     * Removes newly created markups in the current editing layer.
     * Markups that were created in a specific layer will not be removed.
     *
     * Markups should have been added while in
     * [Edit mode]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore/#enterEditMode}.
     */
    MarkupsCore.prototype.clear = function() {
        // Can only clear specific layers when in the edit mode of that layer.
        if (!this.duringEditMode) {
            console.warn("Clear only removes markups when in Edit Mode.");
            return;
        }
        var editModeLayer = this.editingLayer ? this.svgLayersMap[this.editingLayer] : this.editModeSvgLayerNode;
        if (editModeLayer) {
            var markups = editModeLayer.markups;
            var svg = editModeLayer.svg;
            if (svg && svg.childNodes.length > 0) {
                while (svg.childNodes.length) {
                    svg.removeChild(svg.childNodes[0]);
                }
            }
            while (markups.length > 0) {
                var markup = markups[0];
                this.removeMarkup(markup);
                markup.destroy();
            }
        }
    };

    /**
     * Returns an SVG string with the markups created so far.
     * The SVG string can be reloaded using
     * [loadMarkups]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore/#loadMarkups}.
     *
     * Markups should have been added while in
     * [Edit mode]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore/#enterEditMode}.
     * @returns {string} Returns an SVG element with all of the created markups in a string format.
     */
    MarkupsCore.prototype.generateData = function() {

        var defaultLayer = this.editModeSvgLayerNode.svg;

        if (this.editMode) {
            this.editMode.onSave();
        }

        // Sanity check, remove any lingering metadata nodes
        namespaceUtils.removeAllMetadata(this.svg);

        if (this.activeLayer){
            defaultLayer = this.svgLayersMap[this.activeLayer].svg;
        }

        var tmpNode = namespaceUtils.createSvgElement("svg");
        namespaceUtils.transferChildNodes(this.svg, tmpNode); // Transfer includes this.editModeSvgLayerNode
        namespaceUtils.transferChildNodes(defaultLayer, this.svg);

        // version 1: first implementation.
        // version 2: added global offset to markup positions.
        // version 3: change node structure to include hitareas, hit areas are not exported.
        // version 4: scale perspective markups space by PERSPECTIVE_MODE_SCALE because bug in firefox. LMV-1150
        var metadataObject = {
            "data-model-version": "4"
        };
        var metadataNode = namespaceUtils.addSvgMetadata(this.svg, metadataObject);
        var metadataNodes = [ metadataNode ];

        // Notify each markup to inject metadata
        this.markups.forEach(function(markup){
            var addedNode = markup.setMetadata();
            if (addedNode) {
                metadataNodes.push(addedNode);
            }
        });

        // Generate the data!
        var data = namespaceUtils.svgNodeToString(this.svg);

        // Remove metadataObject before returning
        metadataNodes.forEach(function(metadataNode){
            metadataNode.parentNode.removeChild(metadataNode);
        });

        namespaceUtils.transferChildNodes(this.svg, defaultLayer);
        namespaceUtils.transferChildNodes(tmpNode, this.svg);
        tmpNode = null; // get rid of it.

        return  data;
    };

    /**
     * @private
     */
    MarkupsCore.prototype.generatePoints3d = function() {

        var result = {markups: [], main: null};
        var markups = this.markups;
        var markupsCount = markups.length;

        if (markupsCount === 0) {
            return result;
        }

        // Gather a 3d point for markup.
        var idTarget = this.viewer.impl.renderer().readbackTargetId();
        for(var i = 0; i < markupsCount; ++i) {

            var markup = markups[i];
            var point = markup.generatePoint3d(idTarget) || null;
            result.markups.push(
                {
                    id: markup.id,
                    type: markup.type,
                    point: point || null
                });
        }


        // If there is 3d point associated with an arrow, we use that as main point.
        if (markupsCount === 1) {

            var main = result.markups[0].point;
            result.main = main && main.clone();
            return result;
        }

        for(var i = 0; i < markupsCount; ++i) {

            var collision = result.markups[i];
            if (collision.type === namespace.MARKUP_TYPE_ARROW && collision.point !== null) {

                result.main = collision.point.clone();
                return result;
            }
        }

        // If there is no arrows, we average bounding boxes and get a 3d point inside it.
        var bbX0 = Number.POSITIVE_INFINITY;
        var bbY0 = Number.POSITIVE_INFINITY;
        var bbX1 = Number.NEGATIVE_INFINITY;
        var bbY1 = Number.NEGATIVE_INFINITY;

        for(var i = 0; i < markupsCount; ++i) {

            var boundingBox = markups[i].generateBoundingBox();

            bbX0 = Math.min(bbX0, boundingBox.min.x);
            bbY0 = Math.min(bbY0, boundingBox.min.y);
            bbX1 = Math.max(bbX1, boundingBox.max.x);
            bbY1 = Math.max(bbY1, boundingBox.max.y);
        }

        var polygon = {};

        polygon.vertexCount = 4;
        polygon.xVertices = new Float32Array([bbX0, bbX1, bbX1, bbX0]);
        polygon.yVertices = new Float32Array([bbY0, bbY0, bbY1, bbY1]);

        var point2d = namespaceUtils.checkPolygon(polygon, idTarget);
        var point3d = point2d && this.viewer.clientToWorld(point2d.x, point2d.y);
        result.main = point3d && point3d.point;

        return result;
    };

    /**
     * Renders the markups onto a 2D canvas context to generate an image.
     * @param {CanvasRenderingContext2D} context - Markups are drawn using the context provided
     */
    MarkupsCore.prototype.renderToCanvas = function(context, callback) {

        var width = this.bounds.width;
        var height = this.bounds.height;
        var viewBox = this.getSvgViewBox(width, height);
        var numberOfScreenshotsTaken = 0;

        var onMarkupScreenshotTaken = function () {
            if (callback && (++numberOfScreenshotsTaken === this.markups.length)) {
                callback();
            }
        }.bind(this);

        var layer = this.svgLayersMap[this.activeLayer] || this.editModeSvgLayerNode;
        var markups = layer.markups;
        markups.forEach(function(markup) {
            markup.renderToCanvas(context, viewBox, width, height, onMarkupScreenshotTaken);
        });
    };

    /**
     * Changes the active drawing tool. For example, from the Arrow drawing tool to the Rectangle drawing tool.
     * Only applicable while in [Edit mode]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore/#enterEditMode}.
     *
     * Supported values are:
     * - `new Autodesk.Viewing.Extensions.Markups.Core.EditModeArrow(MarkupsCoreInstance)`
     * - `new Autodesk.Viewing.Extensions.Markups.Core.EditModeRectangle(MarkupsCoreInstance)`
     * - `new Autodesk.Viewing.Extensions.Markups.Core.EditModeCircle(MarkupsCoreInstance)`
     * - `new Autodesk.Viewing.Extensions.Markups.Core.EditModeCloud(MarkupsCoreInstance)`
     * - `new Autodesk.Viewing.Extensions.Markups.Core.EditModeText(MarkupsCoreInstance)`
     * - `new Autodesk.Viewing.Extensions.Markups.Core.EditModeFreehand(MarkupsCoreInstance)`
     * - `new Autodesk.Viewing.Extensions.Markups.Core.EditModePolyline(MarkupsCoreInstance)`
     * - `new Autodesk.Viewing.Extensions.Markups.Core.EditModePolycloud(MarkupsCoreInstance)`
     *
     * This function fires event `Autodesk.Viewing.Extensions.Markups.Core.EVENT_EDITMODE_CHANGED`.
     * @param {Object} editMode - Object instance for the drawing tool
     */
    MarkupsCore.prototype.changeEditMode = function(editMode) {

        var oldEditMode = this.editMode;
        oldEditMode && oldEditMode.destroy();

        editMode.addEventListener(namespace.EVENT_EDITMODE_CREATION_BEGIN, function() {this.disableMarkupInteractions(true);}.bind(this));
        editMode.addEventListener(namespace.EVENT_EDITMODE_CREATION_END, function(){this.disableMarkupInteractions(false);}.bind(this));
        editMode.addEventListener(namespace.EVENT_MARKUP_DESELECT, function(event){this.dispatchEvent(event);}.bind(this));

        this.editMode = editMode;
        this.styles[editMode.type] = namespaceUtils.cloneStyle(editMode.getStyle());

        this.dispatchEvent({type:namespace.EVENT_EDITMODE_CHANGED, target: editMode});
    };

    /**
     * Check whether a user can perform camera navigation operations on the current loaded model.
     * While the extension is active, the user can still draw markups.
     * Panning and zooming are only supported for orthographic cameras.
     *
     * @return {boolean} Whether [allowNavigation()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore/#allowNavigation} can succeed.
     */
    MarkupsCore.prototype.isNavigationAllowed = function() {

        return !this.viewer.impl.camera.isPerspective;
    };

    /**
     * Enables click, tap, and swipe behavior to allow camera zoom and panning operations. It is only available in
     * [Edit mode]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore/#enterEditMode}.
     *
     * @param {boolean} allow - Whether camera navigation interactions are active or not.
     */
    MarkupsCore.prototype.allowNavigation = function(allow) {

        //we will still need to update the markup styles even if in perspective mode
        var editMode = this.editMode;
        this.navigating = allow;

        if (allow){
            this.svg.setAttribute("pointer-events", "none");
            editMode && this.selectMarkup(null);
        } else {
            this.svg.setAttribute("pointer-events", "painted");
        }

        // Update pointer events for all markups.
        var markups = this.markups;
        var markupsCount = markups.length;

        for(var i = 0; i < markupsCount; ++i) {
            markups[i].updateStyle();
        }
        editMode && editMode.notifyAllowNavigation(allow);

        // Navigation is not allowed while in perspective mode.
        if (allow && (this.duringEditMode || this.duringViewMode) && !this.isNavigationAllowed()) {
            return false;
        }

        // Clear snapper.
        if (allow && this.snapper) {
            this.snapper.indicator.clearOverlays();
            this.snapper.clearSnapped();
        }

        this.markupTool.allowNavigation(allow);

    };

    /**
     * Sets mouse interactions and mobile device gestures with markups. Only applicable in
     * [Edit mode]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore/#enterEditMode}.
     * @param {boolean} disable - true to disable interactions with markups; false to enable interactions with markups; default false.
     */
    MarkupsCore.prototype.disableMarkupInteractions = function(disable) {

        this.markups.forEach(function(markup) {markup.disableInteractions(disable);});
    };

    /**
     *
     * @param isActive
     * @private
     */
    Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore.prototype.activateTool = function(isActive) {
        if (isActive) {
            if (!this.cachedNavigationTool) {
                this.cachedNavigationTool = this.viewer.getActiveNavigationTool();
                this.viewer.addEventListener(Autodesk.Viewing.TOOL_CHANGE_EVENT, this.onToolChangeBinded);
            }
            this.viewer.setActiveNavigationTool(this.markupTool.getName());
        } else {

            if (this.cachedNavigationTool) {
                this.viewer.setActiveNavigationTool(this.cachedNavigationTool);
                this.cachedNavigationTool = null;
            } else {
                var defaultToolName = this.viewer.getDefaultNavigationToolName();
                this.viewer.setActiveNavigationTool(defaultToolName);
            }

            this.viewer.removeEventListener(Autodesk.Viewing.TOOL_CHANGE_EVENT, this.onToolChangeBinded);
        }
    };

    /**
     *
     * @param event
     * @private
     */
    Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore.prototype.onToolChange = function(event) {

        if (event.toolName !== this.markupTool.getName())
            return;

        if (event.active) {
            var navAllowed = this.isNavigationAllowed();
            this.viewer.setNavigationLockSettings({
                pan      : navAllowed,
                zoom     : navAllowed,
                orbit    : false,
                roll     : false,
                fov      : false,
                walk     : false,
                gotoview : false
            });
        }
        this.viewer.setNavigationLock(event.active);
    };

    //// Input /////////////////////////////////////////////////////////////////////////////////////////////////////////

    proto.changeInputHandler = function(inputHandler) {

        this.input.detachFrom(this);
        inputHandler.attachTo(this);
        this.input = inputHandler;

        if (this.duringEditMode) {
            inputHandler.enterEditMode();
        }

        if (this.duringViewMode) {
            inputHandler.enterViewMode();
        }
    };

    //// Copy and Paste System /////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Standard copy operation. Applies to any selected markup.<br>
     * See also
     * [cut()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore/#cut} and
     * [paste()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore/#paste}.
     */
    MarkupsCore.prototype.copy = function() {

        this.clipboard.copy();
    };

    /**
     * Standard cut operation. Applies to any selected markup, which gets removed from the screen at call time.<br>
     * See also
     * [copy()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore/#copy} and
     * [paste()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore/#paste}.
     */
    MarkupsCore.prototype.cut = function() {

        this.clipboard.cut();
    };

    /**
     * Standard paste operation. This function will paste any previously copied or cut markup.
     * Can be called repeatedly after a single copy or cut operation.<br>
     * See also
     * [copy()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore/#copy} and
     * [cut()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore/#cut}.
     */
    MarkupsCore.prototype.paste = function() {

        this.clipboard.paste();
    };

    //// Undo and Redo System //////////////////////////////////////////////////////////////////////////////////////////
    /**
     * Will undo the previous operation.<br>
     * The Undo/Redo stacks will track any change done to the existing markups.<br>
     * See also
     * [redo()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore/#redo} and
     * [isUndoStackEmpty()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore/#isUndoStackEmpty}.
     */
    MarkupsCore.prototype.undo = function() {

        this.actionManager.undo();
    };

    /**
     * Will redo any previously undo operation.<br>
     * See also
     * [undo()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore/#undo},
     * [isRedoStackEmpty()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore/#isRedoStackEmpty}.
     */
    MarkupsCore.prototype.redo = function() {

        this.actionManager.redo();
    };

    /**
     * Returns true when [undo()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore/#undo}
     * produces no changes.
     * @return {boolean} true if there are no changes to undo; false if there are changes to undo.
     */
    MarkupsCore.prototype.isUndoStackEmpty = function() {

        return this.actionManager.isUndoStackEmpty();
    };

    /**
     * Returns true when [redo()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore/#redo}
     * produces no changes.
     * @return {boolean} true if there are no changes to redo; false if there are changes to redo.
     */
    MarkupsCore.prototype.isRedoStackEmpty = function() {

        return this.actionManager.isRedoStackEmpty();
    };

    proto.beginActionGroup = function() {

        this.actionManager.beginActionGroup();
    };

    proto.closeActionGroup = function() {

        this.actionManager.closeActionGroup();
    };

    proto.cancelActionGroup = function() {

        this.actionManager.cancelActionGroup();
    };

    /**
     * Helper function for generating unique markup ids.
     * @returns {number}
     */
    proto.getId = function() {

        return ++this.nextId;
    };

    /**
     * @param event
     * @private
     */
    proto.onEditActionHistoryChanged = function(event) {

        var data = event.data;
        var editMode = this.editMode;

        var keepSelection = editMode && editMode.selectedMarkup && editMode.selectedMarkup.id === data.targetId;

        if((data.action !== 'undo' && data.targetId !== -1) ||
            data.action === 'undo' && keepSelection) {

            // Markup can be null when deleting, that's ok, we unselect in that case.
            var markup = this.getMarkup(data.targetId);
            this.selectMarkup(markup);
        }

        this.dispatchEvent(event);
    };

    /**
     * Returns a markup with the specified ID. Returns null when not found.
     * The ID can be retrieved from the return value of getSelection(). <br>
     * See also
     * [getSelection()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore/#getSelection}.
     * @param {string} id Markup identifier.
     * @returns {Autodesk.Viewing.Extensions.Markups.Core.Markup} Returns markup object.
     */
    MarkupsCore.prototype.getMarkup = function(id) {

        var markups = this.markups;
        var markupsCount = markups.length;

        for(var i = 0; i < markupsCount; ++i) {
            if (markups[i].id == id) {
                return markups[i];
            }
        }

        return null;
    };


    /**
     * Selects or deselects a markup. A selected markup gets an overlayed UI that allows you to perform transformations
     * such as resizing, rotations, and translations. To deselect a markup, send a null value. <br>
     * See also
     * [getMarkup()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore/#getMarkup}.
     * @param {Autodesk.Viewing.Extensions.Markups.Core.Markup|null} markup The markup instance to select. Set the value to null to deselect a markup.
     */
    MarkupsCore.prototype.selectMarkup = function(markup) {

        if (markup) {

            if (this.editMode.type === markup.type) {
                this.editMode.setSelection(markup);
            } else {

                var editMode = markup.getEditMode();
                editMode.setSelection(null);

                this.changeEditMode(editMode);
                this.setStyle(markup.getStyle());
                this.editMode.setSelection(markup);
            }
        } else {
            // fix for text markup in view mode
            if (this.editMode){
                this.editMode.setSelection(null);
            }
        }
    };

    /**
     * Returns the currently selected markup. A selected markup has a custom UI overlayed that allows you to perform
     * resizing, rotations and translations.<br>
     * See also
     * [selectMarkup()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore/#selectMarkup}.
     * @returns {Autodesk.Viewing.Extensions.Markups.Core.Markup|null} Returns selected markup object; null if no markup is selected.
     */
    MarkupsCore.prototype.getSelection = function() {

        return this.editMode.getSelection();
    };

    /**
     * Deletes a markup from the canvas. Only applies while in
     * [Edit mode]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore/#enterEditMode}.
     * @param {Autodesk.Viewing.Extensions.Markups.Core.Markup} markup - Markup object.
     * @param {boolean} [dontAddToHistory] Whether delete action can be [undone]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore/#undo}.
     */
    MarkupsCore.prototype.deleteMarkup = function(markup, dontAddToHistory) {

        if (!this.editMode || (this.editMode && this.editMode.selectedMarkup.id !== markup.id)) {
            this.editMode = markup.getEditMode();
        }
        this.editMode.deleteMarkup(markup, dontAddToHistory);
    };

    proto.addMarkup = function(markup) {

        var markups;
        var layer = this.activeLayer;
        var layerObject = this.svgLayersMap[layer] || '';

        if (layerObject) {
            var svgParent = layerObject.svg;
            // append markup svg to layer svg
            markup.setParent(svgParent);
            // Add markup to layer markups if it does not exist
            layerObject.markups.push(markup);
            markups = layerObject.markups.slice();
        } else {
            // if layer is undefined create a edit mode svg layer
            markup.setParent(this.editModeSvgLayerNode.svg);
            this.editModeSvgLayerNode.markups.push(markup);
            markups = this.editModeSvgLayerNode.markups.slice();
        }
        
        markup.addEventListener(namespace.EVENT_MARKUP_SELECTED, this.onMarkupSelectedBinded);
        markup.addEventListener(namespace.EVENT_MARKUP_ENTER_EDITION, this.onMarkupEnterEditionBinded);
        markup.addEventListener(namespace.EVENT_MARKUP_CANCEL_EDITION, this.onMarkupCancelEditionBinded);
        markup.addEventListener(namespace.EVENT_MARKUP_DELETE_EDITION, this.onMarkupDeleteEditionBinded);
        // Only set the global markups array when in edit mode
        if (this.duringEditMode) {
            this.markups = markups;
        }
    };

    /**
     *
     * @param markup
     * @private
     */
    proto.removeMarkup = function(markup) {

        if (!markup){
            return false;
        }
        var self = this;

        /**
         * Get the layer markups in which the markup exists.
         * This function will remove the markup if it exists in the corresponding layer markups array.
         * @param markup
         * @returns {number} returns -1 if the markup does not exist in a layer markups array
         */
        function removeMarkupIfExists(markup){
            var markupIndex;
            var layerMarkups = -1;
            // check if the markup exists in the edit layer
            if (self.editModeSvgLayerNode){
                var editLayerMarkups = self.editModeSvgLayerNode.markups;
                markupIndex = editLayerMarkups.indexOf(markup);
                if (markupIndex !== -1) {
                    // remove the markup from the corresponding markup array
                    editLayerMarkups.splice(markupIndex, 1);
                    layerMarkups = editLayerMarkups.slice();
                    // update the global markups array if the markup is in the active layer
                    if (self.activeLayer === ''){
                        self.markups = layerMarkups;
                    }
                    return layerMarkups;
                }
            }
            // check if the markup exists in a layer
            if (self.svgLayersMap) {
                for (var layer in self.svgLayersMap) {
                    var markups = self.svgLayersMap[layer].markups;
                    markupIndex = markups.indexOf(markup);
                    if (markupIndex !== -1) {
                        // remove the markup from the corresponding markup array
                        markups.splice(markupIndex, 1);
                        layerMarkups = markups.slice();
                        // update the global markups array if the markup is in the active layer
                        if (self.activeLayer === layer){
                            self.markups = layerMarkups;
                        }
                        return layerMarkups;
                    }
                }
            }
            return layerMarkups;
        }

        var layerMarkups = removeMarkupIfExists(markup);
        if (layerMarkups === -1)
            return false;

        markup.setParent(null);

        markup.removeEventListener(namespace.EVENT_MARKUP_SELECTED, this.onMarkupSelectedBinded);
        markup.removeEventListener(namespace.EVENT_MARKUP_ENTER_EDITION, this.onMarkupEnterEditionBinded);
        markup.removeEventListener(namespace.EVENT_MARKUP_CANCEL_EDITION, this.onMarkupCancelEditionBinded);
        markup.removeEventListener(namespace.EVENT_MARKUP_DELETE_EDITION, this.onMarkupDeleteEditionBinded);

        var editMode = this.editMode;
        if (editMode) {
            var selectedMarkup = editMode.getSelection();
            if (selectedMarkup === markup) {
                this.selectMarkup(null);
            }
        }
    };

    //// Markups style /////////////////////////////////////////////////////////////////////////////////////////////////

    MarkupsCore.prototype.setStyle = function(style) {

        var styles = this.styles;
        var editMode = this.editMode;

        namespaceUtils.copyStyle(style, styles[editMode.type]);
        // namespaceUtils.copyStyle(styles[editMode.type], style);
        editMode.setStyle(styles[editMode.type]);
    };

    MarkupsCore.prototype.getStyle = function() {

        return namespaceUtils.cloneStyle(this.styles[this.editMode.type]);
    };

    MarkupsCore.prototype.getDefaultStyle = function() {

        var defaultStyleAttributes = [
            'stroke-width',
            'font-size',
            'font-family',
            'font-style',
            'font-weight',
            'stroke-color',
            'stroke-opacity',
            'fill-color',
            'fill-opacity'];
        this.defaultStyle = this.defaultStyle || namespaceUtils.createStyle(defaultStyleAttributes, this);

        return this.defaultStyle;
    };

    //// Markups depth order ///////////////////////////////////////////////////////////////////////////////////////////

    /**
     *
     * @param markup
     */
    proto.bringToFront = function(markup) {

        this.sendMarkupTo(markup, this.markups.length-1);
    };

    /**
     *
     * @param markup
     */
    proto.sendToBack = function(markup) {

        this.sendMarkupTo(markup, 0);
    };

    /**
     *
     * @param markup
     */
    proto.bringForward = function(markup) {

        var markupIndex = this.markups.indexOf(markup);
        this.sendMarkupTo(markup, markupIndex+1);
    };

    /**
     *
     * @param markup
     */
    proto.bringBackward = function(markup) {

        var markupIndex = this.markups.indexOf(markup);
        this.sendMarkupTo(markup, markupIndex-1);
    };

    /**
     *
     * @param markup
     * @param index
     * @private
     */
    proto.sendMarkupTo = function(markup, index) {

        var markups = this.markups;
        var markupIndex = markups.indexOf(markup);

        if (markupIndex === -1 || index < 0 || index >= markups.length) {
            return;
        }

        markups.splice(markupIndex, 1);
        index = markupIndex > index ? index -1 : index;
        markups.splice(index, 0, markup);

        // TODO: Add markup in right position not always at the end.
        markup.setParent(null);
        if (this.activeLayer){
            var parent = this.svgLayersMap[this.activeLayer].svg;
            markup.setParent(parent);
        }else {
            markup.setParent(this.editModeSvgLayerNode.svg);
        }
    };


    /**
     * Loads data (SVG string) for all markups in a specified layer (layerId) to the Viewer's canvas.<br>
     *
     * See also
     * [unloadMarkups()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore/#unloadMarkups}, and
     * [hideMarkups()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore/#hideMarkups}.
     *
     * @param {string} markupString - SVG string with markups. See also [generateData()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore/#generateData}.
     * @param {string} layerId - Identifier for the layer where the markup should be loaded to. Example "Layer1".
     * @return {boolean} Whether the markup string was able to be loaded successfully
     */
    MarkupsCore.prototype.loadMarkups = function (markupString, layerId) {

        if(this.duringEditMode) {
            console.warn("Markups will not be loaded during the edit mode");
            return false;
        }

        if(!this.duringViewMode) {
            return false;
        }

        if (!layerId) {
            console.warn("loadMarkups failed; missing 2nd argument 'layerId'");
            return false;
        }

        // Can it be parsed into SVG?
        var parent = namespaceUtils.stringToSvgNode(markupString);
        if(!parent) {
            return false;
        }

        var metadata = parent.childNodes[0].childNodes[0];
        var version = parseFloat(metadata.getAttribute('data-model-version'));

        // If the supplied layerId exists in the svg layers map and there are children in the svg then return false.
        if (layerId in this.svgLayersMap && this.svg.children.length > 0) {
            console.warn("This layer is already loaded, will not load again.");
            return false;
        }
        this.activeLayer = layerId;
        var svgLayerNode = this.svgLayersMap[layerId];

        // if the layer exists, delete it
        if (svgLayerNode)
            delete this.svgLayersMap[layerId];

        // create an empty parent svg layer node for layerId
        // Child markups will get added to th parent svg layer node in the addMarkup function
        var newSvg = this.createLayerNode();

        svgLayerNode = {
            markups: [],
            svgString: markupString,
            svg: newSvg
        };
        this.svgLayersMap[layerId] = svgLayerNode;

        var children = parent.childNodes;
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            var markup = namespaceUtils.createMarkupFromSVG(child, this);
            // Disable markups if already in edit mode and the active layer is different
            if(markup && this.duringEditMode && this.editingLayer !== this.activeLayer) {
                markup.disableInteractions(true);
            }
        }

        var svgParentNode = this.svgLayersMap[this.activeLayer].svg;

        this.svg.appendChild(svgParentNode);
        // If already in an edit mode layer then reassign active layer to edit layer
        if(this.duringEditMode && this.editingLayer !== this.activeLayer) {
            this.activeLayer = this.editingLayer;
            if (this.editingLayer)
                this.markups = this.svgLayersMap[this.activeLayer].markups.slice();
        }
        return true;
    };

    /**
     * TODO: Probably this function needs to be moved to MarkupCoreUtils.js
     * Creates a new layer node
     * */

    proto.createLayerNode = function() {

        var newSvgLayerNode = namespaceUtils.createSvgElement('g');
        newSvgLayerNode.setAttribute('cursor', 'default');
        return newSvgLayerNode;
    };

    /**
     * Revert any changes made to the specific layer.
     *
     * See also
     * [loadMarkups()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore/#loadMarkups} and
     * [enterEditMode()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore/#enterEditMode}.
     *
     * @param {string} layerId - ID of the layer to revert any changes that were made to it.
     * @returns {boolean} Returns true if the layer was unloaded, false otherwise.
     */
    MarkupsCore.prototype.revertLayer = function(layerId){
        if (!layerId) {
            console.warn("revertLayer failed because no layerId was supplied.");
            return false;
        }
        var svgLayerNode = this.svgLayersMap[layerId];
        if (!svgLayerNode){
            console.warn("The supplied layer does not exist.");
            return false;
        }
        var inEditMode = this.duringEditMode;
        // Leave editMode to revert a layer
        if (inEditMode)
            this.leaveEditMode();

        // keep track of previous global markups.
        var currentMarkups = this.markups.slice();
        // Set the global markups to the markups in the current layer. These ones get removed in the unloadMarkups
        this.markups = svgLayerNode.markups;
        var layerSvg = svgLayerNode.svgString;
        this.unloadMarkups(layerId);
        this.loadMarkups(layerSvg, layerId);
        // Assign markups
        if (this.editingLayer){
            if(this.editingLayer !== layerId) {
                this.markups = currentMarkups;
                var layerObject = this.svgLayersMap[this.editingLayer];
                if (layerObject) {
                    layerObject.markups = currentMarkups;
                }
            }
        }else{
            if(this.editModeSvgLayerNode){
                this.editModeSvgLayerNode.markups = currentMarkups;
            }
        }

        if(this.editingLayer || this.editingLayer.length === 0){
            var svg = this.editingLayer.length === 0 ? this.editModeSvgLayerNode.svg : this.svgLayersMap[this.editingLayer].svg;
            if (svg.parentNode == this.svg) {
                this.svg.removeChild(svg);
                this.svg.appendChild(svg);
            }
        }
        return true;
    };

    /**
     * Removes markups from the DOM (Document Object Model). This is helpful for freeing up memory.<br>
     *
     * See also
     * [loadMarkups()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore/#loadMarkups},
     * [unloadMarkupsAllLayers()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore/#unloadMarkupsAllLayers},
     * [clear()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore/#clear},
     * [hide()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore/#hide}, and
     * [hideMarkups()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore/#hideMarkups}.
     *
     * @param {string} layerId - ID of the layer containing all markups to unload (from the DOM).
     * @return {boolean} Whether the operation succeeded or not.
     */
    MarkupsCore.prototype.unloadMarkups = function(layerId) {

        if (!layerId) {
            console.warn("unloadMarkups failed; No layerId provided.");
            return false;
        }

        var svgLayerNode = this.svgLayersMap[layerId];
        if (!svgLayerNode) {
            // TODO: Do we need to log anything here?
            console.warn('No such layer exists to unload.');
            return false;
        }

        var layerMarkups = svgLayerNode.markups.slice();
        var numMarkups = layerMarkups.length;
        for (var i = 0; i < numMarkups; i++) {
            var markup = layerMarkups[i];
            this.removeMarkup(markup);
            markup.destroy();
        }

        // Remove the markups in the layer from the svg canvas
        if (svgLayerNode.svg.parentNode === this.svg)
            this.svg.removeChild(svgLayerNode.svg);

        // Delete the layer from the layer map.
        delete this.svgLayersMap[layerId];
        // Reset the active layer if the supplied layer id is the same as the active layer
        if (this.activeLayer.toString() === layerId.toString()) {
            this.activeLayer = '';
        }
        // Leave edit mode and reset the editing layer if the supplied layer is the same as the current editing layer
        if (this.editingLayer && this.editingLayer.toString() === layerId.toString()){
            this.editingLayer = '';
            this.duringEditMode && this.leaveEditMode();
        }

        return true;
    };

    /**
     * Removes all markups loaded so far. Great for freeing up memory.
     *
     * See also
     * [loadMarkups()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore/#loadMarkups},
     * [unloadMarkups()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore/#unloadMarkups},
     * [clear()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore/#clear},
     * [hide()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore/#hide}, and
     * [hideMarkups()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore/#hideMarkups}.
     */
    MarkupsCore.prototype.unloadMarkupsAllLayers = function() {
        this.activeLayer = '';
        var self = this;

        //this is specific to the editModeSvgLayerNode, enterEditMode().
        var unloadSvgLayerNode = function(){
            if (self.editModeSvgLayerNode){
                var layerMarkups = self.editModeSvgLayerNode.markups.slice();
                var numMarkups = layerMarkups.length;
                for (var i = 0; i < numMarkups; i++) {
                    var markup = layerMarkups[i];
                    self.removeMarkup(markup);
                    markup.destroy();
                }
            }
        };

        // Unload the markups in the editModeSvgLayerNode
        unloadSvgLayerNode();
        var layerId;
        for (layerId in this.svgLayersMap){
            this.unloadMarkups(layerId);
        }
    };

    /**
     * Hides all markups in a specified layer. Note that hidden markups will not be unloaded.
     * Use the [showMarkups()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore/#showMarkups} method to make
     * them visible again; no additional parsing is required.
     *
     * See also
     * [showMarkups()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore/#showMarkups},
     * [unloadMarkups()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore/#unloadMarkups}, and
     * [loadMarkups()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore/#loadMarkups}.
     *
     * @param {string} layerId - ID of the layer containing all markups that should be hidden (in the DOM).
     * @return {boolean} Whether the operation succeeded or not.
     */
    MarkupsCore.prototype.hideMarkups = function(layerId) {

        if (!layerId) {
            console.warn("hideMarkups failed; No layerId provided.");
            return false;
        }

        var svgLayerNode = this.svgLayersMap[layerId];
        if (!svgLayerNode) {
            // TODO: Do we need to log anything here?
            return false;
        }
        var layerSvg = svgLayerNode.svg;

        // Return false if the layer svg is not present in the main svg
        if (layerSvg.parentNode != this.svg) {
            console.warn("Layer is already hidden.");
            return false;
        }
        // remove the layer svg from the main svg
        this.svg.removeChild(layerSvg);
        return true;
    };

    /**
     * Unhides a layer of hidden markups
     * ([hideMarkups()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore/#hideMarkups}).
     *
     * @param {string} layerId - ID of the layer containing all markups to unload (from the DOM).
     * @return {boolean} Whether the operation succeeded or not.
     */
    MarkupsCore.prototype.showMarkups = function(layerId) {

        if (!layerId) {
            console.warn("showMarkups failed; No layerId provided.");
            return false;
        }

        var svgLayerNode = this.svgLayersMap[layerId];
        if (!svgLayerNode) {
            // TODO: Do we need to log anything here?
            return false;
        }
        // Append the layer svg to the main svg
        var layerSvg = svgLayerNode.svg;
        this.svg.appendChild(layerSvg);
    };

    //// Client Space <-> Markup Space /////////////////////////////////////////////////////////////////////////////////

    proto.positionFromClientToMarkups = function(x, y) {

        return this.clientToMarkups(x, y);
    };

    proto.positionFromMarkupsToClient = function(x, y) {

        return this.markupsToClient(x, y);
    };

    proto.vectorFromClientToMarkups = function(x, y) {

        var a = this.clientToMarkups(0, 0);
        var b = this.clientToMarkups(x, y);

        return {x: b.x - a.x, y: b.y - a.y};
    };

    proto.vectorFromMarkupsToClient = function(x, y) {

        var a = this.markupsToClient(0, 0);
        var b = this.markupsToClient(x, y);

        return {x: b.x - a.x, y: b.y - a.y};
    };

    proto.sizeFromClientToMarkups = function(w, h) {

        var a = this.clientToMarkups(0, 0);
        var b = this.clientToMarkups(w, h);

        return {x: Math.abs(b.x - a.x), y: Math.abs(b.y - a.y)};
    };

    proto.sizeFromMarkupsToClient = function(w, h) {

        var a = this.markupsToClient(0, 0);
        var b = this.markupsToClient(w, h);

        return {x: Math.abs(b.x - a.x), y: Math.abs(b.y - a.y)};
    };

    proto.markupsToClient = function(x, y) {

        var camera = this.viewer.impl.camera;
        var point = new THREE.Vector3(x, y, 0);

        if (camera.isPerspective) {

            var bb = this.viewer.impl.canvas.getBoundingClientRect();

            point.x =( point.x / PERSPECTIVE_MODE_SCALE * (bb.height * 0.5) + bb.width  * 0.5);
            point.y =(-point.y / PERSPECTIVE_MODE_SCALE * (bb.height * 0.5) + bb.height * 0.5);
        } else {

            point.applyMatrix4(camera.matrixWorld);
            point.sub(camera.position);

            // In LMV model is offset by a global offset, we correct this offset when transforming to markups space, so
            // exported markups don't have the offset.
            var globalOffset = this.viewer.model.getData().globalOffset;
            if (globalOffset) {
                point.sub(globalOffset);
            }

            point = namespaceUtils.worldToClient(point, this.viewer, false);
            point.z = 0;
        }

        return point;
    };

    proto.clientToMarkups = function(x, y) {

        var camera = this.viewer.impl.camera;
        var point = new THREE.Vector3(x, y, 0);

        if (camera.isPerspective) {

            var bb = this.viewer.impl.canvas.getBoundingClientRect();

            // Multiply by PERSPECTIVE_MODE_SCALE because Firfox on Windows machines have problems to deal with very small paths.
            point.x = (point.x - bb.width  * 0.5) / (bb.height * 0.5) * PERSPECTIVE_MODE_SCALE;
            point.y =-(point.y - bb.height * 0.5) / (bb.height * 0.5) * PERSPECTIVE_MODE_SCALE;
        } else {

            point = namespaceUtils.clientToWorld(point.x, point.y, 0, this.viewer);

            // In LMV model is offset by a global offset, we correct this offset when transforming to markups space, so
            // exported markups don't have the offset.
            var globalOffset = this.viewer.model.getData().globalOffset;
            if (globalOffset) {
                point.add(globalOffset);
            }

            point.add(camera.position);
            point.applyMatrix4(camera.matrixWorldInverse);
            point.z = 0;
        }

        return point;
    };

    proto.getSvgViewBox = function(clientWidth, clientHeight) {

        // Get pan offset.
        var lt = this.clientToMarkups(0, 0);
        var rb = this.clientToMarkups(clientWidth, clientHeight);

        var l = Math.min(lt.x, rb.x);
        var t = Math.min(lt.y, rb.y);
        var r = Math.max(lt.x, rb.x);
        var b = Math.max(lt.y, rb.y);

        return [l , t, r-l, b-t].join(' ');
    };

    proto.getBounds = function () {

        return this.bounds;
    };

    proto.getMousePosition = function() {

        // When snapping, use the snap position instead of the mouse position
        // as the start point of the markup drawing.
        // For now only works for 2D.
        if (this.viewer.model.is2d() && this.editMode.useWithSnapping() && this.snapper && this.snapper.isSnapped()) {
            return this.getSnapPosition();
        }
        return this.input.getMousePosition();
    };

    proto.getSnapPosition = function() {

        var geometryType = this.snapper.getGeometryType();
        var geometry = this.snapper.getGeometry();
        var point;

        if (geometryType === avem.SNAP_VERTEX || geometryType === avem.SNAP_MIDPOINT || geometryType === avem.SNAP_CIRCLE_CENTER) {
            point = geometry;
        }
        else { // geometryType === avem.SNAP_CIRCULARARC
            point = MeasureCommon.nearestPointInPointToEdge(geometry, this.snapper.getIntersectPoint());
        }
        var p = this.project(point);
        return {x: p.x, y: p.y};
    };

    proto.project = function(position) {
        var camera = this.viewer.navigation.getCamera();
        var containerBounds = this.viewer.navigation.getScreenViewport();

        var p = new THREE.Vector3().copy(position);
        p.project(camera);

        return new THREE.Vector3(Math.round((p.x + 1) / 2 * containerBounds.width),
            Math.round((-p.y + 1) / 2 * containerBounds.height), p.z);
    };

    //// Handled Events ////////////////////////////////////////////////////////////////////////////////////////////////

    proto.onCameraChange = function(event) {

        // Update annotations' parent transform.
        var viewBox = this.getSvgViewBox(this.bounds.width, this.bounds.height);

        // HACK, for some reason the 2nd frame returns an empty canvas.
        // The reason why this happens is that the code above calls into the viewer
        // and a division by zero occurs due to LMV canvas having zero width and height
        // When we detect this case, avoid setting the viewBox value and rely on one
        // previously set.
        if (viewBox === "NaN NaN NaN NaN") {
            return;
        }

        if (this.svg) {
            this.svg.setAttribute('viewBox', viewBox);
        }

        // Edit frame has to be updated, re-setting the selected markup does the job.
        var editMode = this.editMode;
        if (editMode && this.editFrame.isActive()) {
            var selectedMarkup = editMode.getSelection();
            this.editFrame.setMarkup(selectedMarkup);
        }
    };

    proto.onViewerResize = function(event) {

        this.bounds.x = 0;
        this.bounds.y = 0;
        this.bounds.width = event.width;
        this.bounds.height = event.height;

        if (this.svg) {
            this.svg.setAttribute('width', this.bounds.width);
            this.svg.setAttribute('height', this.bounds.height);
        }

        this.onCameraChange();
    };

    proto.callSnapperMouseDown = function() {
        // Only work for 2D
        if (this.viewer.model.is2d()){
            // Disable snapper in freehand mode
            if (this.editMode.useWithSnapping()){
                var mousePosition = this.input.getMousePosition();
                if (this.snapper) {
                    this.snapper.onMouseDown(mousePosition);
                    this.snapper.indicator.render();
                }
            }else{
                // Clear the snapper when selecting a markup that does not allow snapping.
                if (this.snapper){
                    this.snapper.clearSnapped();
                    this.snapper.indicator.clearOverlays();
                }
            }
        }
    };

    proto.callSnapperMouseMove = function() {
        // Only work for 2D
        // Disable snapper in freehand mode
        if (this.viewer.model.is2d() && this.editMode.useWithSnapping()) {
            var mousePosition = this.input.getMousePosition();
            if (this.snapper) {
                this.snapper.onMouseMove(mousePosition);
                this.snapper.indicator.render();
            }
        }
    };

    /**
     * Handler to mouse move events, used to create markups.
     * @private
     */
    proto.onMouseMove = function(event) {

        if (this.navigating) {
            return;
        }

        if (this.editFrame.isActive() && event.type === 'mousemove') {
            this.editFrame.onMouseMove(event);
        }

        this.callSnapperMouseMove();

        this.editMode && this.editMode.onMouseMove(event);
    };

    /**
     * Handler to mouse down events, used to start creation markups.
     * @private
     */
    var mouseDownTimeStamp = 0;
    var mouseDownType = '';
    proto.onMouseDown = function(event) {

        // We have mousedown and singletap events fired on mobile for the same user tap.
        // This fix only let pass one of those events.
        // TODO: Remove this code when using LMV event system instead of ours.
        var timeStamp = performance.now();
        if (timeStamp - mouseDownTimeStamp < 400 && mouseDownType !== event.type) {
            return;
        }
        mouseDownTimeStamp = timeStamp;
        mouseDownType = event.type;

        namespaceUtils.dismissLmvHudMessage();

        this.callSnapperMouseDown();

        var bounds = this.getBounds();
        var mousePosition = this.getMousePosition();

        if (mousePosition.x >= bounds.x && mousePosition.x <= bounds.x + bounds.width &&
            mousePosition.y >= bounds.y && mousePosition.y <= bounds.y + bounds.height) {
            this.editMode.onMouseDown(event);
        }

        // TODO: There is a better way to do this, implement when undo/redo group.
        if(!this.editMode.creating && event.target === this.svg) {
            this.selectMarkup(null);
        }
        this.ignoreNextMouseUp = false;
    };

    var mouseUpTimeStamp = 0;
    var mouseUpType = '';
    proto.onMouseUp = function(event) {

        // We have mousedown and singletap events fired on mobile for the same user tap.
        // This fix only let pass one of those events.
        // TODO: Remove this code when using LMV event system instead of ours.
        var timeStamp = performance.now();
        if (timeStamp - mouseUpTimeStamp < 400 && mouseUpType !== event.type) {
            return;
        }
        mouseUpTimeStamp = timeStamp;
        mouseUpType = event.type;

        if (this.navigating) {
            return;
        }

        if (this.editFrame.isActive()) {
            this.editFrame.onMouseUp(event);
            return;
        }

        if(!this.ignoreNextMouseUp) {
            this.editMode.onMouseUp(event);
        }
    };

    proto.onMouseDoubleClick = function(event) {

        if (this.navigating) {
            return;
        }

        if (this.editFrame.isActive()) {
            return;
        }

        this.editMode.onMouseDoubleClick(event);
    };

    proto.onUserCancel = function() {
        if (!this.editMode) {
            return;
        }
        else if (this.editMode.creating) {
            this.editMode.creationCancel();
        } else {
            this.editMode.unselect();
        }
    };

    /**
     *
     * @param event
     */
    proto.onMarkupSelected = function(event) {

        this.selectMarkup(event.markup);
        this.dispatchEvent(event);
    };

    proto.onMarkupEnterEdition = function(event) {

    };

    proto.onMarkupCancelEdition = function(event) {

        this.onUserCancel();
    };

    proto.onMarkupDeleteEdition = function(event) {

        this.removeMarkup(event.markup);
        this.editMode.deleteMarkup();
    };

    Autodesk.Viewing.theExtensionManager.registerExtension('Autodesk.Viewing.MarkupsCore', MarkupsCore);
})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;

    /**
     *
     * @param editor
     * @param id
     * @param markup
     * @param position
     * @constructor
     */
    function CloneMarkup(editor, id, markup, position) {

        namespace.EditAction.call(this, editor, 'CLONE-MARKUP', id);

        this.clone = markup.clone();
        this.clone.id = id;
        this.position = {x: position.x, y: position.y};
    }

    CloneMarkup.prototype = Object.create(namespace.EditAction.prototype);
    CloneMarkup.prototype.constructor = CloneMarkup;

    var proto = CloneMarkup.prototype;

    proto.redo = function() {

        var editor = this.editor;
        var clone = this.clone;
        var position = this.position;

        if (editor.getMarkup(this.targetId)) {
            return;
        }

        var markup = clone.clone();
        markup.setPosition(position.x, position.y);

        editor.addMarkup(markup);
    };

    proto.undo = function() {

        var markup = this.editor.getMarkup(this.targetId);
        markup && this.editor.removeMarkup(markup);
    };

    namespace.CloneMarkup = CloneMarkup;

})();
(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;
    var namespaceUtils = Autodesk.Viewing.Extensions.Markups.Core.Utils;

    /**
     * @constructor
     */
    function CreateArrow(editor, id, head, tail, style) {

        namespace.EditAction.call(this, editor, 'CREATE-ARROW', id);

        this.selectOnExecution = false;
        this.tail = tail;
        this.head = head;
        this.style = namespaceUtils.cloneStyle(style);
    }

    CreateArrow.prototype = Object.create(namespace.EditAction.prototype);
    CreateArrow.prototype.constructor = CreateArrow;

    var proto = CreateArrow.prototype;

    proto.redo = function() {

        var editor = this.editor;
        var arrow = new namespace.MarkupArrow(this.targetId, editor);

        editor.addMarkup(arrow);

        // Confusing naming here. in arrow.set the first two numbers are
        // the point you drag from and the second two are the point you
        // drag to. So the head point is actually where the tail of the
        // arrow is positioned and the tail point is the head is positioned.

        //TODO: In MarkupArrow "set" function has tail x, tail y, head x, head y but used here in the opposite way
        arrow.set(this.head.x, this.head.y, this.tail.x, this.tail.y);
        arrow.setStyle(this.style);
    };

    proto.undo = function() {

        var markup = this.editor.getMarkup(this.targetId);
        markup && this.editor.removeMarkup(markup);
    };

    namespace.CreateArrow = CreateArrow;

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;
    var namespaceUtils = Autodesk.Viewing.Extensions.Markups.Core.Utils;

    /**
     * Markup create circle action.
     *
     * Implements an [EditAction]{@link Autodesk.Viewing.Extensions.Markups.Core.EditAction}
     * for creating a Circle [Markup]{@link Autodesk.Viewing.Extensions.Markups.Core.Markup}.
     * Included in documentation as an example of how to create
     * a specific EditAction that deals with Markup creation.
     * Developers are encourage to look into this class's source code and copy
     * as much code as they need. Find link to source code below.
     *
     * @tutorial feature_markup
     * @constructor
     * @memberof Autodesk.Viewing.Extensions.Markups.Core
     * @extends Autodesk.Viewing.Extensions.Markups.Core.EditAction
     *
     * @param editor
     * @param id
     * @param position
     * @param size
     * @param rotation
     * @param style
     * @category Extensions
     */
    function CreateCircle(editor, id, position, size, rotation, style) {

        namespace.EditAction.call(this, editor, 'CREATE-CIRCLE', id);

        this.selectOnExecution = false;
        this.position = {x: position.x, y: position.y};
        this.size = {x: size.x, y: size.y};
        this.rotation = rotation;
        this.style = namespaceUtils.cloneStyle(style);
    }

    CreateCircle.prototype = Object.create(namespace.EditAction.prototype);
    CreateCircle.prototype.constructor = CreateCircle;

    var proto = CreateCircle.prototype;

    proto.redo = function() {

        var editor = this.editor;
        var circle = new namespace.MarkupCircle(this.targetId, editor);

        editor.addMarkup(circle);

        circle.setSize(this.position, this.size.x, this.size.y);
        circle.setRotation(this.rotation);
        circle.setStyle(this.style);
    };

    proto.undo = function() {

        var markup = this.editor.getMarkup(this.targetId);
        markup && this.editor.removeMarkup(markup);
    };

    namespace.CreateCircle = CreateCircle;

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;
    var namespaceUtils = Autodesk.Viewing.Extensions.Markups.Core.Utils;

    /**
     *
     * @param editor
     * @param id
     * @param position
     * @param size
     * @param rotation
     * @param style
     * @constructor
     */
    function CreateCloud(editor, id, position, size, rotation, style) {

        namespace.EditAction.call(this, editor, 'CREATE-CLOUD', id);

        this.selectOnExecution = false;
        this.position = {x: position.x, y: position.y};
        this.size = {x: size.x, y: size.y};
        this.rotation = rotation;
        this.style = namespaceUtils.cloneStyle(style);
    }

    CreateCloud.prototype = Object.create(namespace.EditAction.prototype);
    CreateCloud.prototype.constructor = CreateCloud;

    var proto = CreateCloud.prototype;

    proto.redo = function() {

        var editor = this.editor;
        var cloud = new namespace.MarkupCloud(this.targetId, editor);

        editor.addMarkup(cloud);

        cloud.set(this.position, this.size);
        cloud.setRotation(this.rotation);
        cloud.setStyle(this.style);
    };

    proto.undo = function() {

        var markup = this.editor.getMarkup(this.targetId);
        markup && this.editor.removeMarkup(markup);
    };

    namespace.CreateCloud = CreateCloud;

})();
(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;
    var namespaceUtils = Autodesk.Viewing.Extensions.Markups.Core.Utils;

    /**
     *
     * @param editor
     * @param id
     * @param position
     * @param size
     * @param rotation
     * @param locations
     * @param style
     * @constructor
     */
    function CreateFreehand(editor, id, position, size, rotation, locations, style) {

        namespace.EditAction.call(this, editor, 'CREATE-FREEHAND', id);

        this.selectOnExecution = false;
        this.position = position;
        this.size = size;
        this.rotation = rotation;
        this.movements = locations.concat();
        this.style = namespaceUtils.cloneStyle(style);
    }

    CreateFreehand.prototype = Object.create(namespace.EditAction.prototype);
    CreateFreehand.prototype.constructor = CreateFreehand;

    var proto = CreateFreehand.prototype;

    proto.redo = function() {

        var editor = this.editor;
        var freehand = new namespace.MarkupFreehand(this.targetId, editor);

        editor.addMarkup(freehand);

        freehand.set(this.position, this.size, this.movements);
        freehand.setRotation(this.rotation);
        freehand.setStyle(this.style);
    };

    proto.undo = function() {

        var markup = this.editor.getMarkup(this.targetId);
        markup && this.editor.removeMarkup(markup);
    };

    namespace.CreateFreehand = CreateFreehand;

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;
    var namespaceUtils = Autodesk.Viewing.Extensions.Markups.Core.Utils;

    /**
     *
     * @param editor
     * @param id
     * @param position
     * @param size
     * @param rotation
     * @param locations
     * @param style
     * @constructor
     */
    function CreateHighlight(editor, id, position, size, rotation, locations, style) {

        namespace.EditAction.call(this, editor, 'CREATE-HIGHLIGHT', id);

        this.selectOnExecution = false;
        this.position = position;
        this.size = size;
        this.rotation = rotation;
        this.movements = locations.concat();
        this.style = namespaceUtils.cloneStyle(style);
    }

    CreateHighlight.prototype = Object.create(namespace.EditAction.prototype);
    CreateHighlight.prototype.constructor = CreateHighlight;

    var proto = CreateHighlight.prototype;

    proto.redo = function() {

        var editor = this.editor;
        var highlight = new namespace.MarkupHighlight(this.targetId, editor);

        editor.addMarkup(highlight);

        highlight.set(this.position, this.size, this.movements);
        highlight.setRotation(this.rotation);
        highlight.setStyle(this.style);
    };

    proto.undo = function() {

        var markup = this.editor.getMarkup(this.targetId);
        markup && this.editor.removeMarkup(markup);
    };

    namespace.CreateHighlight = CreateHighlight;

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;
    var namespaceUtils = Autodesk.Viewing.Extensions.Markups.Core.Utils;

    /**
     *
     * @param editor
     * @param id
     * @param position
     * @param size
     * @param rotation
     * @param locations
     * @param closed
     * @param style
     * @constructor
     */
    function CreatePolycloud(editor, id, position, size, rotation, locations, style, closed) {

        namespace.EditAction.call(this, editor, 'CREATE-POLYCLOUD', id);

        this.selectOnExecution = false;
        this.position = position;
        this.size = size;
        this.rotation = rotation;
        this.movements = locations.concat();
        this.style = namespaceUtils.cloneStyle(style);
        this.closed = closed;
    }

    CreatePolycloud.prototype = Object.create(namespace.EditAction.prototype);
    CreatePolycloud.prototype.constructor = CreatePolycloud;

    var proto = CreatePolycloud.prototype;

    proto.redo = function() {

        var editor = this.editor;
        var polyline = new namespace.MarkupPolycloud(this.targetId, editor);

        editor.addMarkup(polyline);

        polyline.set(this.position, this.size, this.movements, this.closed);
        polyline.setRotation(this.rotation);
        polyline.setStyle(this.style);
    };

    proto.undo = function() {

        var markup = this.editor.getMarkup(this.targetId);
        markup && this.editor.removeMarkup(markup);
    };

    namespace.CreatePolycloud = CreatePolycloud;

})();
(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;
    var namespaceUtils = Autodesk.Viewing.Extensions.Markups.Core.Utils;

    /**
     *
     * @param editor
     * @param id
     * @param position
     * @param size
     * @param rotation
     * @param locations
     * @param closed
     * @param style
     * @constructor
     */
    function CreatePolyline(editor, id, position, size, rotation, locations, style, closed) {

        namespace.EditAction.call(this, editor, 'CREATE-POLYLINE', id);

        this.selectOnExecution = false;
        this.position = position;
        this.size = size;
        this.rotation = rotation;
        this.movements = locations.concat();
        this.closed = closed;
        this.style = namespaceUtils.cloneStyle(style);
    }

    CreatePolyline.prototype = Object.create(namespace.EditAction.prototype);
    CreatePolyline.prototype.constructor = CreatePolyline;

    var proto = CreatePolyline.prototype;

    proto.redo = function() {

        var editor = this.editor;
        var polyline = new namespace.MarkupPolyline(this.targetId, editor);

        editor.addMarkup(polyline);

        polyline.set(this.position, this.size, this.movements, this.closed);
        polyline.setRotation(this.rotation);
        polyline.setStyle(this.style);
    };

    proto.undo = function() {

        var markup = this.editor.getMarkup(this.targetId);
        markup && this.editor.removeMarkup(markup);
    };

    namespace.CreatePolyline = CreatePolyline;

})();
(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;
    var namespaceUtils = Autodesk.Viewing.Extensions.Markups.Core.Utils;

    /**
     *
     * @param editor
     * @param id
     * @param position
     * @param size
     * @param rotation
     * @param style
     * @constructor
     */
    function CreateRectangle(editor, id, position, size, rotation, style) {

        namespace.EditAction.call(this, editor, 'CREATE-RECTANGLE', id);

        this.selectOnExecution = false;
        this.position = {x: position.x, y: position.y};
        this.size = {x: size.x, y: size.y};
        this.rotation = rotation;
        this.style = namespaceUtils.cloneStyle(style);
    }

    CreateRectangle.prototype = Object.create(namespace.EditAction.prototype);
    CreateRectangle.prototype.constructor = CreateRectangle;

    var proto = CreateRectangle.prototype;

    proto.redo = function() {

        var editor = this.editor;
        var rectangle = new namespace.MarkupRectangle(this.targetId, editor);

        editor.addMarkup(rectangle);

        rectangle.set(this.position, this.size);
        rectangle.setRotation(this.rotation);
        rectangle.setStyle(this.style);
    };

    proto.undo = function() {

        var markup = this.editor.getMarkup(this.targetId);
        markup && this.editor.removeMarkup(markup);
    };

    namespace.CreateRectangle = CreateRectangle;

})();
(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;
    var namespaceUtils = Autodesk.Viewing.Extensions.Markups.Core.Utils;

    /**
     *
     * @param editor
     * @param id
     * @param position
     * @param size
     * @param text
     * @param style
     * @constructor
     */
    function CreateText(editor, id, position, size, text, style ) {

        namespace.EditAction.call(this, editor, 'CREATE-TEXT', id);

        this.text = text;
        this.position = {x: position.x, y: position.y};
        this.size = {x: size.x, y: size.y};
        this.style = namespaceUtils.cloneStyle(style);
    }

    CreateText.prototype = Object.create(namespace.EditAction.prototype);
    CreateText.prototype.constructor = CreateText;

    var proto = CreateText.prototype;

    proto.redo = function () {

        var editor = this.editor;
        var position = this.position;
        var size = this.size;

        var text = new namespace.MarkupText(this.targetId, editor, size);

        editor.addMarkup(text);

        text.setSize(position, size.x, size.y);
        text.setText(this.text);
        text.setStyle(this.style);
    };

    proto.undo = function () {

        var markup = this.editor.getMarkup(this.targetId);
        if (markup) {
            this.editor.removeMarkup(markup);
            markup.destroy();
        }
    };

    namespace.CreateText = CreateText;

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;

    /**
     *
     * @param editor
     * @param arrow
     * @constructor
     */
    function DeleteArrow(editor, arrow) {

        // Confusing naming here. Arrow.tail is the starting point of the arrow,
        // and arrow.head is the final point. In CreateArrow the head argument
        // is the first point of the arrow and the tail argument is the second
        // point of the argument. So construct CreateArrow with the tail before
        // the head. 
        namespace.EditAction.call(this, editor, 'DELETE-ARROW', arrow.id);
        this.createArrow = new namespace.CreateArrow(
            editor,
            arrow.id,
            arrow.tail,
            arrow.head,
            arrow.getStyle());
    }

    DeleteArrow.prototype = Object.create(namespace.EditAction.prototype);
    DeleteArrow.prototype.constructor = DeleteArrow;

    var proto = DeleteArrow.prototype;

    proto.redo = function() {

        this.createArrow.undo();
    };

    proto.undo = function() {

        this.createArrow.redo();
    };

    namespace.DeleteArrow = DeleteArrow;

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;

    /**
     * Markup delete circle action.
     * 
     * Implements an [EditAction]{@link Autodesk.Viewing.Extensions.Markups.Core.EditAction}
     * for deleting a Circle [Markup]{@link Autodesk.Viewing.Extensions.Markups.Core.Markup}.
     * Included in documentation as an example of how to create
     * a specific EditAction that deals with Markup deletion.
     * Developers are encourage to look into this class's source code and copy
     * as much code as they need. Find link to source code below.
     *
     * @tutorial feature_markup
     * @constructor
     * @memberof Autodesk.Viewing.Extensions.Markups.Core
     * @extends Autodesk.Viewing.Extensions.Markups.Core.EditAction
     *
     * @param editor
     * @param circle
     * @category Extensions
     */
    function DeleteCircle(editor, circle) {

        namespace.EditAction.call(this, editor, 'DELETE-CIRCLE', circle.id);
        this.createCircle = new namespace.CreateCircle(
            editor,
            circle.id,
            circle.position,
            circle.size,
            circle.rotation,
            circle.getStyle());
    }

    DeleteCircle.prototype = Object.create(namespace.EditAction.prototype);
    DeleteCircle.prototype.constructor = DeleteCircle;

    var proto = DeleteCircle.prototype;

    proto.redo = function() {

        this.createCircle.undo();
    };

    proto.undo = function() {

        this.createCircle.redo();
    };

    namespace.DeleteCircle = DeleteCircle;

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;

    /**
     *
     * @param editor
     * @param cloud
     * @constructor
     */
    function DeleteCloud(editor, cloud) {

        namespace.EditAction.call(this, editor, 'DELETE-CLOUD', cloud.id);
        this.createCloud = new namespace.CreateCloud(
            editor,
            cloud.id,
            cloud.position,
            cloud.size,
            cloud.rotation,
            cloud.getStyle());
    }

    DeleteCloud.prototype = Object.create(namespace.EditAction.prototype);
    DeleteCloud.prototype.constructor = DeleteCloud;

    var proto = DeleteCloud.prototype;

    proto.redo = function() {

        this.createCloud.undo();
    };

    proto.undo = function() {

        this.createCloud.redo();
    };

    namespace.DeleteCloud = DeleteCloud;

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;

    /**
     *
     * @param editor
     * @param freehand
     * @constructor
     */
    function DeleteFreehand(editor, freehand) {
        namespace.EditAction.call(this, editor, 'DELETE-FREEHAND', freehand.id);
        this.createFreehand = new namespace.CreateFreehand(
            editor,
            freehand.id,
            freehand.position,
            freehand.size,
            freehand.rotation,
            freehand.locations,
            freehand.getStyle());
    }

    DeleteFreehand.prototype = Object.create(namespace.EditAction.prototype);
    DeleteFreehand.prototype.constructor = DeleteFreehand;

    var proto = DeleteFreehand.prototype;

    proto.redo = function() {

        this.createFreehand.undo();
    };

    proto.undo = function() {

        this.createFreehand.redo();
    };

    namespace.DeleteFreehand = DeleteFreehand;

})();
(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;

    /**
     *
     * @param editor
     * @param highlight
     * @constructor
     */
    function DeleteHighlight(editor, highlight) {
        namespace.EditAction.call(this, editor, 'DELETE-HIGHLIGHT', highlight.id);
        this.createHighlight = new namespace.CreateHighlight(
            editor,
            highlight.id,
            highlight.position,
            highlight.size,
            highlight.rotation,
            highlight.locations,
            highlight.getStyle());
    }

    DeleteHighlight.prototype = Object.create(namespace.EditAction.prototype);
    DeleteHighlight.prototype.constructor = DeleteHighlight;

    var proto = DeleteHighlight.prototype;

    proto.redo = function() {

        this.createHighlight.undo();
    };

    proto.undo = function() {

        this.createHighlight.redo();
    };

    namespace.DeleteHighlight = DeleteHighlight;

})();
(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;

    /**
     *
     * @param editor
     * @param polycloud
     * @constructor
     */
    function DeletePolycloud(editor, polycloud) {

        namespace.EditAction.call(this, editor, 'DELETE-POLYCLOUD', polycloud.id);
        this.createPolycloud = new namespace.CreatePolycloud(
            editor,
            polycloud.id,
            polycloud.position,
            polycloud.size,
            polycloud.rotation,
            polycloud.locations,
            polycloud.getStyle(),
            polycloud.closed);
    }

    DeletePolycloud.prototype = Object.create(namespace.EditAction.prototype);
    DeletePolycloud.prototype.constructor = DeletePolycloud;

    var proto =  DeletePolycloud.prototype;

    proto.redo = function() {

        this.createPolycloud.undo();
    };

    proto.undo = function() {

        this.createPolycloud.redo();
    };

    namespace.DeletePolycloud = DeletePolycloud;

})();
(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;

    /**
     *
     * @param editor
     * @param polyline
     * @constructor
     */
    function DeletePolyline(editor, polyline) {

        namespace.EditAction.call(this, editor, 'DELETE-POLYLINE', polyline.id);
        this.createPolyline = new namespace.CreatePolyline(
            editor,
            polyline.id,
            polyline.position,
            polyline.size,
            polyline.rotation,
            polyline.locations,
            polyline.getStyle(),
            polyline.closed);
    }

    DeletePolyline.prototype = Object.create(namespace.EditAction.prototype);
    DeletePolyline.prototype.constructor = DeletePolyline;

    var proto =  DeletePolyline.prototype;

    proto.redo = function() {

        this.createPolyline.undo();
    };

    proto.undo = function() {

        this.createPolyline.redo();
    };

    namespace.DeletePolyline = DeletePolyline;

})();
(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;

    /**
     *
     * @param editor
     * @param rectangle
     * @constructor
     */
    var DeleteRectangle = function(editor, rectangle) {

        namespace.EditAction.call(this, editor, 'DELETE-RECTANGLE', rectangle.id);
        this.createRectangle = new namespace.CreateRectangle(
            editor,
            rectangle.id,
            rectangle.position,
            rectangle.size,
            rectangle.rotation,
            rectangle.getStyle());
    };

    DeleteRectangle.prototype = Object.create(namespace.EditAction.prototype);
    DeleteRectangle.prototype.constructor = DeleteRectangle;

    var proto = DeleteRectangle.prototype;

    proto.redo = function() {

        this.createRectangle.undo();
    };

    proto.undo = function() {

        this.createRectangle.redo();
    };

    namespace.DeleteRectangle = DeleteRectangle;

})();
(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;

    /**
     *
     * @param editor
     * @param text
     * @constructor
     */
    function DeleteText(editor, text) {

        namespace.EditAction.call(this, editor, 'DELETE-TEXT', text.id);

        var position = {x: text.position.x, y: text.position.y};
        var size = {x: text.size.x, y: text.size.y};

        this.createText = new namespace.CreateText(
            editor,
            text.id,
            position,
            size,
            text.getText(),
            text.getStyle());
    }

    DeleteText.prototype = Object.create(namespace.EditAction.prototype);
    DeleteText.prototype.constructor = DeleteText;

    var proto = DeleteText.prototype;

    proto.redo = function() {

        this.createText.undo();
    };

    proto.undo = function() {

        this.createText.redo();
    };

    namespace.DeleteText = DeleteText;

})();
(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;

    /**
     * This class will group actions edit actions that should be executed as a whole.
     * When a group is open actions can be added to it, similar actions will be merged into one during this process.
     * This class is not intended to be used by users, it's a helper class of EditActionManager.
     * @constructor
     */
    function EditActionGroup() {

        this.actions = [];
        this.closed = true;
    }

    var proto = EditActionGroup.prototype;

    /**
     *
     * @returns {boolean}
     */
    proto.open = function() {

        if(!this.closed) {
            return false;
        }

        this.closed = false;
        return true;
    };

    /**
     *
     * @returns {boolean}
     */
    proto.close = function() {

        if (this.closed) {
            return false;
        }

        this.closed = true;
        return true;
    };

    /**
     *
     * @returns {number} targetId
     */
    proto.undo = function() {

        var actions = this.actions;
        var actionsMaxIndex = actions.length - 1;

        var targetId = -1;
        for(var i = actionsMaxIndex; i >= 0; --i) {

            var action =  actions[i];
            action.undo();

            if (action.targetId !== -1) {
                targetId = action.targetId;
            }
        }

        return targetId;
    };

    /**
     *
     * @returns {number} targetId
     */
    proto.redo = function() {

        var actions = this.actions;
        var actionsCount = actions.length;

        var targetId = -1;
        for(var i = 0; i < actionsCount; ++i) {

            var action =  actions[i];
            action.redo();

            if (action.targetId !== -1) {
                targetId = action.targetId;
            }
        }

        return targetId;
    };

    /**
     *
     * @returns {boolean}
     */
    proto.isOpen = function() {

        return !this.closed;
    };

    /**
     *
     * @returns {boolean}
     */
    proto.isClosed = function() {

        return this.closed;
    };

    /**
     *
     * @returns {boolean}
     */
    proto.isEmpty = function() {

        return this.actions.length === 0;
    };

    /**
     *
     * @param {EditAction} action
     */
    proto.addAction = function(action) {

        if (this.closed) {
            return false;
        }

        this.actions.push(action);
        this.compact();

        return true;
    };

    /**
     * @private
     */
    proto.compact = function() {

        var actions = this.actions;
        var actionsCount = actions.length;

        for(var i = 0; i < actionsCount; ++i) {

            // If an action does nothing, remove it.
            var actionA = actions[i];
            if (actionA.isIdentity()) {
                actions.splice(i, 1);
                --actionsCount;
                --i;
                continue;
            }

            // If an action can be merged, merge it.
            for (var j = i + 1; j < actionsCount; ++j) {

                var actionB = actions[j];
                if (actionA.type === actionB.type &&
                    actionA.merge(actionB)) {
                    actions.splice(j, 1);
                    --actionsCount;
                    --i;
                    break;
                }
            }
        }
    };

    namespace.EditActionGroup = EditActionGroup;

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;

    /**
     *
     * @param editor
     * @param arrow
     * @param head
     * @param tail
     * @constructor
     */
    function SetArrow(editor, arrow, head, tail) {

        namespace.EditAction.call(this, editor, 'SET-ARROW', arrow.id);

        this.newHead = {x: head.x, y: head.y};
        this.newTail = {x: tail.x, y: tail.y};
        this.oldHead = {x: arrow.head.x, y: arrow.head.y};
        this.oldTail = {x: arrow.tail.x, y: arrow.tail.y};
    }

    SetArrow.prototype = Object.create(namespace.EditAction.prototype);
    SetArrow.prototype.constructor = SetArrow;

    var proto = SetArrow.prototype;

    proto.redo = function() {

        this.applyState(this.targetId, this.newHead, this.newTail);
    };

    proto.undo = function() {

        this.applyState(this.targetId, this.oldHead, this.oldTail);
    };

    proto.merge = function(action) {

        if (this.targetId === action.targetId &&
            this.type === action.type) {

            this.newHead = action.newHead;
            this.newTail = action.newTail;
            return true;
        }
        return false;
    };

    /**
     *
     * @private
     */
    proto.applyState = function(targetId, head, tail) {

        var arrow = this.editor.getMarkup(targetId);
        if(!arrow) {
            return;
        }

        // Different stroke widths make positions differ at sub-pixel level.
        var epsilon = 0.0001;

        if (Math.abs(arrow.head.x - head.x) >= epsilon || Math.abs(arrow.head.y - head.y) >= epsilon ||
            Math.abs(arrow.tail.x - tail.x) >= epsilon || Math.abs(arrow.tail.y - tail.y) >= epsilon) {

            // Confusing naming here. in arrow.set the first two numbers are
            // the point you drag from and the second two are the point you
            // drag to. So the head point is actually where the tail of the
            // arrow is positioned and the tail point is the head is positioned.
            arrow.set(head.x, head.y, tail.x, tail.y);
        }
    };

    /**
     * @returns {boolean}
     */
    proto.isIdentity = function() {

        return (
            this.newHead.x === this.oldHead.x &&
            this.newHead.y === this.oldHead.y &&
            this.newTail.x === this.oldTail.x &&
            this.newTail.y === this.oldTail.y);
    };

    namespace.SetArrow = SetArrow;

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;

    /**
     * Markup set circle action.
     *
     * Implements an [EditAction]{@link Autodesk.Viewing.Extensions.Markups.Core.EditAction}
     * for editing properties of a Circle [Markup]{@link Autodesk.Viewing.Extensions.Markups.Core.Markup}.
     * Included in documentation as an example of how to create
     * a specific EditAction that deals with Markup edition.
     * Developers are encourage to look into this class's source code and copy
     * as much code as they need. Find link to source code below.
     *
     * @tutorial feature_markup
     * @constructor
     * @memberof Autodesk.Viewing.Extensions.Markups.Core
     * @extends Autodesk.Viewing.Extensions.Markups.Core.EditAction
     *
     * @param editor
     * @param circle
     * @param position
     * @param size
     * @category Extensions
     */
    function SetCircle(editor, circle, position, size) {

        namespace.EditAction.call(this, editor, 'SET-CIRCLE', circle.id);

        this.newPosition = {x: position.x, y: position.y};
        this.newSize = {x: size.x, y: size.y};
        this.oldPosition = {x: circle.position.x, y: circle.position.y};
        this.oldSize = {x: circle.size.x, y: circle.size.y};
    }

    SetCircle.prototype = Object.create(namespace.EditAction.prototype);
    SetCircle.prototype.constructor = SetCircle;

    var proto = SetCircle.prototype;

    proto.redo = function() {

        this.applyState(this.targetId, this.newPosition, this.newSize);
    };

    proto.undo = function() {

        this.applyState(this.targetId, this.oldPosition, this.oldSize);
    };

    proto.merge = function(action) {

        if (this.targetId === action.targetId &&
            this.type === action.type) {

            this.newPosition = action.newPosition;
            this.newSize = action.newSize;
            return true;
        }
        return false;
    };

    /**
     *
     * @private
     */
    proto.applyState = function(targetId, position, size) {

        var circle = this.editor.getMarkup(targetId);
        if(!circle) {
            return;
        }

        // Different stroke widths make positions differ at sub-pixel level.
        var epsilon = 0.0001;

        if (Math.abs(circle.position.x - position.x) > epsilon || Math.abs(circle.size.y - size.y) > epsilon ||
            Math.abs(circle.position.y - position.y) > epsilon || Math.abs(circle.size.y - size.y) > epsilon) {

            circle.set(position, size);
        }
    };

    /**
     * @returns {boolean}
     */
    proto.isIdentity = function() {

        return (
            this.newPosition.x === this.oldPosition.x &&
            this.newPosition.y === this.oldPosition.y &&
            this.newSize.x === this.oldSize.x &&
            this.newSize.y === this.oldSize.y);
    };

    namespace.SetCircle = SetCircle;

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;

    /**
     *
     * @param editor
     * @param cloud
     * @param position
     * @param size
     * @constructor
     */
    function SetCloud(editor, cloud, position, size) {

        namespace.EditAction.call(this, editor, 'SET-CLOUD', cloud.id);

        this.newPosition = {x: position.x, y: position.y};
        this.newSize = {x: size.x, y: size.y};
        this.oldPosition = {x: cloud.position.x, y: cloud.position.y};
        this.oldSize = {x: cloud.size.x, y: cloud.size.y};
    }

    SetCloud.prototype = Object.create(namespace.EditAction.prototype);
    SetCloud.prototype.constructor = SetCloud;

    var proto = SetCloud.prototype;

    proto.redo = function() {

        this.applyState(this.targetId, this.newPosition, this.newSize, this.newStrokeWidth, this.newColor);
    };

    proto.undo = function() {

        this.applyState(this.targetId, this.oldPosition, this.oldSize, this.oldStrokeWidth, this.oldColor);
    };

    proto.merge = function(action) {

        if (this.targetId === action.targetId &&
            this.type === action.type) {

            this.newPosition = action.newPosition;
            this.newSize = action.newSize;
            return true;
        }
        return false;
    };

    /**
     *
     * @private
     */
    proto.applyState = function(targetId, position, size) {

        var cloud = this.editor.getMarkup(targetId);
        if(!cloud) {
            return;
        }

        // Different stroke widths make positions differ at sub-pixel level.
        var epsilon = 0.0001;

        if (Math.abs(cloud.position.x - position.x) > epsilon || Math.abs(cloud.size.y - size.y) > epsilon ||
            Math.abs(cloud.position.y - position.y) > epsilon || Math.abs(cloud.size.y - size.y) > epsilon) {

            cloud.set(position, size);
        }
    };

    /**
     * @returns {boolean}
     */
    proto.isIdentity = function() {

        return (
            this.newPosition.x === this.oldPosition.x &&
            this.newPosition.y === this.oldPosition.y &&
            this.newSize.x === this.oldSize.x &&
            this.newSize.y === this.oldSize.y);
    };

    namespace.SetCloud = SetCloud;

})();
(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;

    /**
     *
     * @param editor
     * @param freehand
     * @param position
     * @param size
     * @param locations
     * @constructor
     */
    function SetFreehand(editor, freehand, position, size, locations) {

        namespace.EditAction.call(this, editor, 'SET-FREEHAND', freehand.id);

        this.position = position;
        this.size = size;
        this.locations = locations.concat();

        // No need to save old data
    }

    SetFreehand.prototype = Object.create(namespace.EditAction.prototype);
    SetFreehand.prototype.constructor = SetFreehand;

    var proto = SetFreehand.prototype;

    proto.redo = function() {

        var freehand = this.editor.getMarkup(this.targetId);
        if(!freehand) {
            return;
        }

        freehand.set(this.position, this.size, this.locations);
    };

    proto.undo = function() {
        // No need for undo.
    };

    proto.merge = function(action) {

        if (this.targetId === action.targetId &&
            this.type === action.type) {

            this.locations = action.locations.concat();
            this.position = action.position;
            this.size = action.size;
            return true;
        }
        return false;
    };

    /**
     * @returns {boolean}
     */
    proto.isIdentity = function() {

        return false; // No need to optimize, always false.
    };

    namespace.SetFreehand = SetFreehand;

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;

    /**
     *
     * @param editor
     * @param highlight
     * @param position
     * @param size
     * @param locations
     * @constructor
     */
    function SetHighlight(editor, highlight, position, size, locations) {

        namespace.EditAction.call(this, editor, 'SET-HIGHLIGHT', highlight.id);

        this.position = position;
        this.size = size;
        this.locations = locations.concat();

        // No need to save old data
    }

    SetHighlight.prototype = Object.create(namespace.EditAction.prototype);
    SetHighlight.prototype.constructor = SetHighlight;

    var proto = SetHighlight.prototype;

    proto.redo = function() {

        var highlight = this.editor.getMarkup(this.targetId);
        if(!highlight) {
            return;
        }

        highlight.set(this.position, this.size, this.locations);
    };

    proto.undo = function() {
        // No need for undo.
    };

    proto.merge = function(action) {

        if (this.targetId === action.targetId &&
            this.type === action.type) {

            this.locations = action.locations.concat();
            this.position = action.position;
            this.size = action.size;
            return true;
        }
        return false;
    };

    /**
     * @returns {boolean}
     */
    proto.isIdentity = function() {

        return false; // No need to optimize, always false.
    };

    namespace.SetHighlight = SetHighlight;

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;

    /**
     *
     * @param editor
     * @param polycloud
     * @param position
     * @param size
     * @param locations
     * @param closed
     * @constructor
     */
    function SetPolycloud(editor, polycloud, position, size, locations, closed) {

        namespace.EditAction.call(this, editor, 'SET-POLYCLOUD', polycloud.id);

        this.position = position;
        this.size = size;
        this.locations = locations.concat();
        this.closed = closed;

        // No need to save old data
    }

    SetPolycloud.prototype = Object.create(namespace.EditAction.prototype);
    SetPolycloud.prototype.constructor = SetPolycloud;

    var proto = SetPolycloud.prototype;

    proto.redo = function() {

        var polycloud = this.editor.getMarkup(this.targetId);
        if(!polycloud) {
            return;
        }

        polycloud.set(this.position, this.size, this.locations, this.closed);
    };

    proto.undo = function() {
        // No need for undo.
    };

    proto.merge = function(action) {

        if (this.targetId === action.targetId &&
            this.type === action.type) {

            this.locations = action.locations.concat();
            this.position = action.position;
            this.size = action.size;
            this.closed = action.closed;
            return true;
        }
        return false;
    };

    /**
     * @returns {boolean}
     */
    proto.isIdentity = function() {

        return false; // No need to optimize, always false.
    };

    namespace.SetPolycloud = SetPolycloud;

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;

    /**
     *
     * @param editor
     * @param polyline
     * @param position
     * @param size
     * @param locations
     * @param closed
     * @constructor
     */
    function SetPolyline(editor, polyline, position, size, locations, closed) {

        namespace.EditAction.call(this, editor, 'SET-POLYLINE', polyline.id);

        this.position = position;
        this.size = size;
        this.locations = locations.concat();
        this.closed = closed;

        // No need to save old data
    }

    SetPolyline.prototype = Object.create(namespace.EditAction.prototype);
    SetPolyline.prototype.constructor = SetPolyline;

    var proto = SetPolyline.prototype;

    proto.redo = function() {

        var polyline = this.editor.getMarkup(this.targetId);
        if(!polyline) {
            return;
        }

        polyline.set(this.position, this.size, this.locations, this.closed);
    };

    proto.undo = function() {
        // No need for undo.
    };

    proto.merge = function(action) {

        if (this.targetId === action.targetId &&
            this.type === action.type) {

            this.locations = action.locations.concat();
            this.position = action.position;
            this.size = action.size;
            this.closed = action.closed;
            return true;
        }
        return false;
    };

    /**
     * @returns {boolean}
     */
    proto.isIdentity = function() {

        return false; // No need to optimize, always false.
    };

    namespace.SetPolyline = SetPolyline;

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;

    function SetPosition(editor, markup, position) {

        namespace.EditAction.call(this, editor, 'SET-POSITION', markup.id);

        this.newPosition = {x: position.x, y: position.y};
        this.oldPosition = {x: markup.position.x, y: markup.position.y};
    }

    SetPosition.prototype = Object.create(namespace.EditAction.prototype);
    SetPosition.prototype.constructor = SetPosition;

    var proto = SetPosition.prototype;

    proto.redo = function() {

        var markup = this.editor.getMarkup(this.targetId);
        markup && markup.setPosition(this.newPosition.x, this.newPosition.y);
    };

    proto.undo = function() {

        var markup = this.editor.getMarkup(this.targetId);
        markup && markup.setPosition(this.oldPosition.x, this.oldPosition.y);
    };

    /**
     *
     * @param action
     * @returns {boolean}
     */
    proto.merge = function(action) {

        if (this.targetId === action.targetId &&
            this.type === action.type) {

            this.newPosition = action.newPosition;
            return true;
        }
        return false;
    };

    /**
     * @returns {boolean}
     */
    proto.isIdentity = function() {

        var newPosition = this.newPosition;
        var oldPosition = this.oldPosition;

        return newPosition.x === oldPosition.x && newPosition.y === oldPosition.y;
    };

    namespace.SetPosition = SetPosition;

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;

    /**
     *
     * @param editor
     * @param rectangle
     * @param position
     * @param size
     * @constructor
     */
    function SetRectangle(editor, rectangle, position, size) {

        namespace.EditAction.call(this, editor, 'SET-RECTANGLE', rectangle.id);

        this.newPosition = {x: position.x, y: position.y};
        this.newSize = {x: size.x, y: size.y};
        this.oldPosition = {x: rectangle.position.x, y: rectangle.position.y};
        this.oldSize = {x: rectangle.size.x, y: rectangle.size.y};
    }

    SetRectangle.prototype = Object.create(namespace.EditAction.prototype);
    SetRectangle.prototype.constructor = SetRectangle;

    var proto = SetRectangle.prototype;

    proto.redo = function() {

        this.applyState(this.targetId, this.newPosition, this.newSize);
    };

    proto.undo = function() {

        this.applyState(this.targetId, this.oldPosition, this.oldSize);
    };

    proto.merge = function(action) {

        if (this.targetId === action.targetId &&
            this.type === action.type) {

            this.newPosition = action.newPosition;
            this.newSize = action.newSize;
            return true;
        }
        return false;
    };

    /**
     *
     * @private
     */
    proto.applyState = function(targetId, position, size) {

        var rectangle = this.editor.getMarkup(targetId);
        if(!rectangle) {
            return;
        }

        // Different stroke widths make positions differ at sub-pixel level.
        var epsilon = 0.0001;

        if (Math.abs(rectangle.position.x - position.x) > epsilon || Math.abs(rectangle.size.y - size.y) > epsilon ||
            Math.abs(rectangle.position.y - position.y) > epsilon || Math.abs(rectangle.size.y - size.y) > epsilon) {

            rectangle.set(position, size);
        }
    };

    /**
     * @returns {boolean}
     */
    proto.isIdentity = function() {

        return(
            this.newPosition.x === this.oldPosition.x &&
            this.newPosition.y === this.oldPosition.y &&
            this.newSize.x === this.oldSize.x &&
            this.newSize.y === this.oldSize.y);
    };

    namespace.SetRectangle = SetRectangle;

})();
(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;

    /**
     *
     * @param editor
     * @param markup
     * @param angle
     * @constructor
     */
    function SetRotation(editor, markup, angle) {

        namespace.EditAction.call(this, editor, 'SET-ROTATION', markup.id);

        var curAngle = markup.getRotation();

        this.newRotation = {angle: angle};
        this.oldRotation = {angle: curAngle};
    }

    SetRotation.prototype = Object.create(namespace.EditAction.prototype);
    SetRotation.prototype.constructor = SetRotation;

    var proto = SetRotation.prototype;

    proto.redo = function() {

        var markup = this.editor.getMarkup(this.targetId);
        markup && markup.setRotation(this.newRotation.angle);
    };

    proto.undo = function() {

        var markup = this.editor.getMarkup(this.targetId);
        markup && markup.setRotation(this.oldRotation.angle);
    };

    /**
     *
     * @param action
     * @returns {boolean}
     */
    proto.merge = function(action) {

        if (this.targetId === action.targetId &&
            this.type === action.type) {

            this.newRotation = action.newRotation;
            return true;
        }
        return false;
    };

    /**
     * @returns {boolean}
     */
    proto.isIdentity = function() {

        return this.newRotation.angle === this.oldRotation.angle;
    };

    namespace.SetRotation = SetRotation;

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;

    /**
     *
     * @param editor
     * @param markup
     * @param position
     * @param width
     * @param height
     * @constructor
     */
    function SetSize(editor, markup, position, width, height) {

        namespace.EditAction.call(this, editor, 'SET-SIZE', markup.id);

        this.newPosition = {x: position.x, y: position.y};
        this.oldPosition = {x: markup.position.x, y: markup.position.y};
        this.newWidth = width;
        this.oldWidth = markup.size.x;
        this.newHeight = height;
        this.oldHeight = markup.size.y;
    }

    SetSize.prototype = Object.create(namespace.EditAction.prototype);
    SetSize.prototype.constructor = SetSize;

    var proto = SetSize.prototype;

    proto.redo = function() {

        var markup = this.editor.getMarkup(this.targetId);
        markup && markup.setSize(this.newPosition, this.newWidth, this.newHeight);
    };

    proto.undo = function() {

        var markup = this.editor.getMarkup(this.targetId);
        markup && markup.setSize(this.oldPosition, this.oldWidth, this.oldHeight);
    };

    proto.merge = function(action) {

        if (this.targetId === action.targetId &&
            this.type === action.type) {

            this.newPosition = action.newPosition;
            this.newWidth = action.newWidth;
            this.newHeight = action.newHeight;
            return true;
        }
        return false;
    };

    /**
     * @returns {boolean}
     */
    proto.isIdentity = function() {

        var identity =
            this.newPosition.x === this.oldPosition.x &&
            this.newPosition.y === this.oldPosition.y &&
            this.newWidth === this.oldWidth &&
            this.newHeight === this.oldHeight;

        return identity;
    };

    namespace.SetSize = SetSize;

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;
    var namespaceUtils = Autodesk.Viewing.Extensions.Markups.Core.Utils;

    /**
     *
     * @param editor
     * @param markup
     * @param style
     * @constructor
     */
    function SetStyle(editor, markup, style) {

        namespace.EditAction.call(this, editor, 'SET-STYLE', markup.id);

        this.newStyle = namespaceUtils.cloneStyle(style);
        this.oldStyle = markup.getStyle();
    }

    SetStyle.prototype = Object.create(namespace.EditAction.prototype);
    SetStyle.prototype.constructor = SetStyle;

    var proto = SetStyle.prototype;

    proto.redo = function() {

        var markup = this.editor.getMarkup(this.targetId);
        markup && markup.setStyle(this.newStyle);
    };

    proto.undo = function() {

        var markup = this.editor.getMarkup(this.targetId);
        markup && markup.setStyle(this.oldStyle);
    };

    namespace.SetStyle = SetStyle;

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;

    /**
     *
     * @param editor
     * @param markup
     * @param position
     * @param size
     * @param text
     * @constructor
     */
    function SetText(editor, markup, position, size, text) {

        namespace.EditAction.call(this, editor, 'SET-TEXT', markup.id);

        this.newPosition = {x: position.x, y: position.y};
        this.oldPosition = {x: markup.position.x, y: markup.position.y};
        this.newSize = {x: size.x, y: size.y};
        this.oldSize = {x: markup.size.x, y: markup.size.y};
        this.newText = text;
        this.oldText = markup.getText();
    }

    SetText.prototype = Object.create(namespace.EditAction.prototype);
    SetText.prototype.constructor = SetText;

    var proto = SetText.prototype;

    proto.redo = function() {

        var text = this.editor.getMarkup(this.targetId);
        text && text.set(this.newPosition, this.newSize, this.newText);
    };

    proto.undo = function() {

        var text = this.editor.getMarkup(this.targetId);
        text && text.set(this.oldPosition, this.oldSize, this.oldText);
    };

    namespace.SetText = SetText;

})();

(function() { 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;
    var namespaceUtils = Autodesk.Viewing.Extensions.Markups.Core.Utils;

    /**
     *
     * @param editor
     * @constructor
     */
    function Clipboard(editor) {

        this.editor = editor;
        this.content = null;
        this.pastePosition = {x:0, y: 0};

        namespaceUtils.addTraitEventDispatcher(this);
    }

    var proto = Clipboard.prototype;

    proto.copy = function() {

        var selectedMarkup = this.editor.getSelection();
        if(!selectedMarkup) {
            return;
        }

        this.content = selectedMarkup.clone();
        this.pastePosition.x = selectedMarkup.position.x;
        this.pastePosition.y = selectedMarkup.position.y;
    };

    proto.cut = function() {

        var selectedMarkup = this.editor.getSelection();
        if(!selectedMarkup) {
            return;
        }

        this.copy();
        this.editor.deleteMarkup(selectedMarkup);
    };

    proto.paste = function() {

        var content = this.content;
        if(!content) {
            return;
        }

        var editor = this.editor;
        var position = this.pastePosition;
        var delta = editor.sizeFromClientToMarkups(20, 20);

        position.x += delta.x;
        position.y -= delta.y;

        var cloneMarkup = new namespace.CloneMarkup(editor, editor.getId(), content, position);
        cloneMarkup.execute();
    };

    namespace.Clipboard = Clipboard;
})();

(function() { 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;
    var namespaceUtils = Autodesk.Viewing.Extensions.Markups.Core.Utils;
    var av = Autodesk.Viewing;

    function InputHandler() {

        this.editor = null;
        this.mousePosition = {x:0, y:0};
        this.makeSameXY = false; // TODO: FIND a better way to name and communicate these.
        this.snapRotations = false;
        this.keepAspectRatio = false;
        this.constrainAxis = false;

        this.onWheelBinded = this.onWheel.bind(this);
        this.onTouchDragBinded = this.onTouchDrag.bind(this);
        this.onSingleTapBinded = this.onSingleTap.bind(this);
        this.onDoubleTapBinded = this.onDoubleTap.bind(this);
        this.onMouseMoveBinded = this.onMouseMove.bind(this);
        this.onMouseUpBinded = this.onMouseUp.bind(this);
        this.onMouseDownBinded = this.onMouseDown.bind(this);
        this.onMouseDoubleClickBinded = this.onMouseDoubleClick.bind(this);

        this.isMouseDown = false;
    }

    var proto = InputHandler.prototype;

    proto.attachTo = function(editor) {

        this.editor && this.detachFrom(this.editor);
        this.editor = editor;

        if (namespaceUtils.isTouchDevice()) {

            this.hammer = new Hammer.Manager(editor.svg, {
                recognizers: [
                    av.GestureRecognizers.drag,
                    av.GestureRecognizers.doubletap,
                    av.GestureRecognizers.doubletap2,
                    av.GestureRecognizers.singletap,
                    av.GestureRecognizers.singletap2,
                    av.GestureRecognizers.press
                ],
                inputClass: Hammer.TouchInput
            });

            this.hammer.get('doubletap2').recognizeWith('doubletap');
            this.hammer.get('singletap2').recognizeWith('singletap');
            this.hammer.get('singletap').requireFailure('doubletap');
        }
    };

    proto.detachFrom = function(editor) {

        this.hammer && this.hammer.destroy();

        document.removeEventListener('mousemove', this.onMouseMoveBinded, true);
        document.removeEventListener('mouseup', this.onMouseUpBinded, true);

        if (this.editor) {
            this.editor.svg.removeEventListener("mousedown", this.onMouseDownBinded);
            this.editor.svg.removeEventListener("dblclick", this.onMouseDoubleClickBinded);
        }

        this.editor = editor;
    };

    proto.enterEditMode = function() {

        if (this.hammer) {
            this.hammer.on("dragstart dragmove dragend", this.onTouchDragBinded);
            this.hammer.on("singletap", this.onSingleTapBinded);
            this.hammer.on("singletap2", this.onSingleTapBinded);
            this.hammer.on("doubletap", this.onDoubleTapBinded);
            this.hammer.on("doubletap2", this.onDoubleTapBinded);
        }

        if (!av.isMobileDevice()) {
            this.editor.svg.addEventListener("mousedown", this.onMouseDownBinded);
            this.editor.svg.addEventListener("dblclick", this.onMouseDoubleClickBinded);
            this.editor.svg.removeEventListener("wheel", this.onWheelBinded);
            document.addEventListener('mousemove', this.onMouseMoveBinded, true);
            document.addEventListener('mouseup', this.onMouseUpBinded, true);
        }
    };

    proto.leaveEditMode = function() {

        if (this.hammer) {
            this.hammer.off("dragstart dragmove dragend", this.onTouchDragBinded);
            this.hammer.off("singletap", this.onSingleTapBinded);
            this.hammer.off("singletap2", this.onSingleTapBinded);
            this.hammer.off("doubletap", this.onDoubleTapBinded);
            this.hammer.off("doubletap2", this.onDoubleTapBinded);
        }

        if (!av.isMobileDevice()) {
            this.editor.svg.removeEventListener("mousedown", this.onMouseDownBinded);
            this.editor.svg.removeEventListener("dblclick", this.onMouseDoubleClickBinded);
            this.editor.svg.removeEventListener("wheel", this.onWheelBinded);
            document.removeEventListener("mousemove", this.onMouseMoveBinded, true);
            document.removeEventListener("mouseup", this.onMouseUpBinded, true);
        }
    };

    proto.enterViewMode = function() {

    };

    proto.leaveViewMode = function() {

    };

    proto.getMousePosition = function() {

        return {x: this.mousePosition.x, y: this.mousePosition.y};
    };

    proto.onWheel = function(event) {

        event.preventDefault();
    };

    proto.onMouseMove = function(event) {

        processMouseEvent(this, event);
        this.editor.onMouseMove(event);
        event.preventDefault();
    };

    proto.onMouseDown = function(event) {

        processMouseEvent(this, event);

        this.isMouseDown = true;
        this.editor.onMouseDown(event);
        event.preventDefault();
    };

    proto.onMouseUp = function(event) {

        processMouseEvent(this, event);

        this.isMouseDown = false;
        this.editor.onMouseUp(event);
        event.preventDefault();
    };

    proto.onMouseDoubleClick = function(event) {

        processMouseEvent(this, event);
        this.editor.onMouseDoubleClick(event);
        event.preventDefault();
    };

    proto.onTouchDrag = function(event) {

        convertEventHammerToMouse(event);
        switch (event.type) {
          case 'dragstart':
              this.onMouseDown(event);
              break;
            case 'dragmove':
                this.onMouseMove(event);
                break;
           case 'dragend':
              this.onMouseUp(event);
              break;
        }
        event.preventDefault();
    };

    proto.onSingleTap = function(event) {

        convertEventHammerToMouse(event);

        this.onMouseDown(event);
        this.onMouseUp(event);
        event.preventDefault();
    };

    proto.onDoubleTap = function(event) {

        convertEventHammerToMouse(event);
        this.onMouseDoubleClick(event);
        event.preventDefault();
    };

    function processMouseEvent(input, event) {

        var rect = input.editor.svg.getBoundingClientRect();

        input.makeSameXY = event.shiftKey;
        input.snapRotations = event.shiftKey;
        input.keepAspectRatio = event.shiftKey;
        input.constrainAxis = event.shiftKey;

        input.mousePosition.x = event.clientX - rect.left;
        input.mousePosition.y = event.clientY - rect.top;
    }

    function convertEventHammerToMouse(event) {

        // Convert Hammer touch-event X,Y into mouse-event X,Y.
        event.shiftKey = false;
        event.clientX = event.pointers[0].clientX;
        event.clientY = event.pointers[0].clientY;
    }

    namespace.InputHandler = InputHandler;

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;
    var avem = Autodesk.Viewing.Extensions.Measure;
    var MeasureCommon = Autodesk.Viewing.Extensions.Measure.Functions;

    /**
     *
     * @param editor
     * @constructor
     */
    function EditModeArrow(editor) {

        var styleAttributes = ['stroke-width', 'stroke-color', 'stroke-opacity'];
        namespace.EditMode.call(this, editor, namespace.MARKUP_TYPE_ARROW, styleAttributes);
    }

    EditModeArrow.prototype = Object.create(namespace.EditMode.prototype);
    EditModeArrow.prototype.constructor = EditModeArrow;


    var proto = EditModeArrow.prototype;

    proto.deleteMarkup = function(markup, cantUndo) {

        markup = markup || this.selectedMarkup;
        if (markup && markup.type == this.type) {
            var deleteArrow = new namespace.DeleteArrow(this.editor, markup);
            deleteArrow.addToHistory = !cantUndo;
            deleteArrow.execute();
            return true;
        }
        return false;
    };

    /**
     * Handler to mouse down events, used to start markups creation.
     * @private
     */
    proto.onMouseDown = function() {

        namespace.EditMode.prototype.onMouseDown.call(this);

        if (this.selectedMarkup) {
            return;
        }

        var editor = this.editor;
        var mousePosition = editor.getMousePosition();

        this.initialX = mousePosition.x;
        this.initialY = mousePosition.y;

        this.size.x = 0;
        this.size.y = 0;

        // Snap to parallel/perpendicular of underlying vectors
        this.lineSnapped = null;
        if (editor.snapper) {
            var geomType = editor.snapper.getGeometryType();
            if (geomType === avem.SNAP_VERTEX || geomType === avem.SNAP_EDGE || geomType === avem.SNAP_MIDPOINT || geomType === avem.SNAP_CIRCLE_CENTER) {
                this.lineSnapped = editor.snapper.getEdge();
            }
        }

        // Calculate head and tail.
        var arrowMinSize = this.style['stroke-width'] * 3.5;
        var arrowMinSizeClient = editor.sizeFromMarkupsToClient(arrowMinSize,0).x;

        var head = {x: this.initialX, y: this.initialY};
        var tail = {
            x: Math.round(head.x + Math.cos( Math.PI * 0.25) * arrowMinSizeClient),
            y: Math.round(head.y + Math.sin(-Math.PI * 0.25) * arrowMinSizeClient)
        };
        // Constrain head and tail inside working area.
        var constrain = function(head, tail, size, bounds) {

            if (this.isInsideBounds(tail.x, tail.y, bounds)) {
                return;
            }

            tail.y = Math.round(head.y + Math.sin( Math.PI * 0.25) * size);
            if (this.isInsideBounds( tail.x, tail.y, bounds)) {
                return;
            }

            tail.x = Math.round(head.x + Math.cos(-Math.PI * 0.25) * size);
            if (this.isInsideBounds( tail.x, tail.y, bounds)) {
                return;
            }

            tail.y = Math.round(head.y + Math.sin(-Math.PI * 0.25) * size);

        }.bind(this);

        constrain( head, tail, arrowMinSizeClient, editor.getBounds());

        // Create arrow.
        editor.beginActionGroup();

        head = editor.positionFromClientToMarkups(head.x, head.y);
        tail = editor.positionFromClientToMarkups(tail.x, tail.y);

        var arrowVector = new THREE.Vector2(tail.x - head.x, tail.y - head.y);
        if (arrowVector.lengthSq() < arrowMinSize * arrowMinSize) {

            arrowVector = arrowVector.normalize().multiplyScalar(arrowMinSize);
            tail.x = head.x + arrowVector.x;
            tail.y = head.y + arrowVector.y;
        }

        var arrowId = editor.getId();
        var create = new namespace.CreateArrow(editor, arrowId, head, tail, this.style);
        create.execute();

        this.selectedMarkup = editor.getMarkup(arrowId);
        this.creationBegin();
    };

    /**
     * Handler to mouse move events, used to create markups.
     * @param {MouseEvent} event Mouse event.
     * @private
     */
    proto.onMouseMove = function(event) {

        namespace.EditMode.prototype.onMouseMove.call( this, event );

        var selectedMarkup = this.selectedMarkup;
        if(!selectedMarkup || !this.creating) {
            return;
        }

        var editor = this.editor;
        var final = this.getFinalMouseDraggingPosition();
        var initialX = this.initialX;
        var initialY = this.initialY;

        // Snap to parallel/perpendicular of underlying vectors
        if (editor.snapper && !editor.snapper.isSnapped() && this.lineSnapped) {
            var start = editor.project(this.lineSnapped.vertices[0]);
            var end = editor.project(this.lineSnapped.vertices[1]);
            var p = new THREE.Vector3(final.x, final.y, start.z);

            var parallel = MeasureCommon.nearestPointInPointToLine(p, start, end);

            // select an arbitrary point on the perpendicular line
            var k = -(start.x - end.x) / (start.y - end.y);
            var b = initialY - k * initialX;
            var x = initialX + 1;
            var y = k * x + b;
            var pEnd = new THREE.Vector3(x, y, start.z);

            var pStart = new THREE.Vector3(initialX, initialY, start.z);
            var perpendicular = MeasureCommon.nearestPointInPointToLine(p, pStart, pEnd);

            // Snap to parallel of underlying vectors
            if (parallel.distanceTo(p) <= 20) {
                final.x = parallel.x;
                final.y = parallel.y;
            }
            // Snap to perpendicular of underlying vectors
            else if (perpendicular.distanceTo(p) <= 20) {
                final.x = perpendicular.x;
                final.y = perpendicular.y;
            }
        }

        var head = editor.positionFromClientToMarkups(initialX, initialY);
        var tail = editor.positionFromClientToMarkups(final.x, final.y);

        var arrowVector = new THREE.Vector2(tail.x - head.x, tail.y - head.y);
        var arrowMinSize = selectedMarkup.style['stroke-width'] * 3.5;

        if (arrowVector.lengthSq() < arrowMinSize * arrowMinSize) {

            arrowVector = arrowVector.normalize().multiplyScalar(arrowMinSize);
            tail.x = head.x + arrowVector.x;
            tail.y = head.y + arrowVector.y;
        }

        this.size = editor.sizeFromClientToMarkups((final.x - initialX), (final.y - initialY));

        var setArrow = new namespace.SetArrow(editor, selectedMarkup, head, tail);
        setArrow.execute();
    };

    namespace.EditModeArrow = EditModeArrow;

})();
(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;

    /**
     * Markup circle edit mode.
     *
     * Implements a Circle [EditMode]{@link Autodesk.Viewing.Extensions.Markups.Core.EditMode}.
     * Included in documentation as an example of how to create
     * an EditMode for a specific markup type. Developers are encourage to look into this class's source code and copy
     * as much code as they need. Find link to source code below.
     *
     * @tutorial feature_markup
     * @constructor
     * @memberof Autodesk.Viewing.Extensions.Markups.Core
     * @extends Autodesk.Viewing.Extensions.Markups.Core.EditMode
     * @param {Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore} editor
     * @category Extensions
     */
    function EditModeCircle(editor) {

        var styleAttributes = ['stroke-width', 'stroke-color', 'stroke-opacity', 'fill-color', 'fill-opacity'];
        namespace.EditMode.call(this, editor, namespace.MARKUP_TYPE_CIRCLE, styleAttributes);
    }

    EditModeCircle.prototype = Object.create(namespace.EditMode.prototype);
    EditModeCircle.prototype.constructor = EditModeCircle;

    var proto = EditModeCircle.prototype;

    proto.deleteMarkup = function(markup, cantUndo) {

        markup = markup || this.selectedMarkup;
        if (markup && markup.type == this.type) {
            var deleteCircle = new namespace.DeleteCircle(this.editor, markup);
            deleteCircle.addToHistory = !cantUndo;
            deleteCircle.execute();
            return true;
        }
        return false;
    };

    /**
     * Handler to mouse move events, used to create markups.
     * @param {MouseEvent} event Mouse event.
     * @private
     */
    proto.onMouseMove = function(event) {

        namespace.EditMode.prototype.onMouseMove.call( this, event );

        var selectedMarkup = this.selectedMarkup;
        if(!selectedMarkup || !this.creating) {
            return;
        }

        var editor = this.editor;
        var initialX = this.initialX;
        var initialY = this.initialY;
        var final = this.getFinalMouseDraggingPosition();

        var sizeX = Math.abs(initialX - final.x);
        var sizeY = Math.abs(initialY - final.y);

        var position = editor.clientToMarkups((initialX + final.x) * 0.5, (initialY + final.y) * 0.5);
        var size = this.size = editor.sizeFromClientToMarkups(sizeX, sizeY);

        var setCircle = new namespace.SetCircle(
            editor,
            selectedMarkup,
            position,
            size);

        setCircle.execute();
    };

    /**
     * Handler to mouse down events, used to start markups creation.
     * @private
     */
    proto.onMouseDown = function() {

        namespace.EditMode.prototype.onMouseDown.call(this);

        if (this.selectedMarkup) {
            return;
        }

        var editor = this.editor;
        var mousePosition = editor.getMousePosition();

        this.initialX = mousePosition.x;
        this.initialY = mousePosition.y;

        // Calculate center and size.
        var position = editor.clientToMarkups(this.initialX, this.initialY);
        var size = this.size = editor.sizeFromClientToMarkups(1, 1);

        // Create circle.
        editor.beginActionGroup();

        var markupId = editor.getId();
        var create = new namespace.CreateCircle(
            editor,
            markupId,
            position,
            size,
            0,
            this.style);
        create.execute();

        this.selectedMarkup = editor.getMarkup(markupId);
        this.creationBegin();
    };

    namespace.EditModeCircle = EditModeCircle;

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;

    /**
     *
     * @param editor
     * @constructor
     */
    function EditModeCloud(editor) {

        var styleAttributes = ['stroke-width', 'stroke-color', 'stroke-opacity', 'fill-color', 'fill-opacity'];
        namespace.EditMode.call(this, editor, namespace.MARKUP_TYPE_CLOUD, styleAttributes);
    }

    EditModeCloud.prototype = Object.create(namespace.EditMode.prototype);
    EditModeCloud.prototype.constructor = EditModeCloud;

    var proto = EditModeCloud.prototype;

    proto.deleteMarkup = function(markup, cantUndo) {

        markup = markup || this.selectedMarkup;
        if (markup && markup.type == this.type) {
            var deleteCloud = new namespace.DeleteCloud(this.editor, markup);
            deleteCloud.addToHistory = !cantUndo;
            deleteCloud.execute();
            return true;
        }
        return false;
    };

    /**
     * Handler to mouse move events, used to create markups.
     * @param {MouseEvent} event Mouse event.
     * @private
     */
    proto.onMouseMove = function(event) {

        namespace.EditMode.prototype.onMouseMove.call( this, event );

        var selectedMarkup = this.selectedMarkup;
        if(!selectedMarkup || !this.creating) {
            return;
        }

        var editor = this.editor;
        var initialX = this.initialX;
        var initialY = this.initialY;

        var final = this.getFinalMouseDraggingPosition();
        var position = editor.clientToMarkups((initialX + final.x)/2, (initialY + final.y)/2);
        var size = this.size = editor.sizeFromClientToMarkups((final.x - initialX), (final.y - initialY));

        var setCloud = new namespace.SetCloud(
            editor,
            selectedMarkup,
            position,
            size);

        setCloud.execute();
    };

    /**
     * Handler to mouse down events, used to start markups creation.
     * @private
     */
    proto.onMouseDown = function() {

        namespace.EditMode.prototype.onMouseDown.call(this);

        if (this.selectedMarkup) {
            return;
        }

        var editor = this.editor;
        var mousePosition = editor.getMousePosition();

        this.initialX = mousePosition.x;
        this.initialY = mousePosition.y;

        // Calculate center and size.
        var position = editor.clientToMarkups(this.initialX, this.initialY);
        var size = this.size = editor.sizeFromClientToMarkups(1, 1);

        // Create Cloud.
        editor.beginActionGroup();

        var markupId = editor.getId();
        var create = new namespace.CreateCloud(
            editor,
            markupId,
            position,
            size,
            0,
            this.style);

        create.execute();

        this.selectedMarkup = editor.getMarkup(markupId);
        this.creationBegin();
    };

    namespace.EditModeCloud = EditModeCloud;

})();
(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;

    /**
     *
     * @param editor
     * @constructor
     */
    function EditModeFreehand(editor) {

        var styleAttributes = ['stroke-width', 'stroke-color', 'stroke-opacity'];
        namespace.EditMode.call(this, editor, namespace.MARKUP_TYPE_FREEHAND, styleAttributes);
        this.style['stroke-opacity'] = 0.75;
    }

    EditModeFreehand.prototype = Object.create(namespace.EditModePen.prototype);
    EditModeFreehand.prototype.constructor = EditModeFreehand;

    var proto = EditModeFreehand.prototype;

    proto.createPen = function(markupId, position, size, rotation, locations) {
        return new namespace.CreateFreehand(this.editor,
            markupId,
            position,
            size,
            rotation,
            locations,
            this.style);
    };

    proto.deletePen = function(markup) {
        return new namespace.DeleteFreehand(this.editor, markup);
    };

    proto.setPen = function(position, size, locations) {
        return new namespace.SetFreehand(this.editor,
            this.selectedMarkup,
            position,
            size,
            locations);
    };

    namespace.EditModeFreehand = EditModeFreehand;

})();
(function() { 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;
    var namespaceUtils = Autodesk.Viewing.Extensions.Markups.Core.Utils;
    /**
     *
     * @param editor
     * @constructor
     */
    function EditModeHighlight(editor) {

        var styleAttributes = ['stroke-width', 'stroke-color', 'stroke-opacity'];
        namespace.EditMode.call(this, editor, namespace.MARKUP_TYPE_HIGHLIGHT, styleAttributes);

        var normaStrokeWidth = namespaceUtils.getStrokeWidth(namespaceUtils.MARKUP_DEFAULT_STROKE_WIDTH_IN_PIXELS, editor);
        this.style['stroke-opacity'] = 0.50;
        this.style['stroke-color'] = '#ffff00';
        this.style['stroke-width'] = 4 * normaStrokeWidth; // Very Thick
    }

    EditModeHighlight.prototype = Object.create(namespace.EditModePen.prototype);
    EditModeHighlight.prototype.constructor = EditModeHighlight;

    var proto = EditModeHighlight.prototype;

    proto.createPen = function(markupId, position, size, rotation, locations) {
        return new namespace.CreateHighlight(this.editor,
            markupId,
            position,
            size,
            rotation,
            locations,
            this.style);
    };

    proto.deletePen = function(markup) {
        return new namespace.DeleteHighlight(this.editor, markup);
    };

    proto.setPen = function(position, size, locations) {
        return new namespace.SetHighlight(this.editor,
            this.selectedMarkup,
            position,
            size,
            locations);
    };

    namespace.EditModeHighlight = EditModeHighlight;
})();
(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;
    var namespaceUtils = Autodesk.Viewing.Extensions.Markups.Core.Utils;
    var SNAP_RANGE = 25;

    /**
     *
     * @param editor
     * @constructor
     */
    function EditModePolycloud(editor) {

        var styleAttributes = ['stroke-width', 'stroke-color','stroke-opacity', 'fill-color', 'fill-opacity'];
        namespace.EditMode.call(this, editor, namespace.MARKUP_TYPE_POLYCLOUD, styleAttributes);

        this.creationMethod = this.CREATION_METHOD_CLICKS;
        this.movements = [];
    }

    EditModePolycloud.prototype = Object.create(namespace.EditMode.prototype);
    EditModePolycloud.prototype.constructor = EditModePolycloud;

    var proto = EditModePolycloud.prototype;

    proto.deleteMarkup = function(markup, cantUndo) {

        markup = markup || this.selectedMarkup;
        if (markup && markup.type == this.type) {
            var movements = this.movements;
            if (this.creating && movements.length >= 2) {
                movements.pop();
                movements.pop();
                var lastIndex = movements.length - 1;
                if (lastIndex >= 0) {
                    // duplicate last location
                    var lastMove = movements[lastIndex];
                    movements.push(lastMove);
                    var locations = setPositionAndSize(movements, this);
                    var setPolycloud = new namespace.SetPolycloud(
                        this.editor,
                        markup,
                        this.position,
                        this.size,
                        locations);

                    setPolycloud.execute();
                }
            }
            else {
                var deletePolycloud = new namespace.DeletePolycloud(this.editor, markup);
                deletePolycloud.addToHistory = !cantUndo;
                deletePolycloud.execute();
                this.creationEnd();
                return true;
            }
        }
        return false;
    };

    /**
     * Handler to mouse move events, used to create markups.
     * @param {MouseEvent} event Mouse event.
     * @private
     */
    proto.onMouseMove = function(event) {

        namespace.EditMode.prototype.onMouseMove.call(this, event);

        var editor = this.editor;
        var selectedMarkup = this.selectedMarkup;

        if(!selectedMarkup || !this.creating) {
            return;
        }

        this.dragging = true;

        var movements = this.movements;
        movements.splice(movements.length-1, 1);

        var mousePosition = editor.getMousePosition();
        mousePosition = editor.clientToMarkups(mousePosition.x, mousePosition.y);

        // Close polycloud if user clicks close to initial point.
        if (movements.length >= 2 &&
            namespaceUtils.areMarkupsPointsInClientRange(movements[0], mousePosition, SNAP_RANGE, this.editor)) {
            mousePosition = movements[0]; // Snap!
        }

        movements.push(mousePosition);

        var locations = setPositionAndSize(movements, this);
        var setPolycloud = new namespace.SetPolycloud(
            editor,
            selectedMarkup,
            this.position,
            this.size,
            locations);

        setPolycloud.execute();
    };

    /**
     * Handler to mouse down events, used to start markups creation.
     * @private
     */
    proto.onMouseDown = function() {

        namespace.EditMode.prototype.onMouseDown.call(this);

        // User selected an already created markup.
        if (this.selectedMarkup && !this.creating) {
            return;
        }

        if (this.creating) {
            return;
        }

        // Creation process.
        var editor = this.editor;
        var mousePosition = editor.getMousePosition();

        mousePosition = editor.clientToMarkups(mousePosition.x, mousePosition.y);

        var size = this.size = editor.sizeFromClientToMarkups(1, 1);
        this.movements = [mousePosition, mousePosition];

        editor.beginActionGroup();

        var markupId = editor.getId();
        var create = new namespace.CreatePolycloud(
            editor,
            markupId,
            mousePosition,
            size,
            0,
            [{x: 0, y: 0 }],
            this.style);

        create.execute();

        this.selectedMarkup = editor.getMarkup(markupId);
        this.creationBegin();
    };

    /**
     * Handler to mouse down events, used to start markups creation.
     * @private
     */
    proto.onMouseUp = function(event) {

        namespace.EditMode.prototype.onMouseUp.call(this);

        if(!this.creating) {
            return;
        }

        this.dragging = false;

        // Creation process.
        var editor = this.editor;
        var mousePosition = editor.getMousePosition();
        var movements = this.movements;
        var closed = false;

        mousePosition = editor.clientToMarkups(mousePosition.x, mousePosition.y);

        if (movements.length > 1 &&
            namespaceUtils.areMarkupsPointsInClientRange(movements[movements.length-2], mousePosition, SNAP_RANGE, this.editor)) {
            return;
        }

        // Close polycloud if user clicks close to initial point.
        if (movements.length > 2 &&
            namespaceUtils.areMarkupsPointsInClientRange(movements[0], mousePosition, SNAP_RANGE, this.editor)) {
            mousePosition = movements[0]; // Snap!
            closed = true;
        }

        movements.splice(movements.length-1, 1);

        if (!closed) {
            movements.push(mousePosition);
            movements.push(mousePosition);
        }

        var polycloud = this.selectedMarkup;
        var locations = setPositionAndSize(movements, polycloud);
        var setPolycloud = new namespace.SetPolycloud(
            editor,
            polycloud,
            polycloud.position,
            polycloud.size,
            locations,
            closed);

        setPolycloud.execute();

        if (closed) {
            this.creationEnd();
        }
    };

    proto.onMouseDoubleClick = function(event) {

        if(!this.creating) {
            return;
        }

        var movements = this.movements;
        movements.splice(Math.max(0, movements.length-1));

        if (movements.length < 2 ) {

            this.creationCancel();
        } else {

            var polycloud = this.selectedMarkup;
            var locations = setPositionAndSize(movements, polycloud);
            var setPolycloud = new namespace.SetPolycloud(
                this.editor,
                polycloud,
                polycloud.position,
                polycloud.size,
                locations,
                true);

            setPolycloud.execute();
            this.creationEnd();
        }
    };

    proto.creationEnd = function() {

        // To pass isMinSizeValid,
        // probably that test should be done with the markup size (not the recorded by the edit mode).
        if (this.selectedMarkup) {
            this.size.x = this.selectedMarkup.size.x;
            this.size.y = this.selectedMarkup.size.y;
        }
        
        namespace.EditMode.prototype.creationEnd.call(this);

        this.closed = false;
        this.movements = [];
        this.dragging = false;
        this.creating = false;
    };

    proto.creationCancel = function() {

        namespace.EditMode.prototype.creationCancel.call(this);

        this.closed = false;
        this.movements = [];
        this.dragging = false;
        this.creating = false;
    };

    function setPositionAndSize(locations, markup) {

        // determine the position of the top-left and bottom-right points
        var minFn = function(collection, key){
            var targets = collection.map(function(item){
                return item[key];
            });
            return Math.min.apply(null, targets);
        };

        var maxFn = function(collection, key){
            var targets = collection.map(function(item){
                return item[key];
            });
            return Math.max.apply(null, targets);
        };

        var strokeWidth = markup.style['stroke-width'];
        var radius = strokeWidth * 2 + strokeWidth * 0.5;

        var l = minFn(locations, 'x') - radius;
        var t = minFn(locations, 'y') - radius;
        var r = maxFn(locations, 'x') + radius;
        var b = maxFn(locations, 'y') + radius;
        var w = r - l;
        var h = b - t;

        markup.size = {x: w, y: h};
        markup.position = {x: l + w * 0.5, y: t + h * 0.5};

        // Adjust points to relate from the shape's center
        var position = markup.position;
        return locations.map(function(point){
            return {
                x: point.x - position.x,
                y: point.y - position.y
            };
        });
    }

    namespace.EditModePolycloud = EditModePolycloud;

})();
(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;
    var namespaceUtils = Autodesk.Viewing.Extensions.Markups.Core.Utils;
    var SNAP_RANGE = 25;

    /**
     *
     * @param editor
     * @constructor
     */
    function EditModePolyline(editor) {

        var styleAttributes = ['stroke-width', 'stroke-color','stroke-opacity', 'fill-color', 'fill-opacity'];
        namespace.EditMode.call(this, editor, namespace.MARKUP_TYPE_POLYLINE, styleAttributes);

        this.creationMethod = this.CREATION_METHOD_CLICKS;
        this.movements = [];
    }

    EditModePolyline.prototype = Object.create(namespace.EditMode.prototype);
    EditModePolyline.prototype.constructor = EditModePolyline;

    var proto = EditModePolyline.prototype;

    proto.deleteMarkup = function(markup, cantUndo) {

        markup = markup || this.selectedMarkup;
        if (markup && markup.type == this.type) {
            var movements = this.movements;
            if (this.creating && movements.length >= 2) {
                movements.pop();
                movements.pop();
                var lastIndex = movements.length - 1;
                if (lastIndex >= 0) {
                    // duplicate last location
                    var lastMove = movements[lastIndex];
                    movements.push(lastMove);
                    var locations = setPositionAndSize(movements, this);
                    var setPolyline = new namespace.SetPolyline(
                        this.editor,
                        markup,
                        this.position,
                        this.size,
                        locations);

                    setPolyline.execute();
                }
            }
            else {
                var deletePolyline = new namespace.DeletePolyline(this.editor, markup);
                deletePolyline.addToHistory = !cantUndo;
                deletePolyline.execute();
                this.creationEnd();
                return true;
            }
        }
        return false;
    };

    /**
     * Handler to mouse move events, used to create markups.
     * @param {MouseEvent} event Mouse event.
     * @private
     */
    proto.onMouseMove = function(event) {

        namespace.EditMode.prototype.onMouseMove.call(this, event);

        var editor = this.editor;
        var selectedMarkup = this.selectedMarkup;

        if(!selectedMarkup || !this.creating) {
            return;
        }

        this.dragging = true;

        var movements = this.movements;
        movements.splice(movements.length-1, 1);

        var mousePosition = editor.getMousePosition();
        mousePosition = editor.clientToMarkups(mousePosition.x, mousePosition.y);

        // Close polyline if user clicks close to initial point.
        if (movements.length >= 2 &&
            namespaceUtils.areMarkupsPointsInClientRange(movements[0], mousePosition, SNAP_RANGE, this.editor)) {
            mousePosition = movements[0]; // Snap!
        }

        movements.push(mousePosition);

        var locations = setPositionAndSize(movements, this);
        var setPolyline = new namespace.SetPolyline(
            editor,
            selectedMarkup,
            this.position,
            this.size,
            locations);

        setPolyline.execute();
    };

    /**
     * Handler to mouse down events, used to start markups creation.
     * @private
     */
    proto.onMouseDown = function(event) {

        namespace.EditMode.prototype.onMouseDown.call(this);

        // User selected an already created markup.
        if (this.selectedMarkup && !this.creating) {
            return;
        }

        if (this.creating) {
            return;
        }

        // Creation process.
        var editor = this.editor;
        var mousePosition = editor.getMousePosition();

        mousePosition = editor.clientToMarkups(mousePosition.x, mousePosition.y);

        var size = this.size = editor.sizeFromClientToMarkups(1, 1);
        this.movements = [mousePosition, mousePosition];

        editor.beginActionGroup();

        var markupId = editor.getId();
        var create = new namespace.CreatePolyline(
            editor,
            markupId,
            mousePosition,
            size,
            0,
            [{x:0, y:0}],
            this.style);

        create.execute();

        this.selectedMarkup = editor.getMarkup(markupId);
        this.creationBegin();
    };

    /**
     * Handler to mouse down events, used to start markups creation.
     * @private
     */
    proto.onMouseUp = function() {

        namespace.EditMode.prototype.onMouseUp.call(this);

        if(!this.creating) {
            return;
        }

        this.dragging = false;

        // Creation process.
        var editor = this.editor;
        var mousePosition = editor.getMousePosition();
        var movements = this.movements;
        var closed = false;

        mousePosition = editor.clientToMarkups(mousePosition.x, mousePosition.y);

        if (movements.length > 1 &&
            namespaceUtils.areMarkupsPointsInClientRange(movements[movements.length-2], mousePosition, SNAP_RANGE, this.editor)) {
            return;
        }

        // Close polyline if user clicks close to initial point.
        if (movements.length > 2 &&
            namespaceUtils.areMarkupsPointsInClientRange(movements[0], mousePosition, SNAP_RANGE, this.editor)) {
            mousePosition = movements[0]; // Snap!
            closed = true;
        }

        movements.splice(movements.length-1, 1);

        if (!closed) {
            movements.push(mousePosition);
            movements.push(mousePosition);
        }

        var polyline = this.selectedMarkup;
        var locations = setPositionAndSize(movements, polyline);
        var setPolyline = new namespace.SetPolyline(
            editor,
            polyline,
            polyline.position,
            polyline.size,
            locations,
            closed);

        setPolyline.execute();

        if (closed) {
            this.creationEnd();
        }
    };

    proto.creationEnd = function() {

        // To pass isMinSizeValid,
        // probably that test should be done with the markup size (not the recorded by the edit mode).
        if (this.selectedMarkup) {
            this.size.x = this.selectedMarkup.size.x;
            this.size.y = this.selectedMarkup.size.y;
        }

        namespace.EditMode.prototype.creationEnd.call(this);

        this.closed = false;
        this.movements = [];
        this.dragging = false;
        this.creating = false;
    };

    proto.creationCancel = function() {

        namespace.EditMode.prototype.creationCancel.call(this);

        this.closed = false;
        this.movements = [];
        this.dragging = false;
        this.creating = false;
    };


    proto.onMouseDoubleClick = function(event) {

        if(!this.creating) {
           return;
        }

        var movements = this.movements;
        movements.splice(Math.max(0, movements.length-1));

        if (movements.length < 2 ) {

            this.creationCancel();
        } else {

            var polyline = this.selectedMarkup;
            var locations = setPositionAndSize(movements, polyline);
            var setPolyline = new namespace.SetPolyline(
                this.editor,
                polyline,
                polyline.position,
                polyline.size,
                locations,
                this.closed);

            setPolyline.execute();
            this.creationEnd();
        }
    };

    function setPositionAndSize(locations, markup) {

        // determine the position of the top-left and bottom-right points
        var minFn = function(collection, key){
            var targets = collection.map(function(item){
                return item[key];
            });
            return Math.min.apply(null, targets);
        };

        var maxFn = function(collection, key){
            var targets = collection.map(function(item){
                return item[key];
            });
            return Math.max.apply(null, targets);
        };

        var l = minFn(locations, 'x');
        var t = minFn(locations, 'y');
        var r = maxFn(locations, 'x');
        var b = maxFn(locations, 'y');
        var w = r - l;
        var h = b - t;

        markup.size = {x: w, y: h};
        markup.position = {x: l + w * 0.5, y: t + h * 0.5};

        // Adjust points to relate from the shape's center
        var position = markup.position;
        return locations.map(function(point){
            return {
                x: point.x - position.x,
                y: point.y - position.y
            };
        });
    }

    namespace.EditModePolyline = EditModePolyline;

})();
(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;
    var avem = Autodesk.Viewing.Extensions.Measure;
    var MeasureCommon = Autodesk.Viewing.Extensions.Measure.Functions;

    /**
     *
     * @param editor
     * @constructor
     */
    function EditModeRectangle(editor) {

        var styleAttributes = ['stroke-width', 'stroke-color', 'stroke-opacity', 'fill-color', 'fill-opacity'];
        namespace.EditMode.call(this, editor, namespace.MARKUP_TYPE_RECTANGLE, styleAttributes);
    }

    EditModeRectangle.prototype = Object.create(namespace.EditMode.prototype);
    EditModeRectangle.prototype.constructor = EditModeRectangle;

    var proto = EditModeRectangle.prototype;

    proto.deleteMarkup = function(markup, cantUndo) {

        markup = markup || this.selectedMarkup;
        if (markup && markup.type == this.type) {
            var deleteRectangle = new namespace.DeleteRectangle(this.editor, markup);
            deleteRectangle.addToHistory = !cantUndo;
            deleteRectangle.execute();
            return true;
        }
        return false;
    };

    /**
     * Handler to mouse move events, used to create markups.
     * @param {MouseEvent} event Mouse event.
     * @private
     */
    proto.onMouseMove = function(event) {

        namespace.EditMode.prototype.onMouseMove.call( this, event );

        var selectedMarkup = this.selectedMarkup;
        if(!selectedMarkup || !this.creating) {
            return;
        }

        var editor = this.editor;
        var initialX = this.initialX;
        var initialY = this.initialY;

        var final = this.getFinalMouseDraggingPosition();
        var position = editor.clientToMarkups((initialX + final.x)/2, (initialY + final.y)/2);

        var width, height;
        // Snap to parallel/perpendicular of underlying vectors
        if (editor.snapper && this.lineSnapped) {
            var start = editor.project(this.lineSnapped.vertices[0]);
            var end = editor.project(this.lineSnapped.vertices[1]);
            var p = new THREE.Vector3(final.x, final.y, start.z);

            var parallel = MeasureCommon.nearestPointInPointToLine(p, start, end);
            height = p.distanceTo(parallel);

            // select an arbitrary point on the perpendicular line
            var k = -(start.x - end.x) / (start.y - end.y);
            var b = initialY - k * initialX;
            var x = initialX + 1;
            var y = k * x + b;
            var pEnd = new THREE.Vector3(x, y, start.z);

            var pStart = new THREE.Vector3(initialX, initialY, start.z);
            var perpendicular = MeasureCommon.nearestPointInPointToLine(p, pStart, pEnd);
            width = p.distanceTo(perpendicular);
        }
        else {
            width = final.x - initialX;
            height = final.y - initialY;
        }

        var size = this.size = editor.sizeFromClientToMarkups(width, height);

        var setRectangle = new namespace.SetRectangle(
            editor,
            selectedMarkup,
            position,
            size);

        setRectangle.execute();
    };

    /**
     * Handler to mouse down events, used to start markups creation.
     * @private
     */
    proto.onMouseDown = function() {

        namespace.EditMode.prototype.onMouseDown.call(this);

        if (this.selectedMarkup) {
            return;
        }

        var editor = this.editor;
        var mousePosition = editor.getMousePosition();

        this.initialX = mousePosition.x;
        this.initialY = mousePosition.y;

        // Calculate center and size.
        var position = editor.clientToMarkups(this.initialX, this.initialY);
        var size = this.size = editor.sizeFromClientToMarkups(1, 1);

        // Calculate rotation
        var rotation = 0;
        this.lineSnapped = null;
        if (editor.snapper) {
            // Snap to parallel/perpendicular of underlying vectors
            var geomType = editor.snapper.getGeometryType();
            if (geomType === avem.SNAP_EDGE) {
                this.lineSnapped = editor.snapper.getEdge();
                var start = editor.project(this.lineSnapped.vertices[0]);
                var end = editor.project(this.lineSnapped.vertices[1]);
                var dx = end.x - start.x;
                var dy = end.y - start.y;
                rotation = this.rotation = Math.atan2(dy, dx);
            }
        }

        // Create rectangle.
        editor.beginActionGroup();

        var markupId = editor.getId();
        var create = new namespace.CreateRectangle(
            editor,
            markupId,
            position,
            size,
            rotation,
            this.style);

        create.execute();

        this.selectedMarkup = editor.getMarkup(markupId);
        this.creationBegin();
    };

    namespace.EditModeRectangle = EditModeRectangle;

})();
(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;

    /**
     *
     * @param editor
     * @constructor
     */
    function EditModeText(editor) {

        var styleAttributes = [
            'font-size',
            'stroke-color',
            'stroke-opacity',
            'fill-color',
            'fill-opacity',
            'font-family',
            'font-style',
            'font-weight'
        ];
        namespace.EditMode.call(this, editor, namespace.MARKUP_TYPE_TEXT, styleAttributes);

        var helper = new namespace.EditorTextInput(this.viewer.container, this.editor);
        helper.addEventListener(helper.EVENT_TEXT_CHANGE, this.onHelperTextChange.bind(this), false);
        this.textInputHelper = helper;
        this.onHistoryChangeBinded = this.onHistoryChange.bind(this);
        this.minSize = 0; // No need to size it initially
        this.creationMethod = this.CREATION_METHOD_CLICK;
    }

    EditModeText.prototype = Object.create(namespace.EditMode.prototype);
    EditModeText.prototype.constructor = EditModeText;

    var proto = EditModeText.prototype;

    proto.deleteMarkup = function(markup, cantUndo) {

        markup = markup || this.selectedMarkup;
        if (markup && markup.type == this.type) {
            var deleteText = new namespace.DeleteText(this.editor, markup);
            deleteText.addToHistory = !cantUndo;
            deleteText.execute();
            return true;
        }
        return false;
    };

    /**
     *
     * @param style
     */
    proto.setStyle = function(style) {

        if (this.textInputHelper && this.textInputHelper.isActive()) {

            this.textInputHelper.setStyle(style);
        } else {
            namespace.EditMode.prototype.setStyle.call(this, style);
        }
    };

    proto.notifyAllowNavigation = function(allows) {

        if (allows && this.textInputHelper && this.textInputHelper.isActive()) {
            this.textInputHelper.acceptAndExit();
        }
    };

    proto.destroy = function() {

        if (this.textInputHelper) {
            if (this.textInputHelper.isActive()) {
                this.textInputHelper.acceptAndExit();
            }
            this.textInputHelper.destroy();
            this.textInputHelper = null;
        }
        namespace.EditMode.prototype.destroy.call(this);
    };

    /**
     * Handler to mouse down events, used to start markups creation.
     */
    proto.onMouseDown = function() {

        if (this.textInputHelper && this.textInputHelper.isActive()) {
            this.textInputHelper.acceptAndExit();
            return;
        }

        if (this.selectedMarkup) {
            return;
        }

        var editor = this.editor;
        var mousePosition = editor.getMousePosition();
        var clientFontSize = editor.sizeFromMarkupsToClient(0, this.style['font-size']).y;
        var initialWidth = clientFontSize * 15; // Find better way to initialize size.
        var initialHeight = clientFontSize * 3;

        // Center position.
        var size = this.size = editor.sizeFromClientToMarkups(initialWidth, initialHeight);
        var position = editor.positionFromClientToMarkups(
            mousePosition.x + (initialWidth * 0.5),
            mousePosition.y + (initialHeight * 0.5));

        this.creationBegin();
        editor.beginActionGroup();

        // Given the initial width and font size, we assume that the text fits in one line.
        var createText = new namespace.CreateText(
            editor,
            editor.getId(),
            position,
            size,
            '',
            this.style);

        createText.execute();
        this.creationEnd();

        this.selectedMarkup = editor.getMarkup(createText.targetId);
        this.textInputHelper && this.textInputHelper.setActive(this.selectedMarkup, true);
        this.editor.actionManager.addEventListener(namespace.EVENT_HISTORY_CHANGED, this.onHistoryChangeBinded);
    };

    proto.onMouseUp = function(event) {

    };

    proto.onMouseDoubleClick = function(markup) {

        if (markup === this.selectedMarkup) {
            this.editor.selectMarkup(null);
            this.textInputHelper && this.textInputHelper.setActive(markup, false);
        }
    };

    proto.onHelperTextChange = function(event) {

        var dataBag = event.data;
        var textMarkup = dataBag.markup;
        var textStyle = dataBag.style;

        this.editor.actionManager.removeEventListener(namespace.EVENT_HISTORY_CHANGED, this.onHistoryChangeBinded);

        // Deal with edge case first: Creating a Label without text
        if (dataBag.newText === '') {

            // If the text field is being created for the first time,
            // we need only to cancel the action group in progress
            if (dataBag.firstEdit) {
                this.editor.cancelActionGroup();
                this.editor.selectMarkup(null);
                return;
            }
            // Else, we must perform a Delete action
            else
            {
                var deleteText = new namespace.DeleteText(this.editor, textMarkup);
                deleteText.execute();
                this.editor.selectMarkup(null);
                return;
            }
        }

        // When the text is created for the first time, an action group
        // is already created and it includes the CreateText action.
        // Thus, no need to begin another action group.
        if (!dataBag.firstEdit) {
            this.editor.beginActionGroup();
        }

        // Size change action //
        var position = this.editor.positionFromClientToMarkups(dataBag.newPos.x, dataBag.newPos.y);
        var size = this.editor.sizeFromClientToMarkups(dataBag.width, dataBag.height);
        var setSize = new namespace.SetSize(
            this.editor,
            textMarkup,
            position,
            size.x,
            size.y);
        setSize.execute();

        // Text change action //
        var setText = new namespace.SetText(
            this.editor,
            textMarkup,
            textMarkup.position,
            textMarkup.size,
            dataBag.newText);
        setText.execute();

        var setStyle = new namespace.SetStyle(
            this.editor,
            textMarkup,
            textStyle
        );
        setStyle.execute();

        // However, we do need to close the action group at this point. For both cases.
        this.editor.closeActionGroup();
        this.editor.selectMarkup(null);
    };

    /**
     * We want to make sure that the Input Helper gets removed from the screen
     * whenever the user attempts to perform an undo or redo action.
     * @param {Event} event
     * @private
     */
    proto.onHistoryChange = function(event) {

        if (this.textInputHelper && this.textInputHelper.isActive()) {
            this.editor.actionManager.removeEventListener(namespace.EVENT_HISTORY_CHANGED, this.onHistoryChangeBinded);
            this.textInputHelper.setInactive();
        }
    };

    /**
     * Notify the markup that the displayed markups are being saved so edit mode can finish current editions.
     */
    proto.onSave = function() {

        namespace.EditMode.prototype.onSave.call(this);

        // Close input helper if it's open.
        if (this.textInputHelper && this.textInputHelper.isActive()) {
            var firstEdit = this.textInputHelper.firstEdit;

            this.editor.actionManager.removeEventListener(namespace.EVENT_HISTORY_CHANGED, this.onHistoryChangeBinded);
            this.textInputHelper.setInactive();

            // Close action group if open (first edit).s
            if (firstEdit) {
                this.editor.cancelActionGroup();
            }

            this.editor.selectMarkup(null);
            this.selectedMarkup = null;
        }
    };

    namespace.EditModeText = EditModeText;

})();
(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;
    var namespaceUtils = Autodesk.Viewing.Extensions.Markups.Core.Utils;
    var DEFAULT_TEXT = 'Write Something';

    /**
     * Auxiliary class that handles all input for the Label Markup (MarkupText.js)
     * It instantiates a TEXTAREA where the user can input text. When user input is
     * disabled, the textarea gets hidden and further rendering is delegated to
     * MarkupText.js
     *
     * @param {HTMLElement} parentDiv
     * @param {Object} editor - Core Extension
     * @constructor
     */
    function EditorTextInput(parentDiv, editor) {

        this.parentDiv = parentDiv;
        this.editor = editor;

        // Constants
        this.EVENT_TEXT_CHANGE = 'EVENT_CO2_TEXT_CHANGE';

        // The actual TextArea input
        this.textArea = document.createElement('textarea');
        this.textArea.setAttribute('maxlength', '260'); // TODO: Make constant? Change value?
        this.textArea.setAttribute('data-i18n', DEFAULT_TEXT);

        this.onKeyHandlerBinded = this.onKeyHandler.bind(this);
        this.textArea.addEventListener('keydown', this.onKeyHandlerBinded);

        this.styleTextArea = new namespaceUtils.DomElementStyle(); // TODO: Move this to EditMode.
        this.styleTextArea
            .setAttribute('position', 'absolute')
            .setAttribute('overflow-y', 'hidden');

        // Helper div to measure text width
        this.measureDiv = document.createElement('div');

        // Become an event dispatcher
        namespaceUtils.addTraitEventDispatcher(this);

        this.onResizeBinded = this.onWindowResize.bind(this);
    }

    var proto = EditorTextInput.prototype;

    proto.destroy = function() {

        this.textArea.removeEventListener('keydown', this.onKeyHandlerBinded);
        this.setInactive();
    };

    /**
     * Initializes itself given an Label Markup (textMarkup)
     * @param {Object} textMarkup
     * @param {Boolean} firstEdit - Whether the markup is being edited for the first time.
     */
    proto.setActive = function(textMarkup, firstEdit) {

        if (this.textMarkup === textMarkup) {
            return;
        }


        var placeholderText = Autodesk.Viewing.i18n.translate(DEFAULT_TEXT);
        this.textArea.setAttribute('placeholder', placeholderText);

        this.setInactive();
        this.parentDiv.appendChild(this.textArea);
        this.textMarkup = textMarkup;
        this.firstEdit = firstEdit || false;
        this.initFromMarkup();

        // Component breaks when resizing. Thus, we force close it
        window.addEventListener('resize', this.onResizeBinded);

        // On iOS this doesn't work quite well, the keyboard will dismiss after call focus programatically.
        // http://stackoverflow.com/questions/32407185/wkwebview-cant-open-keyboard-for-input-field
        if (!Autodesk.Viewing.isIOSDevice()) {
          // Focus on next frame
          var txtArea = this.textArea;
          window.requestAnimationFrame(function(){
              txtArea.focus();
          });
        }
    };

    /**
     * Closes the editor text input and goes back into normal markup edition mode.
     */
    proto.setInactive = function() {
        // In iOS10, the keyboard always show on screen after tap screen out of text
        // area or save markup to end text edit, call blur to make sure keyboard dismiss.
        if (Autodesk.Viewing.isIOSDevice())
        {
            this.textArea.blur();
        }

        window.removeEventListener('resize', this.onResizeBinded);

        if (this.textMarkup) {
            this.textMarkup = null;
            this.parentDiv.removeChild(this.textArea);
        }
        this.style = null;
    };

    proto.isActive = function() {

        return !!this.textMarkup;
    };

    /**
     * Applies Markup styles to TextArea used for editing.
     * It also saves a copy of the style object.
     * @private
     */
    proto.initFromMarkup = function() {

        var markup = this.textMarkup;
        var position = markup.getClientPosition(),
            size = markup.getClientSize();

        var left = position.x - size.x * 0.5;
        var top = position.y - size.y * 0.5;

        var lineHeightPercentage = markup.lineHeight + "%";
        this.styleTextArea.setAttribute('line-height', lineHeightPercentage);

        this.setPosAndSize(left, top, size.x, size.y);
        this.setStyle(markup.getStyle());
        this.textArea.value = markup.getText();
    };

    proto.setPosAndSize = function(left, top, width, height) {

        // We also check here that it doesn't overflow out of the canvas
        if (left + width >= this.editor.viewer.container.clientWidth) {
            left = this.editor.viewer.container.clientWidth - (width + 10);
        }
        if (top + height >= this.editor.viewer.container.clientHeight) {
            top = this.editor.viewer.container.clientHeight - (height + 10);
        }

        // Make sure text input left side always in the canvas area.
        // Especially on iPhone6 & iPhone7
        if (left < 5) {
            left = 5;
            width = this.editor.viewer.container.clientWidth - 10;
        }

        this.styleTextArea
            // Size and position
            .setAttribute('left', left + 'px')
            .setAttribute('top', top + 'px')
            .setAttribute('width', width + 'px')
            .setAttribute('height', height + 'px');
    };

    proto.setStyle = function(style) {

        if (this.style) {
            // An already present style means that the user
            // has changed the style using the UI buttons.
            // We need to account for the user having changed the
            // width/height of the TextArea. Since there is no event
            // we can detect for it, we do it here.
            var temp = {};
            this.injectSizeValues(temp);
            this.setPosAndSize(
                temp.newPos.x - temp.width * 0.5,
                temp.newPos.y - temp.height * 0.5,
                temp.width, temp.height);
        }
        var fontHeight = this.editor.sizeFromMarkupsToClient(0, style['font-size']).y;
        var textAreaStyle = this.styleTextArea
            // Visuals
            .setAttribute('color', style['stroke-color'])
            .setAttribute('font-family', style['font-family'])
            .setAttribute('font-size', fontHeight + 'px')
            .setAttribute('font-weight', style['font-weight'])
            .setAttribute('font-style', style['font-style'])
            .getStyleString();
        this.textArea.setAttribute('style', textAreaStyle);
        this.style = namespaceUtils.cloneStyle(style);
    };

    /**
     * Helper function that, for a given markup with some text in it
     * returns an Array of lines in it.
     * @param {Object} markup
     * @returns {{text, lines}|{text: String, lines: Array.<String>}}
     */
    proto.getTextValuesForMarkup = function(markup) {

        var active = this.isActive();
        var activeMarkup = this.textMarkup;
        var activeFirstEdit = this.firstEdit;

        this.setActive(markup, false);
        var textValues = this.getTextValues();

        if (active) {
            this.setActive(activeMarkup, activeFirstEdit);
        } else {
            this.setInactive();
        }

        return textValues;
    };

    /**
     * Returns the current text as one string and an array of lines
     * of how the text is being rendered (1 string per line)
     * @returns {{text: String, lines: Array.<String>}}
     */
    proto.getTextValues = function() {

        var newText = this.textArea.value;
        if (newText === DEFAULT_TEXT) {
            newText = '';
        }
        return {
            text: newText,
            lines: this.generateLines()
        };
    };

    /**
     * Function called by UI
     */
    proto.acceptAndExit = function() {

        // If placeholder text, then remove.
        var textValues = this.getTextValues();

        var dataBag = {
            markup: this.textMarkup,
            style: this.style,
            firstEdit: this.firstEdit,
            newText: textValues.text,
            newLines: textValues.lines
        };
        this.injectSizeValues(dataBag);
        this.dispatchEvent({ type: this.EVENT_TEXT_CHANGE, data: dataBag });
        this.setInactive(); // Do this last //
    };

    /**
     * Injects position, width and height of the textarea rect
     * @param {Object} dataBag
     * @private
     */
    proto.injectSizeValues = function(dataBag) {

        // Explicit usage of parseFloat to remove the 'px' suffix.
        var width = parseFloat(this.textArea.style.width);
        var height = parseFloat(this.textArea.style.height);
        var ox = parseFloat(this.textArea.style.left);
        var oy = parseFloat(this.textArea.style.top);

        dataBag.width = width;
        dataBag.height = height;
        dataBag.newPos = {
            x: ox + (width * 0.5),
            y: oy + (height * 0.5)
        };
    };

    /**
     * Handler for when the window gets resized
     * @param {Object} event - Window resize event
     * @private
     */
    proto.onWindowResize = function(event) {
        window.requestAnimationFrame(function(){
            var str = this.textArea.value;
            this.style = null; // TODO: Revisit this code because style changes are lost by doing this.
            this.initFromMarkup();
            this.textArea.value = str;
        }.bind(this));
    };

    proto.onKeyHandler = function(event) {
        var keyCode = event.keyCode;
        var shiftDown = event.shiftKey;

        // We only allow RETURN when used along with SHIFT
        if (!shiftDown && keyCode === 13) { // Return
            event.preventDefault();
            this.acceptAndExit();
        }
    };

    /**
     * Grabs the text content of the textarea and returns
     * an Array of lines.  Wrapped lines are returned as 2 lines.
     */
    proto.generateLines = function() {

        // First, get lines separated by line breaks:
        var textContent = this.textArea.value;
        var linesBreaks = textContent.split(/\r*\n/);

        var styleMeasureStr = this.styleTextArea.clone()
            .removeAttribute(['top', 'left', 'width', 'height', 'overflow-y'])
            .setAttribute('position','absolute')
            .setAttribute('white-space','nowrap')
            .setAttribute('float','left')
            .setAttribute('visibility','hidden')
            .getStyleString();
        this.measureDiv.setAttribute('style', styleMeasureStr);
        this.parentDiv.appendChild(this.measureDiv);

        var maxLineLength = parseFloat(this.textArea.style.width);

        // Now check whether the lines are wrapped.
        // If so, subdivide into other lines.
        var linesOutput = [];

        for (var i= 0, len = linesBreaks.length; i<len; ++i) {
            var line = trimRight(linesBreaks[i]);
            this.splitLine(line, maxLineLength, linesOutput);
        }

        this.parentDiv.removeChild(this.measureDiv);
        return linesOutput;
    };

    /**
     * Given a String that represents one line of text that is
     * longer than the max length a line is allowed, this method
     * cuts text into several ones that are no longer than the max
     * length.
     *
     * @param {String} text
     * @param {Number} maxLength
     * @param {Array} output
     * @private
     */
    proto.splitLine = function(text, maxLength, output) {

        // End condition
        if (text === '') {
            return;
        }

        var remaining = '';
        var done = false;

        while (!done){
            this.measureDiv.innerHTML = text;
            var lineLen = this.measureDiv.clientWidth;
            if (lineLen <= maxLength) {
                output.push(text);
                this.splitLine(trimLeft(remaining), maxLength, output);
                done = true;
            } else {
                // Need to try with a shorter word!
                var parts = this.getShorterLine(text);
                if (parts.length === 1) {
                    // text is only one word that is way too long.
                    this.splitWord(text, remaining, maxLength, output);
                    done = true;
                } else {
                    text = parts[0];
                    remaining = parts[1] + remaining;
                }
            }
        }
    };

    /**
     * Given a line of text such as "hi there programmer", it returns
     * an array with 2 parts: ["hi there", " programmer"].
     *
     * It accounts for special cases with multi-spaces, such as for
     * "hi there  two-spaces" returns ["hi there", "  two-spaces"]
     *
     * When there is only one word, it returns the whole word:
     * "JustOneWord" returns ["JustOneWord"] (an array of 1 element)
     *
     * @param {String} line
     * @returns {Array}
     */
    proto.getShorterLine = function(line) {

        // TODO: Account for TABs
        // Will probably never do unless a bug is reported.

        var iLastSpace = line.lastIndexOf(' ');
        if (iLastSpace === -1) {
            return [line]; // This is a single word
        }

        // Else
        // Iterate back removing additional spaces (multi spaces)
        while (line.charAt(iLastSpace-1) === ' ') {
            iLastSpace--
        }

        var trailingWord = line.substr(iLastSpace); // Contains the spaces
        var shorterLine = line.substr(0,iLastSpace);
        return [shorterLine, trailingWord];
    };

    /**
     * Given a single word, splits it into multiple lines that fits in maxWidth
     * @param {String} word
     * @param {String} remaining
     * @param {Number} maxLength
     * @param {Array} output
     */
    proto.splitWord = function(word, remaining, maxLength, output) {

        var lenSoFar = 1;
        var fits = true;
        while (fits) {

            var part = word.substr(0,lenSoFar);
            this.measureDiv.innerHTML = part;
            var lineLen = this.measureDiv.clientWidth;

            if (lineLen > maxLength) {

                if (lenSoFar === 1) {
                    // we can't split 1 character any longer.
                    output.push(part);
                    this.splitWord(word.substr(1), remaining, maxLength, output);
                    return;
                }

                // It was fine until one less char //
                var okayWord = word.substr(0,lenSoFar-1);
                output.push(okayWord);
                var extraWord = word.substr(lenSoFar-1);
                this.splitLine(extraWord + remaining, maxLength, output);
                return;
            }

            // Try one more character
            lenSoFar++;

            // Check if we are done with all characters
            if (lenSoFar > word.length) {
                // Okay it fits
                output.push(word);
                return;
            }
        }
    };

    function trimRight(text) {
        if (text.length === 0) {
            return "";
        }
        var lastNonSpace = text.length-1;
        for (var i=lastNonSpace; i>=0; --i) {
            if (text.charAt(i) !== ' ') {
                lastNonSpace = i;
                break;
            }
        }
        return text.substr(0, lastNonSpace+1);
    }

    function trimLeft(text) {
        if (text.length === 0) {
            return "";
        }
        var firstNonSpace = 0;
        for (var i=0; i<text.length; ++i) {
            if (text.charAt(i) !== ' ') {
                firstNonSpace = i;
                break;
            }
        }
        return text.substr(firstNonSpace);
    }

    namespace.EditorTextInput = EditorTextInput;

})();
