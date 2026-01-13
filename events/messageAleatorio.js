const { Client, GatewayIntentBits, Partials, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, Events } = require('discord.js');
const hispamemes = require("hispamemes");
require('dotenv').config();
const cron = require('node-cron');

const client = new Client({
    intents: 3276799,
});

client.once('ready', async () => {

    // Función para enviar memes de forma periódica
    const sendMemeHourly = async () => {
        try {
            // Obtener el meme de hispamemes
            const meme = await hispamemes.meme();

            // ID del canal donde se enviarán los memes
            const channel = client.channels.cache.get('1300431968860766289'); // Reemplaza con tu ID de canal

            if (!channel) {
                console.error('No se encontró el canal.');
                return;
            }

            // Crear el embed con el meme
            const embed = new EmbedBuilder()
                .setTitle('🎭 ¡Meme generado! 🎭')
                .setImage(meme)
                .setColor("CB1BFF")
                .setTimestamp();

            // Enviar el embed al canal
            await channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Ocurrió un error al enviar el meme:', error);
        }
    };

    // Llamar la función de envío de memes cada 1 hora
    await sendMemeHourly(); // Primer envío inmediato
    setInterval(sendMemeHourly, 5400000); // 3600000 ms = 1 hora y media
});
///////////////////////////////////////////////////////////////////El bot enviara frases cada tanto tiempo

const channelId = '1238962613333790830';

