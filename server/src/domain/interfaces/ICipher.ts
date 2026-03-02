export interface CipherOutput {
    result: string;
    visualization?: {
        type: string;
        title: string;
        data: any[][];
    };
}

export interface ICipher {
    encrypt(text: string, key: string): string | CipherOutput;
    decrypt(text: string, key: string): string | CipherOutput;
}