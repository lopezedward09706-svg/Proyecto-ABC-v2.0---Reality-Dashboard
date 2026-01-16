
// Fix: Use direct initialization from process.env.API_KEY and remove unused Type import
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getBridgeCommentary(stateSummary: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `System State: ${stateSummary}. As IA-Puente, provide a brief, profound scientific synthesis of current network tensions and cosmological implications based on ABC theory (Discrete Geometry). Max 2 sentences.`,
      config: {
        temperature: 0.7,
      }
    });
    return response.text || "Synchronizing network nodes...";
  } catch (error: any) {
    console.error("Gemini Error:", error);
    const errorMsg = error.message || "";
    if (errorMsg.includes("quota") || error.status === 429 || errorMsg.includes("RESOURCE_EXHAUSTED")) {
      return "ERROR: RESOURCE_EXHAUSTED. Cuota de IA excedida.";
    }
    return "Communication with higher dimensions interrupted.";
  }
}

export async function generateScientificReport(stateSummary: string, authorInfo: any) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Generate a formal scientific abstract and summary in LaTeX format for a research paper. 
      Subject: R-QNT Network Stability and Discrete Geometry (ABC Theory).
      Current Metrics: ${stateSummary}. 
      Author: ${authorInfo.name}, ORCID: ${authorInfo.orcid}.
      Structure: Abstract, Methodology (Brief), Current Findings, and Future Implications. 
      Use highly technical language suitable for CERN or arXiv.`,
      config: {
        temperature: 0.5,
      }
    });
    return response.text || "Generating report content...";
  } catch (error: any) {
    return "Failed to generate R-QNT academic report. Network latency detected.";
  }
}
