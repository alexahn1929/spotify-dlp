require('dotenv').config();
const fs = require("node:fs");
const url = require("node:url");
const https = require("node:https");

let savedToken = "PLACEHOLDER";

const getToken = () => new Promise((resolve, reject) => { //to be called using the resolve/reject static functions in the promise class
    const options = {
        hostname: "accounts.spotify.com",
        method: "POST",
        path: `/api/token?grant_type=client_credentials&client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}`,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        }
    };
    
    let responseData = [];

    const req = https.request(options, (res) => {
        if (res.statusCode != 200) {
            reject(new Error("Could not obtain new access token"));
        }
        res.on('data', (d) => {responseData.push(d.toString())});
    });
    
    req.once("close", () => {
        console.log("token: "+JSON.parse(responseData.join("")).access_token)
        resolve(JSON.parse(responseData.join("")).access_token);
    });

    req.end();
});

const getPlaylistAPIUrl = (link) => {
    const HOSTNAME = "open.spotify.com";
    const PATH_PREFIX = "/playlist/";
    
    const playlistURL = url.parse(link);

    if (playlistURL.hostname != HOSTNAME || !playlistURL.pathname.includes(PATH_PREFIX)) {
        throw new Error("Could not parse playlist ID from URL");
    }

    const playlistID = playlistURL.pathname.substring(playlistURL.pathname.lastIndexOf("/")+1);
    return `https://api.spotify.com/v1/playlists/${playlistID}/tracks`;
};

const getPlaylist = (apiURL) => new Promise((resolve, reject) => {
    const options = {
        headers: {"Authorization": `Bearer ${savedToken}`}
    };
    let responseData = [];

    const req = https.request('https://api.spotify.com/v1/playlists/1ID56tk92tPTeIJ5jH8aUb/tracks?offset=100&limit=99', options, (res) => {
        if (res.statusCode == 401) { //expired token
            resolve(getToken().then((newToken) => {
                savedToken = newToken;
                console.log("token: "+savedToken)
                return getPlaylist(apiURL);
            }));
        } else if (res.statusCode == 403) {
            reject(new Error("Bad OAuth request"));
        } else if (res.statusCode == 429) {
            reject(new Error("API rate limit exceeded"));
        }
        res.on('data', (d) => {responseData.push(d.toString())});
    });
    
    req.once("close", () => {
        const output = JSON.parse(responseData.join(""));
        resolve(output);
        //to do: pull jsons for entire playlist (ceil(# songs//100) API requests) and concat into single array
    });

    req.end();
});

//test();
getPlaylist(getPlaylistAPIUrl("https://open.spotify.com/playlist/1ID56tk92tPTeIJ5jH8aUb?si=53c3f6f9a151418a")).then((output) => console.log(output));