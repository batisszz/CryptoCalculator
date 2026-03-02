import { ICipher } from '../interfaces/ICipher';

export class EnigmaCipher implements ICipher {
    private rotorI = "EKMFLGDQVZNTOWYHXUSPAIBRCJ";
    private rotorII = "AJDKSIRUXBLHWTMCQGZNPYFVOE";
    private rotorIII = "BDFHJLCPRTXVZNYEIWGAKMUSQO";
    private reflectorB = "YRUHQSLDPXNGOKMIEBFZCWVJAT";
    private alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    encrypt(text: string, key: string): string {
        return this.process(text, key);
    }

    decrypt(text: string, key: string): string {
        return this.process(text, key);
    }

    private process(text: string, key: string): string {
        const cleanKey = key.toUpperCase().replace(/[^A-Z]/g, '');
        if (cleanKey.length !== 3) throw new Error("Kunci Enigma harus tepat 3 huruf untuk posisi awal Rotor (contoh: CAT)");

        let r1 = cleanKey.charCodeAt(2) - 65; // Rotor Kanan
        let r2 = cleanKey.charCodeAt(1) - 65; // Rotor Tengah
        let r3 = cleanKey.charCodeAt(0) - 65; // Rotor Kiri

        const cleanText = text.toUpperCase().replace(/[^A-Z]/g, '');
        let result = '';

        for (let i = 0; i < cleanText.length; i++) {
           
            r1 = (r1 + 1) % 26;
            if (r1 === 17) r2 = (r2 + 1) % 26; // Notch Rotor III
            if (r2 === 5) r3 = (r3 + 1) % 26;  // Notch Rotor II

            let char = cleanText[i];
            
            // Forward pass
            char = this.passRotor(char, this.rotorIII, r1, false);
            char = this.passRotor(char, this.rotorII, r2, false);
            char = this.passRotor(char, this.rotorI, r3, false);

            // Reflector
            char = this.reflectorB[this.alphabet.indexOf(char)];

            // Backward pass
            char = this.passRotor(char, this.rotorI, r3, true);
            char = this.passRotor(char, this.rotorII, r2, true);
            char = this.passRotor(char, this.rotorIII, r1, true);

            result += char;
        }
        return result;
    }

    private passRotor(char: string, wiring: string, offset: number, reverse: boolean): string {
        const charCode = char.charCodeAt(0) - 65;
        const posInRotor = (charCode + offset) % 26;

        if (!reverse) {
            let outChar = wiring[posInRotor];
            let outCode = outChar.charCodeAt(0) - 65;
            return String.fromCharCode(((outCode - offset + 26) % 26) + 65);
        } else {
            let outCode = wiring.indexOf(String.fromCharCode(posInRotor + 65));
            return String.fromCharCode(((outCode - offset + 26) % 26) + 65);
        }
    }
}