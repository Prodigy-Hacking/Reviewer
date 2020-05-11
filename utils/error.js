exports.error = (bot, error) => {
  let elog = bot.channels.get("486718953880813569");
  elog.send("```" + error.stack + "```");
}
