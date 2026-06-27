/**
 * تهيئة عميل Supabase
 */
(function initSupabaseClient() {
  const url = window.SUPABASE_URL;
  const key = window.SUPABASE_ANON_KEY;
  const isConfigured =
    url &&
    key &&
    !url.includes('YOUR_PROJECT') &&
    !key.includes('YOUR_ANON');

  if (!isConfigured) {
    console.warn(
      '[Supabase] غير مُعدّ — انسخ js/supabase-config.example.js إلى js/supabase-config.js'
    );
    window.supabaseClient = null;
    return;
  }

  if (!window.supabase) {
    console.error('[Supabase] المكتبة غير محمّلة');
    window.supabaseClient = null;
    return;
  }

  window.supabaseClient = window.supabase.createClient(url, key);
})();
