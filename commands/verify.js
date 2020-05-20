const Discord = require("discord.js");
const fetch = require("node-fetch");
const colors = require("../colors.json");
const botsettings = require("../botsettings.json");
const prefix = botsettings.prefix;
const roleid = botsettings.roleid_github;
const channelid = botsettings.channelid_github;

/**
 *
 * @param {Discord.Client} bot
 * @param {Discord.Message} message
 */
module.exports.run = async (bot, message, args) => {
    //Check for userID and check if in right channel
    let member = message.guild.member(message.author);
    let channel = message.channel;
    let username = args[0];
    //Errors
    if(channel.id !== channelid) return error(`ERROR: Incorrect usage. Please run this command in the <#${channelid}> channel!`)
    if(!username) return error(`ERROR: Incorrect usage. Use \`${prefix}verify Github_Username\` to properly run this command!`)
    //Instructions for user.
    let dialogue = [
        `To start verification, we need you to create a new gist. Make sure you are logged into your github account!`,
        `Please click on this link to create a new public gist: https://gist.github.com/.`,
        `You will need to name this new gist \`prodigy.md\`. Paste \`${member.id}\` into the code of the gist and click \`Create public gist\`.`,
    ]
    //Beginning Message
    dialogue.forEach(msrtg => {
        let promptGistCreateEmbed = new Discord.RichEmbed()
            .setAuthor('Reviewer -', bot.avatarURL)
            .setTitle("VERIFY")
            .setDescription(msg)
            .setColor(colors.info)
        channel.send(promptGistCreateEmbed)
    })
    //Pending message
    let promptGistCreateEmbed = new Discord.RichEmbed()
        .setAuthor('Reviewer -', bot.avatarURL)
        .setTitle("Waiting...")
        .setDescription(`When you are done with the previous steps, come back to this channel and type ${prefix}done.`)
        .setColor(colors.standby)
    //Success message
    let verifiedEmbed = new Discord.RichEmbed()
        .setAuthor('Reviewer -', bot.avatarURL)
        .setTitle("VERIFIED!")
        .setDescription(`You're all good to go! We have added the \`@github\` role to your user.`)
        .setColor(colors.valid)
    //Starts gist prompt
    startGistPrompt(member, promptGistCreateEmbed)

    // Ask user to create new gist
    function startGistPrompt(member, embed) {
        channel.send(embed).then(() => waitForDone(member))
    }

    // Wait for done.

    function waitForDone(member) {
        let filter = m => m.author.id === member.id;
        channel.awaitMessages((() => true), {max: 1}).then(collected => {
            collected.forEach(msg => {
                if(filter(msg)) {
                    return msg.content.startsWith(`${prefix}done`)? 
                    getLatestGist(username) : 
                    error(`ERROR: Your message was not ${prefix}done.`);
                } else waitForDone(member)
            })
        })
    }

    // Check user for new gist.

    function getLatestGist(username) {
        fetch(`https://api.github.com/users/${username}/gists`).then(res => res.json()).then(gists => {
            let verifygists = gists.filter(gist => gist.files.hasOwnProperty("prodigy.md"))
            if(verifygists.length > 0) {
                let verificationGistUrl = verifygists[0].files["prodigy.md"].raw_url;
                fetch(verificationGistUrl).then(res => res.text()).then(data => {
                    return verify(member, data);
                })
            } else {
                return error(`ERROR: No new gists for user ${username} with filename prodigy.md`)
            }
            
        }).catch(err => error(`ERROR: Fetch for latest gists of ${username} returned an error. This user probably doesn't exist.`));
    }

    // Verify that gist data matches discord id.

    function verify(member, gistData) {
        return member.id === gistData ? assign(member) : error(`ERROR: Trust faliure! Gist data does not match discord id. If you believe you are the true owner of the ${username} github account, please contact a staff member.`);
    }

    // Assign Roles

    function assign(member) {
        let role = message.guild.roles.find(r => r.id === roleid)
        member.addRole(role).then(channel.send(verifiedEmbed))
    }

    // Error Handler
    
    function error(errorMessage) {
        let errorEmbed = new Discord.RichEmbed()
            .setAuthor('Reviewer -', bot.avatarURL)
            .setTitle("ERROR")
            .setDescription(`${errorMessage}\nVerification process halted. Please run the command again to restart verification.`)
            .setColor(colors.error)
        channel.send(errorEmbed)
    }
}


module.exports.help = {
    name: "verify",
    description:`Connect your discord account to github. Can only be run in <#${channelid}> channel.`
}


