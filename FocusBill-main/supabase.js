// ============================================================
// FocusBill — Lightweight Supabase REST Client
// ============================================================
// No npm dependencies — uses fetch() directly against Supabase REST API.
// Works in both extension pages (window) and service worker (self).
// ============================================================

const SUPABASE_URL = 'https://hkjrsqwwulnqdzvoqhvm.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ajVF2srmZZIE2VXWYj6ZyA_21icWCGg';
const AUTH_URL = SUPABASE_URL + '/auth/v1';
const REST_URL = SUPABASE_URL + '/rest/v1';
const SESSION_KEY = 'supabaseSession';

// ============================================================
// AUTH
// ============================================================

const SupabaseAuth = {
  /** Read session from chrome.storage.local */
  getSession() {
    return new Promise((resolve) => {
      chrome.storage.local.get([SESSION_KEY], (result) => {
        resolve(result[SESSION_KEY] || null);
      });
    });
  },

  /** Persist session to chrome.storage.local */
  _saveSession(session) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [SESSION_KEY]: session }, resolve);
    });
  },

  /** Remove session */
  clearSession() {
    return new Promise((resolve) => {
      chrome.storage.local.remove(SESSION_KEY, resolve);
    });
  },

  /** Sign up with email + password */
  async signUp(email, password) {
    const res = await fetch(AUTH_URL + '/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error_description || data.msg || 'Signup failed');
    if (data.access_token) {
      await this._saveSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: Date.now() + (data.expires_in * 1000),
        user: data.user
      });
    }
    return data;
  },

  /** Sign in with email + password */
  async signIn(email, password) {
    const res = await fetch(AUTH_URL + '/token?grant_type=password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error_description || data.msg || 'Login failed');
    await this._saveSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + (data.expires_in * 1000),
      user: data.user
    });
    return data;
  },

  /** Refresh the access token using the refresh token */
  async refreshSession() {
    const session = await this.getSession();
    if (!session || !session.refresh_token) throw new Error('No refresh token');
    const res = await fetch(AUTH_URL + '/token?grant_type=refresh_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({ refresh_token: session.refresh_token })
    });
    const data = await res.json();
    if (!res.ok) {
      await this.clearSession();
      throw new Error('Session expired. Please sign in again.');
    }
    await this._saveSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + (data.expires_in * 1000),
      user: data.user
    });
    return data;
  },

  /** Get a valid access token, refreshing if needed */
  async getValidToken() {
    const session = await this.getSession();
    if (!session) return null;
    // Refresh if expiring within 60 seconds
    if (session.expires_at - Date.now() < 60000) {
      try {
        const refreshed = await this.refreshSession();
        return refreshed.access_token;
      } catch (e) {
        return null;
      }
    }
    return session.access_token;
  },

  /** Sign out (best-effort server call + clear local session) */
  async signOut() {
    const token = await this.getValidToken();
    if (token) {
      await fetch(AUTH_URL + '/logout', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'apikey': SUPABASE_ANON_KEY
        }
      }).catch(() => {});
    }
    await this.clearSession();
  },

  /** Check if user is logged in with a valid token */
  async isLoggedIn() {
    const token = await this.getValidToken();
    return !!token;
  }
};

// ============================================================
// DATABASE (PostgREST)
// ============================================================

const SupabaseDB = {
  /** Build auth headers */
  async _headers(token) {
    return {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };
  },

  /**
   * SELECT rows from a table.
   * options: { select, filters: [{ column, op, value }], order, limit }
   */
  async select(table, options) {
    options = options || {};
    const token = await SupabaseAuth.getValidToken();
    if (!token) throw new Error('Not authenticated');

    let url = REST_URL + '/' + table + '?select=' + (options.select || '*');
    if (options.filters) {
      options.filters.forEach(function (f) {
        url += '&' + f.column + '=' + f.op + '.' + encodeURIComponent(f.value);
      });
    }
    if (options.order) url += '&order=' + options.order;
    if (options.limit) url += '&limit=' + options.limit;

    const res = await fetch(url, { headers: await this._headers(token) });
    if (!res.ok) {
      const err = await res.json().catch(function () { return {}; });
      throw new Error('Select failed: ' + (err.message || res.statusText));
    }
    return res.json();
  },

  /**
   * UPSERT rows into a table (insert or update on conflict).
   * onConflict: comma-separated unique columns, default "user_id,local_id"
   */
  async upsert(table, rows, onConflict) {
    onConflict = onConflict || 'user_id,local_id';
    const token = await SupabaseAuth.getValidToken();
    if (!token) throw new Error('Not authenticated');

    const res = await fetch(REST_URL + '/' + table + '?on_conflict=' + onConflict, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation,resolution=merge-duplicates'
      },
      body: JSON.stringify(Array.isArray(rows) ? rows : [rows])
    });
    if (!res.ok) {
      const err = await res.json().catch(function () { return {}; });
      throw new Error('Upsert failed: ' + (err.message || res.statusText));
    }
    return res.json();
  },

  /**
   * DELETE rows from a table.
   * filters: [{ column, op, value }]
   */
  async delete(table, filters) {
    filters = filters || [];
    const token = await SupabaseAuth.getValidToken();
    if (!token) throw new Error('Not authenticated');

    let url = REST_URL + '/' + table;
    const params = filters.map(function (f) {
      return f.column + '=' + f.op + '.' + encodeURIComponent(f.value);
    });
    if (params.length) url += '?' + params.join('&');

    const res = await fetch(url, {
      method: 'DELETE',
      headers: await this._headers(token)
    });
    if (!res.ok) {
      const err = await res.json().catch(function () { return {}; });
      throw new Error('Delete failed: ' + (err.message || res.statusText));
    }
    return res.json().catch(function () { return []; });
  }
};

// ============================================================
// EXPORTS
// ============================================================

// Extension pages (window context)
if (typeof window !== 'undefined') {
  window.SupabaseAuth = SupabaseAuth;
  window.SupabaseDB = SupabaseDB;
}
// Service worker (self context, no window)
if (typeof self !== 'undefined' && typeof window === 'undefined') {
  self.SupabaseAuth = SupabaseAuth;
  self.SupabaseDB = SupabaseDB;
}
