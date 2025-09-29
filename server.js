const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize OpenAI (will set API key in Railway)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Simple user storage
const users = new Map();

// Chat endpoint - MAIN FUNCTION
app.post('/api/chat', async (req, res) => {
  try {
    const { message, language, userId } = req.body;
    
    if (!message || !language) {
      return res.status(400).json({ error: 'Missing message or language' });
    }

    // Get or create user
    const user = users.get(userId) || { messageCount: 0, isPremium: false };
    
    // Check free limits (10 messages free)
    if (!user.isPremium && user.messageCount >= 10) {
      return res.json({ 
        success: false,
        error: 'Free limit reached. Upgrade to premium for unlimited chats!',
        response: null
      });
    }

    // Try OpenAI first
    let aiResponse;
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { 
            role: "system", 
            content: `You are Master Darija AI. Respond in ${language} with helpful phrases and cultural insights. Keep it under 100 words.` 
          },
          { role: "user", content: message }
        ],
        max_tokens: 150
      });
      aiResponse = completion.choices[0].message.content;
    } catch (openaiError) {
      // If OpenAI fails, use fallback
      aiResponse = generateFallbackResponse(language);
    }

    // Update user count
    if (user.messageCount < 10) {
      user.messageCount++;
    }
    users.set(userId, user);

    res.json({
      success: true,
      response: aiResponse,
      remainingMessages: user.isPremium ? 'unlimited' : 10 - user.messageCount,
      isPremium: user.isPremium
    });

  } catch (error) {
    console.error('Error:', error);
    res.json({
      success: true,
      response: generateFallbackResponse('english'),
      remainingMessages: 5,
      isPremium: false,
      fallback: true
    });
  }
});

// Premium upgrade
app.post('/api/premium', (req, res) => {
  const { userId } = req.body;
  
  if (!userId) {
    return res.json({ success: false, error: 'User ID required' });
  }

  const user = users.get(userId) || { messageCount: 0 };
  user.isPremium = true;
  users.set(userId, user);

  res.json({ 
    success: true, 
    message: '🎉 Premium activated! Unlimited chats unlocked.' 
  });
});

// User status
app.get('/api/status', (req, res) => {
  const { userId } = req.query;
  const user = users.get(userId) || { messageCount: 0, isPremium: false };
  
  res.json({
    isPremium: user.isPremium,
    messageCount: user.messageCount,
    remainingMessages: user.isPremium ? 'unlimited' : 10 - user.messageCount
  });
});

// Fallback responses if OpenAI fails
function generateFallbackResponse(language) {
  const responses = {
    english: [
      "Hello! In Darija, 'hello' is 'Salam' and 'thank you' is 'Chokran'! 🌟",
      "Great question! To ask 'how are you?' in Darija, say 'Kidayrin?' 🎯",
      "The word for 'beautiful' is 'Zwin' (masculine) or 'Zwina' (feminine)! ✨",
      "'Food' in Darija is 'Makla' and 'water' is 'Lma'! 🍲",
      "In Moroccan Darija, 'I love you' is 'Kanbghik'! 💙"
    ],
    french: [
      "Bonjour! En Darija, 'bonjour' est 'Salam' et 'merci' est 'Chokran'! 🌟",
      "Excellente question! Pour dire 'comment ça va?' en Darija, demandez 'Kidayrin?' 🎯",
      "Le mot pour 'beau' est 'Zwin' (masculin) ou 'Zwina' (féminin)! ✨",
      "'Nourriture' en Darija est 'Makla' et 'eau' est 'Lma'! 🍲",
      "En Darija marocain, 'je t'aime' se dit 'Kanbghik'! 💙"
    ],
    darija: [
      "Salam! F Darija, 'Salam' hiya bach dsalem w 'Chokran' bach tchker! 🌟",
      "Sual zwine! Bach toul 'kifach dayer?' f Darija, katgoul 'Kidayrin?' 🎯",
      "Kelma 'zwin' kat3ni beautiful, 'Zwin' l rajjel w 'Zwina' l mara! ✨",
      "'Makla' hiya food w 'Lma' hiya water f Darija! 🍲",
      "F Darija, 'Kanbghik' kat3ni I love you! 💙"
    ]
  };

  const langResponses = responses[language] || responses.english;
  return langResponses[Math.floor(Math.random() * langResponses.length)];
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Master Darija Backend running on port ${PORT}`);
  console.log(`✅ API Endpoints:`);
  console.log(`   POST /api/chat - Main chat endpoint`);
  console.log(`   POST /api/premium - Upgrade to premium`);
  console.log(`   GET /api/status - Check user status`);
});