const Discord = require("discord.js");
const fs = require("fs");
const Perks = require("../utils/perks.js")
const colors = require("../colors.json");
const { MessageEmbed } = require("discord.js");
/**
 *
 * @param {Discord.Client} bot
 * @param {Discord.TextChannel} channel
 */
module.exports.run = async (bot, message, args) => {
    let member = message.guild.member(message.mentions.members.first() || args[0] || message.author);

    if(!member) return error(`ERROR: \`${args[0]}\` is not a user.`)

    const tierColors = [colors.tier0, colors.tier1, colors.tier2, colors.tier3, colors.tier4, colors.tier5]
    const tierRomanNumerals = ["I", "II", "III", "IV", "V"]
    // Get user info
    fs.readFile("./bughuntertracker.json", "utf8", (err, data) => {
        if(err) return console.error(err);
        const bugHunterArr = JSON.parse(data);
        const bugHunter = bugHunterArr.find(bughunter => bughunter.id === member.id);
        if(bugHunter) {
            const bugHunterPerks = bugHunter.perks;
            let userInfoEmbed = new Discord.MessageEmbed()
                .setAuthor("Reviewer -", bot.avatarURL)
                .setTitle("USERINFO")
                .setDescription(`**User info for \`${member.user.tag}\`\n\n${bugHunter.tier ? `Tier ${tierRomanNumerals[bugHunter.tier - 1]} ` : ``}Bug Hunter**`)
                .addField("Tokens", bugHunter.tokens)
                .addField("Unlocked Perks", Perks.unlockedToString(bugHunterPerks))
                .setColor(tierColors[bugHunter.tier])
                .setFooter("Requested by: " + message.author.tag, message.author.displayAvatarURL);
            message.channel.send(userInfoEmbed);
        } else {
            let userInfoEmbed = new Discord.MessageEmbed()
                .setAuthor("Reviewer -", bot.avatarURL)
                .setTitle("USERINFO")
                .setDescription(`**User info for \`${member.user.tag}\`\n\nNot a bug hunter.**`)
                .setColor(colors.user)
                .setFooter("Requested by: " + message.author.tag, message.author.displayAvatarURL);
            message.channel.send(userInfoEmbed);
        }
    });

    // Error Handler
    
    function error(errorMessage) {
        const errorEmbed = new Discord.MessageEmbed()
            .setAuthor("Reviewer -", bot.avatarURL)
            .setTitle("ERROR")
            .setDescription(`${errorMessage}\nUser info process halted. Please run the command again to restart.`)
            .setColor(colors.error);
        message.channel.send(errorEmbed).then(msg => {
            message.delete();
            msg.delete(5000);
        });
    }
};


module.exports.help = {
    name: "user",
    description:"Gets user info for a user."
};
