# 📁 Titan Documents

<p align="center">
  <img src="icon.png" width="140" height="140" alt="Titan Documents Logo" style="border-radius: 28px; box-shadow: 0 10px 30px rgba(88, 101, 233, 0.4);" />
</p>

<p align="center">
  <strong>Premium Offline Personal Document Vault with 4-Digit App Lock, Pinch-to-Zoom, Android File Provider & 100% Lossless Storage</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Android%20%7C%20Windows%20%7C%20Web-5865E9.svg" alt="Platform" />
  <img src="https://img.shields.io/badge/Design-Titan%20SaaS%20Design%20System-5865E9.svg" alt="Design System" />
  <img src="https://img.shields.io/badge/Security-4--Digit%20App%20Lock-16A05A.svg" alt="App Lock" />
  <img src="https://img.shields.io/badge/Storage-Offline%20IndexedDB-0ea5e9.svg" alt="Offline Storage" />
  <img src="https://img.shields.io/badge/PDF%20Engine-Mozilla%20PDF.js-f59e0b.svg" alt="PDF.js" />
  <img src="https://img.shields.io/badge/Privacy-100%25%20Private%20%26%20Local-16A05A.svg" alt="Privacy First" />
</p>

---

## 📱 Download Android APK

Aap direct Android APK file yahan se download karke apne Android phone me install kar sakte hain:

👉 **[Download TitanDocuments.apk (Latest Build)](./TitanDocuments.apk)**

---

## 🎨 Titan Design System Palette

- **Primary Background**: `#F8F9FD` (Soft clean canvas)
- **Card Background**: `#FFFFFF` (Elevated cards)
- **Primary Color**: `#5865E9` (Titan Signature Indigo)
- **Primary Light**: `#EEF1FF` (Gentle accent background)
- **Main Text**: `#151B2D` (Deep crisp typography)
- **Secondary Text**: `#788395` (Subtle muted information)
- **Border**: `#E8EBF3` (Clean hairline dividers)
- **Success**: `#16A05A` (Status & safe storage indicator)
- **Danger**: `#F16B72` (Destructive actions)
- **Cards**: Large rounded cards (`24–32px` radius) with soft ambient shadows and generous internal padding.

---

## 🌟 Highlights & Key Features (Mukhya Suvidhayein)

### 1. 🔒 Built-in 4-Digit App Lock (PIN Security)
- Header ke top-right 3-dots (⋮) par tap karke **App Lock** enable/disable kar sakte hain.
- **PIN Setup Flow**: Step-by-step 4-digit PIN set aur confirm karne ka modal dialog.
- **Full-Screen Keypad Lock Screen**: App open hone par sleek PIN lock screen aati hai jo bina sahi PIN daale documents access nahi karne deti.
- **PIN Disable / Change**: Current PIN verify karke asani se lock disable ya PIN change karein.
- **Hardware Back Button Protection**: Locked state me back button lock screen ko bypass nahi karne deta.

### 2. ⚡ Zero Black Screen Startup (Instant Launch)
- Android theme aur WebView dono ko native `#F8F9FD` background ke sath configure kiya gaya hai, jisse cold start ya app khulte waqt black screen bilkul nahi aati.

### 3. 🔍 Double-Finger (Pinch-to-Zoom) & Pan Gesture
- **Photos & Images**: Kisi bhi photo ya image ko do ungliyon se pinch karke zoom in ya zoom out kar sakte hain.
- **PDF Documents**: PDF pages me bhi smooth two-finger pinch-to-zoom uplabdh hai.
- **1-Finger Pan**: Zoom karne ke baad 1 finger se page ko smoothly drag karke kisi bhi hisse ko aasani se padha ja sakta hai.
- **Double Tap Zoom**: Photo ya PDF par 2 baar jaldi tap karne par turant 2.4x zoom hota hai aur dobara tap karne par wapas original size par aa jata hai.

### 4. 📄 100% Offline PDF Viewer (No Blank/White Screen)
- Android WebView me aane wali PDF white-screen problem ko permanently fix karne ke liye **Mozilla PDF.js** engine offline bundle kiya gaya hai.
- Multi-page navigation (Next / Prev) buttons ke sath kitne bhi pages ka PDF ho aasani se browse karein.

### 5. 🔒 100% Original Quality Storage (Zero Compression)
- Saari files device ki local **IndexedDB** database me raw binary blobs ke roop me save hoti hain.
- Byte-to-byte 100% original rehti hai.

### 6. 🗂️ Universal File Support & Live Photo Thumbnails
- **Images**: JPG, PNG, WEBP, GIF, SVG, BMP, HEIC, TIFF, AVIF (Real photo live thumbnail ke sath dikhti hai).
- **Documents**: PDF, DOCX, XLSX, TXT, CSV, JSON, MD, HTML, PPTX, etc.

### 7. 📲 Android System File Provider Integration
- **Upload File Selection**: Jab aap kisi doosre app (WhatsApp, Browser, Job Portal, etc.) me "Upload File" ya "Choose File" par click karenge, Android Storage list me **Titan Documents** ka naam aayega.
- **Incoming Share Intent**: Kisi bhi doosre app se koi bhi file direct "Share via Titan Documents" karke save kar sakte hain.

---

## 📂 Project Structure

```plaintext
Titan-Documents/
├── index.html                   # Main single-page web app structure
├── styles.css                   # Titan SaaS Design System & CSS animations
├── app.js                       # App Lock, IndexedDB, gestures, PDF rendering & bridge
├── manifest.json                # PWA Progressive Web App configuration
├── icon.png                     # High-res 3D neon blue icon (1024x1024)
├── icon.ico                     # Windows Desktop application icon
├── pdf.min.js                   # Mozilla PDF.js offline core library
├── pdf.worker.min.js            # Mozilla PDF.js offline background worker
├── start.bat                    # 1-Click local server runner
├── Titan Document (Desktop App).bat  # 1-Click standalone desktop app launcher
├── TitanDocuments.apk           # Compiled Android APK (Ready to install)
└── android/                     # Complete Android Studio project
    ├── build.gradle             # Top-level Gradle configuration
    ├── settings.gradle          # Project modules definition
    └── app/
        ├── build.gradle         # Android app dependencies & build rules
        └── src/main/
            ├── AndroidManifest.xml # Permissions, intents & provider setup
            ├── assets/          # Bundled web assets for offline execution
            ├── java/com/titan/document/
            │   └── MainActivity.java # Instant launch, Android bridge, file chooser
            └── res/             # App icons, layouts, colors & theme resources
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
Folder me maujood **`Titan Document (Desktop App).bat`** par double click karein.

### 3. Android APK Rebuild Karna
```bash
cd android
./gradlew assembleDebug
```

---

## 🔐 Privacy & Security

- **100% Local**: Aapke documents kisi bhi cloud server ya teesre paksh par upload nahi hote.
- **No Tracking**: Koi analytics, tracking ya external scripts nahi hain.
- **Offline First**: Bina kisi active internet connection ke poori tarah kaam karta hai.

---

## 📄 License
This project is open-source and free to use for personal document management. Part of the Titan Ecosystem.
