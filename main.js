const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs').promises;

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    resizable: true,
    minimizable: true,
    maximizable: true
  });

  mainWindow.loadFile('renderer/index.html');

  if (process.argv.includes('--debug')) {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('select-files', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  return result.filePaths;
});

ipcMain.handle('select-output-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });

  return result.filePaths[0];
});

ipcMain.handle('process-images', async (event, { files, options }) => {
  try {
    const results = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      mainWindow.webContents.send('processing-progress', {
        current: i + 1,
        total: files.length,
        filename: path.basename(file)
      });

      try {
        const result = await processImage(file, options);
        results.push({ file, success: true, outputPath: result });
      } catch (error) {
        results.push({ file, success: false, error: error.message });
      }
    }

    return results;
  } catch (error) {
    throw new Error(`Processing failed: ${error.message}`);
  }
});

async function processImage(inputPath, options) {
  const { width, height, format, quality, outputDirectory, resizeMode, percentage } = options;
  
  const inputDir = path.dirname(inputPath);
  const inputName = path.parse(inputPath).name;
  const inputExt = path.parse(inputPath).ext;
  
  const outputDir = outputDirectory || inputDir;
  const outputFormat = format || inputExt.slice(1);
  const outputPath = path.join(outputDir, `${inputName}-resized.${outputFormat}`);

  let sharpInstance = sharp(inputPath);
  
  const metadata = await sharpInstance.metadata();
  
  let resizeOptions = {};
  
  if (resizeMode === 'percentage' && percentage) {
    const newWidth = Math.round(metadata.width * (percentage / 100));
    const newHeight = Math.round(metadata.height * (percentage / 100));
    resizeOptions = { width: newWidth, height: newHeight };
  } else if (resizeMode === 'pixels') {
    if (width && height) {
      resizeOptions = { width: parseInt(width), height: parseInt(height) };
    } else if (width) {
      resizeOptions = { width: parseInt(width) };
    } else if (height) {
      resizeOptions = { height: parseInt(height) };
    }
  }
  
  if (Object.keys(resizeOptions).length > 0) {
    sharpInstance = sharpInstance.resize(resizeOptions);
  }
  
  if (outputFormat === 'jpg' || outputFormat === 'jpeg') {
    sharpInstance = sharpInstance.jpeg({ quality: quality || 90 });
  } else if (outputFormat === 'png') {
    sharpInstance = sharpInstance.png({ quality: quality || 90 });
  } else if (outputFormat === 'webp') {
    sharpInstance = sharpInstance.webp({ quality: quality || 90 });
  }

  await sharpInstance.toFile(outputPath);
  
  return outputPath;
}