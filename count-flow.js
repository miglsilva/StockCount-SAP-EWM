/* =========================================================================
   PASSO 2, 3 e 4 — EMBALAGEM (tipos configuráveis via config.json)
========================================================================= */
const PACKAGING_SEG_MAP = { seg1:'pack1Type', seg2:'pack2Type', segIncomplete:'incompleteType' };

function renderPackagingOptions(){
  const types = getPackagingTypes();
  Object.keys(PACKAGING_SEG_MAP).forEach(segId=>{
    const container = document.getElementById(segId);
    const entryKey = PACKAGING_SEG_MAP[segId];
    container.innerHTML = types.map(type=>`<button class="seg-btn" data-type="${escapeHtml(type)}" type="button">${escapeHtml(type)}</button>`).join('');
    container.querySelectorAll('.seg-btn').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        container.querySelectorAll('.seg-btn').forEach(b=>b.classList.remove('selected'));
        btn.classList.add('selected');
        state.entry[entryKey] = btn.dataset.type;
      });
    });
  });
}

/* Badge de referência (só leitura) mostrado ao lado da quantidade do
   passo 2 (ex: "KG"), com a UoM escolhida no passo 1. O passo 3 (2ª
   unidade) já não tem quantidade por unidade, por isso não tem badge. */
function updatePackUomBadges(){
  const uom = state.entry.uom || '';
  const el = document.getElementById('qty1UomBadge');
  if(!el) return;
  el.textContent = uom;
  el.style.display = uom ? 'flex' : 'none';
}

function roundQty(n){ return Math.round((n + Number.EPSILON) * 100) / 100; }

function setupQtyStepper(inputId, minusId, plusId, entryKey){
  const input = document.getElementById(inputId);
  input.addEventListener('input', ()=>{
    const val = parseFloat(input.value);
    state.entry[entryKey] = Math.max(0, roundQty(isNaN(val) ? 0 : val));
  });
  document.getElementById(minusId).addEventListener('click', ()=>{
    state.entry[entryKey] = roundQty(Math.max(0, (state.entry[entryKey]||0)-1));
    input.value = state.entry[entryKey];
  });
  document.getElementById(plusId).addEventListener('click', ()=>{
    state.entry[entryKey] = roundQty((state.entry[entryKey]||0)+1);
    input.value = state.entry[entryKey];
  });
}
setupQtyStepper('qty1','qty1Minus','qty1Plus','pack1Qty');

/* Contador de unidades (ex: 3 bidões) — inteiro, sem casas decimais,
   ao contrário do stepper "por unidade" acima (que aceita ex: 56.5 KG). */
function setupCountStepper(inputId, minusId, plusId, entryKey){
  const input = document.getElementById(inputId);
  input.addEventListener('input', ()=>{
    const val = parseInt(input.value);
    state.entry[entryKey] = Math.max(0, isNaN(val) ? 0 : val);
  });
  document.getElementById(minusId).addEventListener('click', ()=>{
    state.entry[entryKey] = Math.max(0, (state.entry[entryKey]||0)-1);
    input.value = state.entry[entryKey];
  });
  document.getElementById(plusId).addEventListener('click', ()=>{
    state.entry[entryKey] = (state.entry[entryKey]||0)+1;
    input.value = state.entry[entryKey];
  });
}
setupCountStepper('count1','count1Minus','count1Plus','pack1Count');
setupCountStepper('count2','count2Minus','count2Plus','pack2Count');

document.getElementById('chkNoPack1').addEventListener('change', (e)=>{
  state.entry.noPack1 = e.target.checked;
  document.getElementById('pack1Fields').style.display = e.target.checked ? 'none' : 'block';
});
document.getElementById('chkNoPack2').addEventListener('change', (e)=>{
  state.entry.noPack2 = e.target.checked;
  document.getElementById('pack2Fields').style.display = e.target.checked ? 'none' : 'block';
});

document.getElementById('btnStep2Back').addEventListener('click', ()=>goToStep(1));
document.getElementById('btnStep2Next').addEventListener('click', ()=>{
  if(!state.entry.noPack1 && !state.entry.pack1Type){ showToast(t('toast_choose_pack1'), true); return; }
  goToStep(3);
});
document.getElementById('btnStep3Back').addEventListener('click', ()=>goToStep(2));
document.getElementById('btnStep3Next').addEventListener('click', ()=>{
  if(!state.entry.noPack2 && !state.entry.pack2Type){ showToast(t('toast_choose_pack2'), true); return; }
  goToStep(4);
});

