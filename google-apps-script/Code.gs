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
 * 6. Copy URL deployment, paste ke .env.local sebagai APPS_SCRIPT_URL
 */

const SHEET_NAME = 'Arsip';

function getSheet() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
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
  
  sheet.appendRow([
    id,
    payload.namaFile,
    payload.kategori,
    payload.tahun,
    payload.distrik,
    payload.kelurahan,
    payload.linkDokumen,
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
      linkDokumen: payload.linkDokumen,
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

/**
 * Helper function to initialize the sheet with headers
 * Run this function once from the Apps Script editor
 */
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
