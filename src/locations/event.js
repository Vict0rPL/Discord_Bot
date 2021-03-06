const Discord = require('discord.js');
const { specialSpells } = require("../spellsList");
const { learnSpell } = require('../custom_modules/learnspell');
const auth = require("../../auth.json");
const eventGacha = require('../custom_modules/eventGacha');
const useAp = require("../custom_modules/useAp");
const { formatDistanceToNow } = require('date-fns');
const characterExpGain = require('../custom_modules/characterExpGain');
const characters = require("../charactersList");

const prefix = auth.prefix


const event = (message, user, client) => {
    const remainingTime = formatDistanceToNow(1628642138277 + 1510000000, { addSuffix: false }, { includeSeconds: true })
    const exampleEmbed = new Discord.MessageEmbed()
        .setColor('#800b03')
        .setAuthor('Ishtar', 'https://i.imgur.com/SmmPecr.jpg')
        .setDescription(`Let's make this summer an unforgettable one\nRemaining time: **${remainingTime}**`)
        .setThumbnail('https://i.imgur.com/6GWwcBH.png')
        .addField('1.', 'Event Gacha (Cost: 10000 QP)', true)
        .addField('2.', 'Display Event Gacha Details', true)
        .addField('3.', 'Summer Race (exp x3 for Summer servants)', true)
        .setFooter('f/(1-3) to choose; f/cancel to cancel')
    message.channel.send(exampleEmbed)


    const filter = m => m.content.startsWith(prefix) && m.author.id === user.playerID

    const collector = new Discord.MessageCollector(message.channel, filter, { time: 90000 });
    collector.on('collect', async message => {
        collector.stop()
        const input = message.content.slice(prefix.length).trim().split(/ +/g)[0]

        switch (input) {
            case '1':
                 // GACHA
                if (user.servants.length < user.servantsLimit) {
                    if (user.money >= 10000) {
                        await eventGacha(message)
                        await useAp(message)
                    } else {
                        message.channel.send('Not enough QP')
                    }
                } else {
                    message.channel.send(`You already have reached the maximum number of servants you can own ${user.servants.length}/${user.servantsLimit}`)
                }
                break;
            case '2':
                // Gacha Info
                const exampleEmbed = new Discord.MessageEmbed()
                    .setColor('#800b03')
                    // .setDescription('Available Servants:\n\n**Arcueid Brunestud**\n**Ciel**\n**Tohno Shiki**\n**Nrvnqsr Chaos**\n**Tohno Akiha**\nIllyasviel von Einzbern (Kaleid)\nVlad III\nKing Hassan\nDio\nRyogi Shiki\nEsdeath\nGoblin Slayer\nAtalanta (Alter)\nMadara\n\nDrop rates are equal for each character.')
                    //.setDescription('Available Servants:\n\n**Santa Artoria Alter**\n**Megumin (Lancer)**\n**Aqua (Temptress)**\nDarkness\nSatou Kazuma\nAltair\nBlitz Talker\nNursery Rhyme\nPriestess\nIskandar\nAlma Tandoji\nIvan the Terrible\nAsuka Langley Soryu\nSuzaku Kururugi\n\nDrop rates are equal for each character.')
                    .setDescription('Available Servants:\n\n**nero claudius (caster)**\n**maid alter**\n**oda nobunaga (berserker)**\n**ishtar (rider)**\n**darkness (saber)**\n**maple (rider)**\n**sinon (ruler)**\n**renji abarai (lancer)**\n**revy (archer)**\nartoria pendragon (archer)\nmordred (rider)\ntamamo no mae (lancer)\nscathach (assassin)\nsuzaku kururugi (berserker)\nmisaka mikoto (caster)\nesdeath (temptress)\numi sonoda (assassin)')
                message.channel.send(exampleEmbed)
                break;
            case '3':
                // learn spell
                // learnSpell(message, specialSpells[0])

                // beach training
                const ID = user.servants[0].id
                if (characters[ID].traits.includes("summer")){
                    await characterExpGain(message, 900);
                    await useAp(message);
                    message.channel.send('+900 Exp')
                }else{
                    await characterExpGain(message, 300);
                    await useAp(message);
                    message.channel.send('+300 Exp')
                }
                break;
            case 'cancel':
                message.channel.send('Canceled')
                break;
        }
    })
}

module.exports = event;