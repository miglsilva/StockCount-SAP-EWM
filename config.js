/* =========================================================================
   CONFIGURAÇÃO EXTERNA (config.json) — idiomas + tipos de embalagem
   Este ficheiro tenta carregar config.json (na mesma pasta) para que se
   possa editar textos/idiomas e tipos de embalagem sem tocar no HTML.
   Se o ficheiro não existir ou não puder ser lido (ex: a abrir localmente
   por file://), usa-se um conjunto de valores por omissão embutido, para
   que a app funcione sempre.
========================================================================= */
const DEFAULT_CONFIG = {
  defaultLanguage: "pt",
  packagingTypes: {
    pt: ["Palete", "Caixa", "Bidão"],
    en: ["Pallet", "Box", "Drum"]
  },
  uomTypes: {
    pt: ["PC", "KG", "L", "M", "CX"],
    en: ["PC", "KG", "L", "M", "BOX"]
  },
  languages: {
    pt: {
      lang_name: "Português",
      brand_title: "Contagem EWM", master_status_empty: "sem dados mestre carregados",
      master_status_loaded: "{materials} materiais · {batches} batches · {bins} bins",
      stat_lines_suffix: "linhas",
      nav_count: "Contagem", nav_list: "Lista", nav_setup: "Dados",
      count_title: "Contagem", count_subtitle: "Segue os 4 passos para registar uma posição contada.",
      step_label_material: "Material", step_label_pack1: "1ª emb.", step_label_pack2: "2ª emb.", step_label_incomplete: "Incompletos",
      step1_card_title: "🔎 Identificar posição",
      btn_start_scan: "📷 Iniciar câmara", btn_stop_scan: "⏹ Parar câmara", btn_opening_scan: "⏳ A abrir câmara…",
      scan_hint_default: "Aponta a câmara à etiqueta. Assim que reconhecer material, lote ou posição, preenche automaticamente os campos abaixo.",
      scan_hint_scanning: "A procurar código… aponta à etiqueta.",
      scan_hint_error: "⚠️ Não foi possível aceder à câmara (permissão negada ou ligação sem HTTPS). Usa o preenchimento manual abaixo.",
      divider_or: "ou preenche manualmente",
      label_bin: "Posição (Storage Bin)", placeholder_bin: "Ex: A-01-02-03",
      label_material: "Material", placeholder_material: "Código do material",
      label_batch: "Batch / Lote", placeholder_batch: "Nº de lote",
      label_uom: "UoM", placeholder_uom: "Ex: PC, KG, L",
      label_external_hu: "HU Externa", placeholder_external_hu: "Código da HU externa",
      label_warehouse: "Warehouse", placeholder_warehouse: "Ex: 1000",
      unknown_label_bin: "posição", unknown_label_material: "material", unknown_label_batch: "batch",
      banner_unknown: "⚠️ {codes} não encontrado(s) na lista mestre. Podes continuar, mas confirma o código antes de exportar.",
      banner_ok: "✅ Posição, material e batch validados.",
      btn_next: "Seguinte →", btn_back: "← Voltar",
      toast_fill_required: "Preenche posição, material e batch antes de continuar.",
      toast_scan_read: "Código lido: {text}",
      step2_card_title: "📦 1ª unidade de embalagem",
      step2_hint: "Indica quanto contém cada unidade (na UoM definida no passo 1), o tipo de embalagem maior, e quantas unidades existem (ex: 3 bidões com 56 KG cada).",
      label_pack_qty: "Por unidade",
      label_pack_type: "Tipo de embalagem",
      label_pack_count: "Quantas unidades?",
      toast_choose_pack1: "Escolhe o tipo da 1ª unidade de embalagem.",
      step3_card_title: "📦 2ª unidade de embalagem",
      step3_hint: "Se existir uma segunda unidade dentro da anterior (ex: caixas soltas), indica o tipo de embalagem e quantas existem. Deixa a marcação \"sem 2ª unidade\" se não aplicável.",
      chk_no_pack1: "Sem 1ª unidade de embalagem nesta contagem",
      chk_no_pack2: "Sem 2ª unidade de embalagem nesta contagem",
      toast_choose_pack2: "Escolhe o tipo da 2ª unidade ou marca \"sem 2ª unidade\".",
      step4_card_title: "🧩 Unidades incompletas",
      chk_incomplete: "Existem unidades incompletas nesta posição",
      label_incomplete_type: "Tipo de embalagem",
      toast_choose_incomplete_type: "Escolhe o tipo de embalagem das unidades incompletas.",
      label_incomplete_count: "Quantas unidades incompletas?",
      incomplete_unit_label: "Unidade incompleta",
      label_notes: "Notas (opcional)", placeholder_notes: "Observações sobre esta contagem",
      summary_title: "✅ Resumo da linha",
      summary_bin_label: "Posição", summary_material_label: "Material", summary_batch_label: "Batch",
      summary_warehouse_label: "Warehouse", summary_external_hu_label: "HU Externa",
      warehouse_config_title: "Warehouse", warehouse_config_hint: "Valor fixo, usado em todas as linhas contadas neste dispositivo.",
      btn_save_warehouse: "Guardar warehouse", toast_warehouse_saved: "Warehouse guardado.",
      summary_incomplete_label: "Incompletas", summary_incomplete_total_label: "total",
      btn_confirm_line: "✓ Confirmar linha",
      toast_line_registered: "✓ Linha registada. Pronto para a próxima posição.",
      list_title: "Linhas contadas", list_subtitle: "Revê, apaga ou exporta as contagens desta sessão.",
      export_title: "⬇ Exportar", export_hint: "Formato provisório (v1) — ajustamos ao ficheiro modelo SAP EWM assim que o partilhares.",
      btn_clear_all: "🗑 Limpar tudo", btn_download: "Descarregar ficheiro",
      confirm_clear_all: "Apagar todas as {n} linhas contadas? Esta ação não pode ser desfeita.",
      toast_cleared: "Lista de contagens limpa.", toast_no_lines_export: "Ainda não há linhas para exportar.",
      toast_downloaded: "Ficheiro descarregado.",
      empty_state_text: "Ainda não há linhas contadas. Vai a \"Contagem\" para registar a primeira posição.",
      ticket_batch_prefix: "Batch", ticket_external_hu_prefix: "HU Externa", confirm_delete_line: "Apagar esta linha contada?",
      btn_delete_line: "🗑 Apagar", pack_chip_incomplete: "{type}: {n} incompleta(s) · total {total}",
      pack_chip_qty: "{type}: {count} × {qty}",
      pack_chip_count: "{type}: {count}",
      more_lines_suffix: "… ({n} linhas no total)",
      setup_title: "Dados mestre",
      setup_subtitle: "Carrega os ficheiros CSV ou Excel com as listas de materiais, batches e storage bins. Ficam guardados neste dispositivo.",
      card_materials_title: "Materiais", card_batches_title: "Batches / Lotes", card_bins_title: "Storage Bins",
      badge_records: "{n} registos", upload_placeholder: "Toca para carregar ficheiro (.csv / .xlsx)",
      pack_config_title: "Tipos de embalagem",
      pack_config_hint: "Estes são os tipos disponíveis nos passos 2 e 3 da contagem (para o idioma atual). Adiciona, remove ou renomeia conforme precisares.",
      btn_add_pack_type: "+ Adicionar tipo", btn_save_pack_types: "Guardar tipos",
      toast_pack_types_saved: "Tipos de embalagem guardados.", toast_pack_types_min: "Mantém pelo menos 1 tipo de embalagem.",
      uom_config_title: "Unidades de Medida (UoM)",
      uom_config_hint: "Estes são os únicos valores possíveis no campo UoM da contagem (para o idioma atual). Adiciona, remove ou renomeia conforme precisares.",
      btn_add_uom_type: "+ Adicionar UoM", btn_save_uom_types: "Guardar UoM",
      toast_uom_types_saved: "Unidades de medida guardadas.",
      required_fields_title: "Campos obrigatórios",
      required_fields_hint: "Desliga para tornar o campo opcional no passo 1 da contagem.",
      chk_optional_bin: "Storage Bin é opcional", chk_optional_batch: "Batch é opcional",
      optional_tag: "(opcional)",
      backup_card_title: "Cópia de segurança",
      backup_hint: "Os dados ficam guardados automaticamente neste dispositivo. Usa isto para levar os dados para outro dispositivo, ou como backup manual.",
      btn_backup_export: "⬇ Exportar (.json)", btn_backup_import: "⬆ Importar (.json)",
      info_https_banner: "ℹ️ Para a câmara funcionar em todos os dispositivos, esta app precisa de ser aberta via HTTPS (ou localhost). A abrir diretamente o ficheiro no telemóvel, alguns browsers bloqueiam o acesso à câmara — usa nesse caso o preenchimento manual.",
      info_config_banner: "⚙️ Idiomas e tipos de embalagem também podem ser definidos no ficheiro config.json, publicado ao lado deste ficheiro HTML.",
      mapping_col_code: "Coluna código", mapping_col_desc: "Coluna descrição", mapping_none_option: "— nenhuma —",
      map_extra_units_per_box: "Un. por caixa (opcional)", map_extra_units_per_pallet: "Un. por palete (opcional)",
      map_extra_uom: "UoM (opcional)",
      btn_save_mapping: "Guardar {title} ({count})",
      toast_cant_read_columns: "Não foi possível ler colunas neste ficheiro.",
      toast_master_saved: "{title}: {count} registos guardados.",
      toast_backup_downloaded: "Cópia de segurança descarregada.",
      confirm_restore_backup: "Isto substitui todos os dados mestre e linhas contadas atuais por este ficheiro. Continuar?",
      toast_backup_invalid: "Ficheiro de cópia de segurança inválido.",
      toast_backup_restored: "Cópia de segurança restaurada com sucesso.",
      toast_backup_read_error: "Não foi possível ler este ficheiro.",
      toast_storage_unavailable: "Este browser não permite guardar dados localmente (ex: modo privado). Os dados só duram esta sessão.",
      toast_cant_save_master: "Não foi possível guardar os dados mestre neste dispositivo.",
      toast_cant_save_lines: "Não foi possível guardar a lista de contagens neste dispositivo."
    },
    en: {
      lang_name: "English",
      brand_title: "EWM Stock Count", master_status_empty: "no master data loaded",
      master_status_loaded: "{materials} materials · {batches} batches · {bins} bins",
      stat_lines_suffix: "lines",
      nav_count: "Count", nav_list: "List", nav_setup: "Data",
      count_title: "Count", count_subtitle: "Follow the 4 steps to record a counted position.",
      step_label_material: "Material", step_label_pack1: "1st pack.", step_label_pack2: "2nd pack.", step_label_incomplete: "Incomplete",
      step1_card_title: "🔎 Identify position",
      btn_start_scan: "📷 Start camera", btn_stop_scan: "⏹ Stop camera", btn_opening_scan: "⏳ Opening camera…",
      scan_hint_default: "Point the camera at the label. As soon as it recognizes material, batch or bin, the fields below fill in automatically.",
      scan_hint_scanning: "Looking for a code… point at the label.",
      scan_hint_error: "⚠️ Could not access the camera (permission denied or no HTTPS). Use manual entry below.",
      divider_or: "or fill in manually",
      label_bin: "Bin (Storage Bin)", placeholder_bin: "E.g.: A-01-02-03",
      label_material: "Material", placeholder_material: "Material code",
      label_batch: "Batch", placeholder_batch: "Batch number",
      label_uom: "UoM", placeholder_uom: "E.g.: PC, KG, L",
      label_external_hu: "External HU", placeholder_external_hu: "External HU code",
      label_warehouse: "Warehouse", placeholder_warehouse: "E.g.: 1000",
      unknown_label_bin: "bin", unknown_label_material: "material", unknown_label_batch: "batch",
      banner_unknown: "⚠️ {codes} not found in the master list. You can continue, but confirm the code before exporting.",
      banner_ok: "✅ Bin, material and batch validated.",
      btn_next: "Next →", btn_back: "← Back",
      toast_fill_required: "Fill in bin, material and batch before continuing.",
      toast_scan_read: "Code read: {text}",
      step2_card_title: "📦 1st packaging unit",
      step2_hint: "Enter how much each unit contains (in the UoM set in step 1), the larger packaging type, and how many units there are (e.g. 3 drums with 56 KG each).",
      label_pack_qty: "Per unit",
      label_pack_type: "Packaging type",
      label_pack_count: "How many units?",
      toast_choose_pack1: "Choose the type of the 1st packaging unit.",
      step3_card_title: "📦 2nd packaging unit",
      step3_hint: "If there's a second unit inside the previous one (e.g. loose boxes), enter the packaging type and how many there are. Leave \"no 2nd unit\" checked if not applicable.",
      chk_no_pack1: "No 1st packaging unit for this count",
      chk_no_pack2: "No 2nd packaging unit for this count",
      toast_choose_pack2: "Choose the type of the 2nd unit or check \"no 2nd unit\".",
      step4_card_title: "🧩 Incomplete units",
      chk_incomplete: "There are incomplete units at this position",
      label_incomplete_type: "Packaging type",
      toast_choose_incomplete_type: "Choose the packaging type for the incomplete units.",
      label_incomplete_count: "How many incomplete units?",
      incomplete_unit_label: "Incomplete unit",
      label_notes: "Notes (optional)", placeholder_notes: "Remarks about this count",
      summary_title: "✅ Line summary",
      summary_bin_label: "Bin", summary_material_label: "Material", summary_batch_label: "Batch",
      summary_warehouse_label: "Warehouse", summary_external_hu_label: "External HU",
      warehouse_config_title: "Warehouse", warehouse_config_hint: "Fixed value, used for every line counted on this device.",
      btn_save_warehouse: "Save warehouse", toast_warehouse_saved: "Warehouse saved.",
      summary_incomplete_label: "Incomplete", summary_incomplete_total_label: "total",
      btn_confirm_line: "✓ Confirm line",
      toast_line_registered: "✓ Line recorded. Ready for the next position.",
      list_title: "Counted lines", list_subtitle: "Review, delete or export this session's counts.",
      export_title: "⬇ Export", export_hint: "Provisional layout (v1) — we'll match the SAP EWM template file once you share it.",
      btn_clear_all: "🗑 Clear all", btn_download: "Download file",
      confirm_clear_all: "Delete all {n} counted lines? This cannot be undone.",
      toast_cleared: "Count list cleared.", toast_no_lines_export: "There are no lines to export yet.",
      toast_downloaded: "File downloaded.",
      empty_state_text: "No lines counted yet. Go to \"Count\" to record the first position.",
      ticket_batch_prefix: "Batch", ticket_external_hu_prefix: "External HU", confirm_delete_line: "Delete this counted line?",
      btn_delete_line: "🗑 Delete", pack_chip_incomplete: "{type}: {n} incomplete · total {total}",
      pack_chip_qty: "{type}: {count} × {qty}",
      pack_chip_count: "{type}: {count}",
      more_lines_suffix: "… ({n} lines total)",
      setup_title: "Master data",
      setup_subtitle: "Upload the CSV or Excel files with material, batch and storage bin lists. They're saved on this device.",
      card_materials_title: "Materials", card_batches_title: "Batches", card_bins_title: "Storage Bins",
      badge_records: "{n} records", upload_placeholder: "Tap to upload file (.csv / .xlsx)",
      pack_config_title: "Packaging types",
      pack_config_hint: "These are the types available in steps 2 and 3 of the count (for the current language). Add, remove or rename as needed.",
      btn_add_pack_type: "+ Add type", btn_save_pack_types: "Save types",
      toast_pack_types_saved: "Packaging types saved.", toast_pack_types_min: "Keep at least 1 packaging type.",
      uom_config_title: "Units of Measure (UoM)",
      uom_config_hint: "These are the only values selectable in the count's UoM field (for the current language). Add, remove or rename as needed.",
      btn_add_uom_type: "+ Add UoM", btn_save_uom_types: "Save UoM",
      toast_uom_types_saved: "Units of measure saved.",
      required_fields_title: "Required fields",
      required_fields_hint: "Turn off to make the field optional in step 1 of the count.",
      chk_optional_bin: "Storage Bin is optional", chk_optional_batch: "Batch is optional",
      optional_tag: "(optional)",
      backup_card_title: "Backup",
      backup_hint: "Data is saved automatically on this device. Use this to move data to another device, or as a manual backup.",
      btn_backup_export: "⬇ Export (.json)", btn_backup_import: "⬆ Import (.json)",
      info_https_banner: "ℹ️ For the camera to work on every device, this app needs to be opened over HTTPS (or localhost). Opening the file directly on a phone, some browsers block camera access — use manual entry in that case.",
      info_config_banner: "⚙️ Languages and packaging types can also be set in the config.json file, published next to this HTML file.",
      mapping_col_code: "Code column", mapping_col_desc: "Description column", mapping_none_option: "— none —",
      map_extra_units_per_box: "Units per box (optional)", map_extra_units_per_pallet: "Units per pallet (optional)",
      map_extra_uom: "UoM (optional)",
      btn_save_mapping: "Save {title} ({count})",
      toast_cant_read_columns: "Could not read columns in this file.",
      toast_master_saved: "{title}: {count} records saved.",
      toast_backup_downloaded: "Backup downloaded.",
      confirm_restore_backup: "This replaces all current master data and counted lines with this file. Continue?",
      toast_backup_invalid: "Invalid backup file.",
      toast_backup_restored: "Backup restored successfully.",
      toast_backup_read_error: "Could not read this file.",
      toast_storage_unavailable: "This browser doesn't allow local data storage (e.g. private mode). Data will only last this session.",
      toast_cant_save_master: "Could not save master data on this device.",
      toast_cant_save_lines: "Could not save the count list on this device."
    }
  }
};

