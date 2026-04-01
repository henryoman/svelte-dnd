export interface Matrix2D {
    a: number;
    b: number;
    c: number;
    d: number;
    e: number;
    f: number;
}
export declare const IDENTITY_MATRIX: Matrix2D;
export declare function translateMatrix(x: number, y: number): Matrix2D;
export declare function multiplyMatrix(left: Matrix2D, right: Matrix2D): Matrix2D;
export declare function matrixToCss(matrix: Matrix2D): string;
