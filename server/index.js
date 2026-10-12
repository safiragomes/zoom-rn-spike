import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { appendFile } from "node:fs/promises";
import { KJUR } from "jsrsasign";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;
const TRANSCRIPT_FILE = new URL("./transcripts.jsonl", import.meta.url);

app.use(cors());
app.use(express.json());

function gerarToken(sessionName, role) {
  const key = process.env.ZOOM_SDK_KEY;
  const secret = process.env.ZOOM_SDK_SECRET;

  if (!key || !secret) {
    throw new Error("Credenciais do Zoom não configuradas (ZOOM_SDK_KEY / ZOOM_SDK_SECRET).");
  }

  const agora = Math.floor(Date.now() / 1000);

  const payload = {
    app_key: key,
    tpc: sessionName,
    role_type: role,
    version: 1,
    iat: agora - 30,
    exp: agora + 60 * 60 * 2,
  };

  return KJUR.jws.JWS.sign(
    "HS256",
    JSON.stringify({ alg: "HS256", typ: "JWT" }),
    JSON.stringify(payload),
    secret
  );
}

app.get("/token", (req, res) => {
  const sessionName = req.query.session;
  const role = Number(req.query.role ?? 0);

  if (
    typeof sessionName !== "string" ||
    !/^[\w .-]{1,150}$/.test(sessionName) ||
    ![0, 1].includes(role)
  ) {
    return res.status(400).json({
      error: "Parâmetros inválidos. Use /token?session=NOME&role=0|1",
    });
  }

  try {
    const token = gerarToken(sessionName, role);
    return res.json({ token });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ error: erro.message });
  }
});

app.post("/transcript", async (req, res) => {
  const { messageID, messageContent, speakerName, speakerID, timeStamp, messageType } =
    req.body ?? {};

  if (typeof messageID !== "string" || typeof messageContent !== "string") {
    return res.status(400).json({ error: "messageID e messageContent são obrigatórios." });
  }

  const linha = {
    messageID,
    messageContent,
    speakerName: speakerName ?? null,
    speakerID: speakerID ?? null,
    timeStamp: timeStamp ?? null,
    messageType: messageType ?? null,
    recebidoEm: new Date().toISOString(),
  };

  try {
    await appendFile(TRANSCRIPT_FILE, JSON.stringify(linha) + "\n", "utf8");
    return res.json({ ok: true });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ error: "Falha ao salvar transcrição." });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend do spike Zoom RN disponível em http://0.0.0.0:${PORT}`);
  console.log("Use o IP da sua máquina na rede local (ex.: http://192.168.x.x:" + PORT + ") no app Expo, não 'localhost'.");
});
