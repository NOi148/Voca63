import { DEFAULT_WORDS } from './words.js';
import { loadWords, saveWords, loadWrong, saveWrong, loadApiKey, saveApiKey, exportData, importData } from './storage.js';

// ── 데이터 초기화 ─────────────────────────────────────────────────────
function ts() { return new Date().toISOString().slice(0, 10); }

let words = loadWords();
if (!words) {
  words = DEFAULT_WORDS.map(w => ({ ...w, date: ts(), wc: 0 }));
  saveWords(words);
}
let wrong = loadWrong();
let ci = 0, sf = false, ord = words.map((_, i) => i);

// ── 유틸 ─────────────────────────────────────────────────────────────
function fd(s) { const d = new Date(s); return `${d.getFullYear()}년 ${d.getMonth()+1}월 ${d.getDate()}일`; }
function tl() { return new Date().toLocaleDateString('ko-KR', { year:'numeric', month:'long', day:'numeric' }); }

let tt;
function toast(m) {
  const t = document.getElementById('toast');
  t.textContent = m; t.classList.add('show');
  clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 2200);
}

// ── 페이지 이동 ───────────────────────────────────────────────────────
window.goPage = function(id, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('on'));
  document.querySelectorAll('.nb').forEach(b => b.classList.remove('on'));
  document.getElementById('page-' + id).classList.add('on');
  btn.classList.add('on');
  if (id === 'study')    rs();
  if (id === 'review')   { rvi = 0; brv(); }
  if (id === 'archive')  rarc();
  if (id === 'add')      rta();
  if (id === 'settings') rset();
};

// ── 오늘 단어만 필터링 ────────────────────────────────────────────────
function todayWords() {
  const today = ts();
  return words.filter(w => w.date === today);
}

function dw() { return ord.map(i => words[i]).filter(w => w.date === ts()); }

// ── 학습 페이지 ───────────────────────────────────────────────────────
function rs() {
  document.getElementById('tlabel').textContent = tl();
  const tw = todayWords();
  const empty = document.getElementById('study-empty');
  const content = document.getElementById('study-content');

  if (!tw.length) {
    empty.style.display = 'block';
    content.style.display = 'none';
    return;
  }
  empty.style.display = 'none';
  content.style.display = 'block';

  // 오늘 단어만 ord 재설정
  const todayOrd = words.map((w, i) => w.date === ts() ? i : -1).filter(i => i >= 0);
  if (!sf) ord = todayOrd;

  const d = dw();
  if (!d.length) return;
  if (ci >= d.length) ci = 0;
  const w = d[ci];

  document.getElementById('fw').textContent   = w.word;
  document.getElementById('fp').textContent   = w.pos;
  document.getElementById('fbw').textContent  = w.word;
  document.getElementById('fbp').textContent  = w.pos;
  document.getElementById('fbm').textContent  = w.mu;
  document.getElementById('fbe').textContent  = w.me;
  document.getElementById('fbs').innerHTML    = w.se;
  document.getElementById('fbsk').textContent = w.sk;
  document.getElementById('fbsk').classList.remove('on');
  document.getElementById('fbtkr').textContent = '🇰🇷 한글 번역 보기';
  document.getElementById('mcnt').textContent  = `${ci+1} / ${d.length}`;
  document.getElementById('mprog').style.width = `${((ci+1)/d.length)*100}%`;
  document.getElementById('mflip').classList.remove('f');
}

window.flipMain = function() { document.getElementById('mflip').classList.toggle('f'); };

window.tkr = function(sid, bid) {
  const s = document.getElementById(sid), b = document.getElementById(bid);
  s.classList.toggle('on');
  b.textContent = s.classList.contains('on') ? '🇰🇷 번역 숨기기' : '🇰🇷 한글 번역 보기';
};

window.mv = function(d) { const dws = dw(); ci = (ci + d + dws.length) % dws.length; rs(); };

