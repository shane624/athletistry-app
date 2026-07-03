// Server-rendered splash that paints with the very first HTML (no JS needed), so
// the app never shows a blank white screen on a cold first load. A tiny inline
// script hides it as soon as the page is ready (with a short minimum so it isn't
// a flash), shows only once per browser session, and never hangs past a safety
// timeout. No React/hydration dependency.
export default function InitialSplash() {
  const js = `(function(){try{
    var s=document.getElementById('app-splash');if(!s)return;
    if(sessionStorage.getItem('athl_splash_seen')==='1'){s.parentNode&&s.parentNode.removeChild(s);return;}
    sessionStorage.setItem('athl_splash_seen','1');
    var start=Date.now(),MIN=600;
    var hide=function(){s.style.opacity='0';setTimeout(function(){s.parentNode&&s.parentNode.removeChild(s);},450);};
    var ready=function(){setTimeout(hide,Math.max(0,MIN-(Date.now()-start)));};
    if(document.readyState==='complete')ready();else window.addEventListener('load',ready,{once:true});
    setTimeout(hide,6000);
  }catch(e){var x=document.getElementById('app-splash');x&&x.parentNode&&x.parentNode.removeChild(x);}})();`;

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
