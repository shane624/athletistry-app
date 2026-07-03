// Server-rendered splash that paints with the very first HTML (no JS needed), so
// the app never shows a blank white screen on a cold first load. A tiny inline
// script hides it as soon as the page is ready (with a short minimum so it isn't
// a flash), shows only once per browser session, and never hangs past a safety
// timeout. No React/hydration dependency.
export default function InitialSplash() {
  const js = `(function(){try{
    var s=document.getElementById('app-splash');if(!s)return;
    var gone=false;
    var hide=function(){if(gone||!s)return;gone=true;s.style.opacity='0';setTimeout(function(){if(s&&s.parentNode)s.parentNode.removeChild(s);s=null;},400);};
    if(sessionStorage.getItem('athl_splash_seen')==='1'){if(s.parentNode)s.parentNode.removeChild(s);return;}
    sessionStorage.setItem('athl_splash_seen','1');
    var start=Date.now(),MIN=350;
    var ready=function(){setTimeout(hide,Math.max(0,MIN-(Date.now()-start)));};
    // dismiss as soon as the DOM is parsed — do NOT wait for every image/video
    if(document.readyState==='interactive'||document.readyState==='complete')ready();
    else document.addEventListener('DOMContentLoaded',ready,{once:true});
    setTimeout(hide,2500);
  }catch(e){var x=document.getElementById('app-splash');if(x&&x.parentNode)x.parentNode.removeChild(x);}})();`;

  return (
    <>
      <div id="app-splash" aria-hidden="true">
        <img src="/icon-192.png" alt="" width={88} height={88} />
        <span id="app-splash-word">ATHLETISTRY</span>
        <span id="app-splash-bar"><span /></span>
      </div>
      <script dangerouslySetInnerHTML={{ __html: js }} />
    </>
  );
}
