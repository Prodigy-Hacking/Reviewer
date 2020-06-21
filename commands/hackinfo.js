const Discord = require("discord.js");
const colors = require("../colors.json");

/**
 *
 * @param {Discord.Client} bot
 * @param {Discord.TextChannel} channel
 */
module.exports.run = async (bot, message, args) => {
    let supportEmbed = new Discord.RichEmbed()
        .setAuthor("Reviewer -", bot.avatarURL)
        .setTitle("SUPPORT")
        .setDescription("All of our hacks are listed on our github, which can be accessed in the <#683847137511079959> channel. You can also watch this video for a full tutorial on how to hack: https://www.youtube.com/watch?v=HSPeyU5XGE4")
        .setColor(colors.info);
    message.channel.send(supportEmbed);
};


module.exports.help = {
    name: "hackinfo",
    description:"Instructions on how to hack."
};
