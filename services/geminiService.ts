
import { GoogleGenAI } from "@google/genai";
import { TableRow } from '../types';

// Declare Papa globally as it's loaded from a CDN
declare var Papa: any;

// Fix: Per coding guidelines, initialize GoogleGenAI directly with the API key
// from environment variables. The key is assumed to be present.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const convertToCsv = (data: TableRow[]): string => {
  // We'll send a sample of the data, not the whole file, to be efficient.
  const dataSample = data.slice(0, 100); 
  return Papa.unparse(dataSample);
};

export const analyzeDataWithGemini = async (data: TableRow[]): Promise<string> => {
  // Fix: Removed redundant API key check, as we assume it is configured
  // in the environment where the client is initialized.
  if (data.length === 0) {
    throw new Error("No data provided for analysis.");
  }

  const csvData = convertToCsv(data);

  const prompt = `
    You are an expert financial analyst reviewing a personal or small business financial ledger.
    A user has uploaded a spreadsheet containing their financial transactions.
    Below is a sample of the data in CSV format (up to 100 rows).

    Analyze this data and provide a detailed financial report in a clear, well-structured response. The response must include the following sections:
    1.  **Executive Summary:** A brief, high-level overview of the financial health based on the data provided.
    2.  **Income Analysis:** Briefly describe the main sources of income.
    3.  **Expense Breakdown:** Identify the top 3-5 spending categories and mention their significance.
    4.  **Key Observations & Potential Savings:** Highlight any notable spending patterns, trends, or anomalies. Suggest 1-2 specific and actionable areas where savings could be made.

    Format your entire response in Markdown. Use bolding for headers and bullet points for lists.

    Here is the data:
    \`\`\`csv
    ${csvData}
    \`\`\`
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get analysis from Gemini. Please check the console for details.");
  }
};
