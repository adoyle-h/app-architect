import util from 'lodash';
import pkg from './package.json';

import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';

const external = util.chain({})
	.assign(pkg.dependencies)
	.assign(pkg.peerDependencies)
	.omit([
		// package names to no-external
		'regenerator-runtime',
	])
	.keys()
	.value();

export default {
	input: pkg['main.src'],
	plugins: [
		resolve(),
		commonjs(),
		babel(),
		globals(),
		builtins(),
	],
	// external: external,
	output: {
		name: pkg['browser.var'],
		file: pkg['browser.main'],
		format: pkg['browser.format'],
	//     globals: {
	//         lodash: '_',
	//         urijs: 'URI',
	//         redux: 'Redux',
	//         react: 'React',
	//         'react-redux': 'ReactRedux',
	//         dva: 'dva',
	//     },
	},
};
