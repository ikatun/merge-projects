#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const merge = require('package-merge');
const fsExtra = require('fs-extra');

const [ignore1, ignore2, sourceProject, destProject, ...options] = process.argv;

const justPackageJson = options.includes('--just-package-json');

if (!sourceProject || !destProject) {
	throw new Error('Usage: merge-projects <source> <destination> [--just-package-json]');
}

console.log('merging package.json...');
const sourceProjectPackageJson = fs.readFileSync(path.join(sourceProject, 'package.json'));
let destProjectPackageJson = fs.readFileSync(path.join(destProject, 'package.json'));
destProjectPackageJson = merge(sourceProjectPackageJson, destProjectPackageJson);
fs.writeFileSync(path.join(destProject, 'package.json'), destProjectPackageJson, { encoding: 'utf8' });
console.log('DONE\n');

if (justPackageJson) {
	process.exit(0);
}

function mergeFiles(srcDir, dstDir, fileName) {
	try {
		fs.writeFileSync(
			path.join(srcDir, fileName),
			fs.readFileSync(path.join(srcDir, fileName), { encoding: 'utf8' }) +
			fs.readFileSync(path.join(dstDir, fileName), { encoding: 'utf8' }),
			{ encoding: 'utf8' },
		);
	} catch {}
}
console.log('merging .env...');
mergeFiles(sourceProject, destProject, '.env');
console.log('DONE\n');
console.log('merging .gitignore');
mergeFiles(sourceProject, destProject, '.gitignore');
console.log('DONE\n');

console.log('merging directories...');
function filter(src, dst) {
	return !(
		src.includes('node_modules') ||
		src.endsWith('.env') ||
		src.endsWith('.git') ||
		src.endsWith('.gitignore') ||
		src.endsWith('package.json')
	);
}
fsExtra.copySync(sourceProject, destProject, { filter, overwrite: true });
console.log('ALL DONE!');