// Frases aleatorias
const frases = [
    "**La vida es lo que pasa mientras estás ocupado haciendo otros planes. - John Lennon**",
    "**El éxito es ir de fracaso en fracaso sin perder el entusiasmo. - Winston Churchill**",
    "**No cuentes los días, haz que los días cuenten. - Muhammad Ali**",
    "**La única manera de hacer un gran trabajo es amar lo que haces. - Steve Jobs**",
    "**La vida es realmente simple, pero insistimos en hacerla complicada. - Confucio**",
    "**Si tuviera que volver a comenzar mi vida, intentaría encontrarte mucho antes. - Antoine de Saint-Exupéry**",
    "**Si no luchas por tu amor, ¿qué clase de amor vas a tener? - Keanu Reeves**",
    "**Haz el amor y no la guerra - John Lennon**",
    "**Las guerras seguirán mientras el color de la piel siga siendo más importante que el de los ojos. - Bob Marley**",
    "**Cada día sabemos más y entendemos menos. - Albert Einstein**",
    "**La mayor declaración de amor es la que no se hace; el hombre que siente mucho, habla poco. - Platón**",
    "**Si das pescado a un hombre hambriento lo nutres durante una jornada. Si le enseñas a pescar, le nutrirás toda su vida. - Lao Tsé**",
    "**No estoy tan enamorado de mis propias opiniones que ignore lo que los demás puedan pensar acerca de ellas. - Copérnico**",
    "**Hay dos cosas que son infinitas: el universo y la estupidez humana; de la primera no estoy muy seguro. - Albert Einstein**",
    "**El mundo es bello, pero tiene un defecto llamado hombre. - Friedrich Nietzsche**",
    "**Lo que no te mata, te hace más fuerte. - Friedrich Nietzsche**",
    "**No abras los labios si no estás seguro de que lo que vas a decir es más hermoso que el silencio. - Proverbio árabe**",
    "**Sólo puede ser feliz siempre el que sepa ser feliz con todo. - Confucio**",
    "**Ninguna persona merece tus lágrimas, y quien se las merezca no te hará llorar. - Gabriel García Márquez**",
    "**De humanos es errar y de necios permanecer en el error. - Marco Tulio Cicerón**",
    "**Algunas personas son tan falsas que ya no distinguen que lo que piensan es justamente lo contrario de lo que dicen. - Marcel Aymé**",
    "**La verdadera sabiduría está en reconocer la propia ignorancia. - Sócrates**",
    "**No permitas que ningún ser humano te haga caer tan bajo como para odiarle Martin Luther King**",
    "**Un amigo de todos es una amigo de nadie. - Aristóteles**",
    "**Los verdaderos líderes deben estar dispuestos a sacrificarlo todo por la libertad de su pueblo. - Nelson Mandela**",
    "**Aquel que más posee, más miedo tiene de perderlo. - Leonardo Da Vinci**",
    "**Incluso la gente que afirma que no podemos hacer nada para cambiar nuestro destino, mira antes de cruzar la calle. - Stephen Hawking**",
    "**Ojo por ojo y el mundo acabará ciego (Mahatma Gandhi)**",
    "**Vive como si fueras a morir mañana; aprende como si el mundo fuera a durar para siempre. - Mahatma Gandhi**",
    "**Nunca rompas el silencio si no es para mejorarlo. - Beethoven**",
    "**Puedes engañar a todo el mundo algún tiempo. Puedes engañar a algunos todo el tiempo. Pero no puedes engañar a todo el mundo todo el tiempo. - Abraham Lincoln**",
    "**La mejor manera de librarse de la tentación es caer en ella. - Oscar Wilde**",
    "**Es tan corto el amor y tan largo el olvido. - Pablo Neruda**",
    "**Se la come quien lo lea - Un random**",
    "**¡Sé feliz hoy! Aunque únicamente sea por joder a los envidiosos.**",
    "**Trabajar no es malo, lo malo es tener que trabajar. - Don Ramón**",
    "**Vas a morir, Moe... wiii. Vas a morir, Moe... Wiii (se va patinando)**",
    "**¡Que elegancia la de Francia!**",
    "**Voy por la escopeta. Bart no quiero asustarte pero tal vez el Coco, el Coco esta en la casa.**",
    "**Ey, ey, ey, más despacio, cerebrito.**",
    "**Una vez que cuestionas tus propias creencias, estás acabado.**",
    "**Incluso el más fuerte de los oponentes siempre tiene una debilidad.**",
    "**Mi lema es ser más fuerte que ayer, si es necesario estaré más fuerte que hace medio día, incluso más fuerte que hace un minuto.**",
    "**La siguiente generación siempre sobrepasa a la primera, es uno de los ciclos interminables de la vida.**",
    "**Si no compartes el dolor de alguien, nunca podrás entender a los demás.**",
    "**El trabajo duro es inútil para aquellos que no creen en sí mismos.**",
    "**Las personas se vuelven más fuertes porque tienen cosas que no pueden olvidar. Eso es lo que llamas crecimiento.**",
    "**Fracasar no te da una razón para renunciar mientras tengas fe.**",
    "**Tienes razón, todos los esfuerzos son inútiles si no crees en ti mismo.**",
    "**Nunca te rindas sin haberlo intentado. ¡Haz lo que puedas, no importa cuán pequeño sea el efecto que pueda tener!**",
    "**¡Un fracasado ganará incluso a costa de su propia vida!**",
    "**El valor es difícil de comprender. Algunas veces, tal vez ni siquiera sepas por qué haces algo, quiero decir, cualquier tonto puede ser valiente, pero el honor, esa es la verdadera razón por la que haces algo o no**",
"**La generosidad hacia la persona necesitada enriquece tanto al que da como al que recibe.**",
"**Un requisito previo para la empatía es prestarle atención a las personas que padecen dolor.**",
"**Creo firmemente que todos tenemos un don, algo que nos diferencia de demás y que nos hace especiales.**",
"**Tú eres una persona única hecha para un propósito específico. Tus dones cuentan, tu historia cuenta, tus sueños cuentan, tú cuentas.**",
"**Si quieres algo, ve a por ello y punto.**",
"**Esta parte de mi vida, esta parte aquí, la llamo ‘felicidad’.**",
"**La vida es como un disco de vinilo, todos tenemos que buscar nuestra propia canción.**",
"**La vida es un regalo precioso, nunca dejes de soñar y vivir plenamente.**",
"**No temas a la oscuridad, es en ella donde se encuentran las estrellas más brillantes.**",
"**Nadie está completamente solo, siempre hay alguien que nos acompaña en los momentos más difíciles.**",
"**La verdadera libertad no es estar libre de cadenas físicas, sino de cadenas mentales.**",
"**Los milagros suceden todos los días, solo tienes que prestar atención.**",
"**El dolor es una parte inevitable de la vida, pero el sufrimiento es opcional.**",
"**Todo el mundo tiene un pasado, algunos son solo más oscuros que otros.**",
"**Me enredaste en tu mirada, me abrazaste con todos mis defectos, tú si sabes quererme, tú si sabes adorarme, mi amor. No te vayas- Natalia Lafourcade**",
    "**No odio la oscuridad. Fue en la oscuridad donde me crié.**",
    "**Cuando un hombre aprende a amar, debe correr el riesgo de ser odiado.**",
    "**Si el amor es solo una palabra, entonces ¿por qué duele tanto si te das cuenta de que no lo encuentras por ningún lugar**",
    "**No hay atajos en el camino para ser Hokage.**",
    "**Una sonrisa es la mejor manera de salir de un apuro, aunque sea falsa. Sorprendentemente, todo el mundo se la toma al pie de la letra.**",
    "**Tal vez, sólo tal vez, no haya un propósito en la vida… pero si te quedas un tiempo más en este mundo, podrías descubrir algo de valor en él.**",
    "**Un lugar donde alguien todavía piensa en ti es un lugar al que puedes llamar hogar.**",
    // Agrega más frases aquí
];

// Función para enviar una frase aleatoria
function enviarFraseAleatoria(client) {
    const canal = client.channels.cache.get(channelId);
    if (canal) {
        const frase = frases[Math.floor(Math.random() * frases.length)]; // Seleccionar una frase aleatoria
        canal.send(frase)
            .catch(error => console.error(`Error al enviar mensaje: ${error}`));
    } else {
        console.log("No se encontró el canal");
    }
}

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        // Buscar el canal por su ID
        const canal = client.channels.cache.get(channelId);

        // Enviar una frase inmediatamente al inicio
        enviarFraseAleatoria(client);

        // Configurar un intervalo para enviar una frase aleatoria cada hora (3600000 ms)
        setInterval(() => enviarFraseAleatoria(client), 28800000);
    },
};

client.login(process.env.TOKEN);