/* =========================================================================
   PASSO 4 — INCOMPLETOS + RESUMO
========================================================================= */
document.getElementById('chkIncomplete').addEventListener('change', (e)=>{
  state.entry.incomplete = e.target.checked;
  document.getElementById('incompleteFields').style.display = e.target.checked ? 'block' : 'none';
  if(!e.target.checked){ setIncompleteCount(0); }
  renderSummary();
});
document.getElementById('inNotes').addEventListener('input', (e)=>{
  state.entry.notes = e.target.value;
  renderSummary();
});

function setIncompleteCount(n){
  n = Math.max(0, Math.min(18, parseInt(n)||0));
  state.entry.incompleteCount = n;
  document.getElementById('inIncompleteCount').value = n;
  renderIncompleteUnitsList();
  renderSummary();
}
document.getElementById('inIncompleteCount').addEventListener('input', (e)=>setIncompleteCount(e.target.value));
document.getElementById('incompleteCountMinus').addEventListener('click', ()=>setIncompleteCount((state.entry.incompleteCount||0)-1));
document.getElementById('incompleteCountPlus').addEventListener('click', ()=>setIncompleteCount((state.entry.incompleteCount||0)+1));

/* Gera um campo de quantidade por cada unidade incompleta declarada,
   preservando os valores já introduzidos ao aumentar/diminuir a contagem. */
function renderIncompleteUnitsList(){
  const count = state.entry.incompleteCount || 0;
  const arr = state.entry.incompleteQuantities || [];
  while(arr.length < count) arr.push(0);
  arr.length = count;
  state.entry.incompleteQuantities = arr;

  const container = document.getElementById('incompleteUnitsList');
  container.innerHTML = arr.map((qty, idx)=>`
    <label class="field-label">${escapeHtml(t('incomplete_unit_label'))} ${idx+1}</label>
    <input type="number" class="incomplete-qty-input" data-idx="${idx}" value="${qty}" min="0" inputmode="numeric">
  `).join('');
  container.querySelectorAll('.incomplete-qty-input').forEach(input=>{
    input.addEventListener('input', ()=>{
      const idx = parseInt(input.dataset.idx);
      state.entry.incompleteQuantities[idx] = parseInt(input.value)||0;
      renderSummary();
    });
  });
}

function renderSummary(){
  const en = state.entry;
  let html = '';
  if(en.warehouse){ html += `<div><b>${escapeHtml(t('summary_warehouse_label'))}:</b> ${escapeHtml(en.warehouse)}</div>`; }
  if(en.bin){ html += `<div><b>${escapeHtml(t('summary_bin_label'))}:</b> ${escapeHtml(en.bin)}</div>`; }
  if(en.externalHu){ html += `<div><b>${escapeHtml(t('summary_external_hu_label'))}:</b> ${escapeHtml(en.externalHu)}</div>`; }
  html += `<div><b>${escapeHtml(t('summary_material_label'))}:</b> ${escapeHtml(en.material)}${en.uom?` (${escapeHtml(en.uom)})`:''}${en.batch?` &nbsp;<b>${escapeHtml(t('summary_batch_label'))}:</b> ${escapeHtml(en.batch)}`:''}</div>`;
  if(!en.noPack1 && en.pack1Type){ html += `<div><b>${escapeHtml(en.pack1Type)}:</b> ${en.pack1Count||0} × ${en.pack1Qty}${en.uom?` ${escapeHtml(en.uom)}`:''}</div>`; }
  if(!en.noPack2 && en.pack2Type){ html += `<div><b>${escapeHtml(en.pack2Type)}:</b> ${en.pack2Count||0}</div>`; }
  if(en.incomplete && en.incompleteQuantities && en.incompleteQuantities.length){
    const total = en.incompleteQuantities.reduce((a,b)=>a+(b||0),0);
    html += `<div><b>${escapeHtml(t('summary_incomplete_label'))}${en.incompleteType?` (${escapeHtml(en.incompleteType)})`:''}:</b> ${en.incompleteQuantities.join(', ')} &nbsp;(${escapeHtml(t('summary_incomplete_total_label'))}: ${total})</div>`;
  }
  if(en.notes){ html += `<div style="font-family:var(--font-body);color:var(--ink-muted);">"${escapeHtml(en.notes)}"</div>`; }
  document.getElementById('summaryContent').innerHTML = html;
}

