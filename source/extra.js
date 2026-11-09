/* Two public areas, followed by personal utilities. Route IDs retain old links. */
const OB_NAV_GROUPS = [
  ['Жизнь сообществ', [['map', 'Карта сети'], ['communities', 'Сообщества'], ['resources', 'Запросы и ресурсы'], ['scenarios', 'Совместные сценарии'], ['events', 'События и встречи'], ['results', 'Результаты сотрудничества']]],
  ['Жизнь платформы', [['development', 'Развитие Орбиты'], ['ideas', 'Идеи и предложения'], ['platform-tasks', 'Задачи платформы'], ['recognition', 'Вклад и признание'], ['tools', 'Лаборатория инструментов'], ['plan', 'Дорожная карта']]]
];
function OrbitaNav({view,onNavigate}) {
  const h=B.createElement;
  const item=([id,title])=>h('button',{key:id,type:'button',className:'nav-item '+(view===id?'active':''),'aria-current':view===id?'page':undefined,onClick:()=>onNavigate(id)},h('span',{className:'ob-nav-dot','aria-hidden':true},'◈'),h('span',null,title));
  return h('nav',{className:'ob-nav','aria-label':'Разделы Орбиты'},
    h('style',null,'.ob-nav .ob-nav-label{font-size:11px;font-weight:650;letter-spacing:.6px;text-transform:uppercase;margin:23px 12px 8px;color:#e6f7f4}.ob-nav-group+.ob-nav-group{border-top:1px solid #ffffff20;margin-top:17px;padding-top:1px}.ob-nav-utilities{border-top:1px solid #ffffff20;margin-top:22px;padding-top:12px}.ob-nav .nav-item{width:100%;text-align:left}.ob-nav .nav-item:focus-visible{outline:2px solid #b5e5dd;outline-offset:2px}'),
    item(['overview','Обзор']),
    ...OB_NAV_GROUPS.map(([label,items],index)=>h('div',{className:'ob-nav-group',key:label,role:'group','aria-labelledby':'ob-nav-group-'+index},h('p',{className:'ob-nav-label',id:'ob-nav-group-'+index},label),...items.map(item))),
    h('div',{className:'ob-nav-utilities','aria-label':'Личное пространство и правила'},item(['personal','Моё пространство']),item(['rules','Правила и данные']))
  );
}
function OrbitaExtra({view,data,onSave,onNavigate,onOpen,onOpenCommunity}) {
  const h=B.createElement;
  if(view==='survey'||view==='participant')return h(OrbitaForms,{key:view,kind:view==='survey'?'leader':'participant',data,onNavigate});
  if(view==='map')return h(OrbitaNetwork,{data,onSave,onNavigate});
  if(view==='communities'||view==='profiles')return h(OrbitaCommunities,{data,onSave,onNavigate,onOpenCommunity});
  if(view==='personal')return h(OrbitaWorkspace,{data,onNavigate});
  if(view==='events')return h(OrbitaEvents,{data,onSave,onNavigate});
  if(view==='ideas')return h(OrbitaDiscussions,{data,onSave,onNavigate});
  if(view==='scenarios')return h(OrbitaScenarios,{data,onSave,onOpen,onNavigate});
  if(['development','platform-tasks','recognition','plan'].includes(view))return h(OrbitaPlatform,{view,onNavigate});
  const card=(key,title,body,actions)=>h('article',{key,className:'glass ob-card'},h('h3',null,title),h('p',null,body),actions);
  const link=(title,id)=>h('button',{className:'secondary',onClick:()=>onNavigate(id)},title);
  const results=data.scenarios.filter(s=>s.stage==='ready'&&typeof s.result==='string'&&s.result.trim());
  return h('section',{className:'ob-page'},h('div',{className:'page-heading'},h('div',null,h('p',{className:'eyebrow'},'ЖИЗНЬ СООБЩЕСТВ'),h('h1',null,view==='resources'?'Запросы и ресурсы':'Результаты сотрудничества'),h('p',null,'Локальное демо. Примеры вымышлены; данные сохраняются только в этом браузере.'))),
    view==='resources'&&h('div',null,h(OrbitaRequestForm,{data}),h('div',{className:'ob-grid'},...data.communities.map(c=>card(c.id,c.name,h('span',null,h('strong',null,'Ищет: '),c.needs.join(', ')||'Не указано',h('br'),h('strong',null,'Предлагает: '),c.resources.join(', ')||'Не указано'),link('Подобрать совместный сценарий','scenarios'))))),
    view==='results'&&(results.length?h('div',{className:'ob-grid'},...results.map(s=>card(s.id,s.title,s.result,h('div',null,h('p',{className:'ob-note'},'Демонстрационный итог, указанный автором локально. Не подтверждённое достижение реального сообщества.'),link('Открыть совместные сценарии','scenarios'))))):card('empty','Пока нет описанных результатов','Здесь показываются сценарии со статусом «Готово» и заполненным описанием итога. Реальные результаты потребуют подтверждения участников.',link('Посмотреть текущие сценарии','scenarios')))
  );
}

function OrbitaRoleIntro({onNavigate}){const h=B.createElement;return h('section',{className:'ob-role-intro'},h('p',{className:'ob-role-principle'},'Каждое сообщество сохраняет самостоятельность. Пользуйтесь инструментами без обязательного раскрытия базы участников.'),h('div',{className:'ob-grid'},h('article',{className:'glass ob-card'},h('span',{className:'eyebrow'},'ДЛЯ ЛИДЕРА'),h('h3',null,'Ресурсы для развития сообщества'),h('p',null,'Покажите сильные стороны, найдите партнёров под задачу и соберите совместный проект. Вы сами решаете, чем делиться.'),h('button',{className:'primary',onClick:()=>onNavigate('personal')},'Начать как лидер')),h('article',{className:'glass ob-card'},h('span',{className:'eyebrow'},'ДЛЯ УЧАСТНИКА'),h('h3',null,'Люди и возможности по интересам'),h('p',null,'Создайте визитку, найдите нужную экспертизу, события и проекты. Показ профиля добровольный и управляется вами.'),h('div',{className:'ob-actions'},h('button',{className:'primary',onClick:()=>onNavigate('personal')},'Начать как участник'),h('button',{className:'secondary',onClick:()=>onNavigate('communities')},'Найти сообщество')))));}
