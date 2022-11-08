export function rand() {
    return Math.floor(256 * Math.random());
}

export function dec2bin(dec: number) {
    return dec.toString(2).padStart(8, '0');
}

export function deepClone(subject: any) {
    return JSON.parse(JSON.stringify(subject));
}

export function matrix(x: number, y: number) {
    return Array(x).fill(0).map(() => Array(y).fill(0))
}

export function clamp (x: number, min: number, max: number) {
    return Math.min(Math.max(x, min), max);
}
