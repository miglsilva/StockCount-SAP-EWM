function showScreen(name){
  document.querySelectorAll('section.screen').forEach(s=>s.classList.toggle('active', s.dataset.screen===name));
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active', b.dataset.nav===name));
  if(name!=='count' || state.step!==1){ stopScanner(); }
  if(name==='list'){ renderList(); renderExportPreview(); }
}
document.querySelectorAll('.nav-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>showScreen(btn.dataset.nav));
});

(async function init(){
  await loadConfig();
  try{
    const lang = await localStore.get('lang-pref');
    if(lang && CONFIG.languages[lang]) LANG = lang;
    else LANG = CONFIG.defaultLanguage || 'pt';
  }catch(e){ LANG = CONFIG.defaultLanguage || 'pt'; }
  renderLangSwitch();
  applyTranslations();
  renderPackagingOptions();
  await loadPersisted();
  applyTranslations();
})();
