/* =========================================================================
   PERSISTÊNCIA — IndexedDB (base de dados local do browser)
   Funciona em qualquer alojamento e sobrevive a refresh, fecho da app e
   reinício do dispositivo — só é apagado se o utilizador limpar os dados
   do browser.
========================================================================= */
const DB_NAME = 'ewm-inventario-db';
const DB_VERSION = 1;
const DB_STORE = 'kv';
let dbFailed = false;

function dbOpen(){
  return new Promise((resolve, reject)=>{
    if(!('indexedDB' in window)){ reject(new Error('IndexedDB indisponível')); return; }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = ()=>{ req.result.createObjectStore(DB_STORE); };
    req.onsuccess = ()=>resolve(req.result);
    req.onerror = ()=>reject(req.error);
  });
}

const localStore = {
  async get(key){
    const db = await dbOpen();
    return new Promise((resolve, reject)=>{
      const tx = db.transaction(DB_STORE, 'readonly');
      const req = tx.objectStore(DB_STORE).get(key);
      req.onsuccess = ()=>resolve(req.result===undefined ? null : req.result);
      req.onerror = ()=>reject(req.error);
    });
  },
  async set(key, value){
    const db = await dbOpen();
    return new Promise((resolve, reject)=>{
      const tx = db.transaction(DB_STORE, 'readwrite');
      tx.objectStore(DB_STORE).put(value, key);
      tx.oncomplete = ()=>resolve(true);
      tx.onerror = ()=>reject(tx.error);
    });
  }
};

async function loadPersisted(){
  try{
    const lang = await localStore.get('lang-pref');
    if(lang && CONFIG.languages[lang]) LANG = lang;
  }catch(e){}
  try{
    const m = await localStore.get(STORAGE_KEYS.master);
    if(m){
      state.materials = m.materials || [];
      state.batches = m.batches || [];
      state.bins = m.bins || [];
    }
  }catch(e){ dbFailed = true; }
  try{
    const l = await localStore.get(STORAGE_KEYS.lines);
    if(l){ state.lines = l || []; }
  }catch(e){ dbFailed = true; }
  try{
    const s = await localStore.get(STORAGE_KEYS.settings);
    if(s){ state.settings = Object.assign(state.settings, s); }
  }catch(e){ dbFailed = true; }
  if(dbFailed){
    showToast(t('toast_storage_unavailable'), true);
  }
  renderMasterBadges();
  renderMasterStatus();
  renderList();
  updateLineCount();
  document.getElementById('inWarehouseSetting').value = state.settings.warehouse || '';
  prefillWarehouseField();
  document.getElementById('chkOptionalBin').checked = !!state.settings.optionalBin;
  document.getElementById('chkOptionalBatch').checked = !!state.settings.optionalBatch;
  updateOptionalFieldTags();
}

async function persistMaster(){
  try{
    await localStore.set(STORAGE_KEYS.master, {
      materials: state.materials, batches: state.batches, bins: state.bins
    });
  }catch(e){ showToast(t('toast_cant_save_master'), true); }
}

async function persistLines(){
  try{ await localStore.set(STORAGE_KEYS.lines, state.lines); }
  catch(e){ showToast(t('toast_cant_save_lines'), true); }
}

async function persistSettings(){
  try{ await localStore.set(STORAGE_KEYS.settings, state.settings); }
  catch(e){ showToast(t('toast_cant_save_master'), true); }
}

/* Tipos de embalagem e UoM personalizados no ecrã Dados — persistidos aqui
   para sobreviverem a refresh (sobrepõem-se ao config.json neste dispositivo). */
async function persistCustomLists(){
  try{
    await localStore.set(STORAGE_KEYS.customLists, {
      packagingTypes: CONFIG.packagingTypes, uomTypes: CONFIG.uomTypes
    });
  }catch(e){ showToast(t('toast_cant_save_master'), true); }
}

document.getElementById('btnSaveWarehouse').addEventListener('click', async ()=>{
  state.settings.warehouse = document.getElementById('inWarehouseSetting').value.trim();
  await persistSettings();
  prefillWarehouseField();
  showToast(t('toast_warehouse_saved'));
});

document.getElementById('chkOptionalBin').addEventListener('change', async (e)=>{
  state.settings.optionalBin = e.target.checked;
  await persistSettings();
  updateOptionalFieldTags();
  refreshStep1Banner();
});
document.getElementById('chkOptionalBatch').addEventListener('change', async (e)=>{
  state.settings.optionalBatch = e.target.checked;
  await persistSettings();
  updateOptionalFieldTags();
  refreshStep1Banner();
});

/* --- Cópia de segurança em ficheiro (.json) --- */
function buildBackupObject(){
  return {
    _app: 'contagem-ewm-backup', _version: 1, exportedAt: new Date().toISOString(),
    materials: state.materials, batches: state.batches, bins: state.bins, lines: state.lines,
    settings: state.settings
  };
}

function downloadBackup(){
  const text = JSON.stringify(buildBackupObject(), null, 2);
  const blob = new Blob([text], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const stamp = new Date().toISOString().slice(0,16).replace(/[:T]/g,'-');
  a.href = url; a.download = `backup-ewm-${stamp}.json`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(t('toast_backup_downloaded'));
}

async function restoreBackup(file){
  try{
    const text = await file.text();
    const data = JSON.parse(text);
    if(!data || data._app!=='contagem-ewm-backup'){ showToast(t('toast_backup_invalid'), true); return; }
    if(!confirm(t('confirm_restore_backup'))) return;
    state.materials = data.materials || [];
    state.batches = data.batches || [];
    state.bins = data.bins || [];
    state.lines = data.lines || [];
    state.settings = Object.assign({warehouse:'', optionalBin:false, optionalBatch:false}, data.settings || {});
    await persistMaster();
    await persistLines();
    await persistSettings();
    renderMasterBadges();
    renderMasterStatus();
    renderList();
    renderExportPreview();
    updateLineCount();
    document.getElementById('inWarehouseSetting').value = state.settings.warehouse || '';
    prefillWarehouseField();
    document.getElementById('chkOptionalBin').checked = !!state.settings.optionalBin;
    document.getElementById('chkOptionalBatch').checked = !!state.settings.optionalBatch;
    updateOptionalFieldTags();
    showToast(t('toast_backup_restored'));
  }catch(e){ showToast(t('toast_backup_read_error'), true); }
}

document.getElementById('btnBackupExport').addEventListener('click', downloadBackup);
document.getElementById('btnBackupImport').addEventListener('change', (e)=>{
  const file = e.target.files[0];
  if(file) restoreBackup(file);
  e.target.value = '';
});
