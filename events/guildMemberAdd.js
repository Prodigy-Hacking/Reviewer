const Discord = require("discord.js");
const colors = require("../colors.json");
const botsettings = require("../botsettings.json");
const prefix = botsettings.prefix;
const mintime = botsettings.mintime;
const roleid = botsettings.roleid_member;

exports.run = (bot, member) => 
{
    let dialogue = [
        `Welcome to the ProdigyMathGameHacking Discord!`,
        `Before we get you started, we need you to become familiar with our rules and faq.`,
        `They can be found on our server in the <#687339734279651375> and <#701517404659777666> channels.`
    ]

    dialogue.forEach(msg => {
        let welcomeEmbed = new Discord.RichEmbed()
            .setAuthor('Reviewer -', bot.avatarURL)
            .setTitle("WELCOME")
            .setDescription(msg)
            .setColor(colors.info)
        member.sendEmbed(welcomeEmbed);
    })
    let startReviewEmbed = new Discord.RichEmbed()
        .setAuthor('Reviewer -', bot.avatarURL)
        .setTitle("REVIEWING...")
        .setDescription(`Come back to this DM and type ${prefix}finish when you are done carefully reading the rules!`)
        .setColor(colors.standby)
    let errorEmbed = new Discord.RichEmbed()
        .setAuthor('Reviewer -', bot.avatarURL)
        .setTitle("FAILED")
        .setDescription(`Please read all of our rules very carefully, then come back and type ${prefix}finish.`)
        .setColor(colors.error)
    let successEmbed = new Discord.RichEmbed()
        .setAuthor('Reviewer -', bot.avatarURL)
        .setTitle("SUCCESS")
        .setDescription(`Thank you for reading all of our rules, you will now have access to our server.\nRemember to abide by these rules or your account may be punished.`)
        .setColor(colors.valid)

    review(member, startReviewEmbed);

    function review(member, statusEmbed) {
        member.sendEmbed(statusEmbed).then(() => {
            let filter = m => true;
            let startTime = Date.now();
            member.user.dmChannel.awaitMessages(filter, {max: 1}).then(collected => {
                collected.forEach(msg => {
                    ((Date.now() - startTime) > (60000 * mintime)) && msg.content.startsWith(`${prefix}finish`) ? 
                    validate(member) : 
                    review(member, errorEmbed)
                })
            })
        })
    }
    function validate(member) {
        member.sendEmbed(successEmbed).then(() => {
            let role = member.guild.roles.find(r => r.id === roleid)
            member.addRole(role)
        })
    }
}