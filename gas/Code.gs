/**
 * Invite Prewed Generator — backend Google Apps Script (Code.gs) v2
 * ===================================================================
 * Mendukung frontend React baru. Supaya link undangan bisa dibuka siapa saja
 * (tidak cuma di browser pembuat), foto disimpan ke Google Drive dan
 * data undangan (JSON) disimpan ke Google Sheet lewat Web App ini.
 *
 * CARA PAKAI (sekali saja, ±10 menit, butuh PC):
 *
 * 1. Buat Google Sheet baru (sheets.google.com) → salin ID-nya dari URL.
 *    Contoh: https://docs.google.com/spreadsheets/d/ABCDEF123456/edit → ID = ABCDEF123456
 * 2. (Opsional) Buat folder di Google Drive, misal "Foto Undangan" → salin ID foldernya.
 *    Kalau dilewati, file dibuat di root Drive.
 * 3. Buka script.google.com → New project → hapus isi Code.gs → paste file ini → Save.
 * 4. Project Settings (ikon gerigi) → Script Properties → Add:
 *      SHEET_ID        = ID Sheet dari langkah 1
 *      DRIVE_FOLDER_ID = ID folder dari langkah 2 (boleh kosong)
 *      ADMIN_PIN       = PIN rahasia super admin (wajib untuk akses /admin-gas & sheet settings)
 *      TOKEN           = string rahasia bebas, misal: k1ckm4n-2026-und4ngan
 *                        (boleh kosong = tanpa token; kalau diisi, frontend wajib kirim token yang sama)
 * 5. Deploy → New deployment → tipe "Web app" →
 *      Execute as: Me
 *      Who has access: Anyone
 *    → Deploy → salin Web App URL (https://script.google.com/macros/s/.../exec)
 * 6. Di frontend (halaman rahasia /admin-gas): masukkan URL Web App + PIN admin, lalu simpan token.
 *    Kalau Code.gs ini hasil update: Deploy → Manage deployments → Edit → New version → Deploy.
 *
 * API:
 *  POST { action:'getSettings', pin } → { ok:true, settings:{...} } / { ok:false, error }
 *  POST { action:'saveSettings', pin, settings:{...} } → { ok:true } / { ok:false, error }
 *  POST { action:'save', slug, token, data:{...undangan...} } → { ok:true, slug } / { ok:false, error }
 *  POST { action:'update', slug, token, patch:{namaTamu:'...'} } → { ok:true, updated:true } / { ok:false, error }
 *  POST { action:'delete', slug, token } → { ok:true, deleted:true } / { ok:false, error }
 *  GET  ?action=delete&slug=xxx&token=xxx → { ok:true, deleted:true } / { ok:false, error }
 *  GET  ?slug=xxx  →  { ok:true, slug, data } / { ok:false, error }
 *  GET  ?action=list&token=xxx  →  { ok:true, count, items:[{slug,nama,updatedAt}] } / { ok:false, error }
 *
 * Field foto yang diupload ke Drive (Data URL base64 → link publik):
 *  fotoCover, fotoPria, fotoWanita, galeri[] (array), musikUrl (kalau musikMode='upload')
 * Sheet hanya menyimpan link publik, bukan base64 (satu cell Sheet max 50rb karakter).
 */

// ---------- util ----------

var SHEET_NAME = 'invites';
var SETTINGS_SHEET_NAME = 'settings';

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getProps_() {
  return PropertiesService.getScriptProperties();
}

function getSheet_() {
  var sheetId = getProps_().getProperty('SHEET_ID');
  if (!sheetId) throw new Error('SHEET_ID belum diisi di Script Properties.');
  var ss = SpreadsheetApp.openById(sheetId);
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.getRange(1, 1, 1, 4).setValues([['slug', 'updatedAt', 'json', 'note']]);
    sh.setFrozenRows(1);
  }
  return sh;
}

// Sheet "settings" (key-value) untuk menyimpan konfigurasi tersembunyi
function getSettingsSheet_() {
  var sheetId = getProps_().getProperty('SHEET_ID');
  if (!sheetId) throw new Error('SHEET_ID belum diisi di Script Properties.');
  var ss = SpreadsheetApp.openById(sheetId);
  var sh = ss.getSheetByName(SETTINGS_SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SETTINGS_SHEET_NAME);
    sh.getRange(1, 1, 1, 2).setValues([['key', 'value']]);
    sh.setFrozenRows(1);
  }
  return sh;
}

