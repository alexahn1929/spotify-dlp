const SETTINGS_PATH = "./settings.json";
const api = require("./api.js");

const { app, BrowserWindow, Menu, session, ipcMain, shell, dialog } = require("electron");
const fs = require("node:fs");
const path = require('node:path')
const {spawn} = require("node:child_process");

const { ElectronBlocker } = require('@cliqz/adblocker-electron');
const fetch = require('cross-fetch'); // required 'fetch'

const MP3Tag = require('mp3tag.js');

ElectronBlocker.fromPrebuiltAdsAndTracking(fetch).then((blocker) => {
  blocker.enableBlockingInSession(session.defaultSession);
});

let settings = require(SETTINGS_PATH);
api.updateKey(settings);

//const playlist = JSON.parse(fs.readFileSync("test.json"));

app.whenReady().then(() => {
    openStartMenu();
    //parseTracks(playlist.tracks.items);
});

const SEARCH_URL_STEM = "https://www.youtube.com/results?search_query=";
const VIDEO_URL_STEM = "www.youtube.com/watch?v=";

const getSearchURL = (track) => {
    return SEARCH_URL_STEM+encodeURIComponent(track.name + " " + track.artists[0].name + " official audio");
};

const getWindowTitle = (track, i, len) => {
    return track.name + " - " + track.artists[0].name + ` (Song ${i+1}/${len})`;
};

const updateMetadata = (process, track, filename, downloadPath) => {
    if (downloadPath.charAt(downloadPath.length-1) != "/") {
        downloadPath += "/";
    }
    process.once("close", () => {
        const mp3tag = new MP3Tag(fs.readFileSync(downloadPath+filename)); //downloadPath must end with /
        mp3tag.read();

        mp3tag.tags.title = track.name;
        mp3tag.tags.artist = track.artists[0].name;
        mp3tag.tags.album = track.album.name;

        fs.writeFileSync(downloadPath+track.name+" - "+track.artists[0].name+".mp3", Buffer.from(mp3tag.save()));
        fs.rmSync(downloadPath+filename);
    });
};

/**
 * @param tracks array of track objects from spotify API
 */
const parseTracks = (tracks, windowPosition) => {
    let idx = 0;
    let currentSearchURL = getSearchURL(tracks[idx].track);

    const win = new BrowserWindow({x: windowPosition[0], y: windowPosition[1]});
    win.on("page-title-updated", (event) => event.preventDefault());

    const updateWindow = () => {
        if (idx < tracks.length) {
            currentSearchURL = getSearchURL(tracks[idx].track);
            win.loadURL(currentSearchURL);
            win.setTitle(getWindowTitle(tracks[idx].track, idx, tracks.length));
        } else {
            win.close();
        }
    };

    const menu = Menu.buildFromTemplate([
        {
            label: "Download", // to do: don't let user save settings if anything is invalid?
            click: () => {
                if (win.webContents.getURL().includes(VIDEO_URL_STEM)) { //check if reasonable url to download (ex. if you paste in youtube.com to yt-dlp, it'll try to download all recommendations)
                    const dl_process = spawn(settings.ytdlp_path, ["-o", `tempfile_${idx}`, "-x", "--audio-format", "mp3", win.webContents.getURL()], {cwd: settings.download_path});
                    updateMetadata(dl_process, tracks[idx].track, `tempfile_${idx}.mp3`, settings.download_path);
                    idx += 1;
                    updateWindow();
                } //also to add: direct stdout of child process to main window. Maybe also put a progress bar on the main window?
            } //need to catch error?
        },
        {
            label: "Back to Search",
            click: updateWindow //go if not already on search page?
        },
        {
            label: "Go Back",
            click: () => {
                if (idx > 0) {
                    idx -= 1;
                    updateWindow();
                }
            }
        },
        {
            label: "Skip",
            click: () => {
                idx += 1;
                updateWindow();
            }
        } //to add: skip to song (by idx #)
    ]);
    win.setMenu(menu);

    updateWindow();
};

const openStartMenu = () => {
    const win = new BrowserWindow({
        webPreferences: {
          preload: path.join(__dirname, 'preload.js')
        }
    });
    win.once("closed", () => app.quit()); //when the main menu window is closed, close all windows (and the whole app)
    win.removeMenu(); //prevents opening dev tools, comment for debug

    ipcMain.handle("playlist-request", async (event, ...args) => {
        try {
            let newPosition = win.getPosition().map(x => x+20);
            parseTracks(await api.getPlaylistRaw(...args), newPosition);
            win.webContents.send("playlist-found");
        } catch (error) {
            win.webContents.send("playlist-error", error);
        }
    });
    ipcMain.handle("view-yt-dlp", async (event) => shell.openExternal("https://github.com/yt-dlp/yt-dlp")); //may not work in executable

    ipcMain.handle("save-key", async (event, ...args) => {
        settings["client_id"] = args[0];
        settings["client_secret"] = args[1];
        api.updateKey(settings);
        fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings));
    });
    ipcMain.handle("update-downloads", async (event, ...args) => {
        let dl_path = await getFilePath(win, true);
        if (dl_path !== undefined) {
            settings["download_path"] = dl_path;
            win.webContents.send("populate-settings", settings);
            fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings));
        }
    });
    ipcMain.handle("update-ytdlp", async (event, ...args) => {
        let yt_path = await getFilePath(win, false);
        if (yt_path !== undefined) {
            settings["ytdlp_path"] = yt_path;
            win.webContents.send("populate-settings", settings);
            fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings));
        }
    });

    win.loadFile("./index.html").then(() => win.webContents.send("populate-settings", settings));

    //getFilePath(win, true).then((path) => console.log("path: "+path));
};

const getFilePath = async (win, isFolder) => {
    let options = {
        defaultPath: ".",
        properties: ["multiSelections"]
    };
    if (isFolder) {
        options.properties.push("openDirectory");
    } else {
        options.properties.push("openFile");
    }
    return (await dialog.showOpenDialog(win, options)).filePaths[0];
};