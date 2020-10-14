const Discord = require("discord.js");
const fs = require("fs");
const Perks = require("../utils/perks.js");
const devsio = require('../utils/devsio.js');
const colors = require("../colors.json");
const botsettings = require("../botsettings.json");
const prefix = botsettings.prefix;
const { MessageEmbed } = require("discord.js");

module.exports.run = async (bot, message, args) => {
    const member = message.guild.member(message.mentions.members.first() || args[0]);
    const tokens = Number(args[1]);

    const confirmationEmbed = new Discord.MessageEmbed()
        .setAuthor("Reviewer -", bot.avatarURL)
        .setTitle("SUCCESS")
        .setDescription("Tokens given! :tada:") 
        .setColor(colors.valid)
    
    message.delete()

    if(!member || !tokens) return error(`ERROR: Incorrect usage. You must specify the bug hunter and the amount of tokens you want to give. Correct Usage: \`${prefix}givetokens bug_hunter token_count\``);
    
    devsio.readdevs(devs => {
        if(!devs.includes(message.author.id)) return error("ERROR: Missing Permissions. You are not allowed to run this command.")
        fs.readFile("./bughuntertracker.json", "utf8", (err, data) => {
            if(err) return console.error(err);
            const bughunterArr = JSON.parse(data);
            const bughunter = bughunterArr.find(bughunter => bughunter.id === member.id);
            if(!bughunter)
                bughunterArr.push({id: member.id, tokens: tokens, tier: 0, perks: new Perks()})
            else bughunter.tokens += tokens;
            const bughunterJSON = JSON.stringify(bughunterArr);
            fs.writeFile("./bughuntertracker.json", bughunterJSON, "utf8", err => {
                if(err) console.error(err);
            });
            message.channel.sendEmbed(confirmationEmbed).then(msg => msg.delete(5000));
        });
    });

    // Error Handler
    
    function error(errorMessage) {
        const errorEmbed = new Discord.MessageEmbed()
            .setAuthor("Reviewer -", bot.avatarURL)
            .setTitle("ERROR")
            .setDescription(`${errorMessage}\nToken addition process halted. Please run the command again to restart.`)
            .setColor(colors.error);
        message.channel.send(errorEmbed).then(msg => {
            message.delete();
            msg.delete(10000);
        });
    }
}
module.exports.help = {
    name: "givetokens",
    description:"Gives tokens a bug hunter."
};
