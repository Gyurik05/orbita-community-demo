from pathlib import Path
import re
p=Path(__file__).parent;s=(p/'baseline/repo-index.html').read_text();s=re.sub(r'\\u([0-9a-fA-F]{4})',lambda m:chr(int(m[1],16)) if 0x400<=int(m[1],16)<=0x4ff else m[0],s)
# Retain original bundled code, add isolated UI components.
newids={'resources':'Запросы и ресурсы','events':'События и встречи','results':'Результаты сотрудничества','development':'Развитие Орбиты','ideas':'Идеи и предложения','platform-tasks':'Задачи платформы','recognition':'Вклад и признание','personal':'Моё пространство','participant':'Визитка участника GR','legacy-survey':'Добавить сообщество'}
import json
add=';xf.push(...'+json.dumps([{'id':i,'title':v} for i,v in newids.items()],ensure_ascii=False)+');'
components='\n'.join((p/f).read_text() for f in ['hub.js','forms.js','scenarios.js','network.js','communities.js','collaboration.js','platform.js','extra.js'])
s=s.replace('function vf(){',add+components+'\nfunction vf(){',1)
a=s.index('(0,d.jsx)("nav",{children:xf.map');b=s.index('(0,d.jsxs)("div",{className:"sidebar-bottom"',a);s=s[:a]+'(0,d.jsx)(OrbitaNav,{view:e,onNavigate:D}),'+s[b:]
custom=['map','communities','profiles','survey','participant','personal','resources','events','results','development','ideas','platform-tasks','recognition','scenarios','plan']
needle='e==="overview"?(0,d.jsxs)(d.Fragment'
s=s.replace(needle,json.dumps(custom)+' .includes(e)?(0,d.jsx)(OrbitaExtra,{view:e,data:t,onSave:q,onNavigate:D,onOpen:id=>p({type:"scenario",id}),onOpenCommunity:id=>p({type:"community",id})}):'+needle,1)
# Keep old community creation form reachable from catalogue; new leader form in personal area.
s=s.replace('e==="survey"&&(0,d.jsx)(dC','e==="legacy-survey"&&(0,d.jsx)(dC')
s=s.replace('D("survey")','D("legacy-survey")')
# Xg supported, old heading metadata unknown only for legacy survey mapped.
s=s.replace('(0,d.jsx)(uC,{view:e,','(0,d.jsx)(uC,{view:e==="legacy-survey"?"survey":e,')
s=s.replace('title:"План и встречи"','title:"Дорожная карта"').replace('title:"Инструменты сообществ"','title:"Лаборатория инструментов"')
# Participation is not consent to exchange. Preserve each community\'s exchange choice.
s=s.replace('for(let l of e.communities)l.status==="connected"&&(!l.agreement||l.exchange!=="Да")&&a.addIssue({code:"custom",message:"Подключение требует правил обмена",path:["communities"]});','')
s=s.replace('status:"connected",exchange:"Да",agreement:!0','status:"connected"')
s=s.replace('Подтверждаю право подключить это сообщество и согласованные правила взаимного обмена','Подтверждаю право показать описание этого сообщества. Это не согласие на обмен данными')
s=s.replace('Правила взаимного обмена подтверждены','Сообщество участвует в сети. Обмен данными согласуется отдельно')
s=s.replace('Взаимный доступ по соглашению','Добровольный доступ по соглашению')
s=s.replace('Каждое сообщество само открывает свой доступ в обмен на доступ соседей. Правила фиксируются письменно до подключения. Отметка в прототипе не заменяет соглашение и не открывает API.','Участие не требует раскрытия базы. Сообщество отдельно выбирает, какие ресурсы открыть и кому. Обмен согласуется отдельно. Отметка в прототипе не открывает API.')
s=s.replace('До подтверждения обмена ресурсы не появятся на карте сети.','Участие в сети не обязывает открывать данные. Доступы согласуются отдельно.')
# Restore the original landing composition with a shared core and orbiting communities.
# Keep the other page and workflow updates intact; no checkmark or bank-like badge.
art='<div class="ob-orbit-art"><img src="assets/orbita-communities-orbit.png" alt="Ядро платформы — связь и инструменты; вокруг него на орбитах четыре самостоятельных сообщества" width="1536" height="1024" fetchpriority="high" /></div>'
s,n=re.subn(r'\(0,d.jsx\)\("img",\{className:"hero-render",src:"data:image/[^\"]+",alt:"[^\"]+",fetchPriority:"high"\}\)', lambda m: '(0,d.jsx)("div",{dangerouslySetInnerHTML:{__html:'+json.dumps(art)+'}})',s);assert n==1,n
# Preserve the approved original subtitle and make its meaning explicit again.
s=s.replace('Каждое сообщество создаёт свой инструмент','Каждое сообщество сохраняет самостоятельность. ').replace('или берёт инструмент другого сообщества.','Знания, связи и инструменты работают вместе.')
# Add neutral map taxonomy note; no claim to actual data flow.
s=s.replace('e==="map"&&(0,d.jsxs)("section",','e==="map"&&(0,d.jsx)("div",{className:"ob-legend",children:"Связи показывают совместные сценарии, не передачу данных. Экспертные · проектные · образовательные · деловые; прочие типы согласуем на пилоте."}),e==="map"&&(0,d.jsxs)("section",',1)
s=s.replace('В приложении нет обязательных полей имени, телефона или личной переписки. Не добавляйте личные контакты в описания и названия.','В демонстрационных анкетах используйте вымышленные сведения. E-mail и запрос участника исключены из публичного предпросмотра. Реальные данные здесь не собираем.')
s=s.replace('Экспортируйте снимок для переноса и резервной копии. Kodik Chat подключим на следующем этапе.','Экспорт JSON переносит только каталог сети, сценарии, профили и план. Анкеты и идеи хранятся отдельно в этом браузере. Реальные агенты не подключены.')
s=s.replace('</head>','<style>'+(p/'extension.css').read_text()+'</style></head>',1)
(p/'dist').mkdir(exist_ok=True);(p/'dist/index.html').write_text(s)
# Syntax-only extract exact bundled script for independent parse.
from html.parser import HTMLParser
class Parse(HTMLParser):
 def __init__(self):super().__init__();self.ins=False;self.scripts=[]
 def handle_starttag(self,t,a):
  if t=='script':self.ins=True
 def handle_endtag(self,t):
  if t=='script':self.ins=False
 def handle_data(self,d):
  if self.ins:self.scripts.append(d)
pz=Parse();pz.feed(s);(p/'bundle-check.js').write_text('\n'.join(pz.scripts))
print('built',len(s))

import shutil
shutil.copytree(p/'assets',p/'dist/assets',dirs_exist_ok=True)

exec((p/"user_surface.py").read_text())
