import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { processCipher, processFileCipher } from './domain/controllers/CipherController';
import { generateText, generateKey } from './domain/controllers/GenerateController';
import { getCipherMeta } from './domain/controllers/MetaController';
import { processImageOcr } from './domain/controllers/OcrController';
const app = express();
const PORT = 5005;

app.use(cors()); 
app.use(express.json());


const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/cipher', processCipher);
app.post('/api/cipher/file', upload.single('file'), processFileCipher); 
app.get('/api/generate/text', generateText);
app.post('/api/generate/key', generateKey);
app.get('/api/cipher/meta', getCipherMeta);
app.post('/api/ocr', upload.single('image'), processImageOcr);

app.listen(PORT, () => {
    console.log(`[SERVER] Backend berjalan di http://localhost:${PORT}`);
});

export default app;