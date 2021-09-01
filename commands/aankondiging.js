const { announcementChannelId } = require('../config.json');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('aankondiging')
		.setDescription('Laat Zitjesman iets verkondigen. Standaard in het aankondigingen kanaal.')
        .addStringOption(option => option.setName('tekst').setDescription('Wat Zitjesman moet zeggen').setRequired(true))
        .addChannelOption(option => option.setName('kanaal').setDescription('Welk kanaal je het in wilt (standaard aankondigingen)')),

	async execute(interaction) {
        const text = interaction.options.getString('tekst');
        const channel = interaction.options.getChannel('kanaal') || await interaction.member.guild.channels.fetch(announcementChannelId);

        const message = await channel.send(`*${interaction.user.nickname || interaction.user.username} heeft wat mede te delen! Namelijk:*\n\n${text}`);
        const today = new Date();
        await message.startThread({
            name: `Aankondiging ${interaction.user.nickname || interaction.user.username} ${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}`,
        });
		return interaction.reply({ content: text, ephemeral: true });
	},
};