module.exports.unlock = function (guild, bugHunter) {
    if(bugHunter.perks.mockerUnlocked) return `ERROR: We stopped you from purchasing this perk because you already have it.`;

    // Unlock Perk
    bugHunter.perks.mockerUnlocked = true;

    return true;
}