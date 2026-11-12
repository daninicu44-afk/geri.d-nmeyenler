// Aplicación Principal — GERİ DÖNMEYENLER
const UI_STRINGS = {
  es: {
    navHome: "Inicio",
    navReader: "Leer Libro",
    navAbout: "Sobre el Libro",
    navCharacters: "Personajes",
    navGallery: "Galería",
    navContact: "Contacto",
    eyebrow: "Novela de Terror Psicológico y Misterio",
    subtitle: "Una novela de terror inspirada en dos misterios reales.",
    quote: "“Hay lugares donde la muerte no es el final. Es el comienzo de algo que jamás debió despertar.”",
    heroDesc: "Dos tragedias reales separadas por treinta y siete años y miles de kilómetros: la granja aislada de Hinterkaifeck en 1922 y la expedición perdida del paso Diátlov en 1959. Una misma presencia silenciosa entre la nieve.",
    btnRead: "LEER LIBRO",
    btnDiscover: "DESCUBRIR LA HISTORIA",
    btnContinue: "Continuar donde lo dejaste",
    mysteriesTag: "Archivos Reales",
    mysteriesTitle: "Los Dos Misterios Que Inspiraron la Novela",
    m1Title: "La Granja de Hinterkaifeck",
    m1Desc: "En marzo de 1922, en una granja aislada de Baviera, Andreas Gruber descubrió huellas en la nieve que conducían desde el bosque hacia la casa, pero ninguna de regreso. Días después, toda la familia fue hallada sin vida.",
    m2Title: "El Incidente del Paso Diátlov",
    m2Desc: "En febrero de 1959, nueve experimentados montañeros liderados por Ígor Diátlov rasgaron su tienda desde el interior en mitad de la noche helada de los montes Urales y huyeron descalzos hacia la oscuridad.",
    readerTag: "Edición Digital Interactiva",
    readerTitle: "Lector de la Novela",
    aboutTag: "La Obra",
    aboutTitle: "Sobre el Libro y su Estructura",
    aboutText: "GERİ DÖNMEYENLER (Los que nunca regresaron) es una novela de terror atmosférico estructurada en un Prólogo y 20 capítulos que entrelazan documentos, diarios y testimonios ficticios alrededor de dos de los enigmas sin resolver más inquietantes del siglo XX.",
    charsTag: "Protagonistas",
    charsTitle: "Personajes Principales",
    galleryTag: "Escenarios",
    galleryTitle: "Archivo Visual de la Historia",
    contactTag: "Correspondencia",
    contactTitle: "Contacto con el Autor",
    sendBtn: "Enviar Mensaje"
  },
  tr: {
    navHome: "Ana Sayfa",
    navReader: "Kitabı Oku",
    navAbout: "Kitap Hakkında",
    navCharacters: "Karakterler",
    navGallery: "Galeri",
    navContact: "İletişim",
    eyebrow: "Psikolojik Korku ve Gizem Romanı",
    subtitle: "Gerçek iki gizemli olaydan esinlenen bir korku romanı.",
    quote: "“Ölümün son olmadığı yerler vardır. O, asla uyanmaması gereken bir şeyin başlangıcıdır.”",
    heroDesc: "Otuz yedi yıl ve binlerce kilometreyle ayrılan iki gerçek trajedi: 1922'de Bavyera'daki izole Hinterkaifeck çiftliği ve 1959'da Ural Dağları'ndaki kayıp Dyatlov Geçidi seferi. Karların arasında bekleyen aynı sessiz varlık.",
    btnRead: "KİTABI OKU",
    btnDiscover: "HİKÂYEYİ KEŞFET",
    btnContinue: "Kaldığın yerden devam et",
    mysteriesTag: "Gerçek Dosyalar",
    mysteriesTitle: "Romana İlham Veren İki Gerçek Gizem",
    m1Title: "Hinterkaifeck Çiftliği",
    m1Desc: "Mart 1922'de Bavyera'daki izole bir çiftlikte Andreas Gruber, ormandan eve doğru gelen ancak geri dönmeyen ayak izleri fark etti. Günler sonra tüm aile ölü bulundu.",
    m2Title: "Dyatlov Geçidi Vakası",
    m2Desc: "Şubat 1959'da İgor Dyatlov liderliğindeki dokuz deneyimli dağcı, Ural Dağları'nın dondurucu gecesinde çadırlarını içeriden yırtarak karanlığa doğru kaçtı.",
    readerTag: "Etkileşimli Dijital Baskı",
    readerTitle: "Roman Okuyucu",
    aboutTag: "Eser Hakkında",
    aboutTitle: "Kitap ve Yapısı",
    aboutText: "GERİ DÖNMEYENLER, 20. yüzyılın en karanlık iki çözülmemiş gizemini bir Önsöz ve 20 bölüm boyunca birleştiren atmosferik bir psikolojik korku romanıdır.",
    charsTag: "Karakterler",
    charsTitle: "Ana Karakterler",
    galleryTag: "Mekânlar",
    galleryTitle: "Hikâyenin Görsel Arşivi",
    contactTag: "İletişim",
    contactTitle: "Yazarla İletişime Geçin",
    sendBtn: "Mesaj Gönder"
  }
};

