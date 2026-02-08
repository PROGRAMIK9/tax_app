const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios"); // We need this to fetch the file from Cloudinary
require("dotenv").config();

// 1. Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// 2. Helper: Download File & Convert to Base64
async function urlToGenerativePart(url, mimeType) {
    let finalUrl = url;
    let finalMime = mimeType;
  
    // 🛠️ FIX: If it's a PDF, ask Cloudinary for a JPG preview instead.
    // This bypasses the "401 Protected" error for original files.
    if (mimeType === 'application/pdf') {
      finalUrl = url.replace(/\.pdf$/i, '.jpg'); // Change extension to .jpg
      finalMime = 'image/jpeg';                   // Update MIME type
      console.log(`🔄 Converted PDF to Image: ${finalUrl}`);
    }
  
    // Download the file (or the new image)
    const response = await axios.get(finalUrl, { responseType: "arraybuffer" });
    
    return {
      inlineData: {
        data: Buffer.from(response.data).toString("base64"),
        mimeType: finalMime,
      },
    };
  }

// 3. Main Function: The Auditor
const analyzeDocument = async (fileUrl, mimeType) => {
  try {
    console.log(`🤖 AI Analyzing: ${fileUrl}`);

    // Prepare the Image/PDF
    const filePart = await urlToGenerativePart(fileUrl, mimeType);

    // The Prompt (Strict JSON instruction)
    const prompt = `
      You are an expert tax auditor. Analyze this document (Receipt, Invoice, or Bill).
      Extract the following fields in strict JSON format:
      - amount (number, e.g., 150.50)
      - date (string, YYYY-MM-DD format)
      - vendor (string, e.g., "Starbucks", "Uber")
      - category (string, e.g., "Travel", "Meals", "Office Supplies", "Medical")
      - confidence_score (number, 0.0 to 1.0)
      - audit_notes (string, short summary of what you found)

      If a field is missing or unreadable, use null.
      Do not include markdown formatting like \`\`\`json. Just return the raw JSON string.
    `;

    // Ask Gemini
    const result = await model.generateContent([prompt, filePart]);
    const response = await result.response;
    const text = response.text();

    // Clean up the response (sometimes Gemini adds backticks)
    const cleanText = text.replace(/```json|```/g, "").trim();
    
    return JSON.parse(cleanText);

  } catch (error) {
    console.error("❌ AI Error:", error.message);
    return null; // Fail gracefully
  }
};

module.exports = { analyzeDocument };