function readSettings_() {
  var sh = getSettingsSheet_();
  var rows = sh.getDataRange().getValues();
  var settings = {};
  for (var i = 1; i < rows.length; i++) {
    var k = String(rows[i][0] || '').trim();
    if (k) {
      settings[k] = rows[i][1];
    }
  }
  return settings;
}

function writeSettings_(obj) {
  if (!obj || typeof obj !== 'object') return;
  var sh = getSettingsSheet_();
  var rows = sh.getDataRange().getValues();
  var keyMap = {};
  for (var i = 1; i < rows.length; i++) {
    var k = String(rows[i][0] || '').trim();
    if (k) keyMap[k] = i + 1;
  }
  for (var key in obj) {
    var val = obj[key];
    var strVal = (val === null || val === undefined) ? '' : String(val);
    if (keyMap[key]) {
      sh.getRange(keyMap[key], 2).setValue(strVal);
    } else {
      sh.appendRow([key, strVal]);
      keyMap[key] = sh.getLastRow();
    }
  }
}

// Validasi PIN admin untuk endpoint settings.
// Jika ADMIN_PIN di Script Properties belum diatur, endpoint settings nonaktif.
function checkPin_(pin) {
  var adminPin = getProps_().getProperty('ADMIN_PIN');
  if (!adminPin || !adminPin.trim()) {
    return { ok: false, error: 'ADMIN_PIN belum diatur' };
  }
  if (String(pin || '').trim() !== adminPin.trim()) {
    return { ok: false, error: 'PIN salah' };
  }
  return { ok: true };
}

// Token dicek dari Script Property TOKEN atau fallback ke sheet settings (key 'token').
// Kalau kosong di keduanya → siapa saja boleh nulis (mode santai, tetap butuh URL rahasia Web App).
function checkToken_(token) {
  var expected = getProps_().getProperty('TOKEN') || '';
  if (!expected) {
    try {
      var s = readSettings_();
      expected = s.token || s.TOKEN || '';
    } catch (e) { }
  }
  if (!expected) return true;
  return token === expected;
}

function extFromMime_(mime) {
  if (/png/i.test(mime)) return '.png';
  if (/webp/i.test(mime)) return '.webp';
  if (/gif/i.test(mime)) return '.gif';
  if (/mpeg|mp3/i.test(mime)) return '.mp3';
  return '.jpg';
}

// Upload satu Data URL base64 ke Drive (Anyone with link).
// Kembalikan link publik, atau null kalau input bukan Data URL base64.
function uploadDataUrl_(dataUrl, nameHint, kind) {
  var m = /^data:([^;,]+)?(;base64)?,(.*)$/s.exec(dataUrl || '');
  if (!m || !m[2]) return null; // bukan data URL base64 → biarkan apa adanya
  var mime = m[1] || (kind === 'audio' ? 'audio/mpeg' : 'image/jpeg');
  var blob = Utilities.newBlob(
    Utilities.base64Decode(m[3]),
    mime,
    (nameHint || 'file') + extFromMime_(mime)
  );
  var folderId = getProps_().getProperty('DRIVE_FOLDER_ID');
  var file = folderId
    ? DriveApp.getFolderById(folderId).createFile(blob)
    : DriveApp.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  var id = file.getId();
  if (kind === 'audio') {
    return 'https://drive.google.com/uc?export=download&id=' + id;
  }
  // thumbnail publik — cukup untuk <img> di halaman undangan
  return 'https://drive.google.com/thumbnail?id=' + id + '&sz=w1200';
}

// Helper untuk hapus baris berdasarkan slug
function deleteBySlug_(slug) {
  var sh = getSheet_();
  var rows = sh.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === slug) {
      sh.deleteRow(i + 1);
      return true;
    }
  }
  return false;
}

// ---------- POST: simpan / update / hapus undangan ----------

