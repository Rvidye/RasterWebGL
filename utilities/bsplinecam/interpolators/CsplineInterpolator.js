"use strict";

class CsplineInterpolator {
	cpoints;	/* private vec3[] -> number[][] */
	nsplines;	/* private int */

	/**
	 * @public
	 * @param {number[][]} cpoints control points for the spline.
	 */
	constructor(
		cpoints
	) {
		this.cpoints = [];
		this.resetControlPoints(cpoints);
		this.nsplines = Math.trunc(cpoints.length / 4);
	}

	/**
	 * @public
	 * @param {number[][]} cpoints control points for the spline.
	 */
	resetControlPoints(
		cpoints
	) {
		assert(
			0 !== cpoints.length,
			"0 control points"
		);
		assert(
			0 === cpoints.length % 4,
			"non-multiple of 4 number of control points"
		);
		this.cpoints.length = 0;

		const ncpoints = cpoints.length;
		const ndims = cpoints[0].length;
		switch(ndims) {
			case 3:
				for(let i = 0; i < ncpoints; i++)
					this.cpoints.push([
						cpoints[i][0],
						cpoints[i][1],
						cpoints[i][2]
					]);
				break;
			case 2:
				for(let i = 0; i < ncpoints; i++) {
					this.cpoints.push([
						cpoints[i][0],
						cpoints[i][1]
					]);
				}
				break;

			default:
				for(let i = 0; i < ncpoints; i++)
					for(let j = 0; j < ndims; j++)
						this.cpoints.push([
							cpoints[i][j]
						]);
				break;
		}
	}

	/**
	 * Maps parameteric distance (range `[0.0, 1.0]`) onto range
	 * `[0.0, number of bezier curves the spline has]`.
	 * 
	 * Useful in localizing a point corresponding to a particular `t`
	 * value on a given spline.
	 * 
	 * @param {number} t interpolating parameter
	 */
	splineSegmentIndexDistance(
		t
	) {
		return t * this.nsplines;
	}

	/**
	 * @public
	 * @param {number} t interpolating parameter
	 */
	interpolateSpline(
		t
	) {
		if(t < 0.00001)
			return this.cpoints[0];
		if(t > 0.99999)
			return this.cpoints[this.cpoints.length - 1];

		const clamped_t = clamp(t, 0.0, 1.0);
		const spline_segment_index_dist = this.splineSegmentIndexDistance(clamped_t);

		const segment_starting_cpoint_index = Math.floor(spline_segment_index_dist);
		const a = this.cpoints[segment_starting_cpoint_index * 4 + 0];
		const b = this.cpoints[segment_starting_cpoint_index * 4 + 1];
		const c = this.cpoints[segment_starting_cpoint_index * 4 + 2];
		const d = this.cpoints[segment_starting_cpoint_index * 4 + 3];
		const segment_t = spline_segment_index_dist - Math.floor(spline_segment_index_dist);

		/* cubic -> quadratic */
		const q0 = mix(a, b, segment_t);
		const q1 = mix(b, c, segment_t);
		const q2 = mix(c, d, segment_t);

		/* quadratic -> line */
		const l0 = mix(q0, q1, segment_t);
		const l1 = mix(q1, q2, segment_t);

		/* line -> point */
		return mix(l0, l1, segment_t);
	}
}
