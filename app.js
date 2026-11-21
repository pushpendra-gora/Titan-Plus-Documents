/**
 * DocVault - Premium Document Manager
 * Features:
 * - 100% Original Quality Storage in browser IndexedDB (Gigabyte capacity, completely local & offline)
 * - Exact visual reproduction of white card UI
 * - Native Web Share API (Triggers system app drawer on Android/iOS)
 * - Full High-Res Preview (PDF, Images, Text)
 * - Lossless Original Download
 */

const DB_NAME = 'DocVaultDB';
const DB_VERSION = 1;
const STORE_NAME = 'documents';

let db = null;
let currentPreviewDoc = null;
let currentShareDoc = null;

// DOM Elements
const docContainer = document.getElementById('documents-container');
const emptyState = document.getElementById('empty-state');
const fileInput = document.getElementById('file-upload-input');
const docCountText = document.getElementById('doc-count-text');
const toastEl = document.getElementById('toast');
const searchInput = document.getElementById('doc-search-input');
const searchClearBtn = document.getElementById('search-clear-btn');

// Modal Elements
const previewModal = document.getElementById('preview-modal');
const modalTitle = document.getElementById('modal-title');
const modalMeta = document.getElementById('modal-meta');
const modalBody = document.getElementById('modal-preview-body');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalDownloadBtn = document.getElementById('modal-download-btn');
const modalShareBtn = document.getElementById('modal-share-btn');

// Active Preview Controller
let currentPreviewType = null; // 'image', 'pdf', 'other'
let currentPreviewController = null;

// Share Fallback Elements
const shareFallbackModal = document.getElementById('share-fallback-modal');
const shareCloseBtn = document.getElementById('share-close-btn');
const shareFilename = document.getElementById('share-fallback-filename');
const shareWhatsAppBtn = document.getElementById('share-whatsapp-btn');
const shareEmailBtn = document.getElementById('share-email-btn');
const shareCopyBtn = document.getElementById('share-copy-btn');
const shareDirectDownloadBtn = document.getElementById('share-direct-download');

// Bottom Action Sheet Elements
const actionSheetModal = document.getElementById('action-sheet-modal');
const actionSheetThumb = document.getElementById('action-sheet-thumb');
const actionSheetTitle = document.getElementById('action-sheet-title');
const actionSheetMeta = document.getElementById('action-sheet-meta');
const actionSheetCloseBtn = document.getElementById('action-sheet-close-btn');
const asPreviewBtn = document.getElementById('as-preview-btn');
const asShareBtn = document.getElementById('as-share-btn');
const asDownloadBtn = document.getElementById('as-download-btn');
const asRenameBtn = document.getElementById('as-rename-btn');
const asDeleteBtn = document.getElementById('as-delete-btn');
let currentActionDoc = null;
let isPickerMode = false;

// Rename Modal Elements
const renameModal = document.getElementById('rename-modal');
const renameInput = document.getElementById('rename-input');
const renameCancelBtn = document.getElementById('rename-cancel-btn');
const renameSaveBtn = document.getElementById('rename-save-btn');
let currentRenameDoc = null;

// Header 3-Dots Settings & Menu Elements
const headerMenuBtn = document.getElementById('header-menu-btn');
const headerMenuModal = document.getElementById('header-menu-modal');
const headerMenuCloseBtn = document.getElementById('header-menu-close-btn');
const menuAppLockBtn = document.getElementById('menu-app-lock-btn');
const menuBackupZipBtn = document.getElementById('menu-backup-zip-btn');
const menuUploadDriveBtn = document.getElementById('menu-upload-drive-btn');
const appLockStatusBadge = document.getElementById('app-lock-status-badge');
const appLockStatusDesc = document.getElementById('app-lock-status-desc');
const menuAboutBtn = document.getElementById('menu-about-btn');

// About Modal Elements
const aboutModal = document.getElementById('about-modal');
const aboutCloseBtn = document.getElementById('about-close-btn');

// App Lock Screen Elements
const appLockScreen = document.getElementById('app-lock-screen');
const lockScreenPrompt = document.getElementById('lock-screen-prompt');
const lockPinDots = document.getElementById('lock-pin-dots');
const lockHiddenInput = document.getElementById('lock-hidden-input');

// PIN Setup Modal Elements
const pinSetupModal = document.getElementById('pin-setup-modal');
const pinSetupTitle = document.getElementById('pin-setup-title');
const pinSetupSubtitle = document.getElementById('pin-setup-subtitle');
const setupPinDots = document.getElementById('setup-pin-dots');
const setupPinHiddenInput = document.getElementById('setup-pin-hidden-input');
const pinSetupCancelBtn = document.getElementById('pin-setup-cancel-btn');

// PIN Disable Modal Elements
const pinDisableModal = document.getElementById('pin-disable-modal');
const disablePinDots = document.getElementById('disable-pin-dots');
const disablePinHiddenInput = document.getElementById('disable-pin-hidden-input');
const pinDisableCancelBtn = document.getElementById('pin-disable-cancel-btn');

// App Lock State Variables
const STORAGE_LOCK_ENABLED = 'titan_doc_app_lock_enabled';
const STORAGE_LOCK_PIN = 'titan_doc_app_lock_pin';

let currentEnteredPin = '';
let setupStep = 1; // 1: enter first time, 2: confirm
let setupFirstPin = '';
let disableEnteredPin = '';

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
  initAppLock();
  await initDatabase();
  await cleanOldSeedData();
  await renderDocuments();
  bindEventListeners();
  checkPickerMode();
});

function checkPickerMode() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('mode') === 'picker' || (window.TitanAndroid && window.TitanAndroid.isPickerMode && window.TitanAndroid.isPickerMode())) {
    enablePickerMode();
  }
}

window.enablePickerMode = function() {
  isPickerMode = true;
  const banner = document.getElementById('picker-mode-banner');
  if (banner) banner.classList.remove('hidden');
};

// Select and return document to the calling app
async function selectDocumentForCallingApp(doc) {
  if (window.TitanAndroid && window.TitanAndroid.returnPickedDocument) {
    showToast(`Selecting "${doc.name}"...`);
    const b64 = await blobToBase64(doc.blob);
    window.TitanAndroid.returnPickedDocument(b64, doc.name, doc.type || 'application/octet-stream');
    return;
  }
  showToast(`Selected "${doc.name}"`);
}

// Memory management for image thumbnail Object URLs
const activeThumbUrls = new Set();
function revokeActiveThumbUrls() {
  activeThumbUrls.forEach(url => {
    try { URL.revokeObjectURL(url); } catch (e) {}
  });
  activeThumbUrls.clear();
}

function base64ToBlob(base64Data, contentType) {
  const sliceSize = 1024;
  const byteCharacters = atob(base64Data);
  const byteArrays = [];
  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    byteArrays.push(new Uint8Array(byteNumbers));
  }
  return new Blob(byteArrays, { type: contentType || 'application/octet-stream' });
}

// Automatically import shared documents from other apps (WhatsApp, Chrome, etc.)
window.importExternalDocument = async function(filename, mimeType, base64Data) {
  try {
    const blob = base64ToBlob(base64Data, mimeType);

    const doc = {
      id: 'doc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
      name: filename,
      type: mimeType || getMimeTypeFromExt(filename),
      size: blob.size,
      formattedSize: formatFileSize(blob.size),
      displayDate: formatDate(Date.now()),
      timestamp: Date.now(),
      blob: blob
    };

    await saveDocumentToDB(doc);
    showToast(`✓ "${filename}" saved to Titan Documents!`);
    await renderDocuments();
  } catch (err) {
    console.error('Import error:', err);
    showToast('Import error: ' + err.message);
  }
};

