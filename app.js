
(() => {
  'use strict';

  const questions = window.KSM_QUESTIONS || [];
  const yearMeta = window.KSM_YEAR_META || {};
  const sources = window.KSM_SOURCES || [];

  const categoryIcons = {
    'Energi':'⚡','Suhu & Panas':'🌡️','Cahaya':'🔎','Gaya':'🧲','Materi':'🧪','Ekologi':'🌿','Biologi':'🫀',
    'Tata Surya':'🌙','Bumi':'🌍','Kelistrikan':'🔌','Kemagnetan':'🧲','Metode Ilmiah':'🔬','Kesehatan':'🩺',
    'Teknologi':'💡','Air':'💧','Lingkungan':'♻️','Budaya & Sains':'🏠','Budaya & Materi':'🧺',
    'Budaya & Energi':'🌊','Budaya & Ekologi':'🌾','Budaya & Lingkungan':'🌳','Energi Surya':'☀️',
    'Perubahan Wujud':'💨','Klasifikasi Hewan':'🐄','Ekosistem':'🕸️','Organ Tubuh':'🫁','Daur Air':'🌧️',
    'Tanah':'🌱','Cuaca':'☁️','Sosial':'🤝','Peta':'🗺️','Sumber Daya Alam':'💧','Islam & Sains':'🌙',
    'Islam & Air':'💧','Islam & Kesehatan':'🥗','Islam & Lingkungan':'🌿','Islam & Sosial':'🤲',
    'Budaya Lokal':'🏡','Pertanian':'🌾','Teknologi Tepat Guna':'⚙️','Kebencanaan':'🌊','Data & Sains':'📊',
    'Peta & Sosial':'🗺️','Sejarah':'🏛️','Ekoteologi':'🌱','Islam & Cuaca':'🌬️','Teknologi Digital':'📡',
    'Data':'📈','Sirkulasi':'❤️','Gaya & Energi':'🚚','Sosial Ekonomi':'🛒','Air & Islam':'🚰',
    'Teknologi & Lingkungan':'🛰️','Eksperimen':'🧫','Integrasi Besar':'🎯'
  };

  const navItems = [
    ['dashboard','⌂','Beranda'],
    ['bank','▤','Bank Soal'],
    ['tryout','◉','Tryout 25'],
    ['prediksi','✦','Prediksi 2026'],
    ['materi','◇','Peta Materi'],
    ['sources','↗','Sumber']
  ];

  const state = {
    page: 'dashboard',
    selectedYear: 2026,
    query: '',
    category: 'Semua',
    difficulty: 'Semua',
    revealed: {},
    bankAnswers: readStorage('ksm-bank-answers', {}),
    tryout: {
      year: 2026,
      started: false,
      index: 0,
      answers: {},
      submitted: false,
      seconds: 45 * 60,
      timerId: null
    }
  };

  const app = document.getElementById('app');

  function esc(value) {
    return String(value ?? '')
      .replaceAll('&','&amp;')
      .replaceAll('<','&lt;')
      .replaceAll('>','&gt;')
      .replaceAll('"','&quot;')
      .replaceAll("'","&#039;");
  }

  function readStorage(key, fallback) {
    try {
      const v = JSON.parse(localStorage.getItem(key));
      return v || fallback;
    } catch (_) {
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {}
  }

  function formatTime(s) {
    const m = Math.floor(s / 60);
    const ss = s % 60;
    return String(m).padStart(2,'0') + ':' + String(ss).padStart(2,'0');
  }

  function broadGroup(c) {
    if (/Ekoteologi|Lingkungan|Bumi|Air|Ekologi/.test(c)) return 'Lingkungan';
    if (/Kesehatan|Sirkulasi|Biologi/.test(c)) return 'Biologi';
    if (/Gaya|Energi|Cahaya|Materi|Wujud/.test(c)) return 'Fisika';
    if (/Data|Metode|Eksperimen/.test(c)) return 'Data & eksperimen';
    if (/Teknologi/.test(c)) return 'Teknologi';
    return 'Sosial & integrasi';
  }

  function countGroups(arr, fn) {
    return arr.reduce((acc, item) => {
      const k = fn(item);
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});
  }

  function materialItems(group) {
    const data = {
      'Energi & Fisika':['gaya & gerak','energi dan perubahannya','panas & suhu','cahaya','listrik & magnet','materi & perubahan wujud'],
      'Makhluk Hidup':['klasifikasi organisme','organ & fisiologi manusia','sirkulasi & pernapasan','gizi & kesehatan','adaptasi & reproduksi','rantai makanan'],
      'Lingkungan & Bumi':['ekologi','sumber daya alam','air & daur air','tanah & erosi','cuaca','Bumi, tata surya & antariksa'],
      'Metode & Data':['variabel eksperimen','kontrol & perlakuan','membaca tabel/grafik','hubungan sebab-akibat','kesimpulan dari bukti','evaluasi solusi'],
      'Sosial & Budaya':['peta & simbol','produksi-distribusi-konsumsi','kearifan lokal','teknologi tepat guna','sejarah & masyarakat','mitigasi bencana'],
      'Integrasi Keislaman':['air & wudhu','puasa & kesehatan','rukyatul hilal','amanah lingkungan','hemat energi','nilai kepedulian & sosial']
    };
    return data[group] || [];
  }

  function groupIcon(group) {
    return ({
      'Energi & Fisika':'⚡','Makhluk Hidup':'🫀','Lingkungan & Bumi':'🌍',
      'Metode & Data':'📊','Sosial & Budaya':'🏡','Integrasi Keislaman':'☾'
    })[group] || '🔬';
  }

  function shell(content) {
    const nav = navItems.map(([id, icon, label]) => `
      <button class="nav-btn ${state.page === id ? 'active' : ''}" data-nav="${id}">
        ${icon}<span>${label}</span>
      </button>`).join('');

    return `
      <header class="topbar">
        <div class="brand" data-nav="dashboard" role="button" tabindex="0">
          <div class="brand-mark">MI</div>
          <div><strong>KSM/OMI Smart Prep</strong><span>IPAS Terintegrasi • Kabupaten/Kota</span></div>
        </div>
        <div class="top-actions">
          <span class="static-badge">HTML + JavaScript murni</span>
          <span class="live-pill"><i></i> Edisi 2026</span>
          <button class="ghost-btn" data-action="reset-progress">Reset progres</button>
        </div>
      </header>
      <div class="layout">
        <aside class="sidebar">
          <nav>${nav}</nav>
          <div class="sidebar-note">
            <b>Catatan integritas</b>
            <p>Bank 2024–2025 adalah rekonstruksi latihan dari pola/kisi-kisi publik, bukan salinan naskah resmi. Prediksi 2026 bukan bocoran.</p>
          </div>
        </aside>
        <main class="content">
          ${content}
          <div class="footer-static">Static site • tanpa Node.js • tanpa npm • siap GitHub Pages</div>
        </main>
      </div>`;
  }

  function render() {
    stopTryoutTimer();

    let content = '';
    switch (state.page) {
      case 'bank': content = renderBank(); break;
      case 'tryout': content = renderTryout(); break;
      case 'prediksi': content = renderPrediction(); break;
      case 'materi': content = renderMateri(); break;
      case 'sources': content = renderSources(); break;
      default: content = renderDashboard();
    }

    app.innerHTML = shell(content);
    bindControls();

    if (state.page === 'tryout' && state.tryout.started && !state.tryout.submitted) {
      startTryoutTimer();
    }
  }

  function renderDashboard() {
    return `
      <section class="hero-panel">
        <div class="hero-copy">
          <span class="kicker">PUSAT LATIHAN IPAS MI/SD</span>
          <h1>Belajar pola KSM 2024, OMI 2025, dan bersiap untuk OMI 2026.</h1>
          <p>75 soal latihan orisinal dengan pembahasan, tryout 25 soal, analisis topik, dan prediksi fokus 2026.</p>
          <div class="hero-actions">
            <button class="primary-btn" data-action="start-2026">Mulai Tryout 2026</button>
            <button class="secondary-btn" data-nav="bank">Jelajahi bank soal</button>
          </div>
        </div>
        <div class="hero-visual" aria-hidden="true">
          <div class="orbit orbit-a"></div><div class="orbit orbit-b"></div>
          <div class="planet">🌍</div><div class="atom">⚛</div><div class="leaf">🌿</div><div class="moon">☾</div>
        </div>
      </section>

      <section class="stat-grid">
        ${statCard('25','Soal per paket','format latihan Kabupaten/Kota')}
        ${statCard('75','Total soal latihan','2024 • 2025 • 2026')}
        ${statCard('6+','Kelompok materi','sains, IPAS, Islam, budaya')}
        ${statCard('100%','Ada pembahasan','setelah menjawab')}
      </section>

      <section class="section-head"><div><span class="eyebrow">TIMELINE</span><h2>Apa yang berubah?</h2></div></section>
      <section class="timeline-grid">
        ${yearCard(2024,'KSM 2024','KSM','Jenjang MI memakai IPAS Terintegrasi. Paket latihan mengikuti format 25 pilihan ganda dan karakter integrasi sains, keislaman, serta budaya.')}
        ${yearCard(2025,'OMI 2025','TRANSISI','KSM bertransformasi menjadi Olimpiade Madrasah Indonesia (OMI). Untuk MI/SD, bidang sains mencakup Matematika dan IPAS.')}
        ${yearCard(2026,'OMI 2026','PREDIKSI','Latihan menonjolkan integrasi Islam, sains, ekoteologi, teknologi, kearifan lokal, lingkungan, dan analisis stimulus/data.')}
      </section>

      <section class="notice">
        <div class="notice-icon">✓</div>
        <div>
          <b>Metodologi transparan</b>
          <p>Arsip soal asli lengkap 2024–2025 tidak tersedia secara konsisten dari sumber resmi terbuka pada proyek awal. Karena itu aplikasi tidak mengklaim menyalin soal resmi; bank latihan direkonstruksi secara orisinal dari pola, kisi-kisi, dan karakter kompetisi.</p>
        </div>
      </section>

      <section class="offline-card">
        <b>Siap dipasang di GitHub Pages tanpa instalasi apa pun.</b>
        <p>Cukup unggah <code>index.html</code>, <code>styles.css</code>, <code>data.js</code>, dan <code>app.js</code> ke repository. Browser akan menjalankan semuanya secara langsung.</p>
      </section>`;
  }

  function statCard(n,label,note) {
    return `<div class="stat-card"><b>${n}</b><span>${label}</span><small>${note}</small></div>`;
  }

  function yearCard(year,title,badge,text) {
    const action = year === 2026 ? 'prediction-year' : 'bank-year';
    return `<article class="year-card">
      <div class="year-top"><span>${year}</span><em>${badge}</em></div>
      <h3>${title}</h3><p>${text}</p>
      <button data-action="${action}" data-year="${year}">${year === 2026 ? 'Lihat prediksi' : 'Buka paket'} →</button>
    </article>`;
  }

  function renderBank() {
    const year = state.selectedYear;
    const meta = yearMeta[year] || {label:String(year), note:''};
    const yearQs = questions.filter(q => q.year === year);
    const categories = ['Semua', ...new Set(yearQs.map(q => q.category))];
    const qneedle = state.query.trim().toLowerCase();

    const filtered = yearQs.filter(q => {
      const hay = (q.question + ' ' + q.category + ' ' + q.integration).toLowerCase();
      return (state.category === 'Semua' || q.category === state.category)
        && (state.difficulty === 'Semua' || q.difficulty === state.difficulty)
        && hay.includes(qneedle);
    });

    const answeredKeys = Object.keys(state.bankAnswers).filter(k => k.startsWith(year + '-'));
    const answeredCount = answeredKeys.length;
    const correctCount = answeredKeys.filter(k => state.bankAnswers[k]?.correct).length;

    const cards = filtered.map(q => {
      const key = `${q.year}-${q.no}`;
      const answered = state.bankAnswers[key];
      const show = !!state.revealed[key] || !!answered;

      const opts = q.options.map((opt,i) => {
        let cls = 'option-btn';
        if (answered) {
          if (i === q.answer) cls += ' correct';
          else if (i === answered.choice) cls += ' wrong';
        }
        return `<button class="${cls}" data-action="bank-answer" data-year="${q.year}" data-no="${q.no}" data-choice="${i}" ${answered ? 'disabled' : ''}>
          <b>${String.fromCharCode(65+i)}</b><span>${esc(opt)}</span>
        </button>`;
      }).join('');

      return `<article class="question-card">
        <div class="q-head">
          <div class="q-number">${String(q.no).padStart(2,'0')}</div>
          <div class="q-tags">
            <span>${categoryIcons[q.category] || '🔬'} ${esc(q.category)}</span>
            <span>${esc(q.integration)}</span>
            <span class="diff ${q.difficulty.toLowerCase()}">${esc(q.difficulty)}</span>
          </div>
        </div>
        <h3>${esc(q.question)}</h3>
        <div class="options-grid">${opts}</div>
        <div class="q-actions">
          <button data-action="toggle-explanation" data-key="${key}">${show ? 'Sembunyikan pembahasan' : 'Lihat pembahasan'}</button>
          ${answered ? `<span class="${answered.correct ? 'result-good' : 'result-bad'}">${answered.correct ? '✓ Benar' : '× Belum tepat'}</span>` : ''}
        </div>
        ${show ? `<div class="explanation"><b>Pembahasan</b><p>${esc(q.explanation)}</p><div class="answer-key">Jawaban: <strong>${String.fromCharCode(65+q.answer)}. ${esc(q.options[q.answer])}</strong></div></div>` : ''}
      </article>`;
    }).join('');

    return `
      <section class="page-title">
        <div><span class="eyebrow">BANK SOAL</span><h1>${esc(meta.label)}</h1><p>${esc(meta.note)}</p></div>
        <div class="progress-mini"><strong>${answeredCount}/25</strong><span>dikerjakan</span><small>${answeredCount ? Math.round(correctCount/answeredCount*100) : 0}% benar</small></div>
      </section>

      <div class="year-switch">
        ${[2024,2025,2026].map(y => `<button class="${year===y?'active':''}" data-action="switch-bank-year" data-year="${y}">${esc(yearMeta[y]?.label || y)}</button>`).join('')}
      </div>

      <section class="filterbar">
        <input id="bankSearch" aria-label="Cari soal" value="${esc(state.query)}" placeholder="Cari topik atau kata kunci...">
        <select id="categoryFilter">${categories.map(c=>`<option ${c===state.category?'selected':''}>${esc(c)}</option>`).join('')}</select>
        <select id="difficultyFilter">
          ${['Semua','Mudah','Sedang','Sulit'].map(d=>`<option ${d===state.difficulty?'selected':''}>${d}</option>`).join('')}
        </select>
        <span>${filtered.length} soal</span>
      </section>

      <div class="bank-summary">
        <span>${answeredCount} sudah dijawab</span>
        <span>${correctCount} benar</span>
        <span>${answeredCount-correctCount} perlu diulang</span>
      </div>

      <div class="question-list">
        ${cards || `<div class="empty-state"><b>Tidak ada soal yang cocok.</b><p>Coba ubah pencarian atau filter.</p></div>`}
      </div>`;
  }

  function renderTryout() {
    const t = state.tryout;
    const set = questions.filter(q => q.year === t.year).sort((a,b)=>a.no-b.no);

    if (!t.started) {
      return `
        <section class="page-title"><div><span class="eyebrow">TRYOUT INTERAKTIF</span><h1>Simulasi 25 soal</h1><p>Mode pembinaan dengan waktu 45 menit. Jawaban tidak ditampilkan sampai tryout selesai.</p></div></section>
        <div class="tryout-setup">
          ${[2024,2025,2026].map(y=>`
            <button class="setup-card ${t.year===y?'active':''}" data-action="choose-tryout-year" data-year="${y}">
              <span>${y}</span><b>${esc(yearMeta[y]?.label || y)}</b><small>25 soal • 45 menit</small>
            </button>`).join('')}
          <button class="primary-btn big" data-action="start-tryout">Mulai tryout ${t.year} →</button>
        </div>
        <div class="exam-intro"><b>Tips:</b> kerjakan yang mudah dulu. Gunakan panel nomor untuk melompat soal. Progres tersimpan selama halaman tidak direfresh.</div>`;
    }

    const score = Object.entries(t.answers).filter(([no,v]) => set.find(q=>q.no===Number(no))?.answer === v).length;

    if (t.submitted) {
      return renderResult(t.year,set,t.answers,score);
    }

    const q = set[t.index];
    if (!q) return `<div class="empty-state">Paket soal tidak ditemukan.</div>`;

    return `
      <section class="exam-top">
        <div><span>TRYOUT ${t.year}</span><b>Soal ${t.index+1} dari ${set.length}</b></div>
        <div id="timerText" class="timer ${t.seconds<300?'danger':''}">⏱ ${formatTime(t.seconds)}</div>
        <button class="danger-link" data-action="submit-tryout">Akhiri</button>
      </section>

      <div class="exam-layout">
        <article class="exam-question">
          <div class="q-tags"><span>${categoryIcons[q.category] || '🔬'} ${esc(q.category)}</span><span>${esc(q.difficulty)}</span></div>
          <h2>${esc(q.question)}</h2>
          <div class="exam-options">
            ${q.options.map((o,i)=>`
              <button class="${t.answers[q.no]===i?'selected':''}" data-action="tryout-answer" data-no="${q.no}" data-choice="${i}">
                <b>${String.fromCharCode(65+i)}</b><span>${esc(o)}</span>
              </button>`).join('')}
          </div>
          <div class="exam-nav">
            <button ${t.index===0?'disabled':''} data-action="tryout-prev">← Sebelumnya</button>
            ${t.index<set.length-1
              ? `<button class="primary-btn" data-action="tryout-next">Berikutnya →</button>`
              : `<button class="primary-btn" data-action="submit-tryout">Selesai & nilai</button>`}
          </div>
        </article>

        <aside class="palette">
          <b>Navigasi soal</b>
          <div class="palette-grid">
            ${set.map((x,i)=>`<button class="${i===t.index?'current ':''}${t.answers[x.no]!==undefined?'answered':''}" data-action="goto-question" data-index="${i}">${x.no}</button>`).join('')}
          </div>
          <small>${Object.keys(t.answers).length} terjawab • ${set.length-Object.keys(t.answers).length} kosong</small>
        </aside>
      </div>`;
  }

  function renderResult(year,set,answers,score) {
    const pct = Math.round(score / set.length * 100);
    const headline = pct >= 80 ? 'Mumtaz! Pertahankan.' : pct >= 60 ? 'Bagus, tinggal perkuat beberapa topik.' : 'Fondasi sudah ada — lanjutkan latihan terarah.';

    const review = set.map(q => {
      const a = answers[q.no];
      const ok = a === q.answer;
      return `<article class="review-card">
        <div class="review-badge ${ok?'good':'bad'}">${ok?'✓':'×'}</div>
        <div>
          <b>Soal ${q.no} • ${esc(q.category)}</b>
          <p>${esc(q.question)}</p>
          <small>Jawabanmu: ${a===undefined?'Tidak dijawab':String.fromCharCode(65+a)+'. '+esc(q.options[a])}</small>
          <div class="review-answer">Kunci: ${String.fromCharCode(65+q.answer)}. ${esc(q.options[q.answer])}</div>
          <p class="review-exp">${esc(q.explanation)}</p>
        </div>
      </article>`;
    }).join('');

    return `
      <section class="result-hero">
        <div class="score-ring" style="--score:${pct}"><div><b>${score}</b><span>/${set.length}</span></div></div>
        <div><span class="eyebrow">HASIL TRYOUT ${year}</span><h1>${headline}</h1>
          <p>Skor latihan: <b>${pct}%</b>. Tinjau pembahasan untuk menemukan topik yang perlu diulang.</p>
          <div class="result-actions">
            <button class="primary-btn" data-action="reset-tryout">Ulangi tryout</button>
            <button class="secondary-btn" data-action="result-to-bank" data-year="${year}">Latihan per soal</button>
          </div>
        </div>
      </section>
      <div class="review-list">${review}</div>`;
  }

  function renderPrediction() {
    const pred = questions.filter(q=>q.year===2026);
    const cats = countGroups(pred, q=>broadGroup(q.category));

    return `
      <section class="prediction-hero">
        <span class="eyebrow">PREDIKSI 2026 • BUKAN BOCORAN</span>
        <h1>Fokus pada analisis, ekoteologi, data, dan penerapan IPAS.</h1>
        <p>Model prediksi adalah latihan orisinal. Arah latihan memadukan Islam, teknologi, budaya lokal, kepedulian lingkungan, dan keterampilan proses sains.</p>
        <button class="primary-btn" data-action="open-2026-bank">Buka 25 soal prediksi</button>
      </section>

      <section class="section-head"><div><span class="eyebrow">FOKUS LATIHAN</span><h2>Peta prioritas 2026</h2></div></section>
      <div class="focus-grid">
        ${focus('🌱','Ekoteologi & lingkungan','Sampah, air, vegetasi, konservasi, perubahan lingkungan, dan solusi berkelanjutan.')}
        ${focus('📊','Data & metode ilmiah','Membaca tabel, tren, variabel eksperimen, dan kesimpulan yang tidak berlebihan.')}
        ${focus('⚡','Fisika kontekstual','Energi, gaya, panas, cahaya, perubahan wujud, dan kelistrikan dalam kehidupan nyata.')}
        ${focus('🫀','Makhluk hidup & kesehatan','Organ, sirkulasi, ekologi, adaptasi, gizi, dan keterkaitan antar-sistem.')}
        ${focus('🛰️','Teknologi terapan','Sensor, energi surya, pemantauan lingkungan, teknologi tepat guna, dan digitalisasi.')}
        ${focus('🏡','Budaya & sosial','Kearifan lokal, peta, sejarah, ekonomi sederhana, dan budaya sebagai konteks sains.')}
      </div>

      <section class="chart-card">
        <div><span class="eyebrow">DISTRIBUSI MODEL PREDIKSI</span><h3>Komposisi 25 soal latihan</h3><p>Ini adalah komposisi desain latihan, bukan persentase resmi panitia.</p></div>
        <div class="bars">
          ${Object.entries(cats).map(([k,v])=>`<div class="bar-row"><span>${esc(k)}</span><div><i style="width:${v/25*100}%"></i></div><b>${v}</b></div>`).join('')}
        </div>
      </section>

      <div class="warning-card"><b>Kenapa tidak disebut “soal asli 2026”?</b><p>Prediksi yang bertanggung jawab membantu memahami kompetensi dan pola soal, bukan mengklaim memperoleh naskah kompetisi.</p></div>`;
  }

  function focus(icon,title,text) {
    return `<article class="focus-card"><div>${icon}</div><h3>${title}</h3><p>${text}</p></article>`;
  }

  function renderMateri() {
    const groups = ['Energi & Fisika','Makhluk Hidup','Lingkungan & Bumi','Metode & Data','Sosial & Budaya','Integrasi Keislaman'];
    return `
      <section class="page-title"><div><span class="eyebrow">PETA MATERI</span><h1>Belajar berdasarkan konsep, bukan hafalan jawaban.</h1><p>Gunakan peta ini sebagai checklist pembinaan sebelum tryout.</p></div></section>
      <div class="material-grid">
        ${groups.map(g=>`<article class="material-card"><div class="material-icon">${groupIcon(g)}</div><h3>${g}</h3><ul>${materialItems(g).map(x=>`<li>${esc(x)}</li>`).join('')}</ul></article>`).join('')}
      </div>
      <div class="study-plan">
        <div><b>Rencana belajar 7 hari</b><p>Hari 1–4: kuasai konsep per kelompok. Hari 5: latihan data dan integrasi. Hari 6: tryout 25 soal. Hari 7: tinjau salah, ulang topik lemah, lalu tryout kedua.</p></div>
        <div class="study-days">${['Konsep','Biologi','Bumi','Data','Integrasi','Tryout','Review'].map((x,i)=>`<span><b>H${i+1}</b>${x}</span>`).join('')}</div>
      </div>`;
  }

  function renderSources() {
    const cards = sources.map((s,i)=>`
      <a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer" class="source-card">
        <span>${String(i+1).padStart(2,'0')}</span>
        <div><b>${esc(s.name)}</b><small>${esc(s.type)}</small></div>
        <em>↗</em>
      </a>`).join('');

    return `
      <section class="page-title"><div><span class="eyebrow">SUMBER & METODOLOGI</span><h1>Apa yang benar-benar didukung sumber?</h1><p>Aplikasi membedakan informasi resmi, ringkasan Juknis, dan bahan latihan publik.</p></div></section>
      <div class="source-note">
        <b>Temuan utama dari riset proyek sebelumnya</b>
        <ul>
          <li>2024: kategori MI memakai IPAS Terintegrasi dan paket Kabupaten/Kota berbentuk pilihan ganda.</li>
          <li>2025: ajang bertransformasi menjadi OMI; MI/SD tetap memiliki Matematika dan IPAS.</li>
          <li>2026: latihan diarahkan pada integrasi sains, Islam, teknologi, budaya, lingkungan/ekoteologi, dan pemecahan masalah.</li>
        </ul>
      </div>
      <div class="sources-grid">${cards}</div>
      <div class="warning-card"><b>Hak cipta & keaslian</b><p>Bank 2024–2025 adalah soal latihan orisinal yang merekonstruksi pola kompetensi. Prediksi 2026 bukan soal resmi dan bukan bocoran.</p></div>`;
  }

  function bindControls() {
    app.querySelectorAll('[data-nav]').forEach(el => {
      el.addEventListener('click', () => {
        const page = el.dataset.nav;
        if (page) {
          state.page = page;
          render();
          window.scrollTo({top:0,behavior:'smooth'});
        }
      });
      el.addEventListener('keydown', e => {
        if ((e.key === 'Enter' || e.key === ' ') && el.dataset.nav) {
          e.preventDefault();
          state.page = el.dataset.nav;
          render();
        }
      });
    });

    app.querySelectorAll('[data-action]').forEach(el => {
      el.addEventListener('click', () => handleAction(el));
    });

    const search = document.getElementById('bankSearch');
    if (search) {
      search.addEventListener('input', e => {
        state.query = e.target.value;
        const pos = e.target.selectionStart;
        render();
        const s2 = document.getElementById('bankSearch');
        if (s2) { s2.focus(); try{s2.setSelectionRange(pos,pos)}catch(_){} }
      });
    }

    const cat = document.getElementById('categoryFilter');
    if (cat) cat.addEventListener('change', e => {state.category=e.target.value;render();});

    const diff = document.getElementById('difficultyFilter');
    if (diff) diff.addEventListener('change', e => {state.difficulty=e.target.value;render();});
  }

  function handleAction(el) {
    const action = el.dataset.action;

    if (action === 'reset-progress') {
      if (confirm('Reset seluruh progres bank soal?')) {
        state.bankAnswers = {};
        state.revealed = {};
        writeStorage('ksm-bank-answers', state.bankAnswers);
        render();
      }
      return;
    }

    if (action === 'start-2026') {
      state.tryout.year = 2026;
      resetTryout(false);
      state.page = 'tryout';
      state.tryout.started = true;
      render();
      return;
    }

    if (action === 'bank-year') {
      state.selectedYear = Number(el.dataset.year);
      state.page = 'bank';
      resetBankFilters();
      render();
      return;
    }

    if (action === 'prediction-year') {
      state.page = 'prediksi';
      render();
      return;
    }

    if (action === 'switch-bank-year') {
      state.selectedYear = Number(el.dataset.year);
      resetBankFilters();
      render();
      return;
    }

    if (action === 'bank-answer') {
      const year = Number(el.dataset.year);
      const no = Number(el.dataset.no);
      const choice = Number(el.dataset.choice);
      const q = questions.find(x=>x.year===year && x.no===no);
      if (!q) return;
      const key = `${year}-${no}`;
      if (state.bankAnswers[key]) return;
      state.bankAnswers[key] = {choice, correct: choice === q.answer};
      state.revealed[key] = true;
      writeStorage('ksm-bank-answers', state.bankAnswers);
      render();
      return;
    }

    if (action === 'toggle-explanation') {
      const key = el.dataset.key;
      state.revealed[key] = !state.revealed[key];
      render();
      return;
    }

    if (action === 'choose-tryout-year') {
      const year = Number(el.dataset.year);
      state.tryout.year = year;
      state.tryout.index = 0;
      state.tryout.answers = {};
      state.tryout.seconds = 45*60;
      render();
      return;
    }

    if (action === 'start-tryout') {
      resetTryout(false);
      state.tryout.started = true;
      render();
      return;
    }

    if (action === 'tryout-answer') {
      const no = Number(el.dataset.no);
      const choice = Number(el.dataset.choice);
      state.tryout.answers[no] = choice;
      render();
      return;
    }

    if (action === 'tryout-prev') {
      state.tryout.index = Math.max(0,state.tryout.index-1);
      render();
      return;
    }

    if (action === 'tryout-next') {
      const set = questions.filter(q=>q.year===state.tryout.year);
      state.tryout.index = Math.min(set.length-1,state.tryout.index+1);
      render();
      return;
    }

    if (action === 'goto-question') {
      state.tryout.index = Number(el.dataset.index);
      render();
      return;
    }

    if (action === 'submit-tryout') {
      if (confirm('Akhiri tryout dan tampilkan nilai?')) {
        state.tryout.submitted = true;
        render();
        window.scrollTo({top:0,behavior:'smooth'});
      }
      return;
    }

    if (action === 'reset-tryout') {
      resetTryout(false);
      render();
      return;
    }

    if (action === 'result-to-bank') {
      state.selectedYear = Number(el.dataset.year);
      state.page = 'bank';
      resetBankFilters();
      render();
      return;
    }

    if (action === 'open-2026-bank') {
      state.selectedYear = 2026;
      state.page = 'bank';
      resetBankFilters();
      render();
      return;
    }
  }

  function resetBankFilters() {
    state.query = '';
    state.category = 'Semua';
    state.difficulty = 'Semua';
  }

  function resetTryout(keepStarted=false) {
    stopTryoutTimer();
    state.tryout.started = keepStarted;
    state.tryout.index = 0;
    state.tryout.answers = {};
    state.tryout.submitted = false;
    state.tryout.seconds = 45*60;
  }

  function startTryoutTimer() {
    stopTryoutTimer();
    state.tryout.timerId = setInterval(() => {
      if (!state.tryout.started || state.tryout.submitted) {
        stopTryoutTimer();
        return;
      }
      state.tryout.seconds = Math.max(0,state.tryout.seconds-1);
      const timer = document.getElementById('timerText');
      if (timer) {
        timer.textContent = '⏱ ' + formatTime(state.tryout.seconds);
        timer.classList.toggle('danger', state.tryout.seconds < 300);
      }
      if (state.tryout.seconds === 0) {
        state.tryout.submitted = true;
        stopTryoutTimer();
        render();
        window.scrollTo({top:0,behavior:'smooth'});
      }
    },1000);
  }

  function stopTryoutTimer() {
    if (state.tryout.timerId) {
      clearInterval(state.tryout.timerId);
      state.tryout.timerId = null;
    }
  }

  window.addEventListener('beforeunload', stopTryoutTimer);
  render();
})();
