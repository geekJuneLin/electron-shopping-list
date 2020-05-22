const electron = require("electron");
const url = require("url");
const path = require("path");

const { app, BrowserWindow, Menu, ipcMain } = electron;

// SET env
process.env.NODE_ENV = "production";

let mainWindow;
let addWindow;

// Listene for the app to be ready
app.on("ready", () => {
  // Create new window
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
    },
  });
  // Load html file into window
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "mainWindow.html"),
      protocol: "file:",
      slashes: true,
    })
  );

  mainWindow.on("closed", () => {
    app.quit();
  });

  // Build the menu from template
  const mainMenu = Menu.buildFromTemplate(menuTemplate);
  // Insert the menu
  Menu.setApplicationMenu(mainMenu);
});

// Handle createAddWindow
const createAddWindow = () => {
  addWindow = new BrowserWindow({
    width: 300,
    height: 200,
    title: "Add shopping list item",
    webPreferences: {
      nodeIntegration: true,
    },
  });

  addWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "addWindow.html"),
      protocol: "file",
      slashes: true,
    })
  );

  // Garbage collection
  addWindow.on("close", () => {
    addWindow = null;
  });
};

// Catch item add
ipcMain.on("item:add", (e, item) => {
  console.log(item);
  mainWindow.webContents.send("item:add", item);
  addWindow.close();
});

// Creat menu template
const menuTemplate = [
  {
    label: "File",
    submenu: [
      {
        label: "Add Item",
        click() {
          createAddWindow();
        },
      },
      {
        label: "Clear Items",
        click() {
          mainWindow.webContents.send("item:clear");
        },
      },
      {
        label: "Quit",
        accelerator: process.platform == "darwin" ? "Command + Q" : " Ctrl + Q",
        click() {
          app.quit();
        },
      },
    ],
  },
];

// If mac, add empty object to menu
if (process.platform === "darwin") {
  menuTemplate.unshift({});
}

// Add developer tools if not in production
if (process.env.NODE_ENV !== "production") {
  menuTemplate.push({
    label: "Developer Tools",
    submenu: [
      {
        label: "Toggle devTools",
        accelerator: process.platform == "darwin" ? "Command + I" : "Ctrl + I",
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        },
      },
      {
        role: "reload",
      },
    ],
  });
}
