module.exports.run = async (bot, message, args) => bot.commands.get("store").run(bot, message, args);
module.exports.help = {
    name: "shop",
    description:"The store where you can exchange bug tokens for cool perks!"
};
