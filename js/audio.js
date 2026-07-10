(function(){
  const cfg = window.WEDDING_CONFIG.audio;
  const sounds = {};
  Object.entries(cfg).forEach(([key,src])=>{
    const audio = new Audio(src);
    audio.preload = 'auto';
    audio.volume = key === 'fireworks' ? 0.55 : key === 'rocket' ? 0.42 : 0.32;
    sounds[key] = audio;
  });
  window.SoundFX = {
    play(name){
      const base = sounds[name];
      if(!base) return;
      try{
        const copy = base.cloneNode();
        copy.volume = base.volume;
        copy.play().catch(()=>{});
      }catch(e){}
    }
  };
})();