let CONFIG = null;
let LANG = 'pt';

async function loadConfig(){
  try{
    const res = await fetch('config.json', {cache:'no-store'});
    if(res.ok){ CONFIG = await res.json(); }
  }catch(e){ /* config.json indisponível — usa valores por omissão */ }
  if(!CONFIG || !CONFIG.languages){ CONFIG = DEFAULT_CONFIG; }
  if(!CONFIG.uomTypes){ CONFIG.uomTypes = DEFAULT_CONFIG.uomTypes; }

  // Customizações feitas no ecrã Dados (tipos de embalagem / UoM) ficam
  // guardadas neste dispositivo e sobrepõem-se ao config.json — sobrevivem a refresh.
  try{
    const custom = await localStore.get(STORAGE_KEYS.customLists);
    if(custom){
      if(custom.packagingTypes){ CONFIG.packagingTypes = Object.assign({}, CONFIG.packagingTypes, custom.packagingTypes); }
      if(custom.uomTypes){ CONFIG.uomTypes = Object.assign({}, CONFIG.uomTypes, custom.uomTypes); }
    }
  }catch(e){ /* sem customizações guardadas ainda, ou storage indisponível */ }
}

function t(key, vars){
  const dict = (CONFIG.languages[LANG]) || (CONFIG.languages[CONFIG.defaultLanguage]) || {};
  let str = dict[key] !== undefined ? dict[key] : key;
  if(vars){ Object.keys(vars).forEach(k=>{ str = str.split('{'+k+'}').join(vars[k]); }); }
  return str;
}

