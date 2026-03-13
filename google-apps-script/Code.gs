/**
 * Google Apps Script - Arsip Digital Backend
 * 
 * SETUP:
 * 1. Buat Google Spreadsheet baru
 * 2. Buat sheet bernama "Arsip" dengan header di row 1:
 *    ID | Nama File | Kategori | Tahun | Distrik | Kelurahan/Kampung | Link Dokumen | Tanggal Input
 * 3. Buka Extensions → Apps Script
 * 4. Paste kode ini
 * 5. Deploy → New Deployment → Web App
 *    - Execute as: Me
 *    - Who has access: Anyone
 *    ⚠️ PENTING: Karena script ini sekarang upload file ke Drive, Anda akan diminta
 *                 "Review Permissions" saat deploy. Izinkan akses ke Google Drive.
 * 6. Copy URL deployment, paste ke .env.local sebagai APPS_SCRIPT_URL
 * 
 * @OnlyCurrentDoc
 * @NotOnlyCurrentDoc
 */

const SHEET_NAME = 'Arsip';
const FOLDER_NAME = 'Arsip_Digital_Uploads'; // Folder tujuan upload di Drive

function getSheet() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
}

function getOrCreateFolder(folderName) {
  // Ini memaksa deteksi scope DriveApp agar muncul saat Authorization
  DriveApp.getFiles(); 
  
  var folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  } else {
    return DriveApp.createFolder(folderName);
  }
}

function uploadToDrive(base64Data, fileName, mimeType) {
  try {
    const folder = getOrCreateFolder(FOLDER_NAME);
    // Hapus header "data:image/png;base64," dari string base64 jika ada
    const base64String = base64Data.split(',')[1] || base64Data;
    
    const blob = Utilities.newBlob(Utilities.base64Decode(base64String), mimeType, fileName);
    const file = folder.createFile(blob);
    
    // Ubah permission file agar bisa diakses siapa saja yang punya link (opsional, disarankan agar bisa di-view dari web)
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    return file.getUrl();
  } catch (e) {
    throw new Error('Gagal upload ke Google Drive: ' + e.message);
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    let result;
    
    switch (action) {
      case 'getAll':
        result = getAllArsip();
        break;
      case 'add':
        result = addArsip(data.payload);
        break;
      case 'delete':
        result = deleteArsip(data.payload.id);
        break;
      case 'getStats':
        result = getStats();
        break;
      default:
        result = { error: 'Unknown action: ' + action };
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'Arsip Digital API is running' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getAllArsip() {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    return { data: [] };
  }
  
  const headers = data[0];
  const rows = data.slice(1).map(row => ({
    id: row[0],
    namaFile: row[1],
    kategori: row[2],
    tahun: String(row[3]),
    distrik: row[4],
    kelurahan: row[5],
    linkDokumen: row[6],
    tanggalInput: row[7],
  }));
  
  return { data: rows };
}

function addArsip(payload) {
  const sheet = getSheet();
  const id = Utilities.getUuid();
  const tanggalInput = new Date().toISOString();
  
  let linkDokumen = '';
  
  if (payload.fileBase64 && payload.fileName && payload.mimeType) {
    linkDokumen = uploadToDrive(payload.fileBase64, payload.fileName, payload.mimeType);
  } else {
    // Fallback if somehow someone still sends a text link
    linkDokumen = payload.linkDokumen || '';
  }
  
  sheet.appendRow([
    id,
    payload.namaFile,
    payload.kategori,
    payload.tahun,
    payload.distrik,
    payload.kelurahan,
    linkDokumen,
    tanggalInput,
  ]);
  
  return {
    success: true,
    data: {
      id: id,
      namaFile: payload.namaFile,
      kategori: payload.kategori,
      tahun: payload.tahun,
      distrik: payload.distrik,
      kelurahan: payload.kelurahan,
      linkDokumen: linkDokumen,
      tanggalInput: tanggalInput,
    }
  };
}

function deleteArsip(id) {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  
  return { error: 'Arsip not found' };
}

function getStats() {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    return {
      totalDokumen: 0,
      dokumenTahunIni: 0,
      dokumenINT: 0,
    };
  }
  
  const rows = data.slice(1);
  const currentYear = new Date().getFullYear().toString();
  
  const totalDokumen = rows.length;
  const dokumenTahunIni = rows.filter(row => String(row[3]) === currentYear).length;
  const dokumenINT = rows.filter(row => row[2] === 'Informasi Nilai Tanah').length;
  
  return {
    totalDokumen: totalDokumen,
    dokumenTahunIni: dokumenTahunIni,
    dokumenINT: dokumenINT,
  };
}

function initializeSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  
  const headers = ['ID', 'Nama File', 'Kategori', 'Tahun', 'Distrik', 'Kelurahan/Kampung', 'Link Dokumen', 'Tanggal Input'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.setFrozenRows(1);
}

/**
 * Jalankan fungsi ini HANYA SEKALI dari editor Apps Script
 * untuk memancing munculnya popup Otorisasi Google Drive.
 */
function testAuthorization() {
  getOrCreateFolder(FOLDER_NAME);
  Logger.log("Otorisasi berhasil diberikan!");
}
