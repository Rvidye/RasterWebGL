"use strict";

class BsplineInterpolator {
	points;  /* private vec3[] -> number[][] */
	cspline_interpolator;  /* CsplineInterpolator */

	/**
	 * @public
	 * @param {number[][]} points points through which the spline must pass
	 */
	constructor(
		points
	) {
		this.originalPoint = points;
		this.cspline_interpolator = null;
		if(points) {
			this.updatePoints(points);
			this.recalculateSpline();
		}
	}

	/**
	 * @public
	 * @param {number[][]} points points through which the spline must pass
	 */
	updatePoints(
		points
	) {
		if(undefined !== this.points) {
			this.points.forEach(point => point.delete());
			this.points = undefined;
		}
		const npoints = points.length;
		const ndims = points[0].length;
		this.originalPoint = points;
		this.points = new Array();
		for(let i = 0; i < npoints; i++) {
			const vector = new eigen.Matrix(1, ndims);
			for(let j = 0; j < ndims; j++) {
				vector.set(0, j, points[i][j]);
			}
			eigen.GC.pushException(vector);
			this.points.push(vector);
		}
	}

	/**
	 * Computes a new set of control points for the cspline such that
	 * the bspline interpolates through `points`, set in the `constructor()`
	 * or last call to `updatePoints()`.
	 * 
	 * @public
	 */
	recalculateSpline() {
		const npoints = this.points.length;
		const ndims = this.points[0].cols();
		
		const P0 = this.points[0];
		if(1 === npoints) {
			const cpoints = new Array(4);
			for(let i = 0; i < 4; i++) {
				cpoints[i] = new Array(ndims).fill(0);
				for(let j = 0; j < ndims; j++) {
					cpoints[i][j] = P0.get(j);
				}
			}
			this.cspline_interpolator = new CsplineInterpolator(cpoints);
			return;
		}

		const P1 = this.points[1];
		if(2 === npoints) {
			const cpoints = new Array(4);
			for(let i = 0; i < 2; i++) {
				cpoints[i] = new Array(ndims).fill(0);
				for(let j = 0; j < ndims; j++) {
					cpoints[i][j] = P0.get(j);
				}
			}
			for(let i = 2; i < 4; i++) {
				cpoints[i] = new Array(ndims).fill(0);
				for(let j = 0; j < ndims; j++) {
					cpoints[i][j] = P1.get(j);
				}
			}
			this.cspline_interpolator = new CsplineInterpolator(cpoints);
			return;
		}

		// number of points on spline not on extreme ends
		const nnon_ends = npoints - 2;

		// 'r_mat' is the 'R' in the matrix equation M.C = R
		const r_mat = new eigen.Matrix(nnon_ends, ndims);
		const Pnn = this.points[npoints - 2];
		const Pn = this.points[npoints - 1];
		for(let j = 0; j < ndims; j++) {
			r_mat.set(0, j, P1.mul(6).get(j) - P0.get(j));
		}
		for(let i = 2; i < nnon_ends; i++) {
			for(let j = 0; j < ndims; j++) {
				r_mat.set(i - 1, j, this.points[i].mul(6).get(j));
			}
		}
		for(let j = 0; j < ndims; j++) {
			r_mat.set(nnon_ends - 1, j, Pnn.mul(6).get(j) - Pn.get(j));
		}

		// control points of the bspline, which can now generate those
		// for the cspline
		const nbspline_cpoints = npoints;
		const bspline_cpoints_mat = new eigen.Matrix(nbspline_cpoints, ndims);
		for(let j = 0; j < ndims; j++) {
			bspline_cpoints_mat.set(0, j, P0.get(j));
		}
		bspline_cpoints_mat.setBlock(1, 0, this._cubicBsplineKernel(nnon_ends).matMul(r_mat));
		for(let j = 0; j < ndims; j++) {
			bspline_cpoints_mat.set(nbspline_cpoints - 1, j, Pn.get(j));
		}

		// generate control points of the cspline from those of the bspline
		const ncpoints = (npoints - 1) * 4;
		const cpoints = new Array(ncpoints);
		for(let i = 0; i < cpoints.length; i++) {
			cpoints[i] = new Array(ndims).fill(0);
		}

		let count = 0;
		for(let i = 0; i < nbspline_cpoints - 1; i++) {
			for(let j = 0; j < ndims; j++) {
				cpoints[count][j] = this.points[i].get(j);
			}
			count++;
			if(i > 0) {
				for(let j = 0; j < ndims; j++) {
					cpoints[count][j] = this.points[i].get(j);
				}
				count++;
			}
			for(let j = 0; j < ndims; j++) {
				cpoints[count][j] = (2 / 3) * bspline_cpoints_mat.get(i, j) + (1 / 3) * bspline_cpoints_mat.get(i + 1, j);
			}
			count++;
			for(let j = 0; j < ndims; j++) {
				cpoints[count][j] = (1 / 3) * bspline_cpoints_mat.get(i, j) + (2 / 3) * bspline_cpoints_mat.get(i + 1, j);
			}
			count++;
		}
		for(let j = 0; j < ndims; j++) {
			cpoints[count][j] = bspline_cpoints_mat.get(npoints - 1, j);
		}

		eigen.GC.flush();

		this.cspline_interpolator = new CsplineInterpolator(cpoints);
	}

	/**
	 * @public
	 * @param {number} t interpolating parameter
	 */
	interpolateSpline(
		t
	) {
		return this.cspline_interpolator.interpolateSpline(t);
	}

	/**
	 * Gets an inverted `nnon_ends x nnon_ends` 1-4-1 matrix.
	 * 
	 * @param {number} nnon_ends - Number of non-extreme points in spline.
	 * @private
	 */
	_cubicBsplineKernel(
		nnon_ends
	) {
		const kernel = new eigen.Matrix(nnon_ends, nnon_ends);
		for(let i = 0; i < nnon_ends; i++) {
			for(let j = 0; j < nnon_ends; j++) {
				if(j == i - 1)
					kernel.set(i, j, 1);
				if(j == i)
					kernel.set(i, j, 4);
				if(j == i + 1)
					kernel.set(i, j, 1);
			}
		}
		return kernel.inverse();
	}

	getPoints(){
		return this.originalPoint;
	}
}
