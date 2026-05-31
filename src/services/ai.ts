import axios from "axios";
import fs from "fs";

const ASSEMBLY_URL = "https://api.assemblyai.com/v2";

export async function transcribeAudio(filePath: string) {
  const apiKey = process.env.ASSEMBLY_API_KEY;
  if (!apiKey) throw new Error("ASSEMBLY_API_KEY missing");

  // Upload the file
  const readStream = fs.createReadStream(filePath);

  const uploadResp = await axios.post(`${ASSEMBLY_URL}/upload`, readStream, {
    headers: {
      authorization: apiKey,
      "Content-Type": "application/octet-stream",
    },
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });

  // AssemblyAI sometimes returns a JSON object { upload_url: "..." }
  // or a plain string containing the url. Normalize both cases.
  let uploadUrl: string | undefined;
  if (uploadResp?.data && typeof uploadResp.data === "object") {
    uploadUrl = uploadResp.data.upload_url || uploadResp.data.url;
  } else if (uploadResp?.data && typeof uploadResp.data === "string") {
    uploadUrl = uploadResp.data;
  }

  // Fallback to responseUrl if present
  if (!uploadUrl) uploadUrl = uploadResp.request?.res?.responseUrl;

  if (!uploadUrl || typeof uploadUrl !== "string") {
    throw new Error(
      `Failed to upload audio to AssemblyAI: unexpected upload response: ${JSON.stringify(
        uploadResp.data,
      )}`,
    );
  }

  // Create a transcript
  let id: string | undefined;
  try {
    const createResp = await axios.post(
      `${ASSEMBLY_URL}/transcript`,
      { audio_url: uploadUrl, speech_models: ["universal-2"] },
      {
        headers: { authorization: apiKey, "Content-Type": "application/json" },
      },
    );

    id = createResp.data?.id;
  } catch (err: any) {
    // Surface AssemblyAI error body for debugging
    if (err?.response?.data) {
      console.error("AssemblyAI create transcript error:", err.response.data);
      throw new Error(
        `AssemblyAI create transcript failed: ${JSON.stringify(err.response.data)}`,
      );
    }

    throw err;
  }

  if (!id)
    throw new Error("Failed to create transcript: missing id in response");

  // Poll for completion
  while (true) {
    const resp = await axios.get(`${ASSEMBLY_URL}/transcript/${id}`, {
      headers: { authorization: apiKey },
    });

    const status = resp.data?.status;
    if (status === "completed") return resp.data?.text || "";
    if (status === "error")
      throw new Error(resp.data?.error || "Transcription error");

    await new Promise((r) => setTimeout(r, 1000));
  }
}

export function summarize(text: string) {
  if (!text) return "No summary available.";

  const shortened = text.split(".").slice(0, 2).join(".").trim();

  return shortened || text;
}
