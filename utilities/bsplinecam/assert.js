"use strict";

/**
 * @param {any} condition condition to assert
 * @param {string} error message on failed assertion
 */
function assert(
	condition,
	error
) {
	if(false === config.enableAsserts)
		return;
	if(!condition)
		throw new Error(
			"bsplinecam assertion failed: " +
			error ? error : "no message specified"
		);
}
