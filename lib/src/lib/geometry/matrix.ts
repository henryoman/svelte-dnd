export interface Matrix2D {
	a: number;
	b: number;
	c: number;
	d: number;
	e: number;
	f: number;
}

export const IDENTITY_MATRIX: Matrix2D = {
	a: 1,
	b: 0,
	c: 0,
	d: 1,
	e: 0,
	f: 0
};

export function translateMatrix(x: number, y: number): Matrix2D {
	return {
		...IDENTITY_MATRIX,
		e: x,
		f: y
	};
}

export function multiplyMatrix(left: Matrix2D, right: Matrix2D): Matrix2D {
	return {
		a: left.a * right.a + left.c * right.b,
		b: left.b * right.a + left.d * right.b,
		c: left.a * right.c + left.c * right.d,
		d: left.b * right.c + left.d * right.d,
		e: left.a * right.e + left.c * right.f + left.e,
		f: left.b * right.e + left.d * right.f + left.f
	};
}

export function matrixToCss(matrix: Matrix2D): string {
	return `matrix(${matrix.a}, ${matrix.b}, ${matrix.c}, ${matrix.d}, ${matrix.e}, ${matrix.f})`;
}
