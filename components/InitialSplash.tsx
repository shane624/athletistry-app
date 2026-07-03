// Server-rendered splash that paints with the very first HTML (no JS needed), so
// the app never shows a blank white screen on a cold first load. A tiny inline
// script hides it as soon as the page is ready (with a short minimum so it isn't
// a flash), shows only once per browser session, and never hangs past a safety
// timeout. No React/hydration dependency.
export default function InitialSplash() {
  const js = `(function(){try{
    var s=document.getElementById('app-splash');if(!s)return;
    var gone=false;
    var hide=function(){if(gone)return;gone=true;var el=document.getElementById('app-splash');if(!el)return;el.style.opacity='0';setTimeout(function(){if(el&&el.parentNode)el.parentNode.removeChild(el);},400);};
    // Purely cosmetic cover for the first paint — dismiss on a short, unconditional
    // timer so it can never stick, whatever else the page is doing.
    if(sessionStorage.getItem('athl_splash_seen')==='1'){hide();return;}
    sessionStorage.setItem('athl_splash_seen','1');
    setTimeout(hide,900);
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
