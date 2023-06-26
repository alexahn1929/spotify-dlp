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
    event.target.placeholder = "Left-click to paste Spotify playlist URL:";
};
input.onmouseup = (event) => {
    //console.log(event.target.placeholder)
    errLog.innerText = "Acquiring playlist from API..."
    electronAPI.handlePlaylist(event.target.placeholder);
    //window.electronAPI.handlePlaylist(event.target.placeholder);
};

let dlpLink = document.getElementById("yt-dlp-link");
dlpLink.onmouseup = (event) => {
    electronAPI.viewYtDlp();
}