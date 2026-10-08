/* StudentOS Vault v2 – multi-algorithm password hashing (Web Crypto only, no libraries)
   Record format:  sos2$<algorithm>$<rounds>$<pepper 0|1>$<salt>$<hash>   */
const Vault = (() => {
  const enc = new TextEncoder();
  const b64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
  const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  const norm = p => enc.encode(String(p).normalize('NFKC'));
  const sha = (name, data) => crypto.subtle.digest(name, data).then(b => new Uint8Array(b));
  const concat = (a, b) => { const o = new Uint8Array(a.length + b.length); o.set(a); o.set(b, a.length); return o; };

  async function pbkdf2(pw, salt, hash, rounds, bits) {
    const k = await crypto.subtle.importKey('raw', norm(pw), 'PBKDF2', false, ['deriveBits']);
    return new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash, salt, iterations: rounds }, k, bits));
  }
  async function hmac(keyBytes, data, hash = 'SHA-256') {
    const k = await crypto.subtle.importKey('raw', keyBytes, { name: 'HMAC', hash }, false, ['sign']);
    return new Uint8Array(await crypto.subtle.sign('HMAC', k, data));
  }

  /* ---------------- algorithm registry ---------------- */
  const ALGS = {
    pbkdf2_sha256: { label: 'PBKDF2-SHA256', rounds: 600000, note: 'OWASP-recommended baseline',
      run: (pw, s, r) => pbkdf2(pw, s, 'SHA-256', r, 256) },
    pbkdf2_sha384: { label: 'PBKDF2-SHA384', rounds: 300000, note: 'Wider internal state than SHA-256',
      run: (pw, s, r) => pbkdf2(pw, s, 'SHA-384', r, 384) },
    pbkdf2_sha512: { label: 'PBKDF2-SHA512', rounds: 210000, note: 'Strongest PBKDF2 variant here',
      run: (pw, s, r) => pbkdf2(pw, s, 'SHA-512', r, 512) },
    cascade: { label: 'Cascade (PBKDF2-512 → HMAC-256 → SHA-384 chain)', rounds: 30000, note: 'Three different primitives in series',
      run: async (pw, s, r) => {
        let h = await pbkdf2(pw, s, 'SHA-512', 150000, 512);   // 1. stretch
        h = await hmac(s, h, 'SHA-256');                       // 2. bind to salt with a MAC
        for (let i = 0; i < r; i++) h = await sha('SHA-384', concat(h, s)); // 3. sequential chain
        return h;
      } },
    chain_sha512: { label: 'Salted SHA-512 chain', rounds: 50000, note: 'Simple and slow-ish, but weaker than PBKDF2 (demo of the idea)',
      run: async (pw, s, r) => {
        let h = concat(s, norm(pw));
        for (let i = 0; i < r; i++) h = await sha('SHA-512', concat(h, s));
        return h;
      } }
  };
  const DEFAULT_ALG = 'pbkdf2_sha256';

  /* ---------------- device pepper (non-extractable key in IndexedDB) ---------------- */
  const openDB = () => new Promise((res, rej) => {
    const r = indexedDB.open('studentos_vault', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('k');
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
  async function deviceKey() {
    try {
      const db = await openDB();
      const found = await new Promise(res => { const q = db.transaction('k').objectStore('k').get('device'); q.onsuccess = () => res(q.result); q.onerror = () => res(null); });
      if (found) return found;
      const key = await crypto.subtle.generateKey({ name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
      await new Promise((res, rej) => { const t = db.transaction('k', 'readwrite'); t.objectStore('k').put(key, 'device'); t.oncomplete = res; t.onerror = () => rej(t.error); });
      return key;
    } catch { return null; }
  }
  async function derive(alg, pw, salt, rounds, pepper) {
    let out = await ALGS[alg].run(pw, salt, rounds);
    if (pepper) {
      const k = await deviceKey();
      if (!k) throw new Error('PEPPER_MISSING');
      out = new Uint8Array(await crypto.subtle.sign('HMAC', k, out));
    }
    return out;
  }

  function constantTimeEqual(a, b) {
    const x = typeof a === 'string' ? enc.encode(a) : a, y = typeof b === 'string' ? enc.encode(b) : b;
    let d = x.length ^ y.length;
    for (let i = 0; i < Math.max(x.length, y.length); i++) d |= (x[i] || 0) ^ (y[i] || 0);
    return d === 0;
  }

  async function hash(password, alg = DEFAULT_ALG) {
    if (!ALGS[alg]) throw new Error('Unknown algorithm: ' + alg);
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const pepper = (await deviceKey()) ? 1 : 0;
    const rounds = ALGS[alg].rounds;
    const out = await derive(alg, password, salt, rounds, pepper);
    return ['sos2', alg, rounds, pepper, b64(salt), b64(out)].join('$');
  }

  function parse(record) {
    const p = String(record).split('$');
    if (p[0] === 'sos2' && p.length === 6) return { alg: p[1], rounds: +p[2], pepper: p[3] === '1', salt: p[4], hash: p[5] };
    if (p[0] === 'sos1' && p.length === 5) return { alg: 'pbkdf2_sha256', rounds: +p[1], pepper: p[2] === '1', salt: p[3], hash: p[4] }; // older format
    return null;
  }

  async function verify(password, record) {
    try {
      const r = parse(record);
      if (!r || !ALGS[r.alg]) return false;
      const out = await derive(r.alg, password, unb64(r.salt), r.rounds, r.pepper);
      return constantTimeEqual(out, unb64(r.hash));
    } catch { return false; }
  }

  const needsUpgrade = (record, alg = DEFAULT_ALG) => {
    const r = parse(record);
    return !r || r.alg !== alg || r.rounds < ALGS[alg].rounds;
  };
  const algorithmOf = record => { const r = parse(record); return r ? ALGS[r.alg]?.label || r.alg : 'unknown'; };

  /* ---------------- login back-off ---------------- */
  const LK = 'studentos_lockouts', id = e => String(e).trim().toLowerCase();
  const readLK = () => { try { return JSON.parse(localStorage.getItem(LK)) || {}; } catch { return {}; } };
  function lockedFor(email) { const r = readLK()[id(email)]; return r && r.until > Date.now() ? Math.ceil((r.until - Date.now()) / 1000) : 0; }
  function fail(email) { const o = readLK(), k = id(email), r = o[k] || { n: 0, until: 0 }; r.n++; if (r.n > 3) r.until = Date.now() + Math.min(300, 2 ** (r.n - 3)) * 1000; o[k] = r; localStorage.setItem(LK, JSON.stringify(o)); }
  function succeed(email) { const o = readLK(); delete o[id(email)]; localStorage.setItem(LK, JSON.stringify(o)); }

  /* ---------------- strength estimate ---------------- */
  const COMMON = ['password','123456','qwerty','letmein','welcome','admin','iloveyou','student','college','abc123','12345678','111111'];
  function strength(p) {
    if (!p) return { score: 0, label: '', tip: '' };
    let pool = 0;
    if (/[a-z]/.test(p)) pool += 26; if (/[A-Z]/.test(p)) pool += 26; if (/\d/.test(p)) pool += 10; if (/[^A-Za-z0-9]/.test(p)) pool += 33;
    let bits = p.length * Math.log2(pool || 1);
    if (COMMON.some(w => p.toLowerCase().includes(w))) bits = Math.min(bits, 20);
    if (/(0123|1234|2345|3456|abcd|qwer)/i.test(p)) bits *= 0.6;
    bits = Math.max(0, bits - (p.length - new Set(p).size) * 1.5);
    const label = bits < 28 ? 'Very weak' : bits < 45 ? 'Weak' : bits < 60 ? 'Fair' : bits < 75 ? 'Strong' : 'Very strong';
    return { score: Math.min(1, bits / 80), bits: Math.round(bits), label, tip: p.length < 10 ? 'Use at least 10 characters.' : bits < 45 ? 'Add more words or characters.' : 'Good.', ok: p.length >= 10 && bits >= 45 };
  }

  return { ALGS, DEFAULT_ALG, hash, verify, needsUpgrade, algorithmOf, constantTimeEqual, lockedFor, fail, succeed, strength };
})();
