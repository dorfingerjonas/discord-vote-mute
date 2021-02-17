const Discord = require('discord.js');
const client = new Discord.Client();
const token = require('./auth').token;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('message', msg => {
    if (msg.content.startsWith('!mute')) {
        const params = msg.content.split(' ');
        const requiredChecks = 3;

        if (params.length >= 2) {
            if (params[1].startsWith('<@!')) {
                const targetUser = msg.guild.members.cache.get(params[1].substring(3, params[1].length - 1));
                let duration = parseInt(params[2]) || 1;

                if (duration > 3) {
                    duration = 3;
                }

                msg.channel.send(`<@!${msg.author.id}> wants to mute <@!${targetUser?.id}> for ${duration} ${duration === 1 ? 'minute' : 'minutes'}. Do you support?`)
                    .then(message => {
                        let reactions = 0;
                        message.react('✅').catch(console.error);

                        const filter = (reaction, user) => {
                            return ['✅'].includes(reaction.emoji.name) && !user.bot;
                        };

                        const collector = message.createReactionCollector(filter, {time: 60000});

                        collector.on('collect', () => {
                            reactions++;

                            if (reactions === requiredChecks) {
                                targetUser?.voice.setMute(true).catch(console.error);

                                setTimeout(() => {
                                    targetUser?.voice.setMute(false).catch(console.error);
                                }, 60000 * duration);
                            }
                        });

                        collector.on('end', () => {
                            if (reactions !== requiredChecks) {
                                msg.channel.send(`time out, could not get ${requiredChecks} supporters in one minute. For punishment, <@!${msg.author.id}> gets muted for ${duration} ${duration === 1 ? 'minute' : 'minutes'}.`);
                                msg.author.voice.setMute(true).catch(console.error);

                                setTimeout(() => {
                                    msg.author.voice.setMute(false).catch(console.error);
                                }, 60000 * duration);
                            }
                        });
                    });
            } else {
                msg.channel.send('please mention a person to mute');
            }
        } else {
            msg.channel.send('please provide some information');
        }
    }
});

client.login(token);
