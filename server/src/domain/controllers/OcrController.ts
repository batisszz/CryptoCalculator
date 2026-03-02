import type { Request, Response } from 'express';
import Tesseract from 'tesseract.js';

export const processImageOcr = async (req: Request, res: Response): Promise<void> => {
    try {
        const file = req.file;
        if (!file) {
            res.status(400).json({ error: "Gambar tidak ditemukan!" });
            return;
        }

        const { data: { text } } = await Tesseract.recognize(
            file.buffer, 
            'eng+ind',
        );

        res.json({ status: 'success', text: text.trim() });
    } catch (error: any) {
        res.status(500).json({ error: "Gagal memproses OCR: " + error.message });
    }
};