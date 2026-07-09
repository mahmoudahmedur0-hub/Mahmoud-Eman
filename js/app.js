const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const toArabic = n => String(n).padStart(2,'0').replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);

// Premium generated audio effects: no external files needed.
const AudioFX = (() => {
  let ctx = null;
  let master = null;
  let unlocked = false;

  function init(){
    if(ctx) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if(!Ctx) return;
    ctx = new Ctx();
    master = ctx.createGain();
    master.gain.value = 0.22;
    master.connect(ctx.destination);
  }

  function unlock(){
    init();
    if(ctx && ctx.state === 'suspended') ctx.resume();
    unlocked = true;
  }

  function osc(freq, type, start, dur, gainValue, dest=master){
    if(!ctx || !unlocked) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, start);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(Math.max(gainValue,0.0002), start + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    o.connect(g); g.connect(dest);
    o.start(start); o.stop(start + dur + .03);
    return o;
  }

  function noiseBuffer(duration=.5){
    if(!ctx) return null;
    const length = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for(let i=0;i<length;i++) data[i] = (Math.random()*2-1) * (1 - i/length);
    return buffer;
  }

  function noise(start, dur, gainValue, type='bandpass', freq=850, q=1.2){
    if(!ctx || !unlocked) return;
    const src = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const g = ctx.createGain();
    src.buffer = noiseBuffer(dur + .08);
    filter.type = type;
    filter.frequency.setValueAtTime(freq, start);
    filter.Q.value = q;
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(Math.max(gainValue,0.0002), start + .02);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    src.connect(filter); filter.connect(g); g.connect(master);
    src.start(start); src.stop(start + dur + .08);
  }

  function click(){
    unlock();
    if(!ctx) return;
    const t = ctx.currentTime;
    osc(980,'triangle',t,.07,.035);
    osc(520,'sine',t+.025,.08,.018);
  }

  function door(){
    unlock();
    if(!ctx) return;
    const t = ctx.currentTime;
    noise(t, .9, .07, 'lowpass', 550, .7);
    const creak = osc(96,'sawtooth',t+.05,1.15,.045);
    if(creak){
      creak.frequency.setValueAtTime(92,t+.05);
      creak.frequency.linearRampToValueAtTime(62,t+1.15);
    }
    osc(46,'sine',t+.32,.55,.055);
    osc(132,'triangle',t+.55,.28,.025);
  }

  function rocket(){
    unlock();
    if(!ctx) return;
    const t = ctx.currentTime;
    const whistle = osc(420,'sine',t,.75,.045);
    if(whistle){
      whistle.frequency.setValueAtTime(360,t);
      whistle.frequency.exponentialRampToValueAtTime(1250,t+.68);
    }
    noise(t, .55, .045, 'highpass', 900, .6);
    setTimeout(()=>burstSound(), 610);
  }

  function burstSound(){
    if(!ctx || !unlocked) return;
    const t = ctx.currentTime;
    noise(t, .42, .105, 'lowpass', 1150, .9);
    osc(62,'sine',t,.33,.08);
    osc(170,'triangle',t+.02,.22,.035);
  }

  function sparkle(){
    unlock();
    if(!ctx) return;
    const t = ctx.currentTime;
    [1240,1560,1980].forEach((f,i)=>osc(f,'sine',t+i*.055,.16,.018));
  }

  return {unlock, click, door, rocket, burst: burstSound, sparkle};
})();

const SoundFX = (() => {
  const files = {
    click: 'assets/audio/click.wav',
    door: 'assets/audio/door.wav',
    rocket: 'assets/audio/rocket.wav',
    sparkle: 'assets/audio/sparkle.wav'
  };
  const volumes = { click:.45, door:.95, rocket:.95, sparkle:.65 };
  const base = {};
  Object.keys(files).forEach(k => {
    const a = new Audio(files[k]);
    a.preload = 'auto';
    a.volume = volumes[k] || .7;
    base[k] = a;
  });
  function play(name, fallback){
    try{
      const original = base[name];
      if(original){
        const a = original.cloneNode(true);
        a.volume = volumes[name] || .7;
        const p = a.play();
        if(p && p.catch) p.catch(()=>{ if(fallback) fallback(); });
        return;
      }
    }catch(e){}
    if(fallback) fallback();
  }
  return {
    unlock(){ AudioFX.unlock(); },
    click(){ play('click', () => AudioFX.click()); },
    door(){ play('door', () => AudioFX.door()); },
    rocket(){ play('rocket', () => AudioFX.rocket()); },
    sparkle(){ play('sparkle', () => AudioFX.sparkle()); }
  };
})();

window.addEventListener('pointerdown', () => { AudioFX.unlock(); }, {once:true, passive:true});

document.addEventListener('click', (e)=>{
  if(e.target.closest('button,a')) SoundFX.click();
}, true);


