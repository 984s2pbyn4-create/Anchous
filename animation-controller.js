/* One animation at a time, with explicit lifecycle cleanup. */
(()=>{'use strict';let active=null;
 const clear=()=>{if(!active)return;const old=active;active=null;clearInterval(old.timer);if(old.onStop)old.onStop()};
 const api={
  start(owner,tick,delay,onStop){clear();if(document.hidden||!owner.isConnected)return;const entry={owner,tick,onStop,timer:null};active=entry;entry.timer=setInterval(()=>{if(active!==entry||document.hidden||!owner.isConnected){if(active===entry)clear();return}tick()},delay)},
  stop(owner){if(active&&(!owner||active.owner===owner))clear()},
  isPlaying(owner){return !!active&&active.owner===owner}
 };
 document.addEventListener('visibilitychange',()=>{if(document.hidden)clear()});
 window.addEventListener('pagehide',clear);
 document.addEventListener('DOMContentLoaded',()=>{const app=document.getElementById('app');if(app)new MutationObserver(()=>{if(active&&!active.owner.isConnected)clear()}).observe(app,{childList:true,subtree:true})});
 window.MicroAnimationController=api;
})();
