const botsettings = require("../botsettings.json");
exports.run = async (bot, msg) => {
    console.log(`\n\n${bot.user.username} is at your service.`); 
    console.log("\n\nReady to begin! Serving " + bot.guilds.size + " guilds.\n\n");

    bot.reporting = new Set();
    bot.user.setPresence({
        status: "online",
        game: {
            name: `${botsettings.prefix}help for ${bot.users.size} users.`
        }
    });
    setInterval(() => bot.user.setPresence({
        status: "online",
        game: {
            name: `${botsettings.prefix}help for ${bot.users.size} users.`
        }
    }), 60 * 60 * 1000); 
};