// ----------------------------------------------------
// IndexedDB Management (Preserves 100% Original Blobs)
// ----------------------------------------------------
function initDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const dbInstance = event.target.result;
      if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
        const store = dbInstance.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('uploadDate', 'timestamp', { unique: false });
        store.createIndex('name', 'name', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };

    request.onerror = (event) => {
      console.error('IndexedDB open error:', event.target.error);
      showToast('Database error: ' + event.target.error.message);
      reject(event.target.error);
    };
  });
}

function getAllDocumentsFromDB() {
  return new Promise((resolve, reject) => {
    if (!db) return resolve([]);
    const tx = db.transaction([STORE_NAME], 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      // Sort newest first
      const docs = request.result.sort((a, b) => b.timestamp - a.timestamp);
      resolve(docs);
    };
    request.onerror = (e) => reject(e.target.error);
  });
}

function saveDocumentToDB(doc) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(doc);
    request.onsuccess = () => resolve(request.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

function deleteDocumentFromDB(id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = (e) => reject(e.target.error);
  });
}

// ----------------------------------------------------
// Clean any leftover demo seed data so storage is purely user documents
// ----------------------------------------------------
async function cleanOldSeedData() {
  const seedIds = ['doc-1', 'doc-2', 'doc-3', 'doc-4', 'doc-5', 'doc-6'];
  for (const id of seedIds) {
    try {
      await deleteDocumentFromDB(id);
    } catch (e) {
      // ignore
    }
  }
}

// ----------------------------------------------------
// UI Rendering
// ----------------------------------------------------
async function renderDocuments(filterQuery = '') {
  const docs = await getAllDocumentsFromDB();
  const query = filterQuery.trim().toLowerCase();
  
  const filteredDocs = query
    ? docs.filter(d => d.name.toLowerCase().includes(query))
    : docs;

  revokeActiveThumbUrls();
  docContainer.innerHTML = '';

  if (filteredDocs.length === 0) {
    emptyState.classList.remove('hidden');
    docCountText.textContent = query ? '0 matching documents' : '0 documents';
    return;
  }

  emptyState.classList.add('hidden');
  docCountText.textContent = `${docs.length} document${docs.length > 1 ? 's' : ''} stored`;

  filteredDocs.forEach(doc => {
    const card = createDocCardElement(doc);
    docContainer.appendChild(card);
  });
}

function createDocCardElement(doc) {
  const card = document.createElement('div');
  card.className = 'doc-card';
  card.dataset.id = doc.id;

  // Determine Icon Badge & Style
  const badgeInfo = getBadgeInfo(doc);

  // Thumbnail / Badge HTML
  let leftVisualHtml = '';
  if (badgeInfo.isImage && badgeInfo.thumbUrl) {
    leftVisualHtml = `<img class="doc-thumbnail" src="${badgeInfo.thumbUrl}" alt="${escapeHtml(doc.name)}" loading="lazy">`;
  } else {
    leftVisualHtml = `
      <div class="doc-icon-badge ${badgeInfo.colorClass}">
        <div class="badge-mini-fold"></div>
        ${badgeInfo.iconSvg}
        <span class="badge-ext-text">${badgeInfo.label}</span>
      </div>`;
  }

  card.innerHTML = `
    <!-- Icon or Real Photo Thumbnail -->
    <div class="doc-visual-wrap" style="flex-shrink: 0;">
      ${leftVisualHtml}
    </div>

    <!-- Title and Subtitle -->
    <div class="doc-info">
      <div class="doc-title" title="${escapeHtml(doc.name)}">${escapeHtml(doc.name)}</div>
      <div class="doc-subinfo">
        <span>${doc.formattedSize || formatFileSize(doc.size)}</span>
        <span class="bullet">•</span>
        <span>${doc.displayDate || formatDate(doc.timestamp)}</span>
      </div>
    </div>

    <!-- 3-Dots Action Menu Button (Clean mobile UI) -->
    <button class="doc-more-btn" data-id="${doc.id}" title="Options" aria-label="Document options">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="5" r="2.2"></circle>
        <circle cx="12" cy="12" r="2.2"></circle>
        <circle cx="12" cy="19" r="2.2"></circle>
      </svg>
    </button>
  `;

  // Tapping the document info or thumbnail opens Preview directly (or selects it if in picker mode)
  const docInfo = card.querySelector('.doc-info');
  const docVisual = card.querySelector('.doc-visual-wrap');
  
  const handleDocClick = () => {
    if (isPickerMode) {
      selectDocumentForCallingApp(doc);
    } else {
      openPreviewModal(doc);
    }
  };
  docInfo.addEventListener('click', handleDocClick);
  docVisual.addEventListener('click', handleDocClick);

  // Tapping 3-dots button opens the action sheet modal
  const moreBtn = card.querySelector('.doc-more-btn');
  moreBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openActionSheet(doc, badgeInfo);
  });

  return card;
}

// Icon Badge Styles & Real Image Thumbnail Generator
function getBadgeInfo(doc) {
  const ext = doc.name.split('.').pop().toLowerCase();
  const type = doc.type || '';

  // All image formats (Photos: JPG, JPEG, PNG, WEBP, GIF, SVG, BMP, HEIC, TIFF, etc.)
  const imageExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'bmp', 'heic', 'tiff', 'ico', 'avif'];
  if (imageExtensions.includes(ext) || type.startsWith('image/')) {
    let thumbUrl = '';
    try {
      thumbUrl = URL.createObjectURL(doc.blob);
      activeThumbUrls.add(thumbUrl);
    } catch (e) {
      thumbUrl = '';
    }
    return {
      isImage: true,
      thumbUrl: thumbUrl,
      colorClass: 'image-blue',
      label: ext.slice(0, 4).toUpperCase(),
      iconSvg: `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>`
    };
  }

  // PDF
  if (ext === 'pdf' || type.includes('pdf')) {
    return {
      isImage: false,
      colorClass: 'pdf',
      label: 'PDF',
      iconSvg: `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
        </svg>`
    };
  }

  // Presentations (PPTX, PPT, KEYNOTE, ODP)
  if (['pptx', 'ppt', 'pps', 'ppsx', 'odp'].includes(ext) || type.includes('presentation') || type.includes('powerpoint')) {
    return {
      isImage: false,
      colorClass: 'pptx',
      label: 'PPTX',
      iconSvg: `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>`
    };
  }

  // HTML / Web (HTML, HTM, MHTML, XHTML)
  if (['html', 'htm', 'xhtml', 'mhtml'].includes(ext) || type.includes('html')) {
    return {
      isImage: false,
      colorClass: 'html',
      label: 'HTML',
      iconSvg: `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="16 18 22 12 16 6"></polyline>
          <polyline points="8 6 2 12 8 18"></polyline>
        </svg>`
    };
  }

  // Word & Documents (DOC, DOCX, ODT, RTF)
  if (['doc', 'docx', 'odt', 'rtf'].includes(ext) || type.includes('word') || type.includes('document')) {
    return {
      isImage: false,
      colorClass: 'word',
      label: 'DOC',
      iconSvg: `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
        </svg>`
    };
  }

  // Excel & Spreadsheets (XLS, XLSX, CSV, ODS)
  if (['xls', 'xlsx', 'csv', 'ods', 'tsv'].includes(ext) || type.includes('sheet') || type.includes('excel')) {
    return {
      isImage: false,
      colorClass: 'excel',
      label: 'XLS',
      iconSvg: `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="3" y1="9" x2="21" y2="9"></line>
          <line x1="3" y1="15" x2="21" y2="15"></line>
          <line x1="9" y1="3" x2="9" y2="21"></line>
        </svg>`
    };
  }

  // Archives (ZIP, RAR, 7Z, TAR, GZ)
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext) || type.includes('zip') || type.includes('compressed')) {
    return {
      isImage: false,
      colorClass: 'archive',
      label: ext.slice(0, 4).toUpperCase(),
      iconSvg: `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="21 8 21 21 3 21 3 8"></polyline>
          <rect x="1" y="3" width="22" height="5"></rect>
          <line x1="10" y1="12" x2="14" y2="12"></line>
        </svg>`
    };
  }

  // Generic / Text / Other
  return {
    isImage: false,
    colorClass: 'generic',
    label: ext.slice(0, 4).toUpperCase() || 'FILE',
    iconSvg: `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
        <polyline points="13 2 13 9 20 9"></polyline>
      </svg>`
  };
}

