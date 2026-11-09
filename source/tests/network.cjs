const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert/strict');

const source = fs.readFileSync(path.join(__dirname, '..', 'network.js'), 'utf8');
const KEY = 'orbita-relations-v1';
const types = ['expert', 'project', 'resource', 'education', 'business', 'strategy'];
const names = ['Экспертные', 'Проектные', 'Ресурсные', 'Образовательные', 'Деловые', 'Стратегические'];
const communities = [
  { id: 'c0', name: 'Технологии будущего' },
  { id: 'c1', name: 'Среда образования' },
  { id: 'c2', name: 'Круг предпринимателей' },
  { id: 'c3', name: 'Открытая наука' },
  { id: 'c4', name: 'Креативная мастерская' },
  { id: 'c5', name: 'Городские инициативы и соседские проекты' },
];
const edges = types.map((type, i) => ({
  id: 'edge-' + i, from: 'c0', to: i === 0 ? 'c1' : 'c' + i,
  type, title: 'Демо ' + names[i], description: 'Демонстрационный пример', demo: true,
}));
const text = n => typeof n === 'object' ? (n.children || []).map(text).join(' ').trim() : String(n);
const walk = n => typeof n === 'object' ? [n, ...(n.children || []).flatMap(walk)] : [];
function harness(saved = { version: 1, edges }, data = { communities, scenarios: [] }) {
  const store = saved === null ? {} : { [KEY]: typeof saved === 'string' ? saved : JSON.stringify(saved) };
  const states = [];
  let cursor = 0, writes = 0, denyWrites = false;
  const context = {
    crypto: require('crypto').webcrypto,
    localStorage: {
      getItem: key => store[key] ?? null,
      setItem: (key, value) => { if (denyWrites) throw Error('Storage unavailable'); store[key] = value; writes++; },
    },
    window: { location: { reload() {} } },
    B: {
      createElement: (tag, props, ...children) => ({ tag, props: props || {}, children: children.flat(Infinity).filter(x => x !== false && x != null) }),
      useState: initial => { const i = cursor++; if (!(i in states)) states[i] = typeof initial === 'function' ? initial() : initial; return [states[i], next => { states[i] = typeof next === 'function' ? next(states[i]) : next; }]; },
    },
  };
  vm.createContext(context);
  vm.runInContext(source, context);
  const render = () => { cursor = 0; return context.OrbitaNetwork({ data, onNavigate() {} }); };
  const find = predicate => { const node = walk(render()).find(predicate); assert(node, 'Expected UI node'); return node; };
  const click = title => find(n => n.tag === 'button' && text(n) === title).props.onClick();
  const field = (label, value) => {
    const group = find(n => n.tag === 'label' && text(n).startsWith(label));
    const input = walk(group).find(n => ['input', 'textarea', 'select'].includes(n.tag));
    assert(input, 'Expected input for ' + label);
    input.props.onChange({ target: { value } });
  };
  const submit = () => find(n => n.tag === 'form').props.onSubmit({ preventDefault() {} });
  return { render, find, click, field, submit, store, get writes() { return writes; }, failWrites() { denyWrites = true; } };
}

// Exactly six count cards, with the exact type name below each count.
let app = harness();
const cards = walk(app.render()).filter(n => n.props.className === 'on-type');
assert.equal(cards.length, 6);
assert.deepEqual(cards.map(n => text(n.children[1])), names);
assert(cards.every(n => n.children[0].props.className === 'on-count' && text(n.children[0]) === '1'));
assert(!text(app.render()).includes('Партнёрские'));
assert(!text(app.render()).includes('Институциональные'));
const svg = app.find(n => n.tag === 'svg');
const nodes = walk(svg).filter(n => n.tag === 'g' && n.props['aria-label']?.startsWith('Показать связи:'));
assert.equal(nodes.length, communities.length);
nodes.forEach((node, i) => {
  assert(text(node).includes(communities[i].name), 'Full community names remain on nodes');
  assert(!walk(node).filter(n => n.tag === 'text').some(n => /^\d+$/.test(text(n))), 'Node badges must not be confused with type counts');
});
assert(text(app.render()).includes('реальные договорённости не подтверждены'));
assert(!source.includes('.on-diagram{display:none}'), 'The map remains available on mobile');

// Filters, descriptions, keyboard activation and repeated toggles.
names.forEach((name, i) => {
  app.find(n => n.props.className === 'on-type' && n.props['aria-label'].startsWith(name + ':')).props.onClick();
  assert.equal(walk(app.render()).filter(n => n.props.className === 'on-link').length, 1);
  assert(text(app.render()).includes(edges[i].title));
  app.find(n => n.props.className === 'on-type' && n.props['aria-label'].startsWith(name + ':')).props.onClick();
  assert.equal(walk(app.render()).filter(n => n.props.className === 'on-link').length, 6);
});
const focusNode = app.find(n => n.props['aria-label'] === 'Показать связи: Открытая наука');
focusNode.props.onKeyDown({ key: 'Enter', preventDefault() {} });
assert.equal(walk(app.render()).filter(n => n.props.className === 'on-link').length, 1);
app.click('Сбросить фильтры');
app.find(n => n.tag === 'g' && n.props['aria-label']?.startsWith('Стратегические:')).props.onKeyDown({ key: ' ', preventDefault() {} });
assert(text(app.find(n => n.props['aria-label'] === 'Подробности связи')).includes('не подтверждённая договорённость'));
app.click('Закрыть подробности');

