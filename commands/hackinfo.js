const Discord = require("discord.js");
const colors = require("../colors.json");

/**
 *
 * @param {Discord.Client} bot
 * @param {Discord.TextChannel} channel
 */
module.exports.run = async (bot, channel) => {
    let supportEmbed = new Discord.RichEmbed()
        .setAuthor('Reviewer -', bot.avatarURL)
        .setTitle("SUPPORT")
        .setDescription(`All of our hacks are listed on our github, which can be accessed in the <#710159575738744985> channel. You can also watch this video for a full tutorial on how to hack: https://www.youtube.com/watch?v=DMwDyV9mmsM`)
        .setColor(colors.info)
    channel.sendEmbed(supportEmbed)
}


module.exports.help = {
    name: "hackinfo",
    description:"Instructions on how to hack."
}
