const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('hack')
        .setDescription('🔓 Hackear a un usuario (broma)')
        .setDMPermission(false)
        .addUserOption(option => option.setName('target').setDescription('The user to hack').setRequired(true)),

    async execute(interaction) {

        const target = interaction.options.getUser('target');

        const createProgressBar = (percentage) => {
            const progressBarLength = 20;
            const progress = Math.round(progressBarLength * (percentage / 100));
            const progressBar = `[${'🟦'.repeat(progress)}${'⬜'.repeat(progressBarLength - progress)}] ${percentage}%`;
            return progressBar;
        };

        const embed1 = new EmbedBuilder()
            .setColor('#CB1BFF')
            .setTitle(`💻 **Iniciando info hack ${target.username}'s...**`)
            .setDescription('⏳ Por favor espera, tomara un momento.')
            .setThumbnail('https://cdn.discordapp.com/emojis/931656752104251472.gif?size=96')
            .addFields(
                { name: '👤 Usuario:', value: target.username, inline: true },
                { name: '🔖 Discriminador:', value: target.discriminator, inline: true },
                { name: '🆔 ID:', value: target.id, inline: true },
                { name: '🟢 Estatus:', value: target.presence?.status || 'Offline', inline: true },
            )
            .setTimestamp()
            .setFooter({ text: '🃏 Esto es una broma, por favor\'te lo tomes enserio.' });

        await interaction.reply({ embeds: [embed1] });

        let progress = 0;

        const updateProgress = () => {
            progress += 10;
            const progressBar = createProgressBar(progress);
            interaction.editReply({ content: progressBar });
        };

        const interval = setInterval(() => {
            updateProgress();
            if (progress >= 100) {
                clearInterval(interval);
            }
        }, 1000);

        // Simulate data gathering process
        await new Promise(resolve => setTimeout(resolve, 5000));

        setTimeout(async () => {
            const embed2 = new EmbedBuilder()
                .setColor('Yellow')
                .setTitle('🤔 **Reuniendo información...**')
                .setDescription('⏳ Por favor espera, tomara un momento.')
                .setThumbnail('https://cdn.discordapp.com/emojis/931656752104251472.gif?size=96')
                .addFields(
                    { name: '👤 Usuario:', value: target.username, inline: true },
                    { name: '🔖 Discriminador:', value: target.discriminator, inline: true },
                    { name: '🆔 ID:', value: target.id, inline: true },
                    { name: '🟢 Estatus:', value: target.presence?.status || 'Offline', inline: true },
                    { name: '🔍 IP:', value: '127.0.0.1', inline: true },
                    { name: '🔐 Nivel seguridad:', value: 'High', inline: true },
                )
                .setTimestamp()
                .setFooter({ text: '🃏 Esto es una broma, por favor\'te lo tomes enserio.' });

            interaction.editReply({ embeds: [embed2] });

            // Simulate data gathering process
            await new Promise(resolve => setTimeout(resolve, 5000));

            const generateRandomCreditCard = () => {
                const firstNum = Math.floor(1000 + Math.random() * 9000);
                const secondNum = Math.floor(1000 + Math.random() * 9000);
                const thirdNum = Math.floor(1000 + Math.random() * 9000);
                const fourthNum = Math.floor(1000 + Math.random() * 9000);
                return `${firstNum} ${secondNum} ${thirdNum} ${fourthNum}`;
            };

            const generateRandomPassword = () => {
                const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
                const passwordLength = 12;
                let password = '';
                for (let i = 0; i < passwordLength; i++) {
                    const randomIndex = Math.floor(Math.random() * characters.length);
                    password += characters.charAt(randomIndex);
                }
                return password;
            };

            const generateRandomEmail = () => {
                const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
                const randomDomain = domains[Math.floor(Math.random() * domains.length)];
                return `example${Math.floor(Math.random() * 1000)}@${randomDomain}`;
            };

            const generateRandomPhone = () => {
                const areaCode = Math.floor(100 + Math.random() * 900);
                const firstPart = Math.floor(100 + Math.random() * 900);
                const secondPart = Math.floor(1000 + Math.random() * 9000);
                return `(${areaCode}) ${firstPart}-${secondPart}`;
            };

            const generateRandomLocation = () => {
                const locations = ['New York', 'Los Angeles', 'Londres', 'Tokyo', 'Sydney', 'Mexico', 'Argentina', 'Colombia', 'Brasil'];
                return locations[Math.floor(Math.random() * locations.length)];
            };

            const generateRandomDeviceType = () => {
                const deviceTypes = ['Desktop', 'Laptop', 'Smartphone', 'Tablet'];
                return deviceTypes[Math.floor(Math.random() * deviceTypes.length)];
            };

            const generateRandomUserAgent = () => {
                const userAgents = [
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
                    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.146 Safari/537.36',
                    'Mozilla/5.0 (Linux; Android 9; SM-G960U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.157 Mobile Safari/537.36'
                ];
                return userAgents[Math.floor(Math.random() * userAgents.length)];
            };

            const generateRandomIPAddress = () => {
                const octet = () => Math.floor(Math.random() * 256);
                return `${octet()}.${octet()}.${octet()}.${octet()}`;
            };

            const embed3 = new EmbedBuilder()
                .setColor('Orange')
                .setTitle('🔍 **Crackeando seguridad...**')
                .setDescription('🔓 Crackeando protocolos de seguridad...')
                .setThumbnail('https://cdn.discordapp.com/emojis/931656752104251472.gif?size=96')
                .addFields(
                    { name: '👤 Usuario:', value: target.username, inline: true },
                    { name: '🔖 Discriminado:', value: target.discriminator, inline: true },
                    { name: '🆔 ID:', value: target.id, inline: true },
                    { name: '🟢 Estatus:', value: target.presence?.status || 'Offline', inline: true },
                    { name: '🔍 IP:', value: generateRandomIPAddress(), inline: true },
                    { name: '🔐 Nivel seguridad:', value: 'High', inline: true },
                    { name: '🔒 Contraseña:', value: generateRandomPassword(), inline: true },
                    { name: '📧 Email:', value: generateRandomEmail(), inline: true },
                    { name: '📞 Telefono:', value: generateRandomPhone(), inline: true },
                    { name: '💳 Numero tarjeta:', value: generateRandomCreditCard(), inline: true },
                    { name: '🌍 Localidad:', value: generateRandomLocation(), inline: true },
                    { name: '🖥️ Tipo dispositivo:', value: generateRandomDeviceType(), inline: true },
                    { name: '🔎 Navegador:', value: generateRandomUserAgent(), inline: true }
                )
                .setTimestamp()
                .setFooter({ text: '🃏 Esto es una broma, por favor\'te lo tomes enserio.' });

            interaction.editReply({ embeds: [embed3] });

            // Simulate cracking security process
            await new Promise(resolve => setTimeout(resolve, 8000));

            const embed4 = new EmbedBuilder()
                .setColor('Red')
                .setTitle('✅ **Hack completado!**')
                .setDescription(`🔑 Exito! informacion hackeada ${target.username}'s cuenta.`)
                .setThumbnail('https://cdn.discordapp.com/emojis/931656752104251472.gif?size=96')
                .addFields(
                    { name: '🔒 Contraseña:', value: generateRandomPassword(), inline: true },
                    { name: '💳 Numero tarjeta:', value: generateRandomCreditCard(), inline: true },
                    { name: '📧 Email:', value: generateRandomEmail(), inline: true },
                    { name: '📞 Telefono:', value: generateRandomPhone(), inline: true },
                    { name: '🌍 Localidad:', value: generateRandomLocation(), inline: true },
                    { name: '🕒 Timestamp:', value: new Date().toLocaleString(), inline: true },
                    { name: '📱 Dispositivo:', value: generateRandomDeviceType(), inline: true },
                    { name: '🌐 Navegador:', value: generateRandomUserAgent(), inline: true },
                    { name: '🔍 IP:', value: generateRandomIPAddress(), inline: true },
                )
                .setTimestamp()
                .setFooter({ text: '🃏 Esto es una broma, por favor\'te lo tomes enserio.' });

            interaction.editReply({ embeds: [embed4] });

        }, 3000);
    },
};