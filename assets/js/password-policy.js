'use strict';

(() => {
  const MIN_LENGTH = 10;
  const MAX_LENGTH = 128;
  const DESCRIPTION = '10 أحرف على الأقل، وتتضمن حرفًا ورقمًا ورمزًا.';
  const LETTER_RE = /\p{L}/u;
  const NUMBER_RE = /\p{N}/u;
  const SYMBOL_RE = /[^\p{L}\p{N}\s]/u;

  function validate(value) {
    const password = String(value || '');
    if (password.length < MIN_LENGTH) {
      return { ok: false, message: `كلمة المرور يجب ألا تقل عن ${MIN_LENGTH} أحرف.` };
    }
    if (password.length > MAX_LENGTH) {
      return { ok: false, message: `كلمة المرور يجب ألا تزيد على ${MAX_LENGTH} حرفًا.` };
    }
    if (!LETTER_RE.test(password)) {
      return { ok: false, message: 'أضف حرفًا واحدًا على الأقل إلى كلمة المرور.' };
    }
    if (!NUMBER_RE.test(password)) {
      return { ok: false, message: 'أضف رقمًا واحدًا على الأقل إلى كلمة المرور.' };
    }
    if (!SYMBOL_RE.test(password)) {
      return { ok: false, message: 'أضف رمزًا واحدًا على الأقل مثل ! أو @ أو #.' };
    }
    return { ok: true, message: '' };
  }

  window.NOOR_PASSWORD_POLICY = Object.freeze({
    minLength: MIN_LENGTH,
    maxLength: MAX_LENGTH,
    description: DESCRIPTION,
    validate
  });
})();