function getPackagingTypes(){
  const pt = CONFIG.packagingTypes || {};
  return pt[LANG] || pt[CONFIG.defaultLanguage] || ['Palete','Caixa','Bidão'];
}

function getUomTypes(){
  const ut = CONFIG.uomTypes || {};
  return ut[LANG] || ut[CONFIG.defaultLanguage] || [];
}

function applyTranslations(){
  document.querySelectorAll('[data-i18n]').forEach(el=>{ el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-ph]').forEach(el=>{ el.placeholder = t(el.dataset.i18nPh); });
  document.title = t('brand_title');
  renderMasterStatus();
  renderList();
  renderExportPreview();
  renderPackConfigEditor();
  renderUomConfigEditor();
  updateOptionalFieldTags();
  updatePackUomBadges();
}

function renderLangSwitch(){
  const sel = document.getElementById('langSwitch');
  sel.innerHTML = Object.keys(CONFIG.languages).map(code=>{
    const name = CONFIG.languages[code].lang_name || code.toUpperCase();
    return `<option value="${code}" ${code===LANG?'selected':''}>${name}</option>`;
  }).join('');
  sel.addEventListener('change', async ()=>{
    LANG = sel.value;
    try{ await localStore.set('lang-pref', LANG); }catch(e){}
    draftPackTypes = null;
    draftUomTypes = null;
    applyTranslations();
    renderPackagingOptions();
    updateUomStatus();
  });
}
