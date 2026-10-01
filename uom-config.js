let draftUomTypes = null;

function renderUomConfigEditor(){
  if(draftUomTypes===null){ draftUomTypes = getUomTypes().slice(); }
  const list = document.getElementById('uomConfigList');
  list.innerHTML = draftUomTypes.map((type, idx)=>`
    <div class="pack-config-row">
      <input type="text" data-idx="${idx}" value="${escapeHtml(type)}">
      <button type="button" data-remove="${idx}">✕</button>
    </div>
  `).join('');
  list.querySelectorAll('input[data-idx]').forEach(input=>{
    input.addEventListener('input', ()=>{ draftUomTypes[parseInt(input.dataset.idx)] = input.value; });
  });
  list.querySelectorAll('[data-remove]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      draftUomTypes.splice(parseInt(btn.dataset.remove), 1);
      renderUomConfigEditor();
    });
  });
}

document.getElementById('btnAddUomType').addEventListener('click', ()=>{
  if(draftUomTypes===null){ draftUomTypes = getUomTypes().slice(); }
  draftUomTypes.push('');
  renderUomConfigEditor();
});

document.getElementById('btnSaveUomTypes').addEventListener('click', async ()=>{
  const cleaned = draftUomTypes.map(s=>s.trim()).filter(Boolean);
  if(!CONFIG.uomTypes) CONFIG.uomTypes = {};
  CONFIG.uomTypes[LANG] = cleaned;
  draftUomTypes = cleaned.slice();
  await persistCustomLists();
  renderUomConfigEditor();
  updateUomStatus();
  showToast(t('toast_uom_types_saved'));
});
