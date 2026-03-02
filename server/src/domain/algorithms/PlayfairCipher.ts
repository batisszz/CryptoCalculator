import { ICipher } from '../interfaces/ICipher';

export class PlayfairCipher implements ICipher {
    encrypt(text: string, key: string): any {
        return this.process(text, key, true);
    }

    decrypt(text: string, key: string): any {
        return this.process(text, key, false);
    }

    private process(text: string, key: string, isEncrypt: boolean): any {
        const matrix = this.generateMatrix(key);
        let preparedText = this.prepareText(text, isEncrypt);
        let result = '';

        for (let i = 0; i < preparedText.length; i += 2) {
            const char1 = preparedText[i];
            const char2 = preparedText[i + 1];
            const pos1 = this.findPosition(matrix, char1);
            const pos2 = this.findPosition(matrix, char2);

            if (pos1.row === pos2.row) {
                const shift = isEncrypt ? 1 : 4;
                result += matrix[pos1.row][(pos1.col + shift) % 5];
                result += matrix[pos2.row][(pos2.col + shift) % 5];
            } else if (pos1.col === pos2.col) {
                const shift = isEncrypt ? 1 : 4;
                result += matrix[(pos1.row + shift) % 5][pos1.col];
                result += matrix[(pos2.row + shift) % 5][pos2.col];
            } else {
                result += matrix[pos1.row][pos2.col];
                result += matrix[pos2.row][pos1.col];
            }
        }
        
        return {
            result: result,
            visualization: {
                type: 'matrix',
                title: 'Matriks Playfair 5x5',
                data: matrix
            }
        };
    }

    private generateMatrix(key: string): string[][] {
        const alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ"; // Tanpa J
        const keyClean = key.toUpperCase().replace(/[^A-Z]/g, '').replace(/J/g, 'I');
        let combined = keyClean + alphabet;
        
        let uniqueChars = Array.from(new Set(combined.split(''))).join('');
        
        const matrix: string[][] = [];
        let index = 0;
        for (let r = 0; r < 5; r++) {
            matrix[r] = [];
            for (let c = 0; c < 5; c++) {
                matrix[r][c] = uniqueChars[index++];
            }
        }
        return matrix;
    }

    private prepareText(text: string, isEncrypt: boolean): string {
        let cleanText = text.toUpperCase().replace(/[^A-Z]/g, '').replace(/J/g, 'I');
        if (isEncrypt) {
            let i = 0;
            while (i < cleanText.length - 1) {
                if (cleanText[i] === cleanText[i + 1]) {
                    cleanText = cleanText.slice(0, i + 1) + 'X' + cleanText.slice(i + 1);
                }
                i += 2;
            }
            if (cleanText.length % 2 !== 0) cleanText += 'X';
        }
        return cleanText;
    }

    private findPosition(matrix: string[][], char: string): { row: number, col: number } {
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                if (matrix[r][c] === char) return { row: r, col: c };
            }
        }
        return { row: 0, col: 0 };
    }
}