// ----------------------------------------------------
// Action Sheet (3-Dots Menu)
// ----------------------------------------------------
function openActionSheet(doc, badgeInfo) {
  currentActionDoc = doc;
  actionSheetTitle.textContent = doc.name;
  actionSheetMeta.textContent = `${doc.formattedSize || formatFileSize(doc.size)} • ${doc.displayDate || formatDate(doc.timestamp)}`;

  actionSheetThumb.innerHTML = '';
  if (badgeInfo && badgeInfo.isImage && badgeInfo.thumbUrl) {
    const img = document.createElement('img');
    img.src = badgeInfo.thumbUrl;
    img.alt = doc.name;
    actionSheetThumb.appendChild(img);
  } else if (badgeInfo) {
    const badge = document.createElement('div');
    badge.className = `doc-icon-badge ${badgeInfo.colorClass}`;
    badge.style.width = '100%';
    badge.style.height = '100%';
    badge.style.borderRadius = '10px';
    badge.innerHTML = `<span class="badge-ext-text">${badgeInfo.label}</span>`;
    actionSheetThumb.appendChild(badge);
  }

  actionSheetModal.classList.remove('hidden');
}

function closeActionSheet() {
  actionSheetModal.classList.add('hidden');
  currentActionDoc = null;
}

// ----------------------------------------------------
// Rename Document Feature
// ----------------------------------------------------
function openRenameModal(doc) {
  currentRenameDoc = doc;
  renameInput.value = doc.name;
  renameModal.classList.remove('hidden');

  // Focus and select the filename part excluding the extension
  setTimeout(() => {
    renameInput.focus();
    const dotIndex = doc.name.lastIndexOf('.');
    if (dotIndex > 0) {
      renameInput.setSelectionRange(0, dotIndex);
    } else {
      renameInput.select();
    }
  }, 100);
}

function closeRenameModal() {
  renameModal.classList.add('hidden');
  currentRenameDoc = null;
}

