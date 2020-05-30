module.exports.run = async (bot, message, args) => bot.commands.get("user").run(bot, message, args);
module.exports.help = {
    name: "profile",
    description:"Gets user info for a user."
};
