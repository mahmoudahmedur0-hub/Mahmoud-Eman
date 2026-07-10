(function(){
  const canvas = document.getElementById('skyCanvas');
  const ctx = canvas.getContext('2d');
  let W=0,H=0,parts=[];
  const palettes = [
    ['#d9ae55','#f8dc8d','#fff6cf'],
    ['#e6a3a8','#ffd6dc','#fff0f2'],
    ['#d9ae55','#e6a3a8','#ffffff'],
    ['#ffcf7a','#fff1b8','#f7c8c9']
  ];
  function size(){W=canvas.width=innerWidth;H=canvas.height=innerHeight}
  addEventListener('resize',size,{passive:true}); size();
  function add(x,y,vx,vy,life,color,r,type='dot'){
    parts.push({x,y,vx,vy,life,age:0,color,r,type,rot:Math.random()*6});
  }
  function burst(x,y,count=90,mode='circle'){
    const colors = palettes[Math.floor(Math.random()*palettes.length)];
    for(let i=0;i<count;i++){
      const a=(Math.PI*2*i/count)+(Math.random()*.12);
      let radiusShape=1;
      if(mode==='heart') radiusShape = 1 - Math.sin(a);
      if(mode==='star') radiusShape = i%2 ? .45 : 1.1;
      const s=(2.1+Math.random()*4.6)*radiusShape;
      add(x,y,Math.cos(a)*s,Math.sin(a)*s,62+Math.random()*26,colors[i%colors.length],1.8+Math.random()*2.8,mode==='confetti'?'confetti':'dot');
    }
  }
  function fountain(x){
    for(let i=0;i<80;i++){
      const a=-Math.PI/2 + (Math.random()-.5)*.85;
      const s=2+Math.random()*6;
      add(x,H-8,Math.cos(a)*s,Math.sin(a)*s,45+Math.random()*35,['#f8dc8d','#fff','#e6a3a8'][i%3],1.8+Math.random()*2.2,'dot');
    }
  }
  function rocket(fromX,toX,toY,mode){
    const startY=H+18; let t=0; const steps=34;
    const id=setInterval(()=>{
      t++;
      const p=t/steps;
      const x=fromX+(toX-fromX)*p;
      const y=startY+(toY-startY)*p;
      add(x,y,(Math.random()-.5)*.5,-1.1,22,'#f8dc8d',2.3,'dot');
      if(t>=steps){clearInterval(id); burst(toX,toY,95+Math.floor(Math.random()*45),mode);}
    },16);
  }
  let clickNo=0;
  function celebration(){
    clickNo++;
    const modes=['circle','heart','star','confetti'];
    const mode=modes[clickNo%modes.length];
    const rockets=4+(clickNo%3);
    for(let i=0;i<rockets;i++){
      setTimeout(()=>rocket(W*(.08+Math.random()*.84),W*(.14+Math.random()*.72),H*(.13+Math.random()*.35),modes[(clickNo+i)%modes.length]),i*130);
    }
    setTimeout(()=>fountain(W*.18),140);
    setTimeout(()=>fountain(W*.82),260);
    setTimeout(()=>burst(W*.5,H*.42,130,mode),620);
  }
  function loop(){
    ctx.clearRect(0,0,W,H);
    parts=parts.filter(p=>p.life>0);
    for(const p of parts){
      p.age++; p.life--; p.x+=p.vx; p.y+=p.vy; p.vy+=.035; p.rot+=.08;
      ctx.globalAlpha=Math.max(p.life/80,0);
      ctx.fillStyle=p.color;
      if(p.type==='confetti'){
        ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot); ctx.fillRect(-p.r*1.8,-p.r*.55,p.r*3.6,p.r*1.1); ctx.restore();
      }else{ ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill(); }
    }
    ctx.globalAlpha=1; requestAnimationFrame(loop);
  }
  loop();
  window.PartyFX = {celebration};
})();
