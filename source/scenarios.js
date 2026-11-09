function OrbitaScenarios({data,onSave,onOpen,onNavigate}) {
  const h = B.createElement;
  const [query,setQuery] = B.useState("");
  const [filter,setFilter] = B.useState("all");
  const [feed,setFeed] = B.useState("all");
  const [leaving,setLeaving] = B.useState(false);
  const [joining,setJoining] = B.useState(null);
  const [community,setCommunity] = B.useState("");
  const [busy,setBusy] = B.useState(false);
  const [notice,setNotice] = B.useState("");
  const [error,setError] = B.useState("");
  const lock = B.useRef(false);
  const scenarios = data.scenarios || [];
  const communities = data.communities || [];
  const stages = {
    idea:{label:"Ищем партнёров",next:"Обсудить задачу и найти сообщество-партнёра",color:"purple"},
    agreed:{label:"Согласовано",next:"Подтвердить вклад участников и план работы",color:"blue"},
    building:{label:"В работе",next:"Сверить следующий шаг с ответственным",color:"orange"},
    ready:{label:"Готово",next:"Проверить результат и описать пользу для сообществ",color:"teal"}
  };
  const ready = scenarios.filter(s=>s.stage === "ready" && String(s.result||"").trim());
  const inCooperation = new Set(scenarios.filter(s=>(s.communityIds||[]).length>1).flatMap(s=>s.communityIds).filter(id=>communities.some(c=>c.id===id)));
  let profile = null;
  try { profile = (window.OrbitaHub?.read()?.cards || []).find(c=>c.id==="local-participant") || null; } catch (_) { /* The local profile may not be available yet. */ }
  const words = value => (Array.isArray(value)?value.join(" "):String(value||"")).toLocaleLowerCase("ru").split(/[^\p{L}\p{N}]+/u).filter(w=>w.length>2);
  const profileWords = [...new Set([...words(profile?.topics),...words(profile?.contribution)])];
  const hasProfile = !!profile && (!!profile.communityId || profileWords.length>0);
  const matchesProfile = s => hasProfile && ((s.communityIds||[]).includes(profile.communityId) || profileWords.some(w=>[s.title,s.description,s.result,...(s.topics||[])].join(" ").toLocaleLowerCase("ru").includes(w)));
  const visible = scenarios.filter(s=>(feed==="all"||matchesProfile(s)) && (filter==="all"||s.stage===filter) && [s.title,s.description,s.result,...(s.communityIds||[]).map(id=>communities.find(c=>c.id===id)?.name||"")].join(" ").toLocaleLowerCase("ru").includes(query.toLocaleLowerCase("ru")));
  const selected = scenarios.find(s=>s.id===joining);
  const choices = selected ? communities.filter(c=>leaving ? (selected.communityIds||[]).includes(c.id) : c.status!=="disconnected" && !(selected.communityIds||[]).includes(c.id)) : [];
  B.useEffect(()=>{if(!joining)return;const close=e=>{if(e.key==="Escape"&&!lock.current)setJoining(null)};document.addEventListener("keydown",close);return()=>document.removeEventListener("keydown",close)},[joining]);
  async function join(e) {
    e.preventDefault();
    if(lock.current||!selected||!community)return;
    const current=scenarios.find(s=>s.id===selected.id);
    if(!current){setError("Сценарий больше не доступен. Закройте окно и обновите список.");return;}
    if(!choices.some(c=>c.id===community)){setError("Выберите доступное сообщество");return;}
    lock.current=true;setBusy(true);setError("");
    try {
      const updated={...data,scenarios:scenarios.map(s=>s.id===current.id?{...s,communityIds:leaving?(s.communityIds||[]).filter(id=>id!==community):[...new Set([...(s.communityIds||[]),community])]}:s)};
      const ok=await onSave(updated,leaving?"Участие сообщества отозвано в прототипе":"Сообщество присоединилось к сценарию в прототипе");
      if(ok){setJoining(null);setCommunity("");setNotice(leaving?"Участие отозвано только в прототипе. Сценарий сохранён, присоединиться снова можно в любой момент. Внешние уведомления не отправлялись.":"Участие добавлено в прототипе. Приглашения не отправлялись, доступ к данным не открывался.");}
      else setError("Не удалось сохранить участие. Проверьте сообщение об ошибке и повторите.");
    } catch(e) {setError(e instanceof Error?e.message:"Не удалось сохранить участие");}
    finally {lock.current=false;setBusy(false);}
  }
  return h("section",{className:"ob-scenarios"},
    h("style",null,`
      .ob-scenarios{color:#34596a}.ob-scenarios *{box-sizing:border-box}.ob-sc-head{display:flex;justify-content:space-between;gap:20px;align-items:center;margin-bottom:22px}.ob-sc-head h1{font-size:32px;letter-spacing:-1px;margin:6px 0 10px;font-weight:550;color:#264855}.ob-sc-head p{font-size:13px;line-height:1.7;max-width:650px;color:#607c88}.ob-sc-eyebrow{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#5a7c8c}.ob-sc-primary,.ob-sc-secondary{border-radius:12px;padding:12px 17px;font-size:12px;line-height:1.5;cursor:pointer;min-height:42px}.ob-sc-primary{background:linear-gradient(115deg,#5de1cf,#4ca7d5);color:#123e4b;border:1px solid #fff;box-shadow:0 5px 16px #4ea4bc26,inset 0 1px 2px #fff9;font-weight:600}.ob-sc-secondary{background:#ffffff8a;border:1px solid #fff;color:#426976}.ob-scenarios button:focus-visible,.ob-scenarios input:focus-visible,.ob-scenarios select:focus-visible{outline:3px solid #177f91;outline-offset:3px}.ob-scenarios button:disabled{opacity:.5;cursor:not-allowed}.ob-sc-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:12px}.ob-sc-kpi{padding:20px;background:linear-gradient(130deg,#faffffb8,#f0eafa8a);border:1px solid white;border-radius:18px;box-shadow:0 6px 20px #547e9710}.ob-sc-kpi strong{font-size:32px;font-weight:500;color:#345a70;display:block}.ob-sc-kpi span{display:block;font-size:11px;line-height:1.5;margin-top:8px;color:#5c7788}.ob-sc-note{font-size:11px;line-height:1.7;color:#617982;margin:12px 0 24px}.ob-sc-toolbar{display:flex;justify-content:space-between;gap:14px;align-items:center;flex-wrap:wrap;margin:20px 0}.ob-sc-tabs{display:flex;gap:5px;flex-wrap:wrap}.ob-sc-tab{font-size:11px;padding:10px 12px;border-radius:10px;border:1px solid transparent;color:#577486;min-height:40px;background:transparent}.ob-sc-tab[aria-pressed=true]{background:#fff9;border-color:#fff;color:#135d6c;box-shadow:0 2px 8px #57879b12}.ob-sc-search{max-width:100%;width:260px;font-size:12px!important;background:#fff9!important;border-color:#fff!important}.ob-sc-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}.ob-sc-card{border:1px solid #fff;border-radius:20px;overflow:hidden;background:linear-gradient(130deg,#ffffffbf,#e9f5fb88);box-shadow:0 9px 22px #4b6a8412;display:flex;flex-direction:column;min-width:0}.ob-sc-art{height:105px;position:relative;overflow:hidden;background:linear-gradient(120deg,#bfeee7,#a9c8e9,#dcd3f3)}.ob-sc-card:nth-child(3n+2) .ob-sc-art{background:linear-gradient(120deg,#bcccf0,#c9b5e5,#e6def9)}.ob-sc-card:nth-child(3n) .ob-sc-art{background:linear-gradient(120deg,#c0e0ec,#91bfce,#d1f0e9)}.ob-sc-orbit{position:absolute;width:145px;height:55px;border:1px solid #ffffffe0;border-radius:50%;transform:rotate(-24deg);right:25px;top:24px;box-shadow:0 0 18px #fff8,inset 0 0 18px #fff5}.ob-sc-orbit:before{content:'';position:absolute;width:60px;height:60px;left:42px;top:-5px;border-radius:50%;background:radial-gradient(circle at 28% 25%,#fffffff0,#a9ded9aa 43%,#6caccf88 65%,#fafaffaa);box-shadow:inset -8px -8px 15px #538baf45,5px 8px 15px #49739333;border:1px solid #fff}.ob-sc-orbit:after{content:'';position:absolute;width:9px;height:9px;background:#f9ffff;border-radius:50%;right:0;top:14px;box-shadow:0 0 14px white}.ob-sc-art-label{position:absolute;left:18px;top:16px;font-size:10px;letter-spacing:.6px;color:#315b72;max-width:140px}.ob-sc-body{padding:19px;display:flex;flex-direction:column;gap:12px;flex:1}.ob-sc-body h2{font-size:16px;line-height:1.4;font-weight:600;color:#2c4e62;margin:0}.ob-sc-body>p{font-size:12px;line-height:1.65;margin:0;color:#607b89}.ob-sc-people{display:flex;gap:5px;flex-wrap:wrap}.ob-sc-people span{padding:5px 7px;border-radius:7px;background:#ffffff80;color:#536e81;font-size:10px;line-height:1.4}.ob-sc-body dl{margin:0;display:grid;gap:9px}.ob-sc-body dt{font-size:9px;text-transform:uppercase;letter-spacing:.7px;color:#708b98;margin-bottom:3px}.ob-sc-body dd{font-size:11px;line-height:1.6;margin:0;color:#446676}.ob-sc-bottom{margin-top:auto;padding-top:12px;border-top:1px solid #d2dfe95e;display:flex;gap:8px;flex-wrap:wrap;align-items:center}.ob-sc-status{font-size:10px;border-radius:8px;padding:5px 8px;background:#d6eaf6;color:#32647c}.ob-sc-bottom time{font-size:10px;color:#607d89;margin-left:auto}.ob-sc-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:3px}.ob-sc-actions button{flex:1;font-size:10px;padding:9px;min-width:110px}.ob-sc-empty{padding:45px;text-align:center;border:1px solid #fff;border-radius:20px;background:#fff8;color:#587584}.ob-sc-callout{padding:16px 20px;border:1px solid #fff;border-radius:14px;background:#e2f5f18a;font-size:12px;line-height:1.7;margin:15px 0}.ob-sc-dialog-back{position:fixed;inset:0;z-index:150;background:#233a5266;backdrop-filter:blur(6px);display:grid;place-items:center;padding:20px}.ob-sc-dialog{max-width:520px;width:100%;max-height:90vh;overflow:auto;background:#f4f9fc;border:1px solid white;border-radius:22px;padding:28px;box-shadow:0 25px 80px #172d4b44}.ob-sc-dialog h2{font-size:23px;line-height:1.4;margin:0 0 15px;color:#294f61}.ob-sc-dialog p{font-size:13px;line-height:1.7;color:#587785}.ob-sc-dialog label{display:block;font-size:12px;line-height:1.6;margin:18px 0}.ob-sc-dialog select{display:block;width:100%;margin-top:8px;background:white}.ob-sc-dialog-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:20px}.ob-sc-error{color:#943c3c;font-size:12px;line-height:1.6}.ob-sc-bottomline{margin:28px 0;font-size:12px;line-height:1.8;color:#5a7789}.ob-sc-bottomline strong{color:#365c70}@media(max-width:1100px){.ob-sc-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.ob-sc-head h1{font-size:28px}}@media(max-width:620px){.ob-sc-head{align-items:flex-start;flex-direction:column}.ob-sc-head h1{font-size:27px}.ob-sc-kpis{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.ob-sc-kpi{padding:15px}.ob-sc-kpi strong{font-size:27px}.ob-sc-grid{grid-template-columns:1fr}.ob-sc-search{width:100%}.ob-sc-dialog{padding:20px}.ob-sc-toolbar{align-items:stretch}.ob-sc-art{height:110px}}@media(prefers-reduced-motion:reduce){.ob-scenarios *{scroll-behavior:auto}}
    `),
    h("div",{className:"ob-sc-head"},h("div",null,h("span",{className:"ob-sc-eyebrow"},"От идеи к общему результату"),h("h1",null,"Совместные сценарии"),h("p",null,"От запроса одного сообщества — к результату, созданному вместе")),h("button",{className:"ob-sc-primary",onClick:()=>onOpen()},"＋ Предложить сценарий")),
    h("div",{className:"ob-sc-kpis"},[
      [scenarios.filter(s=>s.stage!=="ready").length,"Открытые инициативы"],
      [inCooperation.size,"Сообщества в сотрудничестве"],
      [scenarios.filter(s=>s.stage==="building").length,"Проекты в работе"],
      [ready.length,"Полученные результаты"]
    ].map(([n,title])=>h("div",{className:"ob-sc-kpi",key:title},h("strong",null,n),h("span",null,title)))),
    h("p",{className:"ob-sc-note"},"Учебный прототип. Показатели рассчитаны по карточкам текущего режима. Статус «Готово» означает запись результата, а не независимое подтверждение внедрения."),
    notice&&h("div",{className:"ob-sc-callout",role:"status"},notice),
    h("div",{className:"ob-sc-tabs","aria-label":"Лента сценариев"},[["all","Вся лента"],["profile","По моему профилю"]].map(([id,title])=>h("button",{key:id,className:"ob-sc-tab","aria-pressed":feed===id,onClick:()=>setFeed(id)},title))),
    feed==="profile"&&h("p",{className:"ob-sc-note"},"Локальный подбор по сообществу, темам и вкладу из вашей визитки. Совпадение слов не означает приглашение или подписку."),
    h("div",{className:"ob-sc-toolbar"},h("div",{className:"ob-sc-tabs","aria-label":"Статус сценария"},[["all","Все сценарии"],["idea","Ищем партнёров"],["agreed","Согласовано"],["building","В работе"],["ready","Готово"]].map(([id,title])=>h("button",{key:id,className:"ob-sc-tab","aria-pressed":filter===id,onClick:()=>setFilter(id)},title))),h("input",{className:"ob-sc-search",type:"search",value:query,onChange:e=>setQuery(e.target.value),placeholder:"Найти сценарий или сообщество","aria-label":"Поиск совместных сценариев"})),
    h("div",{className:"ob-sc-grid"},visible.map((s,index)=>{
      const participants=(s.communityIds||[]).map(id=>communities.find(c=>c.id===id)).filter(Boolean);
      const resources=[...new Set(participants.flatMap(c=>c.resources||[]))];
      const state=stages[s.stage]||stages.idea;
      return h("article",{className:"ob-sc-card",key:s.id},
        h("div",{className:"ob-sc-art","aria-hidden":true},h("span",{className:"ob-sc-art-label"},participants.length>1?"СОЗДАЁМ ВМЕСТЕ":"ОТКРЫТАЯ ИНИЦИАТИВА"),h("i",{className:"ob-sc-orbit"})),
        h("div",{className:"ob-sc-body"},h("h2",null,s.title),h("p",null,s.description||"Описание задачи пока не добавлено"),h("div",{className:"ob-sc-people","aria-label":"Участники сценария"},participants.length?participants.map(c=>h("span",{key:c.id},c.name)):h("span",null,"Ищем первое сообщество")),
          h("dl",null,
            h("div",null,h("dt",null,"Ресурсы сообществ · заявлены"),h("dd",null,resources.length?resources.join(" · "):"Участники ещё не согласовали ресурсы")),
            h("div",null,h("dt",null,s.stage==="ready"?"Записанный результат":"Ожидаемый результат"),h("dd",null,s.result||"Уточнить вместе с партнёрами")),
            h("div",null,h("dt",null,"Следующий шаг · ориентир"),h("dd",null,participants.length?state.next:"Пригласить первое сообщество к обсуждению; карточка сохранена")),
            h("div",null,h("dt",null,"Ответственный"),h("dd",null,s.owner||"Пока не назначен"))
          ),
          h("div",{className:"ob-sc-bottom"},h("span",{className:"ob-sc-status"},state.label),s.due&&h("time",{dateTime:s.due},"Срок: "+new Intl.DateTimeFormat("ru-RU",{day:"numeric",month:"short",timeZone:"UTC"}).format(new Date(s.due)))),
          h("div",{className:"ob-sc-actions"},h("button",{className:"ob-sc-primary",onClick:()=>{setLeaving(false);setJoining(s.id);setCommunity("");setError("")}},"Присоединиться к сценарию"),participants.length>0&&h("button",{className:"ob-sc-secondary",onClick:()=>{setLeaving(true);setJoining(s.id);setCommunity("");setError("")}},"Выйти из сценария"),h("button",{className:"ob-sc-secondary",onClick:()=>onOpen(s.id)},"Подробнее / изменить"))
        )
      );
    })),
    !visible.length&&h("div",{className:"ob-sc-empty"},h("h2",null,feed==="profile"&&!hasProfile?"Заполните профиль для подбора":"Пока нет подходящих сценариев"),h("p",null,feed==="profile"&&!hasProfile?"Укажите сообщество, темы или вклад в своей визитке. Вся лента доступна без профиля.":"Измените поиск, откройте всю ленту или предложите свою инициативу."),feed==="profile"&&!hasProfile&&h("button",{className:"ob-sc-primary",onClick:()=>onNavigate("participant")},"Заполнить профиль"),h("button",{className:"ob-sc-secondary",onClick:()=>{setQuery("");setFilter("all");setFeed("all")}},"Сбросить фильтры")),
    h("p",{className:"ob-sc-bottomline"},h("strong",null,"Запрос → Партнёр → Сценарий → Результат. "),"Заявленные ресурсы не означают открытый доступ к базам. Участие в инициативе не меняет согласия и настройки доступа."),
    selected&&h("div",{className:"ob-sc-dialog-back",onClick:e=>{if(e.target===e.currentTarget&&!busy)setJoining(null)}},h("section",{className:"ob-sc-dialog",role:"dialog","aria-modal":true,"aria-labelledby":"ob-join-title"},h("h2",{id:"ob-join-title"},leaving?"Выйти из сценария":"Присоединиться к сценарию"),h("p",null,selected.title),h("p",null,leaving?"Выберите участвующее сообщество, которое вы представляете, и подтвердите отзыв участия. Изменение только локальное: сценарий и его результат останутся, даже если участников не останется. Присоединиться снова можно в любой момент. Уведомления не отправляются.":"В прототипе добавим выбранное сообщество к карточке. Это не отправляет приглашение и не открывает доступ к данным."),h("form",{onSubmit:join},choices.length?h("label",null,"Сообщество, которое вы представляете",h("select",{value:community,onChange:e=>setCommunity(e.target.value),required:true,disabled:busy,autoFocus:true},h("option",{value:""},"Выберите сообщество"),choices.map(c=>h("option",{key:c.id,value:c.id},c.name)))):h("p",null,leaving?"Нет участвующих сообществ, которые можно выбрать.":"Все доступные сообщества уже участвуют. Можно сначала добавить другое сообщество."),error&&h("p",{role:"alert",className:"ob-sc-error"},error),h("div",{className:"ob-sc-dialog-actions"},choices.length?h("button",{className:"ob-sc-primary",type:"submit",disabled:busy||!community},busy?"Сохраняем…":leaving?"Подтвердить выход":"Подтвердить участие"):h("button",{className:"ob-sc-primary",type:"button",onClick:()=>{setJoining(null);onNavigate("communities")}},"К сообществам"),h("button",{className:"ob-sc-secondary",type:"button",disabled:busy,onClick:()=>setJoining(null)},"Отмена")))))
  );
}
