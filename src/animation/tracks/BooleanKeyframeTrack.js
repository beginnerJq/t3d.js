import { KeyframeTrack } from '../KeyframeTrack.js';

/**
 * Used for boolean property track.
 * @memberof t3d
 * @extends t3d.KeyframeTrack
 */
class BooleanKeyframeTrack extends KeyframeTrack {

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

	_interpolate(index0, _ratio, outBuffer) {
		outBuffer[0] = this.values[index0];
		return outBuffer;
	}

}

/**
 * @readonly
 * @type {String}
 * @default 'bool'
 */
BooleanKeyframeTrack.prototype.valueTypeName = 'bool';

export { BooleanKeyframeTrack };