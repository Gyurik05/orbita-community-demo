function OrbitaCommunities({data,onSave,onNavigate,onOpenCommunity}) {
  const h=B.createElement;
  const [selected,setSelected]=B.useState(null),[tab,setTab]=B.useState('overview');
  const [query,setQuery]=B.useState(''),[peopleQuery,setPeopleQuery]=B.useState('');
  const [hub,setHub]=B.useState({cards:[]}),[readError,setReadError]=B.useState(false);
  const heading=B.useRef(null),tabs=B.useRef([]);
  B.useEffect(()=>{
    function refresh(){try{const next=window.OrbitaHub&&window.OrbitaHub.read();setHub(next&&Array.isArray(next.cards)?next:{cards:[]});setReadError(false);}catch(e){setHub({cards:[]});setReadError(true);}}
    refresh();window.addEventListener('orbita-hub-change',refresh);window.addEventListener('storage',refresh);
    return ()=>{window.removeEventListener('orbita-hub-change',refresh);window.removeEventListener('storage',refresh);};
  },[]);
  const list=v=>Array.isArray(v)?v.filter(x=>typeof x==='string'):[];
  const text=v=>typeof v==='string'?v:'';
  const match=(v,q)=>v.toLocaleLowerCase('ru').includes(q.trim().toLocaleLowerCase('ru'));
  const communities=Array.isArray(data&&data.communities)?data.communities:[];
  const profiles=(Array.isArray(data&&data.profiles)?data.profiles:[]).filter(p=>p.consent===true&&p.approved===true).map(p=>({id:'demo-'+p.id,communityId:p.communityId,name:text(p.alias)||text(p.name),topics:list(p.skills),sources:list(p.sources),demo:true}));
  // Deliberate public-field allowlist: private form answers never enter these cards.
  const cards=(hub.cards||[]).filter(p=>p.status==='approved'&&p.publish_consent===true).map(p=>({id:'gr-'+p.id,communityId:p.communityId,name:text(p.name),org:text(p.org),profession:text(p.profession),region:text(p.region),tg_nick:text(p.tg_nick),topics:list(p.topics),contribution:list(p.contribution),participation:list(p.participation),photo:typeof p.photo==='string'&&/^data:image\/(?:png|jpeg|webp);base64,/i.test(p.photo)?p.photo:null,demo:false}));
  const allPeople=[...profiles,...cards];
  const members=id=>allPeople.filter(p=>p.communityId===id);
  const current=communities.find(c=>c.id===selected);
  B.useEffect(()=>{if(selected&&!current)setSelected(null);},[selected,current]);
  B.useEffect(()=>{if(heading.current)heading.current.focus();},[selected]);
  const button=(label,fn,primary=false,extra={})=>h('button',{type:'button',className:primary?'primary':'secondary',onClick:fn,...extra},label);
  const chips=(values)=>h('div',{className:'chips',style:{gap:6,flexWrap:'wrap'}},...values.map((v,i)=>h('span',{className:'chip neutral',key:i},v)));
  const empty=(title,description,action)=>h('div',{className:'glass ob-card',style:{textAlign:'center',padding:'36px 24px'}},h('h3',null,title),h('p',null,description),action);
  const open=id=>{setSelected(id);setTab('overview');setPeopleQuery('');};
  const count=allPeople.filter(p=>communities.some(c=>c.id===p.communityId)).length;
  const safeLink=url=>{try{const u=new URL(url);return u.protocol==='https:'?u.href:null;}catch(e){return null;}};
  const status=c=>({connected:'В сети',pending:'Знакомство',disconnected:'Не участвует'}[c.status]||'Знакомство');
  const personCard=p=>h('article',{className:'glass ob-card',key:p.id},
    h('div',{style:{display:'flex',alignItems:'center',gap:14,marginBottom:16}},p.photo?h('img',{src:p.photo,alt:'',width:52,height:52,style:{borderRadius:16,objectFit:'cover'},onError:e=>{e.currentTarget.style.display='none';}}):h('span',{'aria-hidden':true,style:{width:52,height:52,borderRadius:16,display:'grid',placeItems:'center',background:'linear-gradient(135deg,#c7efeb,#ddd9fa)',color:'#326573',fontSize:20,flexShrink:0}},(p.name||'?').split(/\s+/).slice(0,2).map(x=>x[0]).join('')),
      h('div',null,h('h3',{style:{marginBottom:4}},p.name||'Участник'),h('span',{className:'ob-note'},p.demo?'Демонстрационный профиль':'Визитка GR · одобрена'))),
    !p.demo&&h('p',null,[p.profession,p.org,p.region].filter(Boolean).join(' · ')),
    p.topics.length?chips(p.topics):h('p',null,'Темы пока не указаны'),
    !p.demo&&p.contribution.length>0&&h('p',{style:{marginTop:16}},h('strong',null,'Могу помочь: '),p.contribution.join(', ')),
    !p.demo&&p.participation.length>0&&h('p',null,h('strong',null,'Формат участия: '),p.participation.join(', ')),
    !p.demo&&p.tg_nick&&h('p',null,'Telegram: ',p.tg_nick),
    p.demo&&p.sources&&h('div',{style:{display:'flex',gap:12,flexWrap:'wrap',marginTop:16}},...p.sources.map((s,i)=>safeLink(s)&&h('a',{key:i,href:safeLink(s),target:'_blank',rel:'noopener noreferrer'},'Источник '+(i+1)+' ↗'))));
  const filtered=communities.filter(c=>match([c.name,c.sector,c.about,...list(c.resources),...list(c.needs)].join(' '),query));
  const people=current?members(current.id):[];
  const visiblePeople=people.filter(p=>match([p.name,...p.topics].join(' '),peopleQuery));
  const tabItems=[['overview','Обзор'],['participants','Участники ('+people.length+')'],['resources','Ресурсы']];
  return h('section',{className:'ob-page ob-communities'},
    h('style',null,'.ob-communities :focus-visible{outline:3px solid #397f91;outline-offset:4px}.ob-communities h1:focus{outline:none}.ob-communities .ob-search{display:block;width:100%;max-width:600px;min-height:46px;padding:12px 16px;border:1px solid #aac8cf;border-radius:14px;background:#ffffffb8;color:#244858}.ob-communities .ob-card{overflow-wrap:anywhere}.ob-communities .ob-community-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px}.ob-communities .ob-tabs button[aria-selected=true]{background:#d3eeec;color:#255d64;border-color:#85b7b8}.ob-communities .ob-counts{display:flex;flex-wrap:wrap;gap:12px;margin:20px 0}.ob-communities .ob-counts span{padding:10px 14px;background:#ffffff91;border-radius:14px;color:#466572;font-size:13px}'),
    current&&button('← Все сообщества',()=>setSelected(null)),
    h('div',{className:'page-heading',style:{marginTop:current?20:0}},h('div',null,h('p',{className:'eyebrow'},current?'СООБЩЕСТВО':'СЕТЬ ЛЮДЕЙ И ВОЗМОЖНОСТЕЙ'),h('h1',{ref:heading,tabIndex:-1},current?current.name:'Сообщества'),h('p',null,current?current.sector:'Найдите близкие темы, людей и ресурсы для совместной работы.')),
      !current&&button('+ Добавить сообщество',()=>onNavigate('legacy-survey'),true)),
    h('p',{className:'ob-note'},'Демонстрационный каталог. Здесь используем только вымышленные сведения. Визитки GR видны после согласия на публикацию и локального одобрения. Сервер, проверка личности и реальный обмен данными не подключены.'),
    readError&&h('p',{role:'alert'},'Не удалось прочитать локальные визитки. Они не изменены. Проверьте доступ к хранилищу браузера и обновите страницу.'),
    !current?h(B.Fragment,null,
      h('div',{className:'ob-counts'},h('span',null,communities.length+' сообществ'),h('span',null,count+' видимых профилей'),h('span',null,communities.reduce((n,c)=>n+list(c.resources).length,0)+' описаний ресурсов')),
      h('label',{htmlFor:'ob-community-search',className:'field-label'},'Поиск сообщества по названию или теме'),h('input',{id:'ob-community-search',className:'ob-search',type:'search',value:query,onChange:e=>setQuery(e.target.value),placeholder:'Например: образование, данные, дизайн'}),
      h('p',{className:'ob-note',role:'status'},'Найдено: '+filtered.length),
      filtered.length?h('div',{className:'ob-grid'},...filtered.map(c=>h('article',{className:'glass ob-card',key:c.id},h('span',{className:'community-symbol '+(['teal','purple','blue','orange','pink','green'].includes(c.color)?c.color:'teal'),'aria-hidden':true},'◈'),h('p',{className:'eyebrow',style:{marginTop:18}},c.sector+' · '+status(c)),h('h3',null,c.name),h('p',null,c.about||'Описание сообщества пока не добавлено.'),chips(list(c.resources).slice(0,3)),h('p',{className:'ob-note'},members(c.id).length+' профилей · '+list(c.resources).length+' ресурсов'),button('Открыть сообщество',()=>open(c.id),false,{'aria-label':'Открыть сообщество «'+c.name+'»'})))):
        empty(query?'Сообщества не найдены':'Начните с первого сообщества',query?'Попробуйте другую тему или очистите поиск.':'Добавьте описание, чтобы объединить участников и ресурсы.',query?button('Сбросить поиск',()=>setQuery('')):button('Добавить сообщество',()=>onNavigate('legacy-survey'),true))
    ):h(B.Fragment,null,
      h('div',{className:'ob-tabs',role:'tablist','aria-label':'Разделы сообщества'},...tabItems.map(([id,label],i)=>h('button',{type:'button',key:id,className:'secondary',role:'tab',id:'ob-community-tab-'+id,'aria-selected':tab===id,'aria-controls':'ob-community-panel',tabIndex:tab===id?0:-1,ref:el=>{tabs.current[i]=el;},onClick:()=>setTab(id),onKeyDown:e=>{let n=i;if(e.key==='ArrowRight')n=(i+1)%3;else if(e.key==='ArrowLeft')n=(i+2)%3;else if(e.key==='Home')n=0;else if(e.key==='End')n=2;else return;e.preventDefault();setTab(tabItems[n][0]);tabs.current[n]&&tabs.current[n].focus();}},label))),
      h('div',{id:'ob-community-panel',role:'tabpanel','aria-labelledby':'ob-community-tab-'+tab,tabIndex:0},
        tab==='overview'&&h('div',{className:'glass ob-card'},h('h2',null,'О сообществе'),h('p',null,current.about||'Описание пока не добавлено.'),h('p',null,'Статус: '+status(current)),h('p',null,'Размер сообщества: '+(current.size||'Не указан')+'. Видимых профилей в демо: '+people.length+'.'),h('h3',null,'Чем можем быть полезны'),chips(list(current.resources)),h('h3',{style:{marginTop:20}},'Что ищем'),chips(list(current.needs)),h('p',{className:'ob-note'},'Участие в сети не открывает базы данных. Условия доступа к ресурсам согласуются отдельно.'),h('div',{className:'ob-community-actions'},button('Посмотреть участников',()=>setTab('participants')),typeof onOpenCommunity==='function'&&button('Редактировать сообщество',()=>onOpenCommunity(current.id)))),
        tab==='participants'&&h(B.Fragment,null,h('div',{className:'ob-community-actions',style:{marginBottom:20}},button('Создать визитку GR',()=>onNavigate('participant'),true)),h('label',{htmlFor:'ob-person-search',className:'field-label'},'Поиск участника по имени или теме'),h('input',{id:'ob-person-search',type:'search',className:'ob-search',value:peopleQuery,onChange:e=>setPeopleQuery(e.target.value),placeholder:'Имя или компетенция'}),h('p',{role:'status',className:'ob-note'},'Показано: '+visiblePeople.length+' из '+people.length),visiblePeople.length?h('div',{className:'ob-grid'},...visiblePeople.map(personCard)):empty(peopleQuery?'Участники не найдены':'Первые знакомства ещё впереди',peopleQuery?'Попробуйте другое имя или тему.':'Создайте визитку GR, выберите это сообщество и дайте согласие на публикацию. После локального одобрения она появится здесь.',peopleQuery?button('Сбросить поиск',()=>setPeopleQuery('')):button('Создать визитку GR',()=>onNavigate('participant'),true))),
        tab==='resources'&&h(B.Fragment,null,h('div',{className:'ob-grid'},h('article',{className:'glass ob-card'},h('h3',null,'Предлагает'),list(current.resources).length?chips(list(current.resources)):h('p',null,'Ресурсы пока не описаны.')),h('article',{className:'glass ob-card'},h('h3',null,'Ищет'),list(current.needs).length?chips(list(current.needs)):h('p',null,'Открытых запросов пока нет.'))),current.toolName&&h('article',{className:'glass ob-card'},h('h3',null,current.toolName),h('p',null,current.toolAccess||'Условия доступа уточняются у владельца.'),safeLink(current.toolUrl)&&h('a',{href:safeLink(current.toolUrl),target:'_blank',rel:'noopener noreferrer'},'Открыть инструмент ↗')),h('p',{className:'ob-note'},'Это описания возможностей, а не доступ к закрытым материалам. Внешние инструменты работают по правилам владельцев.'),button('Найти совместный сценарий',()=>onNavigate('scenarios')))
      )
    )
  );
}
window.OrbitaCommunities=OrbitaCommunities;
