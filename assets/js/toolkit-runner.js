(function () {
  const toolId = window.location.pathname.split("/").pop().replace(".html", "");
  const appRoot = document.querySelector("#tool-app");
  if (!appRoot) return;

  const LIBRARIES = {
    pdfLib: { global: "PDFLib", url: "https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js" },
    jszip: { global: "JSZip", url: "https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js" },
    jspdf: { global: "jspdf", url: "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" },
    pdfjs: {
      global: "pdfjsLib",
      url: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
      afterLoad() {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      },
    },
    mammoth: { global: "mammoth", url: "https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.8.0/mammoth.browser.min.js" },
    html2pdf: { global: "html2pdf", url: "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js" },
    qrcode: { global: "QRCode", url: "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js" },
  };

  const TOOLS = {
    "merge-pdf": meta("Merge PDF", "PDF", "Gabungkan beberapa PDF menjadi satu file final yang rapi.", ["Unggah beberapa file PDF", "Susun otomatis berdasarkan urutan file", "Unduh hasil gabungan dalam satu klik"], renderMergePdf),
    "split-pdf": meta("Split PDF", "PDF", "Pisahkan halaman PDF berdasarkan halaman tertentu atau rentang halaman.", ["Masukkan format seperti 1,3-5,8", "Hasil dipaketkan ke ZIP", "Cocok untuk ekstraksi halaman penting"], renderSplitPdf),
    "edit-pdf": meta("Edit PDF", "PDF", "Tambahkan watermark teks ke setiap halaman PDF langsung dari browser.", ["Atur teks watermark", "Kontrol ukuran, warna, dan opacity", "Unduh file PDF hasil edit"], renderEditPdf),
    "convert-pdf": meta("Convert PDF", "PDF", "Ekstrak isi teks dari PDF lalu simpan sebagai TXT yang bersih.", ["Ambil teks per halaman", "Preview hasil ekstraksi", "Unduh sebagai file teks"], renderConvertPdf),
    "compress-pdf": meta("Compress PDF", "PDF", "Optimalkan struktur PDF agar ukuran file bisa lebih ringan.", ["Resave dokumen dengan object streams", "Bandingkan ukuran awal dan hasil", "Unduh versi teroptimasi"], renderCompressPdf),
    "pdf-to-image": meta("PDF to Image", "PDF", "Ubah setiap halaman PDF menjadi gambar PNG atau JPEG.", ["Pilih format output", "Atur skala render", "Unduh semua halaman dalam ZIP"], renderPdfToImage),
    "compress-image": meta("Compress Image", "Image", "Kecilkan ukuran gambar sambil tetap menjaga hasil yang enak dilihat.", ["Atur kualitas kompresi", "Preview sebelum dan sesudah", "Unduh hasil gambar baru"], renderCompressImage),
    "convert-image": meta("Convert Image", "Image", "Konversi gambar ke PNG, JPEG, atau WEBP dari browser.", ["Dukungan format umum", "Preview output instan", "Unduh satu file hasil konversi"], renderConvertImage),
    "resize-image": meta("Resize Image", "Image", "Ubah dimensi gambar dengan kontrol rasio yang praktis.", ["Atur lebar dan tinggi", "Pertahankan rasio otomatis", "Preview hasil resize"], renderResizeImage),
    "crop-image": meta("Crop Image", "Image", "Potong gambar menggunakan koordinat dan ukuran yang presisi.", ["Atur X, Y, lebar, dan tinggi", "Preview hasil crop", "Unduh gambar akhir"], renderCropImage),
    "word-counter": meta("Word Counter", "Text", "Analisis teks cepat untuk jumlah kata, karakter, baris, dan estimasi baca.", ["Hitung realtime", "Tampilkan statistik penting", "Cocok untuk artikel, caption, dan draft"], renderWordCounter),
    "remove-spaces": meta("Remove Spaces", "Text", "Rapikan spasi berlebih, trim baris, dan bersihkan teks kotor.", ["Collapse multiple spaces", "Hapus baris kosong", "Salin hasil bersih"], renderRemoveSpaces),
    "case-converter": meta("Case Converter", "Text", "Ubah gaya huruf ke uppercase, lowercase, title, snake, camel, dan lainnya.", ["Beberapa mode konversi", "Preview instan", "Salin hasil cepat"], renderCaseConverter),
    "text-sorter": meta("Text Sorter", "Text", "Urutkan daftar teks, hapus duplikat, atau acak susunan dalam satu klik.", ["Sort A-Z atau Z-A", "Randomize list", "Remove duplicate lines"], renderTextSorter),
    "jpg-to-png": meta("JPG to PNG", "Converter", "Ubah JPG ke PNG dengan output yang lebih bersih.", ["Upload JPG", "Preview hasil", "Unduh PNG"], renderJpgToPng),
    "png-to-jpg": meta("PNG to JPG", "Converter", "Ubah PNG ke JPG dengan kontrol warna latar belakang.", ["Pilih background untuk area transparan", "Atur kualitas", "Unduh JPG"], renderPngToJpg),
    "pdf-to-word": meta("PDF to Word", "Converter", "Ekstrak teks PDF lalu simpan sebagai file DOC yang mudah dibuka.", ["Preview isi teks", "Unduh file .doc", "Praktis untuk teks non-kompleks"], renderPdfToWord),
    "word-to-pdf": meta("Word to PDF", "Converter", "Konversi DOCX atau TXT ke PDF langsung dari browser.", ["Dukungan DOCX melalui preview HTML", "Ekspor PDF", "Tetap simpel untuk dokumen umum"], renderWordToPdf),
    bmi: meta("BMI Calculator", "Calculator", "Hitung indeks massa tubuh dan kategorinya dalam hitungan detik.", ["Input tinggi dan berat", "Kategori otomatis", "Ringkasan status"], renderBmi),
    discount: meta("Discount Calculator", "Calculator", "Hitung harga setelah diskon dan pajak tanpa ribet.", ["Harga awal, diskon, pajak", "Lihat penghematan", "Angka final otomatis"], renderDiscount),
    percentage: meta("Percentage Calculator", "Calculator", "Selesaikan beberapa tipe hitung persen dari satu halaman.", ["X persen dari Y", "Berapa persen perubahan", "Selisih naik turun"], renderPercentage),
    "qr-generator": meta("QR Generator", "Utility", "Buat QR code dari teks, link, atau informasi singkat lalu unduh.", ["Atur ukuran dan warna", "Preview QR instan", "Unduh PNG"], renderQrGenerator),
    "password-generator": meta("Password Generator", "Utility", "Hasilkan password acak yang kuat dan mudah disalin.", ["Atur panjang", "Pilih karakter", "Indikator kekuatan"], renderPasswordGenerator),
    "color-picker": meta("Color Picker", "Utility", "Pilih warna, tangkap warna layar, dan dapatkan variasi palette otomatis.", ["HEX, RGB, HSL", "Dukungan eyedropper jika tersedia", "Palette turunan otomatis"], renderColorPicker),
  };

  const config = TOOLS[toolId];
  if (!config) {
    appRoot.innerHTML = `<div class="tool-surface"><h2>Tool tidak ditemukan</h2><p>Halaman ini belum memiliki konfigurasi.</p></div>`;
    return;
  }

  document.title = `${config.title} | CoreChiperTools`;
  appRoot.innerHTML = `
    <section class="tool-hero">
      <div class="breadcrumbs">
        <a href="../../index.html">Beranda</a>
        <span>/</span>
        <a href="../../pages/${config.category.toLowerCase()}.html">${config.category}</a>
        <span>/</span>
        <span>${config.title}</span>
      </div>
      <p class="eyebrow">${config.category} Tool</p>
      <h1>${config.title}</h1>
      <p>${config.description}</p>
    </section>
    <section class="tool-layout">
      <div class="tool-surface"><div id="tool-workspace" class="tool-stack"></div></div>
      <aside class="tool-panel">
        <div class="tool-stack">
          <div class="result-card"><h3>Fungsi Utama</h3><ul class="tool-list">${config.highlights.map((item) => `<li>${item}</li>`).join("")}</ul></div>
          <div class="result-card"><h3>Navigasi</h3><div class="action-row"><a class="button button-secondary" href="../../pages/${config.category.toLowerCase()}.html">Kategori ${config.category}</a><a class="button secondary-button" href="../../index.html">Beranda</a></div></div>
          <div id="tool-status" class="tool-status">Siap digunakan. Unggah file atau isi data yang dibutuhkan.</div>
          <div id="tool-extra" class="tool-stack"></div>
        </div>
      </aside>
    </section>
  `;

  const ui = {
    workspace: document.querySelector("#tool-workspace"),
    status: document.querySelector("#tool-status"),
    extra: document.querySelector("#tool-extra"),
  };

  config.render(ui);

  function meta(title, category, description, highlights, render) { return { title, category, description, highlights, render }; }
  function setStatus(message, type = "info") {
    ui.status.textContent = message;
    ui.status.className = `tool-status${type === "info" ? "" : ` ${type}`}`;
  }
  function html(strings, ...values) { return strings.reduce((acc, string, index) => acc + string + (values[index] ?? ""), ""); }
  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function ensureLibrary(name) {
    const lib = LIBRARIES[name];
    if (!lib) throw new Error(`Library ${name} tidak ditemukan.`);
    if (window[lib.global]) return window[lib.global];
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = lib.url;
      script.async = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Gagal memuat library ${name}. Pastikan koneksi internet browser tersedia.`));
      document.head.appendChild(script);
    });
    if (typeof lib.afterLoad === "function") lib.afterLoad();
    return window[lib.global];
  }
  function bytesLabel(value) {
    if (!Number.isFinite(value)) return "-";
    if (value < 1024) return `${value} B`;
    if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
    return `${(value / 1024 / 1024).toFixed(2)} MB`;
  }
  function formatNumber(value, digits = 2) { return Number(value).toLocaleString("id-ID", { maximumFractionDigits: digits }); }
  function escapeHtml(value) { return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;"); }
  function readAsArrayBuffer(file) { return file.arrayBuffer(); }
  function readAsText(file) { return file.text(); }
  function fileChipList(files) {
    if (!files.length) return `<p class="small-note">Belum ada file dipilih.</p>`;
    return `<div class="file-list">${files.map((file) => `<div class="file-chip"><strong>${file.name}</strong><div>${bytesLabel(file.size)}</div></div>`).join("")}</div>`;
  }
  function inputFileTemplate(options = {}) {
    return html`
      <label class="tool-field full"><span class="tool-label">${options.label || "Pilih file"}</span><input class="tool-input" type="file" ${options.accept ? `accept="${options.accept}"` : ""} ${options.multiple ? "multiple" : ""} id="${options.id}"></label>
      <div id="${options.listId}" class="tool-dropzone"><strong>File siap diproses</strong><p class="small-note">${options.note || "Unggah file dari perangkat Anda."}</p></div>
    `;
  }
  function canvasToBlob(canvas, type = "image/png", quality) { return new Promise((resolve) => canvas.toBlob(resolve, type, quality)); }
  function loadImageFromFile(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }
  function parseRanges(input, maxPages) {
    const chunks = input.split(",").map((part) => part.trim()).filter(Boolean);
    if (!chunks.length) return [];
    const result = [];
    for (const chunk of chunks) {
      if (chunk.includes("-")) {
        const [startRaw, endRaw] = chunk.split("-");
        const start = Number(startRaw);
        const end = Number(endRaw);
        if (!start || !end || start > end || end > maxPages) throw new Error(`Rentang "${chunk}" tidak valid.`);
        result.push(Array.from({ length: end - start + 1 }, (_, index) => start + index));
      } else {
        const page = Number(chunk);
        if (!page || page > maxPages) throw new Error(`Halaman "${chunk}" tidak valid.`);
        result.push([page]);
      }
    }
    return result;
  }
  async function extractPdfText(file) {
    const pdfjsLib = await ensureLibrary("pdfjs");
    const buffer = await readAsArrayBuffer(file);
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    const pages = [];
    for (let pageIndex = 1; pageIndex <= pdf.numPages; pageIndex += 1) {
      const page = await pdf.getPage(pageIndex);
      const content = await page.getTextContent();
      const pageText = content.items.map((item) => item.str).join(" ").replace(/\s+/g, " ").trim();
      pages.push(`Halaman ${pageIndex}\n${pageText}`);
    }
    return pages.join("\n\n");
  }
  async function extractPdfStructured(file) {
    const pdfjsLib = await ensureLibrary("pdfjs");
    const buffer = await readAsArrayBuffer(file);
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    const pages = [];
    for (let pageIndex = 1; pageIndex <= pdf.numPages; pageIndex += 1) {
      const page = await pdf.getPage(pageIndex);
      const viewport = page.getViewport({ scale: 1.25 });
      const content = await page.getTextContent();
      const lineMap = new Map();
      content.items.forEach((item) => {
        const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);
        const x = tx[4];
        const y = tx[5];
        const fontSize = Math.max(10, Math.abs(tx[0] || item.height || 12));
        const key = Math.round(y / 8) * 8;
        if (!lineMap.has(key)) lineMap.set(key, []);
        lineMap.get(key).push({ text: item.str, x, y, fontSize });
      });
      const lines = [...lineMap.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([, values]) => values.sort((a, b) => a.x - b.x))
        .map((values) => {
          const text = values.map((part) => part.text).join(" ").replace(/\s+/g, " ").trim();
          const left = Math.min(...values.map((part) => part.x));
          const fontSize = values.reduce((sum, part) => sum + part.fontSize, 0) / values.length;
          return { text, left, fontSize };
        })
        .filter((line) => line.text);
      pages.push({ width: viewport.width, height: viewport.height, lines });
    }
    return pages;
  }
  async function renderPdfPages(file, scale, onPage) {
    const pdfjsLib = await ensureLibrary("pdfjs");
    const pdf = await pdfjsLib.getDocument({ data: await readAsArrayBuffer(file) }).promise;
    for (let pageIndex = 1; pageIndex <= pdf.numPages; pageIndex += 1) {
      const page = await pdf.getPage(pageIndex);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: context, viewport }).promise;
      await onPage(canvas, pageIndex, pdf.numPages);
    }
  }
  function showPreview(content) {
    const preview = document.querySelector("#tool-preview");
    if (!preview) return;
    preview.innerHTML = "";
    if (typeof content === "string") preview.innerHTML = content;
    else preview.appendChild(content);
  }
  function createExportStage(innerHtml, className = "document-export-sheet") {
    const stage = document.createElement("div");
    stage.className = className;
    stage.style.position = "absolute";
    stage.style.left = "0";
    stage.style.top = "0";
    stage.style.width = "794px";
    stage.style.background = "#ffffff";
    stage.style.padding = "32px 28px";
    stage.style.boxSizing = "border-box";
    stage.style.opacity = "0.01";
    stage.style.pointerEvents = "none";
    stage.style.zIndex = "0";
    stage.style.overflow = "hidden";
    stage.innerHTML = innerHtml;
    document.body.appendChild(stage);
    return stage;
  }
  async function extractWordDocument(file) {
    if (file.name.toLowerCase().endsWith(".docx")) {
      const mammoth = await ensureLibrary("mammoth");
      const [htmlResult, rawResult] = await Promise.all([
        mammoth.convertToHtml({ arrayBuffer: await readAsArrayBuffer(file) }),
        mammoth.extractRawText({ arrayBuffer: await readAsArrayBuffer(file) }),
      ]);
      return {
        html: htmlResult.value,
        text: rawResult.value || "",
        rich: true,
      };
    }
    const text = await readAsText(file);
    return {
      html: `<pre class="text-file-preview">${escapeHtml(text)}</pre>`,
      text,
      rich: false,
    };
  }
  async function exportTextDocumentToPdf(text, filename) {
    const { jsPDF } = (await ensureLibrary("jspdf")).jsPDF ? (await ensureLibrary("jspdf")) : window.jspdf;
    const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const marginX = 14;
    const marginY = 16;
    const maxWidth = pageWidth - marginX * 2;
    const lineHeight = 6.4;
    let cursorY = marginY;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);

    const paragraphs = String(text)
      .replace(/\r/g, "")
      .split("\n")
      .map((line) => line.trimEnd());

    for (const paragraph of paragraphs) {
      const safeParagraph = paragraph || " ";
      const lines = pdf.splitTextToSize(safeParagraph, maxWidth);
      const blockHeight = Math.max(lineHeight, lines.length * lineHeight);
      if (cursorY + blockHeight > pageHeight - marginY) {
        pdf.addPage();
        cursorY = marginY;
      }
      pdf.text(lines, marginX, cursorY);
      cursorY += blockHeight;
      if (paragraph === "") cursorY += 1.5;
    }

    pdf.save(filename);
  }

  function renderMergePdf() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid">${inputFileTemplate({ id: "merge-files", listId: "merge-file-list", label: "Tambah file PDF ke antrian", accept: ".pdf,application/pdf", multiple: true, note: "Anda bisa menambahkan file sedikit demi sedikit, lalu atur urutannya sesuai kebutuhan." })}</div><div class="action-row"><button class="button button-primary" id="merge-run" type="button">Gabungkan PDF</button><button class="button secondary-button" id="merge-clear" type="button">Kosongkan Antrian</button></div>`;
    const input = document.querySelector("#merge-files");
    const list = document.querySelector("#merge-file-list");
    const queuedFiles = [];
    let draggedIndex = null;

    const buildMergeCard = (item, index) => `
      <div class="merge-card sortable-item" draggable="true" data-index="${index}">
        <div class="merge-badge">${bytesLabel(item.file.size)} - ${item.pages ?? "..."} halaman</div>
        <div class="merge-thumb-wrap">
          <div class="merge-thumb">${item.thumbnail ? `<img src="${item.thumbnail}" alt="${item.file.name}">` : `<span class="merge-thumb-placeholder">PDF</span>`}</div>
          <div class="merge-controls">
            <button class="merge-icon" type="button" data-action="up" data-index="${index}" ${index === 0 ? "disabled" : ""} title="Geser ke kiri">←</button>
            <button class="merge-icon" type="button" data-action="down" data-index="${index}" ${index === queuedFiles.length - 1 ? "disabled" : ""} title="Geser ke kanan">→</button>
            <button class="merge-icon danger" type="button" data-action="remove" data-index="${index}" title="Hapus file">×</button>
          </div>
        </div>
        <div class="merge-name" title="${item.file.name}">${item.file.name}</div>
      </div>
    `;

    const renderQueue = () => {
      if (!queuedFiles.length) {
        list.innerHTML = `<strong>File siap diproses</strong><p class="small-note">Belum ada file di antrian. Tambahkan PDF satu per satu atau sekaligus.</p>`;
        return;
      }
      list.innerHTML = `<strong>Antrian PDF</strong><p class="small-note">Atur posisi file sampai urutannya pas sebelum digabungkan.</p><div class="merge-board sortable-list">${queuedFiles.map((item, index) => buildMergeCard(item, index)).join("")}</div>`;
    };

    const moveItem = (fromIndex, toIndex) => {
      if (fromIndex === toIndex || toIndex < 0 || toIndex >= queuedFiles.length) return;
      const [moved] = queuedFiles.splice(fromIndex, 1);
      queuedFiles.splice(toIndex, 0, moved);
      renderQueue();
    };

    const enrichPdfItem = async (file) => {
      const pdfjsLib = await ensureLibrary("pdfjs");
      const task = pdfjsLib.getDocument({ data: await readAsArrayBuffer(file) });
      const pdf = await task.promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 0.45 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: context, viewport }).promise;
      return {
        file,
        pages: pdf.numPages,
        thumbnail: canvas.toDataURL("image/png"),
      };
    };

    input.addEventListener("change", async () => {
      const newFiles = [...input.files];
      if (!newFiles.length) return;
      setStatus("Menyiapkan thumbnail PDF...");
      const enrichedFiles = [];
      for (const file of newFiles) {
        enrichedFiles.push(await enrichPdfItem(file));
      }
      queuedFiles.push(...enrichedFiles);
      input.value = "";
      renderQueue();
      setStatus(`${newFiles.length} file PDF ditambahkan ke antrian.`);
    });

    list.addEventListener("click", (event) => {
      const target = event.target.closest("[data-action]");
      if (!target) return;
      const index = Number(target.dataset.index);
      if (target.dataset.action === "remove") queuedFiles.splice(index, 1);
      if (target.dataset.action === "up") moveItem(index, index - 1);
      if (target.dataset.action === "down") moveItem(index, index + 1);
      renderQueue();
    });

    list.addEventListener("dragstart", (event) => {
      const item = event.target.closest(".sortable-item");
      if (!item) return;
      draggedIndex = Number(item.dataset.index);
      item.classList.add("dragging");
    });

    list.addEventListener("dragend", (event) => {
      const item = event.target.closest(".sortable-item");
      if (item) item.classList.remove("dragging");
      draggedIndex = null;
    });

    list.addEventListener("dragover", (event) => {
      event.preventDefault();
    });

    list.addEventListener("drop", (event) => {
      event.preventDefault();
      const item = event.target.closest(".sortable-item");
      if (!item || draggedIndex === null) return;
      moveItem(draggedIndex, Number(item.dataset.index));
      draggedIndex = null;
    });

    document.querySelector("#merge-clear").addEventListener("click", () => {
      queuedFiles.length = 0;
      renderQueue();
      setStatus("Antrian merge PDF dikosongkan.");
    });

    renderQueue();

    document.querySelector("#merge-run").addEventListener("click", async () => {
      const items = [...queuedFiles];
      if (items.length < 2) return setStatus("Tambahkan minimal dua file PDF ke antrian untuk digabung.", "warn");
      try {
        setStatus("Menggabungkan PDF...");
        const { PDFDocument } = await ensureLibrary("pdfLib");
        const merged = await PDFDocument.create();
        for (const item of items) {
          const src = await PDFDocument.load(await readAsArrayBuffer(item.file));
          const pages = await merged.copyPages(src, src.getPageIndices());
          pages.forEach((page) => merged.addPage(page));
        }
        downloadBlob(new Blob([await merged.save()], { type: "application/pdf" }), "corechiper-merged.pdf");
        setStatus(`Berhasil menggabungkan ${items.length} file PDF.`);
      } catch (error) { setStatus(error.message, "error"); }
    });
  }

  function renderSplitPdf() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid">${inputFileTemplate({ id: "split-file", listId: "split-file-list", label: "Pilih file PDF", accept: ".pdf,application/pdf", note: "Masukkan PDF yang ingin dipisah." })}<label class="tool-field full"><span class="tool-label">Rentang halaman</span><input class="tool-input" id="split-ranges" type="text" placeholder="Contoh: 1,3-5,8"></label></div><div class="action-row"><button class="button button-primary" id="split-run" type="button">Pisahkan ke ZIP</button></div>`;
    const input = document.querySelector("#split-file");
    const list = document.querySelector("#split-file-list");
    input.addEventListener("change", () => { list.innerHTML = `<strong>File siap diproses</strong>${fileChipList([...input.files])}`; });
    document.querySelector("#split-run").addEventListener("click", async () => {
      const file = input.files[0];
      if (!file) return setStatus("Pilih file PDF terlebih dahulu.", "warn");
      try {
        setStatus("Memisahkan halaman PDF...");
        const { PDFDocument } = await ensureLibrary("pdfLib");
        const JSZip = await ensureLibrary("jszip");
        const source = await PDFDocument.load(await readAsArrayBuffer(file));
        const ranges = parseRanges(document.querySelector("#split-ranges").value, source.getPageCount());
        if (!ranges.length) return setStatus("Masukkan minimal satu halaman atau rentang halaman.", "warn");
        const zip = new JSZip();
        for (let index = 0; index < ranges.length; index += 1) {
          const doc = await PDFDocument.create();
          const pages = await doc.copyPages(source, ranges[index].map((page) => page - 1));
          pages.forEach((page) => doc.addPage(page));
          zip.file(`split-${index + 1}.pdf`, await doc.save());
        }
        downloadBlob(await zip.generateAsync({ type: "blob" }), "corechiper-split-pdf.zip");
        setStatus(`Berhasil membuat ${ranges.length} file PDF terpisah.`);
      } catch (error) { setStatus(error.message, "error"); }
    });
  }

  function renderEditPdf() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid">${inputFileTemplate({ id: "edit-file", listId: "edit-file-list", label: "Pilih file PDF", accept: ".pdf,application/pdf", note: "Tambahkan watermark teks ke semua halaman." })}<label class="tool-field full"><span class="tool-label">Teks watermark</span><input class="tool-input" id="edit-text" type="text" value="CoreChiperTools"></label><label class="tool-field"><span class="tool-label">Ukuran font</span><input class="tool-input" id="edit-size" type="number" min="12" max="96" value="34"></label><label class="tool-field"><span class="tool-label">Opacity</span><input class="tool-input" id="edit-opacity" type="number" min="0.05" max="1" step="0.05" value="0.18"></label><label class="tool-field"><span class="tool-label">Warna</span><input class="tool-input" id="edit-color" type="color" value="#d3541e"></label></div><div class="action-row"><button class="button button-primary" id="edit-run" type="button">Terapkan Watermark</button></div>`;
    const input = document.querySelector("#edit-file");
    const list = document.querySelector("#edit-file-list");
    input.addEventListener("change", () => { list.innerHTML = `<strong>File siap diproses</strong>${fileChipList([...input.files])}`; });
    document.querySelector("#edit-run").addEventListener("click", async () => {
      const file = input.files[0];
      if (!file) return setStatus("Pilih file PDF terlebih dahulu.", "warn");
      try {
        setStatus("Menambahkan watermark ke PDF...");
        const { PDFDocument, StandardFonts, rgb, degrees } = await ensureLibrary("pdfLib");
        const pdf = await PDFDocument.load(await readAsArrayBuffer(file));
        const font = await pdf.embedFont(StandardFonts.HelveticaBold);
        const watermark = document.querySelector("#edit-text").value.trim();
        const fontSize = Number(document.querySelector("#edit-size").value);
        const opacity = Number(document.querySelector("#edit-opacity").value);
        const color = hexToRgb(document.querySelector("#edit-color").value);
        pdf.getPages().forEach((page) => {
          const { width, height } = page.getSize();
          page.drawText(watermark, { x: width / 2 - (watermark.length * fontSize * 0.24), y: height / 2, size: fontSize, font, color: rgb(color.r / 255, color.g / 255, color.b / 255), rotate: degrees(35), opacity });
        });
        downloadBlob(new Blob([await pdf.save()], { type: "application/pdf" }), "corechiper-watermarked.pdf");
        setStatus("Watermark berhasil ditambahkan ke PDF.");
      } catch (error) { setStatus(error.message, "error"); }
    });
  }

  function renderConvertPdf() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid">${inputFileTemplate({ id: "convert-file", listId: "convert-file-list", label: "Pilih file PDF", accept: ".pdf,application/pdf", note: "Ekstrak isi teks utama dari PDF." })}<label class="tool-field full"><span class="tool-label">Hasil ekstraksi</span><textarea class="tool-textarea" id="convert-output" placeholder="Teks hasil ekstraksi akan muncul di sini."></textarea></label></div><div class="action-row"><button class="button button-primary" id="convert-run" type="button">Ekstrak Teks</button><button class="button secondary-button" id="convert-download" type="button">Unduh TXT</button></div>`;
    const input = document.querySelector("#convert-file");
    const list = document.querySelector("#convert-file-list");
    const output = document.querySelector("#convert-output");
    input.addEventListener("change", () => { list.innerHTML = `<strong>File siap diproses</strong>${fileChipList([...input.files])}`; });
    document.querySelector("#convert-run").addEventListener("click", async () => {
      const file = input.files[0];
      if (!file) return setStatus("Pilih file PDF terlebih dahulu.", "warn");
      try { setStatus("Mengekstrak teks dari PDF..."); output.value = await extractPdfText(file); setStatus("Teks berhasil diekstrak dari PDF."); } catch (error) { setStatus(error.message, "error"); }
    });
    document.querySelector("#convert-download").addEventListener("click", () => {
      if (!output.value.trim()) return setStatus("Belum ada teks yang bisa diunduh.", "warn");
      downloadBlob(new Blob([output.value], { type: "text/plain;charset=utf-8" }), "corechiper-pdf.txt");
      setStatus("File TXT berhasil diunduh.");
    });
  }

  function renderCompressPdf() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid">${inputFileTemplate({ id: "compress-pdf-file", listId: "compress-pdf-list", label: "Pilih file PDF", accept: ".pdf,application/pdf", note: "Optimasi ini paling efektif untuk PDF umum tanpa proteksi." })}<div class="result-card full"><h3>Perbandingan Ukuran</h3><div class="stats-grid"><div class="stat-chip"><strong id="pdf-before">-</strong><span>Sebelum</span></div><div class="stat-chip"><strong id="pdf-after">-</strong><span>Sesudah</span></div></div></div></div><div class="action-row"><button class="button button-primary" id="compress-pdf-run" type="button">Optimalkan PDF</button></div>`;
    const input = document.querySelector("#compress-pdf-file");
    const list = document.querySelector("#compress-pdf-list");
    input.addEventListener("change", () => {
      list.innerHTML = `<strong>File siap diproses</strong>${fileChipList([...input.files])}`;
      const file = input.files[0];
      document.querySelector("#pdf-before").textContent = file ? bytesLabel(file.size) : "-";
      document.querySelector("#pdf-after").textContent = "-";
    });
    document.querySelector("#compress-pdf-run").addEventListener("click", async () => {
      const file = input.files[0];
      if (!file) return setStatus("Pilih file PDF terlebih dahulu.", "warn");
      try {
        setStatus("Mengoptimalkan PDF...");
        const { PDFDocument } = await ensureLibrary("pdfLib");
        const pdf = await PDFDocument.load(await readAsArrayBuffer(file));
        const result = await pdf.save({ useObjectStreams: true, addDefaultPage: false });
        document.querySelector("#pdf-after").textContent = bytesLabel(result.length);
        downloadBlob(new Blob([result], { type: "application/pdf" }), "corechiper-optimized.pdf");
        setStatus("PDF teroptimasi sudah siap diunduh. Hasil kompresi bisa berbeda tergantung struktur file.", result.length >= file.size ? "warn" : "info");
      } catch (error) { setStatus(error.message, "error"); }
    });
  }

  function renderPdfToImage() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid">${inputFileTemplate({ id: "pdf-image-file", listId: "pdf-image-list", label: "Pilih file PDF", accept: ".pdf,application/pdf", note: "Setiap halaman akan diubah menjadi gambar." })}<label class="tool-field"><span class="tool-label">Format output</span><select class="tool-select" id="pdf-image-format"><option value="png">PNG</option><option value="jpeg">JPEG</option></select></label><label class="tool-field"><span class="tool-label">Skala render</span><input class="tool-input" id="pdf-image-scale" type="number" value="1.8" min="1" max="3" step="0.2"></label></div><div class="tool-preview" id="tool-preview"><p class="small-note">Preview halaman pertama akan tampil di sini.</p></div><div class="action-row"><button class="button button-primary" id="pdf-image-run" type="button">Konversi ke Gambar</button></div>`;
    const input = document.querySelector("#pdf-image-file");
    const list = document.querySelector("#pdf-image-list");
    input.addEventListener("change", () => { list.innerHTML = `<strong>File siap diproses</strong>${fileChipList([...input.files])}`; });
    document.querySelector("#pdf-image-run").addEventListener("click", async () => {
      const file = input.files[0];
      if (!file) return setStatus("Pilih file PDF terlebih dahulu.", "warn");
      try {
        setStatus("Mengubah PDF menjadi gambar...");
        const JSZip = await ensureLibrary("jszip");
        const zip = new JSZip();
        const format = document.querySelector("#pdf-image-format").value;
        const mime = format === "png" ? "image/png" : "image/jpeg";
        const quality = format === "png" ? undefined : 0.92;
        let previewSet = false;
        await renderPdfPages(file, Number(document.querySelector("#pdf-image-scale").value), async (canvas, pageIndex) => {
          if (!previewSet) { previewSet = true; showPreview(canvas); }
          zip.file(`page-${pageIndex}.${format}`, await canvasToBlob(canvas, mime, quality));
        });
        downloadBlob(await zip.generateAsync({ type: "blob" }), "corechiper-pdf-images.zip");
        setStatus("Semua halaman PDF berhasil diekspor menjadi gambar.");
      } catch (error) { setStatus(error.message, "error"); }
    });
  }

  function renderCompressImage() { renderCanvasImageTool({ buttonLabel: "Kompres Gambar", extraFields: `<label class="tool-field"><span class="tool-label">Format output</span><select class="tool-select" id="image-output-format"><option value="image/jpeg">JPEG</option><option value="image/webp">WEBP</option></select></label><label class="tool-field"><span class="tool-label">Kualitas (0.1 - 1)</span><input class="tool-input" id="image-quality" type="number" min="0.1" max="1" step="0.05" value="0.72"></label>`, onRun: async ({ image, canvas }) => { canvas.width = image.naturalWidth; canvas.height = image.naturalHeight; canvas.getContext("2d").drawImage(image, 0, 0); const format = document.querySelector("#image-output-format").value; return { blob: await canvasToBlob(canvas, format, Number(document.querySelector("#image-quality").value)), filename: `compressed.${format.includes("jpeg") ? "jpg" : "webp"}` }; } }); }
  function renderConvertImage() { renderCanvasImageTool({ buttonLabel: "Konversi Gambar", extraFields: `<label class="tool-field"><span class="tool-label">Format output</span><select class="tool-select" id="convert-image-format"><option value="image/png">PNG</option><option value="image/jpeg">JPEG</option><option value="image/webp">WEBP</option></select></label>`, onRun: async ({ image, canvas }) => { canvas.width = image.naturalWidth; canvas.height = image.naturalHeight; canvas.getContext("2d").drawImage(image, 0, 0); const format = document.querySelector("#convert-image-format").value; return { blob: await canvasToBlob(canvas, format, 0.92), filename: `converted.${format.split("/")[1].replace("jpeg", "jpg")}` }; } }); }
  function renderResizeImage() { renderCanvasImageTool({ buttonLabel: "Resize Gambar", extraFields: `<label class="tool-field"><span class="tool-label">Lebar</span><input class="tool-input" id="resize-width" type="number" min="1"></label><label class="tool-field"><span class="tool-label">Tinggi</span><input class="tool-input" id="resize-height" type="number" min="1"></label><label class="tool-field full"><span class="tool-label">Rasio</span><select class="tool-select" id="resize-lock"><option value="yes">Pertahankan rasio</option><option value="no">Bebas</option></select></label>`, onLoaded(image) { document.querySelector("#resize-width").value = image.naturalWidth; document.querySelector("#resize-height").value = image.naturalHeight; }, onRun: async ({ image, canvas }) => { const widthInput = document.querySelector("#resize-width"); const heightInput = document.querySelector("#resize-height"); if (document.querySelector("#resize-lock").value === "yes") { const ratio = image.naturalWidth / image.naturalHeight; if (document.activeElement === widthInput) heightInput.value = Math.round(Number(widthInput.value) / ratio); if (document.activeElement === heightInput) widthInput.value = Math.round(Number(heightInput.value) * ratio); } const width = Number(widthInput.value); const height = Number(heightInput.value); canvas.width = width; canvas.height = height; canvas.getContext("2d").drawImage(image, 0, 0, width, height); return { blob: await canvasToBlob(canvas, "image/png"), filename: "resized.png" }; } }); }
  function renderCropImage() { renderCanvasImageTool({ buttonLabel: "Crop Gambar", extraFields: `<label class="tool-field"><span class="tool-label">X</span><input class="tool-input" id="crop-x" type="number" min="0" value="0"></label><label class="tool-field"><span class="tool-label">Y</span><input class="tool-input" id="crop-y" type="number" min="0" value="0"></label><label class="tool-field"><span class="tool-label">Lebar crop</span><input class="tool-input" id="crop-width" type="number" min="1"></label><label class="tool-field"><span class="tool-label">Tinggi crop</span><input class="tool-input" id="crop-height" type="number" min="1"></label>`, onLoaded(image) { document.querySelector("#crop-width").value = image.naturalWidth; document.querySelector("#crop-height").value = image.naturalHeight; }, onRun: async ({ image, canvas }) => { const x = Number(document.querySelector("#crop-x").value); const y = Number(document.querySelector("#crop-y").value); const width = Number(document.querySelector("#crop-width").value); const height = Number(document.querySelector("#crop-height").value); canvas.width = width; canvas.height = height; canvas.getContext("2d").drawImage(image, x, y, width, height, 0, 0, width, height); return { blob: await canvasToBlob(canvas, "image/png"), filename: "cropped.png" }; } }); }

  function renderWordCounter() {
    ui.workspace.innerHTML = html`<label class="tool-field full"><span class="tool-label">Masukkan teks</span><textarea class="tool-textarea" id="word-counter-input" placeholder="Tempel artikel, caption, atau catatan Anda di sini..."></textarea></label><div class="stats-grid" id="word-counter-stats"></div>`;
    const input = document.querySelector("#word-counter-input");
    const stats = document.querySelector("#word-counter-stats");
    const update = () => {
      const value = input.value;
      const words = value.trim() ? value.trim().split(/\s+/).length : 0;
      const chars = value.length;
      const charsNoSpaces = value.replace(/\s/g, "").length;
      const lines = value ? value.split(/\n/).length : 0;
      const reading = words ? Math.max(1, Math.ceil(words / 200)) : 0;
      stats.innerHTML = [["Kata", words], ["Karakter", chars], ["Tanpa Spasi", charsNoSpaces], ["Baris", lines], ["Menit Baca", reading]].map(([label, number]) => `<div class="stat-chip"><strong>${formatNumber(number, 0)}</strong><span>${label}</span></div>`).join("");
    };
    input.addEventListener("input", update);
    update();
  }

  function renderRemoveSpaces() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid"><label class="tool-field full"><span class="tool-label">Teks sumber</span><textarea class="tool-textarea" id="space-input"></textarea></label><label class="tool-field"><span class="tool-label">Opsi 1</span><select class="tool-select" id="space-collapse"><option value="yes">Gabungkan spasi ganda</option><option value="no">Biarkan</option></select></label><label class="tool-field"><span class="tool-label">Opsi 2</span><select class="tool-select" id="space-empty"><option value="yes">Hapus baris kosong</option><option value="no">Biarkan</option></select></label><label class="tool-field full"><span class="tool-label">Hasil</span><textarea class="tool-textarea" id="space-output"></textarea></label></div><div class="action-row"><button class="button button-primary" id="space-run" type="button">Rapikan Teks</button><button class="button secondary-button" id="space-copy" type="button">Salin Hasil</button></div>`;
    document.querySelector("#space-run").addEventListener("click", () => {
      let text = document.querySelector("#space-input").value;
      text = text.split("\n").map((line) => line.trim()).join("\n");
      if (document.querySelector("#space-collapse").value === "yes") text = text.replace(/[ \t]+/g, " ");
      if (document.querySelector("#space-empty").value === "yes") text = text.split("\n").filter((line) => line.trim()).join("\n");
      document.querySelector("#space-output").value = text;
      setStatus("Teks berhasil dirapikan.");
    });
    document.querySelector("#space-copy").addEventListener("click", async () => {
      const value = document.querySelector("#space-output").value;
      if (!value) return setStatus("Belum ada hasil untuk disalin.", "warn");
      await navigator.clipboard.writeText(value);
      setStatus("Hasil berhasil disalin ke clipboard.");
    });
  }

  function renderCaseConverter() {
    ui.workspace.innerHTML = html`<label class="tool-field full"><span class="tool-label">Masukkan teks</span><textarea class="tool-textarea" id="case-input"></textarea></label><div class="tool-toolbar">${["uppercase", "lowercase", "title", "sentence", "camel", "snake", "kebab"].map((mode) => `<button class="button secondary-button" type="button" data-case="${mode}">${mode}</button>`).join("")}</div><label class="tool-field full"><span class="tool-label">Hasil</span><textarea class="tool-textarea" id="case-output"></textarea></label>`;
    const input = document.querySelector("#case-input");
    const output = document.querySelector("#case-output");
    document.querySelectorAll("[data-case]").forEach((button) => {
      button.addEventListener("click", () => {
        output.value = convertCase(input.value, button.dataset.case);
        setStatus(`Teks berhasil diubah ke mode ${button.dataset.case}.`);
      });
    });
  }

  function renderTextSorter() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid"><label class="tool-field full"><span class="tool-label">Masukkan daftar teks, satu item per baris</span><textarea class="tool-textarea" id="sort-input"></textarea></label><label class="tool-field"><span class="tool-label">Mode sortir</span><select class="tool-select" id="sort-mode"><option value="asc">A - Z</option><option value="desc">Z - A</option><option value="random">Acak</option></select></label><label class="tool-field"><span class="tool-label">Duplikat</span><select class="tool-select" id="sort-dedupe"><option value="no">Biarkan</option><option value="yes">Hapus duplikat</option></select></label><label class="tool-field full"><span class="tool-label">Hasil</span><textarea class="tool-textarea" id="sort-output"></textarea></label></div><div class="action-row"><button class="button button-primary" id="sort-run" type="button">Sort Teks</button></div>`;
    document.querySelector("#sort-run").addEventListener("click", () => {
      let lines = document.querySelector("#sort-input").value.split("\n").map((line) => line.trim()).filter(Boolean);
      if (document.querySelector("#sort-dedupe").value === "yes") lines = [...new Set(lines)];
      const mode = document.querySelector("#sort-mode").value;
      if (mode === "asc") lines.sort((a, b) => a.localeCompare(b));
      if (mode === "desc") lines.sort((a, b) => b.localeCompare(a));
      if (mode === "random") lines = lines.sort(() => Math.random() - 0.5);
      document.querySelector("#sort-output").value = lines.join("\n");
      setStatus("Teks berhasil diproses.");
    });
  }

  function renderJpgToPng() { renderSpecialConvertTool("image/png", "converted.png", "Unggah file JPG untuk diubah ke PNG."); }

  function renderPngToJpg() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid">${inputFileTemplate({ id: "png-jpg-file", listId: "png-jpg-list", label: "Pilih PNG", accept: ".png,image/png", note: "Area transparan akan diisi warna latar belakang." })}<label class="tool-field"><span class="tool-label">Warna latar</span><input class="tool-input" id="png-jpg-bg" type="color" value="#ffffff"></label><label class="tool-field"><span class="tool-label">Kualitas</span><input class="tool-input" id="png-jpg-quality" type="number" min="0.1" max="1" step="0.05" value="0.9"></label></div><div class="tool-preview" id="tool-preview"><p class="small-note">Preview hasil JPG akan muncul di sini.</p></div><div class="action-row"><button class="button button-primary" id="png-jpg-run" type="button">Konversi ke JPG</button></div>`;
    const input = document.querySelector("#png-jpg-file");
    const list = document.querySelector("#png-jpg-list");
    input.addEventListener("change", () => { list.innerHTML = `<strong>File siap diproses</strong>${fileChipList([...input.files])}`; });
    document.querySelector("#png-jpg-run").addEventListener("click", async () => {
      const file = input.files[0];
      if (!file) return setStatus("Pilih file PNG terlebih dahulu.", "warn");
      try {
        setStatus("Mengubah PNG ke JPG...");
        const image = await loadImageFromFile(file);
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const context = canvas.getContext("2d");
        context.fillStyle = document.querySelector("#png-jpg-bg").value;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0);
        showPreview(canvas);
        downloadBlob(await canvasToBlob(canvas, "image/jpeg", Number(document.querySelector("#png-jpg-quality").value)), "converted.jpg");
        setStatus("PNG berhasil diubah ke JPG.");
      } catch (error) { setStatus(error.message, "error"); }
    });
  }

  function renderPdfToWord() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid">${inputFileTemplate({ id: "pdf-word-file", listId: "pdf-word-list", label: "Pilih PDF", accept: ".pdf,application/pdf", note: "Tool ini lebih rapi untuk PDF berbasis teks digital dibanding PDF hasil scan gambar." })}</div><div class="tool-preview document-preview" id="tool-preview"><p class="small-note">Preview layout Word akan muncul di sini.</p></div><div class="action-row"><button class="button button-primary" id="pdf-word-run" type="button">Konversi ke DOC</button></div>`;
    const input = document.querySelector("#pdf-word-file");
    const list = document.querySelector("#pdf-word-list");
    input.addEventListener("change", () => { list.innerHTML = `<strong>File siap diproses</strong>${fileChipList([...input.files])}`; });
    document.querySelector("#pdf-word-run").addEventListener("click", async () => {
      const file = input.files[0];
      if (!file) return setStatus("Pilih file PDF terlebih dahulu.", "warn");
      try {
        setStatus("Mengubah PDF ke DOC...");
        const pages = await extractPdfStructured(file);
        const previewMarkup = pages.map((page, index) => `
          <section class="pdf-word-page">
            <div class="pdf-word-sheet" style="width:${page.width}px; min-height:${page.height}px;">
              ${page.lines.map((line) => `<p class="pdf-word-line" style="margin-left:${Math.max(0, line.left)}px; font-size:${Math.min(20, Math.max(11, line.fontSize))}px;">${escapeHtml(line.text)}</p>`).join("")}
            </div>
            <div class="pdf-word-page-label">Halaman ${index + 1}</div>
          </section>
        `).join("");
        showPreview(`<div id="pdf-word-render">${previewMarkup}</div>`);
        const htmlDoc = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>CoreChiper PDF to Word</title><style>
          body{font-family:Calibri,Arial,sans-serif;background:#fff;color:#111;margin:0;padding:24px;}
          .pdf-word-page{page-break-after:always;margin:0 0 24px;}
          .pdf-word-page:last-child{page-break-after:auto;}
          .pdf-word-sheet{background:#fff;border:1px solid #ddd;padding:28px 24px;box-sizing:border-box;}
          .pdf-word-line{margin-top:0;margin-bottom:0.45em;white-space:pre-wrap;line-height:1.3;}
          .pdf-word-page-label{font-size:12px;color:#666;text-align:center;margin-top:8px;}
        </style></head><body>${previewMarkup}</body></html>`;
        downloadBlob(new Blob([htmlDoc], { type: "application/msword" }), "corechiper.doc");
        setStatus("File DOC berhasil dibuat dengan layout yang lebih terjaga.");
      } catch (error) { setStatus(error.message, "error"); }
    });
  }

  function renderWordToPdf() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid">${inputFileTemplate({ id: "word-pdf-file", listId: "word-pdf-list", label: "Pilih DOCX atau TXT", accept: ".docx,.txt,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document", note: "Dokumen akan dipreview lalu diekspor dari preview tersebut agar hasil PDF tidak kosong." })}</div><div class="tool-preview document-preview" id="tool-preview"><p class="small-note">Preview dokumen akan muncul di sini.</p></div><div class="action-row"><button class="button button-primary" id="word-pdf-run" type="button">Konversi ke PDF</button></div>`;
    const input = document.querySelector("#word-pdf-file");
    const list = document.querySelector("#word-pdf-list");
    const buildDocumentMarkup = async (file) => {
      const documentData = await extractWordDocument(file);
      return {
        html: `<div class="document-preview-sheet">${documentData.html}</div>`,
        text: documentData.text,
      };
    };
    input.addEventListener("change", () => { list.innerHTML = `<strong>File siap diproses</strong>${fileChipList([...input.files])}`; });
    document.querySelector("#word-pdf-run").addEventListener("click", async () => {
      const file = input.files[0];
      if (!file) return setStatus("Pilih file DOCX atau TXT terlebih dahulu.", "warn");
      try {
        setStatus("Menyiapkan preview dokumen...");
        const documentData = await buildDocumentMarkup(file);
        showPreview(`<div id="word-pdf-render" class="document-preview-frame">${documentData.html}</div>`);
        if (!documentData.text.trim()) {
          return setStatus("Isi dokumen tidak terbaca untuk diekspor. Coba simpan ulang file sebagai DOCX standar atau TXT.", "warn");
        }
        if (documentData.rich) {
          let exportTarget = null;
          try {
            exportTarget = createExportStage(documentData.html, "document-export-sheet rich-export-sheet");
            setStatus("Membuat PDF dengan layout yang lebih mirip Word...");
            const html2pdf = await ensureLibrary("html2pdf");
            await new Promise((resolve) => setTimeout(resolve, 180));
            await html2pdf().set({
              margin: [8, 8, 8, 8],
              filename: "corechiper-word-to-pdf.pdf",
              image: { type: "jpeg", quality: 0.98 },
              html2canvas: {
                scale: 2,
                useCORS: true,
                backgroundColor: "#ffffff",
                windowWidth: 794,
                scrollX: 0,
                scrollY: 0,
              },
              jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
              pagebreak: { mode: ["css", "legacy"] },
            }).from(exportTarget).save();
            setStatus("Dokumen berhasil dikonversi ke PDF dengan format yang lebih mirip Word.");
          } catch (error) {
            setStatus("Mode layout penuh gagal, beralih ke mode teks aman...", "warn");
            await exportTextDocumentToPdf(documentData.text, "corechiper-word-to-pdf.pdf");
            setStatus("Dokumen berhasil dikonversi ke PDF lewat mode aman. Format bisa sedikit berbeda.");
          } finally {
            if (exportTarget) exportTarget.remove();
          }
        } else {
          setStatus("Membuat PDF dari isi dokumen...");
          await exportTextDocumentToPdf(documentData.text, "corechiper-word-to-pdf.pdf");
          setStatus("Dokumen berhasil dikonversi ke PDF dan tidak kosong.");
        }
      } catch (error) { setStatus(error.message, "error"); }
    });
  }

  function renderBmi() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid"><label class="tool-field"><span class="tool-label">Tinggi (cm)</span><input class="tool-input" id="bmi-height" type="number" min="50" max="260" value="170"></label><label class="tool-field"><span class="tool-label">Berat (kg)</span><input class="tool-input" id="bmi-weight" type="number" min="10" max="350" value="65"></label></div><div class="action-row"><button class="button button-primary" id="bmi-run" type="button">Hitung BMI</button></div><div class="result-card"><div class="metric-highlight" id="bmi-result">-</div><p id="bmi-category" class="small-note">Kategori akan muncul di sini.</p></div>`;
    document.querySelector("#bmi-run").addEventListener("click", () => {
      const height = Number(document.querySelector("#bmi-height").value) / 100;
      const weight = Number(document.querySelector("#bmi-weight").value);
      const bmi = weight / (height * height);
      let category = "Obesitas";
      if (bmi < 18.5) category = "Berat badan kurang";
      else if (bmi < 25) category = "Normal";
      else if (bmi < 30) category = "Kelebihan berat badan";
      document.querySelector("#bmi-result").textContent = bmi.toFixed(1);
      document.querySelector("#bmi-category").textContent = `Kategori: ${category}`;
      setStatus("BMI berhasil dihitung.");
    });
  }

  function renderDiscount() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid"><label class="tool-field"><span class="tool-label">Harga awal</span><input class="tool-input" id="discount-price" type="number" min="0" value="100000"></label><label class="tool-field"><span class="tool-label">Diskon (%)</span><input class="tool-input" id="discount-rate" type="number" min="0" max="100" value="20"></label><label class="tool-field"><span class="tool-label">Pajak (%)</span><input class="tool-input" id="discount-tax" type="number" min="0" max="100" value="0"></label></div><div class="action-row"><button class="button button-primary" id="discount-run" type="button">Hitung Harga Akhir</button></div><div class="stats-grid" id="discount-stats"></div>`;
    document.querySelector("#discount-run").addEventListener("click", () => {
      const price = Number(document.querySelector("#discount-price").value);
      const rate = Number(document.querySelector("#discount-rate").value) / 100;
      const tax = Number(document.querySelector("#discount-tax").value) / 100;
      const discountValue = price * rate;
      const afterDiscount = price - discountValue;
      const finalValue = afterDiscount + afterDiscount * tax;
      document.querySelector("#discount-stats").innerHTML = [["Potongan", `Rp ${formatNumber(discountValue)}`], ["Setelah Diskon", `Rp ${formatNumber(afterDiscount)}`], ["Harga Akhir", `Rp ${formatNumber(finalValue)}`]].map(([label, value]) => `<div class="stat-chip"><strong>${value}</strong><span>${label}</span></div>`).join("");
      setStatus("Harga akhir berhasil dihitung.");
    });
  }

  function renderPercentage() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid"><label class="tool-field full"><span class="tool-label">Mode hitung</span><select class="tool-select" id="percentage-mode"><option value="of">Berapa hasil X% dari Y</option><option value="change">Berapa persen perubahan dari A ke B</option><option value="portion">X adalah berapa persen dari Y</option></select></label><label class="tool-field"><span class="tool-label">Nilai A / X</span><input class="tool-input" id="percentage-a" type="number" value="25"></label><label class="tool-field"><span class="tool-label">Nilai B / Y</span><input class="tool-input" id="percentage-b" type="number" value="200"></label></div><div class="action-row"><button class="button button-primary" id="percentage-run" type="button">Hitung Persentase</button></div><div class="result-card"><div class="metric-highlight" id="percentage-result">-</div></div>`;
    document.querySelector("#percentage-run").addEventListener("click", () => {
      const mode = document.querySelector("#percentage-mode").value;
      const a = Number(document.querySelector("#percentage-a").value);
      const b = Number(document.querySelector("#percentage-b").value);
      let result = 0;
      if (mode === "of") result = (a / 100) * b;
      if (mode === "change") result = ((b - a) / a) * 100;
      if (mode === "portion") result = (a / b) * 100;
      document.querySelector("#percentage-result").textContent = mode === "of" ? formatNumber(result) : `${formatNumber(result)}%`;
      setStatus("Perhitungan persentase selesai.");
    });
  }

  function renderQrGenerator() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid"><label class="tool-field full"><span class="tool-label">Teks atau URL</span><textarea class="tool-textarea" id="qr-text">https://corechipertools.local</textarea></label><label class="tool-field"><span class="tool-label">Ukuran</span><input class="tool-input" id="qr-size" type="number" value="220" min="120" max="480"></label><label class="tool-field"><span class="tool-label">Warna</span><input class="tool-input" id="qr-color" type="color" value="#182433"></label></div><div class="tool-preview" id="tool-preview"><div class="qr-output"><p class="small-note">QR code akan muncul di sini.</p></div></div><div class="action-row"><button class="button button-primary" id="qr-run" type="button">Generate QR</button><button class="button secondary-button" id="qr-download" type="button">Unduh PNG</button></div>`;
    const render = async () => {
      const QRCode = await ensureLibrary("qrcode");
      const preview = document.querySelector("#tool-preview");
      preview.innerHTML = '<div id="qr-stage" class="qr-output"></div>';
      new QRCode(document.querySelector("#qr-stage"), { text: document.querySelector("#qr-text").value, width: Number(document.querySelector("#qr-size").value), height: Number(document.querySelector("#qr-size").value), colorDark: document.querySelector("#qr-color").value, colorLight: "#ffffff" });
    };
    document.querySelector("#qr-run").addEventListener("click", async () => { try { await render(); setStatus("QR code berhasil dibuat."); } catch (error) { setStatus(error.message, "error"); } });
    document.querySelector("#qr-download").addEventListener("click", async () => {
      const canvas = document.querySelector("#tool-preview canvas");
      if (!canvas) return setStatus("Generate QR code terlebih dahulu.", "warn");
      downloadBlob(await canvasToBlob(canvas, "image/png"), "corechiper-qr.png");
      setStatus("QR code berhasil diunduh.");
    });
    render();
  }

  function renderPasswordGenerator() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid"><label class="tool-field"><span class="tool-label">Panjang</span><input class="tool-input" id="pass-length" type="number" min="6" max="64" value="16"></label><label class="tool-field"><span class="tool-label">Huruf besar</span><select class="tool-select" id="pass-upper"><option value="yes">Ya</option><option value="no">Tidak</option></select></label><label class="tool-field"><span class="tool-label">Angka</span><select class="tool-select" id="pass-number"><option value="yes">Ya</option><option value="no">Tidak</option></select></label><label class="tool-field"><span class="tool-label">Simbol</span><select class="tool-select" id="pass-symbol"><option value="yes">Ya</option><option value="no">Tidak</option></select></label></div><div class="result-card"><div class="metric-highlight" id="pass-output">-</div><p id="pass-strength" class="small-note">Tekan generate untuk membuat password.</p></div><div class="action-row"><button class="button button-primary" id="pass-run" type="button">Generate Password</button><button class="button secondary-button" id="pass-copy" type="button">Salin</button></div>`;
    const generate = () => {
      const lower = "abcdefghijkmnopqrstuvwxyz";
      const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
      const numbers = "23456789";
      const symbols = "!@#$%^&*_-+=";
      let pool = lower;
      if (document.querySelector("#pass-upper").value === "yes") pool += upper;
      if (document.querySelector("#pass-number").value === "yes") pool += numbers;
      if (document.querySelector("#pass-symbol").value === "yes") pool += symbols;
      const length = Number(document.querySelector("#pass-length").value);
      let password = "";
      crypto.getRandomValues(new Uint32Array(length)).forEach((value) => { password += pool[value % pool.length]; });
      document.querySelector("#pass-output").textContent = password;
      document.querySelector("#pass-strength").textContent = `Kekuatan: ${length >= 16 && pool.length > 50 ? "Sangat kuat" : length >= 12 ? "Kuat" : "Cukup"}`;
      setStatus("Password berhasil dibuat.");
    };
    document.querySelector("#pass-run").addEventListener("click", generate);
    document.querySelector("#pass-copy").addEventListener("click", async () => {
      const text = document.querySelector("#pass-output").textContent;
      if (!text || text === "-") return setStatus("Generate password terlebih dahulu.", "warn");
      await navigator.clipboard.writeText(text);
      setStatus("Password berhasil disalin.");
    });
    generate();
  }

  function renderColorPicker() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid"><label class="tool-field"><span class="tool-label">Warna utama</span><input class="tool-input" id="color-main" type="color" value="#e6672e"></label><label class="tool-field"><span class="tool-label">Nilai HEX</span><input class="tool-input" id="color-hex" type="text" value="#e6672e"></label></div><div class="action-row"><button class="button button-primary" id="color-run" type="button">Generate Palette</button><button class="button secondary-button" id="color-eye" type="button">Ambil dari layar</button></div><div class="palette-grid" id="color-palette"></div>`;
    const renderPalette = (hex) => {
      const rgb = hexToRgb(hex);
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      const shades = [-24, -12, 0, 12, 24].map((offset) => hslToHex(hsl.h, hsl.s, Math.max(5, Math.min(95, hsl.l + offset))));
      document.querySelector("#color-palette").innerHTML = shades.map((color) => { const rgbValue = hexToRgb(color); return `<div class="palette-card"><div class="palette-swatch" style="background:${color}"></div><strong>${color}</strong><div>rgb(${rgbValue.r}, ${rgbValue.g}, ${rgbValue.b})</div></div>`; }).join("");
      setStatus("Palette warna berhasil dibuat.");
    };
    document.querySelector("#color-run").addEventListener("click", () => { const hex = document.querySelector("#color-hex").value.trim(); document.querySelector("#color-main").value = hex; renderPalette(hex); });
    document.querySelector("#color-main").addEventListener("input", (event) => { document.querySelector("#color-hex").value = event.target.value; renderPalette(event.target.value); });
    document.querySelector("#color-eye").addEventListener("click", async () => {
      if (!("EyeDropper" in window)) return setStatus("Browser ini belum mendukung EyeDropper API.", "warn");
      const result = await new window.EyeDropper().open();
      document.querySelector("#color-main").value = result.sRGBHex;
      document.querySelector("#color-hex").value = result.sRGBHex;
      renderPalette(result.sRGBHex);
    });
    renderPalette("#e6672e");
  }

  function renderCanvasImageTool(options) {
    ui.workspace.innerHTML = html`<div class="tool-form-grid">${inputFileTemplate({ id: "canvas-image-file", listId: "canvas-image-list", label: "Pilih file gambar", accept: "image/*", note: "Unggah gambar dari perangkat Anda." })}${options.extraFields || ""}</div><div class="tool-preview" id="tool-preview"><p class="small-note">Preview hasil akan tampil di sini.</p></div><div class="action-row"><button class="button button-primary" id="canvas-image-run" type="button">${options.buttonLabel}</button></div>`;
    const input = document.querySelector("#canvas-image-file");
    const list = document.querySelector("#canvas-image-list");
    input.addEventListener("change", async () => {
      list.innerHTML = `<strong>File siap diproses</strong>${fileChipList([...input.files])}`;
      const file = input.files[0];
      if (!file) return;
      const image = await loadImageFromFile(file);
      showPreview(image);
      if (typeof options.onLoaded === "function") options.onLoaded(image);
    });
    document.querySelector("#canvas-image-run").addEventListener("click", async () => {
      const file = input.files[0];
      if (!file) return setStatus("Pilih file gambar terlebih dahulu.", "warn");
      try {
        setStatus("Memproses gambar...");
        const image = await loadImageFromFile(file);
        const canvas = document.createElement("canvas");
        const result = await options.onRun({ image, canvas, file });
        showPreview(canvas);
        downloadBlob(result.blob, result.filename);
        setStatus("Gambar berhasil diproses.");
      } catch (error) { setStatus(error.message, "error"); }
    });
  }

  function renderSpecialConvertTool(format, filename, note) {
    ui.workspace.innerHTML = html`<div class="tool-form-grid">${inputFileTemplate({ id: "special-convert-file", listId: "special-convert-list", label: "Pilih gambar", accept: "image/jpeg,image/jpg,image/png", note })}</div><div class="tool-preview" id="tool-preview"><p class="small-note">Preview hasil akan tampil di sini.</p></div><div class="action-row"><button class="button button-primary" id="special-convert-run" type="button">Konversi</button></div>`;
    const input = document.querySelector("#special-convert-file");
    const list = document.querySelector("#special-convert-list");
    input.addEventListener("change", () => { list.innerHTML = `<strong>File siap diproses</strong>${fileChipList([...input.files])}`; });
    document.querySelector("#special-convert-run").addEventListener("click", async () => {
      const file = input.files[0];
      if (!file) return setStatus("Pilih file gambar terlebih dahulu.", "warn");
      try {
        setStatus("Mengonversi gambar...");
        const image = await loadImageFromFile(file);
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        canvas.getContext("2d").drawImage(image, 0, 0);
        showPreview(canvas);
        downloadBlob(await canvasToBlob(canvas, format, 0.92), filename);
        setStatus("Gambar berhasil dikonversi.");
      } catch (error) { setStatus(error.message, "error"); }
    });
  }

  function convertCase(value, mode) {
    const words = value.trim().split(/\s+/).filter(Boolean);
    if (mode === "uppercase") return value.toUpperCase();
    if (mode === "lowercase") return value.toLowerCase();
    if (mode === "title") return words.map((word) => word[0]?.toUpperCase() + word.slice(1).toLowerCase()).join(" ");
    if (mode === "sentence") return value.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, (match) => match.toUpperCase());
    if (mode === "camel") return words.map((word, index) => index === 0 ? word.toLowerCase() : word[0]?.toUpperCase() + word.slice(1).toLowerCase()).join("");
    if (mode === "snake") return words.map((word) => word.toLowerCase()).join("_");
    if (mode === "kebab") return words.map((word) => word.toLowerCase()).join("-");
    return value;
  }

  function hexToRgb(hex) {
    const clean = hex.replace("#", "");
    const value = clean.length === 3 ? clean.split("").map((ch) => ch + ch).join("") : clean;
    return { r: parseInt(value.slice(0, 2), 16), g: parseInt(value.slice(2, 4), 16), b: parseInt(value.slice(4, 6), 16) };
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0; let s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h /= 6;
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  function hslToHex(h, s, l) {
    s /= 100; l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0; let g = 0; let b = 0;
    if (h < 60) [r, g, b] = [c, x, 0];
    else if (h < 120) [r, g, b] = [x, c, 0];
    else if (h < 180) [r, g, b] = [0, c, x];
    else if (h < 240) [r, g, b] = [0, x, c];
    else if (h < 300) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];
    const toHex = (value) => Math.round((value + m) * 255).toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
})();
