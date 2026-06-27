/**
 * سجل التعازي — Supabase
 */
const Condolences = {
  items: [],
  channel: null,

  get isOnline() {
    return Boolean(window.supabaseClient);
  },

  async init(onUpdate) {
    this.onUpdate = onUpdate;

    if (!this.isOnline) {
      this.items = this._loadLocal();
      this._notify();
      return;
    }

    await this.load();
    this._subscribe();
  },

  async load() {
    const { data, error } = await window.supabaseClient
      .from('condolences')
      .select('id, name, message, created_at')
      .eq('approved', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Condolences] load failed', error);
      this.items = this._loadLocal();
      this._notify();
      return;
    }

    this.items = data.map((row) => ({
      id: row.id,
      name: row.name,
      message: row.message,
      date: row.created_at,
    }));
    this._notify();
  },

  async submit(name, message) {
    if (!this.isOnline) {
      const list = this._loadLocal();
      list.push({ name, message, date: new Date().toISOString() });
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
      this.items = list.slice().reverse();
      this._notify();
      return { ok: true };
    }

    const { data, error } = await window.supabaseClient
      .from('condolences')
      .insert({ name, message })
      .select('id, name, message, created_at')
      .single();

    if (error) {
      console.error('[Condolences] submit failed', error);
      return { ok: false, error };
    }

    const item = {
      id: data.id,
      name: data.name,
      message: data.message,
      date: data.created_at,
    };

    if (!this.items.some((entry) => entry.id === item.id)) {
      this.items.unshift(item);
      this._notify();
    }

    return { ok: true };
  },

  _subscribe() {
    this.channel = window.supabaseClient
      .channel('condolences-live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'condolences' },
        (payload) => {
          const row = payload.new;
          if (!row.approved) return;

          const item = {
            id: row.id,
            name: row.name,
            message: row.message,
            date: row.created_at,
          };

          if (this.items.some((entry) => entry.id === item.id)) return;

          this.items.unshift(item);
          this._notify();
        }
      )
      .subscribe();
  },

  _notify() {
    if (typeof this.onUpdate === 'function') {
      this.onUpdate(this.items);
    }
  },

  STORAGE_KEY: 'memorial_condolences_mohamed_behairy',

  _loadLocal() {
    try {
      const list = JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || [];
      return list.slice().reverse();
    } catch {
      return [];
    }
  },
};
