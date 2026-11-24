import '../vendor/md3e-web.js';

// Some mobile browsers download PDFs when navigating directly to the file.
const mobileDocumentViewer =
 navigator.userAgentData?.mobile ||
 /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
 (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

if (mobileDocumentViewer) {
 for (const button of document.querySelectorAll('#cv-view, [data-certificate]')) {
  const pdf = new URL(button.getAttribute('href'), document.baseURI);
  const viewer = new URL('../vendor/pdfjs/web/viewer.html', import.meta.url);
  viewer.searchParams.set('file', pdf.pathname + pdf.search);
  button.setAttribute('href', viewer.href);
 }
}

const detailButton=document.getElementById('automation-detail');
const detailPanel=document.getElementById('automation-details');
const detailInner=detailPanel.querySelector('.automation-expand-inner');
let detailOpen=false;
detailButton.setAttribute('aria-expanded','false');
detailButton.setAttribute('aria-controls','automation-details');
function syncDetail(){detailPanel.style.height=detailOpen?`${detailInner.getBoundingClientRect().height}px`:'0px';}
detailButton.addEventListener('click',()=>{detailOpen=!detailOpen;detailPanel.inert=!detailOpen;detailButton.setAttribute('aria-expanded',String(detailOpen));syncDetail();});
new ResizeObserver(()=>{if(detailOpen)syncDetail();}).observe(detailInner);

// MD3E's multi-aspect layout masks entering and leaving items on both edges.
const cycleRows=new Map();
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
function finishCycle(row){
 const state=cycleRows.get(row);if(!state.ready||state.dragging)return;
 clearTimeout(state.fallback);state.rebasing=true;
 const stride=row.shadowRoot.querySelector('.item').offsetWidth+row.itemSpacing;
 const current=state.target??Math.floor((row._scroll+0.5)/stride);let central=current;
 while(central<6)central+=4;while(central>9)central-=4;
 // Version-pinned adapter: preserve the native list's fractional offset at wrap.
 if(central!==current)row._scrollBy((central-current)*stride);
 state.index=central;state.target=null;state.rebasing=false;state.busy=false;
 row.setAttribute('aria-busy','false');row.dataset.cycleIndex=String(state.index);
 if(state.queue.length)moveCycle(row,state.queue.shift());
}
function moveCycle(row,delta){
 const state=cycleRows.get(row);if(!state.ready)return;
 if(state.busy){state.queue.push(delta);return;}
 state.busy=true;state.target=state.index+delta;row.setAttribute('aria-busy','true');
 row.animateScrollToItem(state.target);
 if(reducedMotion.matches)requestAnimationFrame(()=>finishCycle(row));
 else state.fallback=setTimeout(()=>finishCycle(row),1800);
}
function sizeCycleRows(){for(const row of cycleRows.keys()){
 const width=row.clientWidth;row.style.setProperty('--article-width',`${innerWidth<=780?width-34:width*.405}px`);
}}
for(const row of document.querySelectorAll('md-carousel')){
 const originals=[...row.children];originals.forEach((article,index)=>article.dataset.articleId=String(index));
 const copies=document.createDocumentFragment();for(let cycle=1;cycle<4;cycle++)for(const article of originals)copies.append(article.cloneNode(true));row.append(copies);
 const state={index:row.id==='articles-top'?6:8,target:null,queue:[],ready:false,busy:false,dragging:false,rebasing:false,fallback:0};cycleRows.set(row,state);
 const previous=row.parentElement.querySelector('.prev'),next=row.parentElement.querySelector('.next');
 for(const button of [previous,next]){button.disabled=false;button.elevation=null;}
 previous.addEventListener('click',()=>moveCycle(row,-2));next.addEventListener('click',()=>moveCycle(row,2));
 row.addEventListener('settle',event=>{if(event.target===row)finishCycle(row);});
 row.addEventListener('change',event=>{if(event.target===row&&!state.rebasing&&!state.busy)state.index=event.detail.index;});
 row.addEventListener('pointerdown',()=>{if(!state.ready)return;clearTimeout(state.fallback);state.busy=false;state.target=null;state.dragging=true;},{passive:true});
 for(const name of ['pointerup','pointercancel'])row.addEventListener(name,()=>{state.dragging=false;state.fallback=setTimeout(()=>finishCycle(row),1800);},{passive:true});
 row.addEventListener('wheel',event=>{
  const horizontal=Math.abs(event.deltaX)>Math.abs(event.deltaY)||event.shiftKey;
  if(!horizontal||!(event.deltaX||event.deltaY)||!state.ready)return;
  // Normalize large wheel deltas before native finite bounds can consume them.
  event.preventDefault();event.stopPropagation();row._stopMotion();
  clearTimeout(state.fallback);state.target=null;state.busy=false;state.queue.length=0;
  const stride=row.shadowRoot.querySelector('.item').offsetWidth+row.itemSpacing;
  const current=Math.floor((row._scroll+0.5)/stride),central=4+((current%4)+4)%4;
  state.rebasing=true;row._scrollBy((central-current)*stride);state.rebasing=false;
  const unit=event.deltaMode===1?16:event.deltaMode===2?row.clientWidth:1;
  const raw=(Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.deltaY)*unit;
  row._scrollBy(raw%(4*stride));finishCycle(row);
 },{capture:true,passive:false});
}
async function initializeCycles(){
 await customElements.whenDefined('md-carousel');
 await Promise.all([...document.querySelectorAll('md-carousel img')].map(img=>img.decode().catch(()=>{})));
 sizeCycleRows();await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);
 for(const [row,state] of cycleRows){
  row.scrollToItem(state.index);state.ready=true;row.setAttribute('aria-busy','false');row.dataset.cycleIndex=String(state.index);
  [...row.shadowRoot.querySelectorAll('.item')].forEach((item,index)=>item.setAttribute('aria-label',`${index%4+1} / 4`));
 }
}
initializeCycles();window.addEventListener('resize',sizeCycleRows);

