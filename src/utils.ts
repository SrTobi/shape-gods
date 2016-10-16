

export function radToDeg(rad: number) {
    return rad * (180/Math.PI);
}

export function degToRad(deg: number) {
    return deg * (Math.PI/180);
}

export function randIndex<T>(array: T[]): number {
    return Math.floor(Math.random() * array.length);
}

export function randElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}