async function saveRenameDocument() {
  if (!currentRenameDoc) return;

  const rawNewName = renameInput.value.trim().replace(/[\\/:*?"<>|]/g, '_');
  if (!rawNewName || rawNewName === '.') {
    showToast('Please enter a valid file name');
    renameInput.focus();
    return;
  }

  // Preserve original extension if user omitted it
  let finalName = rawNewName;
  const originalExt = currentRenameDoc.name.includes('.')
    ? '.' + currentRenameDoc.name.split('.').pop()
    : '';

  if (originalExt && !finalName.toLowerCase().endsWith(originalExt.toLowerCase()) && !finalName.includes('.')) {
    finalName += originalExt;
  }

  if (finalName === currentRenameDoc.name) {
    closeRenameModal();
    return;
  }

  try {
    currentRenameDoc.name = finalName;
    // Update MIME type if extension changed
    currentRenameDoc.type = getMimeTypeFromExt(finalName);

    await saveDocumentToDB(currentRenameDoc);
    showToast(`✓ Renamed to "${finalName}"`);
    closeRenameModal();
    await renderDocuments(searchInput.value);
  } catch (err) {
    console.error('Rename error:', err);
    showToast('Rename error: ' + err.message);
  }
}

// ----------------------------------------------------
// File Upload & Storage (100% Original Quality Blob)
// ----------------------------------------------------
async function handleFileUpload(files) {
  if (!files || files.length === 0) return;

  let addedCount = 0;
  for (const file of Array.from(files)) {
    // Read directly as Blob (zero compression, 100% loss-less original)
    const doc = {
      id: 'doc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
      name: file.name,
      type: file.type || getMimeTypeFromExt(file.name),
      size: file.size,
      formattedSize: formatFileSize(file.size),
      displayDate: formatDate(Date.now()),
      timestamp: Date.now(),
      blob: file // Store exact raw file object/blob into IndexedDB
    };

    await saveDocumentToDB(doc);
    addedCount++;
  }

  showToast(`✓ ${addedCount} document${addedCount > 1 ? 's' : ''} stored safely in original quality!`);
  await renderDocuments();
  fileInput.value = ''; // Reset input
}

// ----------------------------------------------------
// Preview Modal Handling
// ----------------------------------------------------
async function openPreviewModal(doc) {
  currentPreviewDoc = doc;
  modalTitle.textContent = doc.name;
  modalMeta.textContent = `${doc.formattedSize || formatFileSize(doc.size)} • ${doc.displayDate || formatDate(doc.timestamp)}`;
  modalBody.innerHTML = '';

  const ext = doc.name.split('.').pop().toLowerCase();
  const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'bmp', 'heic', 'tiff', 'ico', 'avif'].includes(ext) || (doc.type && doc.type.startsWith('image/'));
  const isPdf = ext === 'pdf' || (doc.type && doc.type.includes('pdf'));
  const isHtml = ['html', 'htm', 'xhtml'].includes(ext) || (doc.type && doc.type.includes('html'));
  const isText = ['txt', 'json', 'js', 'css', 'md', 'xml', 'log', 'csv'].includes(ext) || (doc.type && doc.type.startsWith('text/'));
  const isPptx = ['pptx', 'ppt', 'pps', 'ppsx', 'odp'].includes(ext);

  if (isImage) {
    currentPreviewType = 'image';

    const wrapper = document.createElement('div');
    wrapper.className = 'preview-image-wrapper';

    const imgUrl = URL.createObjectURL(doc.blob);
    const img = document.createElement('img');
    img.src = imgUrl;
    img.className = 'preview-image';
    img.alt = doc.name;
    img.onload = () => {
      URL.revokeObjectURL(imgUrl);
      currentPreviewController = setupPinchToZoom(wrapper, img);
    };

    wrapper.appendChild(img);
    modalBody.appendChild(wrapper);
  } else if (isPdf) {
    currentPreviewType = 'pdf';
    // 100% Offline Canvas PDF rendering for Android WebView & Mobile with 2-finger pinch-zoom
    await renderPdfDocument(doc, modalBody);
  } else if (isHtml) {
    currentPreviewType = 'other';
    // HTML File live preview
    const htmlUrl = URL.createObjectURL(doc.blob);
    const iframe = document.createElement('iframe');
    iframe.src = htmlUrl;
    iframe.className = 'preview-pdf-frame';
    iframe.title = doc.name;
    modalBody.appendChild(iframe);
  } else if (isText) {
    currentPreviewType = 'other';
    try {
      const text = await doc.blob.text();
      const pre = document.createElement('pre');
      pre.style.cssText = 'background: #ffffff; padding: 16px; border-radius: 12px; max-height: 60vh; overflow: auto; width: 100%; font-size: 13px; font-family: monospace; white-space: pre-wrap; line-height: 1.5; border: 1px solid #e2e8f0;';
      pre.textContent = text.slice(0, 50000); // Up to 50k chars
      modalBody.appendChild(pre);
    } catch (e) {
      renderUnsupportedCard(doc);
    }
  } else if (isPptx) {
    currentPreviewType = 'other';
    // PPTX Presentation Card
    const pptBox = document.createElement('div');
    pptBox.className = 'preview-unsupported-box';
    pptBox.innerHTML = `
      <div style="width: 60px; height: 60px; border-radius: 16px; background: linear-gradient(135deg, #ea580c, #c2410c); display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; color: white;">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>
      </div>
      <h4>${escapeHtml(doc.name)}</h4>
      <p style="color: #64748b; font-size: 13px; margin-bottom: 18px;">PowerPoint Presentation stored in 100% original quality. Click below to share or open with Office/PowerPoint app.</p>
      <div style="display: flex; gap: 10px; justify-content: center;">
        <button class="preview-dl-btn" id="modal-ppt-share" style="background: #ea580c;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
          Share PPTX
        </button>
        <button class="preview-dl-btn" id="modal-ppt-dl">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Download
        </button>
      </div>
    `;
    modalBody.appendChild(pptBox);
    pptBox.querySelector('#modal-ppt-share').onclick = () => handleShare(doc);
    pptBox.querySelector('#modal-ppt-dl').onclick = () => downloadOriginalDocument(doc);
  } else {
    currentPreviewType = 'other';
    renderUnsupportedCard(doc);
  }

  previewModal.classList.remove('hidden');
}

// ----------------------------------------------------
// Native Gesture-Based Pinch-to-Zoom & Pan Controller
// (Supports 2-finger pinch, 1-finger pan, double-tap zoom & desktop wheel)
// ----------------------------------------------------
function setupPinchToZoom(container, target) {
  if (!container || !target) return { reset: () => {} };

  let scale = 1;
  let panX = 0;
  let panY = 0;

  // Touch state
  let initialDist = 0;
  let initialScale = 1;
  let isPinching = false;
  let isPanning = false;
  let startX = 0;
  let startY = 0;
  let lastTapTime = 0;

  // Desktop mouse drag state
  let isMouseDown = false;
  let mouseStartX = 0;
  let mouseStartY = 0;

  function updateTransform(animate = false) {
    if (animate) {
      target.style.transition = 'transform 0.22s cubic-bezier(0.2, 0, 0, 1)';
    } else {
      target.style.transition = 'none';
    }
    target.style.transform = `translate3d(${panX}px, ${panY}px, 0) scale(${scale})`;
  }

  function clampPan() {
    if (scale <= 1) {
      panX = 0;
      panY = 0;
      return;
    }
    const rect = target.getBoundingClientRect();
    const parentRect = container.getBoundingClientRect();

    const maxPanX = Math.max(0, (rect.width - parentRect.width) / 2 + 40);
    const maxPanY = Math.max(0, (rect.height - parentRect.height) / 2 + 40);

    panX = Math.min(Math.max(panX, -maxPanX), maxPanX);
    panY = Math.min(Math.max(panY, -maxPanY), maxPanY);
  }

  // Touch Start
  container.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      // 2 fingers: Pinch to zoom
      isPinching = true;
      isPanning = false;
      initialDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      initialScale = scale;
      target.style.transition = 'none';
    } else if (e.touches.length === 1) {
      // Double tap check
      const now = Date.now();
      if (now - lastTapTime < 320) {
        if (scale > 1.2) {
          scale = 1;
          panX = 0;
          panY = 0;
        } else {
          scale = 2.4;
          const rect = container.getBoundingClientRect();
          const touchX = e.touches[0].clientX - (rect.left + rect.width / 2);
          const touchY = e.touches[0].clientY - (rect.top + rect.height / 2);
          panX = -touchX * 1.1;
          panY = -touchY * 1.1;
          clampPan();
        }
        updateTransform(true);
        lastTapTime = 0;
        return;
      }
      lastTapTime = now;

      // 1 Finger Pan if zoomed in
      if (scale > 1.05) {
        isPanning = true;
        startX = e.touches[0].clientX - panX;
        startY = e.touches[0].clientY - panY;
        target.style.transition = 'none';
      }
    }
  }, { passive: false });

  // Touch Move
  container.addEventListener('touchmove', (e) => {
    if (isPinching && e.touches.length === 2) {
      e.preventDefault();
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (initialDist > 0) {
        const factor = currentDist / initialDist;
        scale = Math.min(Math.max(initialScale * factor, 0.8), 4.5);
        clampPan();
        updateTransform(false);
      }
    } else if (isPanning && e.touches.length === 1 && scale > 1.05) {
      e.preventDefault();
      panX = e.touches[0].clientX - startX;
      panY = e.touches[0].clientY - startY;
      clampPan();
      updateTransform(false);
    }
  }, { passive: false });

  // Touch End
  container.addEventListener('touchend', (e) => {
    if (e.touches.length < 2) {
      isPinching = false;
    }
    if (e.touches.length === 1 && scale > 1.05) {
      // Seamlessly transition from 2-finger pinch to 1-finger pan without lifting all fingers
      isPanning = true;
      startX = e.touches[0].clientX - panX;
      startY = e.touches[0].clientY - panY;
    } else if (e.touches.length === 0) {
      isPanning = false;
      if (scale < 1.05) {
        scale = 1;
        panX = 0;
        panY = 0;
      } else {
        clampPan();
      }
      updateTransform(true);
    }
  });

  // Desktop Mouse Wheel / Trackpad Pinch
  container.addEventListener('wheel', (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 0.85;
    scale = Math.min(Math.max(scale * factor, 1), 4.5);
    if (scale <= 1.05) {
      scale = 1;
      panX = 0;
      panY = 0;
    } else {
      clampPan();
    }
    updateTransform(true);
  }, { passive: false });

  // Desktop Mouse Drag
  container.addEventListener('mousedown', (e) => {
    if (scale > 1.05) {
      isMouseDown = true;
      mouseStartX = e.clientX - panX;
      mouseStartY = e.clientY - panY;
      target.style.transition = 'none';
      container.style.cursor = 'grabbing';
    }
  });

  window.addEventListener('mousemove', (e) => {
    if (isMouseDown && scale > 1.05) {
      panX = e.clientX - mouseStartX;
      panY = e.clientY - mouseStartY;
      clampPan();
      updateTransform(false);
    }
  });

  window.addEventListener('mouseup', () => {
    if (isMouseDown) {
      isMouseDown = false;
      container.style.cursor = 'grab';
      clampPan();
      updateTransform(true);
    }
  });

  // Desktop Double Click
  container.addEventListener('dblclick', () => {
    if (scale > 1.2) {
      scale = 1;
      panX = 0;
      panY = 0;
    } else {
      scale = 2.4;
      panX = 0;
      panY = 0;
    }
    updateTransform(true);
  });

  return {
    reset: () => {
      scale = 1;
      panX = 0;
      panY = 0;
      updateTransform(true);
    }
  };
}

