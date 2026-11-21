# 📁 Titan Documents

<p align="center">
  <img src="icon.png" width="130" height="130" alt="Titan Documents Logo" style="border-radius: 28px; box-shadow: 0 12px 36px rgba(88, 101, 233, 0.4);" />
</p>

<p align="center">
  <strong>The Ultimate Offline-First Personal Document Vault for Android, Windows & Web</strong><br>
  <em>Part of the Titan Plus Ecosystem • Crafted with ❤️ by Pushpendra</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Android%20%7C%20Windows%20%7C%20Web-5865E9.svg?style=for-the-badge&logo=android&logoColor=white" alt="Platform" />
  <img src="https://img.shields.io/badge/Design-Titan%20SaaS%20System-5865E9.svg?style=for-the-badge" alt="Design System" />
  <img src="https://img.shields.io/badge/Security-4--Digit%20App%20Lock-16A05A.svg?style=for-the-badge&logo=shield&logoColor=white" alt="App Lock" />
  <img src="https://img.shields.io/badge/Storage-100%25%20Offline%20IndexedDB-0ea5e9.svg?style=for-the-badge" alt="Offline Storage" />
  <img src="https://img.shields.io/badge/Backup-ZIP%20%26%20Google%20Drive-7C3AED.svg?style=for-the-badge" alt="Backup" />
  <img src="https://img.shields.io/badge/Privacy-Zero%20Data%20Collection-16A05A.svg?style=for-the-badge" alt="Privacy First" />
</p>

---

## 📑 Table of Contents

