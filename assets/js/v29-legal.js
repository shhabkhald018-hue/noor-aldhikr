
document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('.topic-source,.rq-source-line,.result-source').forEach(el=>{
    if(el.querySelector('.attribution-type')) return;
    const b=document.createElement('span');
    b.className='attribution-type';
    b.textContent='مرجع منسوب';
    el.prepend(b);
  });
});
