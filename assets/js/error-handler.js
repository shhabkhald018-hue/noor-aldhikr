'use strict';
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.NOOR_ERROR_HANDLER=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const DEFAULT_MESSAGE='تعذر إكمال الطلب الآن. حاول مرة أخرى بعد قليل.';

  function technicalText(error){
    if(error==null)return '';
    if(typeof error==='string')return error;
    return [error.message,error.details,error.hint,error.code,error.status].filter(Boolean).join(' ');
  }

  function toArabic(error,fallback=DEFAULT_MESSAGE){
    const text=technicalText(error).toLowerCase();
    if(!text)return fallback;
    if(/abort|timeout|timed out/.test(text))return 'انتهت مهلة الاتصال. تحقق من الإنترنت ثم أعد المحاولة.';
    if(/failed to fetch|fetch failed|network|load failed|offline|dns|econn/.test(text))return 'تعذر الاتصال بالخدمة. تحقق من الإنترنت ثم أعد المحاولة.';
    if(/invalid login|invalid credentials|email or password|wrong password/.test(text))return 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
    if(/email.*not confirmed|confirm.*email/.test(text))return 'يرجى تأكيد البريد الإلكتروني قبل تسجيل الدخول.';
    if(/expired|invalid.*token|otp|recovery.*invalid/.test(text))return 'انتهت صلاحية الرابط أو أصبح غير صالح. اطلب رابطًا جديدًا.';
    if(/rate|too many|429/.test(text))return 'تم إرسال طلبات كثيرة. انتظر قليلًا ثم أعد المحاولة.';
    if(/duplicate|already exists|unique|23505/.test(text))return 'هذه البيانات مسجلة مسبقًا.';
    if(/permission|not allowed|forbidden|unauthorized|row.level|rls|401|403|42501/.test(text))return 'ليس لديك صلاحية لتنفيذ هذا الإجراء.';
    if(/not found|pgrst116|42p01|404/.test(text))return 'البيانات المطلوبة غير متاحة حاليًا.';
    if(/5\d\d|service unavailable|bad gateway|internal server/.test(text))return 'الخدمة غير متاحة مؤقتًا. حاول مرة أخرى بعد قليل.';
    return fallback;
  }

  function report(error,context='',fallback=DEFAULT_MESSAGE){
    if(typeof console!=='undefined'&&console.error)console.error(`[Noor${context?` · ${context}`:''}]`,error);
    return toArabic(error,fallback);
  }

  return {DEFAULT_MESSAGE,toArabic,report,technicalText};
});
