/* =========================================================================
   PASSO 1 — IDENTIFICAÇÃO (scan + manual)
========================================================================= */
const fieldMap = {
  bin:{input:'inBin', status:'statusBin', suggest:'suggestBin', list:()=>state.bins, labelKey:'code', subKey:'storageType'},
  material:{input:'inMaterial', status:'statusMaterial', suggest:'suggestMaterial', list:()=>state.materials, labelKey:'code', subKey:'desc'},
  batch:{input:'inBatch', status:'statusBatch', suggest:'suggestBatch', list:()=>state.batches, labelKey:'code', subKey:'material'}
};

Object.keys(fieldMap).forEach(key=>{
  const cfg = fieldMap[key];
  const input = document.getElementById(cfg.input);
  input.addEventListener('input', ()=>{
    state.entry[key] = input.value;
    updateFieldStatus(key);
    renderSuggestions(key);
  });
  input.addEventListener('focus', ()=>renderSuggestions(key));
  input.addEventListener('blur', ()=>setTimeout(()=>{ document.getElementById(cfg.suggest).style.display='none'; }, 150));
});

// Warehouse é texto livre, pré-preenchido a partir do valor guardado em Dados.
document.getElementById('inWarehouse').addEventListener('input', (e)=>{ state.entry.warehouse = e.target.value; });

// HU Externa é texto livre (sem lista mestre), limitado a 18 caracteres via
// atributo maxlength no HTML.
document.getElementById('inExternalHu').addEventListener('input', (e)=>{ state.entry.externalHu = e.target.value; });

// UoM é texto livre, com sugestões e validação (✅/⚠️) contra a lista
// configurada em Dados — mesmo padrão de Posição/Material/Batch, mas a
// "lista mestre" aqui é a lista simples de UoM (ver uom-config.js).
// Escolhida neste passo, é mostrada como referência (só leitura) junto à
// quantidade dos passos 2 e 3 — ver updatePackUomBadges() em count-flow.js.
document.getElementById('inUom').addEventListener('input', ()=>{
  state.entry.uom = document.getElementById('inUom').value;
  updateUomStatus();
  renderUomSuggestions();
  updatePackUomBadges();
});
document.getElementById('inUom').addEventListener('focus', renderUomSuggestions);
document.getElementById('inUom').addEventListener('blur', ()=>setTimeout(()=>{ document.getElementById('suggestUom').style.display='none'; }, 150));

function updateUomStatus(){
  const el = document.getElementById('statusUom');
  const val = document.getElementById('inUom').value;
  if(!val){ el.textContent=''; return; }
  const found = getUomTypes().some(u=>normalize(u)===normalize(val));
  el.textContent = found ? '✅' : '⚠️';
}

function renderUomSuggestions(){
  const box = document.getElementById('suggestUom');
  const query = normalize(document.getElementById('inUom').value);
  const list = getUomTypes();
  if(!list.length){ box.style.display='none'; return; }
  const matches = (query ? list.filter(u=>normalize(u).includes(query)) : list).slice(0,25);
  if(!matches.length){ box.style.display='none'; return; }
  box.innerHTML = matches.map(u=>`<div class="suggest-item" data-uom="${escapeHtml(u)}">${escapeHtml(u)}</div>`).join('');
  box.style.display='block';
  box.querySelectorAll('.suggest-item').forEach(item=>{
    item.addEventListener('mousedown', ()=>{
      document.getElementById('inUom').value = item.dataset.uom;
      state.entry.uom = item.dataset.uom;
      updateUomStatus();
      updatePackUomBadges();
      box.style.display='none';
    });
  });
}

function findExact(list, code){
  const n = normalize(code);
  if(!n) return null;
  return list.find(item=>normalize(item.code)===n) || null;
}

function updateFieldStatus(key){
  const cfg = fieldMap[key];
  const el = document.getElementById(cfg.status);
  const val = document.getElementById(cfg.input).value;
  if(!val){ el.textContent=''; return; }
  const found = findExact(cfg.list(), val);
  el.textContent = found ? '✅' : '⚠️';

  if(found && key==='material' && found.uom){
    const uomInput = document.getElementById('inUom');
    if(!uomInput.value){
      uomInput.value = found.uom;
      state.entry.uom = found.uom;
      updateUomStatus();
      updatePackUomBadges();
    }
  }

  refreshStep1Banner();
}

function renderSuggestions(key){
  const cfg = fieldMap[key];
  const box = document.getElementById(cfg.suggest);
  const query = normalize(document.getElementById(cfg.input).value);
  const list = cfg.list();
  if(!list.length){ box.style.display='none'; return; }
  const matches = (query ? list.filter(i=>normalize(i.code).includes(query) || (i[cfg.subKey]&&normalize(i[cfg.subKey]).includes(query))) : list).slice(0,25);
  if(!matches.length){ box.style.display='none'; return; }
  box.innerHTML = matches.map(m=>`<div class="suggest-item" data-code="${escapeHtml(m.code)}">${escapeHtml(m.code)}${m[cfg.subKey]?`<small>${escapeHtml(m[cfg.subKey])}</small>`:''}</div>`).join('');
  box.style.display='block';
  box.querySelectorAll('.suggest-item').forEach(item=>{
    item.addEventListener('mousedown', ()=>{
      document.getElementById(cfg.input).value = item.dataset.code;
      state.entry[key] = item.dataset.code;
      updateFieldStatus(key);
      box.style.display='none';
    });
  });
}

