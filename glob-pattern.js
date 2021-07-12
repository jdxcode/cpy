'use strict';
const glob = require('globby');
const junk = require('junk');
const path = require('path');
const fs = require('fs');

class GlobPattern {
	/**
	 * @param {string} pattern
	 * @param {string} destination
	 * @param {import('.').Options} options
	 */
	constructor(pattern, destination, options) {
		this.path = pattern;
		this.originalPath = pattern;
		this.destination = destination;
		this.options = options;

		if (
			!glob.hasMagic(pattern) &&
			fs.existsSync(pattern) &&
			fs.lstatSync(pattern).isDirectory()
		) {
			this.path = [pattern, '**'].join('/');
		}
	}

	get name() {
		return path.basename(this.originalPath);
	}

	get normalizedPath() {
		const segments = this.originalPath.split('/');
		const magicIndex = segments.findIndex(item => item ? glob.hasMagic(item) : false);
		const normalized = segments.slice(0, magicIndex).join('/');

		if (normalized) {
			return path.isAbsolute(normalized) ? normalized : path.join(this.options.cwd, normalized);
		}

		return this.destination;
	}

	hasMagic() {
		return glob.hasMagic(this.options.flat ? this.path : this.originalPath);
	}

	getMatches() {
		let matches = glob.sync(this.path, {
			...this.options,
			dot: true,
			absolute: true,
			onlyFiles: true
		});

		if (this.options.ignoreJunk) {
			matches = matches.filter(file => junk.not(path.basename(file)));
		}

		return matches;
	}
}

module.exports = GlobPattern;
