let input = document.getElementById("url")
let errLog = document.getElementById("error-log")

electronAPI.onPlaylistError((event, error) => {
    errLog.innerText = "Error: " + error.message;
});
electronAPI.onPlaylistFound((event) => {
    errLog.innerText = "";
});

input.onmouseenter = async (event) => {
    navigator.clipboard.readText().then((text) => {
        event.target.placeholder = text;
    });
    /*console.log(event.target.placeholder)
    await electronAPI.handlePlaylist(event.target.placeholder);
    await electronAPI.test();*/
};
input.onmouseleave = (event) => {
    event.target.placeholder = "Click to paste Spotify playlist URL:";
};
input.onmouseup = (event) => {
    //console.log(event.target.placeholder)
    errLog.innerText = "Acquiring playlist from API..."
    electronAPI.handlePlaylist(event.target.placeholder);
    //window.electronAPI.handlePlaylist(event.target.placeholder);
};

let dlpLink = document.getElementById("yt-dlp-link");
dlpLink.onmouseup = (event) => {
    event.preventDefault(); //stop from clearing settings
    electronAPI.viewYtDlp();
}

let input_id = document.getElementById("id");
let input_secret = document.getElementById("secret");
let saveButton = document.getElementById("save");

saveButton.onmouseup = (event) => {
    electronAPI.saveAPIKey(input_id.value.trim(), input_secret.value.trim());
};

let input_downloads = document.getElementById("downloads");
let input_ytdlp = document.getElementById("ytdlp");

electronAPI.onPopulateSettings((event, settings) => {
    input_id.value = settings.client_id;
    input_secret.value = settings.client_secret;
    input_downloads.value = settings.download_path;
    input_ytdlp.value = settings.ytdlp_path;
});

input_downloads.onmouseup = (event) => {
    electronAPI.updateDownloadsPath();
};
input_ytdlp.onmouseup = (event) => {
    electronAPI.updateYtdlpPath();
};