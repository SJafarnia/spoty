import * as yt from 'youtube-search-without-api-key';
import ytdl from 'ytdl-core'
import fs from "fs"
import { PythonShell } from 'python-shell';
import getPlaylistInfo from "./spotify.js"

const youtubeValidatedPlaylist = async (playlistLink) => {
    const songs = await getPlaylistInfo(playlistLink);
    const songsArray = []

    for (let index = 0; index < songs.length; index++) {
        const songObject = songs[index];
        const videos = await yt.search(`${songObject.artist} - ${songObject.name}`);
        const officialVideo = videos.filter(video => (video.title.includes("Official Music Video") || video.title.includes("Official Video") || video.title.includes(songObject.name) || video.title.includes("official")))

        if (officialVideo[0] != undefined) {
            songsArray.push({
                name: songObject.name,
                artist: songObject.artist,
                image: songObject.image,
                ytLink: officialVideo[0].url,
            })
        }
    }
    return songsArray
}

const downloadTrack = async (songObject) => {
    const audioStream = ytdl(songObject.ytLink, {
        filter: "audioonly",
        quality: "highestaudio",
        format: "mp4",
    })

    const writeStream = fs.createWriteStream(`${songObject.artist} - ${songObject.name}.mp4`);
    audioStream.pipe(writeStream);

    audioStream.on('finish', async () => {
        await new Promise(resolve => setTimeout(resolve, 10000))
        let options = {
            scriptPath: './',
            encoding: 'utf8',
            pythonOptions: ['-u'],
            args: [songObject.artist, songObject.name, songObject.image]
        };
        PythonShell.run('main.py', options).then(messages => {

            console.log('results: %j', messages);
        });
    });

    console.log("donwloaded song is:", songObject.name)
}

export { youtubeValidatedPlaylist, downloadTrack }




