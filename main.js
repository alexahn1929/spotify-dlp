const { app, BrowserWindow, Menu } = require("electron");
const fs = require("fs");
const {spawn} = require("node:child_process");

const playlist = JSON.parse(fs.readFileSync("test.json"));
let tmp = playlist.tracks.items[0].track
console.log(tmp.name + " " + tmp.artists[0].name + " official audio")


app.whenReady().then(() => {
    parseTracks(playlist.tracks.items);
    //createButtonWindow();
})

/*const createYoutubeWindow = () => {
    const win = new BrowserWindow(); //frame: false});
    //win.removeMenu();

    const menu = Menu.buildFromTemplate([
        {
            label: "Download",
            click: () => {spawn("../yt-dlp.exe", ["-o", "%(title)s", "-x", "--audio-format", "mp3", win.webContents.getURL()], {cwd: "./downloads"})} //need to catch error?
        },
        {
            label: "Back to Search",
            click: () => {}
        }
    ])
    Menu.setApplicationMenu(menu)

    // Load a remote URL
    win.loadURL('https://www.youtube.com/results?search_query='+encodeURIComponent(tmp.name + " " + tmp.artists[0].name + " official audio"));
}*/

const displayNextSong();

/**
 * @param tracks array of track objects from spotify API
 */
const parseTracks = (tracks) => {
    const win = new BrowserWindow(); //frame: false});
    //win.removeMenu();

    const menu = Menu.buildFromTemplate([
        {
            label: "Download",
            click: () => {spawn("../yt-dlp.exe", ["-o", "%(title)s", "-x", "--audio-format", "mp3", win.webContents.getURL()], {cwd: "./downloads"})} //need to catch error?
        },
        {
            label: "Back to Search",
            click: () => {}
        }
    ])
    Menu.setApplicationMenu(menu)

    // Load a remote URL
    win.loadURL('https://www.youtube.com/results?search_query='+encodeURIComponent(tmp.name + " " + tmp.artists[0].name + " official audio"));
};

/*const createButtonWindow = () => {
    const win = new BrowserWindow({frame: false}); //frame: false});

    // Load a remote URL
    win.loadFile("buttons.html");
    win.on("closed", ());
}*/


/*const createSearchWindows = () => {
    const ytWin = new BrowserWindow(); //frame: false});
    //win.removeMenu();

    // Load a remote URL
    ytWin.loadURL('https://www.youtube.com/results?search_query='+encodeURIComponent(tmp.name + " " + tmp.artists[0].name + " official audio"));

    const buttonWin = new BrowserWindow({frame: false});
    buttonWin.loadFile("buttons.html");
    
    ytWin.on("closed", () => buttonWin.close());
}*/