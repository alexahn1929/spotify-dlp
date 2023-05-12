const { app, BrowserWindow, Menu } = require("electron");
const fs = require("fs");
const {spawn} = require("node:child_process");

const playlist = JSON.parse(fs.readFileSync("test.json"));

app.whenReady().then(() => {
    parseTracks(playlist.tracks.items);
    //createButtonWindow();
});

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

const SEARCH_URL_STEM = "https://www.youtube.com/results?search_query=";
const VIDEO_URL_STEM = "www.youtube.com/watch?v=";

const getSearchURL = (track) => {
    return SEARCH_URL_STEM+encodeURIComponent(track.name + " " + track.artists[0].name + " official audio");
}

const getWindowTitle = (track, i, len) => {
    return track.name + " - " + track.artists[0].name + ` (Song ${i+1}/${len})`;
}

/**
 * @param tracks array of track objects from spotify API
 */
const parseTracks = (tracks) => {
    let idx = 0;
    let currentSearchURL = getSearchURL(tracks[idx].track);

    const win = new BrowserWindow();
    win.on("page-title-updated", (event) => event.preventDefault());

    const updateWindow = () => {
        win.loadURL(currentSearchURL);
        win.setTitle(getWindowTitle(tracks[idx].track, idx, tracks.length));
    };

    const menu = Menu.buildFromTemplate([
        {
            label: "Download",
            click: () => {
                if (win.webContents.getURL().includes(VIDEO_URL_STEM)) { //check if reasonable url to download (ex. if you paste in youtube.com to yt-dlp, it'll try to download all recommendations)
                    spawn("../yt-dlp.exe", ["-o", "%(title)s", "-x", "--audio-format", "mp3", win.webContents.getURL()], {cwd: "./downloads"}); //to add: cfg with path to yt-dlp, path to downloads directory
                    idx += 1;
                    currentSearchURL = getSearchURL(tracks[idx].track);
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
                    currentSearchURL = getSearchURL(tracks[idx].track);
                    updateWindow();
                }
            }
        } //to add: skip to song (by idx #)
    ]);
    Menu.setApplicationMenu(menu);

    updateWindow();
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