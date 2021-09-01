const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { guildId, shouldUpdateCommands, token } = require('./config.json');

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

let commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.set(command.data.name, command);
}

client.once('ready', c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
	if (shouldUpdateCommands === true) {
		console.log(`Updating commands ${Array.from(commands.keys())}`)
		for (let command of commands.values()) {
			client.api.applications(client.user.id).guilds(guildId).commands.post(command);
		}
	}
});

client.on('interactionCreate', async interaction => {
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

client.login(token);