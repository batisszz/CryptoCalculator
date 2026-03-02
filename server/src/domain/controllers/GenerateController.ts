import type { Request, Response } from 'express';

export const generateText = (req: Request, res: Response): void => {
    try {
        const words = ["RAHASIA", "NEGARA", "DOKUMEN", "PENTING", "SERANGAN", "FAJAR", "KODE", "ENIGMA", "KRIPTOGRAFI", "OPERASI", "SENYAP"];
        const w1 = words[Math.floor(Math.random() * words.length)];
        const w2 = words[Math.floor(Math.random() * words.length)];
        
        res.json({ status: 'success', result: `${w1} ${w2}` });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const generateKey = (req: Request, res: Response): void => {
    try {
        const { method, matrixSize } = req.body;
        
        if (!method) {
            res.status(400).json({ error: "Method wajib dikirim untuk membuat kunci!" });
            return;
        }

        let newKey = '';
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const cleanMethod = method.trim().toLowerCase();
        
        const size = matrixSize || 2; 

        if (cleanMethod === 'vigenere' || cleanMethod === 'playfair') {
            const length = Math.floor(Math.random() * 4) + 5; // 5-8 huruf
            for(let i=0; i<length; i++) newKey += alphabet[Math.floor(Math.random() * 26)];
        } 
        else if (cleanMethod === 'enigma') {
            for(let i=0; i<3; i++) newKey += alphabet[Math.floor(Math.random() * 26)];
        } 
        else if (cleanMethod === 'affine') {
            const validA = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25];
            const a = validA[Math.floor(Math.random() * validA.length)];
            const b = Math.floor(Math.random() * 26);
            newKey = `${a},${b}`;
        } 
        else if (cleanMethod === 'hill') {
            const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
            let valid = false;
            
            while(!valid) {
                if (size === 2) {
                    const m = Array.from({length: 4}, () => Math.floor(Math.random() * 26));
                    let det = (m[0] * m[3] - m[1] * m[2]) % 26;
                    if (det < 0) det += 26;
                    
                    if (det !== 0 && gcd(det, 26) === 1) {
                        newKey = m.map(x => alphabet[x]).join('');
                        valid = true;
                    }
                } else if (size === 3) {
                    const m = Array.from({length: 9}, () => Math.floor(Math.random() * 26));
                    
                    let det = (
                        m[0] * (m[4] * m[8] - m[5] * m[7]) -
                        m[1] * (m[3] * m[8] - m[5] * m[6]) +
                        m[2] * (m[3] * m[7] - m[4] * m[6])
                    ) % 26;
                    
                    if (det < 0) det += 26;
                    
                    if (det !== 0 && gcd(det, 26) === 1) {
                        newKey = m.map(x => alphabet[x]).join('');
                        valid = true;
                    }
                }
            }
        } else {
            res.status(400).json({ error: "Metode tidak didukung" });
            return;
        }

        res.json({ status: 'success', result: newKey });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};