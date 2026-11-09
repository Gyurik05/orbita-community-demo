const assert=require('assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm');
let states=[],cursor=0,store={},writeFails=false;
const navigated=[];
const context={
  console,localStorage:{getItem:k=>store[k]??null,setItem:(k,v)=>{if(writeFails)throw Error('quota');store[k]=v}},
  B:{createElement:(tag,props,...children)=>({tag,props:props||{},children:children.flat(Infinity).filter(x=>x!==false&&x!=null)}),useState:init=>{const i=cursor++;if(!(i in states))states[i]=typeof init==='function'?init():init;return [states[i],v=>states[i]=typeof v==='function'?v(states[i]):v]}}
};
vm.createContext(context);
for(const f of ['platform.js','extra.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..',f),'utf8'),context);
function text(n){return n&&typeof n==='object'?(n.children||[]).map(text).join(' '):String(n??'')}
function walk(n){return n&&typeof n==='object'?[n,...(n.children||[]).flatMap(walk)]:[]}
function button(tree,label){const b=walk(tree).find(n=>n.tag==='button'&&text(n)===label);assert(b,'Missing button: '+label);return b}
function render(view){cursor=0;return context.OrbitaPlatform({view,onNavigate:id=>navigated.push(id)})}
const expected=[['map','Карта сети'],['communities','Сообщества'],['resources','Запросы и ресурсы'],['scenarios','Совместные сценарии'],['events','События и встречи'],['results','Результаты сотрудничества'],['development','Развитие Орбиты'],['ideas','Идеи и предложения'],['platform-tasks','Задачи платформы'],['recognition','Вклад и признание'],['tools','Лаборатория инструментов'],['plan','Дорожная карта']];
const nav=context.OrbitaNav({view:'plan',onNavigate:id=>navigated.push(id)});
const groups=walk(nav).filter(n=>n.props.className==='ob-nav-group');
assert.equal(groups.length,2);
assert.equal(text(groups[0].children[0]),'Жизнь сообществ');
assert.equal(text(groups[1].children[0]),'Жизнь платформы');
for(const group of groups)assert.equal(walk(group).filter(n=>n.tag==='button').length,6);
const navButtons=walk(nav).filter(n=>n.tag==='button');
assert.equal(text(navButtons[0]).trim(),'◈ Обзор');
for(let i=0;i<expected.length;i++){
  assert.equal(text(navButtons[i+1]).trim(),'◈ '+expected[i][1]);
  navButtons[i+1].props.onClick();assert.equal(navigated.at(-1),expected[i][0]);
}
assert.equal(navButtons.find(n=>text(n).includes('Дорожная карта')).props['aria-current'],'page');
for(const [view,title] of expected.filter(([id])=>['development','platform-tasks','recognition','plan'].includes(id))){
  states=[];const tree=render(view);assert.equal(text(walk(tree).find(n=>n.tag==='h1')),title);
  assert(text(tree).includes('localStorage'));assert(text(tree).includes('Общей базы, отправки команде и реальных аккаунтов нет'));
  assert(!text(tree).includes('15 декабря'));assert(!text(tree).includes('Собрать протокол'));
}
states=[];let tree=render('platform-tasks');
button(tree,'Выбрать локально').props.onClick();tree=render('platform-tasks');
assert.equal(JSON.parse(store['orbita-platform-participation-v1']).length,1);
assert(text(tree).includes('Команда не уведомлена'));
assert.equal(button(tree,'Отменить локальный выбор').props['aria-pressed'],true);
states=[];tree=render('recognition');assert(text(tree).includes('Мой локальный выбор'));assert(text(tree).includes('Подтверждённого вклада пока нет'));
tree=render('platform-tasks');button(tree,'Отменить локальный выбор').props.onClick();
assert.deepEqual(JSON.parse(store['orbita-platform-participation-v1']),[]);
tree=render('platform-tasks');writeFails=true;button(tree,'Выбрать локально').props.onClick();tree=render('platform-tasks');assert(text(tree).includes('Выбор не изменён'));assert.deepEqual(JSON.parse(store['orbita-platform-participation-v1']),[]);writeFails=false;
store['orbita-platform-participation-v1']='{broken';states=[];tree=render('platform-tasks');assert(walk(tree).some(n=>n.props.role==='alert'));assert.equal(button(tree,'Выбрать локально').props.disabled,true);button(tree,'Выбрать локально').props.onClick();assert.equal(store['orbita-platform-participation-v1'],'{broken');
for(const malformed of [{},['unknown'],['test-network-map','test-network-map']]){store['orbita-platform-participation-v1']=JSON.stringify(malformed);assert(context.OB_platformSelection().error)}
store={};states=[];tree=render('plan');button(tree,'Открыть карту сети').props.onClick();assert.equal(navigated.at(-1),'map');
const data={communities:[],scenarios:[{id:'no-result',title:'Без описания результата',stage:'ready',result:''},{id:'with-result',title:'Демо-итог',stage:'ready',result:'Вымышленный итог'}]};
tree=context.OrbitaExtra({view:'results',data,onNavigate:id=>navigated.push(id)});assert(text(tree).includes('Демо-итог'));assert(!text(tree).includes('Без описания результата'));assert(text(tree).includes('Не подтверждённое достижение'));
const surface=fs.readFileSync(path.join(__dirname,'..','user_surface.py'),'utf8');
assert(!surface.includes('["plan","development","platform-tasks","recognition"].includes'));
assert(surface.includes('window.addEventListener("popstate",sync)'));assert(surface.includes('window.addEventListener("hashchange",sync)'));
const build=fs.readFileSync(path.join(__dirname,'..','build.py'),'utf8');
assert(build.includes("'platform.js'"));assert(build.match(/custom=\[.*'plan'\]/));
const bundle=fs.readFileSync(path.join(__dirname,'..','bundle-check.js'),'utf8');
assert(bundle.includes('h(OrbitaPlatform,{view,onNavigate})'));assert(!bundle.includes('["plan","development","platform-tasks","recognition"].includes'));
console.log('PASS two groups × six routes, accessible active navigation, platform pages, public roadmap, local choice/persistence/withdrawal, storage errors, results honesty, deep-link/history guards');
