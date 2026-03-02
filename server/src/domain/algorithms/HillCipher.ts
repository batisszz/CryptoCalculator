import { ICipher } from '../interfaces/ICipher';

export class HillCipher implements ICipher {
    encrypt(text: string, key: string): any {
        const { matrix, size } = this.parseKey(key);
        return {
            result: this.process(text, matrix, size),
            visualization: { type: 'matrix', title: `Matriks Kunci Hill ${size}x${size} (Enkripsi)`, data: this.toLetterMatrix(matrix) }
        };
    }

    decrypt(text: string, key: string): any {
        const { matrix, size } = this.parseKey(key);
        const invMatrix = this.invertMatrix(matrix, size);
        return {
            result: this.process(text, invMatrix, size),
            visualization: { type: 'matrix', title: `Matriks Invers Hill ${size}x${size} (Dekripsi)`, data: this.toLetterMatrix(invMatrix) }
        };
    }

    private toLetterMatrix(matrix: number[][]): string[][] {
        return matrix.map(row => 
            row.map(val => String.fromCharCode(((val % 26) + 26) % 26 + 65))
        );
    }

    private parseKey(key: string): { matrix: number[][], size: number } {
        const cleanKey = key.toUpperCase().replace(/[^A-Z]/g, '');
        if (cleanKey.length === 4) {
            return {
                matrix: [
                    [cleanKey.charCodeAt(0) - 65, cleanKey.charCodeAt(1) - 65],
                    [cleanKey.charCodeAt(2) - 65, cleanKey.charCodeAt(3) - 65]
                ],
                size: 2
            };
        } else if (cleanKey.length === 9) {
            return {
                matrix: [
                    [cleanKey.charCodeAt(0) - 65, cleanKey.charCodeAt(1) - 65, cleanKey.charCodeAt(2) - 65],
                    [cleanKey.charCodeAt(3) - 65, cleanKey.charCodeAt(4) - 65, cleanKey.charCodeAt(5) - 65],
                    [cleanKey.charCodeAt(6) - 65, cleanKey.charCodeAt(7) - 65, cleanKey.charCodeAt(8) - 65]
                ],
                size: 3
            };
        }
        throw new Error("Kunci Hill Cipher harus tepat 4 huruf (2x2) atau 9 huruf (3x3)!");
    }

    private process(text: string, matrix: number[][], size: number): string {
        let cleanText = text.toUpperCase().replace(/[^A-Z]/g, '');
        while (cleanText.length % size !== 0) cleanText += 'X';

        let result = '';
        for (let i = 0; i < cleanText.length; i += size) {
            const vector = [];
            for (let j = 0; j < size; j++) vector.push(cleanText.charCodeAt(i + j) - 65);
            
            for (let row = 0; row < size; row++) {
                let sum = 0;
                for (let col = 0; col < size; col++) {
                    sum += matrix[row][col] * vector[col];
                }
                result += String.fromCharCode(((sum % 26) + 26) % 26 + 65);
            }
        }
        return result;
    }

    private invertMatrix(matrix: number[][], size: number): number[][] {
        if (size === 2) {
            const a = matrix[0][0], b = matrix[0][1], c = matrix[1][0], d = matrix[1][1];
            let det = (a * d - b * c) % 26;
            det = ((det % 26) + 26) % 26;
            const detInv = this.modInverse(det, 26);
            
            return [
                [((d * detInv) % 26 + 26) % 26, ((-b * detInv) % 26 + 26) % 26],
                [((-c * detInv) % 26 + 26) % 26, ((a * detInv) % 26 + 26) % 26]
            ];
        } else {
            const m = matrix;
            const det = (
                m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
                m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
                m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
            ) % 26;
            const cleanDet = ((det % 26) + 26) % 26;
            const detInv = this.modInverse(cleanDet, 26);

            const adjugate = [
                [(m[1][1] * m[2][2] - m[1][2] * m[2][1]), -(m[0][1] * m[2][2] - m[0][2] * m[2][1]), (m[0][1] * m[1][2] - m[0][2] * m[1][1])],
                [-(m[1][0] * m[2][2] - m[1][2] * m[2][0]), (m[0][0] * m[2][2] - m[0][2] * m[2][0]), -(m[0][0] * m[1][2] - m[0][2] * m[1][0])],
                [(m[1][0] * m[2][1] - m[1][1] * m[2][0]), -(m[0][0] * m[2][1] - m[0][1] * m[2][0]), (m[0][0] * m[1][1] - m[0][1] * m[1][0])]
            ];

            const inv = [[0,0,0], [0,0,0], [0,0,0]];
            for (let r=0; r<3; r++) {
                for (let c=0; c<3; c++) {
                    let val = (adjugate[r][c] * detInv) % 26;
                    inv[r][c] = ((val % 26) + 26) % 26;
                }
            }
            return inv;
        }
    }

    private modInverse(a: number, m: number): number {
        for (let x = 1; x < m; x++) {
            if (((a % m) * (x % m)) % m === 1) return x;
        }
        throw new Error(`Determinan tidak memiliki invers. Gunakan Generator Kunci Valid!`);
    }
}