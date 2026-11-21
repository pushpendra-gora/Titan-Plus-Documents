package com.titan.document;

import android.app.Activity;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Intent;
import android.database.Cursor;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.provider.OpenableColumns;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.FileProvider;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;

public class MainActivity extends AppCompatActivity {

    private WebView webView;
    private ValueCallback<Uri[]> filePathCallback;
    private boolean isPickerMode = false;

    private final ActivityResultLauncher<Intent> fileChooserLauncher = registerForActivityResult(
            new ActivityResultContracts.StartActivityForResult(),
            result -> {
                if (filePathCallback != null) {
                    Uri[] results = null;
                    if (result.getResultCode() == Activity.RESULT_OK && result.getData() != null) {
                        Intent data = result.getData();
                        if (data.getClipData() != null) {
                            int count = data.getClipData().getItemCount();
                            results = new Uri[count];
                            for (int i = 0; i < count; i++) {
                                results[i] = data.getClipData().getItemAt(i).getUri();
                            }
                        } else if (data.getData() != null) {
                            results = new Uri[]{data.getData()};
                        }
                    }
                    filePathCallback.onReceiveValue(results);
                    filePathCallback = null;
                }
            });

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Intent intent = getIntent();
        String action = intent != null ? intent.getAction() : null;
        if (Intent.ACTION_GET_CONTENT.equals(action) || Intent.ACTION_OPEN_DOCUMENT.equals(action)) {
            isPickerMode = true;
        }

        webView = new WebView(this);
        webView.setBackgroundColor(Color.TRANSPARENT);
        setContentView(webView);

        setupWebView();

        String url = "file:///android_asset/index.html" + (isPickerMode ? "?mode=picker" : "");
        webView.loadUrl(url);