function closePreviewModal() {
  previewModal.classList.add('hidden');
  modalBody.innerHTML = '';
  currentPreviewDoc = null;
  currentPreviewType = null;
  if (currentPreviewController && currentPreviewController.reset) {
    currentPreviewController.reset();
  }
  currentPreviewController = null;
}

function renderUnsupportedCard(doc) {
  const unsupportedBox = document.createElement('div');
  unsupportedBox.className = 'preview-unsupported-box';
  unsupportedBox.innerHTML = `
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="1.8">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
    </svg>
    <h4>${escapeHtml(doc.name)}</h4>
    <p>Original high-quality file is safely stored. Click below to download or share with your apps.</p>
    <button class="preview-dl-btn" id="modal-body-download">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
      Download Original File
    </button>
  `;
  modalBody.appendChild(unsupportedBox);
  unsupportedBox.querySelector('#modal-body-download').onclick = () => downloadOriginalDocument(doc);
}

// ----------------------------------------------------
// Robust Canvas PDF Renderer (Works 100% on Android WebView)
// ----------------------------------------------------
async function renderPdfDocument(doc, container) {
  container.innerHTML = `
    <div class="pdf-loading-spinner">
      <div class="pdf-spinner"></div>
      <span>Loading PDF preview...</span>
    </div>
  `;

  if (!window.pdfjsLib) {
    // If PDF.js library isn't loaded for some reason, provide fallback
    renderPdfFallback(doc, container);
    return;
  }

  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdf.worker.min.js';
    const arrayBuffer = await doc.blob.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDoc = await loadingTask.promise;
    const totalPages = pdfDoc.numPages;
    let currentPageNum = 1;

    container.innerHTML = `
      <div class="pdf-viewer-wrap">
        <div class="pdf-toolbar">
          <button id="pdf-prev-btn" class="pdf-nav-btn" ${totalPages <= 1 ? 'disabled' : ''}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
            Prev
          </button>
          <span id="pdf-page-num" class="pdf-page-indicator">Page 1 of ${totalPages}</span>
          <button id="pdf-next-btn" class="pdf-nav-btn" ${totalPages <= 1 ? 'disabled' : ''}>
            Next
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
        <div class="pdf-canvas-container" id="pdf-canvas-container">
          <canvas id="pdf-page-canvas" class="pdf-page-canvas"></canvas>
        </div>
      </div>
    `;

    const canvas = container.querySelector('#pdf-page-canvas');
    const ctx = canvas.getContext('2d');
    const pageNumText = container.querySelector('#pdf-page-num');
    const prevBtn = container.querySelector('#pdf-prev-btn');
    const nextBtn = container.querySelector('#pdf-next-btn');
    const canvasContainer = container.querySelector('#pdf-canvas-container');

    // Attach native 2-finger pinch-zoom & 1-finger pan to PDF canvas
    const pdfPinchController = setupPinchToZoom(canvasContainer, canvas);
    currentPreviewController = pdfPinchController;
    let currentRenderTask = null;

    async function renderPage(num) {
      if (currentRenderTask) {
        try {
          currentRenderTask.cancel();
        } catch (ignored) {}
      }

      try {
        const page = await pdfDoc.getPage(num);
        // Base scale 2.0 provides ultra-sharp, high-DPI text resolution when pinching to zoom
        const viewport = page.getViewport({ scale: 2.0 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport
        };
        currentRenderTask = page.render(renderContext);
        await currentRenderTask.promise;
        currentRenderTask = null;

        pageNumText.textContent = `Page ${num} of ${totalPages}`;
        prevBtn.disabled = num <= 1;
        nextBtn.disabled = num >= totalPages;

        if (pdfPinchController && pdfPinchController.reset) {
          pdfPinchController.reset();
        }
      } catch (e) {
        if (e && e.name === 'RenderingCancelledException') {
          return; // Expected cancellation on rapid page flips
        }
        console.error('Page render error:', e);
      }
    }

    await renderPage(1);

    prevBtn.addEventListener('click', () => {
      if (currentPageNum > 1) {
        currentPageNum--;
        renderPage(currentPageNum);
      }
    });

    nextBtn.addEventListener('click', () => {
      if (currentPageNum < totalPages) {
        currentPageNum++;
        renderPage(currentPageNum);
      }
    });
  } catch (err) {
    console.error('PDF.js render error:', err);
    renderPdfFallback(doc, container);
  }
}

function renderPdfFallback(doc, container) {
  container.innerHTML = `
    <div class="preview-unsupported-box">
      <div style="width: 56px; height: 56px; border-radius: 16px; background: #fee2e2; color: #dc2626; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px;">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
      </div>
      <h4>${escapeHtml(doc.name)}</h4>
      <p style="color: #64748b; font-size: 13px; margin-bottom: 16px;">This PDF is securely stored in original quality. Tap below to open in your phone's external PDF app or download.</p>
      <div style="display: flex; gap: 10px; justify-content: center;">
        <button class="preview-dl-btn" id="modal-fallback-share" style="background: #dc2626;">
          Open in Phone PDF App
        </button>
        <button class="preview-dl-btn" id="modal-fallback-dl">
          Download
        </button>
      </div>
    </div>
  `;
  container.querySelector('#modal-fallback-share').onclick = () => handleShare(doc);
  container.querySelector('#modal-fallback-dl').onclick = () => downloadOriginalDocument(doc);
}

// ----------------------------------------------------
// Download in 100% Original Quality
// ----------------------------------------------------
async function downloadOriginalDocument(doc) {
  // Check if running inside Titan Android Native App
  if (window.TitanAndroid && window.TitanAndroid.saveToDownloads) {
    try {
      const b64 = await blobToBase64(doc.blob);
      window.TitanAndroid.saveToDownloads(b64, doc.name, doc.type || 'application/octet-stream');
      return;
    } catch (err) {
      console.warn('Native Android save fallback:', err);
    }
  }

  try {
    const blob = doc.blob;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    showToast(`Downloading "${doc.name}" in Original Quality...`);
  } catch (err) {
    console.error('Download error:', err);
    showToast('Download error: ' + err.message);
  }
}

// ----------------------------------------------------
// Share Action (Web Share API for all apps / Fallback Sheet)
// ----------------------------------------------------
async function handleShare(doc) {
  currentShareDoc = doc;

  // Check if running inside Titan Android Native App
  if (window.TitanAndroid && window.TitanAndroid.shareDocument) {
    try {
      const b64 = await blobToBase64(doc.blob);
      window.TitanAndroid.shareDocument(b64, doc.name, doc.type || 'application/octet-stream');
      return;
    } catch (err) {
      console.warn('Native Android share fallback:', err);
    }
  }

  // Convert blob to File object for native file sharing
  const file = new File([doc.blob], doc.name, {
    type: doc.type || 'application/octet-stream',
    lastModified: doc.timestamp || Date.now()
  });

  // Check if browser supports sharing files natively
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: doc.name,
        text: `Document: ${doc.name}`
      });
      showToast(`Shared "${doc.name}" successfully!`);
      return;
    } catch (err) {
      if (err.name === 'AbortError') {
        // User cancelled share sheet, no error needed
        return;
      }
      console.warn('Native file share failed, falling back:', err);
    }
  }

  // Check if navigator.share works without files
  if (navigator.share) {
    try {
      await navigator.share({
        title: doc.name,
        text: `Document: ${doc.name} (${doc.formattedSize || formatFileSize(doc.size)})`
      });
      return;
    } catch (err) {
      if (err.name === 'AbortError') return;
    }
  }

  // Fallback modal for desktop or unsupported browsers
  openShareFallback(doc);
}

