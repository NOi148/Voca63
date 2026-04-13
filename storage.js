const KEY_WORDS  = 'gr63_words';
const KEY_WRONG  = 'gr63_wrong';
const KEY_APIKEY = 'gr63_apikey';

export function loadWords()  { try { return JSON.parse(localStorage.getItem(KEY_WORDS) || 'null'); } catch { return null; } }
export function saveWords(w) { localStorage.setItem(KEY_WORDS, JSON.stringify(w)); }
export function loadWrong()  { try { return JSON.parse(localStorage.getItem(KEY_WRONG) || '[]'); } catch { return []; } }
export function saveWrong(w) { localStorage.setItem(KEY_WRONG, JSON.stringify(w)); }
export function loadApiKey() { return localStorage.getItem(KEY_APIKEY) || ''; }
export function saveApiKey(k){ localStorage.setItem(KEY_APIKEY, k); }

// 전체 데이터 내보내기 (JSON 문자열)
export function exportData() {
  return JSON.stringify({
    words:  JSON.parse(localStorage.getItem(KEY_WORDS)  || 'null'),
    wrong:  JSON.parse(localStorage.getItem(KEY_WRONG)  || '[]'),
    apiKey: localStorage.getItem(KEY_APIKEY) || ''
  }, null, 2);
}

// 전체 데이터 가져오기
export function importData(jsonStr) {
  const data = JSON.parse(jsonStr);
  if (data.words)  localStorage.setItem(KEY_WORDS,  JSON.stringify(data.words));
  if (data.wrong)  localStorage.setItem(KEY_WRONG,  JSON.stringify(data.wrong));
  if (data.apiKey) localStorage.setItem(KEY_APIKEY, data.apiKey);
}