window.toggleShuffle = function() {
  sf = !sf;
  const b = document.getElementById('sfbtn');
  if (sf) {
    const todayIdx = words.map((w, i) => w.date === ts() ? i : -1).filter(i => i >= 0);
    const a = [...todayIdx];
    for (let i = a.length-1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
    ord = a; b.textContent = '🔀 섞는 중'; b.classList.add('on'); toast('🔀 섞였어요!');
  } else {
    ord = words.map((w, i) => w.date === ts() ? i : -1).filter(i => i >= 0);
    b.textContent = '🔀 섞기'; b.classList.remove('on'); toast('📋 원래 순서로!');
  }
  ci = 0; rs();
};

window.mark = function(v) {
  const w = dw()[ci]; if (!w) return;
  if (v === 'know') { wrong = wrong.filter(k => k !== w.word); toast('✅ 오답에서 제거!'); }
  else { if (!wrong.includes(w.word)) wrong.push(w.word); toast(v === 'no' ? '❌ 오답 추가!' : '😅 오답 추가!'); }
  saveWrong(wrong); ubdg(); window.mv(1);
};

function ubdg() {
  const b = document.getElementById('rvbdg');
  b.textContent = wrong.length;
  b.style.display = wrong.length ? 'flex' : 'none';
}

// ── 오답 페이지 ───────────────────────────────────────────────────────
let rvi = 0;
function brv() {
  const ww = words.filter(w => wrong.includes(w.word));
  const c = document.getElementById('rvcont');
  if (!ww.length || rvi >= ww.length) {
    c.innerHTML = `<div class="empty"><div class="ico">🏆</div>${!ww.length ? '오답 단어가 없어요!<br>GR처럼 완벽해요 🏁' : '오답 단어를 모두 복습했어요!'}</div>`;
    return;
  }
  const w = ww[rvi]; const s1 = 'rvsk'+rvi, b1 = 'rvtkr'+rvi;
  c.innerHTML = `
  <div class="top" style="margin-bottom:13px"><div class="stit">🔥 오답 노트</div><div class="dtag">${rvi+1} / ${ww.length}</div></div>
  <div class="prog"><div class="pb" style="width:${((rvi+1)/ww.length)*100}%"></div></div>
  <div class="scene"><div class="flipper" id="rvf" onclick="this.classList.toggle('f')">
    <div class="face fr"><div class="fhint">단어</div><div class="wbig">${w.word}</div><div class="wpsm">${w.pos}</div><div class="taph">👆 탭해서 뜻 보기</div></div>
    <div class="face bk"><div class="bword">${w.word}</div><div class="bpos">${w.pos}</div><div class="mmain">${w.mu}</div><div class="mextra">${w.me}</div>
      <div class="sbox"><div class="sen">${w.se}</div><div class="skr" id="${s1}">${w.sk}</div>
        <button class="tkrb" id="${b1}" onclick="event.stopPropagation();tkr('${s1}','${b1}')">🇰🇷 한글 번역 보기</button></div></div>
  </div></div>
  <div class="vrow" style="margin-top:11px">
    <button class="vb vknow" onclick="rvm('know')">✅ 이제 알아요</button>
    <button class="vb vno" onclick="rvm('no')">❌ 아직 모르겠어</button>
  </div>`;
}

window.rvm = function(v) {
  const ww = words.filter(w => wrong.includes(w.word));
  if (v === 'know') { wrong = wrong.filter(k => k !== ww[rvi].word); toast('✅ 오답 제거!'); }
  else toast('❌ 다음에 또 복습해요!');
  saveWrong(wrong); ubdg(); rvi++; brv();
};

// ── 보관함 ───────────────────────────────────────────────────────────
function rarc() {
  const bd = {};
  words.forEach(w => { if (!bd[w.date]) bd[w.date] = []; bd[w.date].push(w); });
  const dates = Object.keys(bd).sort((a, b) => b.localeCompare(a));
  document.getElementById('arclist').innerHTML = dates.map(dt => `
  <div class="folder" id="fold-${dt}">
    <div class="fhdr" onclick="tgf('${dt}')">
      <div class="fleft"><span class="fico" id="fico-${dt}">📁</span>
        <div><div class="fdate">${fd(dt)}</div>
          <div class="fmeta">단어 ${bd[dt].length}개 · 오답 ${bd[dt].filter(w=>wrong.includes(w.word)).length}개</div></div></div>
      <span class="fchev" id="fchev-${dt}">▶</span>
    </div>
    <div class="fbody" id="fbody-${dt}">
      <div class="mrow">
        <button class="mbtn ms" onclick="fss('${dt}')"><span class="mico">📚</span>단어 학습</button>
        <button class="mbtn mt" onclick="fqs('${dt}')"><span class="mico">✏️</span>시험 보기</button>
      </div>
      <div class="wlist">${bd[dt].map(w => `
        <div class="witem${wrong.includes(w.word)?' ww':''}">
          <div><div><span class="wword">${w.word}</span>${wrong.includes(w.word)?'<span class="wtag">오답</span>':''}</div>
            <div class="wmean">${w.mu}</div></div>
          <button class="wdel" onclick="dw2('${w.word.replace(/'/g,"\\'")}')">🗑</button>
        </div>`).join('')}</div>
    </div>
  </div>`).join('');
}

