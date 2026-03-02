import type { ICipher } from '../interfaces/ICipher';

export class VigenereCipher implements ICipher {
    encrypt(text: string, key: string): string {
        return this.process(text, key, true);
    }

    decrypt(text: string, key: string): string {
        return this.process(text, key, false);
    }

    private process(text: string, key: string, isEncrypt: boolean): string {
        let result = '';
        let keyIndex = 0;
        const textUpper = text.toUpperCase();
        const keyUpper = key.toUpperCase().replace(/[^A-Z]/g, '');

        if (!keyUpper) throw new Error("Kunci Vigenere harus mengandung huruf!");

        for (let i = 0; i < textUpper.length; i++) {
            const char = textUpper.charAt(i);

            if (char >= 'A' && char <= 'Z') {
                const p = char.charCodeAt(0) - 65;
                const k = keyUpper.charAt(keyIndex % keyUpper.length).charCodeAt(0) - 65;

                let c;
                if (isEncrypt) {
                    c = (p + k) % 26;
                } else {
                    c = (p - k + 26) % 26;
                }

                result += String.fromCharCode(c + 65);
                keyIndex++;
            } else {
                result += char;
            }
        }
        return result;
    }
}