const canvas = $('#fx');
const ctx = canvas.getContext('2d');
let particles = [];
let fxRunning = false;
let dpr = Math.min(window.devicePixelRatio || 1, 1.45);

function resize(){
  dpr = Math.min(window.devicePixelRatio || 1, 1.45);
  canvas.width = Math.floor(innerWidth * dpr);
  canvas.height = Math.floor(innerHeight * dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
resize();
addEventListener('resize', resize, {passive:true});

function runFx(){
  if(!fxRunning){
    fxRunning = true;
    requestAnimationFrame(animate);
  }
}

function burst(x, y, count=56, palette=['#d7ac58','#fff0b8','#f1b1aa','#ffffff']){
  const limit = 260;
  for(let i=0;i<count && particles.length < limit;i++){
    const a = Math.random()*Math.PI*2;
    const s = 1.2 + Math.random()*3.9;
    particles.push({
      x,y,
      vx:Math.cos(a)*s,
      vy:Math.sin(a)*s,
      life:40+Math.random()*28,
      max:68,
      size:1.8+Math.random()*3.4,
      color:palette[i%palette.length],
      gravity:.035
    });
  }
  runFx();
}

function rocket(){
  const startX = innerWidth*(.22+Math.random()*.56);
  const endY = innerHeight*(.18+Math.random()*.28);
  let y = innerHeight + 24;
  const timer = setInterval(()=>{
    y -= 20;
    particles.push({x:startX+(Math.random()-.5)*7,y,vx:(Math.random()-.5)*.5,vy:-1,life:16,max:22,size:2,color:'#fff0b8',gravity:0});
    runFx();
    if(y <= endY){
      clearInterval(timer);
      burst(startX,y,72);
    }
  },16);
}

function animate(){
  ctx.clearRect(0,0,innerWidth,innerHeight);
  particles = particles.filter(p => p.life-- > 0);
  for(const p of particles){
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.gravity;
    ctx.globalAlpha = Math.max(p.life/(p.max || 70),0);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  if(particles.length) requestAnimationFrame(animate);
  else fxRunning = false;
}

function updateCountdown(){
  $$('.units').forEach(box=>{
    let diff = new Date(box.dataset.target) - new Date();
    if(diff < 0) diff = 0;
    const sec = Math.floor(diff/1000)%60;
    const min = Math.floor(diff/60000)%60;
    const hrs = Math.floor(diff/3600000)%24;
    const days = Math.floor(diff/86400000);
    [sec,min,hrs,days].forEach((v,i)=> box.children[i].querySelector('b').textContent = toArabic(v));
  });
}
setInterval(updateCountdown,1000);
updateCountdown();

const revealObs = new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('show');
      revealObs.unobserve(entry.target);
    }
  });
},{threshold:.12, rootMargin:'0px 0px -24px 0px'});
$$('.reveal').forEach(el=>revealObs.observe(el));

const openGate = $('#openGate');
if(openGate){
  openGate.addEventListener('click', () => {
    SoundFX.door();
    const gate = $('#gate');
    gate.classList.add('is-open');
    burst(innerWidth/2, innerHeight/2, 46, ['#f7dd9d','#fff7ec','#f7c9c4']);
    setTimeout(()=>{
      gate.classList.add('is-hidden');
      $('#blessing').classList.add('show');
    }, 950);
    setTimeout(()=>$('#blessing').classList.add('show-ayah'), 2050);
    setTimeout(()=>{
      $('#blessing').classList.remove('show','show-ayah');
      $('#topbar').classList.add('show');
      window.scrollTo({top:0, behavior:'smooth'});
      $$('.hero .reveal').forEach(el=>el.classList.add('show'));
    }, 6400);
  });
}

$('#openMessage')?.addEventListener('click', () => { SoundFX.sparkle(); $('#msgModal').classList.add('show'); });
$('#closeMessage')?.addEventListener('click', () => $('#msgModal').classList.remove('show'));
$('#msgModal')?.addEventListener('click', e => { if(e.target.id === 'msgModal') $('#msgModal').classList.remove('show'); });

let lastParty = 0;
$('#partyBtn')?.addEventListener('click', () => {
  const now = Date.now();
  if(now - lastParty < 260) return;
  lastParty = now;

  const btn = $('#partyBtn');
  btn.classList.remove('is-launching');
  void btn.offsetWidth;
  btn.classList.add('is-launching');
  setTimeout(()=>btn.classList.remove('is-launching'), 680);

  SoundFX.rocket();
  rocket();
  setTimeout(()=>{ SoundFX.rocket(); rocket(); },260);
  setTimeout(()=>burst(innerWidth*.25, innerHeight*.30, 58),600);
  setTimeout(()=>burst(innerWidth*.75, innerHeight*.30, 58),820);

  const note = $('#partyNote');
  note.classList.add('show');
  clearTimeout(window.__partyTimer);
  window.__partyTimer = setTimeout(()=>note.classList.remove('show'), 1800);
  if(navigator.vibrate) navigator.vibrate(18);
});