window.tgf = function(dt) {
  const body = document.getElementById('fbody-'+dt);
  const chev = document.getElementById('fchev-'+dt);
  const ico  = document.getElementById('fico-'+dt);
  const o = body.classList.contains('open');
  body.classList.toggle('open'); chev.classList.toggle('open', !o); ico.textContent = o ? '📁' : '📂';
};

// 보관함 단어 학습
let fsi = 0, fsw = [], fsd = '';
window.fss = function(dt) {
  const bd = {}; words.forEach(w => { if (!bd[w.date]) bd[w.date] = []; bd[w.date].push(w); });
  fsw = bd[dt] || []; fsi = 0; fsd = dt;
  document.getElementById('fbody-'+dt).innerHTML = bfsh(dt);
};
function bfsh(dt) {
  if (!fsw.length) return '<div class="empty"><div class="ico">📭</div>단어 없음</div>';
  const w = fsw[fsi];
  return `<button class="bbtn" onclick="btf('${dt}')">← 목록으로</button>
  <div class="top" style="margin-bottom:11px"><div class="stit" style="font-size:.95rem">단어 학습</div><div class="dtag">${fsi+1} / ${fsw.length}</div></div>
  <div class="prog"><div class="pb" style="width:${((fsi+1)/fsw.length)*100}%"></div></div>
  <div class="scene"><div class="flipper" id="fsf" onclick="this.classList.toggle('f')">
    <div class="face fr"><div class="fhint">단어</div><div class="wbig">${w.word}</div><div class="wpsm">${w.pos}</div><div class="taph">👆 탭해서 뜻 보기</div></div>
    <div class="face bk"><div class="bword">${w.word}</div><div class="bpos">${w.pos}</div><div class="mmain">${w.mu}</div><div class="mextra">${w.me}</div>
      <div class="sbox"><div class="sen">${w.se}</div><div class="skr" id="fssk">${w.sk}</div>
        <button class="tkrb" id="fstkr" onclick="event.stopPropagation();tkr('fssk','fstkr')">🇰🇷 한글 번역 보기</button></div></div>
  </div></div>
  <div class="cnav">
    <button class="arr" onclick="fsg(-1)" ${fsi===0?'style="opacity:.4"':''}>← 이전</button>
    <span class="cnt">${fsi+1} / ${fsw.length}</span>
    <button class="arr" onclick="fsg(1)" ${fsi===fsw.length-1?'style="opacity:.4"':''}>다음 →</button>
  </div>`;
}
window.fsg = function(d) { const n = fsi + d; if (n < 0 || n >= fsw.length) return; fsi = n; document.getElementById('fbody-'+fsd).innerHTML = bfsh(fsd); };

