# spotify-dlp

Spotify-dlp is a desktop application built with Electron (Chromium + Node.js) that helps download Spotify playlists to mp3 using the open-source Youtube downloader [yt-dlp](https://github.com/yt-dlp/yt-dlp). Currently the app is only available on Windows.

## Demo Video (click me!)

[![spotify-dlp Demo Video](https://github.com/alexahn1929/spotify-dlp/blob/main/thumbnail.JPG?raw=true)](https://www.youtube.com/watch?v=cn6sDpyXrLw)

## Setup and Usage

Download here: [spotify-dlp.exe](https://github.com/alexahn1929/spotify-dlp/releases/tag/v1.0.0)

Before using the app, you must fill out all fields in the settings menu. This includes two fields for your Spotify API key, the path to yt-dlp.exe ([download here](https://github.com/yt-dlp/yt-dlp/releases)), and an output folder for your mp3 downloads.

To get a Spotify API key, you must have a Spotify account. Log into [developer.spotify.com](https://developer.spotify.com/dashboard), create a project (the name, description, etc. are irrelevant), and in the project settings you will need the fields "Client ID" and "Client Secret".

Once the settings have been filled, paste a Spotify playlist link from your clipboard into the app. The app gathers playlist data from the Spotify API and pulls up a Youtube search for each song. Navigate to the specific video you would like to download to mp3, click the "Download" button on the menu bar, and the mp3 file will appear in your chosen downloads folder.