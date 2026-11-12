// Motor del Lector Digital Interactivo — GERİ DÖNMEYENLER
class DigitalBookReader {
  constructor(app) {
    this.app = app;
    this.currentSpreadIndex = 0;
    this.pages = [];
    this.fontSizeStep = 1; // 0: S, 1: M, 2: L, 3: XL
    this.fontSizes = ["0.92rem", "1.03rem", "1.16rem", "1.30rem"];
    this.nightMode = false;
    this.bookmarks = JSON.parse(localStorage.getItem("gd_bookmarks") || "[]");
    this.audioCtx = null;
    this.windGain = null;
    this.ambientPlaying = false;
  }

  getPublishedChapters() {
    return this.app.bookData.chapters.filter(c => c.published && c[this.app.lang].content.trim().length > 0);
  }

  paginateBook() {
    const lang = this.app.lang;
    const chapters = this.getPublishedChapters();
    const charsPerPage = [1150, 950, 780, 640][this.fontSizeStep];
    const generatedPages = [];

    chapters.forEach(ch => {
      const chData = ch[lang];
      const label = ch.isPrologue
        ? (lang === "es" ? "PRÓLOGO" : "ÖNSÖZ")
        : (lang === "es" ? `CAPÍTULO ${ch.chapterNumber}` : `${ch.chapterNumber}. BÖLÜM`);

      const paragraphs = chData.content.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
      let currentParas = [];
      let currentLen = 0;
      let isFirstPageOfChapter = true;

      paragraphs.forEach(para => {
        if (currentLen + para.length > charsPerPage && currentParas.length > 0) {
          generatedPages.push({
            chapterId: ch.id,
            chapterLabel: label,
            chapterTitle: chData.title,
            chapterSubtitle: chData.subtitle,
            isFirstPage: isFirstPageOfChapter,
            illustration: isFirstPageOfChapter ? ch.illustration : "",
            paragraphs: currentParas
          });
          isFirstPageOfChapter = false;
          currentParas = [para];
          currentLen = para.length;
        } else {
          currentParas.push(para);
          currentLen += para.length;
        }
      });

      if (currentParas.length > 0) {
        generatedPages.push({
          chapterId: ch.id,
          chapterLabel: label,
          chapterTitle: chData.title,
          chapterSubtitle: chData.subtitle,
          isFirstPage: isFirstPageOfChapter,
          illustration: isFirstPageOfChapter ? ch.illustration : "",
          paragraphs: currentParas
        });
      }
    });

    this.pages = generatedPages;
    return generatedPages;
  }

  isDesktopTwoPage() {
    return window.innerWidth > 920;
  }

  render() {
    this.paginateBook();
    const leftPageEl = document.getElementById("page-left");
    const rightPageEl = document.getElementById("page-right");
    const openBookEl = document.getElementById("open-book");

    if (!this.pages.length) return;

    const step = this.isDesktopTwoPage() ? 2 : 1;
    if (this.currentSpreadIndex >= this.pages.length) {
      this.currentSpreadIndex = Math.max(0, this.pages.length - step);
    }

    openBookEl.style.setProperty("--reader-font-size", this.fontSizes[this.fontSizeStep]);

    const leftData = this.pages[this.currentSpreadIndex];
    const rightData = this.isDesktopTwoPage() ? this.pages[this.currentSpreadIndex + 1] : null;

    leftPageEl.innerHTML = this.buildPageHTML(leftData, this.currentSpreadIndex + 1);
    if (rightData) {
      rightPageEl.innerHTML = this.buildPageHTML(rightData, this.currentSpreadIndex + 2);
      rightPageEl.style.visibility = "visible";
    } else {
      rightPageEl.innerHTML = `<div class="page-header-meta"><span>GERİ DÖNMEYENLER</span></div><div class="page-body" style="display:flex;align-items:center;justify-content:center;opacity:0.45;font-style:italic;"><p>${this.app.lang === "es" ? "Fin de los capítulos publicados hasta el momento." : "Şu ana kadar yayımlanan bölümlerin sonu."}</p></div><div class="page-footer-num">—</div>`;
    }

    this.updateProgressUI();
    this.saveReadingProgress();
  }

  buildPageHTML(pageObj, pageNum) {
    if (!pageObj) return "";
    let headingHTML = "";
    if (pageObj.isFirstPage) {
      headingHTML = `
        <h3 class="chapter-heading">${pageObj.chapterTitle}</h3>
        <div class="chapter-date">${pageObj.chapterSubtitle}</div>
        ${pageObj.illustration ? `<img src="${pageObj.illustration}" alt="${pageObj.chapterTitle}" class="scene-illustration">` : ""}
      `;
    }
    const parasHTML = pageObj.paragraphs.map(p => `<p>${this.escapeHTML(p)}</p>`).join("");
    return `
      <div>
        <div class="page-header-meta">
          <span>${pageObj.chapterLabel}</span>
          <span>GERİ DÖNMEYENLER</span>
        </div>
        <div class="page-body">
          ${headingHTML}
          ${parasHTML}
        </div>
      </div>
      <div class="page-footer-num">— ${pageNum} —</div>
    `;
  }

