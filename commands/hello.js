const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('hello')
		.setDescription('hello world command'),
	async execute(interaction) {
		return interaction.reply('Hi There!');
	},
};