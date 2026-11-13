require('dotenv').config();

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_MODEL = process.env.MISTRAL_MODEL || 'mistral-small-latest';
const SYSTEM_PROMPT =
  process.env.SYSTEM_PROMPT ||
  "Tu es un assistant amical sur WhatsApp. Reponds de facon courte et naturelle, comme dans une conversation entre amis.";

if (!MISTRAL_API_KEY) {
  console.error('Erreur : MISTRAL_API_KEY manque. Cree un fichier .env avec MISTRAL_API_KEY=ta_cle');
  process.exit(1);
}

const MAX_HISTORY = 10;
const conversations = new Map();

function getHistory(chatId) {
  if (!conversations.has(chatId)) {
    conversations.set(chatId, []);
  }
  return conversations.get(chatId);
}

async function askMistral(chatId, userMessage) {
  const history = getHistory(chatId);
  history.push({ role: 'user', content: userMessage });
  while (history.length > MAX_HISTORY) {
    history.shift();
  }

  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${MISTRAL_API_KEY}`,
    },
    body: JSON.stringify({
      model: MISTRAL_MODEL,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...history],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur API Mistral ${response.status} : ${errorText}`);
  }

  const data = await response.json();
  const reply = data.choices[0].message.content.trim();

  history.push({ role: 'assistant', content: reply });
  while (history.length > MAX_HISTORY) {
    history.shift();
  }

  return reply;
}

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
});

client.on('qr', (qr) => {
  console.log('\nScanne ce QR code avec WhatsApp (Parametres > Appareils connectes) :\n');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('WhatsApp connecte ! L\'agent ecoute les messages...');
});

client.on('message', async (msg) => {
  if (msg.from === 'status@broadcast' || !msg.body) return;

  console.log(`Message recu de ${msg.from} : ${msg.body}`);

  try {
    const reply = await askMistral(msg.from, msg.body);
    await msg.reply(reply);
    console.log(`Reponse envoyee : ${reply}`);
  } catch (error) {
    console.error('Erreur :', error.message);
    await msg.reply('Desole, je n\'ai pas pu repondre pour le moment.');
  }
});

client.initialize();