function doPost(e) {
  try {
    var rawText = (e && e.postData && e.postData.contents) || '{}';
    var body = {};
    try {
      body = JSON.parse(rawText);
    } catch (pe) {
      body = {};
    }

    var action = String(body.action || 'save');

    // ENDPOINT SETTINGS (dikunci ADMIN_PIN; tanpa token)
    if (action === 'getSettings') {
      var pinCheck = checkPin_(body.pin);
      if (!pinCheck.ok) return json_({ ok: false, error: pinCheck.error });
      return json_({ ok: true, settings: readSettings_() });
    }

    if (action === 'saveSettings') {
      var pinCheck = checkPin_(body.pin);
      if (!pinCheck.ok) return json_({ ok: false, error: pinCheck.error });
      writeSettings_(body.settings);
      return json_({ ok: true });
    }

    if (!checkToken_(body.token)) {
      return json_({ ok: false, error: 'token salah / tidak ada' });
    }

    // HAPUS undangan: { action:'delete', slug, token }
    if (action === 'delete') {
      var dslug = String(body.slug || '').trim();
      if (!dslug) return json_({ ok: false, error: 'slug kosong' });
      deleteBySlug_(dslug);
      return json_({ ok: true, slug: dslug, deleted: true });
    }

    // UPDATE undangan: { action:'update', slug, token, patch:{namaTamu:'...'} }
    if (action === 'update') {
      var uslug = String(body.slug || '').trim();
      var patch = body.patch || {};
      if (!uslug) return json_({ ok: false, error: 'slug kosong' });
      var shu = getSheet_();
      var rowsu = shu.getDataRange().getValues();
      for (var uu = 1; uu < rowsu.length; uu++) {
        if (String(rowsu[uu][0]) === uslug) {
          var cur;
          try { cur = JSON.parse(rowsu[uu][2] || '{}'); } catch (pe2) { cur = {}; }
          for (var kk in patch) { cur[kk] = patch[kk]; }
          var unote = ('namaTamu' in patch) ? String(patch.namaTamu || '').slice(0, 120) : rowsu[uu][3];
          shu.getRange(uu + 1, 1, 1, 4).setValues([[uslug, new Date().toISOString(), JSON.stringify(cur), unote]]);
          return json_({ ok: true, slug: uslug, updated: true });
        }
      }
      return json_({ ok: false, error: 'undangan tidak ditemukan' });
    }

    var data = body.data || {};
    var slug = String(body.slug || data.slug || '').trim();
    if (!slug) return json_({ ok: false, error: 'slug kosong' });

    // 1) Foto: Data URL → upload ke Drive → ganti dengan link publik
    ['fotoCover', 'fotoPria', 'fotoWanita'].forEach(function (f) {
      var v = data[f];
      if (typeof v === 'string' && v.indexOf('data:') === 0) {
        var link = uploadDataUrl_(v, slug + '-' + f, 'image');
        if (link) data[f] = link;
      }
    });
    if (Object.prototype.toString.call(data.galeri) === '[object Array]') {
      data.galeri = data.galeri.map(function (u, i) {
        if (typeof u === 'string' && u.indexOf('data:') === 0) {
          var glink = uploadDataUrl_(u, slug + '-galeri-' + (i + 1), 'image');
          return glink || u;
        }
        return u;
      });
    }

    // 2) MP3 custom (musikMode='upload'): Data URL → upload ke Drive → ganti link.
    if (data.musikMode === 'upload' && typeof data.musikUrl === 'string' && data.musikUrl.indexOf('data:') === 0) {
      var mlink = uploadDataUrl_(data.musikUrl, slug + '-musik', 'audio');
      if (mlink) data.musikUrl = mlink;
    }

    // 3) Simpan ke Sheet (upsert berdasarkan slug)
    var sh = getSheet_();
    var rows = sh.getDataRange().getValues();
    var rowIdx = -1;
    for (var i = 1; i < rows.length; i++) {
      if (String(rows[i][0]) === slug) { rowIdx = i + 1; break; }
    }
    var payload = [slug, new Date().toISOString(), JSON.stringify(data), String(data.namaTamu || '').slice(0, 120)];
    if (rowIdx > 0) sh.getRange(rowIdx, 1, 1, 4).setValues([payload]);
    else sh.appendRow(payload);

    return json_({ ok: true, slug: slug });
  } catch (err) {
    return json_({ ok: false, error: String((err && err.message) || err) });
  }
}

// ---------- GET: baca / hapus undangan ----------

