# 📁 Titan Plus Documents

<p align="center">
  <img src="icon.png" width="140" height="140" alt="Titan Plus Documents Logo" style="border-radius: 28px; box-shadow: 0 10px 30px rgba(0, 102, 255, 0.4);" />
</p>

<p align="center">
  <strong>Offline Personal Document Vault with Pinch-to-Zoom, Android File Provider & 100% Original Quality Storage</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Android%20%7C%20Windows%20%7C%20Web-6366f1.svg" alt="Platform" />
  <img src="https://img.shields.io/badge/Quality-100%25%20Original%20Lossless-10b981.svg" alt="Original Quality" />
  <img src="https://img.shields.io/badge/Storage-Offline%20IndexedDB-0ea5e9.svg" alt="Offline Storage" />
  <img src="https://img.shields.io/badge/PDF%20Engine-Mozilla%20PDF.js-f59e0b.svg" alt="PDF.js" />
  <img src="https://img.shields.io/badge/Privacy-100%25%20Private%20%26%20Local-8b5cf6.svg" alt="Privacy First" />
</p>

---

## 📱 Download Android APK

Aap direct Android APK file yahan se download karke apne Android phone me install kar sakte hain:

👉 **[Download TitanPlusDocuments.apk (Latest)](./TitanPlusDocuments.apk)**

---

## 🌟 Highlights & Key Features (Mukhya Suvidhayein)

### 1. 🔍 Double-Finger (Pinch-to-Zoom) & Pan Gesture
- **Photos & Images**: Kisi bhi photo ya image ko do ungliyon se pinch karke zoom in ya zoom out kar sakte hain.
- **PDF Documents**: PDF pages me bhi smooth two-finger pinch-to-zoom uplabdh hai.
- **1-Finger Pan**: Zoom karne ke baad 1 finger se page ko smoothly drag karke kisi bhi hisse ko aasani se padha ja sakta hai.
- **Double Tap Zoom**: Photo ya PDF par 2 baar jaldi tap karne par turant 2.4x zoom hota hai aur dobara tap karne par wapas original size par aa jata hai.
- **Zero Buttons on Preview**: Screen bilkul clean rehti hai — koi button screen ko cover nahi karta.

### 2. 📄 100% Offline PDF Viewer (No Blank/White Screen)
- Android WebView me aane wali PDF white-screen problem ko permanently fix karne ke liye **Mozilla PDF.js** engine offline bundle kiya gaya hai.
- PDFs ko HTML5 `<canvas>` par high-DPI (2.0x scale) me render kiya jata hai jisse text crystal-clear aur sharp dikhta hai.
- Multi-page navigation (Next / Prev) buttons ke sath kitne bhi pages ka PDF ho aasani se browse karein.

### 3. 🔒 100% Original Quality Storage (Zero Compression)
- Saari files device ki local **IndexedDB** database me raw binary blobs ke roop me save hoti hain.
- Koi image compression, downsampling ya quality loss nahi hota — byte-to-byte original rehti hai.
- 100% offline — bina internet ke hamesha available.

### 4. 🗂️ Universal File Support & Live Photo Thumbnails
- **Images**: JPG, PNG, WEBP, GIF, SVG, BMP, HEIC, TIFF, AVIF (Real image live thumbnail ke sath dikhti hai).
- **Documents**: PDF, DOCX, XLSX, TXT, CSV, JSON, MD, HTML, PPTX, etc.

### 5. ✏️ Rename File Option
- Har document ke liye **Rename** option uplabdh hai. Aap bina kisi quality loss ke file ka naam kabhi bhi badal sakte hain.

### 6. ⋮ Clean 3-Dots Action Sheet
- File cards par sabhi options ki jagah ek neat 3-dots (⋮) button diya gaya hai jisse file ka poora naam saaf dikhta hai.
- Tap karne par bottom action sheet khulti hai:
  - 👁️ **Preview**: High-resolution view with pinch-zoom.
  - 🔗 **Share**: WhatsApp, Telegram, Gmail, Bluetooth, Quick Share aadi ke sath direct share.
  - ⬇️ **Download**: Original quality me file download karein.
  - ✏️ **Rename**: File ka naam change karein.
  - 🗑️ **Delete**: Document ko vault se delete karein.

