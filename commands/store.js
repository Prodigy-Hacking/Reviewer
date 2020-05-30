const Discord = require("discord.js");
const colors = require("../colors.json");
const storeJSON = require("../store.json");

/**
 *
 * @param {Discord.Client} bot
 * @param {Discord.TextChannel} channel
 */
module.exports.run = async (bot, message, args) => {
    let storeEmbed = new Discord.RichEmbed()
        .setAuthor("Reviewer -", bot.avatarURL)
        .setTitle("STORE")
        .setDescription("The store where you can exchange bug tokens for cool perks!\n\nNOTE: BT stands for Bug Tokens and is not part of the item's name.")
        .setColor(colors.info);
    Object.entries(storeJSON).forEach(([key, val]) => {
        storeEmbed.addField(key.split("_").map(perk => perk.charAt(0).toUpperCase() + perk.slice(1)).join(" ") + ` (${val.tokens} BT)`, val.description, true)
    })
    message.channel.send(storeEmbed);
};


module.exports.help = {
    name: "store",
    description:"The store where you can exchange bug tokens for cool perks!"
};
