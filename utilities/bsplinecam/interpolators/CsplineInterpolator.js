"use strict";

class CsplineInterpolator {
	cpoints;	/* private vec3[] -> number[][] */

	/**
	 * @public
	 * @param {number[][]} cpoints control points for the spline.
	 */
	constructor(
		cpoints
	) {
		this.resetControlPoints(cpoints);
	}

	/**
	 * @public
	 * @param {number[][]} cpoints control points for the spline.
	 */
	resetControlPoints(
		cpoints
	) {
		assert(
			cpoints.length > 0,
			"0 control points"
		);
		assert(
			0 === cpoints.length % 4,
			"non-multiple of 4 number of control points"
		);
		
		if(undefined !== this.cpoints)
			delete this.cpoints;

		// deep copy cpoints
		this.cpoints = structuredClone(cpoints);
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
		const nsegments = Math.trunc(this.cpoints.length / 4);
		const spline_segment_index_dist = clamped_t * nsegments;

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
