(function(){
  const arabicDigits = n => String(n).padStart(2,'0').replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
  function update(){
    document.querySelectorAll('.counter').forEach(card=>{
      let diff = new Date(card.dataset.date) - new Date();
      if(diff < 0) diff = 0;
      const total = Math.floor(diff/1000);
      const days = Math.floor(total/86400);
      const hours = Math.floor((total%86400)/3600);
      const minutes = Math.floor((total%3600)/60);
      const seconds = total%60;
      const map = {days,hours,minutes,seconds};
      Object.entries(map).forEach(([key,val])=>{
        const node = card.querySelector(`[data-unit="${key}"]`);
        if(node) node.textContent = arabicDigits(val);
      });
    });
  }
  update();
  setInterval(update,1000);
})();
