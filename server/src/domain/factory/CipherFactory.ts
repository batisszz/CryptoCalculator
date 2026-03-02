import type { ICipher } from '../interfaces/ICipher';
import { VigenereCipher } from '../algorithms/VigenereCipher';
import { AffineCipher } from '../algorithms/AffineCipher';
import { PlayfairCipher } from '../algorithms/PlayfairCipher';
import { HillCipher } from '../algorithms/HillCipher';
import { EnigmaCipher } from '../algorithms/EnigmaCipher';

export class CipherFactory {
    static getCipher(type: string): ICipher {
        const cleanType = type.trim().toLowerCase();
        console.log(`[DEBUG FACTORY] Mencari algoritma: "${cleanType}"`);

        switch (cleanType) {
            case 'vigenere': return new VigenereCipher();
            case 'affine': return new AffineCipher();
            case 'playfair': return new PlayfairCipher();
            case 'hill': return new HillCipher();
            case 'enigma': return new EnigmaCipher();
            default:
                console.log(`[DEBUG FACTORY] GAGAL! Algoritma "${cleanType}" tidak ada di daftar switch!`);
                throw new Error(`Algoritma ${type} belum didukung.`);
        }
    }
}