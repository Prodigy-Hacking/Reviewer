module.exports.unlock = function (guild, bugHunter) {
    if(bugHunter.perks.launcherUnlocked) return `ERROR: We stopped you from purchasing this perk because you already have it.`;

    // Unlock Perk
    bugHunter.perks.launcherUnlocked = true;

    return true;
}