        handleIncomingShare(intent);
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleIncomingShare(intent);
    }

    private void setupWebView() {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setSupportZoom(true);
        settings.setBuiltInZoomControls(true);
        settings.setDisplayZoomControls(false);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                if (isPickerMode) {
                    webView.evaluateJavascript("if (window.enablePickerMode) window.enablePickerMode();", null);
                }
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback,
                                              FileChooserParams fileChooserParams) {
                if (MainActivity.this.filePathCallback != null) {
                    MainActivity.this.filePathCallback.onReceiveValue(null);
                }
                MainActivity.this.filePathCallback = filePathCallback;

                Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                intent.setType("*/*");
                intent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);

                try {
                    fileChooserLauncher.launch(Intent.createChooser(intent, "Select Documents"));
                } catch (Exception e) {
                    MainActivity.this.filePathCallback = null;
                    return false;
                }
                return true;
            }
        });

        webView.addJavascriptInterface(new AndroidBridge(), "TitanAndroid");
    }

    public class AndroidBridge {
        @JavascriptInterface
        public boolean isPickerMode() {
            return isPickerMode;
        }

        @JavascriptInterface
        public void returnPickedDocument(String base64Data, String filename, String mimeType) {
            runOnUiThread(() -> {
                try {
                    byte[] bytes = Base64.decode(base64Data, Base64.DEFAULT);
                    File cacheDir = new File(getCacheDir(), "shared_docs");
                    if (!cacheDir.exists()) cacheDir.mkdirs();
                    File file = new File(cacheDir, filename);
                    try (FileOutputStream fos = new FileOutputStream(file)) {
                        fos.write(bytes);
                    }

                    Uri uri = FileProvider.getUriForFile(MainActivity.this,
                            getApplicationContext().getPackageName() + ".provider", file);

                    Intent resultIntent = new Intent();
                    resultIntent.setDataAndType(uri, mimeType != null ? mimeType : "*/*");
                    resultIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    setResult(Activity.RESULT_OK, resultIntent);
                    Toast.makeText(MainActivity.this, "Selected: " + filename, Toast.LENGTH_SHORT).show();
                    finish();
                } catch (Exception e) {
                    Toast.makeText(MainActivity.this, "Selection error: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                }
            });
        }

        @JavascriptInterface
        public void shareDocument(String base64Data, String filename, String mimeType) {
            runOnUiThread(() -> {
                try {
                    byte[] bytes = Base64.decode(base64Data, Base64.DEFAULT);
                    File cacheDir = new File(getCacheDir(), "shared_docs");
                    if (!cacheDir.exists()) cacheDir.mkdirs();
                    File file = new File(cacheDir, filename);
                    try (FileOutputStream fos = new FileOutputStream(file)) {
                        fos.write(bytes);
                    }

                    Uri uri = FileProvider.getUriForFile(MainActivity.this,
                            getApplicationContext().getPackageName() + ".provider", file);

                    Intent shareIntent = new Intent(Intent.ACTION_SEND);
                    shareIntent.setType(mimeType != null ? mimeType : "*/*");
                    shareIntent.putExtra(Intent.EXTRA_STREAM, uri);
                    shareIntent.putExtra(Intent.EXTRA_TITLE, filename);
                    shareIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    startActivity(Intent.createChooser(shareIntent, "Share Document via"));
                } catch (Exception e) {
                    Toast.makeText(MainActivity.this, "Share error: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                }
            });
        }

        @JavascriptInterface
        public void saveToDownloads(String base64Data, String filename, String mimeType) {
            runOnUiThread(() -> {
                try {
                    byte[] bytes = Base64.decode(base64Data, Base64.DEFAULT);
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                        ContentValues values = new ContentValues();
                        values.put(MediaStore.MediaColumns.DISPLAY_NAME, filename);
                        values.put(MediaStore.MediaColumns.MIME_TYPE, mimeType);
                        values.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/TitanDocuments");
                        Uri uri = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
                        if (uri != null) {
                            try (OutputStream os = getContentResolver().openOutputStream(uri)) {
                                if (os != null) os.write(bytes);
                            }
                            Toast.makeText(MainActivity.this, "Saved to Downloads: " + filename, Toast.LENGTH_LONG).show();
                        }
                    } else {
                        File downloadDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
                        File dest = new File(downloadDir, filename);
                        try (FileOutputStream fos = new FileOutputStream(dest)) {
                            fos.write(bytes);
                        }
                        Toast.makeText(MainActivity.this, "Saved to Downloads: " + filename, Toast.LENGTH_LONG).show();
                    }
                } catch (Exception e) {
                    Toast.makeText(MainActivity.this, "Save error: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                }
            });
        }

        @JavascriptInterface
        public void uploadToGoogleDrive(String base64Data, String filename, String mimeType) {
            runOnUiThread(() -> {
                try {
                    byte[] bytes = Base64.decode(base64Data, Base64.DEFAULT);
                    File cacheDir = new File(getCacheDir(), "drive_export");
                    if (!cacheDir.exists()) cacheDir.mkdirs();
                    File file = new File(cacheDir, filename);
                    try (FileOutputStream fos = new FileOutputStream(file)) {
                        fos.write(bytes);
                    }

                    Uri uri = FileProvider.getUriForFile(MainActivity.this,
                            getApplicationContext().getPackageName() + ".provider", file);

                    Intent driveIntent = new Intent(Intent.ACTION_SEND);
                    driveIntent.setType(mimeType != null ? mimeType : "application/zip");
                    driveIntent.putExtra(Intent.EXTRA_STREAM, uri);
                    driveIntent.putExtra(Intent.EXTRA_TITLE, filename);
                    driveIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    driveIntent.setPackage("com.google.android.apps.docs");

                    try {
                        startActivity(driveIntent);
                        Toast.makeText(MainActivity.this, "Opening Google Drive...", Toast.LENGTH_SHORT).show();
                    } catch (Exception e) {
                        driveIntent.setPackage(null);
                        Intent chooserIntent = Intent.createChooser(driveIntent, "Upload to Google Drive / Cloud");
                        startActivity(chooserIntent);
                    }
                } catch (Exception e) {
                    Toast.makeText(MainActivity.this, "Drive export error: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                }
            });
        }
    }

    private void handleIncomingShare(Intent intent) {
        if (intent == null) return;
        String action = intent.getAction();
        String type = intent.getType();

        if (Intent.ACTION_SEND.equals(action) && type != null) {
            Uri streamUri = intent.getParcelableExtra(Intent.EXTRA_STREAM);
            if (streamUri != null) {
                importUriAsync(streamUri, type);
            }
        } else if (Intent.ACTION_SEND_MULTIPLE.equals(action) && type != null) {
            ArrayList<Uri> uris = intent.getParcelableArrayListExtra(Intent.EXTRA_STREAM);
            if (uris != null) {
                for (Uri u : uris) {
                    importUriAsync(u, type);
                }
            }
        }
    }

    private void importUriAsync(Uri uri, String mimeType) {
        new Thread(() -> {
            try {
                ContentResolver resolver = getContentResolver();
                String filename = getFileNameFromUri(uri, resolver);
                if (filename == null) filename = "Imported_" + System.currentTimeMillis();

                InputStream is = resolver.openInputStream(uri);
                if (is != null) {
                    ByteArrayOutputStream buffer = new ByteArrayOutputStream();
                    int nRead;
                    byte[] data = new byte[16384];
                    while ((nRead = is.read(data, 0, data.length)) != -1) {
                        buffer.write(data, 0, nRead);
                    }
                    buffer.flush();
                    byte[] fileBytes = buffer.toByteArray();
                    String base64 = Base64.encodeToString(fileBytes, Base64.NO_WRAP);

                    final String finalName = filename;
                    final String finalType = mimeType != null ? mimeType : "application/octet-stream";
                    runOnUiThread(() -> {
                        String js = String.format("if (window.importExternalDocument) window.importExternalDocument('%s', '%s', '%s');",
                                escapeForJs(finalName), escapeForJs(finalType), base64);
                        webView.evaluateJavascript(js, null);
                    });
                }
            } catch (Exception e) {
                runOnUiThread(() -> Toast.makeText(MainActivity.this, "Import error: " + e.getMessage(), Toast.LENGTH_SHORT).show());
            }
        }).start();
    }

    private String getFileNameFromUri(Uri uri, ContentResolver resolver) {
        String name = null;
        try (Cursor cursor = resolver.query(uri, null, null, null, null)) {
            if (cursor != null && cursor.moveToFirst()) {
                int nameIdx = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME);
                if (nameIdx >= 0) {
                    name = cursor.getString(nameIdx);
                }
            }
        } catch (Exception ignored) {}
        if (name == null && uri.getPath() != null) {
            name = uri.getLastPathSegment();
        }
        return name;
    }

    private String escapeForJs(String str) {
        if (str == null) return "";
        return str.replace("\\", "\\\\").replace("'", "\\'").replace("\n", "\\n").replace("\r", "");
    }

    @Override
    public void onBackPressed() {
        if (webView != null) {
            webView.evaluateJavascript("window.handleAndroidBackPressed ? window.handleAndroidBackPressed() : false;", value -> {
                if ("true".equals(value)) {
                    // Modal or action sheet was closed by web app
                    return;
                }
                runOnUiThread(() -> {
                    if (webView.canGoBack()) {
                        webView.goBack();
                    } else {
                        MainActivity.super.onBackPressed();
                    }
                });
            });
        } else {
            super.onBackPressed();
        }
    }
}
