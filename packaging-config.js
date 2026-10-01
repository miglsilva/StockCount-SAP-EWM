let draftPackTypes = null;

function renderPackConfigEditor(){
  if(draftPackTypes===null){ draftPackTypes = getPackagingTypes().slice(); }
  const list = document.getElementById('packConfigList');
  list.innerHTML = draftPackTypes.map((type, idx)=>`
    <div class="pack-config-row">
      <input type="text" data-idx="${idx}" value="${escapeHtml(type)}">
      <button type="button" data-remove="${idx}">✕</button>
    </div>
  `).join('');
  list.querySelectorAll('input[data-idx]').forEach(input=>{
    input.addEventListener('input', ()=>{ draftPackTypes[parseInt(input.dataset.idx)] = input.value; });
  });
  list.querySelectorAll('[data-remove]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      draftPackTypes.splice(parseInt(btn.dataset.remove), 1);
      renderPackConfigEditor();
    });
  });
}

document.getElementById('btnAddPackType').addEventListener('click', ()=>{
  if(draftPackTypes===null){ draftPackTypes = getPackagingTypes().slice(); }
  draftPackTypes.push('');
  renderPackConfigEditor();
});

document.getElementById('btnSavePackTypes').addEventListener('click', async ()=>{
  const cleaned = draftPackTypes.map(s=>s.trim()).filter(Boolean);
  if(!cleaned.length){ showToast(t('toast_pack_types_min'), true); return; }
  if(!CONFIG.packagingTypes) CONFIG.packagingTypes = {};
  CONFIG.packagingTypes[LANG] = cleaned;
  draftPackTypes = cleaned.slice();
  await persistCustomLists();
  renderPackConfigEditor();
  renderPackagingOptions();
  showToast(t('toast_pack_types_saved'));
});
