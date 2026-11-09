/* Integration test. Requires a running local build and a usable Chromium. */
const assert=require('assert/strict');
const {chromium}=require('playwright');
const base=process.env.ORBITA_URL||'http://127.0.0.1:8765';
const routes=[['map','Карта сети'],['communities','Сообщества'],['resources','Запросы и ресурсы'],['scenarios','Совместные сценарии'],['events','События и встречи'],['results','Результаты сотрудничества'],['development','Развитие Орбиты'],['ideas','Идеи и предложения'],['platform-tasks','Задачи платформы'],['recognition','Вклад и признание'],['tools','Лаборатория инструментов'],['plan','Дорожная карта']];
(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
  try {
    const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base);await page.locator('nav.ob-nav').waitFor();
    const groups=page.locator('.ob-nav-group');assert.equal(await groups.count(),2);
    assert.deepEqual(await groups.locator('.ob-nav-label').allTextContents(),['Жизнь сообществ','Жизнь платформы']);
    for(let i=0;i<2;i++)assert.equal(await groups.nth(i).getByRole('button').count(),6);
    for(const [id,title] of routes){
      await page.locator('nav.ob-nav').getByRole('button',{name:title,exact:true}).click();
      await page.waitForURL('**/#'+id);assert(await page.locator('main').innerText());
      assert.equal(await page.locator('nav.ob-nav [aria-current="page"] span').last().innerText(),title);
      await page.reload();await page.locator('nav.ob-nav [aria-current="page"]').waitFor();assert.equal(new URL(page.url()).hash,'#'+id);
      assert.equal(await page.locator('nav.ob-nav [aria-current="page"] span').last().innerText(),title);
    }
    assert(await page.locator('main').getByRole('heading',{name:'Дорожная карта',exact:true}).isVisible());
    assert(!(await page.locator('main').innerText()).includes('Собрать протокол'));
    await page.locator('nav.ob-nav').getByRole('button',{name:'Развитие Орбиты',exact:true}).click();
    await page.locator('nav.ob-nav').getByRole('button',{name:'Вклад и признание',exact:true}).click();
    await page.goBack();await page.waitForURL('**/#development');assert(await page.locator('main').getByRole('heading',{name:'Развитие Орбиты',exact:true}).isVisible());
    await page.goForward();await page.waitForURL('**/#recognition');assert(await page.locator('main').getByRole('heading',{name:'Вклад и признание',exact:true}).isVisible());
    const history=await page.evaluate(()=>window.history.length);
    await page.locator('nav.ob-nav').getByRole('button',{name:'Вклад и признание',exact:true}).click();assert.equal(await page.evaluate(()=>window.history.length),history);
    await page.locator('nav.ob-nav').getByRole('button',{name:'Задачи платформы',exact:true}).click();
    await page.getByRole('button',{name:'Выбрать локально',exact:true}).first().click();
    await page.reload();await page.getByRole('button',{name:'Отменить локальный выбор',exact:true}).waitFor();
    await page.getByRole('button',{name:'Отменить локальный выбор',exact:true}).click();assert.equal(await page.getByRole('button',{name:'Отменить локальный выбор',exact:true}).count(),0);
    await page.setViewportSize({width:390,height:844});
    await page.getByRole('button',{name:'Открыть меню',exact:true}).click();
    await page.locator('nav.ob-nav').getByRole('button',{name:'Дорожная карта',exact:true}).click();
    assert(await page.locator('main').getByRole('heading',{name:'Дорожная карта',exact:true}).isVisible());
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));
    assert.deepEqual(errors,[]);console.log('PASS 12 section clicks/reloads, history/repeated navigation, local task selection, mobile menu/overflow, runtime errors');
  } finally {await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
