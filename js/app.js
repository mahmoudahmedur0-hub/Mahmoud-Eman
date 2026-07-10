(function(){
  const gate = document.getElementById('gate');
  const openBtn = document.getElementById('openInvitation');
  const quran = document.getElementById('quranScene');
  const main = document.getElementById('mainContent');
  const rocketBtn = document.getElementById('rocketButton');
  const replayBtn = document.getElementById('replayIntro');
  const whatsapp = document.getElementById('whatsappButton');
  let introTimer = null;

  function showSite(){
    clearTimeout(introTimer);
    quran.classList.remove('show','playing');
    main.classList.remove('hidden');
    requestAnimationFrame(()=>main.classList.add('ready'));
    document.documentElement.classList.add('intro-seen');
    window.scrollTo({top:0,behavior:'auto'});
  }

  function playIntro(){
    clearTimeout(introTimer);
    document.documentElement.classList.remove('intro-seen');
    main.classList.add('hidden');
    main.classList.remove('ready');
    quran.classList.remove('show','playing');
    gate.classList.remove('is-open','opening');
    gate.style.display='grid';
    window.scrollTo({top:0,behavior:'auto'});
  }

  function openGate(){
    SoundFX.play('door');
    gate.classList.add('opening');
    setTimeout(()=>{
      gate.classList.add('is-open');
      quran.classList.remove('show','playing');
      void quran.offsetWidth;
      quran.classList.add('show');
      requestAnimationFrame(()=>quran.classList.add('playing'));
    },1050);
    introTimer=setTimeout(showSite,window.WEDDING_CONFIG.quranDuration);
  }

  openBtn.addEventListener('click',openGate);
  replayBtn.addEventListener('click',playIntro);

  document.addEventListener('click',e=>{
    if(e.target.closest('a,button') && !e.target.closest('#openInvitation,#rocketButton')) SoundFX.play('click');
  },{capture:true});

  rocketBtn.addEventListener('click',()=>{
    SoundFX.play('rocket');
    setTimeout(()=>SoundFX.play('fireworks'),470);
    PartyFX.celebration();
    if(navigator.vibrate) navigator.vibrate([18,25,18]);
  });

  const isMobile = window.matchMedia('(max-width: 620px)').matches;
  const observer = new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        const delay = Number(entry.target.dataset.revealDelay || 0);
        window.setTimeout(()=>entry.target.classList.add('visible'), delay);
        observer.unobserve(entry.target);
      }
    });
  },{
    threshold:isMobile?.28:.14,
    rootMargin:isMobile?'0px 0px -18% 0px':'0px 0px -35px 0px'
  });

  document.querySelectorAll('.reveal').forEach((el,index)=>{
    if(isMobile){
      const group = el.closest('.timeline,.countdown-grid');
      if(group){
        const siblings=[...group.querySelectorAll(':scope > .reveal')];
        const pos=siblings.indexOf(el);
        if(pos>0) el.dataset.revealDelay=String(pos*180);
      }
    }
    observer.observe(el);
  });

  const partyObserver = new IntersectionObserver(entries=>{
    entries.forEach(entry=>whatsapp.classList.toggle('is-prominent',entry.isIntersecting));
  },{threshold:.3});
  partyObserver.observe(document.getElementById('party'));

  document.documentElement.classList.toggle('is-mobile', isMobile);
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden) clearTimeout(introTimer);
  });

})();
