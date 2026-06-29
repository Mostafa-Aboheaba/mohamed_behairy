/**
 * إحصائيات التلاوات — Supabase
 *
 * شكل البيانات المحلية:
 * { plays: { anam: 12 }, downloads: { anam: 3 } }
 */
const AudioStats = {
  STORAGE_KEY: 'memorial_audio_stats_v2',

  cache: { plays: {}, downloads: {} },
  listeners: [],

  get isOnline() {
    return Boolean(window.supabaseClient);
  },

  async init() {
    if (!this.isOnline) {
      this.cache = this._loadLocal();
      return this.cache;
    }

    const { data, error } = await window.supabaseClient
      .from('track_stats')
      .select('track_id, plays, downloads');

    if (error) {
      console.error('[AudioStats] load failed', error);
      ErrorReporting.capture('audio_stats_load', error, {
        code: error.code,
      });
      this.cache = this._loadLocal();
      return this.cache;
    }

    this.cache = { plays: {}, downloads: {} };
    data.forEach((row) => {
      this.cache.plays[row.track_id] = Number(row.plays) || 0;
      this.cache.downloads[row.track_id] = Number(row.downloads) || 0;
    });

    return this.cache;
  },

  getTrack(trackId) {
    return {
      plays: this.cache.plays[trackId] || 0,
      downloads: this.cache.downloads[trackId] || 0,
    };
  },

  getAll() {
    return {
      plays: { ...this.cache.plays },
      downloads: { ...this.cache.downloads },
    };
  },

  async recordPlay(trackId) {
    this.cache.plays[trackId] = (this.cache.plays[trackId] || 0) + 1;
    await this._persist('play', trackId);
    this._notify(trackId);
  },

  async recordDownload(trackId) {
    this.cache.downloads[trackId] = (this.cache.downloads[trackId] || 0) + 1;
    await this._persist('download', trackId);
    this._notify(trackId);
  },

  onUpdate(callback) {
    this.listeners.push(callback);
  },

  _notify(trackId) {
    const stats = this.getTrack(trackId);
    this.listeners.forEach((fn) => fn(trackId, stats));
  },

  _loadLocal() {
    try {
      const data = JSON.parse(localStorage.getItem(this.STORAGE_KEY));
      if (data?.plays && data?.downloads) return data;
    } catch {
      /* ignore */
    }
    return { plays: {}, downloads: {} };
  },

  async _persist(event, trackId) {
    if (!this.isOnline) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.cache));
      return;
    }

    const { error } = await window.supabaseClient.rpc('increment_track_stat', {
      p_track_id: trackId,
      p_event: event,
    });

    if (error) {
      console.error('[AudioStats] persist failed', error);
      ErrorReporting.capture('audio_stats_persist', error, {
        code: error.code,
        event,
        track_id: trackId,
      });
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.cache));
    }
  },
};