### 7. 📲 Android System File Provider Integration
- **Upload File Selection**: Jab aap kisi doosre app (WhatsApp, Browser, Job Portal, etc.) me "Upload File" ya "Choose File" par click karenge, Android Storage list me **Titan Plus Documents** ka naam aayega. Aap yahan se direct file select karke doosre app me upload kar sakte hain.
- **Incoming Share Intent**: Kisi bhi doosre app se koi bhi file direct "Share via Titan Plus Documents" karke save kar sakte hain.

### 8. 🔍 Instant Live Search Bar
- Top header ke theek neeche hamesha active search bar rehta hai. File ka naam type karte hi instantly filter ho jata hai.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: HTML5, Modern Vanilla CSS3, JavaScript (ES6+), Mozilla PDF.js.
- **Database**: Browser IndexedDB (Transaction-safe offline key-value storage).
- **Mobile Container**: Android SDK (Java), Native WebView with JavaScript Bridge (`@JavascriptInterface`).
- **Android Intents**:
  - `ACTION_GET_CONTENT` & `ACTION_OPEN_DOCUMENT` (System Document Provider)
  - `ACTION_SEND` & `ACTION_SEND_MULTIPLE` (System Share Receiver)
  - `FileProvider` (Secure content URI sharing)
- **Desktop Mode**: Standalone Chromium / Edge App mode (`--app=http://localhost:3000`).

---

## 📂 Project Structure

```plaintext
Titan-Plus-Documents/
├── index.html                   # Main single-page web app structure
├── styles.css                   # Custom responsive styling & modal animations
├── app.js                       # Core logic: IndexedDB, gestures, PDF rendering & bridge
├── manifest.json                # PWA Progressive Web App configuration
├── icon.png                     # High-res 3D neon blue icon (1024x1024)
├── icon.ico                     # Windows Desktop application icon
├── pdf.min.js                   # Mozilla PDF.js offline core library
├── pdf.worker.min.js            # Mozilla PDF.js offline background worker
├── start.bat                    # 1-Click local server runner
├── Titan Document (Desktop App).bat  # 1-Click standalone desktop app launcher
├── TitanPlusDocuments.apk       # Compiled Android APK (Ready to install)
└── android/                     # Complete Android Studio project
    ├── build.gradle             # Top-level Gradle configuration
    ├── settings.gradle          # Project modules definition
    └── app/
        ├── build.gradle         # Android app dependencies & build rules
        └── src/main/
            ├── AndroidManifest.xml # Permissions, intents & provider setup
            ├── assets/          # Bundled web assets for offline execution
            ├── java/com/titan/document/
            │   └── MainActivity.java # Android bridge, file chooser & intent handling
            └── res/             # App icons, layouts & string resources
```

---

## 🚀 How to Run Locally

### 1. Browser me Chalayein (Web Mode)
```bash
# Python local server start karein
python -m http.server 3000
```
Browser me open karein: `http://localhost:3000`

### 2. Windows Standalone Desktop App
Folder me maujood **`Titan Document (Desktop App).bat`** par double click karein. Yeh bina kisi browser address bar ya tabs ke ek clean native desktop window me open ho jayega.

### 3. Android APK Rebuild Karna (Developers ke liye)
```bash
cd android
./gradlew assembleDebug
```
Compiled APK path: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🔐 Privacy & Security

- **100% Local**: Aapke documents kisi bhi cloud server ya teesre paksh par upload nahi hote.
- **No Tracking**: Koi analytics, tracking ya external scripts nahi hain.
- **Offline First**: Bina kisi active internet connection ke poori tarah kaam karta hai.

---

## 📄 License
This project is open-source and free to use for personal document management.
