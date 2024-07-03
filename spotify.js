import 'dotenv/config'
import SpotifyWebApi from "spotify-web-api-node"

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.spotify_client_id,
  clientSecret: process.env.spotify_secret_key,
  redirectUri:'http://localhost:8888/callback'
});

const getPlaylistInfo = async(playlistLink) => {
  const playlistId = playlistLink.split("playlist")[1].replace("/", "");

  await spotifyApi.clientCredentialsGrant().then((data) => spotifyApi.setAccessToken(data.body['access_token']));
 
  const playlist = await spotifyApi.getPlaylistTracks(playlistId).then((data) => {
    const playlistInfo = data.body.items.map((song) => ({ name: song.track.name, artist: song.track.artists[0].name , image:song.track.album.images[0].url }))
      return playlistInfo
    })

  return playlist
}

export default getPlaylistInfo


