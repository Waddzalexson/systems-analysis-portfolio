(function () {
  'use strict';
  const records = JSON.parse(document.getElementById('school-records').textContent || '[]');
  const byId = Object.fromEntries(records.map(s => [s.id, s]));
  const $ = id => document.getElementById(id);
  const apiEnabled = Boolean(document.querySelector('meta[name="demo-api"][content="enabled"]'));
  const state = {saved:new Set(readIds()), compare:new Set(), current:[], view:'all', api:apiEnabled, searchSeq:0};
  const stopwords = new Set(['show','find','want','need','looking','school','schools','the','that','this','with','and','for','from','please','some','which','where','under','below','fees','fee','budget','about','much','cost','many','have','does','offer','offers','child','your','there','are','is','me','can','my','all','information','give','tell','what','how','do','in','of','a','at','to','a','an','ugx','million','shillings']);
  function known(s,k){return (s.verified_fields||[]).includes(k) && s[k]!==null && s[k]!==undefined && s[k]!=='' && (!Array.isArray(s[k])||s[k].length>0)}
  function money(v){return 'UGX '+Number(v).toLocaleString('en-UG')}
  function date(v){if(!v)return 'Not listed';let [y,m,d]=v.split('-').map(Number);return new Date(y,m-1,d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}
  function elm(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined&&text!==null)n.textContent=String(text);return n}
  function safeGet(key){try{return localStorage.getItem(key)}catch(_){return null}}
  function readIds(){try{return JSON.parse(safeGet('eschool-explore-saved-v2')||'[]').filter(x=>typeof x==='string')}catch(_){return []}}
  function persistSaved(){try{localStorage.setItem('eschool-explore-saved-v2',JSON.stringify([...state.saved]))}catch(_){}}
  function toast(message){let n=$('toast');n.textContent=message;n.hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>{n.hidden=true},2800)}
  function updateCounters(){$('saved-count').textContent=state.saved.size;$('compare-count').textContent=state.compare.size}
  function parseBudget(q){const names={one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10};let m=q.match(/(?:under|below|less than|up to|maximum|max|not more than|budget(?:\s+of|\s+is)?|cost(?:s|ing)?\s+under)\s*(?:ugx|shs|shillings)?\s*([\d,.]+|one|two|three|four|five|six|seven|eight|nine|ten)\s*(million|m|thousand|k)?\b/i);if(!m)return null;let n=names[m[1].toLowerCase()]||Number(m[1].replace(/,/g,''));if(!Number.isFinite(n)||n<=0)return null;return n*(/^(m|million)$/i.test(m[2]||'')?1e6:/^(k|thousand)$/i.test(m[2]||'')?1e3:1)}
  function infer(q){const s=(q||'').toLowerCase(), f={};for(const loc of ['Kampala','Wakiso','Entebbe','Jinja'])if(s.includes(loc.toLowerCase()))f.location=loc;
    if(/\bnursery|early years\b/.test(s))f.level='Nursery';else if(/\bprimary\b/.test(s))f.level='Primary';else if(/\bsecondary\b/.test(s))f.level='Secondary';
    if(/\bcambridge\b/.test(s))f.curriculum='Cambridge';else if(/\bnational curriculum\b/.test(s))f.curriculum='Uganda National Curriculum';
    if(/\b(no boarding|non.?boarding|day school|day schools)\b/.test(s))f.boarding=false;else if(/\bboarding\b/.test(s))f.boarding=true;
    if(/\b(admissions open|open for admission|currently admitting|accepting applications)\b/.test(s))f.admissions_open=true;
    const budget=parseBudget(s);if(budget!==null)f.max_annual_fee_ugx=budget;
    return f;
  }
  function getFilters(){const f=infer($('question').value.trim());const loc=$('filter-location').value,level=$('filter-level').value, curr=$('filter-curriculum').value,fee=$('filter-budget').value,board=$('filter-boarding').value,adm=$('filter-admissions').value;
    if(loc)f.location=loc;if(level)f.level=level;if(curr)f.curriculum=curr;if(fee)f.max_annual_fee_ugx=Number(fee);if(board!=='')f.boarding=board==='true';if(adm!=='')f.admissions_open=adm==='true';return f}
  function passes(s,f){for(const [k,v] of Object.entries(f)){let field=k==='level'?'levels':k;if(k==='max_annual_fee_ugx'){if(!known(s,'annual_fee_ugx')||s.annual_fee_ugx>v)return false}else{if(!known(s,field))return false;const got=s[field];if(Array.isArray(got)){if(!got.some(a=>String(a).toLowerCase()===String(v).toLowerCase()))return false}else if(typeof got==='string'){if(got.toLowerCase()!==String(v).toLowerCase())return false}else if(got!==v)return false}}return true}
  function words(q){return (q||'').toLowerCase().split(/[^a-z0-9]+/).filter(w=>w.length>=3&&!stopwords.has(w)&&!/^[0-9]+$/.test(w))}
  function search(){const q=$('question').value.trim(),filters=getFilters(),tok=words(q);const hard=Object.keys(filters).length>0;
    let arr=records.filter(s=>passes(s,filters)).map(s=>{let hay=[s.name,s.location,...s.levels,...s.curriculum,s.description,...(s.highlights||[])].join(' ').toLowerCase();return {school:s,score:tok.reduce((n,w)=>n+(hay.includes(w)?1:0),0)}}).filter(x=>!q||hard||tok.length===0||x.score>0);
    const sort=$('sort-by').value;
    if(sort==='low')arr.sort((a,b)=>(known(a.school,'annual_fee_ugx')?a.school.annual_fee_ugx:Infinity)-(known(b.school,'annual_fee_ugx')?b.school.annual_fee_ugx:Infinity));
    else if(sort==='high')arr.sort((a,b)=>(known(b.school,'annual_fee_ugx')?b.school.annual_fee_ugx:-1)-(known(a.school,'annual_fee_ugx')?a.school.annual_fee_ugx:-1));
    else if(sort==='name')arr.sort((a,b)=>a.school.name.localeCompare(b.school.name));
    else arr.sort((a,b)=>b.score-a.score || (known(b.school,'admissions_open')?Number(b.school.admissions_open):0)-(known(a.school,'admissions_open')?Number(a.school.admissions_open):0) || a.school.name.localeCompare(b.school.name));
    return arr;
  }
  function textTag(label){return elm('span','tag',label)}
  function status(s){if(!known(s,'admissions_open'))return ['Not confirmed','unknown'];return s.admissions_open?['Admissions open','open']:['Admissions closed','closed']}
  function schoolCard(s,index){const card=elm('article','school-card');card.dataset.schoolId=s.id;
    const visual=elm('div','school-visual theme-'+((index%4)+1));const building=elm('span','school-shape');building.append(elm('i'));visual.append(building,elm('span','visual-chip',s.levels[0]+' school'));
    const save=elm('button','card-save'+(state.saved.has(s.id)?' active':''));save.type='button';save.dataset.action='save';save.dataset.id=s.id;save.setAttribute('aria-label',state.saved.has(s.id)?'Remove '+s.name+' from saved schools':'Save '+s.name);save.setAttribute('aria-pressed',String(state.saved.has(s.id)));save.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14v17l-7-4-7 4V4Z"/></svg>';visual.append(save);
    const body=elm('div','card-content');const heading=elm('div','card-heading'),name=elm('div');name.append(elm('h3',null,s.name),elm('div','card-place',s.location));let [label,cls]=status(s);heading.append(name,elm('span','status '+cls,label));body.append(heading);
    const tags=elm('div','card-tags');tags.append(textTag(s.levels[0]),textTag(s.curriculum[0]),textTag(known(s,'boarding')?(s.boarding?'Boarding':'Day school'):'Type not listed'));body.append(tags,elm('p','card-desc',s.description));
    const stats=elm('div','card-stats');const fee=elm('div'),deadline=elm('div');fee.append(elm('small',null,'Annual school fees'),elm('strong',known(s,'annual_fee_ugx')?'': 'missing',known(s,'annual_fee_ugx')?money(s.annual_fee_ugx):'Ask the school'));deadline.append(elm('small',null,'Application deadline'),elm('strong',known(s,'application_deadline')?'':'missing',known(s,'application_deadline')?date(s.application_deadline):'Not listed'));stats.append(fee,deadline);body.append(stats);
    const actions=elm('div','card-actions');const details=elm('button','card-details','View details →');details.type='button';details.dataset.action='details';details.dataset.id=s.id;const compare=elm('button','card-compare'+(state.compare.has(s.id)?' selected':''),state.compare.has(s.id)?'✓ Comparing':'+ Compare');compare.type='button';compare.dataset.action='compare';compare.dataset.id=s.id;compare.setAttribute('aria-pressed',String(state.compare.has(s.id)));actions.append(details,compare);body.append(actions);card.append(visual,body);return card;
  }
  function guideReply(){const res=state.current,filters=getFilters(),q=$('question').value.trim();if(!q&&!Object.keys(filters).length)return 'Explore the schools, then ask me about fees, boarding or application deadlines.';if(!res.length){return 'I couldn’t find a school that matches those choices. Try widening the budget or removing a filter.'}let first=res[0].school, many=res.length>1;let intro=many?`I found ${res.length} schools that fit your search. `:`${first.name} matches your search. `;
    if(Object.keys(filters).length)intro+='The results follow the location, school type and fee information you selected. ';else intro+='You can filter them by fees, curriculum or location. ';
    if(known(first,'annual_fee_ugx'))intro+=`${first.name} lists annual fees of ${money(first.annual_fee_ugx)}. `;else intro+='The first school has not provided a confirmed fee. ';
    if(!known(first,'application_deadline'))intro+='Its application deadline is not listed. ';else intro+=`Its listed deadline is ${date(first.application_deadline)}. `;
    return intro.trim();}
  function renderGuide(){const host=$('guide-conversation');host.replaceChildren(elm('div','guide-bubble assistant',guideReply()))}
  function paint(res){if(state.view==='saved')res=res.filter(x=>state.saved.has(x.school.id));state.current=res;const host=$('results');host.replaceChildren();$('results-count').textContent=res.length+(res.length===1?' school':' schools');$('results-heading').firstChild.textContent=state.view==='saved'?'Saved schools ': 'Explore schools ';
    $('empty-state').hidden=res.length>0;if(res.length){res.forEach((item,i)=>host.append(schoolCard(item.school,i)))}
    const fs=getFilters();const names=Object.entries(fs).map(([k,v])=>k==='max_annual_fee_ugx'?'Up to '+money(v):k==='boarding'?(v?'Boarding':'Day schools'):k==='admissions_open'?(v?'Admissions open':'Admissions closed'):k==='level'?v:k==='curriculum'?v:v);
    $('active-filter-label').textContent=state.view==='saved'?'Showing your saved schools'+(names.length?' • '+names.join(' • '):''):names.length?'Your search: '+names.join(' • '):'Browse available school options';
    updateCounters();renderGuide();}
  function render(){
    const local=search();
    paint(local);
    if(!state.api)return;
    const request=++state.searchSeq;
    fetch('/api/search',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({query:$('question').value.trim(),filters:getFilters(),sort:$('sort-by').value})
    }).then(r=>{if(!r.ok)throw Error('backend unavailable');return r.json()}).then(data=>{
      if(request!==state.searchSeq||!Array.isArray(data.results))return;
      const verifiedResults=data.results.filter(r=>byId[r.id]).map(r=>({school:byId[r.id],score:r.score||0}));
      paint(verifiedResults);
    }).catch(()=>{state.api=false});
  }
  function closeModal(){const o=$('overlay');o.hidden=true;document.body.style.overflow='';if(closeModal.focusBack)closeModal.focusBack.focus()}
  function openModal(title,body){closeModal.focusBack=document.activeElement;$('modal-title').textContent=title;$('modal-content').replaceChildren(body);$('overlay').hidden=false;document.body.style.overflow='hidden';$('close-modal').focus()}
  function addProperty(grid,label,value){const e=elm('div');e.append(elm('small',null,label),elm('strong',null,value));grid.append(e)}
  function modalButton(text,action,id,cls){const b=elm('button',cls||'',text);b.type='button';b.dataset.action=action;if(id)b.dataset.id=id;return b}
  function showDetails(s){const root=elm('div');const header=elm('div','detail-hero');const names=elm('div');names.append(elm('h3',null,s.name),elm('p',null,s.location+', Uganda'));let [lab,cls]=status(s);header.append(names,elm('span','status '+cls,lab));root.append(header,elm('p','detail-description',s.description));const grid=elm('div','detail-grid');addProperty(grid,'School level',known(s,'levels')?s.levels.join(', '):'Not listed');addProperty(grid,'Curriculum',known(s,'curriculum')?s.curriculum.join(', '):'Not listed');addProperty(grid,'School type',known(s,'boarding')?(s.boarding?'Boarding':'Day school'):'Not confirmed');addProperty(grid,'Annual fees',known(s,'annual_fee_ugx')?money(s.annual_fee_ugx):'Ask the school');addProperty(grid,'Admissions',lab);addProperty(grid,'Application deadline',known(s,'application_deadline')?date(s.application_deadline):'Ask the school');root.append(grid);
    const actions=elm('div','modal-buttons');actions.append(modalButton(state.saved.has(s.id)?'Remove from saved':'Save this school','save',s.id),modalButton(state.compare.has(s.id)?'Remove from comparison':'Add to comparison','compare',s.id),modalButton('View application steps','apply',s.id,'primary'));root.append(actions,elm('p','modal-note','These are sample details. Fees and admissions information are not from live schools.'));openModal(s.name,root)}
  function showComparison(){const schools=[...state.compare].map(x=>byId[x]).filter(Boolean);const root=elm('div');if(!schools.length){root.className='empty-modal';root.append(elm('h3',null,'Nothing to compare yet'),elm('p',null,'Select Compare on up to three school cards to see them side by side.'));openModal('Compare schools',root);return}
    const wrap=elm('div','compare-table-wrap'),table=elm('table','compare-table'),thead=elm('thead'),head=elm('tr');head.append(elm('th',null,'Details'));schools.forEach(s=>head.append(elm('th',null,s.name)));thead.append(head);table.append(thead);const tbody=elm('tbody');const rows=[['Location',s=>known(s,'location')?s.location:'Not listed'],['School level',s=>known(s,'levels')?s.levels.join(', '):'Not listed'],['Curriculum',s=>known(s,'curriculum')?s.curriculum.join(', '):'Not listed'],['Type',s=>known(s,'boarding')?(s.boarding?'Boarding':'Day'):'Ask the school'],['Annual fees',s=>known(s,'annual_fee_ugx')?money(s.annual_fee_ugx):'Ask the school'],['Admissions',s=>status(s)[0]],['Deadline',s=>known(s,'application_deadline')?date(s.application_deadline):'Ask the school']];rows.forEach(([label,fn])=>{let tr=elm('tr');tr.append(elm('td',null,label));schools.forEach(s=>tr.append(elm('td',null,fn(s))));tbody.append(tr)});table.append(tbody);wrap.append(table);root.append(wrap);const b=elm('div','modal-buttons');schools.forEach(s=>b.append(modalButton('Remove '+s.name,'compare',s.id)));root.append(b,elm('p','modal-note','A side-by-side look at the available sample information.'));openModal('Compare schools ('+schools.length+')',root)}
  function showSaved(){const schools=[...state.saved].map(id=>byId[id]).filter(Boolean),root=elm('div');if(!schools.length){root.className='empty-modal';root.append(elm('h3',null,'Your shortlist is empty'),elm('p',null,'Select the bookmark on a school card to save a school here.'));openModal('Saved schools',root);return}
    const list=elm('div','saved-list');schools.forEach(s=>{const row=elm('div','saved-entry'),details=elm('div');details.append(elm('strong',null,s.name),elm('small',null,s.location+' · '+(known(s,'annual_fee_ugx')?money(s.annual_fee_ugx):'Fees not listed')));row.append(details,modalButton('View details','details',s.id));list.append(row)});root.append(list);const actions=elm('div','modal-buttons');actions.append(modalButton('Show saved results','saved-view'));root.append(actions);openModal('Saved schools ('+schools.length+')',root)}
  function showApplication(s){const root=elm('div','draft-form');root.append(elm('p',null,'See what a school application journey could look like for '+s.name+'.'));const steps=elm('div','draft-steps');steps.append(elm('span',null,'1 Choose class'),elm('span',null,'2 Prepare documents'),elm('span',null,'3 Review'));root.append(steps);
    const level=elm('label',null,'Level to apply for');const select=elm('select','demo-select');for(const l of s.levels||[]){let op=elm('option',null,l);op.value=l;select.append(op)}level.append(select);root.append(level);
    const checklist=elm('div','draft-checklist');checklist.append(elm('h3',null,'Before you apply'));const ul=elm('ul');['Check the school’s admissions requirements','Confirm dates and fees with the school','Prepare the child’s school records','Review and submit through the official school process'].forEach(x=>ul.append(elm('li',null,x)));checklist.append(ul);root.append(checklist);
    const actions=elm('div','modal-buttons');const btn=modalButton('Preview application checklist','preview-application',s.id,'primary');actions.append(btn);root.append(actions);openModal('Application guide',root);
    btn.addEventListener('click',()=>{const prev=root.querySelector('.draft-complete');if(prev)prev.remove();const result=elm('div','draft-complete',`Checklist ready for ${select.value} at ${s.name}. This is a preview only; no application has been submitted or sent.`);root.append(result);btn.textContent='Checklist previewed';toast('Application checklist prepared')});
  }
  function toggleSave(id){if(state.saved.has(id)){state.saved.delete(id);toast('Removed from saved schools')}else{state.saved.add(id);toast('Saved to your shortlist')}persistSaved();closeModal();render()}
  function toggleCompare(id){if(state.compare.has(id)){state.compare.delete(id);toast('Removed from comparison')}else{if(state.compare.size>=3){toast('Compare up to three schools at a time');return}state.compare.add(id);toast('Added to comparison')}closeModal();render()}
  function resetAll(){state.view='all';$('question').value='';for(const x of ['filter-location','filter-level','filter-curriculum','filter-budget','filter-boarding','filter-admissions'])$(x).value='';$('sort-by').value='match';render();$('discover').scrollIntoView({behavior:'smooth'})}
  function guideAnswer(q){const s=q.toLowerCase().trim();if(!s)return 'Ask me about fees, admissions, school levels or boarding.';
    const selected=records.filter(r=>s.toLowerCase().includes(r.name.toLowerCase()) || (r.name.toLowerCase().split(' ').length>1&&s.includes(r.name.toLowerCase().split(' ')[0])));
    if(selected.length){let school=selected[0];if(/deadline|when|apply|closing/.test(s))return known(school,'application_deadline')?`${school.name} lists ${date(school.application_deadline)} as its application deadline. This is example data, so check with the school before applying.`:`${school.name} does not have a deadline in its current record. Please confirm directly with the school.`;
      if(/fee|cost|price|budget|much/.test(s))return known(school,'annual_fee_ugx')?`${school.name} lists annual fees of ${money(school.annual_fee_ugx)} in the sample data.`:`The annual fee for ${school.name} has not been provided. I can't estimate it from other schools.`;
      return `${school.name} is listed in ${school.location}. It offers ${school.levels.join(' and ')} and ${school.curriculum.join(', ')}. ${status(school)[0]}.`;
    }
    if(/deadline|dates/.test(s)){const available=records.filter(r=>known(r,'application_deadline'));return `${available.length} sample schools have recorded application deadlines. The others need confirmation. Open a school’s details to see its deadline.`}
    let parsed=infer(q);if(/boarding/.test(s)&&parsed.boarding===undefined)parsed.boarding=true;let matches=records.filter(r=>passes(r,parsed));if(/\b(open|admitting)\b/.test(s)&&parsed.admissions_open===undefined)matches=matches.filter(r=>known(r,'admissions_open')&&r.admissions_open);
    const criteria=Object.keys(parsed).length>0||/boarding|admitting/.test(s);
    if(criteria){if(!matches.length)return 'I can’t find a match with those criteria in the sample schools. Try another location or budget.';let labels=matches.slice(0,3).map(r=>`${r.name}${known(r,'annual_fee_ugx')?' ('+money(r.annual_fee_ugx)+')':''}`);return `Based on the current records: ${labels.join('; ')}${matches.length>3?`; plus ${matches.length-3} more`:''}. Use the search filters to compare them.`}
    return 'I can help with school levels, curricula, boarding, fees, locations and deadlines. Try asking “Which boarding schools are in Wakiso?”';
  }
  function sendGuide(q){
    const host=$('guide-conversation');
    const bot=elm('div','guide-bubble assistant',state.api?'Checking school details...':guideAnswer(q));
    host.append(elm('div','guide-bubble user',q),bot);
    while(host.children.length>8)host.firstChild.remove();host.scrollTop=host.scrollHeight;
    if(!state.api)return;
    fetch('/api/ask',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({query:q})
    }).then(r=>{if(!r.ok)throw Error('backend unavailable');return r.json()}).then(data=>{
      bot.textContent=typeof data.answer==='string'&&data.answer.trim()?data.answer:guideAnswer(q);
    }).catch(()=>{state.api=false;bot.textContent=guideAnswer(q)});
  }
  function handler(e){const btn=e.target.closest('[data-action]');if(!btn)return;const id=btn.dataset.id,action=btn.dataset.action;if(action==='save')toggleSave(id);else if(action==='compare')toggleCompare(id);else if(action==='details')showDetails(byId[id]);else if(action==='apply')showApplication(byId[id]);else if(action==='saved-view'){closeModal();state.view='saved';render();$('discover').scrollIntoView({behavior:'smooth'});}else if(action==='preview-application'){} }
  document.addEventListener('click',handler);
  $('close-modal').addEventListener('click',closeModal);$('overlay').addEventListener('click',e=>{if(e.target===$('overlay'))closeModal()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('overlay').hidden)closeModal()});
  $('search-form').addEventListener('submit',e=>{e.preventDefault();state.view='all';render()});
  $('guide-form').addEventListener('submit',e=>{e.preventDefault();let q=$('guide-question').value.trim();if(!q)return;sendGuide(q);$('guide-question').value=''});
  document.querySelectorAll('[data-guide]').forEach(b=>b.addEventListener('click',()=>sendGuide(b.dataset.guide)));
  document.querySelectorAll('[data-query]').forEach(b=>b.addEventListener('click',()=>{$('question').value=b.dataset.query;state.view='all';for(const f of ['filter-location','filter-level','filter-curriculum','filter-budget','filter-boarding','filter-admissions'])$(f).value='';render()}));
  for(const id of ['filter-location','filter-level','filter-curriculum','filter-budget','filter-boarding','filter-admissions','sort-by'])$(id).addEventListener('change',()=>{state.view='all';render()});
  $('clear-filters').addEventListener('click',resetAll);$('reset-empty').addEventListener('click',resetAll);$('open-compare').addEventListener('click',showComparison);$('open-saved').addEventListener('click',showSaved);
  state.saved=new Set([...state.saved].filter(id=>byId[id]));
  render();
})();