const { MessageEmbed } = require('discord.js');

const catalysts = async (message) => {
    const embed = new MessageEmbed()
        .setColor('#800b03')
        .setDescription(`
            <:icons8sword:644265939009011723> <:icons8archersbow:644246512926195734> <:icons8spear:644265939310739476> <:icons8magicwand:644277713216995348> <:icons8wheel:644265939441025024> ๐ช <:5958_BrokenHeroSword:644265939126321153> ๐ก โ ๐ฌ <:1426_pistol:643527652317331472> ๐ ๐ฎ โ <:6164_Instant_Ramen:643527652803739658> ๐ ๐ฃ <:icons8poisonbottle:646074309575573525> โณ ๐ก ๐ ๐น ๐ฟ ๐ท ๐ฅผ ๐ญ ๐ฌ <:3679_silver:643527652250222604> <:9777_gold:643527652464001024> ๐ <:6191_water_water:643527652203954186> <:Dream_Escape_Rope_Sprite:643527652531240982> <:9359_MCcoal:643529413979406336> ๐ ๐ ๐บ <:icons8matches:643527652119937065> ๐งฑ <:Donut:643527652266868767> ๐ ๐ <:7937_JustARock:643527652732567563> <:4933_MCemerald:643529381553111070> <:3182_diamond:643527652455743490> ๐ ๐งจ <:icons8energydrink:643527652434640936> <:wooden_chair:676136047545024533> <:icons8sandbucket:643527652237639701> โ`);
    message.channel.send(embed)    
}

module.exports = catalysts;