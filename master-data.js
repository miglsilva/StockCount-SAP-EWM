const MASTER_CONFIG = {
  materials: { titleKey:'card_materials_title', codeKeywords:['material','matnr','codigo','código','sku','item'], descKeywords:['descr','texto','desc','nome'], extra:[
      {key:'unitsPerBox', labelKey:'map_extra_units_per_box', keywords:['un_caixa','unidadescaixa','uncaixa','perbox','caixa']},
      {key:'unitsPerPallet', labelKey:'map_extra_units_per_pallet', keywords:['un_palete','unidadespalete','unpalete','perpallet','palete']},
      {key:'uom', labelKey:'map_extra_uom', keywords:['uom','unidademedida','unidade_medida','un_medida','meins','unidade']}
    ]},
  batches: { titleKey:'card_batches_title', codeKeywords:['batch','lote','charg'], descKeywords:['material','matnr'], extra:[] },
  bins: { titleKey:'card_bins_title', codeKeywords:['bin','posicao','posição','localizacao','localização','lgpla'], descKeywords:['tipo','storagetype','lgtyp'], extra:[] }
};

document.querySelectorAll('.file-drop input[type=file][data-kind]').forEach(input=>{
  input.addEventListener('change', (e)=>{
    const kind = input.dataset.kind;
    const file = e.target.files[0];
    if(file) handleFileUpload(kind, file);
  });
});

function guessColumn(headers, keywords){
  const normHeaders = headers.map(normalize);
  for(const kw of keywords){
    const idx = normHeaders.findIndex(h=>h.includes(normalize(kw)));
    if(idx>-1) return headers[idx];
  }
  return headers[0] || '';
}

function handleFileUpload(kind, file){
  const ext = file.name.split('.').pop().toLowerCase();
  document.getElementById('fileLabel-'+kind).textContent = file.name;

  if(ext==='csv'){
    Papa.parse(file, { header:true, skipEmptyLines:true, complete: res=>{
      onFileParsed(kind, res.meta.fields, res.data);
    }});
  } else {
    const reader = new FileReader();
    reader.onload = (ev)=>{
      const wb = XLSX.read(new Uint8Array(ev.target.result), {type:'array'});
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws, {defval:''});
      const headers = data.length ? Object.keys(data[0]) : [];
      onFileParsed(kind, headers, data);
    };
    reader.readAsArrayBuffer(file);
  }
}

function onFileParsed(kind, headers, rows){
  if(!headers || !headers.length){ showToast(t('toast_cant_read_columns'), true); return; }
  state.pendingParse[kind] = {headers, rows};
  renderMappingPanel(kind, headers, rows);
}

function renderMappingPanel(kind, headers, rows){
  const cfg = MASTER_CONFIG[kind];
  const panel = document.getElementById('mapping-'+kind);
  const guessCode = guessColumn(headers, cfg.codeKeywords);
  const guessDesc = guessColumn(headers, cfg.descKeywords);

  let extraRows = '';
  (cfg.extra||[]).forEach(ex=>{
    const guess = guessColumn(headers, ex.keywords);
    extraRows += `<div class="map-row"><label>${escapeHtml(t(ex.labelKey))}</label><select data-role="${ex.key}"><option value="">${escapeHtml(t('mapping_none_option'))}</option>${headers.map(h=>`<option value="${escapeHtml(h)}" ${h===guess && guess!==headers[0]?'selected':''}>${escapeHtml(h)}</option>`).join('')}</select></div>`;
  });

  panel.innerHTML = `
    <div class="map-row"><label>${escapeHtml(t('mapping_col_code'))}</label><select data-role="code">${headers.map(h=>`<option value="${escapeHtml(h)}" ${h===guessCode?'selected':''}>${escapeHtml(h)}</option>`).join('')}</select></div>
    <div class="map-row"><label>${escapeHtml(t('mapping_col_desc'))}</label><select data-role="desc"><option value="">${escapeHtml(t('mapping_none_option'))}</option>${headers.map(h=>`<option value="${escapeHtml(h)}" ${h===guessDesc?'selected':''}>${escapeHtml(h)}</option>`).join('')}</select></div>
    ${extraRows}
    <div class="preview-scroll"><table class="preview-table"><thead><tr>${headers.map(h=>`<th>${escapeHtml(h)}</th>`).join('')}</tr></thead>
    <tbody>${rows.slice(0,3).map(r=>`<tr>${headers.map(h=>`<td>${escapeHtml(r[h])}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
    <div class="btn-row"><button class="btn btn-primary" data-confirm-map="${kind}" type="button">${escapeHtml(t('btn_save_mapping', {title: t(cfg.titleKey), count: rows.length}))}</button></div>
  `;
  panel.style.display='block';

  panel.querySelector(`[data-confirm-map="${kind}"]`).addEventListener('click', ()=>confirmMapping(kind));
}

async function confirmMapping(kind){
  const panel = document.getElementById('mapping-'+kind);
  const codeCol = panel.querySelector('[data-role=code]').value;
  const descCol = panel.querySelector('[data-role=desc]').value;
  const { rows } = state.pendingParse[kind];
  const cfg = MASTER_CONFIG[kind];

  const extraCols = {};
  (cfg.extra||[]).forEach(ex=>{
    const sel = panel.querySelector(`[data-role=${ex.key}]`);
    if(sel) extraCols[ex.key] = sel.value;
  });

  const parsedList = rows.map(r=>{
    const item = { code: (r[codeCol]!==undefined ? String(r[codeCol]).trim() : '') };
    if(descCol) item.desc = String(r[descCol]||'').trim();
    Object.keys(extraCols).forEach(k=>{
      if(extraCols[k]) item[k] = r[extraCols[k]];
    });
    return item;
  }).filter(item=>item.code);

  state[kind] = parsedList;
  await persistMaster();
  renderMasterBadges();
  renderMasterStatus();
  panel.style.display='none';
  showToast(t('toast_master_saved', {title: t(cfg.titleKey), count: parsedList.length}));
}

function renderMasterBadges(){
  ['materials','batches','bins'].forEach(kind=>{
    const badge = document.getElementById('badge-'+kind);
    const n = state[kind].length;
    badge.textContent = t('badge_records', {n});
    badge.classList.toggle('zero', n===0);
  });
}

function renderMasterStatus(){
  const total = state.materials.length + state.batches.length + state.bins.length;
  document.getElementById('masterStatus').textContent = total>0
    ? t('master_status_loaded', {materials: state.materials.length, batches: state.batches.length, bins: state.bins.length})
    : t('master_status_empty');
}
