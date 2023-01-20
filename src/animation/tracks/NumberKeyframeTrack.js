import { KeyframeTrack } from '../KeyframeTrack.js';

/**
 * Used for number property track.
 * @memberof t3d
 * @extends t3d.KeyframeTrack
 */
class NumberKeyframeTrack extends KeyframeTrack {

	/**
	 * @param {t3d.Object3D} target
	 * @param {String} propertyPath
	 * @param {Array} times
	 * @param {Array} values
	 * @param {Boolean} [interpolant=true]
	 */
	constructor(target, propertyPath, times, values, interpolant) {
		super(target, propertyPath, times, values, interpolant);
	}

}

/**
 * @readonly
 * @type {String}
 * @default 'number'
 */
NumberKeyframeTrack.prototype.valueTypeName = 'number';

export { NumberKeyframeTrack };