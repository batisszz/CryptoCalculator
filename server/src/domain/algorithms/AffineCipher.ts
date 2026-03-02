import { ICipher } from '../interfaces/ICipher';

export class AffineCipher implements ICipher {
    encrypt(text: string, key: string): string {
        return this.process(text, key, true);
    }

    decrypt(text: string, key: string): string {
        return this.process(text, key, false);
    }

    private process(text: string, key: string, isEncrypt: boolean): string {
        const keys = key.split(',');
        if (keys.length !== 2) throw new Error("Format kunci Affine harus 'a,b' (contoh: 5,8)");
        
        const a = parseInt(keys[0].trim());
        const b = parseInt(keys[1].trim());

        if (isNaN(a) || isNaN(b)) throw new Error("Kunci a dan b harus berupa angka!");
        
        if (this.gcd(a, 26) !== 1) {
            throw new Error(`Kunci 'a' (${a}) tidak valid! Harus koprima dengan 26 (contoh: 3, 5, 7, 11, 15, 17, 19, 21, 23, 25).`);
        }

        let result = '';
        const textUpper = text.toUpperCase();
        const a_inv = this.modInverse(a, 26);

        for (let i = 0; i < textUpper.length; i++) {
            const char = textUpper.charAt(i);
            
            if (char >= 'A' && char <= 'Z') {
                const x = char.charCodeAt(0) - 65;
                let c;

                if (isEncrypt) {
                    c = (a * x + b) % 26;
                } else {
                    c = (a_inv * (x - b)) % 26;
                    if (c < 0) c += 26;
                }

                result += String.fromCharCode(c + 65);
            } else {
                result += char;
            }
        }
        return result;
    }

    private gcd(a: number, b: number): number {
        while (b !== 0) {
            let temp = b;
            b = a % b;
            a = temp;
        }
        return Math.abs(a);
    }

    private modInverse(a: number, m: number): number {
        for (let x = 1; x < m; x++) {
            if (((a % m) * (x % m)) % m === 1) {
                return x;
            }
        }
        return -1;
    }
}