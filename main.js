const { app, BrowserWindow, Menu, session } = require("electron");
const fs = require("fs");
const {spawn} = require("node:child_process");

const { ElectronBlocker } = require('@cliqz/adblocker-electron');
const fetch = require('cross-fetch'); // required 'fetch'

const MP3Tag = require('mp3tag.js');

ElectronBlocker.fromPrebuiltAdsAndTracking(fetch).then((blocker) => {
  blocker.enableBlockingInSession(session.defaultSession);
});

const playlist = JSON.parse(fs.readFileSync("test.json"));

app.whenReady().then(() => {
    parseTracks(playlist.tracks.items);
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
    process.once("close", () => {
        const mp3tag = new MP3Tag(fs.readFileSync(downloadPath+filename)); //make sure downloadPath ends with a /
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
const parseTracks = (tracks) => {
    let idx = 0;
    let currentSearchURL = getSearchURL(tracks[idx].track);

    const win = new BrowserWindow();
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
            label: "Download",
            click: () => {
                if (win.webContents.getURL().includes(VIDEO_URL_STEM)) { //check if reasonable url to download (ex. if you paste in youtube.com to yt-dlp, it'll try to download all recommendations)
                    const dl_process = spawn("../yt-dlp.exe", ["-o", `tempfile_${idx}`, "-x", "--audio-format", "mp3", win.webContents.getURL()], {cwd: "./downloads/"}); //to add: cfg with path to yt-dlp, path to downloads directory
                    updateMetadata(dl_process, tracks[idx].track, `tempfile_${idx}.mp3`, "./downloads/");
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
    Menu.setApplicationMenu(menu);

    updateWindow();
};