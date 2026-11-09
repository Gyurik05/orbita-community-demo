from pathlib import Path
p=Path(__file__).parent
s=(p/'dist/index.html').read_text()
s=s.replace('function D(x){a(x)', 'function D(x){if(["plan","development","platform-tasks","recognition"].includes(x))x="overview";a(x)')
s=s.replace('xf.some(T=>T.id===x)&&a(x)','xf.some(T=>T.id===x)&&a(["plan","development","platform-tasks","recognition"].includes(x)?"overview":x)')
a=s.index('{label:"Движение к 15 декабря"');b=s.index('}].map',a)
s=s[:a]+'{label:"Участники и специалисты",value:t.profiles.length,sub:"Добровольные профили",icon:pt,color:"orange",to:"profiles"'+s[b:]
a=s.index('(0,d.jsxs)("section",{className:"glass meeting-card"');b=s.index('(0,d.jsxs)("section",{className:"glass needs-card"',a)
s=s[:a]+'(0,d.jsxs)("section",{className:"glass meeting-card",children:[(0,d.jsx)("h3",{children:"События сообществ"}),(0,d.jsx)("p",{children:"Встречи, обмен опытом и новые знакомства. Подтверждённых событий пока нет."}),(0,d.jsx)("button",{className:"text-link",onClick:()=>D("events"),children:"Открыть события"})]}),'+s[b:]
s=s.replace('СОБИРАЕМ СЕТЬ ДО 15 ДЕКАБРЯ','СООБЩЕСТВА. УЧАСТНИКИ. СОТРУДНИЧЕСТВО').replace('Пилот сети \\xB7 ноябрь \\u2014 декабрь 2026','Пространство сообществ и специалистов').replace('Координация сети','Сообщества и специалисты').replace('Пространство инициаторов','Правила участия')
a=s.index('(0,d.jsxs)("div",{className:"sidebar-mission"');b=s.index('(0,d.jsxs)("button",{className:"sidebar-role"',a);s=s[:a]+s[b:]
# Keep complete local records untouched, but omit internal plan/history from exported user snapshot.
s=s.replace('mode:u?"demo":"workspace",data:t','mode:u?"demo":"workspace",data:{...t,tasks:[],log:[],meeting:""}')
s=s.replace('каталог сети, сценарии, профили и план.','каталог сети, сценарии и профили. Внутренний план и журнал в экспорт не входят.')
s=s.replace('(0,d.jsxs)("button",{className:"primary",onClick:t,children:[(0,d.jsx)(Ml,{size:16}),"Техническое задание"]})','null')
s=s.replace('Отправить анкету','Сохранить анкету локально').replace('Анкета попадёт в список сообществ','Анкета сохранится в этом браузере в списке сообществ')
s=s.replace('children:"Опубликовать"','children:"Сохранить профиль локально"').replace('Профиль опубликован с согласия участника','Профиль сохранён локально с согласием участника')
s=s.replace('Лаборатория инструментов','Инструменты сообществ').replace('Наша роль','Условия использования').replace('Дать понятные правила совместимости и помочь конструкторам им следовать. Платформа, язык и конструктор инструментов не предписаны исходным планом. Общий граф профилей требует добровольного согласия и просмотра каждым человеком.','Перед использованием уточните условия у владельца инструмента. Не передавайте закрытые данные без разрешения. Добавление описания в каталог не подключает внешние системы.')
s=s.replace('window.history.replaceState(null,"","#"+x)','window.history.pushState(null,"","#"+x)')
s=s.replace('function D(x){','(0,B.useEffect)(()=>{const sync=()=>{let id=window.location.hash.slice(1)||"overview";if(["plan","development","platform-tasks","recognition"].includes(id)||!xf.some(v=>v.id===id))id="overview";a(id);p(null);b(!1);};window.addEventListener("popstate",sync);window.addEventListener("hashchange",sync);return()=>{window.removeEventListener("popstate",sync);window.removeEventListener("hashchange",sync);};},[]);function D(x){')
s=s.replace('meeting:O.enum(["2026-11-19","2026-11-20"])','meeting:O.enum(["","2026-11-19","2026-11-20"])')
s=s.replace('(0,d.jsx)("section",{className:"stats-grid"','(0,d.jsx)(OrbitaRoleIntro,{onNavigate:D}),(0,d.jsx)("section",{className:"stats-grid"',1)
s=s.replace('подключены к сети','в демосети').replace('Координатор сети','Демонстрация ролей')
s=s.replace('Все сообщества и результаты здесь вымышлены.','Все примеры вымышлены. Общего сервера и отправки заявок нет.')
s=s.replace('to:"profiles"','to:"communities"')
s=s.replace('children:"Связи рождаются из совместных сценариев"','children:"Условные связи демосети. Типы и фильтры доступны на полной карте."')
s=s.replace('Подтверждённых событий пока нет.','Создавайте демособытия, сохраняйте приглашения и проверяйте участие.')
s=s.replace('e==="profiles"','e==="profiles"')
s=s.replace('<title>Орбита · интерактивное демо</title>','<title>Орбита · сообщества и сотрудничество</title><meta name="orbita-release" content="2026-11-09-v2">')
s=s.replace('[t,l]=(0,B.useState)(gf)','[t,l]=(0,B.useState)(OBH_demoData)')
s=s.replace('o(!0),l(gf()),p(null)','o(!0),l(OBH_demoData()),p(null)')
s=s.replace('if(x.log=[{id:vn(),text:T,at:new Date().toISOString()},...x.log].slice(0,100),u)return l(x),L(T+" \\xB7 демо"),!0;', 'if(x.log=[{id:vn(),text:T,at:new Date().toISOString()},...x.log].slice(0,100),u){try{OBH_saveDemo(x);return l(x),L(T+" · сохранено в демосети этого браузера"),!0;}catch(err){return c(err.message),!1;}}')
(p/'dist/index.html').write_text(s)
for f in ['Orbita_TZ.html','specification.html']:
 (p/'dist'/f).unlink(missing_ok=True)
from html.parser import HTMLParser
class P(HTMLParser):
 def __init__(self):super().__init__();self.ins=False;self.out=[]
 def handle_starttag(self,t,a):
  if t=='script':self.ins=True
 def handle_endtag(self,t):
  if t=='script':self.ins=False
 def handle_data(self,d):
  if self.ins:self.out.append(d)
x=P();x.feed(s);(p/'bundle-check.js').write_text('\n'.join(x.out))