function openShareFallback(doc) {
  currentShareDoc = doc;
  shareFilename.textContent = doc.name;
  shareFallbackModal.classList.remove('hidden');
}

function closeShareFallback() {
  shareFallbackModal.classList.add('hidden');
  currentShareDoc = null;
}

// ----------------------------------------------------
// Delete Document
// ----------------------------------------------------
async function confirmDeleteDocument(doc) {
  const confirmed = window.confirm(`Kya aap "${doc.name}" ko delete karna chahte hain?`);
  if (!confirmed) return;

  await deleteDocumentFromDB(doc.id);
  showToast(`Document "${doc.name}" deleted.`);
  await renderDocuments(searchInput.value);
}

// ----------------------------------------------------
// Event Listeners & Helpers
// ----------------------------------------------------
function bindEventListeners() {
  // File upload input
  fileInput.addEventListener('change', (e) => {
    handleFileUpload(e.target.files);
  });

  // Clicking empty state triggers upload
  if (emptyState) {
    emptyState.addEventListener('click', () => fileInput.click());
  }

  // Drag and drop upload support
  window.addEventListener('dragover', (e) => e.preventDefault());
  window.addEventListener('drop', (e) => {
    e.preventDefault();
    if (e.dataTransfer && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  });

  // Search input filter
  searchInput.addEventListener('input', (e) => {
    const val = e.target.value;
    searchClearBtn.style.display = val ? 'flex' : 'none';
    renderDocuments(val);
  });

  searchClearBtn.style.display = 'none';
  searchClearBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchClearBtn.style.display = 'none';
    renderDocuments('');
    searchInput.focus();
  });

  // Modal Buttons
  modalCloseBtn.addEventListener('click', closePreviewModal);
  previewModal.addEventListener('click', (e) => {
    if (e.target === previewModal) closePreviewModal();
  });

  modalDownloadBtn.addEventListener('click', () => {
    if (currentPreviewDoc) downloadOriginalDocument(currentPreviewDoc);
  });

  modalShareBtn.addEventListener('click', () => {
    if (currentPreviewDoc) handleShare(currentPreviewDoc);
  });

  // Share Fallback Buttons
  shareCloseBtn.addEventListener('click', closeShareFallback);
  shareFallbackModal.addEventListener('click', (e) => {
    if (e.target === shareFallbackModal) closeShareFallback();
  });

  shareWhatsAppBtn.addEventListener('click', () => {
    if (!currentShareDoc) return;
    const text = encodeURIComponent(`Document: ${currentShareDoc.name} (${currentShareDoc.formattedSize})`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    closeShareFallback();
  });

  shareEmailBtn.addEventListener('click', () => {
    if (!currentShareDoc) return;
    const subject = encodeURIComponent(`Document: ${currentShareDoc.name}`);
    const body = encodeURIComponent(`Here is the document: ${currentShareDoc.name}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    closeShareFallback();
  });

  shareCopyBtn.addEventListener('click', async () => {
    if (!currentShareDoc) return;
    try {
      await navigator.clipboard.writeText(currentShareDoc.name);
      showToast('Document name copied to clipboard!');
    } catch {
      showToast('Copy not supported.');
    }
    closeShareFallback();
  });

  shareDirectDownloadBtn.addEventListener('click', () => {
    if (currentShareDoc) {
      downloadOriginalDocument(currentShareDoc);
      closeShareFallback();
    }
  });

  // Action Sheet (3-Dots Menu) Listeners
  if (actionSheetCloseBtn) {
    actionSheetCloseBtn.addEventListener('click', closeActionSheet);
  }
  if (actionSheetModal) {
    actionSheetModal.addEventListener('click', (e) => {
      if (e.target === actionSheetModal) closeActionSheet();
    });
  }
  if (asPreviewBtn) {
    asPreviewBtn.addEventListener('click', () => {
      const doc = currentActionDoc;
      closeActionSheet();
      if (doc) openPreviewModal(doc);
    });
  }
  if (asShareBtn) {
    asShareBtn.addEventListener('click', () => {
      const doc = currentActionDoc;
      closeActionSheet();
      if (doc) handleShare(doc);
    });
  }
  if (asDownloadBtn) {
    asDownloadBtn.addEventListener('click', () => {
      const doc = currentActionDoc;
      closeActionSheet();
      if (doc) downloadOriginalDocument(doc);
    });
  }
  if (asRenameBtn) {
    asRenameBtn.addEventListener('click', () => {
      const doc = currentActionDoc;
      closeActionSheet();
      if (doc) openRenameModal(doc);
    });
  }
  if (asDeleteBtn) {
    asDeleteBtn.addEventListener('click', () => {
      const doc = currentActionDoc;
      closeActionSheet();
      if (doc) confirmDeleteDocument(doc);
    });
  }

  // Rename Modal Listeners
  if (renameCancelBtn) {
    renameCancelBtn.addEventListener('click', closeRenameModal);
  }
  if (renameSaveBtn) {
    renameSaveBtn.addEventListener('click', saveRenameDocument);
  }
  if (renameInput) {
    renameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveRenameDocument();
      }
    });
  }
  if (renameModal) {
    renameModal.addEventListener('click', (e) => {
      if (e.target === renameModal) closeRenameModal();
    });
  }

  // Header 3-Dots Settings & Menu Listeners
  if (headerMenuBtn) {
    headerMenuBtn.addEventListener('click', openHeaderMenu);
  }
  if (headerMenuCloseBtn) {
    headerMenuCloseBtn.addEventListener('click', closeHeaderMenu);
  }
  if (headerMenuModal) {
    headerMenuModal.addEventListener('click', (e) => {
      if (e.target === headerMenuModal) closeHeaderMenu();
    });
  }
  if (menuAppLockBtn) {
    menuAppLockBtn.addEventListener('click', () => {
      closeHeaderMenu();
      if (isAppLockEnabled()) {
        openPinDisableModal();
      } else {
        openPinSetupModal();
      }
    });
  }
  if (menuBackupZipBtn) {
    menuBackupZipBtn.addEventListener('click', () => {
      closeHeaderMenu();
      backupAllFilesIntoZip();
    });
  }
  if (menuUploadDriveBtn) {
    menuUploadDriveBtn.addEventListener('click', () => {
      closeHeaderMenu();
      uploadAllFilesToGoogleDrive();
    });
  }
  if (menuAboutBtn) {
    menuAboutBtn.addEventListener('click', () => {
      closeHeaderMenu();
      openAboutModal();
    });
  }

  // About Modal Listeners
  if (aboutCloseBtn) {
    aboutCloseBtn.addEventListener('click', closeAboutModal);
  }
  if (aboutModal) {
    aboutModal.addEventListener('click', (e) => {
      if (e.target === aboutModal) closeAboutModal();
    });
  }

  // PIN Setup Modal Listeners
  if (pinSetupCancelBtn) {
    pinSetupCancelBtn.addEventListener('click', closePinSetupModal);
  }
  if (pinSetupModal) {
    pinSetupModal.addEventListener('click', (e) => {
      if (e.target === pinSetupModal) closePinSetupModal();
    });
  }

  // PIN Disable Modal Listeners
  if (pinDisableCancelBtn) {
    pinDisableCancelBtn.addEventListener('click', closePinDisableModal);
  }
  if (pinDisableModal) {
    pinDisableModal.addEventListener('click', (e) => {
      if (e.target === pinDisableModal) closePinDisableModal();
    });
  }

  // Keypad Clicks for Lock Screen
  document.querySelectorAll('.lock-key').forEach(btn => {
    btn.addEventListener('click', () => {
      handleLockKeypress(btn.dataset.key);
    });
  });

  // Keypad Clicks for Setup PIN
  document.querySelectorAll('.setup-key').forEach(btn => {
    btn.addEventListener('click', () => {
      handleSetupKeypress(btn.dataset.key);
    });
  });

  // Keypad Clicks for Disable PIN
  document.querySelectorAll('.disable-key').forEach(btn => {
    btn.addEventListener('click', () => {
      handleDisableKeypress(btn.dataset.key);
    });
  });

  // Keyboard support for all PIN screens and shortcuts
  window.addEventListener('keydown', (e) => {
    // If Lock Screen is active
    if (appLockScreen && !appLockScreen.classList.contains('hidden')) {
      if (e.key >= '0' && e.key <= '9') {
        handleLockKeypress(e.key);
      } else if (e.key === 'Backspace') {
        handleLockKeypress('backspace');
      }
      return;
    }

    // If Setup PIN modal is active
    if (pinSetupModal && !pinSetupModal.classList.contains('hidden')) {
      if (e.key >= '0' && e.key <= '9') {
        handleSetupKeypress(e.key);
      } else if (e.key === 'Backspace') {
        handleSetupKeypress('backspace');
      } else if (e.key === 'Escape') {
        closePinSetupModal();
      }
      return;
    }

    // If Disable PIN modal is active
    if (pinDisableModal && !pinDisableModal.classList.contains('hidden')) {
      if (e.key >= '0' && e.key <= '9') {
        handleDisableKeypress(e.key);
      } else if (e.key === 'Backspace') {
        handleDisableKeypress('backspace');
      } else if (e.key === 'Escape') {
        closePinDisableModal();
      }
      return;
    }

    if (e.key === 'Escape') {
      closePreviewModal();
      closeShareFallback();
      closeActionSheet();
      closeRenameModal();
      closeHeaderMenu();
      closeAboutModal();
    }
  });
}

// ----------------------------------------------------
// App Lock & Settings Menu Functions
// ----------------------------------------------------
function isAppLockEnabled() {
  return localStorage.getItem(STORAGE_LOCK_ENABLED) === 'true' && Boolean(localStorage.getItem(STORAGE_LOCK_PIN));
}

function updateAppLockMenuUI() {
  const enabled = isAppLockEnabled();
  if (appLockStatusBadge) {
    if (enabled) {
      appLockStatusBadge.textContent = 'Enabled';
      appLockStatusBadge.className = 'badge-lock-enabled';
      if (appLockStatusDesc) appLockStatusDesc.textContent = 'Tap to disable or change PIN';
    } else {
      appLockStatusBadge.textContent = 'Disabled';
      appLockStatusBadge.className = 'badge-lock-disabled';
      if (appLockStatusDesc) appLockStatusDesc.textContent = 'Require 4-digit PIN to open app';
    }
  }
}

function initAppLock() {
  updateAppLockMenuUI();
  if (isAppLockEnabled()) {
    showAppLockScreen();
  }
}

function showAppLockScreen() {
  currentEnteredPin = '';
  updatePinDots(lockPinDots, 0);
  if (appLockScreen) appLockScreen.classList.remove('hidden');
}

function hideAppLockScreen() {
  if (appLockScreen) appLockScreen.classList.add('hidden');
  currentEnteredPin = '';
}

function updatePinDots(container, count) {
  if (!container) return;
  const dots = container.querySelectorAll('.pin-dot');
  dots.forEach((dot, index) => {
    if (index < count) {
      dot.classList.add('filled');
    } else {
      dot.classList.remove('filled');
    }
  });
}

function handleLockKeypress(key) {
  if (key === 'backspace') {
    if (currentEnteredPin.length > 0) {
      currentEnteredPin = currentEnteredPin.slice(0, -1);
      updatePinDots(lockPinDots, currentEnteredPin.length);
    }
    return;
  }

  if (currentEnteredPin.length < 4 && /^[0-9]$/.test(key)) {
    currentEnteredPin += key;
    updatePinDots(lockPinDots, currentEnteredPin.length);

    if (currentEnteredPin.length === 4) {
      const storedPin = localStorage.getItem(STORAGE_LOCK_PIN);
      if (currentEnteredPin === storedPin) {
        showToast('✓ Welcome back!');
        hideAppLockScreen();
      } else {
        if (lockPinDots) lockPinDots.classList.add('shake');
        showToast('Incorrect PIN. Try again.');
        setTimeout(() => {
          if (lockPinDots) lockPinDots.classList.remove('shake');
          currentEnteredPin = '';
          updatePinDots(lockPinDots, 0);
        }, 500);
      }
    }
  }
}

// PIN Setup Flow
function openPinSetupModal() {
  setupStep = 1;
  setupFirstPin = '';
  currentEnteredPin = '';
  if (pinSetupTitle) pinSetupTitle.textContent = 'Set App Lock PIN';
  if (pinSetupSubtitle) pinSetupSubtitle.textContent = 'Enter a 4-digit security PIN';
  updatePinDots(setupPinDots, 0);
  if (pinSetupModal) pinSetupModal.classList.remove('hidden');
}

function closePinSetupModal() {
  if (pinSetupModal) pinSetupModal.classList.add('hidden');
  currentEnteredPin = '';
  setupFirstPin = '';
  setupStep = 1;
}

function handleSetupKeypress(key) {
  if (key === 'backspace') {
    if (currentEnteredPin.length > 0) {
      currentEnteredPin = currentEnteredPin.slice(0, -1);
      updatePinDots(setupPinDots, currentEnteredPin.length);
    }
    return;
  }

  if (currentEnteredPin.length < 4 && /^[0-9]$/.test(key)) {
    currentEnteredPin += key;
    updatePinDots(setupPinDots, currentEnteredPin.length);

    if (currentEnteredPin.length === 4) {
      if (setupStep === 1) {
        setupFirstPin = currentEnteredPin;
        currentEnteredPin = '';
        setupStep = 2;
        if (pinSetupTitle) pinSetupTitle.textContent = 'Confirm Your PIN';
        if (pinSetupSubtitle) pinSetupSubtitle.textContent = 'Re-enter the same 4-digit PIN to confirm';
        setTimeout(() => updatePinDots(setupPinDots, 0), 200);
      } else if (setupStep === 2) {
        if (currentEnteredPin === setupFirstPin) {
          localStorage.setItem(STORAGE_LOCK_PIN, currentEnteredPin);
          localStorage.setItem(STORAGE_LOCK_ENABLED, 'true');
          updateAppLockMenuUI();
          closePinSetupModal();
          showToast('✓ App Lock enabled successfully!');
        } else {
          if (setupPinDots) setupPinDots.classList.add('shake');
          showToast('PIN mismatch. Please start again.');
          setTimeout(() => {
            if (setupPinDots) setupPinDots.classList.remove('shake');
            openPinSetupModal();
          }, 600);
        }
      }
    }
  }
}

// PIN Disable Flow
function openPinDisableModal() {
  disableEnteredPin = '';
  updatePinDots(disablePinDots, 0);
  if (pinDisableModal) pinDisableModal.classList.remove('hidden');
}

function closePinDisableModal() {
  if (pinDisableModal) pinDisableModal.classList.add('hidden');
  disableEnteredPin = '';
}

function handleDisableKeypress(key) {
  if (key === 'backspace') {
    if (disableEnteredPin.length > 0) {
      disableEnteredPin = disableEnteredPin.slice(0, -1);
      updatePinDots(disablePinDots, disableEnteredPin.length);
    }
    return;
  }

  if (disableEnteredPin.length < 4 && /^[0-9]$/.test(key)) {
    disableEnteredPin += key;
    updatePinDots(disablePinDots, disableEnteredPin.length);

    if (disableEnteredPin.length === 4) {
      const storedPin = localStorage.getItem(STORAGE_LOCK_PIN);
      if (disableEnteredPin === storedPin) {
        localStorage.setItem(STORAGE_LOCK_ENABLED, 'false');
        localStorage.removeItem(STORAGE_LOCK_PIN);
        updateAppLockMenuUI();
        closePinDisableModal();
        showToast('✓ App Lock disabled.');
      } else {
        if (disablePinDots) disablePinDots.classList.add('shake');
        showToast('Incorrect PIN.');
        setTimeout(() => {
          if (disablePinDots) disablePinDots.classList.remove('shake');
          disableEnteredPin = '';
          updatePinDots(disablePinDots, 0);
        }, 500);
      }
    }
  }
}

// Header Menu Actions
function openHeaderMenu() {
  updateAppLockMenuUI();
  if (headerMenuModal) headerMenuModal.classList.remove('hidden');
}

function closeHeaderMenu() {
  if (headerMenuModal) headerMenuModal.classList.add('hidden');
}

function openAboutModal() {
  if (aboutModal) aboutModal.classList.remove('hidden');
}

function closeAboutModal() {
  if (aboutModal) aboutModal.classList.add('hidden');
}

// ----------------------------------------------------
// All-Files ZIP Backup & Google Drive Export
// ----------------------------------------------------
async function generateAllFilesZip() {
  const docs = await getAllDocumentsFromDB();
  if (!docs || docs.length === 0) {
    throw new Error('No files available to backup. Please add some files first.');
  }

  if (typeof JSZip === 'undefined') {
    throw new Error('ZIP engine is loading. Please try again.');
  }

  const zip = new JSZip();
  const usedNames = new Map();

  for (const doc of docs) {
    if (!doc.blob) continue;

    // Sanitize and avoid filename collisions
    let filename = (doc.name || 'document').trim();
    filename = filename.replace(/[/\\]/g, '_');

    const lastDot = filename.lastIndexOf('.');
    let baseName = lastDot > 0 ? filename.substring(0, lastDot) : filename;
    let ext = lastDot > 0 ? filename.substring(lastDot) : '';

    if (usedNames.has(filename.toLowerCase())) {
      const count = usedNames.get(filename.toLowerCase()) + 1;
      usedNames.set(filename.toLowerCase(), count);
      filename = `${baseName} (${count})${ext}`;
    } else {
      usedNames.set(filename.toLowerCase(), 0);
    }

    zip.file(filename, doc.blob);
  }

  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
  const zipFilename = `Titan_Backup_${dateStr}_${timeStr}.zip`;

  return { blob: zipBlob, filename: zipFilename, count: docs.length };
}

async function backupAllFilesIntoZip() {
  try {
    showToast('Creating ZIP backup of all files...');
    const { blob, filename, count } = await generateAllFilesZip();
    showToast(`Prepared ${count} files. Saving ZIP...`);

    if (window.TitanAndroid && window.TitanAndroid.saveToDownloads) {
      const b64 = await blobToBase64(blob);
      window.TitanAndroid.saveToDownloads(b64, filename, 'application/zip');
      showToast(`Backup downloaded: ${filename}`);
      return;
    }

    // Web browser fallback
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    showToast(`Backup downloaded: ${filename}`);
  } catch (err) {
    console.error('Backup ZIP error:', err);
    showToast(err.message || 'Failed to create ZIP backup.');
  }
}

async function uploadAllFilesToGoogleDrive() {
  try {
    showToast('Packaging all files for Google Drive...');
    const { blob, filename, count } = await generateAllFilesZip();
    showToast(`Prepared ${count} files. Opening Google Drive...`);

    if (window.TitanAndroid && window.TitanAndroid.uploadToGoogleDrive) {
      const b64 = await blobToBase64(blob);
      window.TitanAndroid.uploadToGoogleDrive(b64, filename, 'application/zip');
      return;
    }

    // Web Share API fallback if supported
    if (navigator.share && navigator.canShare) {
      const file = new File([blob], filename, { type: 'application/zip' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: filename,
          text: 'Titan Documents ZIP Backup',
          files: [file]
        });
        return;
      }
    }

    // Browser fallback: download file then open Google Drive
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => {
      URL.revokeObjectURL(url);
      window.open('https://drive.google.com', '_blank');
    }, 1200);
    showToast('Backup ZIP downloaded. Opening Google Drive...');
  } catch (err) {
    console.error('Google Drive export error:', err);
    showToast(err.message || 'Failed to export to Google Drive.');
  }
}

function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.remove('hidden');
  clearTimeout(toastEl._timer);
  toastEl._timer = setTimeout(() => {
    toastEl.classList.add('hidden');
  }, 2800);
}

function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 KB';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDate(ts) {
  const d = new Date(ts);
  const day = String(d.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

function getMimeTypeFromExt(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const map = {
    pdf: 'application/pdf',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    txt: 'text/plain'
  };
  return map[ext] || 'application/octet-stream';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const res = reader.result;
      const base64 = res.includes(',') ? res.split(',')[1] : res;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Android Hardware / Gesture Back Button Interceptor
window.handleAndroidBackPressed = function() {
  // If app is currently locked, Back should not bypass the lock screen
  if (appLockScreen && !appLockScreen.classList.contains('hidden')) {
    return false;
  }
  if (pinSetupModal && !pinSetupModal.classList.contains('hidden')) {
    closePinSetupModal();
    return true;
  }
  if (pinDisableModal && !pinDisableModal.classList.contains('hidden')) {
    closePinDisableModal();
    return true;
  }
  if (aboutModal && !aboutModal.classList.contains('hidden')) {
    closeAboutModal();
    return true;
  }
  if (headerMenuModal && !headerMenuModal.classList.contains('hidden')) {
    closeHeaderMenu();
    return true;
  }
  if (previewModal && !previewModal.classList.contains('hidden')) {
    closePreviewModal();
    return true;
  }
  if (actionSheetModal && !actionSheetModal.classList.contains('hidden')) {
    closeActionSheet();
    return true;
  }
  if (renameModal && !renameModal.classList.contains('hidden')) {
    closeRenameModal();
    return true;
  }
  if (shareFallbackModal && !shareFallbackModal.classList.contains('hidden')) {
    closeShareFallback();
    return true;
  }
  return false;
};

