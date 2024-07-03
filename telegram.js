import 'dotenv/config'
import TelegrafPkg from 'telegraf'
import messagePkg from 'telegraf/filters'
import { youtubeValidatedPlaylist, downloadTrack } from "./downloadPlaylist.js"
import fs from "fs"
import prisma from './db.js'

const { Telegraf } = TelegrafPkg
const { message } = messagePkg

const bot = new Telegraf(process.env.BOT_TOKEN)
bot.on(message("link_preview_options"), (async (ctx) => {
  try {
    if (ctx.message.text.includes("https://open.spotify.com/playlist/")) {
      ctx.reply("wait for a few seconds...")

      const validatedPlaylist = await youtubeValidatedPlaylist(ctx.message.text);

      for (let index = 0; index < validatedPlaylist.length; index++) {
        // query db for song name and artist
        const res = await prisma.record.findFirst({
          where: {
            artist: validatedPlaylist[index].artist,
            trackName: validatedPlaylist[index].name,
          }
        });

        if (res) {
          const forwardedMsg = await bot.telegram.forwardMessage(ctx.chat.id, "-1002240881892", res.messageId);
          validatedPlaylist.f
          // console.log({ forwardedMsg });
        } else {
          let exists = false

          await downloadTrack(validatedPlaylist[index]);

          while (exists == false) {
            await new Promise(resolve => setTimeout(resolve, 2000));

            if (fs.existsSync(`${validatedPlaylist[index].artist} - ${validatedPlaylist[index].name}.mp3`)) {
              await new Promise(resolve => setTimeout(resolve, 10000));
              exists = true;

              const sentAudio = await ctx.sendAudio({ source: `${validatedPlaylist[index].artist} - ${validatedPlaylist[index].name}.mp3` }).then(async (result) => {
                await new Promise(resolve => setTimeout(resolve, 5000));
                const newMsg = await bot.telegram.forwardMessage("-1002240881892", ctx.chat.id, result.message_id);
                console.log("newmsg audio", newMsg)
                const newRecord = await prisma.record.create({
                  data: {
                    artist: validatedPlaylist[index].artist,
                    trackName: validatedPlaylist[index].name,
                    messageId: `${newMsg.message_id}`
                  }
                })

                await new Promise(resolve => setTimeout(resolve, 5000));
                fs.unlink(`${validatedPlaylist[index].artist} - ${validatedPlaylist[index].name}.mp3`, (err) => {
                  if (err) {
                    console.error("Error deleting file:", err);
                  } else {
                    console.log("File deleted successfully!");
                  }
                });

                console.log({ newRecord })
              })

            }
          }
          console.log({ exists })
        }
      }
    }
  } catch (error) {
    console.error(error);
    ctx.reply('An error occurred. Please try again later.');
  }
}))

bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