  escapeHTML(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  nextPage() {
    const step = this.isDesktopTwoPage() ? 2 : 1;
    if (this.currentSpreadIndex + step < this.pages.length) {
      this.animateTurn(() => {
        this.currentSpreadIndex += step;
        this.render();
      });
    }
  }

  prevPage() {
    const step = this.isDesktopTwoPage() ? 2 : 1;
    if (this.currentSpreadIndex - step >= 0) {
      this.animateTurn(() => {
        this.currentSpreadIndex -= step;
        this.render();
      });
    }
  }

  goToChapter(chapterId) {
    const idx = this.pages.findIndex(p => p.chapterId === chapterId);
    if (idx !== -1) {
      const step = this.isDesktopTwoPage() ? 2 : 1;
      this.currentSpreadIndex = step === 2 ? idx - (idx % 2) : idx;
      this.render();
    }
  }

  animateTurn(callback) {
    const book = document.getElementById("open-book");
    book.classList.add("turning");
    setTimeout(() => {
      callback();
      book.classList.remove("turning");
    }, 150);
  }

  updateProgressUI() {
    const total = this.pages.length;
    const current = Math.min(total, this.currentSpreadIndex + (this.isDesktopTwoPage() ? 2 : 1));
    const pct = Math.round((current / total) * 100);

    document.getElementById("reader-progress-fill").style.width = `${pct}%`;
    const pageText = this.app.lang === "es"
      ? `Página ${current} de ${total} (${pct}% completado)`
      : `Sayfa ${current} / ${total} (%${pct} tamamlandı)`;
    document.getElementById("reader-status-text").textContent = pageText;

    const currentPageObj = this.pages[this.currentSpreadIndex];
    if (currentPageObj) {
      const select = document.getElementById("reader-chapter-select");
      if (select) select.value = currentPageObj.chapterId;
    }
  }

  saveReadingProgress() {
    localStorage.setItem("gd_reading_progress", JSON.stringify({
      spreadIndex: this.currentSpreadIndex,
      chapterId: this.pages[this.currentSpreadIndex]?.chapterId || "prologo",
      updatedAt: new Date().toISOString()
    }));
  }

  restoreReadingProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem("gd_reading_progress"));
      if (saved && typeof saved.spreadIndex === "number") {
        this.currentSpreadIndex = saved.spreadIndex;
      }
    } catch (e) {}
  }

  toggleBookmark() {
    const pageObj = this.pages[this.currentSpreadIndex];
    if (!pageObj) return;
    const key = `${pageObj.chapterId}:${this.currentSpreadIndex}`;
    const existingIdx = this.bookmarks.findIndex(b => b.key === key);
    if (existingIdx >= 0) {
      this.bookmarks.splice(existingIdx, 1);
    } else {
      this.bookmarks.push({
        key,
        spreadIndex: this.currentSpreadIndex,
        label: `${pageObj.chapterLabel} — Pág. ${this.currentSpreadIndex + 1}`
      });
    }
    localStorage.setItem("gd_bookmarks", JSON.stringify(this.bookmarks));
    this.renderBookmarks();
  }

  renderBookmarks() {
    const container = document.getElementById("bookmarks-list");
    if (!container) return;
    if (!this.bookmarks.length) {
      container.innerHTML = `<span style="opacity:0.6;font-size:0.82rem;">${this.app.lang === "es" ? "Sin marcadores guardados" : "Kayıtlı yer imi yok"}</span>`;
      return;
    }
    container.innerHTML = this.bookmarks.map(b => `
      <button class="tool-btn" onclick="window.novelApp.reader.jumpToSpread(${b.spreadIndex})">🔖 ${b.label}</button>
    `).join("");
  }

  jumpToSpread(idx) {
    this.currentSpreadIndex = idx;
    this.render();
  }

  cycleFontSize() {
    this.fontSizeStep = (this.fontSizeStep + 1) % this.fontSizes.length;
    this.render();
  }

  toggleNightMode() {
    this.nightMode = !this.nightMode;
    document.getElementById("reader-shell").classList.toggle("night-mode", this.nightMode);
  }

  toggleFullscreen() {
    document.getElementById("reader-shell").classList.toggle("fullscreen-mode");
    this.render();
  }

  // Sonido ambiental opcional de viento invernal generado con Web Audio API (solo si el lector lo activa)
  toggleAmbientWind() {
    const btn = document.getElementById("btn-ambient");
    if (!this.ambientPlaying) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
      const bufferSize = 2 * this.audioCtx.sampleRate;
      const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 1.8;
      }
      const whiteNoise = this.audioCtx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = this.audioCtx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 320;

      this.windGain = this.audioCtx.createGain();
      this.windGain.gain.value = 0.08;

      whiteNoise.connect(filter);
      filter.connect(this.windGain);
      this.windGain.connect(this.audioCtx.destination);
      whiteNoise.start(0);

      this.ambientPlaying = true;
      btn.classList.add("active");
    } else {
      if (this.audioCtx) this.audioCtx.close();
      this.ambientPlaying = false;
      btn.classList.remove("active");
    }
  }
}
