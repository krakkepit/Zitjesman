const { announcementChannelId } = require('../config.json');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('feestje')
		.setDescription('Laat Zitjesman je feestje aankondigen')
        .addStringOption(option => option.setName('wanneer').setDescription('Datum / Dag').setRequired(true))
        .addStringOption(option => option.setName('hoelaat').setDescription('Tijd').setRequired(true))
        .addStringOption(option => option.setName('tekst').setDescription('Uitnodigingstekst').setRequired(true)),

	async execute(interaction) {
        const wanneer = interaction.options.getString('wanneer');
        const hoelaat = interaction.options.getString('hoelaat');
        const text = interaction.options.getString('tekst');
        const channel = await interaction.member.guild.channels.fetch(announcementChannelId);

        const user = interaction.user.nickname || interaction.user.username;
        const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('beb')
					.setLabel('Ben erbij!')
					.setStyle('SUCCESS'),
				new MessageButton()
					.setCustomId('benb')
					.setLabel('Ben er niet bij :(')
					.setStyle('DANGER'),
			);

            
        const embed = new MessageEmbed()
            .setColor('#F1C40F')
            .setTitle('Wie er komen')
            .setThumbnail(`https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png?size=256`)
            .addFields(
                { name: 'Namen', value: user, inline: true },
                { name: 'Komt wel/niet', value: ':white_check_mark:', inline: true },
            )
            .setTimestamp();

        const message = await channel.send(
            {
                content: `**${user} heeft geeft een feestje!\nWanneer:** ${wanneer}\n**Tijd:** ${hoelaat}\n\n**Uitnodiging:** ${text}`,
                components: [row],
                embeds: [embed]
            });

        await message.startThread({
            name: `Feestje ${user} ${wanneer}`,
        });
		return interaction.reply({ content: `Bedankt voor het melden van je feestje! Je kunt je uitnodiging terugvinden in het ${channel.name} kanaal`, ephemeral: true });
	},
};