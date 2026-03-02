import type { Request, Response } from 'express';

export const getCipherMeta = (req: Request, res: Response): void => {
    try {
        const cipherInfo = {
            vigenere: {
                name: 'Vigenere Cipher',
                desc: 'Metode substitusi alfabet polyalphabetic yang menggunakan serangkaian sandi Caesar yang berbeda berdasarkan huruf-huruf dari sebuah kata kunci.',
                rule: 'Kunci harus berupa kata/kalimat (hanya huruf A-Z). Spasi atau angka pada kunci akan diabaikan.',
                placeholder: 'Contoh: RAHASIA'
            },
            affine: {
                name: 'Affine Cipher',
                desc: 'Jenis sandi substitusi monoalphabetic di mana setiap huruf dipetakan ke fungsi matematika (ax + b) mod 26.',
                rule: 'Kunci harus berupa 2 angka (a,b) yang dipisah koma. Syarat mutlak: Nilai "a" harus ganjil dan tidak boleh kelipatan 13 (Koprima dengan 26).',
                placeholder: 'Contoh: 5,8'
            },
            playfair: {
                name: 'Playfair Cipher',
                desc: 'Metode enkripsi simetris yang mengenkripsi pasangan huruf (bigram) menggunakan matriks 5x5. Huruf J akan digabung dengan I.',
                rule: 'Kunci berupa kata/kalimat (A-Z). Sistem otomatis akan membuat matriks 5x5 dari kata kunci tersebut.',
                placeholder: 'Contoh: KEYWORD'
            },
            hill: {
                name: 'Hill Cipher (2x2 / 3x3)',
                desc: 'Sandi substitusi polygraphic yang menggunakan aljabar linear (perkalian matriks) untuk mengenkripsi teks.',
                rule: 'Pilih ukuran matriks (2x2 atau 3x3). Syarat: Matriks harus memiliki determinan yang koprima dengan 26.',
                placeholder: 'Otomatis'
            },
            enigma: {
                name: 'Mesin Enigma (3 Rotor)',
                desc: 'Simulasi mesin enkripsi elektromekanis era Perang Dunia 2 (Rotor I, II, III dan Reflektor B).',
                rule: 'Kunci HARUS TEPAT 3 HURUF yang melambangkan posisi awal ketiga rotor dari kiri ke kanan.',
                placeholder: 'Contoh: CAT (Tepat 3 huruf)'
            }
        };

        res.json({ status: 'success', data: cipherInfo });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};