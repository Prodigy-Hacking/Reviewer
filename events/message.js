const botSettings = require("../botsettings.json");
const prefix = botSettings.prefix;
exports.run = async (bot, message) => {
    if(message.content === botSettings.token){
        message.delete(0);
    }
if(message.author.bot) return;
if(message.channel.type === "dm") return;

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
