/* GENESIS MODULE — src/ui/chrome.js — app chrome: showTab (panel switch + per-tab render dispatch) + toast
   Carved from genesis.html monolith on 2026-06-20 (Pass 5, logic-by-domain). Classic <script>, shared global scope. */

function showTab(t){
  document.querySelectorAll(".panel").forEach(p=>p.classList.remove("active"));
  document.querySelectorAll(".rail button").forEach(b=>b.classList.remove("active"));
  document.getElementById("panel-"+t).classList.add("active");
  const navBtn=document.getElementById("tab-"+(t==="genesis"?"universe":t));if(navBtn)navBtn.classList.add("active");
  const wrap=document.querySelector(".wrap");if(wrap){wrap.classList.toggle("immersive",t==="bardo"||t==="genesis"||t==="charge"||t==="start");
    wrap.classList.toggle("ingame",t==="world");}  // chat-first World view brings its own icon rail (§9)
  const tb=document.getElementById("tbHere");if(tb)tb.textContent=({start:"Title",universe:"Worlds",world:"Play",oracle:"Oracle",genesis:"World-Genesis",charge:"Soul",bardo:"Soul-Forging"}[t])||t;
  if(t==="start")renderStart();
  if(t==="universe")renderShelf();
  if(t==="world")renderWorld();
  if(t==="charge"&&GS.CGEN)renderCharge();
  if(t==="oracle")renderOracle();
  if(t==="bardo")renderBardo();
}
let toastTimer;
function toast(msg){const el=document.getElementById("toast");el.textContent=msg;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2400);}