// 보관함 퀴즈
let fqi = 0, fqs2 = [], fqsc = 0, fqch = null, fqd = '';
function shar(a) { const r=[...a]; for(let i=r.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[r[i],r[j]]=[r[j],r[i]];} return r; }

window.fqs = function(dt) {
  const bd = {}; words.forEach(w => { if (!bd[w.date]) bd[w.date] = []; bd[w.date].push(w); });
  fqd = dt; fqs2 = shar([...(bd[dt]||[])]); fqi = 0; fqsc = 0; fqch = null;
  document.getElementById('fbody-'+dt).innerHTML = bfqh(dt);
};
function bfqh(dt) {
  if (fqi >= fqs2.length) {
    const s = fqsc, t = fqs2.length;
    return `<button class="bbtn" onclick="btf('${dt}')">← 목록으로</button>
    <div class="qdone"><div style="font-size:2.4rem;margin-bottom:9px">${s===t?'🏆':s>=t*.7?'🎉':'📚'}</div>
      <div class="qscore">${s} / ${t}</div>
      <div class="qmsg">${s===t?'완벽해요! GR처럼 실수 없이 🏁':s>=t*.7?'잘했어요! 💪':'더 복습이 필요해요 🔄'}</div>
      <button class="qrst" onclick="fqs('${dt}')">🔄 다시 풀기</button></div>`;
  }
  const qw = fqs2[fqi];
  const opts = shar([qw, ...shar(words.filter(w => w.word !== qw.word)).slice(0,3)]);
  const oh = opts.map(o => {
    let cls = 'qopt';
    if (fqch) cls += o.word === qw.word ? ' qok' : o.word === fqch ? ' qno' : '';
    return `<button class="${cls}" onclick="fqp('${o.word.replace(/'/g,"\\'")}','${dt}')" ${fqch?'disabled':''}>${o.mu}</button>`;
  }).join('');
  return `<button class="bbtn" onclick="btf('${dt}')">← 목록으로</button>
  <div class="qprog">${fqi+1} / ${fqs2.length} · ✅ ${fqsc}개 맞춤</div>
  <div class="prog"><div class="pb" style="width:${((fqi+1)/fqs2.length)*100}%"></div></div>
  <div class="qq">다음 단어의 뜻은?<br><b>${qw.word}</b><small>${qw.pos}</small></div>
  <div class="qopts">${oh}</div>
  ${fqch ? `<button class="qnxt" onclick="fqn('${dt}')">${fqi+1>=fqs2.length?'결과 보기 →':'다음 →'}</button>` : ''}`;
}
window.fqp = function(word, dt) { if(fqch)return; fqch=word; if(word===fqs2[fqi].word)fqsc++; document.getElementById('fbody-'+dt).innerHTML=bfqh(dt); };
window.fqn = function(dt) { fqi++; fqch=null; document.getElementById('fbody-'+dt).innerHTML=bfqh(dt); };
window.btf = function(dt) { rarc(); const b=document.getElementById('fbody-'+dt),c=document.getElementById('fchev-'+dt),i=document.getElementById('fico-'+dt); if(b){b.classList.add('open');c.classList.add('open');i.textContent='📂';} };
window.dw2 = function(word) {
  if (!confirm(`"${word}" 를 삭제할까요?`)) return;
  words = words.filter(w => w.word !== word);
  wrong = wrong.filter(k => k !== word);
  ord = words.map((_, i) => i);
  ci = 0; saveWords(words); saveWrong(wrong); ubdg(); rarc(); toast('🗑 삭제됐어요');
};

// ── 추가 페이지 ───────────────────────────────────────────────────────
function rta() {
  const td = ts(), tw = words.filter(w => w.date === td);
  const sec = document.getElementById('tadded'), list = document.getElementById('tlist');
  if (!tw.length) { sec.style.display = 'none'; return; }
  sec.style.display = 'block';
  list.innerHTML = tw.map(w => `<div class="ti"><div class="tw">${w.word}</div><div class="tm">${w.mu}</div></div>`).join('');
}