function doGet(e) {
  try {
    var p = (e && e.parameter) || {};

    // HAPUS via GET (fallback jika POST diblokir CORS): ?action=delete&slug=xxx&token=xxx
    if (String(p.action || '') === 'delete') {
      if (!checkToken_(p.token)) return json_({ ok: false, error: 'token salah / tidak ada' });
      var delSlug = String(p.slug || '').trim();
      if (!delSlug) return json_({ ok: false, error: 'slug kosong' });
      deleteBySlug_(delSlug);
      return json_({ ok: true, slug: delSlug, deleted: true });
    }

    // UPDATE via GET: ?action=update&slug=xxx&namaTamu=xxx&token=xxx
    if (String(p.action || '') === 'update') {
      if (!checkToken_(p.token)) return json_({ ok: false, error: 'token salah / tidak ada' });
      var upSlug = String(p.slug || '').trim();
      if (!upSlug) return json_({ ok: false, error: 'slug kosong' });
      var shu = getSheet_();
      var rowsu = shu.getDataRange().getValues();
      for (var uu = 1; uu < rowsu.length; uu++) {
        if (String(rowsu[uu][0]) === upSlug) {
          var cur;
          try { cur = JSON.parse(rowsu[uu][2] || '{}'); } catch (pe2) { cur = {}; }
          if (p.namaTamu !== undefined) cur.namaTamu = p.namaTamu;
          var unote = (p.namaTamu !== undefined) ? String(p.namaTamu || '').slice(0, 120) : rowsu[uu][3];
          shu.getRange(uu + 1, 1, 1, 4).setValues([[upSlug, new Date().toISOString(), JSON.stringify(cur), unote]]);
          return json_({ ok: true, slug: upSlug, updated: true });
        }
      }
      return json_({ ok: false, error: 'undangan tidak ditemukan' });
    }

    // LIST semua undangan (ringkas): ?action=list&token=xxx
    if (String(p.action || '') === 'list') {
      if (!checkToken_(p.token)) return json_({ ok: false, error: 'token salah / tidak ada' });
      var shl = getSheet_();
      var rowsl = shl.getDataRange().getValues();
      var items = [];
      for (var li = 1; li < rowsl.length; li++) {
        var ls = String(rowsl[li][0] || '');
        if (!ls) continue;
        var lname = String(rowsl[li][3] || '');
        if (!lname) {
          try { lname = JSON.parse(rowsl[li][2] || '{}').namaTamu || ''; } catch (pe3) {}
        }
        items.push({ slug: ls, nama: lname || ls, updatedAt: rowsl[li][1] });
      }
      return json_({ ok: true, count: items.length, items: items });
    }

    var slug = String(p.slug || '').trim();
    if (!slug) return json_({ ok: false, error: 'parameter ?slug= kosong' });
    var sh = getSheet_();
    var rows = sh.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
      if (String(rows[i][0]) === slug) {
        var data;
        try { data = JSON.parse(rows[i][2] || '{}'); }
        catch (parseErr) { data = {}; }
        return json_({ ok: true, slug: slug, data: data });
      }
    }
    return json_({ ok: false, error: 'undangan tidak ditemukan' });
  } catch (err) {
    return json_({ ok: false, error: String((err && err.message) || err) });
  }
}

// ---------- tes cepat: jalankan manual dari editor ----------
function testSetup() {
  var p = getProps_();
  Logger.log(p.getProperty('SHEET_ID') ? 'SHEET_ID ok' : 'SHEET_ID KOSONG');
  Logger.log(p.getProperty('ADMIN_PIN') ? 'ADMIN_PIN ok' : 'ADMIN_PIN kosong (endpoint settings nonaktif)');
  Logger.log(p.getProperty('TOKEN') ? 'TOKEN ok (frontend wajib kirim token)' : 'TOKEN kosong (cek sheet settings)');
  Logger.log(p.getProperty('DRIVE_FOLDER_ID') ? 'DRIVE_FOLDER_ID ok' : 'DRIVE_FOLDER_ID kosong (pakai root Drive)');
  var sh = getSheet_();
  Logger.log('Sheet "' + SHEET_NAME + '" ok, baris: ' + sh.getLastRow());
  var shs = getSettingsSheet_();
  Logger.log('Sheet "' + SETTINGS_SHEET_NAME + '" ok, baris: ' + shs.getLastRow());
}
