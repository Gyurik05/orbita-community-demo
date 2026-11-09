/* Public platform information. Historical data.tasks are intentionally not used. */
const OB_PLATFORM_TASKS = [
  {id:'test-community-profile',kind:'Тестирование',title:'Проверить путь участника',description:'Пройти демовизитку, проверить согласие на показ и поиск в сообществе. Используйте вымышленные данные.',outcome:'Список шагов, на которых было непонятно или возникла ошибка.',route:'personal',action:'Проверить демовизитку'},
  {id:'test-network-map',kind:'Тестирование',title:'Проверить карту и связи',description:'Выбрать сообщество, переключить типы связей и проверить, понятен ли смысл каждой связи.',outcome:'Замечания к фильтрам, подписям и карточкам связей.',route:'map',action:'Открыть карту'},
  {id:'prepare-tool-description',kind:'Контент',title:'Описать полезный инструмент',description:'Подготовить демонстрационное описание: для какой задачи нужен инструмент, какие данные и согласия потребуются.',outcome:'Понятная карточка с условиями использования, без закрытых данных.',route:'tools',action:'Открыть лабораторию'},
  {id:'propose-platform-improvement',kind:'Участие',title:'Предложить улучшение Орбиты',description:'Назвать затруднение лидера или участника и предложить, как его можно решить.',outcome:'Идея с описанием пользы и способом проверить результат.',route:'ideas',action:'Предложить идею'}
];
const OB_PLATFORM_CSS = `.ob-platform-banner{padding:15px 18px;border:1px solid #acd4d3;border-radius:16px;background:#eaf6f4;font-size:13px;line-height:1.7;margin:18px 0}.ob-platform-status{display:inline-block;border-radius:20px;background:#dfefed;color:#28636a;padding:6px 10px;font-size:11px;margin-bottom:13px}.ob-platform .ob-card h2{font-size:20px;font-weight:500;margin:0 0 13px}.ob-platform .ob-card ul{padding-left:19px;color:#526b75;font-size:13px;line-height:1.8}.ob-platform .ob-actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:15px}.ob-platform .ob-card button{white-space:normal}.ob-platform-roadmap{display:grid;gap:18px;margin:20px 0}.ob-platform-roadmap article{border-left:4px solid #90c6c2}.ob-platform-roadmap article:first-child{border-left-color:#317a77}.ob-platform-note{font-size:12px;color:#536f78;line-height:1.7}.ob-platform-feedback{padding:16px 18px;border-radius:14px;background:#deefea;line-height:1.6}.ob-platform [aria-pressed=true]{background:#d7eeea;color:#235c60}`;
function OB_platformSelection() {
  try {
    const raw=localStorage.getItem('orbita-platform-participation-v1');
    const selected=raw===null?[]:JSON.parse(raw);
    if(!Array.isArray(selected)||!selected.every(id=>typeof id==='string'&&OB_PLATFORM_TASKS.some(t=>t.id===id))||new Set(selected).size!==selected.length)throw Error();
    return {selected,error:''};
  } catch {
    return {selected:[],error:'Не удалось прочитать локальный выбор задач. Сохранение остановлено, чтобы не перезаписать данные. Проверьте хранилище браузера или используйте другую демосессию.'};
  }
}
function OrbitaPlatform({view,onNavigate}) {
  const h=B.createElement;
  const [selection,setSelection]=B.useState(OB_platformSelection),[notice,setNotice]=B.useState('');
  const titles={development:'Развитие Орбиты','platform-tasks':'Задачи платформы',recognition:'Вклад и признание',plan:'Дорожная карта'};
  const descriptions={development:'Как вместе сделать Орбиту полезнее для лидеров и участников.', 'platform-tasks':'Участие, тестирование и контент: выберите, что хотите попробовать.',recognition:'Заметный вклад начинается с понятного результата и его подтверждения.',plan:'Публичные направления развития и состояние демонстрации.'};
  const link=(title,id)=>h('button',{type:'button',className:'secondary',onClick:()=>onNavigate(id)},title);
  const card=(key,title,body,children,status)=>h('article',{key,className:'glass ob-card'},status&&h('span',{className:'ob-platform-status'},status),h('h2',null,title),h('p',null,body),children);
  function choose(id) {
    if(selection.error)return;
    const exists=selection.selected.includes(id),selected=exists?selection.selected.filter(x=>x!==id):[...selection.selected,id];
    try {
      localStorage.setItem('orbita-platform-participation-v1',JSON.stringify(selected));
      setSelection({selected,error:''});setNotice(exists?'Выбор задачи отменён в этом браузере.':'Задача выбрана только в этом браузере. Команда не уведомлена; это не назначение исполнителя.');
    } catch {
      setNotice('Браузер не разрешил сохранение. Выбор не изменён.');
    }
  }
  return h('section',{className:'ob-page ob-platform'},h('style',null,OB_PLATFORM_CSS),
    h('div',{className:'page-heading'},h('div',null,h('p',{className:'eyebrow'},'ЖИЗНЬ ПЛАТФОРМЫ'),h('h1',null,titles[view]),h('p',null,descriptions[view]))),
    h('div',{className:'ob-platform-banner'},'Локальное демо. Выбор задач, идеи и примеры сохраняются в localStorage этого браузера. Общей базы, отправки команде и реальных аккаунтов нет. Не вводите настоящие персональные данные.'),
    selection.error&&h('p',{role:'alert'},selection.error),notice&&h('p',{role:'status',className:'ob-platform-feedback'},notice),
    view==='development'&&h('div',null,
      h('div',{className:'ob-grid'},
        card('purpose','Развивать вместе с сообществами','Собирать потребности, пробовать инструменты и проверять, помогают ли они знакомиться, находить экспертизу и делать общее дело.',h('div',{className:'ob-actions'},link('Идеи и предложения','ideas'),link('Выбрать задачу','platform-tasks'))),
        card('current','Что уже можно попробовать','Карту и связи, карточки сообществ, запросы, совместные сценарии, события и добровольные профили. Это возможности локальной демонстрации.',h('div',{className:'ob-actions'},link('Жизнь сообществ','communities'),link('Публичные приоритеты','plan'))),
        card('voice','Как участвовать в развитии','Проверить пользовательский путь, подготовить описание инструмента или сформулировать улучшение. Локальный выбор помогает примерить роль, но никого ни к чему не обязывает.',link('Задачи платформы','platform-tasks')),
        card('boundaries','Что нужно для реального запуска','Отдельно согласовать серверное хранение, авторизацию, права, сроки удаления данных и уведомления. Интеграции с Telegram, CRM и Kodik пока не подключены.',link('Лаборатория инструментов','tools')))),
    view==='platform-tasks'&&h('div',null,h('p',{className:'ob-platform-note'},'Предложенные способы участия в демонстрации. Здесь нет внутренних задач команды, назначенных исполнителей и обещанных сроков.'),
      h('div',{className:'ob-grid'},...OB_PLATFORM_TASKS.map(t=>card(t.id,t.title,t.description,h('div',null,h('p',null,h('strong',null,'Что подготовить: '),t.outcome),h('div',{className:'ob-actions'},h('button',{type:'button',className:'primary',disabled:!!selection.error,'aria-pressed':selection.selected.includes(t.id),onClick:()=>choose(t.id)},selection.selected.includes(t.id)?'Отменить локальный выбор':'Выбрать локально'),link(t.action,t.route))),t.kind)))),
    view==='recognition'&&h('div',null,
      h('div',{className:'ob-grid'},card('verified','Подтверждённого вклада пока нет','Здесь будут результаты участия, подтверждённые авторами и теми, кому они помогли. Нажатия кнопок и выбранные задачи не считаются достижениями.',link('Найти задачу для участия','platform-tasks')),
        card('criteria','Что можно считать вкладом','Полезное описание инструмента, воспроизводимый отчёт о проверке или улучшение, которое помогло участникам. Для публичного признания нужны подтверждение результата и согласие автора.',h('p',{className:'ob-platform-note'},'Рейтинги, баллы, внутренняя валюта и система наград не запущены.'))),
      selection.selected.length>0&&card('intentions','Мой локальный выбор','Это намерения попробовать задачи, а не выполненная работа или публичные заслуги.',h('div',null,h('ul',null,...OB_PLATFORM_TASKS.filter(t=>selection.selected.includes(t.id)).map(t=>h('li',{key:t.id},t.title))),link('Изменить выбор','platform-tasks')))),
    view==='plan'&&h('div',null,h('p',{className:'ob-platform-note'},'Публичный обзор, не внутренний трекер команды. Порядок следующих шагов предложен для обсуждения; даты запуска и обязательства не утверждены.'),
      h('div',{className:'ob-platform-roadmap'},
        card('now','Проверять основные сценарии','В демонстрации доступны каталог сообществ, карта связей, анкеты, запросы, события, обсуждения и локальные сценарии сотрудничества.',h('div',null,h('p',null,h('strong',null,'Состояние: '),'можно пробовать в этом браузере. Это не промышленный запуск и не подтверждение реальных сообществ.'),link('Открыть карту сети','map')),'Доступно в демо'),
        card('learn','Собрать обратную связь и уточнить приоритеты','Проверить, понятны ли роли, навигация, согласия и способы участия. Отделить важные потребности сообществ от удобств интерфейса.',h('div',null,h('p',null,h('strong',null,'Критерий следующего шага: '),'описанные проблемы и согласованный набор приоритетов.'),link('Идеи и предложения','ideas')),'Предложено к обсуждению'),
        card('safe-launch','Подготовить безопасный совместный пилот','Определить общую базу, вход и права, правила работы с данными, удаление и уведомления. Затем отдельно оценить внешние интеграции.',h('div',null,h('p',null,h('strong',null,'Состояние: '),'сервер и интеграции не подключены; решение о запуске требует отдельного согласования.'),link('Посмотреть условия участия','rules')),'Требует согласования')))
  );
}
