const { MessageEmbed, MessageAttachment, MessageCollector} = require('discord.js');
const renderBattle = require('../renderBattle2');
const { castSpell } = require('../castSpell');
const Server = require('../../models/Server');
const { BattleUnit } = require('../../models/BattleUnit');
const auth = require("../../../auth.json");
const np = require('../specials');
const useItem = require('../useItem');
const statusCheck = require('../statusCheck');
const mobsList = require('../../mobsList');
const updatePlayer = require('../updatePlayer');
const blockAction = require('../blockAction');
const mobNp = require('../mobsSpecials');
const prefix = auth.prefix;
const backgrounds = require('../../backgrounds');
const showCurrentStats = require('../servantFight/showCurrentStats');
const abilityCheck = require('../abilityCheck');

// 1. take player1 data from the db and send ping to P2 to join
// 2. create battlefield(Object?) and add P1 and S1
//3. if P2 joins; get their data from the db and add player2 P2 and S2 to Object
//4. Battle part???
//5. remove loser's servant from array and update both players; delete Object

const playerTurn = async (message, battlefield, first, second) => {
    //battle start
    await renderBattle(message, first, second, battlefield.background, true)
    message.channel.send(`Turn ${Math.floor(battlefield.turn)}`)
    // message.channel.send(`${battlefield.servant1.name[0]} hp: ${battlefield.servant1.currentHp}/${battlefield.servant1.maxHp}\nStats:${battlefield.servant1.stats}\nStatus:${battlefield.servant1.status}\ntakenDMG:${battlefield.servant1.takenDmg}`)
    // message.channel.send(`${battlefield.servant2.name[0]} hp: ${battlefield.servant2.currentHp}/${battlefield.servant2.maxHp}\nStats:${battlefield.servant2.stats}\nStatus:${battlefield.servant2.status}\ntakenDMG:${battlefield.servant2.takenDmg}`)


    let firstName = ''
    if (first.revealed) {
        firstName = first.name[0]
    } else {
        firstName = first.class
    }

    let secondName = ''
    if (first.revealed) {
        secondName = second.name[0]
    } else {
        secondName = second.class
    }
    const exampleEmbed = new MessageEmbed()
        .setColor('#800b03')
        .setAuthor(`${firstName}`, `${first.pictures[0]}`)
        .setDescription('Your orders master? (60 seconds)')
        .addField('1.', 'Attack', true)
        .addField('2.', 'Use Spell', true)
        .addField('3.', 'Use Item', true)
        .addField('4.', 'Use Noble Phantasm', true)
        .addField('5.', 'Reveal enemy identity', true)
        .addField('6.', 'Use Command Seal', true)
        .addField('7.', 'Show status', true)
        .setFooter('f/(1-7) to choose')

    await message.channel.send(exampleEmbed)


    const filter = m => m.content.startsWith(prefix) && m.author.id === message.author.id
    const collector1 = new MessageCollector(message.channel, filter, { time: 60000 });
    collector1.on('collect', async message => {

        const input = message.content.slice(prefix.length).trim().split(/ +/g)[0]
        switch (input) {
            case '1':
                //attack
                //if stunned
                if (first.status.stun.active === true) {
                    message.channel.send(`${firstName} is stunned they can not move!`)
                    collector1.stop('attack')
                    break;
                } else {
                    // if confused
                    if (first.status.confusion.active === true) {
                        let confuse = Math.floor(Math.random() * 2);
                        if (confuse === 0) {
                            let dmg = second.takeAttackDammage([first.inflictDammage, message, false])
                            message.channel.send(`Dealt ${dmg} damage`)
                            if (first.passive[0] == "Sadist") {
                                first.buffStrength(dmg * 0.15)
                            }
                            collector1.stop('attack')
                            break;
                        } else {
                            // confusion triggers servant hits themselves
                            let dmg = first.takeAttackDammage([first.inflictDammage, message, false])
                            message.channel.send(`Dealt ${dmg} damage`)
                            message.channel.send(`${firstName} got hurt in their confusion!`)
                            collector1.stop('attack')
                            break;
                        }

                    } else {
                        let dmg = second.takeAttackDammage([first.inflictDammage, message, false])
                        message.channel.send(`Dealt ${dmg} damage`)
                        if (first.passive[0] == "Sadist") {
                            first.buffStrength(dmg * 0.15)
                        }
                        collector1.stop('attack')
                        break;
                    }
                }



            case '2':
                //spell
                if (battlefield.player1.spells.length !== 0) {
                    collector1.stop('spell')
                    let allSpells = ""

                    if(battlefield.player1.spells.length >= 11){
                        battlefield.player1.spells.forEach((element, i = 0) => {
                            allSpells += `${i}. **${element.name} Lvl.${element.level}** (mana cost: ${element.manaNeeded} Mp) \n`
                            if ( i % 10 === 0 && i !== 0) {
                                let exampleEmbed = new MessageEmbed()
                                    .setColor('#800b03')
                                    .setTitle(`Choose spell to cast ${battlefield.player1.currentMana}/${battlefield.player1.maxMana}MP (30 seconds)`)
                                    .setDescription(allSpells)
                                    .setFooter('f/number to cast; f/back to go back')
                                message.channel.send(exampleEmbed);

                                allSpells = ""
                            }
                            i++
                        });
                        if(allSpells !== ""){
                            let exampleEmbed = new MessageEmbed()
                                .setColor('#800b03')
                                .setTitle(`Choose spell to cast ${battlefield.player1.currentMana}/${battlefield.player1.maxMana}MP (30 seconds)`)
                                .setDescription(allSpells)
                                .setFooter('f/number to cast; f/back to go back')
                            message.channel.send(exampleEmbed);
                        }
                    } else{
                        battlefield.player1.spells.forEach((element, i = 0) => {
                            allSpells += `${i}. **${element.name}** (mana cost: ${element.manaNeeded} Mp) \n`
                            i++
                        });

                        let exampleEmbed = new MessageEmbed()
                            .setColor('#800b03')
                            .setTitle(`Choose spell to cast ${battlefield.player1.currentMana}/${battlefield.player1.maxMana}MP (30 seconds)`)
                            .setDescription(allSpells)
                            .setFooter('f/number to cast; f/back to go back')
                        message.channel.send(exampleEmbed);
                    }
                    

                    const filter = m => m.content.startsWith(prefix) && m.author.id === message.author.id
                    const collector2 = new MessageCollector(message.channel, filter, { time: 30000 });
                    collector2.on('collect', async message => {
                        let spellData = ""
                        let input = message.content.slice(prefix.length).trim().split(/ +/g)[0]
                        if(input == 'back'){
                            // spellData = "back" 
                            collector2.stop('back')
                        } else if (input && parseInt(input) >= 0 && parseInt(input) < battlefield.player1.spells.length) {
                            input = Math.floor(input)
                            spellData = await castSpell(message, input, battlefield.player1)
                            // console.log(spellData)
                            if (spellData === 0) {
                                message.channel.send(`Not enough mana! **${battlefield.player1.currentMana}**MP left.`)
                            } else {
                                if (spellData.target === "self") {
                                    first.takeSpellEffect = spellData
                                } else if (spellData.target === "enemy") {
                                    second.takeSpellEffect = spellData
                                }
                                switch (spellData.spellType) {
                                    case 'buffStrength':
                                        message.channel.send(`${firstName}'s strength rose`)
                                        break;
                                    case 'buffDefence':
                                        message.channel.send(`${firstName}'s defence rose`)
                                        break;
                                    case 'buffAgility':
                                        message.channel.send(`${firstName}'s agility rose`)
                                        break;
                                    case 'buffMagic':
                                        message.channel.send(`${firstName}'s magic rose`)
                                        break;
                                    case 'buffLuck':
                                        message.channel.send(`${firstName}'s luck rose`)
                                        break;
                                    case 'debuffStrength':
                                        message.channel.send(`${secondName}'s strength fell`)
                                        break;
                                    case 'debuffDefence':
                                        message.channel.send(`${secondName}'s defence fell`)
                                        break;
                                    case 'debuffAgility':
                                        message.channel.send(`${secondName}'s agility fell`)
                                        break;
                                    case 'debuffMagic':
                                        message.channel.send(`${secondName}'s magic fell`)
                                        break;
                                    case 'debuffLuck':
                                        message.channel.send(`${secondName}'s luck fell`)
                                        break;
                                }


                            }
                            collector2.stop()
                        } else {
                            spellData = ""
                            message.channel.send('Wrong number.')
                        }
                        

                    })

                    collector2.on('end', async (collected, reason)  => {
                        if (reason && reason === 'back') {
                            playerTurn(message, battlefield, first, second)
                        } else{
                            statusCheck(message, first, firstName, second, battlefield)
                            if (first.currentHp > 0 && second.currentHp > 0) {
                                mobTurn(message, battlefield, second, first)
                            } else {
                                if(battlefield.rewind === true){
                                    startBattle(ogMessage, ogBattlefield)
                                } else{
                                    message.channel.send("Match over!")
                                    await renderBattle(message, first, second, battlefield.background, true)
                                    await updatePlayer(message, battlefield.player1, first, second, false)
                                }
                            }
                        }
                        
                    })

                } else {
                    message.channel.send("You don't know any spells.")
                }
                break;

            case '3':
                //item

                if (battlefield.player1.inventory.length != 0) {
                    let useableItems = ""
                    let canBeSelected = []

                    battlefield.player1.inventory.forEach((element, i = 0) => {
                        if (element.consumeable === true) {
                            useableItems += `${i}. **${element.name}** x${element.quantity}\n`// do something about indexes "i"?
                            canBeSelected.push(i.toString());
                        }
                        i++
                    });
                    if (canBeSelected.length != 0) {
                        collector1.stop('item')

                        const exampleEmbed = new MessageEmbed()
                            .setColor('#800b03')
                            .setTitle('Choose item to use (30 seconds)')
                            .setDescription(useableItems)
                            .setFooter('f/number to use; f/back to go back')
                        message.channel.send(exampleEmbed);

                        const filter = m => m.content.startsWith(prefix) && m.author.id === message.author.id
                        const collector2 = new MessageCollector(message.channel, filter, { time: 30000 });
                        collector2.on('collect', async message => {

                            let input = message.content.slice(prefix.length).trim().split(/ +/g)[0]
                            if (input == 'back') {
                                collector2.stop('back')
                            } else{
                                if (canBeSelected.includes(input)) {
                                    useItem(first, second, battlefield.player1, message, input)
                                    collector2.stop()
                                } else {
                                    message.channel.send("Wrong Item!")
                                }
                            }
                            

                        })

                        collector2.on('end', async (collected, reason) => {
                            if (reason && reason === 'back') {
                                playerTurn(message, battlefield, first, second)
                            } else{
                                statusCheck(message, first, firstName, second, battlefield)
                                if (first.currentHp > 0 && second.currentHp > 0) {
                                    mobTurn(message, battlefield, second, first)
                                } else {
                                    if(battlefield.rewind === true){
                                        startBattle(ogMessage, ogBattlefield)
                                    } else {
                                        message.channel.send("Match over!")
                                        await renderBattle(message, first, second, battlefield.background, true)
                                        await updatePlayer(message, battlefield.player1, first, second, false)
                                    }
                                    
                                }
                            }
                            
                        })

                    } else {
                        message.channel.send("You don't have any items that could be used in battle.")
                    }

                } else {
                    message.channel.send("You don't have any items.")
                }

                break;

            case '4':
                // NP
                if (first.status.npSeal.active === true && first.passive[0] != "Right-sider") {
                    message.channel.send(`${firstName} can't use their Noble Phantasm due to the NP Seal!`)
                    break;
                } else if (first.charge < 7) {
                    message.channel.send(`${firstName} Noble Phantasm is not fully charged yet.`)
                    break;

                } else {
                    collector1.stop('np')
                    
                    break;
                }


            case '5':
                // name
                if (second.revealed) {
                    message.channel.send(`You already know ${second.class}'s true name.`)

                } else {
                    collector1.stop('name')
                    message.channel.send('type f/ + enemy name (30 seconds)');

                    const filter = m => m.content.startsWith(prefix) && m.author.id === message.author.id
                    const collector2 = new MessageCollector(message.channel, filter, { time: 30000 });
                    collector2.on('collect', async message => {
                        const guess = message.content.slice(prefix.length).trim().split(/ +/g)
                        const input = guess.join(" ");
                        // console.log(input);
                        // console.log(second.name[0]);
                        if (second.name.includes(input.toLowerCase())) {
                            second.stats.strength = second.stats.strength / 2
                            second.stats.magic = second.stats.magic / 2
                            second.revealed = true
                            message.channel.send(`That's right, it's ${input}!\n${input}'s strength and magic stats fell significantly...`)
                        } else {
                            message.channel.send('Wrong! You lose your turn.')
                        }
                        collector2.stop()
                    })

                    collector2.on('end', async () => {
                        statusCheck(message, first, firstName, second, battlefield)
                        if (first.currentHp > 0 && second.currentHp > 0) {
                            mobTurn(message, battlefield, second, first)
                        } else {
                            if(battlefield.rewind === true){
                                startBattle(ogMessage, ogBattlefield)
                            } else {
                                message.channel.send("Match over!")
                                await renderBattle(message, first, second, battlefield.background, true)
                                await updatePlayer(message, battlefield.player1, first, second, false)
                            }
                            
                        }
                    })

                }

                break;

            case '6':
                // seal
                if (battlefield.player1.commandsLeft <= 0) {
                    message.channel.send("You don't have any command seals left.")
                } else {
                    collector1.stop('seal')

                    const exampleEmbed2 = new MessageEmbed()
                        .setColor('#800b03')
                        .setAuthor(`${firstName}`, `${first.pictures[0]}`)
                        .setDescription(`Yes master? (comand seals left: ${battlefield.player1.commandsLeft}) (30 seconds)`)
                        .addField('1.', `Fight with everything you've got ${first.class}! (strength and magic + 50%)`, true)
                        .addField('2.', `Stand up ${first.class}! We haven't lost just yet. (fully restore hp)`, true)
                        .addField('3.', `${first.class}, gather the mana to use your Noble Phantasm! (NP can be used in the next turn.)`, true)
                        .addField('4.', `${first.class}, I order you with a Command Seal, retreat at once! (Flee from the battle.)`, true)
                        .setFooter('f/(1-4) to choose; f/back to go back')
                    message.channel.send(exampleEmbed2)


                    const filter = m => m.content.startsWith(prefix) && m.author.id === message.author.id
                    const collector2 = new MessageCollector(message.channel, filter, { time: 30000 });
                    collector2.on('collect', async message => {

                        const input = message.content.slice(prefix.length).trim().split(/ +/g)[0]
                        switch (input) {
                            case '1':
                                first.stats.strength += first.stats.strength / 2
                                first.stats.magic += first.stats.magic / 2
                                battlefield.player1.commandsLeft -= 1
                                numberOfUses = battlefield.player1.commandsLeft
                                commandSeals = battlefield.player1.commandId
                                attachment = new MessageAttachment(`./src/commandsPictures/cs${commandSeals}_${numberOfUses}.png`, `cs${commandSeals}_${numberOfUses}.png`);
                                await message.channel.send(attachment)
                                collector2.stop()
                                break;

                            case '2':
                                first.currentHp = first.maxHp
                                battlefield.player1.commandsLeft -= 1
                                numberOfUses = battlefield.player1.commandsLeft
                                commandSeals = battlefield.player1.commandId
                                attachment = new MessageAttachment(`./src/commandsPictures/cs${commandSeals}_${numberOfUses}.png`, `cs${commandSeals}_${numberOfUses}.png`);
                                await message.channel.send(attachment)
                                collector2.stop()
                                break;

                            case '3':
                                first.noblePhantasm.canBeUsed = true
                                first.charge = 7
                                battlefield.player1.commandsLeft -= 1
                                numberOfUses = battlefield.player1.commandsLeft
                                commandSeals = battlefield.player1.commandId
                                attachment = new MessageAttachment(`./src/commandsPictures/cs${commandSeals}_${numberOfUses}.png`, `cs${commandSeals}_${numberOfUses}.png`);
                                await message.channel.send(attachment)
                                collector2.stop()
                                break;
                            case '4':
                                battlefield.player1.commandsLeft -= 1
                                numberOfUses = battlefield.player1.commandsLeft
                                commandSeals = battlefield.player1.commandId
                                attachment = new MessageAttachment(`./src/commandsPictures/cs${commandSeals}_${numberOfUses}.png`, `cs${commandSeals}_${numberOfUses}.png`);
                                await message.channel.send(attachment)
                                collector2.stop('escape')
                                break;
                            case 'back':
                                collector2.stop('back')
                                break;
                        }
                    })

                    collector2.on('end', async (collected, reason) => {
                        if (reason && reason === 'back') {
                            playerTurn(message, battlefield, first, second)
                        } else if (reason && reason === 'escape') {
                            message.channel.send(`${firstName} and his master have fled from the battle.`)
                            await updatePlayer(message, battlefield.player1, first, second, true)
                        } else {
                            statusCheck(message, first, firstName, second, battlefield)
                            if (first.currentHp > 0 && second.currentHp > 0) {
                                mobTurn(message, battlefield, second, first)
                            } else {
                                if(battlefield.rewind === true){
                                    startBattle(ogMessage, ogBattlefield)
                                } else {
                                    message.channel.send("Match over!")
                                    await renderBattle(message, first, second, battlefield.background, true)
                                    await updatePlayer(message, battlefield.player1, first, second, false)
                                }
                                
                            }}
                        
                    })
                }
                break;
            case '7':
                showCurrentStats(first, message)
                break;
        }

    })

    collector1.on('end', async (collected, reason) => {
        if (reason && reason === 'attack') {
            statusCheck(message, first, firstName, second, battlefield)
            if (first.currentHp > 0 && second.currentHp > 0) {
                mobTurn(message, battlefield, second, first)
            } else {
                if(battlefield.rewind === true){
                    startBattle(ogMessage, ogBattlefield)
                } else {
                    message.channel.send("Match over!")
                    await renderBattle(message, first, second, battlefield.background, true)
                    await updatePlayer(message, battlefield.player1, first, second, false)
                }
                
            }

        } else if (reason && reason === 'spell') {
            // do nothing

        } else if (reason && reason === 'item') {
            // do nothing

        } else if (reason && reason === 'np') {
            await np(first, second, battlefield, message)
            await statusCheck(message, first, firstName, second, battlefield)
            if (first.currentHp > 0 && second.currentHp > 0) {
                mobTurn(message, battlefield, second, first)
            } else {
                if(battlefield.rewind === true){
                    startBattle(ogMessage, ogBattlefield)
                } else {
                    message.channel.send("Match over!")
                    await renderBattle(message, first, second, battlefield.background, true)
                    await updatePlayer(message, battlefield.player1, first, second, false)
                }
               
            }

        } else if (reason && reason === 'name') {
            // do nothing

        } else if (reason && reason === 'seal') {
            // do nothing

        } else {
            message.channel.send('Time out! Next player turn')
            statusCheck(message, first, firstName, second, battlefield)
            first.missedTurns += 1
            if (first.currentHp > 0 && second.currentHp > 0) {
                mobTurn(message, battlefield, second, first)
            } else {
                if(battlefield.rewind === true){
                    startBattle(ogMessage, ogBattlefield)
                } else {
                    message.channel.send("Match over!")
                await renderBattle(message, first, second, battlefield.background, true)
                await updatePlayer(message, battlefield.player1, first, second, false)
                }  
            }
        }

    })


}






