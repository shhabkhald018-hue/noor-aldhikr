'use strict';
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.NOOR_V90_STREAM=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  function sleep(ms){return new Promise(r=>setTimeout(r,ms))}
  async function streamText(text,{signal,onChunk=()=>{},chunkSize=18,delay=12}={}){
    const s=String(text||'');let out='';
    for(let i=0;i<s.length;i+=Math.max(1,chunkSize|0)){
      if(signal?.aborted)throw new Error('ABORTED');
      const chunk=s.slice(i,i+Math.max(1,chunkSize|0));out+=chunk;onChunk(chunk,out);
      if(signal?.aborted)throw new Error('ABORTED');
      if(delay>0)await sleep(delay);
    }
    return out;
  }
  return {streamText};
});
