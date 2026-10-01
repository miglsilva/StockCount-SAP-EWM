/* =========================================================================
   LISTA / EXPORTAÇÃO
========================================================================= */
function updateLineCount(){ document.getElementById('lineCount').textContent = state.lines.length; }

/* "56 KG", ou apenas "56" se a linha não tiver UoM registada. */
function packQtyDisplay(qty, uom){
  return uom ? `${qty} ${uom}` : `${qty}`;
}

function renderList(){
  const container = document.getElementById('listContainer');
  if(!state.lines.length){
    container.innerHTML = `<div class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>
      <p>${escapeHtml(t('empty_state_text'))}</p>
    </div>`;
    return;
  }
  container.innerHTML = state.lines.map(line=>{
    const time = new Date(line.countedAt).toLocaleTimeString(LANG==='en'?'en-US':'pt-PT',{hour:'2-digit',minute:'2-digit'});
    const chips = [];
    if(line.pack1Type) chips.push(`<span class="pack-chip">${escapeHtml(t('pack_chip_qty', {type: line.pack1Type, count: line.pack1Count||0, qty: packQtyDisplay(line.pack1Qty, line.uom)}))}</span>`);
    if(line.pack2Type) chips.push(`<span class="pack-chip">${escapeHtml(t('pack_chip_count', {type: line.pack2Type, count: line.pack2Count||0}))}</span>`);
    if(line.incompleteQuantities && line.incompleteQuantities.length) chips.push(`<span class="pack-chip incomplete">${escapeHtml(t('pack_chip_incomplete', {type: line.incompleteType||'—', n: line.incompleteQuantities.length, total: line.incompleteTotal||0}))}</span>`);
    return `<div class="ticket">
      <div class="ticket-body">
        <div class="ticket-top">
          <div class="ticket-bin">${escapeHtml([line.warehouse, line.bin].filter(Boolean).join(' · ') || '—')} ${line.flagged?'⚠️':''}</div>
          <div class="ticket-time">${time}</div>
        </div>
        <div class="ticket-material">${escapeHtml(line.material)}${line.uom?` <span class="desc">(${escapeHtml(line.uom)})</span>`:''}</div>
        ${line.batch?`<div class="ticket-batch">${escapeHtml(t('ticket_batch_prefix'))} ${escapeHtml(line.batch)}</div>`:''}
        ${line.externalHu?`<div class="ticket-batch">${escapeHtml(t('ticket_external_hu_prefix'))} ${escapeHtml(line.externalHu)}</div>`:''}
        <div class="ticket-packs">${chips.join('')}</div>
        <div class="ticket-actions"><button class="icon-btn danger" data-del="${line.id}">${escapeHtml(t('btn_delete_line'))}</button></div>
      </div>
    </div>`;
  }).join('');

  container.querySelectorAll('[data-del]').forEach(btn=>{
    btn.addEventListener('click', async ()=>{
      if(confirm(t('confirm_delete_line'))){
        state.lines = state.lines.filter(l=>l.id!==btn.dataset.del);
        await persistLines();
        updateLineCount();
        renderList();
        renderExportPreview();
      }
    });
  });
}

function getDelimiter(){ return document.querySelector('input[name=delim]:checked').value === 'tab' ? '\t' : ';'; }

function buildExportRows(){
  const maxIncomplete = state.lines.reduce((max,l)=>Math.max(max, (l.incompleteQuantities||[]).length), 0);
  const incompleteHeaders = [];
  for(let i=1;i<=maxIncomplete;i++){ incompleteHeaders.push('INCOMPLETE_'+i); }
  const header = ['WAREHOUSE','STORAGE_BIN','MATERIAL','UOM','BATCH','EXTERNAL_HU','PACK_TYPE_1','PACK_QTY_1','PACK_COUNT_1','PACK_TYPE_2','PACK_QTY_2','PACK_COUNT_2','INCOMPLETE_TYPE', ...incompleteHeaders, 'INCOMPLETE_TOTAL','NOTES','COUNTED_AT'];
  const rows = state.lines.map(l=>{
    const qtys = l.incompleteQuantities || [];
    const incompleteCols = [];
    for(let i=0;i<maxIncomplete;i++){ incompleteCols.push(i < qtys.length ? qtys[i] : ''); }
    return [l.warehouse,l.bin,l.material,l.uom,l.batch,l.externalHu||'',l.pack1Type,l.pack1Qty,l.pack1Count||0,l.pack2Type,l.pack2Qty,l.pack2Count||0,l.incompleteType||'', ...incompleteCols, l.incompleteTotal||0, l.notes, l.countedAt];
  });
  return [header, ...rows];
}

function renderExportPreview(){
  const d = getDelimiter();
  const rows = buildExportRows().slice(0,6);
  const preview = document.getElementById('exportPreview');
  preview.value = rows.map(r=>r.join(d)).join('\n') + (state.lines.length>5 ? '\n'+t('more_lines_suffix', {n: state.lines.length}) : '');
}
document.querySelectorAll('input[name=delim]').forEach(r=>r.addEventListener('change', renderExportPreview));

document.getElementById('btnDownload').addEventListener('click', ()=>{
  if(!state.lines.length){ showToast(t('toast_no_lines_export'), true); return; }
  const d = getDelimiter();
  const text = buildExportRows().map(r=>r.join(d)).join('\r\n');
  const ext = d==='\t' ? 'txt' : 'csv';
  const blob = new Blob(['﻿'+text], {type:'text/plain;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const stamp = new Date().toISOString().slice(0,16).replace(/[:T]/g,'-');
  a.href = url; a.download = `contagem-inventario-${stamp}.${ext}`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(t('toast_downloaded'));
});

document.getElementById('btnClearAll').addEventListener('click', async ()=>{
  if(!state.lines.length) return;
  if(confirm(t('confirm_clear_all', {n: state.lines.length}))){
    state.lines = [];
    await persistLines();
    updateLineCount();
    renderList();
    renderExportPreview();
    showToast(t('toast_cleared'));
  }
});