const nav=document.querySelector('.nav'),navLinks=[...document.querySelectorAll('.nav-actions md-button,.mobile-nav md-button')],sectionIds=['projeler','deneyim','yazilar','egitim','iletisim'];let navigationFrame=0;
function updateNavigation(){navigationFrame=0;nav.classList.toggle('is-scrolled',scrollY>24);const line=nav.getBoundingClientRect().bottom+100;let active=null;for(const id of sectionIds){const section=document.getElementById(id);if(section&&section.getBoundingClientRect().top<=line)active=id;}if(innerHeight+scrollY>=document.documentElement.scrollHeight-60)active='iletisim';for(const link of navLinks){const selected=link.getAttribute('href')==='#'+active;link.setAttribute('variant',selected?'tonal':'text');if(selected)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');}}
function scheduleNavigation(){if(!navigationFrame)navigationFrame=requestAnimationFrame(updateNavigation);}
window.addEventListener('scroll',scheduleNavigation,{passive:true});window.addEventListener('resize',scheduleNavigation);window.addEventListener('load',scheduleNavigation,{once:true});updateNavigation();

// X currently aliases createVideo to createTweet. Use the user's approved full-post fallback.
function initializeProjectVideos(){
 const widgets=window.twttr?.widgets;if(!widgets?.createTweet)return;
 for(const host of document.querySelectorAll('[data-video-post]')){
  widgets.createTweet(host.dataset.videoPost,host.querySelector('.x-video-mount'),{width:550,dnt:true,conversation:'none',lang:'tr'}).then(player=>{
   if(player){host.classList.add('is-loaded');host.querySelector('.video-poster').hidden=true;}
  }).catch(()=>{});
 }
}
window.twttr=window.twttr||{_e:[],ready(callback){this._e.push(callback);}};
window.twttr.ready(initializeProjectVideos);
