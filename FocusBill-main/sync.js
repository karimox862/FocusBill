// ============================================================
// FocusBill — Cloud Sync Engine
// ============================================================
// Bidirectional sync between chrome.storage.local and Supabase.
// Strategy: local-first — local storage is source of truth,
//           cloud is backup. Push then pull on each sync.
// Requires: supabase.js (SupabaseAuth, SupabaseDB)
// ============================================================

// ── Table mappings: local field names ↔ DB column names ──────

const SYNC_TABLES = {
  clients: {
    remote: 'clients',
    localToRemote: function (item, userId) {
      return {
        user_id: userId,
        local_id: item.id,
        name: item.name,
        rate: item.rate || 0,
        updated_at: item.updated_at || new Date().toISOString()
      };
    },
    remoteToLocal: function (row) {
      return {
        id: row.local_id,
        name: row.name,
        rate: row.rate || 0,
        updated_at: row.updated_at
      };
    }
  },

  timeLogs: {
    remote: 'time_logs',
    localToRemote: function (item, userId) {
      return {
        user_id: userId,
        local_id: item.id,
        date: item.date,
        client: item.client || null,
        project: item.project || null,
        task: item.task || null,
        duration: item.duration,
        session_type: item.sessionType || 'work',
        updated_at: item.updated_at || new Date().toISOString()
      };
    },
    remoteToLocal: function (row) {
      return {
        id: row.local_id,
        date: row.date,
        client: row.client || '',
        project: row.project || '',
        task: row.task || '',
        duration: row.duration,
        sessionType: row.session_type || 'work',
        updated_at: row.updated_at
      };
    }
  },

  projects: {
    remote: 'projects',
    localToRemote: function (item, userId) {
      return {
        user_id: userId,
        local_id: item.id,
        name: item.name,
        client_id: item.clientId || null,
        type: item.type || 'hourly',
        description: item.description || null,
        status: item.status || 'active',
        deadline: item.deadline || null,
        amount: item.amount || null,
        milestones: item.milestones || [],
        updated_at: item.updated_at || new Date().toISOString()
      };
    },
    remoteToLocal: function (row) {
      return {
        id: row.local_id,
        name: row.name,
        clientId: row.client_id,
        type: row.type || 'hourly',
        description: row.description || '',
        status: row.status || 'active',
        deadline: row.deadline || null,
        amount: row.amount || null,
        milestones: row.milestones || [],
        createdAt: row.created_at || new Date().toISOString(),
        updated_at: row.updated_at
      };
    }
  },

  invoices: {
    remote: 'invoices',
    localToRemote: function (item, userId) {
      return {
        user_id: userId,
        local_id: item.id,
        number: item.number,
        client_id: item.clientId || null,
        type: item.type,
        items: item.items || [],
        subtotal: item.subtotal || 0,
        tax_rate: item.taxRate || 0,
        tax_amount: item.taxAmount || 0,
        discount: item.discount || 0,
        total: item.total || 0,
        notes: item.notes || null,
        due_date: item.dueDate || null,
        status: item.status || 'draft',
        paid_at: item.paidAt || null,
        updated_at: item.updated_at || new Date().toISOString()
      };
    },
    remoteToLocal: function (row) {
      return {
        id: row.local_id,
        number: row.number,
        clientId: row.client_id,
        type: row.type,
        items: row.items || [],
        subtotal: row.subtotal || 0,
        taxRate: row.tax_rate || 0,
        taxAmount: row.tax_amount || 0,
        discount: row.discount || 0,
        total: row.total || 0,
        notes: row.notes || '',
        dueDate: row.due_date || null,
        status: row.status || 'draft',
        paidAt: row.paid_at || null,
        createdAt: row.created_at || new Date().toISOString(),
        updated_at: row.updated_at
      };
    }
  },

  expenses: {
    remote: 'expenses',
    localToRemote: function (item, userId) {
      return {
        user_id: userId,
        local_id: item.id,
        description: item.description,
        amount: item.amount,
        category: item.category || null,
        date: item.date || null,
        client: item.client || null,
        receipt: item.receipt || null,
        tax_deductible: item.taxDeductible === true,
        notes: item.notes || null,
        updated_at: item.updated_at || new Date().toISOString()
      };
    },
    remoteToLocal: function (row) {
      return {
        id: row.local_id,
        description: row.description,
        amount: row.amount,
        category: row.category || '',
        date: row.date || '',
        client: row.client || '',
        receipt: row.receipt || null,
        taxDeductible: row.tax_deductible === true,
        notes: row.notes || '',
        updated_at: row.updated_at
      };
    }
  },

  notes: {
    remote: 'notes',
    localToRemote: function (item, userId) {
      return {
        user_id: userId,
        local_id: item.id,
        title: item.title || null,
        content: item.content || '',
        client: item.client || null,
        project: item.project || null,
        updated_at: item.updated_at || new Date().toISOString()
      };
    },
    remoteToLocal: function (row) {
      return {
        id: row.local_id,
        title: row.title || '',
        content: row.content || '',
        client: row.client || null,
        project: row.project || null,
        date: row.created_at || new Date().toISOString(),
        updated_at: row.updated_at
      };
    }
  }
};

