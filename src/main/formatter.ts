export class Formatter {
    private static round(value: number, decimals: number): number {
        return Number(Math.round(parseFloat(value + 'e' + decimals)) + 'e-' + decimals);
    }

    private static bytes(input: number, k: number, u: string): string {
        const KB = k;
        const MB = k * k;
        const GB = k * k * k;
        const TB = k * k * k * k;

        if (input == undefined) {
            console.warn('undefined input specified');
            return;
        }

        if (input > TB) {
            return this.round(input / TB, 2) + ' T' + u;
        } else if (input == TB) {
            return '1 T' + u;
        } else if (input > GB) {
            return this.round(input / GB, 2) + ' G' + u;
        } else if (input == GB) {
            return '1 G' + u;
        } else if (input > MB) {
            return this.round(input / MB, 2) + ' M' + u;
        } else if (input == MB) {
            return '1 M' + u;
        } else if (input > KB) {
            return this.round(input / KB, 2) + ' K' + u;
        } else if (input == KB) {
            return '1 K' + u;
        }

        return input + ' B';
    }

    public static BytesDecimal(input: number): string {
        return this.bytes(input, 1000, 'B');
    }

    public static BytesBinary(input: number): string {
        return this.bytes(input, 1024, 'iB');
    }
}