- [📱 Download Ready Android APK](#-download-ready-android-apk)
- [💡 What is Titan Documents?](#-what-is-titan-documents)
- [✨ Key Features & Capabilities](#-key-features--capabilities)
  - [1. 🔒 Built-in 4-Digit App Lock (PIN Security)](#1--built-in-4-digit-app-lock-pin-security)
  - [2. 📦 Backup All Files into ZIP](#2--backup-all-files-into-zip)
  - [3. ☁️ Direct Upload to Google Drive](#3-️-direct-upload-to-google-drive)
  - [4. 🛡️ In-App Privacy Policy](#4-️-in-app-privacy-policy)
  - [5. ⚡ Zero Black Screen Startup (Instant Launch)](#5-️-zero-black-screen-startup-instant-launch)
  - [6. 🔍 Pinch-to-Zoom & Pan Gesture Engine](#6--pinch-to-zoom--pan-gesture-engine)
  - [7. 📄 100% Offline Mozilla PDF.js Viewer](#7--100-offline-mozilla-pdfjs-viewer)
  - [8. ✏️ In-App File Renaming](#8-️-in-app-file-renaming)
  - [9. 📲 Android System File Provider Integration](#9--android-system-file-provider-integration)
  - [10. 🗂️ Universal Format Support & Live Thumbnails](#10-️-universal-format-support--live-thumbnails)
- [🎨 Titan SaaS Design System Architecture](#-titan-saas-design-system-architecture)
- [🧭 3-Dots (⋮) Settings Menu Overview](#-3-dots--settings-menu-overview)
- [📂 Project Structure](#-project-structure)
- [🚀 How to Run & Build](#-how-to-run--build)
  - [1. Web Browser Mode](#1-web-browser-mode)
  - [2. 1-Click Windows Desktop App](#2-1-click-windows-desktop-app)
  - [3. Rebuilding the Android APK (Gradle)](#3-rebuilding-the-android-apk-gradle)
- [🔐 Privacy Guarantee & Policy](#-privacy-guarantee--policy)
- [👨‍💻 Author & Credits](#-author--credits)

---

## 📱 Download Ready Android APK

Aap direct production-ready Android APK file yahan se download karke install kar sakte hain:

👉 **[Download TitanDocuments.apk (Direct Build)](./TitanDocuments.apk)**

> **Installation Note**: Pehli baar install karte samay agar *"Install from unknown sources"* prompt aaye to allow karein. Yeh app 100% offline aur malware-free hai.

---

## 💡 What is Titan Documents?

**Titan Documents** ek premium, elegant aur secure personal document vault hai jise **Titan Plus Ecosystem** ke tahat develop kiya gaya hai. 

Aam cloud apps ya file managers aapka personal data remote servers par sync karte hain aur internet na hone par kaam nahi karte. **Titan Documents** isse bilkul ulta hai:
- **100% On-Device**: Aapke files aapke device me IndexedDB binary database me byte-to-byte original quality me save rehte hain.
- **Privacy-First**: Koi analytics nahi, koi third-party SDKs nahi, koi advertisements nahi.
- **Reliable Offline PDF Engine**: Android WebView me jo PDF kholne par blank/white screen aati thi, use Mozilla PDF.js library offline bundle karke permanently solve kiya gaya hai.
- **Hardware Integration**: Pinch-to-zoom, system file provider (dusre apps me direct file pick karna), app lock PIN system aur complete ZIP backup.

---

## ✨ Key Features & Capabilities

### 1. 🔒 Built-in 4-Digit App Lock (PIN Security)
- **Top-Right 3-Dots Menu (⋮)** par tap karke aap **App Lock** enable ya disable kar sakte hain.
- **Tactile Keypad & PIN Setup**: 4-digit PIN enter aur re-enter karke confirm karne ka intuitive setup UI.
- **Full-Screen Lock Gate**: App open hote hi dark-accented modern lock screen aati hai. Sahi 4-digit PIN enter kiye bina koi bhi document access nahi kiya ja sakta.
- **Anti-Bypass Protection**: Android hardware back button ya gesture navigation lock screen ko bypass nahi karne deta.
- **Safe Disable**: Lock disable karne ke liye current PIN verify karna anivarya hai.

---

### 2. 📦 Backup All Files into ZIP
- Header ke 3-dots (⋮) menu me **"Backup all files into zip"** option par tap karein.
- App me maujood **sabhi files** (PDFs, Images, Word, Excel, PPTX, text files, code, etc.) automatically scan hoti hain.
- **Lossless Deflate Compression**: Offline `JSZip` engine sabhi original blobs ko ek single `.zip` archive me pack karta hai.
- **Smart Collision Prevention**: Agar ek hi naam ki do ya teen files hain, to unhe automatic `(1)`, `(2)` suffix dekar bina data loss ya overwriting ke safe archive me bundle kiya jata hai.
- Ek click me aapke mobile ke **Downloads/TitanDocuments** folder me timestamped file (e.g., `Titan_Backup_2026-11-21_2105.zip`) ke roop me save ho jati hai.

---

### 3. ☁️ Direct Upload to Google Drive
- Header ke 3-dots (⋮) menu me **"Upload to Google Drive"** par tap karein.
- Background me turant sabhi documents ka unified `.zip` backup package banta hai.
- File ready hote hi Android system Intent ke zariye seedhe aapke mobile ka **Google Drive app** open ho jata hai.
- Aap apna manpasand Google Drive account aur folder choose karke poore vault ka backup 1-click me cloud par secure kar sakte hain.

---

### 4. 🛡️ In-App Privacy Policy
- 3-dots (⋮) menu me **"Privacy Policy"** button par tap karke complete policy padh sakte hain:
  - **Zero Data Collection**: Kisi bhi prakar ka tracking data ya user telemetry collect nahi hoti.
  - **Local Storage Guarantee**: Files sirf local IndexedDB sandbox me rehti hain.
  - **Full User Ownership**: Data jab chahein export, download ya permanently delete karein.
  - **Safe File Provider**: External apps ko temporary session access tabhi milta hai jab user explicitly file choose karta hai.

---

### 5. ⚡ Zero Black Screen Startup (Instant Launch)
- Purani WebView apps me initial load hone tak 1-2 second ke liye kaali (black) screen aati thi.
- Titan Documents me Android Activity window background aur WebView dono ko native `#F8F9FD` background ke sath synchronize kiya gaya hai, jisse app khulte hi instant clean UI dikhta hai.

---

### 6. 🔍 Pinch-to-Zoom & Pan Gesture Engine
- **Two-Finger Pinch**: Photos aur PDFs dono ko 2 ungliyon se pinch karke zoom in (5x tak) aur zoom out kar sakte hain.
- **One-Finger Drag & Pan**: Zoom karne ke baad document ko 1 finger se smoothly kisi bhi disha me scroll/drag karke padhein.
- **Double-Tap Quick Zoom**: Image ya PDF par jaldi do baar tap karne se instant 2.4x zoom hota hai, aur dobara double-tap karne se original 1x scale par wapas aa jata hai.

---

### 7. 📄 100% Offline Mozilla PDF.js Viewer
- Standard mobile WebView PDFs ko inline render nahi kar pata aur blank white screen dikhata hai.
- Humne **Mozilla PDF.js** library (`pdf.min.js` + `pdf.worker.min.js`) ko poori tarah offline assets me include kiya hai.
- Kitne bhi pages ka PDF ho, clear pagination controls (Next Page / Previous Page), page counter aur double-finger zoom ke sath crystal clear open hota hai.

---

### 8. ✏️ In-App File Renaming
- Kisi bhi file ke card par **3-dots (⋮) Action Sheet** open karein.
- **"Rename Document"** par tap karke custom name daalein.
- File ka extension automatically preserve rehta hai aur IndexedDB me turant update ho jata hai.

---

### 9. 📲 Android System File Provider Integration
- **Universal Storage Picker**: Jab aap kisi doosre app (WhatsApp, Chrome, Telegram, Government/Job Form portals, etc.) me "Upload File" ya "Choose File" click karenge, Android Storage picker me **Titan Documents** ek authorized file source ki tarah show hoga.
- Titan Documents se direct document select karke upload kiya ja sakta hai.
- **Incoming Share Intent**: Kisi bhi doosre app me file share karte waqt **"Share via Titan Documents"** select karke bina app kholiye direct file vault me import ki ja sakti hai.

---

### 10. 🗂️ Universal Format Support & Live Thumbnails
- **Image Formats**: JPG, JPEG, PNG, WEBP, GIF, SVG, BMP, HEIC, TIFF, AVIF. Real photos ka vibrant live thumbnail display hota hai.
- **Document Formats**: PDF, DOCX, XLSX, TXT, CSV, JSON, MD, PPTX, HTML, ZIP, etc.
- **Quick Filters**: All, Documents, Images, Spreadsheets, Code, Archives tabs se instantly categorize karein.
- **Instant Search**: Real-time live search bar se kisi bhi document ko naam se search karein.

---

## 🎨 Titan SaaS Design System Architecture

Titan Documents ek modern, minimalist aur SaaS dashboard aesthetics par aadharit hai:

| Color Token | Hex Code | Visual Role |
| :--- | :--- | :--- |
| **Primary Background** | `#F8F9FD` | Soft, clean, ambient page canvas |
| **Card Background** | `#FFFFFF` | Elevated surface with smooth depth |
| **Primary Color** | `#5865E9` | Titan Signature Indigo accent |
| **Primary Light** | `#EEF1FF` | Gentle tint for active pills & tags |
| **Main Text** | `#151B2D` | High-contrast, sharp typography |
| **Secondary Text** | `#788395` | Muted metadata, timestamps & subtitles |
| **Border Color** | `#E8EBF3` | Subtle hairline dividers |
| **Success Color** | `#16A05A` | App lock active, safe storage badges |
| **Danger Color** | `#F16B72` | Delete buttons & destructive warnings |

- **Corner Radii**: Cards 24px–32px, action buttons 14px–16px, badges 20px.
- **Typography**: Inter / system font stack with solid visual hierarchy.

---

## 🧭 3-Dots (⋮) Settings Menu Overview

Header me right side maujood 3-dots (⋮) button par click karne par ek clean Action Sheet khulti hai:

```
┌────────────────────────────────────────┐
│ Settings & Info                        │
│ Titan Documents • Secure Vault         │
├────────────────────────────────────────┤
│ 🔒 App Lock            [Enabled/Disabled]
│    Require 4-digit PIN to open app     │
│                                        │
│ 📦 Backup all files into zip           │
│    Package all documents into ZIP      │
│                                        │
│ ☁️ Upload to Google Drive              │
│    Create ZIP & open Google Drive      │
│                                        │
│ 🛡️ Privacy Policy                      │
│    100% offline, local & zero tracking │
│                                        │
│ ℹ️ About Titan Documents               │
│    Version, features & Pushpendra info │
└────────────────────────────────────────┘
```

---

## 📂 Project Structure

```plaintext
Titan-Documents/
├── index.html                   # HTML structure, modals (App Lock, PIN, ZIP, About, Privacy)
├── styles.css                   # Titan SaaS Design System, CSS variables & animations
├── app.js                       # Logic: IndexedDB, JSZip, PDF.js, gesture zoom, Android bridge
├── manifest.json                # PWA configuration
├── icon.png                     # Official 3D neon blue icon (1024x1024)
├── icon.ico                     # Windows executable icon
├── jszip.min.js                 # Offline JSZip bundling engine
├── pdf.min.js                   # Mozilla PDF.js offline reader
├── pdf.worker.min.js            # Mozilla PDF.js rendering worker
├── start.bat                    # 1-Click local HTTP server
├── Titan Document (Desktop App).bat  # 1-Click standalone Windows app launcher
├── TitanDocuments.apk           # Production Android APK
├── package.json                 # Project dependencies & meta
└── android/                     # Complete Android Studio project
    ├── build.gradle             # Root build script
    ├── settings.gradle          # Gradle settings
    └── app/
        ├── build.gradle         # Android app dependencies (minSdk 24, targetSdk 34)
        └── src/main/
            ├── AndroidManifest.xml # Storage permissions, file provider & Drive queries
            ├── assets/          # Synced offline web assets (HTML, CSS, JS, libs)
            ├── java/com/titan/document/
            │   └── MainActivity.java # Instant launch, AndroidBridge, Drive Intent, File Chooser
            └── res/             # Splash themes, round launcher icons & strings
```

---

## 🚀 How to Run & Build

### 1. Web Browser Mode
Kisi bhi computer ya laptop par local server start karke chalayein:
```bash
# Python local server start karein
python -m http.server 3000
```
Browser me open karein: `http://localhost:3000`

### 2. 1-Click Windows Desktop App
Agar aap Windows par hain, to kisi command ki zaroorat nahi hai:
- Sirf folder me maujood **`Titan Document (Desktop App).bat`** par double click karein.
- App ek clean desktop application window me bina browser address bar ke open ho jayegi.

### 3. Rebuilding the Android APK (Gradle)
Agar aap Android code me koi changes karte hain aur naya APK generate karna chahte hain:
```bash
# Android directory me jayein
cd android

# Debug APK assemble karein
./gradlew assembleDebug
```
Compiled APK yahan milega:  
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🔐 Privacy Guarantee & Policy

- **Zero Tracking**: Koi analytics nahi, koi Google/Firebase tracker nahi.
- **100% Offline**: App bina internet connection ke offline chalne ke liye design ki gayi hai.
- **Device Encrypted**: Files aapke device ke secure storage me rehti hain.
- **Export Freedom**: User kisi bhi waqt ZIP backup download kar sakta hai ya Google Drive me transfer kar sakta hai.

---

## 👨‍💻 Author & Credits

- **Developer & Creator**: **Pushpendra**
- **Ecosystem**: **Titan Plus Ecosystem**
- **PDF Engine**: Mozilla PDF.js Project
- **ZIP Engine**: Stuk JSZip Project
- **Design**: Titan SaaS Minimalist Design System

---

<p align="center">
  <strong>Titan Documents</strong> • Private. Elegant. Secure.<br>
  <em>Part of the Titan Plus Ecosystem</em>
</p>