// ── Sync Engine ──────────────────────────────────────────────

const SyncEngine = {
  _syncing: false,

  getLastSyncTimestamp: function () {
    return new Promise(function (resolve) {
      chrome.storage.local.get(['lastSyncAt'], function (result) {
        resolve(result.lastSyncAt || null);
      });
    });
  },

  setLastSyncTimestamp: function (ts) {
    return new Promise(function (resolve) {
      chrome.storage.local.set({ lastSyncAt: ts }, resolve);
    });
  },

  /**
   * Merge two arrays by id. Newer updated_at wins on conflicts.
   * Items only in remote get added. Items only in local stay.
   */
  mergeArrays: function (localArr, remoteArr) {
    var merged = new Map();

    (localArr || []).forEach(function (item) {
      merged.set(item.id, Object.assign({}, item));
    });

    (remoteArr || []).forEach(function (remoteItem) {
      var existing = merged.get(remoteItem.id);
      if (!existing) {
        merged.set(remoteItem.id, remoteItem);
      } else {
        var localTime = new Date(existing.updated_at || 0).getTime();
        var remoteTime = new Date(remoteItem.updated_at || 0).getTime();
        if (remoteTime > localTime) {
          merged.set(remoteItem.id, remoteItem);
        }
      }
    });

    return Array.from(merged.values());
  },

  /** Push a local array to its Supabase table via upsert (batched) */
  pushTable: async function (tableName, localItems, userId) {
    var config = SYNC_TABLES[tableName];
    if (!config || !localItems || localItems.length === 0) return { pushed: 0 };

    var rows = localItems.map(function (item) {
      return config.localToRemote(item, userId);
    });

    var BATCH_SIZE = 100;
    var pushed = 0;
    for (var i = 0; i < rows.length; i += BATCH_SIZE) {
      var batch = rows.slice(i, i + BATCH_SIZE);
      await SupabaseDB.upsert(config.remote, batch);
      pushed += batch.length;
    }
    return { pushed: pushed };
  },

  /** Pull all user rows from a Supabase table and merge with local */
  pullTable: async function (tableName, localItems) {
    var config = SYNC_TABLES[tableName];
    if (!config) return localItems;

    var remoteRows = await SupabaseDB.select(config.remote);
    var remoteItems = remoteRows.map(function (row) {
      return config.remoteToLocal(row);
    });

    return this.mergeArrays(localItems || [], remoteItems);
  },

  /** Push settings to user_settings (single row per user) */
  pushSettings: async function (settings, blockedSites, userId) {
    var row = {
      user_id: userId,
      user_name: settings.userName || null,
      user_email: settings.userEmail || null,
      user_company: settings.userCompany || null,
      company_address: settings.companyAddress || null,
      company_logo: settings.companyLogo || null,
      default_rate: settings.defaultRate || 75,
      payment_terms: settings.paymentTerms || null,
      tax_rate: settings.taxRate || 0,
      stripe_link: settings.stripeLink || null,
      paypal_link: settings.paypalLink || null,
      work_duration: settings.workDuration || 25,
      break_duration: settings.shortBreak || 5,
      blocked_sites: blockedSites || []
    };
    await SupabaseDB.upsert('user_settings', row, 'user_id');
  },

  /** Pull settings from user_settings and merge with local */
  pullSettings: async function (currentSettings) {
    var rows = await SupabaseDB.select('user_settings');
    if (!rows || rows.length === 0) return currentSettings;
    var r = rows[0];
    return {
      userName: r.user_name || currentSettings.userName || '',
      userEmail: r.user_email || currentSettings.userEmail || '',
      userCompany: r.user_company || currentSettings.userCompany || '',
      companyAddress: r.company_address || currentSettings.companyAddress || '',
      companyLogo: r.company_logo || currentSettings.companyLogo || '',
      defaultRate: r.default_rate != null ? r.default_rate : (currentSettings.defaultRate || 75),
      paymentTerms: r.payment_terms || currentSettings.paymentTerms || '',
      taxRate: r.tax_rate != null ? r.tax_rate : (currentSettings.taxRate || 0),
      stripeLink: r.stripe_link || currentSettings.stripeLink || '',
      paypalLink: r.paypal_link || currentSettings.paypalLink || '',
      workDuration: r.work_duration != null ? r.work_duration : (currentSettings.workDuration || 25),
      shortBreak: r.break_duration != null ? r.break_duration : (currentSettings.shortBreak || 5),
      longBreak: currentSettings.longBreak || 15
    };
  },

  /** Ensure user record exists in users table */
  ensureUser: async function (user) {
    await SupabaseDB.upsert('users', {
      id: user.id,
      email: user.email,
      display_name: (user.user_metadata && user.user_metadata.display_name) || user.email.split('@')[0],
      plan: 'free',
      extension_version: chrome.runtime.getManifest ? chrome.runtime.getManifest().version : '2.5.0'
    }, 'id');
  },

  /** Delete a single item from the cloud (best-effort) */
  cloudDelete: async function (tableName, localId) {
    var config = SYNC_TABLES[tableName];
    if (!config) return;
    try {
      var session = await SupabaseAuth.getSession();
      if (!session || !session.user) return;
      await SupabaseDB.delete(config.remote, [
        { column: 'user_id', op: 'eq', value: session.user.id },
        { column: 'local_id', op: 'eq', value: localId }
      ]);
    } catch (e) {
      // Fail silently — item will be absent locally, so next full sync won't re-add it
    }
  },

  /**
   * Full bidirectional sync: push local → cloud, then pull cloud → local.
   * Returns { status, syncedAt?, message? }
   */
  fullSync: async function () {
    if (this._syncing) return { status: 'already_syncing' };
    this._syncing = true;

    try {
      var session = await SupabaseAuth.getSession();
      if (!session || !session.user || !session.user.id) {
        this._syncing = false;
        return { status: 'not_logged_in' };
      }
      var userId = session.user.id;

      // Ensure user record
      await this.ensureUser(session.user);

      // Load local appData
      var appData = await new Promise(function (resolve) {
        chrome.storage.local.get(['appData'], function (result) {
          resolve(result.appData || {});
        });
      });

      // Stamp updated_at on items missing it (one-time migration)
      var now = new Date().toISOString();
      var tableNames = ['clients', 'timeLogs', 'projects', 'invoices', 'expenses', 'notes'];
      tableNames.forEach(function (t) {
        (appData[t] || []).forEach(function (item) {
          if (!item.updated_at) item.updated_at = now;
        });
      });

      // PUSH: local → cloud
      for (var i = 0; i < tableNames.length; i++) {
        var t = tableNames[i];
        if (appData[t] && appData[t].length > 0) {
          await this.pushTable(t, appData[t], userId);
        }
      }

      // Push settings + blocked sites
      if (appData.settings) {
        await this.pushSettings(appData.settings, appData.blockedSites || [], userId);
      }

      // PULL: cloud → local (merge)
      for (var j = 0; j < tableNames.length; j++) {
        var t2 = tableNames[j];
        appData[t2] = await this.pullTable(t2, appData[t2] || []);
      }

      // Pull settings
      appData.settings = await this.pullSettings(appData.settings || {});

      // Save merged data back to local
      await new Promise(function (resolve) {
        chrome.storage.local.set({ appData: appData }, resolve);
      });

      // Record sync timestamp
      var syncTime = new Date().toISOString();
      await this.setLastSyncTimestamp(syncTime);

      this._syncing = false;
      return { status: 'success', syncedAt: syncTime };
    } catch (err) {
      this._syncing = false;
      return { status: 'error', message: err.message };
    }
  }
};

// ── Exports ──────────────────────────────────────────────────

if (typeof window !== 'undefined') {
  window.SyncEngine = SyncEngine;
  window.SYNC_TABLES = SYNC_TABLES;
}
if (typeof self !== 'undefined' && typeof window === 'undefined') {
  self.SyncEngine = SyncEngine;
  self.SYNC_TABLES = SYNC_TABLES;
}