// Local CRUD and form taxonomy, with no writes from browsing or dismissal.
assert.equal(app.writes, 0);
app.click('Добавить связь');
const formTypes = walk(app.find(n => n.tag === 'label' && text(n).startsWith('Тип связи'))).filter(n => n.tag === 'option');
assert.deepEqual(formTypes.map(n => text(n)), names);
app.click('Отмена');
assert.equal(app.writes, 0);
app.click('Добавить связь');
app.field('Тип связи', 'strategy');
app.field('Название сотрудничества', 'Локальный пример стратегии');
app.field('Что объединяем', 'Общая исследовательская задача');
app.submit();
assert.equal(app.writes, 1);
assert.equal(JSON.parse(app.store[KEY]).edges.length, 7);
assert(text(app.render()).includes('реальное сотрудничество не подтверждены'));
app.click('Редактировать');
app.field('Название сотрудничества', 'Обновлённый пример стратегии');
app.submit();
assert.equal(app.writes, 2);
app.click('Удалить связь');
app.click('Отмена');
assert.equal(app.writes, 2);
app.click('Удалить связь');
app.click('Да, удалить');
assert.equal(JSON.parse(app.store[KEY]).edges.length, 6);
const reloaded = harness(app.store[KEY]);
assert.equal(walk(reloaded.render()).filter(n => n.props.className === 'on-link').length, 6);

// Reject removed types and duplicate undirected pairs, including tampered form input.
app.click('Добавить связь');
app.field('Название сотрудничества', 'Проверка');
app.field('Тип связи', 'partner');
app.submit();
assert(text(app.render()).includes('Выберите один из шести типов связи'));
app.field('Тип связи', 'expert');
app.field('Первое сообщество', 'c1');
app.field('Второе сообщество', 'c0');
app.submit();
assert(text(app.render()).includes('У этой пары уже есть связь выбранного типа'));
assert.equal(app.writes, 3);

// Old records are retained byte-for-byte as data, never reclassified or rendered.
const legacy = { ...edges[0], id: 'legacy', type: 'partner', title: 'Старая запись' };
app = harness({ version: 1, edges: [...edges, legacy] });
assert(text(app.render()).includes('Записей прежних типов: 1'));
assert(!text(app.render()).includes(legacy.title));
assert.equal(app.writes, 0);
assert.equal(walk(app.render()).filter(n => n.props.className === 'on-link').length, 6);
app.find(n => n.props.className === 'on-link').props.onClick();
app.click('Редактировать');
app.field('Название сотрудничества', 'Изменённый актуальный тип');
app.submit();
assert.deepEqual(JSON.parse(app.store[KEY]).edges.find(e => e.id === 'legacy'), legacy);

// Parallel relationships remain distinct even when endpoints are stored in reverse order.
app = harness({ version: 1, edges: [edges[0], { ...edges[1], from: 'c1', to: 'c0' }] });
const edgeGroups = () => walk(app.find(n => n.tag === 'svg')).filter(n => n.tag === 'g' && /^(Экспертные|Проектные):/.test(n.props['aria-label'] || ''));
const geometry = group => walk(group).find(n => n.tag === 'path' && n.props.stroke !== 'transparent').props.d;
const midpoints = edgeGroups().map(group => walk(group).find(n => n.tag === 'circle').props);
assert.notEqual(midpoints[0].cx + ',' + midpoints[0].cy, midpoints[1].cx + ',' + midpoints[1].cy);
const originalExpertPath = geometry(edgeGroups()[0]);
app.find(n => n.props.className === 'on-type' && n.props['aria-label'].startsWith('Экспертные:')).props.onClick();
assert.equal(edgeGroups().length, 1);
assert.equal(geometry(edgeGroups()[0]), originalExpertPath, 'Filtering must not move the surviving line');

// Storage safety, orphaned communities and a clean empty state.
app = harness('{broken');
assert(app.find(n => n.tag === 'button' && text(n) === 'Добавить связь').props.disabled);
assert.equal(app.writes, 0);
app = harness({ version: 1, edges: [{ ...edges[0], type: 'unknown' }] });
assert(text(app.render()).includes('Сохранение заблокировано'));
app = harness(); app.failWrites(); app.click('Добавить связь');
app.field('Тип связи', 'strategy'); app.field('Название сотрудничества', 'Не сохранено'); app.submit();
assert.equal(JSON.parse(app.store[KEY]).edges.length, 6);
assert(text(app.render()).includes('Данные на экране не изменены'));
app = harness({ version: 1, edges: [{ ...edges[0], to: 'missing' }] });
assert(text(app.render()).includes('Связей пока нет'));
app = harness(null, { communities: [], scenarios: [] });
assert(text(app.render()).includes('Добавьте сообщества'));
assert.equal(walk(app.render()).filter(n => n.props.className === 'on-type').length, 6);
console.log('PASS map: six named count cards, community nodes, filters, keyboard, CRUD, legacy preservation, storage safety and empty states');