window.addWords = async function() {
  const raw    = document.getElementById('addinp').value.trim();
  const apiKey = loadApiKey();
  if (!raw)    { toast('단어를 입력해주세요!'); return; }
  if (!apiKey) { toast('⚙️ 설정 탭에서 API 키를 먼저 입력해주세요!'); return; }

  const btn = document.getElementById('addbtn'), gen = document.getElementById('addgen');
  btn.disabled = true;
  gen.innerHTML = '<div style="text-align:center;padding:14px;color:var(--mu);font-size:.8rem"><span class="spin"></span>GR 예문 생성 중...</div>';

  const prompt = `You are a vocabulary card generator for a Korean student learning English through Formula 1 / George Russell content.
Parse the input and extract vocabulary items. Return a JSON array. Each object:
- word: string (English, lowercase)
- pos: string
- mu: string (Korean meaning as provided or inferred)
- me: string (extra Korean note, 1-2 lines)
- se: string (F1/George Russell themed sentence, wrap target word with <b> tags)
- sk: string (Korean translation)
ALL sentences F1/Mercedes/George Russell themed. Respond ONLY with valid JSON array, no markdown.
Input: ${raw}`;

  try {
    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, apiKey })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'API 오류');
    const parsed = JSON.parse(data.text.replace(/```json|```/g, '').trim());
    const today = ts();
    parsed.forEach(p => {
      if (!words.find(w => w.word.toLowerCase() === p.word.toLowerCase()))
        words.push({ ...p, date: today, wc: 0 });
    });
    ord = words.map((w, i) => w.date === today ? i : -1).filter(i => i >= 0);
    saveWords(words);
    document.getElementById('addinp').value = '';
    gen.innerHTML = '';
    rta(); toast(`✅ ${parsed.length}개 단어 추가됐어요!`);
  } catch(e) {
    gen.innerHTML = `<div style="color:var(--ac2);font-size:.75rem;padding:10px;background:var(--card);border-radius:8px;margin-top:8px">${e.message}</div>`;
  }
  btn.disabled = false;
};

// ── 설정 페이지 ───────────────────────────────────────────────────────
function rset() {
  const saved = loadApiKey();
  if (saved) document.getElementById('apikey').value = saved;
}

window.saveKey = function() {
  const key = document.getElementById('apikey').value.trim();
  if (!key) { toast('API 키를 입력해주세요'); return; }
  saveApiKey(key);
  toast('✅ API 키가 저장됐어요!');
};

window.doExport = function() {
  const json = exportData();
  document.getElementById('iotxt').value = json;
  navigator.clipboard.writeText(json).then(() => toast('📋 클립보드에 복사됐어요!')).catch(() => toast('위 텍스트를 직접 복사하세요'));
};

window.doImport = function() {
  const txt = document.getElementById('iotxt').value.trim();
  if (!txt) { toast('데이터를 붙여넣어 주세요'); return; }
  try {
    importData(txt);
    words = loadWords() || [];
    wrong = loadWrong();
    ord = words.map((_, i) => i);
    ci = 0; ubdg();
    toast('✅ 데이터를 가져왔어요! 새로고침하면 반영돼요');
  } catch(e) {
    toast('❌ 데이터 형식이 잘못됐어요');
  }
};

// ── 스와이프 ──────────────────────────────────────────────────────────
let tx = 0, ty = 0;
const msc = document.getElementById('mscene');
if (msc) {
  msc.addEventListener('touchstart', e => { tx=e.touches[0].clientX; ty=e.touches[0].clientY; }, {passive:true});
  msc.addEventListener('touchend', e => {
    const dx=e.changedTouches[0].clientX-tx, dy=e.changedTouches[0].clientY-ty;
    if(Math.abs(dx)<50&&Math.abs(dy)<50)return;
    if(Math.abs(dx)>=Math.abs(dy)){if(dx<0)window.mv(1);else window.mv(-1);}
    else window.flipMain();
  }, {passive:true});
}

// ── 초기화 ────────────────────────────────────────────────────────────
rs();
ubdg();
