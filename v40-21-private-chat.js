'use strict';

(() => {
  let chatUser = null;
  let chatPoll = null;
  let sending = false;
  let lastMessageSignature = '';

  const e = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[ch]));

  const formatTime = (value) => {
    if (!value) return '';
    try {
      return new Date(value).toLocaleString('ar-EG', {dateStyle:'medium', timeStyle:'short'});
    } catch (_) { return ''; }
  };

  const setChatState = (message, type='muted') => {
    const box = document.querySelector('#privateChatState');
    if (!box) return;
    box.textContent = message || '';
    box.className = `private-chat-state ${type}`;
  };

  const explainError = (error) => {
    const raw = String(error?.message || error || '');
    if (/private_messages|PGRST205|42P01|send_my_private_message|PGRST202/i.test(raw)) {
      return 'المحادثة الخاصة لم تُفعّل في قاعدة البيانات بعد. شغّل ملف SUPABASE_V40_21_PRIVATE_CHAT.sql مرة واحدة.';
    }
    if (/AUTH_REQUIRED|JWT|not authenticated/i.test(raw)) return 'سجّل الدخول أولًا لفتح محادثتك الخاصة.';
    if (/INVALID_MESSAGE_LENGTH/i.test(raw)) return 'اكتب رسالة من حرف واحد إلى 4000 حرف.';
    if (/INACTIVE_ACCOUNT/i.test(raw)) return 'الحساب غير مفعّل حاليًا.';
    if (/fetch|network/i.test(raw)) return 'تعذر الاتصال بالخادم. تحقق من الإنترنت.';
    return raw || 'تعذر تنفيذ العملية.';
  };

  async function resolveUser() {
    if (!window.supabaseClient) return null;
    const {data, error} = await supabaseClient.auth.getSession();
    if (error) throw error;
    chatUser = data?.session?.user || null;
    return chatUser;
  }

  function renderMessages(messages) {
    const box = document.querySelector('#privateChatMessages');
    if (!box) return;
    const signature = messages.map(m => `${m.id}:${m.read_by_user_at || ''}`).join('|');
    if (signature === lastMessageSignature && box.children.length) return;
    lastMessageSignature = signature;

    if (!messages.length) {
      box.innerHTML = `<div class="private-chat-empty"><span>💬</span><strong>ابدأ محادثتك الخاصة</strong><p>اكتب رسالتك للمالك، ولن تظهر لأي مستخدم آخر.</p></div>`;
      return;
    }
    box.innerHTML = messages.map((m) => {
      const mine = m.sender_role === 'user';
      const read = mine ? Boolean(m.read_by_owner_at) : Boolean(m.read_by_user_at);
      return `<article class="private-chat-message ${mine ? 'from-user' : 'from-owner'}">
        <div class="private-chat-message-meta"><strong>${mine ? 'أنت' : 'المالك'}</strong><time>${e(formatTime(m.created_at))}</time></div>
        <p>${e(m.body).replace(/\n/g,'<br>')}</p>
        ${mine ? `<small>${read ? 'تمت القراءة' : 'تم الإرسال'}</small>` : ''}
      </article>`;
    }).join('');
    box.scrollTop = box.scrollHeight;
  }

  async function updateUnreadBadge() {
    const badge = document.querySelector('#privateChatUnreadBadge');
    if (!badge || !chatUser || !window.supabaseClient) return;
    const {count, error} = await supabaseClient.from('private_messages')
      .select('id', {count:'exact', head:true})
      .eq('user_id', chatUser.id)
      .eq('sender_role','owner')
      .is('read_by_user_at', null);
    if (error) return;
    const total = Number(count) || 0;
    badge.textContent = total > 99 ? '99+' : String(total);
    badge.classList.toggle('hidden', total < 1);
  }

  async function loadPrivateMessages({silent=false}={}) {
    const box = document.querySelector('#privateChatMessages');
    if (!box || !window.supabaseClient) return;
    try {
      if (!chatUser) await resolveUser();
      if (!chatUser) {
        setChatState('سجّل الدخول لعرض محادثتك الخاصة.', 'warning');
        return;
      }
      if (!silent) setChatState('جاري تحميل المحادثة…');
      const {data, error} = await supabaseClient.from('private_messages')
        .select('id,user_id,sender_id,sender_role,body,created_at,read_by_owner_at,read_by_user_at')
        .eq('user_id', chatUser.id)
        .order('created_at', {ascending:true})
        .limit(500);
      if (error) throw error;
      renderMessages(data || []);
      await supabaseClient.rpc('mark_my_private_messages_read');
      await updateUnreadBadge();
      setChatState('المحادثة خاصة بين حسابك والمالك فقط.', 'success');
    } catch (error) {
      if (!silent) setChatState(explainError(error), 'error');
    }
  }

  async function sendPrivateMessage(event) {
    event.preventDefault();
    if (sending || !window.supabaseClient) return;
    const input = document.querySelector('#privateChatInput');
    const button = document.querySelector('#privateChatSend');
    const body = input?.value.trim() || '';
    if (!body) return;
    if (body.length > 4000) {
      setChatState('الرسالة لا يمكن أن تتجاوز 4000 حرف.', 'error');
      return;
    }
    try {
      sending = true;
      if (button) { button.disabled = true; button.textContent = 'جاري الإرسال…'; }
      const {error} = await supabaseClient.rpc('send_my_private_message', {message_text: body});
      if (error) throw error;
      input.value = '';
      const counter = document.querySelector('#privateChatCounter');
      if (counter) counter.textContent = '0 / 4000';
      await loadPrivateMessages();
    } catch (error) {
      setChatState(explainError(error), 'error');
    } finally {
      sending = false;
      if (button) { button.disabled = false; button.textContent = 'إرسال للمالك'; }
    }
  }

  function startPolling() {
    clearInterval(chatPoll);
    chatPoll = setInterval(() => {
      if (document.visibilityState === 'visible' && navigator.onLine && chatUser) {
        loadPrivateMessages({silent:true});
      }
    }, 12000);
  }

  document.querySelector('#privateChatForm')?.addEventListener('submit', sendPrivateMessage);
  document.querySelector('#privateChatRefresh')?.addEventListener('click', () => loadPrivateMessages());
  document.querySelector('#privateChatInput')?.addEventListener('input', (event) => {
    const counter = document.querySelector('#privateChatCounter');
    if (counter) counter.textContent = `${event.target.value.length} / 4000`;
  });
  document.querySelector('[data-page="privateChat"]')?.addEventListener('click', () => loadPrivateMessages());

  window.addEventListener('noor:user-ready', async (event) => {
    chatUser = event.detail?.user || null;
    await loadPrivateMessages({silent:true});
    startPolling();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && chatUser) loadPrivateMessages({silent:true});
  });

  setTimeout(async () => {
    try {
      await resolveUser();
      if (chatUser) {
        await updateUnreadBadge();
        startPolling();
      }
    } catch (_) {}
  }, 700);
})();