document.getElementById('btnStep4Back').addEventListener('click', ()=>goToStep(3));
document.getElementById('btnConfirmLine').addEventListener('click', ()=>{
  const en = state.entry;
  if(en.incomplete && (en.incompleteCount||0) > 0 && !en.incompleteType){
    showToast(t('toast_choose_incomplete_type'), true);
    return;
  }
  confirmLine();
});

async function confirmLine(){
  const en = state.entry;
  const hasIncomplete = en.incomplete && (en.incompleteCount||0) > 0;
  const line = {
    id: Date.now().toString(36)+Math.random().toString(36).slice(2,6),
    bin: en.bin, material: en.material, batch: en.batch,
    uom: en.uom||'', externalHu: en.externalHu||'', warehouse: en.warehouse||'',
    pack1Type: en.noPack1 ? '' : en.pack1Type, pack1Qty: en.noPack1 ? 0 : (en.pack1Qty||0), pack1Count: en.noPack1 ? 0 : (en.pack1Count||0),
    // pack2 não tem quantidade por unidade (removida do passo 3) — mantém-se o campo
    // a 0 só para não quebrar as colunas do export (ver list-export.js).
    pack2Type: en.noPack2 ? '' : en.pack2Type, pack2Qty: 0, pack2Count: en.noPack2 ? 0 : (en.pack2Count||0),
    incompleteType: hasIncomplete ? en.incompleteType : '',
    incompleteQuantities: hasIncomplete ? (en.incompleteQuantities||[]).slice(0, en.incompleteCount||0) : [],
    incompleteTotal: hasIncomplete ? (en.incompleteQuantities||[]).slice(0, en.incompleteCount||0).reduce((a,b)=>a+(b||0),0) : 0,
    notes: en.notes||'',
    flagged: !((!en.bin || findExact(state.bins,en.bin)) && findExact(state.materials,en.material) && (!en.batch || findExact(state.batches,en.batch)) && (!en.uom || getUomTypes().some(u=>normalize(u)===normalize(en.uom)))),
    countedAt: new Date().toISOString()
  };
  state.lines.unshift(line);
  await persistLines();
  updateLineCount();
  showToast(t('toast_line_registered'));
  resetEntry();
  goToStep(1);
}

// Pré-preenche o campo Warehouse do passo 1 com o valor guardado em Dados
// (state.settings.warehouse), sem sobrepor uma alteração manual em curso.
function prefillWarehouseField(){
  const value = state.settings.warehouse || '';
  document.getElementById('inWarehouse').value = value;
  state.entry.warehouse = value;
}

function resetEntry(){
  state.entry = emptyEntry();
  ['inBin','inMaterial','inBatch','inUom','inExternalHu'].forEach(id=>document.getElementById(id).value='');
  ['statusBin','statusMaterial','statusBatch','statusUom'].forEach(id=>document.getElementById(id).textContent='');
  document.getElementById('step1Banner').innerHTML='';
  prefillWarehouseField();
  document.querySelectorAll('.seg-btn').forEach(b=>b.classList.remove('selected'));
  document.getElementById('qty1').value=0;
  document.getElementById('count1').value=0; document.getElementById('count2').value=0;
  document.getElementById('chkNoPack1').checked=false;
  document.getElementById('pack1Fields').style.display='block';
  document.getElementById('chkNoPack2').checked=false;
  document.getElementById('pack2Fields').style.display='block';
  document.getElementById('chkIncomplete').checked=false;
  document.getElementById('incompleteFields').style.display='none';
  document.getElementById('inIncompleteCount').value=0;
  document.getElementById('incompleteUnitsList').innerHTML='';
  document.getElementById('inNotes').value='';
  updatePackUomBadges();
}

/* =========================================================================
   NAVEGAÇÃO ENTRE PASSOS
========================================================================= */
function goToStep(n){
  state.step = n;
  document.querySelectorAll('.step-panel').forEach(p=>{ p.style.display = (parseInt(p.dataset.step)===n) ? 'block' : 'none'; });
  document.querySelectorAll('.step-dot').forEach(d=>{
    const dn = parseInt(d.dataset.dot);
    d.classList.toggle('active', dn===n);
    d.classList.toggle('done', dn<n);
  });
  document.querySelectorAll('.step-line').forEach(l=>{
    l.classList.toggle('done', parseInt(l.dataset.line) < n);
  });
  if(n===4){ renderSummary(); }
  if(n!==1){ stopScanner(); }
}
