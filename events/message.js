const botSettings = require("../botsettings.json");
const prefix = botSettings.prefix;
const channelid = botSettings.channelid_github;

exports.run = async (bot, message) => {

let content = message.content.toLowerCase();

if(message.content === botSettings.token){
   message.delete(0);
}

if(message.author.bot) return;
if(message.channel.type === "dm") return;

if(message.channel.id === channelid && !(content.startsWith("?verify") || content.startsWith("?done"))) {
    message.delete(0);
}

// warn and help feature
if(content.includes("hack my acc")) {
    if(content.startsWith("how do i")) {
        let cmd = bot.commands.get("hackinfo");
        cmd.run(bot, message.channel)
    } else {
        message.delete(0);
        message.author.send(`You have been warned for: \`Account Hacking Request\`. Any evasion of this automatic warning system will result in a ban from the server. All instructions for hacking can be found by using the \`${prefix}hackinfo\` command in the server.`)
    }
}


let messageArray = message.content.split(/\s+/g);
let command = messageArray[0].toLowerCase();
let args = messageArray.slice(1);

// if (message.channel.id === "450830883440558091") {
//   message.react("👍").then(message.react("👎"));
// }

if(!command.startsWith(prefix)) return;

let cmd = bot.commands.get(command.slice(prefix.length))
if(cmd) cmd.run(bot, message, args);


}
