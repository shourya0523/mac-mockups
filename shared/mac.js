/* Shared router + renderers. Each mockup styles the sf-* (storefront) and pf-* (profile) classes. */
(function(){
const M=window.MAC,K=M.pillarKeys,L=M.pillarLabels;
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
M.ta=id=>M.tas.find(t=>t.id===id);
M.ring=(v,size=76,stroke=7)=>{const r=(size-stroke)/2,c=2*Math.PI*r;return `<span class="sc-ring" style="width:${size}px;height:${size}px" role="img" aria-label="MASM score ${v} out of 100"><svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke-width="${stroke}" class="sc-track"/><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke-width="${stroke}" stroke-linecap="round" class="sc-fill" stroke-dasharray="${c}" stroke-dashoffset="${c-(v/100)*c}" transform="rotate(-90 ${size/2} ${size/2})"/></svg><b>${v}</b></span>`};
M.bar=(s)=>s==null?'':`<span class="sc-bar"><i style="width:${s}%"></i></span><em class="sc-num">${s}</em>`;
M.link=(id)=>`#/profile/${id}`;

/* ---------- storefront ---------- */
M.store=function(root){
  const st={cat:'all',tier:null,sort:'masm',cmp:new Set()};
  const S=M.storefront;
  root.innerHTML=`
  <div class="sf-toolbar">
    <div class="sf-group" role="group" aria-label="Filter by category"><span class="sf-lbl">Filter</span>
      <button class="sf-chip" aria-pressed="true" data-cat="all">All</button>${S.cats.map(c=>`<button class="sf-chip" aria-pressed="false" data-cat="${c}">${c}</button>`).join('')}</div>
    <div class="sf-group" role="group" aria-label="Filter by tier">
      <button class="sf-chip sf-tier" aria-pressed="false" data-tier="High"><i class="dot hi"></i>High Tier</button>
      <button class="sf-chip sf-tier" aria-pressed="false" data-tier="Moderate"><i class="dot mod"></i>Moderate Tier</button></div>
    <label class="sf-sort">Sort by <select><option value="masm">MASM Score</option><option value="name">TA Name</option>${K.map(k=>`<option value="${k}">${L[k]}</option>`).join('')}</select></label>
  </div>
  <div class="sf-list"></div>
  <div class="sf-cmpbar" hidden><span></span><button class="sf-btn sf-cmp-go">Compare</button><button class="sf-btn ghost sf-cmp-clear">Clear</button></div>
  <div class="sf-compare" hidden></div>`;
  const list=root.querySelector('.sf-list'),bar=root.querySelector('.sf-cmpbar'),cmpEl=root.querySelector('.sf-compare');
  function draw(){
    let rows=M.tas.filter(t=>(st.cat==='all'||t.cat===st.cat)&&(!st.tier||t.tier===st.tier));
    rows.sort((a,b)=>st.sort==='masm'?b.masm-a.masm:st.sort==='name'?a.name.localeCompare(b.name):(b.pillars[st.sort].s??-1)-(a.pillars[st.sort].s??-1));
    list.innerHTML=rows.length?rows.map(t=>`
    <article class="sf-card">
      <div class="sf-score">${M.ring(t.masm)}<span class="sf-tierb ${t.tier==='High'?'hi':'mod'}">${t.tier} Tier</span></div>
      <div class="sf-main">
        <div class="sf-meta">${t.cat} · Updated ${t.updated}</div>
        <h3><a href="${M.link(t.id)}">${t.name} (${t.abbr})</a></h3>
        <p>${t.short}</p>
      </div>
      <dl class="sf-pillars">${K.map(k=>`<div title="${esc(S.tips[k])}"><dt>${L[k]}</dt><dd><span class="sf-val">${t.pillars[k].v}</span>${M.bar(t.pillars[k].s)}</dd></div>`).join('')}</dl>
      <div class="sf-act"><a class="sf-btn" href="${M.link(t.id)}">View ${t.abbr} profile</a>
        <label class="sf-check"><input type="checkbox" data-cmp="${t.id}" ${st.cmp.has(t.id)?'checked':''}> Compare</label></div>
    </article>`).join(''):`<div class="sf-empty"><b>No ${st.cat==='all'?'':esc(st.cat)+' '}profiles match these filters yet.</b> <button class="sf-link sf-reset">Show all profiles</button> or <a href="#contact">request a profile</a>.</div>`;
    bar.hidden=st.cmp.size<2;bar.querySelector('span').textContent=`${st.cmp.size} selected`;
  }
  function compare(){
    const ts=[...st.cmp].map(M.ta);
    cmpEl.hidden=false;
    cmpEl.innerHTML=`<div class="sf-cmp-head"><h3>Side-by-side MASM pillar analysis</h3><button class="sf-btn ghost sf-cmp-close">Close comparison</button></div>
    <div class="sf-scroll"><table><thead><tr><th scope="col">Pillar</th>${ts.map(t=>`<th scope="col">${t.abbr}</th>`).join('')}</tr></thead><tbody>
    <tr><th scope="row">MASM Score</th>${ts.map(t=>`<td><b>${t.masm}</b>/100</td>`).join('')}</tr>
    ${K.map(k=>`<tr><th scope="row">${L[k]}</th>${ts.map(t=>`<td>${t.pillars[k].v}${t.pillars[k].s!=null?` <b>(${t.pillars[k].s})</b>`:''}</td>`).join('')}</tr>`).join('')}
    <tr><th scope="row">Tier</th>${ts.map(t=>`<td>${t.tier}</td>`).join('')}</tr></tbody></table></div>`;
    cmpEl.scrollIntoView({behavior:'smooth',block:'start'});
  }
  root.addEventListener('click',e=>{
    const c=e.target.closest('[data-cat]'),r=e.target.closest('[data-tier]');
    if(c){st.cat=c.dataset.cat;root.querySelectorAll('[data-cat]').forEach(b=>b.setAttribute('aria-pressed',String(b===c)));draw()}
    if(r){st.tier=st.tier===r.dataset.tier?null:r.dataset.tier;root.querySelectorAll('[data-tier]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tier===st.tier)));draw()}
    if(e.target.closest('.sf-reset')){st.cat='all';st.tier=null;root.querySelectorAll('[data-cat]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.cat==='all')));root.querySelectorAll('[data-tier]').forEach(b=>b.setAttribute('aria-pressed','false'));draw()}
    if(e.target.closest('.sf-cmp-go'))compare();
    if(e.target.closest('.sf-cmp-clear')){st.cmp.clear();cmpEl.hidden=true;draw()}
    if(e.target.closest('.sf-cmp-close'))cmpEl.hidden=true;
  });
  root.addEventListener('change',e=>{
    if(e.target.matches('select')){st.sort=e.target.value;draw()}
    if(e.target.dataset.cmp){e.target.checked?st.cmp.add(e.target.dataset.cmp):st.cmp.delete(e.target.dataset.cmp);bar.hidden=st.cmp.size<2;bar.querySelector('span').textContent=`${st.cmp.size} selected`}
  });
  draw();
};

/* ---------- profile ---------- */
M.profile=function(root,id){
  const t=M.ta(id);if(!t){root.innerHTML=`<div class="pf-wrap"><h1>Profile not found</h1><p><a href="#/wayfinder">Back to all therapeutic areas</a></p></div>`;return}
  const i=M.tas.indexOf(t),prev=M.tas[(i-1+M.tas.length)%M.tas.length],next=M.tas[(i+1)%M.tas.length];
  const split=(p)=>`<div class="pf-split" role="img" aria-label="${p.map(x=>x[0]+' '+x[1]+'%').join(', ')}">${p.map((x,j)=>`<span class="s${j}" style="flex:${x[1]}">${x[1]>=15?`${x[0]} (${x[1]}%)`:''}</span>`).join('')}</div>${p.some(x=>x[1]<15)?`<p class="pf-legend">${p.filter(x=>x[1]<15).map(x=>`${x[0]} (${x[1]}%)`).join(', ')}</p>`:''}`;
  root.innerHTML=`
  <div class="pf-wrap">
  <nav class="pf-crumb" aria-label="Breadcrumb"><a href="#/">Michael Allen Company</a> / <a href="#/products">Digital Products</a> / <a href="#/wayfinder">WayFinder Horizon</a> / <span aria-current="page">${t.abbr}</span></nav>
  <header class="pf-head">
    <div class="pf-title"><div class="pf-kicker">Therapeutic Area Overview · ${t.cat}</div><h1>${t.name} (${t.abbr})</h1><div class="pf-updated">Last Updated: ${t.updated}</div></div>
    <div class="pf-masm">${M.ring(t.masm,112,10)}<div><div class="pf-masm-l">MASM Attractiveness</div><span class="sf-tierb ${t.tier==='High'?'hi':'mod'}">${t.tier} Tier</span><p>${M.tiers[t.tier]}</p></div></div>
  </header>
  <div class="pf-pillars">${K.map(k=>`<section class="pf-pillar"><h2>${L[k]}</h2><div class="pf-pv">${t.pillars[k].v}</div>${t.pillars[k].s!=null?`<div class="pf-pbar">${M.bar(t.pillars[k].s)}</div>`:''}<p>${t.pillars[k].d}</p></section>`).join('')}</div>
  <section class="pf-sec pf-exec"><h2>Executive Summary</h2>${t.summary.map(p=>`<p>${p}</p>`).join('')}</section>
  <section class="pf-sec"><h2><span class="pf-n">1.</span> ${t.s1}</h2>
    <h3 class="pf-h3">Real-World Data Signals</h3>
    <div class="pf-stats">${t.stats.map(s=>`<div class="pf-stat"><b>${s.v}</b><span>${s.l}</span><small>Source: ${s.src}</small></div>`).join('')}</div>
    <div class="pf-two"><div><h3 class="pf-h3">${t.split.t}</h3>${split(t.split.parts)}<p class="pf-note">${t.split.note}</p></div>
      <div><h3 class="pf-h3">${t.tags.t}</h3><ul class="pf-tags">${t.tags.items.map(x=>`<li>${x}</li>`).join('')}</ul><h3 class="pf-h3">${t.tags2.t}</h3><ul class="pf-tags alt">${t.tags2.items.map(x=>`<li>${x}</li>`).join('')}</ul></div></div>
    <aside class="pf-insight"><b>Biotech Insight:</b> ${t.insight}</aside></section>
  <section class="pf-sec"><h2><span class="pf-n">2.</span> Unmet Need: ${t.s2}</h2>
    <div class="pf-cards">${t.unmet.map(u=>`<article class="pf-card"><h3>${u.t}</h3><p>${u.d}</p>${u.src?`<small>Source: ${u.src}</small>`:''}</article>`).join('')}</div></section>
  <section class="pf-sec"><h2><span class="pf-n">3.</span> Clinical Pipeline & Scenarios</h2><p class="pf-lead">${t.pipeLead}</p>
    <div class="pf-scroll"><table class="pf-table"><thead><tr><th scope="col">Asset</th><th scope="col">Mechanism</th><th scope="col">Company</th><th scope="col">Status</th><th scope="col">Note</th></tr></thead><tbody>
    ${t.pipeline.map(p=>`<tr><th scope="row">${p[0]}</th><td>${p[1]}</td><td>${p[2]}</td><td><span class="pf-phase">${p[3]}</span></td><td>${p[4]}</td></tr>`).join('')}</tbody></table></div>
    <h3 class="pf-h3">Treatment Algorithm Paradigm</h3>
    <div class="pf-algo">${t.algo.rows.map(r=>`<div class="pf-algo-row">${r.filter(Boolean).map(c=>`<span>${c}</span>`).join('<i aria-hidden="true">›</i>')}</div>`).join('')}</div><p class="pf-note">*${t.algo.note}</p>
    <div class="pf-gate"><div><b>Unlock Complete Pipeline & TPP Insights</b><p>Selected assets shown. The full watchlist and hypothetical TPP scenarios are available to WayFinder Horizon clients.</p></div><a class="sf-btn" href="#pf-contact">Request full access</a></div></section>
  <section class="pf-sec"><h2><span class="pf-n">4.</span> Payer Restriction: ${t.s4}</h2>
    <div class="pf-cards">${t.payer.map(u=>`<article class="pf-card"><h3>${u.t}</h3><p>${u.d}</p></article>`).join('')}</div>
    <h3 class="pf-h3">US Payer Mix (Est.)</h3>${split(t.mix.parts)}<p class="pf-note">${t.mix.note}</p></section>
  <section class="pf-sec"><h2>WayFinder Strategic Radar</h2><p class="pf-lead">Catalysts & Environment</p>
    <div class="pf-radar">${t.radar.map(r=>`<article><div class="pf-rk">${r.k}</div><h3>${r.t}</h3><p>${r.d}</p></article>`).join('')}</div></section>
  <section class="pf-sec pf-follow" id="pf-contact"><h2>Got additional questions about ${t.name} (${t.abbr})?</h2><p class="pf-lead">For custom asset deep-dives or patient journey mapping, we design and deliver targeted commercial insights on a rapid timeline.</p>
    <div class="pf-cards three">${M.followUp.map(f=>`<article class="pf-card"><h3>${f.t}</h3><p>${f.d}</p></article>`).join('')}</div>
    <p><a class="sf-btn" href="mailto:${M.company.contact.email}">Contact Us</a></p></section>
  <nav class="pf-pager" aria-label="Other profiles"><a href="${M.link(prev.id)}">Previous: ${prev.name}</a><a href="#/wayfinder">All therapeutic areas</a><a href="${M.link(next.id)}">Next: ${next.name}</a></nav>
  <p class="pf-legal">© 2026 Michael Allen Company. Proprietary & Confidential.</p>
  </div>`;
};

/* ---------- router ---------- */
M.route=function(e){
  if(e&&location.hash&&!location.hash.startsWith('#/'))return; /* plain in-page anchor */
  const h=((location.hash||'').startsWith('#/')?location.hash:'#/').replace(/^#\/?/,'');const [a,b]=h.split('/');
  const view=a==='products'?'hub':a==='wayfinder'?'wayfinder':a==='profile'?'profile':'company';
  document.querySelectorAll('[data-view]').forEach(v=>v.hidden=v.dataset.view!==view);
  document.querySelectorAll('[data-nav]').forEach(n=>n.dataset.nav===view||(view==='profile'&&n.dataset.nav==='wayfinder')?n.setAttribute('aria-current','page'):n.removeAttribute('aria-current'));
  if(view==='profile')M.profile(document.querySelector('[data-view="profile"] .pf-root'),b);
  const t=view==='profile'&&M.ta(b);
  document.title=(t?t.abbr+' Market Overview':view==='wayfinder'?'WayFinder Horizon | Therapeutic Area Storefront':view==='hub'?'MAC Digital Intelligence Products':'Michael Allen Company')+' | '+(document.body.dataset.mock||'Mockup');
  window.scrollTo(0,0);
  if(window.onMacRoute)window.onMacRoute(view,b);
};
document.addEventListener('DOMContentLoaded',()=>{document.querySelectorAll('[data-store]').forEach(M.store);M.route()});
addEventListener('hashchange',M.route);
})();
