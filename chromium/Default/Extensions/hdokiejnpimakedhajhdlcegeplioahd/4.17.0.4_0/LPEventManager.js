LPEventManager=function(){var n=this,e={};n.addEventListener=function(n,t){var r=e[n];r||(r=e[n]=[]),r.push(t)},n.removeEventListener=function(n,t){var r=e[n];if(r)for(var i=0;i<r.length;++i)if(r[i]===t)return void r.splice(i,1)},n.addEventListenerOnce=function(e,t){var r=function(){n.removeEventListener(e,r),t.apply(this,arguments)};n.addEventListener(e,r)},n.publishEvent=function(n,t){var r=e[n];if(r)for(var i=0;i<r.length;++i)try{r[i](t)}catch(n){}}};
//# sourceMappingURL=sourcemaps/LPEventManager.js.map
