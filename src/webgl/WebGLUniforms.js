import { PIXEL_TYPE, PIXEL_FORMAT, TEXTURE_FILTER, COMPARE_FUNC } from '../const.js';
import { Texture2D } from '../resources/textures/Texture2D.js';
import { TextureCube } from '../resources/textures/TextureCube.js';
import { Texture3D } from '../resources/textures/Texture3D.js';

// Empty textures

const emptyTexture = new Texture2D();
emptyTexture.image = { data: new Uint8Array([1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1]), width: 2, height: 2 };
emptyTexture.magFilter = TEXTURE_FILTER.NEAREST;
emptyTexture.minFilter = TEXTURE_FILTER.NEAREST;
emptyTexture.generateMipmaps = false;
emptyTexture.version++;
const emptyShadowTexture = new Texture2D();
emptyShadowTexture.image = { data: null, width: 2, height: 2 };
emptyShadowTexture.version++;
emptyShadowTexture.type = PIXEL_TYPE.FLOAT_32_UNSIGNED_INT_24_8_REV;
emptyShadowTexture.format = PIXEL_FORMAT.DEPTH_STENCIL;
emptyShadowTexture.magFilter = TEXTURE_FILTER.NEAREST;
emptyShadowTexture.minFilter = TEXTURE_FILTER.NEAREST;
emptyShadowTexture.compare = COMPARE_FUNC.LESS;
emptyShadowTexture.generateMipmaps = false;
emptyShadowTexture.version++;
const emptyTexture3d = new Texture3D();
const emptyCubeTexture = new TextureCube();

// Array helpers

function arraysEqual(a, b) {
	if (a.length !== b.length) return false;

	for (let i = 0, l = a.length; i < l; i++) {
		if (a[i] !== b[i]) return false;
	}

	return true;
}

function copyArray(a, b) {
	for (let i = 0, l = b.length; i < l; i++) {
		a[i] = b[i];
	}
}

// Texture unit allocation

const arrayCacheI32 = [];

function allocTexUnits(textures, n) {
	let r = arrayCacheI32[n];

	if (r === undefined) {
		r = new Int32Array(n);
		arrayCacheI32[n] = r;
	}

	for (let i = 0; i !== n; ++i) {
		r[i] = textures.allocTexUnit();
	}

	return r;
}

// Helper to pick the right setter for uniform

