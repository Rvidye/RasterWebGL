"use strict";

/**
 * 
 * @param {number | number[]} a - start
 * @param {number | number[]} b - end
 * @param {number} t - a value in range [0, 1]
 * @returns {number | number[]} `(1 - t).a + t.b`
 */
function mix(
	a,
	b,
	t
) {
	const one_minus_t = 1.0 - t;
	const fmix = (a, b, t) => (one_minus_t * a) + (t * b);

	if(undefined === a.length)
		return fmix(a, b, t);

	assert(
		b.length === a.length,
		"dimension mismatch\n" + 
		"a: [" + a.toString() + "]\n" +
		"b: [" + b.toString() + "]"
	);
	assert(
		0 !== a.length,
		"0 length vectors\n" +
		"a: [" + a.toString() + "]\n" +
		"b: [" + b.toString() + "]"
	);

	switch(a.length) {
		case 3:
			return [
				fmix(a[0], b[0], t),
				fmix(a[1], b[1], t),
				fmix(a[2], b[2], t)
			];
		case 2:
			return [
				fmix(a[0], b[0], t),
				fmix(a[1], b[1], t)
			];

		default:
			const mixed = [];
			for(let i = 0; i < a.length; i++)
				mixed[i] = fmix(a[i], b[i], t);
			return mixed;
	}
}

/**
 * 
 * @param {number | number[]} v value
 * @param {number | number[]} a minimum bound
 * @param {number | number[]} b maximum bound
 * @returns {number | number[]} clamped value
 */
function clamp (
	v,
	a,
	b
) {
	let fclamp = (v, a, b) => Math.min(Math.max(a, v), b);

	if(undefined === a.length)
		return fclamp(v, a, b);

	assert(
		v.length === a.length && v.length === b.length,
		"dimension mismatch\n" + 
		"v: [" + v.toString() + "]\n" +
		"a: [" + a.toString() + "]\n" +
		"b: [" + b.toString() + "]"
	);

	
	switch(v.length) {
		case 3:
			return [
				fclamp(v[0], a[0], b[0]),
				fclamp(v[1], a[1], b[1]),
				fclamp(v[2], a[2], b[2])
			];
		case 2:
			return [
				fclamp(v[0], a[0], b[0]),
				fclamp(v[1], a[1], b[1])
			];

		default:
			const clamped = [];
			for(let i = 0; i < v.length; i++)
				clamped[i] = fclamp(v[i], a[i], b[i]);
			return clamped;
	}
}
