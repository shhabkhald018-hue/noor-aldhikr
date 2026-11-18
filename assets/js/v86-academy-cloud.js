'use strict';
(()=>{
  const SUBJECTS={creed:'العقيدة',fiqh:'الفقه',seerah:'السيرة النبوية',hadith:'الحديث'};
  const db=()=>window.NOOR_V86_SECURITY?.client?.()||null;
  const diffMap={'أساسي':'easy','متوسط':'medium','متقدم':'hard'};
  async function seedComplete(c){
    const {data,error}=await c.from('app_settings').select('key,value').in('key',['academy_v87_seed_complete','academy_v86_seed_complete']);
    if(error)return false;
    return (data||[]).some(x=>String(x.value||'').toLowerCase()==='true');
  }
  async function loadQuestions(){
    const c=db(); if(!c)return null;
    try{
      if(!await seedComplete(c))return null;
      const {data,error}=await c.from('academy_questions').select('id,subject,question,options,correct_index,explanation,difficulty').eq('active',true).eq('review_status','published');
      if(error)throw error;
      const out={creed:[],fiqh:[],seerah:[],hadith:[]};
      for(const x of data||[]){if(!out[x.subject]||!Array.isArray(x.options)||x.options.length!==4)continue;out[x.subject].push({id:`cloud-${x.id}`,subject:x.subject,subjectName:SUBJECTS[x.subject],level:diffMap[x.difficulty]||'medium',lesson:null,q:String(x.question),opts:x.options.map(String),correct:+x.correct_index,why:String(x.explanation||'راجع شرح الدرس والمصدر المعتمد.'),kind:'cloud'});}
      if(Object.values(out).some(a=>a.length===0))return null;
      window.NOOR_V86_CLOUD_BANK=out;setTimeout(()=>window.NOOR_RENDER_ACADEMY_EXAMS?.(),0);return out;
    }catch(e){console.warn('V86 cloud questions:',e);return null}
  }
  async function loadLessons(){
    const c=db(); if(!c)return null;
    try{
      if(!await seedComplete(c))return null;
      const {data,error}=await c.from('academy_lessons').select('id,subject,title,summary,body,reference_text,sort_order').eq('active',true).eq('review_status','published').order('sort_order');
      if(error)throw error;
      const out={creed:[],fiqh:[],seerah:[],hadith:[]};
      for(const x of data||[]){if(out[x.subject])out[x.subject].push([String(x.title),String(x.summary||x.body||''),String(x.reference_text||'المراجع المعتمدة')]);}
      window.NOOR_V86_CLOUD_LESSONS=out;window.dispatchEvent(new CustomEvent('noor:v86-lessons-ready',{detail:out}));return out;
    }catch(e){console.warn('V86 cloud lessons:',e);return null}
  }
  async function saveExam(result){
    const c=db(); if(!c)return false;
    try{const {data:{session}}=await c.auth.getSession();if(!session?.user)return false;const p=await window.NOOR_V86_SECURITY.profile();if(!p||p.active===false)return false;const {error}=await c.from('exam_attempts').insert({user_id:session.user.id,scope:result.scope||'all',difficulty:result.level||'all',score:+result.score,total:+result.total,percent:+result.percent,breakdown:result.per||{}});if(error)throw error;return true}catch(e){console.warn('V86 exam sync:',e);return false}
  }
  async function saveProgress(subject,lessonKey,completed=true){
    const c=db();if(!c)return false;
    try{const {data:{session}}=await c.auth.getSession();if(!session?.user)return false;const p=await window.NOOR_V86_SECURITY.profile();if(!p||p.active===false)return false;const row={user_id:session.user.id,subject,lesson_key:String(lessonKey),completed:!!completed,completed_at:new Date().toISOString()};const {error}=await c.from('learning_progress').upsert(row,{onConflict:'user_id,subject,lesson_key'});if(error)throw error;return true}catch(e){console.warn('V86 progress sync:',e);return false}
  }
  async function loadProgress(){
    const c=db();if(!c)return [];
    try{const {data:{session}}=await c.auth.getSession();if(!session?.user)return [];const {data,error}=await c.from('learning_progress').select('subject,lesson_key,completed').eq('user_id',session.user.id);if(error)throw error;return data||[]}catch(e){console.warn('V86 progress load:',e);return []}
  }
  window.NOOR_V86_ACADEMY={loadQuestions,loadLessons,saveExam,saveProgress,loadProgress};
  // Start early; exam renderer can await/use the populated globals.
  loadQuestions();loadLessons();
})();