function generateSetter(uniform, pureArray) {
	const gl = uniform.gl;
	const type = uniform.type;
	const location = uniform.location;
	const cache = uniform.cache;

	switch (type) {
		case gl.FLOAT:
			uniform.setValue = function(value) {
				if (cache[0] === value) return;
				gl.uniform1f(location, value);
				cache[0] = value;
			}
			if (pureArray) {
				uniform.set = function(value) {
					if (arraysEqual(cache, value)) return;
					gl.uniform1fv(location, value);
					copyArray(cache, value);
				}
			} else {
				uniform.set = uniform.setValue;
			}
			break;
		case gl.SAMPLER_2D:
		case gl.SAMPLER_2D_SHADOW:
			uniform.setValue = function(value, textures) {
				const unit = textures.allocTexUnit();
				textures.setTexture2D(value || (type === gl.SAMPLER_2D_SHADOW ? emptyShadowTexture : emptyTexture), unit);
				if (cache[0] === unit) return;
				gl.uniform1i(location, unit);
				cache[0] = unit;
			}
			if (pureArray) {
				uniform.set = function(value, textures) {
					const n = value.length;
					const units = allocTexUnits(textures, n);
					for (let i = 0; i !== n; ++i) {
						textures.setTexture2D(value[i] || (type === gl.SAMPLER_2D_SHADOW ? emptyShadowTexture : emptyTexture), units[i]);
					}
					if (arraysEqual(cache, units)) return;
					gl.uniform1iv(location, units);
					copyArray(cache, units);
				}
			} else {
				uniform.set = uniform.setValue;
			}
			break;
		case gl.SAMPLER_CUBE:
		case gl.SAMPLER_CUBE_SHADOW:
			uniform.setValue = function(value, textures) {
				const unit = textures.allocTexUnit();
				textures.setTextureCube(value || emptyCubeTexture, unit);
				if (cache[0] === unit) return;
				gl.uniform1i(location, unit);
				cache[0] = unit;
			}
			if (pureArray) {
				uniform.set = function(value, textures) {
					const n = value.length;
					const units = allocTexUnits(textures, n);
					for (let i = 0; i !== n; ++i) {
						textures.setTextureCube(value[i] || emptyCubeTexture, units[i]);
					}
					if (arraysEqual(cache, units)) return;
					gl.uniform1iv(location, units);
					copyArray(cache, units);
				}
			} else {
				uniform.set = uniform.setValue;
			}
			break;
		case gl.SAMPLER_3D:
			uniform.setValue = function(value, textures) {
				const unit = textures.allocTexUnit();
				textures.setTexture3D(value || emptyTexture3d, unit);
				if (cache[0] === unit) return;
				gl.uniform1i(location, unit);
				cache[0] = unit;
			}
			if (pureArray) {
				uniform.set = function(value, textures) {
					const n = value.length;
					const units = allocTexUnits(textures, n);
					for (let i = 0; i !== n; ++i) {
						textures.setTexture3D(value[i] || emptyTexture3d, units[i]);
					}
					if (arraysEqual(cache, units)) return;
					gl.uniform1iv(location, units);
					copyArray(cache, units);
				}
			} else {
				uniform.set = uniform.setValue;
			}
			break;
		case gl.BOOL:
		case gl.INT:
			uniform.setValue = function(value) {
				if (cache[0] === value) return;
				gl.uniform1i(location, value);
				cache[0] = value;
			}
			if (pureArray) {
				uniform.set = function(value) {
					if (arraysEqual(cache, value)) return;
					gl.uniform1iv(location, value);
					copyArray(cache, value);
				}
			} else {
				uniform.set = uniform.setValue;
			}
			break;
		case gl.FLOAT_VEC2:
			uniform.setValue = function(p1, p2) {
				if (cache[0] !== p1 || cache[1] !== p2) {
					gl.uniform2f(location, p1, p2);
					cache[0] = p1;
					cache[1] = p2;
				}
			}
			uniform.set = function(value) {
				if (arraysEqual(cache, value)) return;
				gl.uniform2fv(location, value);
				copyArray(cache, value);
			}
			break;
		case gl.BOOL_VEC2:
		case gl.INT_VEC2:
			uniform.setValue = function(p1, p2) {
				if (cache[0] !== p1 || cache[1] !== p2) {
					gl.uniform2i(location, p1, p2);
					cache[0] = p1;
					cache[1] = p2;
				}
			}
			uniform.set = function(value) {
				if (arraysEqual(cache, value)) return;
				gl.uniform2iv(location, value);
				copyArray(cache, value);
			}
			break;
		case gl.FLOAT_VEC3:
			uniform.setValue = function(p1, p2, p3) {
				if (cache[0] !== p1 || cache[1] !== p2 || cache[2] !== p3) {
					gl.uniform3f(location, p1, p2, p3);
					cache[0] = p1;
					cache[1] = p2;
					cache[2] = p3;
				}
			}
			uniform.set = function(value) {
				if (arraysEqual(cache, value)) return;
				gl.uniform3fv(location, value);
				copyArray(cache, value);
			}
			break;
		case gl.BOOL_VEC3:
		case gl.INT_VEC3:
			uniform.setValue = function(p1, p2, p3) {
				if (cache[0] !== p1 || cache[1] !== p2 || cache[2] !== p3) {
					gl.uniform3i(location, p1, p2, p3);
					cache[0] = p1;
					cache[1] = p2;
					cache[2] = p3;
				}
			}
			uniform.set = function(value) {
				if (arraysEqual(cache, value)) return;
				gl.uniform3iv(location, value);
				copyArray(cache, value);
			}
			break;
		case gl.FLOAT_VEC4:
			uniform.setValue = function(p1, p2, p3, p4) {
				if (cache[0] !== p1 || cache[1] !== p2 || cache[2] !== p3 || cache[3] !== p4) {
					gl.uniform4f(location, p1, p2, p3, p4);
					cache[0] = p1;
					cache[1] = p2;
					cache[2] = p3;
					cache[3] = p4;
				}
			}
			uniform.set = function(value) {
				if (arraysEqual(cache, value)) return;
				gl.uniform4fv(location, value);
				copyArray(cache, value);
			}
			break;
		case gl.BOOL_VEC4:
		case gl.INT_VEC4:
			uniform.setValue = function(p1, p2, p3, p4) {
				if (cache[0] !== p1 || cache[1] !== p2 || cache[2] !== p3 || cache[3] !== p4) {
					gl.uniform4i(location, p1, p2, p3, p4);
					cache[0] = p1;
					cache[1] = p2;
					cache[2] = p3;
					cache[3] = p4;
				}
			}
			uniform.set = function(value) {
				if (arraysEqual(cache, value)) return;
				gl.uniform4iv(location, value);
				copyArray(cache, value);
			}
			break;

		case gl.FLOAT_MAT2:
			uniform.setValue = uniform.set = function(value) {
				if (arraysEqual(cache, value)) return;
				gl.uniformMatrix2fv(location, false, value);
				copyArray(cache, value);
			}
			break;
		case gl.FLOAT_MAT3:
			uniform.setValue = uniform.set = function(value) {
				if (arraysEqual(cache, value)) return;
				gl.uniformMatrix3fv(location, false, value);
				copyArray(cache, value);
			}
			break;
		case gl.FLOAT_MAT4:
			uniform.setValue = uniform.set = function(value) {
				if (arraysEqual(cache, value)) return;
				gl.uniformMatrix4fv(location, false, value);
				copyArray(cache, value);
			}
			break;
	}
}

