const KEY_WORDS  = ‘gr63_words’;
const KEY_WRONG  = ‘gr63_wrong’;
const KEY_APIKEY = ‘gr63_apikey’;
const KEY_CHECKED = ‘gr63_checked’;

function loadWords()  { try { return JSON.parse(localStorage.getItem(KEY_WORDS) || ‘null’); } catch { return null; } }
function saveWords(w) { localStorage.setItem(KEY_WORDS, JSON.stringify(w)); }
function loadWrong()  { try { return JSON.parse(localStorage.getItem(KEY_WRONG) || ‘[]’); } catch { return []; } }
function saveWrong(w) { localStorage.setItem(KEY_WRONG, JSON.stringify(w)); }
function loadApiKey() { return localStorage.getItem(KEY_APIKEY) || ‘’; }
function saveApiKey(k){ localStorage.setItem(KEY_APIKEY, k); }
function loadChecked(){ try { return JSON.parse(localStorage.getItem(KEY_CHECKED) || ‘{}’); } catch { return {}; } }
function saveChecked(c){ localStorage.setItem(KEY_CHECKED, JSON.stringify(c)); }

function exportData() {
return JSON.stringify({
words:  JSON.parse(localStorage.getItem(KEY_WORDS)  || ‘null’),
wrong:  JSON.parse(localStorage.getItem(KEY_WRONG)  || ‘[]’),
apiKey: localStorage.getItem(KEY_APIKEY) || ‘’
}, null, 2);
}

function importData(jsonStr) {
const data = JSON.parse(jsonStr);
if (data.words)  localStorage.setItem(KEY_WORDS,  JSON.stringify(data.words));
if (data.wrong)  localStorage.setItem(KEY_WRONG,  JSON.stringify(data.wrong));
if (data.apiKey) localStorage.setItem(KEY_APIKEY, data.apiKey);
}
