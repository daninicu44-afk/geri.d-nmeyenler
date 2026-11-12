// Panel Privado de Administración del Autor — GERİ DÖNMEYENLER
class AuthorAdminPanel {
  constructor(app) {
    this.app = app;
    this.isAuthenticated = false;
    this.selectedChapterId = "prologo";
    // Contraseña por defecto configurable: 19221959
    this.adminPass = localStorage.getItem("gd_admin_pass") || "19221959";
  }

  openModal() {
    document.getElementById("admin-modal").classList.add("open");
    if (this.isAuthenticated) {
      document.getElementById("admin-login-view").style.display = "none";
      document.getElementById("admin-dashboard-view").style.display = "block";
      this.renderChapterList();
      this.loadChapterIntoEditor(this.selectedChapterId);
    } else {
      document.getElementById("admin-login-view").style.display = "block";
      document.getElementById("admin-dashboard-view").style.display = "none";
    }
  }

  closeModal() {
    document.getElementById("admin-modal").classList.remove("open");
  }

  login(e) {
    e.preventDefault();
    const input = document.getElementById("admin-password-input").value;
    if (input === this.adminPass) {
      this.isAuthenticated = true;
      this.openModal();
    } else {
      alert("Contraseña incorrecta.");
    }
  }

  renderChapterList() {
    const listEl = document.getElementById("admin-chapters-list");
    listEl.innerHTML = this.app.bookData.chapters.map((ch, idx) => {
      const prefix = ch.isPrologue ? "Prólogo" : `Cap. ${ch.chapterNumber}`;
      const statusBadge = ch.published ? "🟢" : "⚪";
      return `
        <div class="admin-ch-row">
          <div style="cursor:pointer;flex:1;" onclick="window.novelApp.admin.loadChapterIntoEditor('${ch.id}')">
            ${statusBadge} <strong>${prefix}:</strong> ${ch.es.title}
          </div>
          <div>
            <button class="tool-btn" title="Subir" onclick="window.novelApp.admin.moveChapter(${idx}, -1)">↑</button>
            <button class="tool-btn" title="Bajar" onclick="window.novelApp.admin.moveChapter(${idx}, 1)">↓</button>
          </div>
        </div>
      `;
    }).join("");
  }

  loadChapterIntoEditor(id) {
    const ch = this.app.bookData.chapters.find(c => c.id === id);
    if (!ch) return;
    this.selectedChapterId = id;
    document.getElementById("edit-ch-title-es").value = ch.es.title;
    document.getElementById("edit-ch-sub-es").value = ch.es.subtitle;
    document.getElementById("edit-ch-content-es").value = ch.es.content;

    document.getElementById("edit-ch-title-tr").value = ch.tr.title;
    document.getElementById("edit-ch-sub-tr").value = ch.tr.subtitle;
    document.getElementById("edit-ch-content-tr").value = ch.tr.content;

    document.getElementById("edit-ch-published").checked = ch.published;
    document.getElementById("edit-ch-illustration").value = ch.illustration || "";
    document.getElementById("edit-book-version").value = this.app.bookData.version || "1.0";
    document.getElementById("edit-cover-url").value = this.app.bookData.coverImage || "";
  }

  saveCurrentChapter() {
    const ch = this.app.bookData.chapters.find(c => c.id === this.selectedChapterId);
    if (!ch) return;

    ch.es.title = document.getElementById("edit-ch-title-es").value;
    ch.es.subtitle = document.getElementById("edit-ch-sub-es").value;
    ch.es.content = document.getElementById("edit-ch-content-es").value;

    ch.tr.title = document.getElementById("edit-ch-title-tr").value;
    ch.tr.subtitle = document.getElementById("edit-ch-sub-tr").value;
    ch.tr.content = document.getElementById("edit-ch-content-tr").value;

    ch.published = document.getElementById("edit-ch-published").checked;
    ch.illustration = document.getElementById("edit-ch-illustration").value.trim();

    this.app.bookData.version = document.getElementById("edit-book-version").value.trim();
    this.app.bookData.coverImage = document.getElementById("edit-cover-url").value.trim();

    this.persistAndRefresh();
    alert("Cambios publicados correctamente.");
  }

  addNewChapter() {
    const num = this.app.bookData.chapters.filter(c => !c.isPrologue).length + 1;
    const newId = `cap-${Date.now()}`;
    this.app.bookData.chapters.push({
      id: newId,
      isPrologue: false,
      chapterNumber: num,
      published: false,
      illustration: "",
      es: { title: `Capítulo ${num}`, subtitle: "Fecha — Ubicación", content: "" },
      tr: { title: `${num}. Bölüm`, subtitle: "Tarih — Konum", content: "" }
    });
    this.persistAndRefresh();
    this.loadChapterIntoEditor(newId);
  }

  deleteSelectedChapter() {
    if (this.selectedChapterId === "prologo") {
      alert("El Prólogo no puede eliminarse.");
      return;
    }
    if (!confirm("¿Eliminar este capítulo definitivamente?")) return;
    this.app.bookData.chapters = this.app.bookData.chapters.filter(c => c.id !== this.selectedChapterId);
    this.selectedChapterId = "prologo";
    this.persistAndRefresh();
    this.loadChapterIntoEditor("prologo");
  }

  moveChapter(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= this.app.bookData.chapters.length) return;
    const arr = this.app.bookData.chapters;
    [arr[index], arr[target]] = [arr[target], arr[index]];
    this.persistAndRefresh();
  }

  handleImageUpload(inputEl, targetFieldId) {
    const file = inputEl.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      document.getElementById(targetFieldId).value = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  exportBackupJSON() {
    const blob = new Blob([JSON.stringify(this.app.bookData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `geri-donmeyenler-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  importBackupJSON(inputEl) {
    const file = inputEl.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (parsed && Array.isArray(parsed.chapters)) {
          this.app.bookData = parsed;
          this.persistAndRefresh();
          this.loadChapterIntoEditor(this.app.bookData.chapters[0].id);
          alert("Copia de seguridad restaurada con éxito.");
        }
      } catch (err) {
        alert("El archivo JSON no es válido.");
      }
    };
    reader.readAsText(file);
  }

  persistAndRefresh() {
    localStorage.setItem("gd_book_data", JSON.stringify(this.app.bookData));
    this.renderChapterList();
    this.app.refreshAllUI();
  }
}
