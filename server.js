const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check - REQUIRED
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Master Darija Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// Simple chat - returns random responses
app.post('/api/chat', (req, res) => {
  const { message, language = 'english', userId } = req.body;
  
  const responses = {
    english: [
      "Hello! I'm Master Darija AI. Ready to teach you Moroccan Arabic! 🌟",
      "Great question! In Darija, 'hello' is 'Salam' and 'thank you' is 'Chokran'!",
      "To ask 'how are you?' in Darija, say 'Kidayrin?' or 'Labas?' 🎯",
      "The word for 'beautiful' is 'Zwin' (masculine) or 'Zwina' (feminine)! ✨",
      "In Moroccan Darija, 'I love you' is 'Kanbghik'! 💙",
      "'Welcome' in Darija is 'Marhaba' or 'Allah ihennik'! 🏠"
    ],
    french: [
      "Bonjour! Je suis Master Darija AI. Prêt à vous apprendre l'arabe marocain! 🌟",
      "Excellente question! En Darija, 'bonjour' est 'Salam' et 'merci' est 'Chokran'!",
      "Pour dire 'comment ça va?' en Darija, demandez 'Kidayrin?'! 🎯", 
      "Le mot pour 'beau' est 'Zwin' (masculin) ou 'Zwina' (féminin)! ✨",
      "En Darija marocain, 'je t'aime' se dit 'Kanbghik'! 💙",
      "'Bienvenue' en Darija est 'Marhaba' ou 'Allah ihennik'! 🏠"
    ],
    darija: [
      "Salam! Ana Master Darija AI. Mabsout bach n3allemek Darija! 🌟",
      "Sual zwine! F Darija, 'Salam' hiya bach dsalem w 'Chokran' bach tchker!",
      "Bach toul 'kifach dayer?' f Darija, katgoul 'Kidayrin?'! 🎯",
      "Kelma 'zwin' kat3ni beautiful, 'Zwin' l rajjel w 'Zwina' l mara! ✨",
      "F Darija, 'Kanbghik' kat3ni I love you! 💙",
      "'Marhaba' wla 'Allah ihennik' kat3ni welcome f Darija! 🏠"
    ]
  };

  const langResponses = responses[language] || responses.english;
  const aiResponse = langResponses[Math.floor(Math.random() * langResponses.length)];

  res.json({
    success: true,
    response: aiResponse,
    remainingMessages: 8,
    isPremium: false,
    language: language
  });
});

// Premium upgrade
app.post('/api/premium', (req, res) => {
  res.json({ 
    success: true, 
    message: '🎉 Premium activated! Unlimited chats unlocked.' 
  });
});

// User status
app.get('/api/status', (req, res) => {
  const { userId } = req.query;
  res.json({
    isPremium: false,
    messageCount: 2,
    remainingMessages: 8,
    userId: userId || 'unknown'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Master Darija Backend running on port ${PORT}`);
  console.log(`✅ Health: http://localhost:${PORT}/`);
  console.log(`✅ Chat API: POST http://localhost:${PORT}/api/chat`);
});
