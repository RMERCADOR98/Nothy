const {
  app,
  BrowserWindow,
  Menu,
  dialog,
  ipcMain,
  shell,
} = require("electron");
const fs = require("fs");
const path = require("path");
require("electron-reload")(__dirname);

//CHECK FILE DATA BEFORE OPEN

function checkData(fPath) {
  try {
    const read = fs.readFileSync(fPath, "utf8");
    console.log(read);
    return read;
  } catch (err) {
    console.log(err);
    return "";
  }
}

//MAIN WINDOW

var mainWindow = null;

async function createWindow() {
  // console.timeLog(app);
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      // contextIsolation: true,
    },
    width: 800,
    height: 600,
    icon: __dirname + "/lapis.png",
  });

  console.log(process.mainModule.path);

  const module = process.mainModule;
  console.log(module.filename);

  await mainWindow.loadFile("src/pages/editor/index.html");
  mainWindow.webContents.openDevTools();
  //AQUI VOU DITAR AQUILO QUE QUERO ABRIR, ATRAVÉS DE UM IF! SE O FICHEIRO ESTIVER GUARDADO, VOU ABRIR AQUELE PATH , CASO CONTRÁRIO, VOU ABRIR UM NOVO FICHEIRO COM O "CREATEFILE()"

  if (module.filename.lenght > 0) {
    file = {
      // name: path.basename(module),
      name: module.filename,
      content: checkData(["module.path"]),
      saved: "true",
      path: module.filename + ".txt",
    };

    mainWindow.webContents.send("set-file", file);
  } else {
    createNewFile();
  }

  ipcMain.on("update-content", function (event, data) {
    file.content = data;
  });
}

//ARQUIVO
var file = {};

//CRIA UM NOVO ARQUIVO
function createNewFile() {
  file = {
    name: "Novo Arquivo.txt",
    content: "",
    saved: false,
    path: app.getPath("documents") + "/Novo Arquivo.txt",
  };
  // console.log(file);
  //enviar mensagens entre os dois processos
  mainWindow.webContents.send("set-file", file);
}

//GUARDA ARTIGO NO DISCO
function writeFile(filePath) {
  try {
    fs.writeFile(filePath, file.content, function (error) {
      //se deu erro
      if (error) throw error;

      //arquivo guardado
      file.path = filePath;
      file.saved = true;
      file.name = path.basename(filePath);

      mainWindow.webContents.send("set-file", file);
    });
  } catch (err) {
    console.log(err);
  }
}

//SAVE FILE AS
async function saveFileAs() {
  //o dialog é responsavel pelas caixas de dialogo
  let dialogFile = await dialog.showSaveDialog({
    defaultPath: file.path,
  });
  //VERIFICAR CANCELAMENTO(de nao guardar)
  if (dialogFile.canceled) {
    return false;
  }
  console.log(dialogFile);

  //GUARDAR ARQUIVO COMO
  writeFile(dialogFile.filePath);
}

// GUARDAR ARQUIVO
function saveFile() {
  //save
  if (file.saved) {
    return writeFile(file.path);
  }
  //salvar como
  return saveFileAs();
}

//LER ARQUIVO

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (err) {
    console.log(err);
    return "";
  }
}

// ABRIR ARQUIVO
async function openFile() {
  //DIALOG
  let dialogFile = await dialog.showOpenDialog({
    defaultPath: file.path,
  });

  console.log(dialogFile);

  //VERIFICAR CANCELAMENTO
  if (dialogFile.canceled) return false;
  //ABRIR
  file = {
    name: path.basename(dialogFile.filePaths[0]),
    content: readFile(dialogFile.filePaths[0]),
    saved: "true",
    path: dialogFile.filePaths[0],
  };

  mainWindow.webContents.send("set-file", file);

  console.log(dialogFile);
}

//TEMPLATE MENU
const templateMenu = [
  {
    label: "Arquivo",
    submenu: [
      {
        label: "Novo",
        accelerator: "CmdOrCtrl+N",
        click() {
          createNewFile();
        },
      },
      {
        label: "Abrir",
        accelerator: "CmdOrCtrl+O",
        click() {
          openFile();
        },
      },
      {
        label: "Guardar",
        accelerator: "CmdOrCtrl+S",
        click() {
          saveFile();
        },
      },
      {
        label: "Guardar como",
        accelerator: "CmdOrCtrl+Shift+S",
        click() {
          saveFileAs();
        },
      },
      {
        label: "Fechar",
        accelerator: "CmdOrCtrl+Q",
        //como nem todos os sistemas operativos utilizão o "quit" para fechar temo de utilizar o process
        role: process.platform === "darwin" ? "close" : "quit",
      },
    ],
  },
  {
    label: "Editar",
    submenu: [
      {
        label: "Desfazer",
        role: "undo",
      },
      {
        label: "Refazer",
        role: "redo",
      },
      {
        type: "separator",
      },
      {
        label: "Copiar",
        role: "copy",
      },
      {
        label: "Colar",
        role: "paste",
      },
      {
        label: "Cortar",
        role: "cut",
      },
    ],
  },
  {
    label: "Ajuda",
    submenu: [
      {
        label: "Electron",
        click() {
          shell.openExternal("https://www.electronjs.org/");
        },
      },
    ],
  },
];

//MENU
const menu = Menu.buildFromTemplate(templateMenu);
Menu.setApplicationMenu(menu);

//ON READY
app.whenReady().then(createWindow);

//ACTIVATE FOR MAC
//é chamada em vários momentos, basicamente quando uma ação acontece

app.on("activate", () => {
  //verificar se a janela já está aberta ou nao
  if (BrowserWindow.getAllWindows().lenght === 0) {
    createWindow();
  }
});
