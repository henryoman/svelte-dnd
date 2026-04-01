export const IDENTITY_MATRIX = {
    a: 1,
    b: 0,
    c: 0,
    d: 1,
    e: 0,
    f: 0
};
export function translateMatrix(x, y) {
    return {
        ...IDENTITY_MATRIX,
        e: x,
        f: y
    };
}
export function multiplyMatrix(left, right) {
    return {
        a: left.a * right.a + left.c * right.b,
        b: left.b * right.a + left.d * right.b,
        c: left.a * right.c + left.c * right.d,
        d: left.b * right.c + left.d * right.d,
        e: left.a * right.e + left.c * right.f + left.e,
        f: left.b * right.e + left.d * right.f + left.f
    };
}
export function matrixToCss(matrix) {
    return `matrix(${matrix.a}, ${matrix.b}, ${matrix.c}, ${matrix.d}, ${matrix.e}, ${matrix.f})`;
}