function refreshStep1Banner(){
  const banner = document.getElementById('step1Banner');
  const missing = [];
  if(!state.entry.bin && !state.settings.optionalBin) missing.push('bin');
  if(!state.entry.material) missing.push('material');
  if(!state.entry.batch && !state.settings.optionalBatch) missing.push('batch');
  const unknownCodes = [];
  if(state.entry.bin && !findExact(state.bins, state.entry.bin)) unknownCodes.push(t('unknown_label_bin'));
  if(state.entry.material && !findExact(state.materials, state.entry.material)) unknownCodes.push(t('unknown_label_material'));
  if(state.entry.batch && !findExact(state.batches, state.entry.batch)) unknownCodes.push(t('unknown_label_batch'));

  if(missing.length){
    banner.innerHTML = '';
  } else if(unknownCodes.length){
    banner.innerHTML = `<div class="banner warn">${escapeHtml(t('banner_unknown', {codes: unknownCodes.join(', ')}))}</div>`;
  } else {
    banner.innerHTML = `<div class="banner ok">${escapeHtml(t('banner_ok'))}</div>`;
  }
}

/* Mostra "(opcional)" junto às labels de Storage Bin / Batch quando
   desativados no ecrã Dados (ver checkboxes chkOptionalBin/chkOptionalBatch). */
function updateOptionalFieldTags(){
  document.getElementById('binOptTag').textContent = state.settings.optionalBin ? ' ' + t('optional_tag') : '';
  document.getElementById('batchOptTag').textContent = state.settings.optionalBatch ? ' ' + t('optional_tag') : '';
}

/* --- Câmara / scanner --- */
function startScanner(){
  const readerEl = document.getElementById('reader');
  readerEl.style.display='block';
  document.getElementById('btnStartScan').textContent = t('btn_opening_scan');
  document.getElementById('btnSwitchCam').style.display='inline-flex';

  state.scanner = new Html5Qrcode("reader", {
    formatsToSupport: [
      Html5QrcodeSupportedFormats.QR_CODE, Html5QrcodeSupportedFormats.CODE_128,
      Html5QrcodeSupportedFormats.CODE_39, Html5QrcodeSupportedFormats.EAN_13,
      Html5QrcodeSupportedFormats.EAN_8, Html5QrcodeSupportedFormats.UPC_A,
      Html5QrcodeSupportedFormats.UPC_E, Html5QrcodeSupportedFormats.CODABAR,
      Html5QrcodeSupportedFormats.ITF
    ],
    verbose:false
  });

  state.scanner.start(
    { facingMode: state.camFacing },
    { fps:10, qrbox:{width:260,height:150} },
    onScanSuccess,
    ()=>{}
  ).then(()=>{
    state.scanning = true;
    document.getElementById('btnStartScan').textContent = t('btn_stop_scan');
    document.getElementById('scanHint').textContent = t('scan_hint_scanning');
  }).catch(err=>{
    readerEl.style.display='none';
    document.getElementById('btnSwitchCam').style.display='none';
    document.getElementById('btnStartScan').textContent = t('btn_start_scan');
    document.getElementById('scanHint').innerHTML = t('scan_hint_error');
  });
}

function stopScanner(){
  if(state.scanner && state.scanning){
    state.scanner.stop().then(()=>{
      state.scanner.clear();
      state.scanner = null;
      state.scanning = false;
      document.getElementById('reader').style.display='none';
      document.getElementById('btnStartScan').textContent = t('btn_start_scan');
      document.getElementById('btnSwitchCam').style.display='none';
    }).catch(()=>{});
  }
}

document.getElementById('btnStartScan').addEventListener('click', ()=>{
  if(state.scanning){ stopScanner(); } else { startScanner(); }
});
document.getElementById('btnSwitchCam').addEventListener('click', async ()=>{
  state.camFacing = state.camFacing==='environment' ? 'user' : 'environment';
  await stopScanner();
  setTimeout(startScanner, 300);
});

function onScanSuccess(decodedText){
  // tenta separar por delimitadores comuns e atribuir cada parte à lista a que pertence
  const parts = decodedText.split(/[|;,\t\n]+/).map(p=>p.trim()).filter(Boolean);
  const candidates = parts.length ? parts : [decodedText.trim()];
  let matchedAny = false;

  candidates.forEach(part=>{
    if(findExact(state.bins, part)){ setEntryField('bin', part); matchedAny = true; }
    else if(findExact(state.materials, part)){ setEntryField('material', part); matchedAny = true; }
    else if(findExact(state.batches, part)){ setEntryField('batch', part); matchedAny = true; }
  });

  if(!matchedAny){
    // não bateu certo com nenhuma lista mestre: assume que é a posição (o mais comum de se escanear primeiro)
    if(!state.entry.bin){ setEntryField('bin', candidates[0]); }
    else if(!state.entry.material){ setEntryField('material', candidates[0]); }
    else if(!state.entry.batch){ setEntryField('batch', candidates[0]); }
  }

  refreshStep1Banner();
  if(navigator.vibrate) navigator.vibrate(60);
  showToast(t('toast_scan_read', {text: decodedText}));
}

function setEntryField(key, value){
  state.entry[key] = value;
  document.getElementById(fieldMap[key].input).value = value;
  updateFieldStatus(key);
}

document.getElementById('btnStep1Next').addEventListener('click', ()=>{
  const missingBin = !state.entry.bin && !state.settings.optionalBin;
  const missingMaterial = !state.entry.material;
  const missingBatch = !state.entry.batch && !state.settings.optionalBatch;
  if(missingBin || missingMaterial || missingBatch){
    showToast(t('toast_fill_required'), true);
    return;
  }
  stopScanner();
  goToStep(2);
});
