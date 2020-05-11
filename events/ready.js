const botsettings = require("../botsettings.json")
exports.run = async (bot,message) =>
{
  console.log(`\n\n${bot.user.username} is at your service.`);
  console.log("\n\nReady to begin! Serving " + bot.guilds.size + " guilds.\n\n");
  bot.user.setPresence({ status: "online", game: {name: `${botsettings.prefix}help for ${bot.users.size.toLocaleString()} users.`}}); 
};