// --- Uniform Classes ---

class SingleUniform {

	constructor(gl, id, activeInfo, location) {
		this.gl = gl;

		this.id = id;

		this.type = activeInfo.type;

		// this.size = activeInfo.size; // always be 1

		this.location = location;

		this.setValue = undefined;
		this.set = undefined;
		this.cache = [];

		generateSetter(this);
	}

}

class PureArrayUniform {

	constructor(gl, id, activeInfo, location) {
		this.gl = gl;

		this.id = id;

		this.type = activeInfo.type;

		this.size = activeInfo.size;

		this.location = location;

		this.setValue = undefined;
		this.set = undefined;
		this.cache = [];

		generateSetter(this, true);
	}

}

class UniformContainer {

	constructor() {
		this.seq = [];
		this.map = {};
	}

}

class StructuredUniform extends UniformContainer {

	constructor(id) {
		super();
		this.id = id;
	}

	set(value, textures) {
		const seq = this.seq;

		for (let i = 0, n = seq.length; i !== n; ++i) {
			const u = seq[i];
			u.set(value[u.id], textures);
		}
	}

}

// --- Top-level ---

// Parser - builds up the property tree from the path strings

const RePathPart = /(\w+)(\])?(\[|\.)?/g;

// extracts
// 	- the identifier (member name or array index)
//  - followed by an optional right bracket (found when array index)
//  - followed by an optional left bracket or dot (type of subscript)
//
// Note: These portions can be read in a non-overlapping fashion and
// allow straightforward parsing of the hierarchy that WebGL encodes
// in the uniform names.

function addUniform(container, uniformObject) {
	container.seq.push(uniformObject);
	container.map[uniformObject.id] = uniformObject;
}

// https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getActiveUniform
function parseUniform(gl, activeInfo, location, container) {
	const path = activeInfo.name,
		pathLength = path.length;

	// reset RegExp object, because of the early exit of a previous run
	RePathPart.lastIndex = 0;

	while (true) {
		const match = RePathPart.exec(path),
			matchEnd = RePathPart.lastIndex;

		let id = match[1];
		const idIsIndex = match[2] === ']',
			subscript = match[3];

		if (idIsIndex) id = id | 0; // convert to integer

		if (subscript === undefined || subscript === '[' && matchEnd + 2 === pathLength) {
			// bare name or "pure" bottom-level array "[0]" suffix
			addUniform(container, subscript === undefined ?
				new SingleUniform(gl, id, activeInfo, location) :
				new PureArrayUniform(gl, id, activeInfo, location));
			break;
		} else {
			// step into inner node / create it in case it doesn't exist
			const map = container.map;
			let next = map[id];
			if (next === undefined) {
				next = new StructuredUniform(id);
				addUniform(container, next);
			}
			container = next;
		}
	}
}

// Root Container

class WebGLUniforms extends UniformContainer {

	constructor(gl, program) {
		super();

		const n = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

		for (let i = 0; i < n; ++i) {
			const info = gl.getActiveUniform(program, i),
				addr = gl.getUniformLocation(program, info.name);

			parseUniform(gl, info, addr, this);
		}
	}

	set(name, value, textures) {
		const u = this.map[name];
		if (u !== undefined) u.set(value, textures);
	}

	has(name) {
		return !!this.map[name];
	}

}

export { WebGLUniforms };