const mobTurn = async (message, battlefield, second, first) => {
    // console.log(`mob atk : ${second.stats.strength}`)
    // await renderBattle(message, first, second, battlefield.background, true)
    // message.channel.send(`${battlefield.servant1.name[0]} hp: ${battlefield.servant1.currentHp}/${battlefield.servant1.maxHp}\nStats:${battlefield.servant1.stats}\nStatus:${battlefield.servant1.status}\ntakenDMG:${battlefield.servant1.takenDmg}`)
    // message.channel.send(`${battlefield.servant2.name[0]} hp: ${battlefield.servant2.currentHp}/${battlefield.servant2.maxHp}\nStats:${battlefield.servant2.stats}\nStatus:${battlefield.servant2.status}\ntakenDMG:${battlefield.servant2.takenDmg}`)

    let secondName = ''
    if (second.revealed) {
        secondName = second.name[0]
    } else {
        secondName = second.class
    }
   
    //attack
    if (second.charge >= 7 && (second.status.npSeal.active === false || second.passive[0] == "Right-sider")){
        //use np
        await mobNp(second, first, battlefield, message)
        statusCheck(message, second, secondName, first, battlefield)
        if (first.currentHp > 0 && second.currentHp > 0) {
            playerTurn(message, battlefield, first, second)
        } else {
            if(battlefield.rewind === true){
                startBattle(ogMessage, ogBattlefield)
            } else {
                message.channel.send("Match over!")
                await renderBattle(message, first, second, battlefield.background, true)
                await updatePlayer(message, battlefield.player1, first, second, false)
            }
            
        }
    } else if (second.status.stun.active === true) {
        message.channel.send(`${secondName} is stunned they can not move!`)
        statusCheck(message, second, secondName, first, battlefield)
        playerTurn(message, battlefield, first, second)
        
    } else {
        if (second.status.confusion.active === true) {
            let confuse = Math.floor(Math.random() * 2);
            if (confuse === 0) {
                message.channel.send('Enemy attacks!')
                let dmg = first.takeAttackDammage([second.inflictDammage, message, false])
                message.channel.send(`Dealt ${dmg} damage`)
                if (second.passive[0] == "Sadist") {
                    second.buffStrength(dmg * 0.15)
                }
                statusCheck(message, second, secondName, first, battlefield)
                if (first.currentHp > 0 && second.currentHp > 0) {
                    playerTurn(message, battlefield, first, second)
                } else {
                    if(battlefield.rewind === true){
                        startBattle(ogMessage, ogBattlefield)
                    } else {
                        message.channel.send("Match over!")
                        await renderBattle(message, first, second, battlefield.background, true)
                        await updatePlayer(message, battlefield.player1, first, second, false)
                    }
                }
                
                
            } else {
                // confusion triggers servant hits themselves
                message.channel.send('Enemy attacks!')
                let dmg = second.takeAttackDammage([second.inflictDammage, message, false])
                message.channel.send(`Dealt ${dmg} damage`)
                message.channel.send(`${secondName} got hurt in their confusion!`)
                statusCheck(message, second, secondName, first, battlefield)
                if (first.currentHp > 0 && second.currentHp > 0) {
                    playerTurn(message, battlefield, first, second)
                } else {
                    if(battlefield.rewind === true){
                        startBattle(ogMessage, ogBattlefield)
                    } else {
                        message.channel.send("Match over!")
                        await renderBattle(message, first, second, battlefield.background, true)
                        await updatePlayer(message, battlefield.player1, first, second, false)
                    }
                }
            }
        } else {
            message.channel.send('Enemy attacks!')
            let dmg = first.takeAttackDammage([second.inflictDammage, message, false])
            message.channel.send(`Dealt ${dmg} damage`)
            if (second.passive[0] == "Sadist") {
                second.buffStrength(dmg * 0.15)
            }
            statusCheck(message, second, secondName, first, battlefield)
            if (first.currentHp > 0 && second.currentHp > 0) {
                playerTurn(message, battlefield, first, second)
            } else {
                if(battlefield.rewind === true){
                    startBattle(ogMessage, ogBattlefield)
                } else {
                    message.channel.send("Match over!")
                    await renderBattle(message, first, second, battlefield.background, true)
                    await updatePlayer(message, battlefield.player1, first, second, false)
                }
                
            }
        }
    }

}




