const STORAGE_KEYS = { master:'master-data', lines:'count-lines', settings:'app-settings', customLists:'custom-lists' };

const state = {
  materials: [],
  batches: [],
  bins: [],
  lines: [],
  settings: { warehouse: '', optionalBin: false, optionalBatch: false },
  step: 1,
  entry: emptyEntry(),
  scanner: null,
  scanning: false,
  camFacing: 'environment',
  pendingParse: {}
};

function emptyEntry(){
  return {
    bin:'', material:'', batch:'', uom:'', externalHu:'', warehouse:'',
    pack1Type:'', pack1Qty:0, pack1Count:0, noPack1:false,
    pack2Type:'', pack2Qty:0, pack2Count:0, noPack2:false,
    incomplete:false, incompleteType:'', incompleteCount:0, incompleteQuantities:[], notes:''
  };
}

function normalize(s){
  return (s||'').toString().trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
}

function escapeHtml(s){ return (s||'').toString().replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

let toastTimer=null;
function showToast(msg, isWarn){
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast show' + (isWarn?' warn':'');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>{ el.className='toast'; }, 2600);
}
