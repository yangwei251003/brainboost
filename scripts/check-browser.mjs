import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile,mkdir,writeFile } from 'node:fs/promises';
import { resolve,extname } from 'node:path';
import assert from 'node:assert/strict';
const root=resolve('dist'),prefix='/brainboost/';
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.wav':'audio/wav','.svg':'image/svg+xml'};
const server=createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://127.0.0.1').pathname;if(!pathname.startsWith(prefix))throw Error();const f=resolve(root,pathname.slice(prefix.length)||'index.html');if(!f.startsWith(root))throw Error();const b=await readFile(f);res.writeHead(200,{'Content-Type':mime[extname(f)]||'application/octet-stream'});res.end(b);}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,...(process.env.BROWSER_CHANNEL?{channel:process.env.BROWSER_CHANNEL}:{})});
const games=[['schulte_grid','舒尔特方格'],['stroop_challenge','颜色干扰'],['echo_stream','记忆流'],['sonic_cipher','听觉密码'],['quantum_sync','量子同步'],['category_nexus','极速分类'],['hologram_recall','全息记忆'],['knowledge_king','知识核心']];
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[],bad=[],external=[];
page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)bad.push({url:r.url(),status:r.status()});});page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:')&&!r.url().startsWith('data:'))external.push(r.url());});
await page.addInitScript(ids=>{for(const id of ids)localStorage.setItem(`brainboost_tut_${id}`,'true');},games.map(g=>g[0]));
const url=`http://127.0.0.1:${server.address().port}${prefix}`;
async function enter(label){await page.goto(url,{waitUntil:'networkidle'});await page.getByRole('button',{name:new RegExp(label)}).click();await page.getByRole('button',{name:/初级/}).click();await page.getByRole('button',{name:/初始化链路/}).click();await page.getByRole('heading',{level:1,name:new RegExp(label)}).waitFor({state:'visible'});}
try{
 await page.goto(url,{waitUntil:'networkidle'});await page.getByText('本地小游戏 · 问答为示例题库 · 不调用 AI',{exact:true}).waitFor({state:'visible'});
 assert.equal(await page.getByText('0',{exact:true}).count(),0,'empty game records must not render stray zeroes');
 await mkdir('docs/assets',{recursive:true});await page.screenshot({path:'docs/assets/overview.png',fullPage:true});
 await enter('舒尔特方格');
 for(let level=1;level<=3;level++){
  const grid=page.locator('.grid.aspect-square');const n=(level+1)**2;assert.equal(await grid.locator(':scope > div').count(),n);
  for(let i=1;i<=n;i++)await grid.getByText(String(i),{exact:true}).click();
  if(level<3)await page.getByRole('button',{name:'进入下一阶段',exact:true}).click();
 }
 await page.getByRole('heading',{name:'训练完成',exact:true}).waitFor({state:'visible'});
 assert.ok(await page.evaluate(()=>JSON.parse(localStorage.getItem('brainboost_record_schulte_grid')||'{}').bestTime>0));
 await enter('知识核心');
 for(const [i,answer]of ['8','2','大约减半','180°','圆周率π'].entries()){
  await page.getByRole('button',{name:answer,exact:true}).click();await page.getByRole('heading',{name:'分析正确',exact:true}).waitFor({state:'visible'});
  await page.getByRole('button',{name:i<4?'下一个模块':'完成训练',exact:true}).click();
 }
 await page.getByRole('heading',{name:'训练完成',exact:true}).waitFor({state:'visible'});
 assert.ok(await page.evaluate(()=>JSON.parse(localStorage.getItem('brainboost_history')||'[]').some(x=>x.gameId==='knowledge_king'&&x.score>0)));
 for(const[,label]of games.slice(1,-1)){await enter(label);assert.equal(await page.getByText('加载模块错误。',{exact:true}).count(),0);}
 await page.goto(url,{waitUntil:'networkidle'});await page.getByTitle('查看性能指标').click();await page.getByRole('heading',{name:'游戏表现记录',exact:true}).waitFor({state:'visible'});assert.equal(await page.getByText('Level 4',{exact:true}).count(),0);await page.screenshot({path:'docs/assets/history.png',fullPage:true});
 await page.goto(url,{waitUntil:'networkidle'});await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.screenshot({path:'docs/assets/mobile.png',fullPage:true});
 assert.deepEqual(errors,[]);assert.deepEqual(bad,[]);assert.deepEqual(external,[]);
 const report={checkedAt:new Date().toISOString(),smokeGameEntries:8,completed:['Schulte beginner3levels','Trivia5localQuestions'],checks:['session score/time persisted','history view uses actual game records','repository subpath','390px no page overflow','no external network requests','no runtime errors'],pageErrors:errors,httpFailures:bad,externalRequests:external};await writeFile('docs/browser-check.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await browser.close();server.close();}
