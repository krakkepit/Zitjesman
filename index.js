const fs = require('fs');
const { Client, Collection, Intents, CommandInteractionOptionResolver } = require('discord.js');
const { guildId, announcementChannelId, shouldUpdateCommands, token } = require('./config.json');

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

let commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.set(command.data.name, command);
}

client.once('ready', async c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
	
	//Update Commands
	if (shouldUpdateCommands === true) {
		console.log(`Updating commands ${Array.from(commands.keys())}`)
		for (let command of commands.values()) {
			client.api.applications(client.user.id).guilds(guildId).commands.post(command);
		}
	}
});

client.on('interactionCreate', async interaction => {
	if (interaction.isButton()) return handleButton(interaction);
	if (!interaction.isCommand()) return;

	console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction.`);
	const command = commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

async function handleButton(i) {
	console.log('Button click found')
	const userName = i.user.nickname || i.user.username;
	const isPresent = i.customId === 'beb';
	const emoji = isPresent ? ':white_check_mark:' : ':no_entry:';

	const embedFromMessage = i.message.embeds[0];
	
	const names = embedFromMessage.fields.find(x => x.name === 'Namen').value.split('\n');
	const isComingArray = embedFromMessage.fields.find(x => x.name === 'Komt wel/niet').value.split('\n');

	if (names.includes(userName)) {
		const index = names.indexOf(userName);
		isComingArray[index] = emoji; 
	}
	else {
		names = { ...names, userName };
		isComingArray = { ...isComingArray, emoji };
	}

	embedFromMessage.fields = [
		{ name: 'Namen', value: names.join('\n'), inline: true },
		{ name: 'Komt wel/niet', value: isComingArray.join('\n'), inline: true },
	];

	//Update the message
	await i.message.edit({ content: i.message.content, embeds: [embedFromMessage] });
	const op = i.message.content.split(' ')[0].substring(2);
	const opmember = i.member.guild.members.cache.find(x => x.nickname === op || x.user.username === op);
	
	//Send a message to the Original Poster
	const membersNotReactedYet = i.member.guild.members.cache.filter(x => !x.user.bot && !(names.includes(x.nickname)) && !(names.includes(x.user.username))).map(x => x.nickname || x.user.username);
	console.log(membersNotReactedYet)
	const opmessage = `**${userName}** heeft gereageerd op je feestje. Hij/zij komt ${isPresent ? 'lekker genieten op je feest! :white_check_mark:': 'helaas niet. :no_entry:'}\n*Aantal deelnemers:* ${isComingArray.filter(x => x === ':white_check_mark:').length}\n${membersNotReactedYet.length > 0 ? `*Mensen die nog niet hebben gereageerd:* ${membersNotReactedYet.join(', ')}` : 'Iedereen heeft gereageerd!'}\n\n*Originele Uitnodiging:* ${i.message.content.split('Uitnodiging:** ')[1]}`;
	await opmember.send(opmessage);

	//Thank the button presser for pressing the button (privately)
	return await i.reply({ content: 'Bedankt voor het reageren!', ephemeral: true });
}

client.login(token);