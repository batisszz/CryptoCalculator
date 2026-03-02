import type { Request, Response } from 'express';
import { CipherFactory } from '../factory/CipherFactory';

export const processCipher = (req: Request, res: Response): void => {
    try {
        const { method, text, key, action } = req.body; 
        
        if (!method || !text || !key || !action) {
            res.status(400).json({ error: "Data tidak lengkap!" });
            return;
        }

        const cipher = CipherFactory.getCipher(method);
        const output = action === 'encrypt' ? cipher.encrypt(text, key) : cipher.decrypt(text, key);
        
        let result = '';
        let visualization = null;

        if (typeof output === 'string') {
            result = output;
        } else {
            result = output.result;
            visualization = output.visualization;
        }

        res.json({ status: 'success', result, visualization });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}


export const processFileCipher = (req: Request, res: Response): void => {
    try {
        const { method, key, action } = req.body;
        const file = req.file;

        if (!file) {
            res.status(400).json({ error: "File .txt tidak ditemukan!" });
            return;
        }
        if (!method || !key || !action) {
            res.status(400).json({ error: "Data parameter tidak lengkap!" });
            return;
        }

        const text = file.buffer.toString('utf-8');

        const cipher = CipherFactory.getCipher(method);
        const output = action === 'encrypt' ? cipher.encrypt(text, key) : cipher.decrypt(text, key);
        
        const finalString = typeof output === 'string' ? output : output.result;

        const fileName = `Crypto_${action}_${method}.txt`;
        res.setHeader('Content-disposition', `attachment; filename=${fileName}`);
        res.setHeader('Content-type', 'text/plain');
        res.send(finalString);

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};