class NovelPlatformApp {
  constructor() {
    this.lang = localStorage.getItem("gd_lang") || "es";
    const savedBook = localStorage.getItem("gd_book_data");
    this.bookData = savedBook ? JSON.parse(savedBook) : structuredClone(DEFAULT_BOOK_DATA);
    this.reader = new DigitalBookReader(this);
    this.admin = new AuthorAdminPanel(this);
  }

  init() {
    this.applyLanguage(this.lang);
    this.reader.restoreReadingProgress();
    this.refreshAllUI();
    this.initSnowCanvas();
    this.bindEvents();
  }

  setLanguage(lang) {
    this.lang = lang;
    localStorage.setItem("gd_lang", lang);
    document.querySelectorAll(".lang-btn").forEach(b => {
      b.classList.toggle("active", b.dataset.lang === lang);
    });
    this.applyLanguage(lang);
    this.refreshAllUI();
  }

  applyLanguage(lang) {
    const dict = UI_STRINGS[lang];
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (dict[key]) el.textContent = dict[key];
    });
  }

  refreshAllUI() {
    // Portada personalizada si existe
    const coverEl = document.getElementById("official-book-cover");
    if (this.bookData.coverImage) {
      coverEl.style.backgroundImage = `linear-gradient(180deg, rgba(9,10,13,0.45), rgba(9,10,13,0.92)), url('${this.bookData.coverImage}')`;
    }

    // Selector de capítulos e índice
    const select = document.getElementById("reader-chapter-select");
    const tocGrid = document.getElementById("toc-grid");
    select.innerHTML = "";
    tocGrid.innerHTML = "";

    this.bookData.chapters.forEach(ch => {
      const prefix = ch.isPrologue
        ? (this.lang === "es" ? "Prólogo" : "Önsöz")
        : `${ch.chapterNumber}.`;
      const label = `${prefix} ${ch[this.lang].title}`;
      const isAvailable = ch.published && ch[this.lang].content.trim().length > 0;

      if (isAvailable) {
        const opt = document.createElement("option");
        opt.value = ch.id;
        opt.textContent = label;
        select.appendChild(opt);
      }

      const tocBtn = document.createElement("button");
      tocBtn.className = `toc-item ${isAvailable ? "" : "draft"}`;
      tocBtn.innerHTML = `<span>${label}</span><span>${isAvailable ? "→" : (this.lang === "es" ? "Próximamente" : "Yakında")}</span>`;
      if (isAvailable) {
        tocBtn.onclick = () => {
          this.reader.goToChapter(ch.id);
          document.getElementById("toc-panel").classList.remove("open");
        };
      }
      tocGrid.appendChild(tocBtn);
    });

    this.reader.render();
    this.reader.renderBookmarks();
  }

  bindEvents() {
    window.addEventListener("resize", () => this.reader.render());
    document.addEventListener("keydown", e => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "a") {
        this.admin.openModal();
      }
    });
  }

  initSnowCanvas() {
    const canvas = document.getElementById("snow-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const flakes = Array.from({ length: 55 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.8 + 0.6,
      d: Math.random() * 0.6 + 0.2
    }));

    function draw() {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(232, 229, 223, 0.55)";
      ctx.beginPath();
      flakes.forEach(f => {
        ctx.moveTo(f.x, f.y);
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        f.y += f.d;
        f.x += Math.sin(f.y * 0.01) * 0.25;
        if (f.y > height) {
          f.y = -5;
          f.x = Math.random() * width;
        }
      });
      ctx.fill();
      requestAnimationFrame(draw);
    }
    draw();
  }
}

window.addEventListener("DOMContentLoaded", () => {
  window.novelApp = new NovelPlatformApp();
  window.novelApp.init();
});
