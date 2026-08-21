import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';

async function listModels() {
  const env = fs.readFileSync('.dev.vars', 'utf8');
  const apiKey = env.split('GEMINI_API_KEY=')[1].trim();
  
  const genAI = new GoogleGenerativeAI(apiKey);
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
    const res = await model.generateContent("hello");
    console.log("Success with gemini-3.5-flash:", res.response.text());
  } catch (e) {
    console.error("Error with gemini-3.5-flash:", e.message);
  }
}

listModels();