const mobFight = async (message) => {

    const filter = m => m.content.startsWith(prefix) && m.author.id === message.author.id
    const collector1 = new MessageCollector(message.channel, filter, { time: 60000 });
    message.channel.send('Type f/(number between 1-200) to choose the enemy level\n```Remember that if your servant HP reaches 0 they will die! (You can always use a command seal to escape.)```')
    collector1.on('collect', async message => {
        collector1.stop()
        let input = message.content.slice(prefix.length).trim().split(/ +/g)[0]
        let level = parseInt(input, 10);
        // console.log(level);
        if (level >= 1 && level <= 200) {
            level = Math.floor(level)
            
            await blockAction(message, message.author.id)
            Server.findOne({ serverID: message.guild.id }, async (err, server) => {
                if (err) {
                    console.log(err);
                }
                else {

                    const user = await server.players.find(player => player.playerID == message.author.id)
                    // initialize 
                    const bcg = Math.floor(Math.random() * backgrounds.length)
                    let battlefield = {
                        player1: {},
                        servant1: {},
                        servant2: {},
                        turn: 1,
                        background: backgrounds[bcg],
                        rewind: false
                    }
                     
                    battlefield.player1 = user// must be the first one
                    battlefield.servant1 = new BattleUnit(user.servants[0])
                    battlefield.servant2 = new BattleUnit(mobsList[Math.floor(Math.random() * mobsList.length)], true)

                    // add stats together
                    battlefield.servant1.stats.strength += battlefield.player1.stats.strength
                    battlefield.servant1.stats.endurance += battlefield.player1.stats.endurance
                    battlefield.servant1.currentHp += battlefield.player1.stats.endurance * 10
                    battlefield.servant1.maxHp += battlefield.player1.stats.endurance * 10
                    battlefield.servant1.stats.agility += battlefield.player1.stats.agility
                    battlefield.servant1.stats.magic += battlefield.player1.stats.magic
                    battlefield.servant1.stats.luck += battlefield.player1.stats.luck

                    battlefield.servant2.level = level
                    battlefield.servant2.stats.strength += level * 2
                    battlefield.servant2.stats.endurance += level * 2
                    battlefield.servant2.currentHp += level * 20
                    battlefield.servant2.maxHp += level * 20
                    battlefield.servant2.stats.agility += level * 2
                    battlefield.servant2.stats.magic += level * 2
                    battlefield.servant2.stats.luck += level * 2




                    battlefield.servant1.baseStats = { ...battlefield.servant1.stats }
                    battlefield.servant2.baseStats = { ...battlefield.servant2.stats }
                    battlefield.servant1.lastTurnStats = { ...battlefield.servant1.stats }
                    battlefield.servant2.lastTurnStats = { ...battlefield.servant2.stats }

                    let first = ''
                    let second = ''
                    
                    //abilityCheck
                    [battlefield.servant1, battlefield.servant2] = await abilityCheck(battlefield.servant1, battlefield.servant2, message)
                    
                    // console.log('battle start!')
                    const ogMessage = message
                    const ogBattlefield = battlefield

                    const startBattle = (message, battlefield)=>{
                        if (battlefield.servant1.stats.agility > battlefield.servant2.stats.agility && !(battlefield.servant1.passive[0] == "Aesthetics of the Last Spurt" || battlefield.servant2.passive[0] == "Shukuchi")) {
                            first = battlefield.servant1
                            second = battlefield.servant2
                            playerTurn(message, battlefield, first, second)
                        } else if (battlefield.servant1.passive[0] == "Shukuchi") {
                            first = battlefield.servant1
                            second = battlefield.servant2
                            playerTurn(message, battlefield, first, second)
                        }else {
                            first = battlefield.servant1
                            second = battlefield.servant2
                            mobTurn(message, battlefield, second, first)
                        }
                    }

                    startBattle(ogMessage, ogBattlefield)
                    

                }
            })
            
        } else {
            message.channel.send('Wrong number!')
        }

    })


   

}

module.exports = mobFight;