// rollup.config.js
// import nodeResolve from 'rollup-plugin-node-resolve';
import babel from "rollup-plugin-babel";

export default {
  entry: "index.js",
  dest: "build/startext.js",
  format: "umd",
  moduleName: "startext",
  globals: { 
    "d3": "d3"
  },
  external: ["webfontloader"],
  plugins: [
    /*
    nodeResolve({ 
      jsnext: true, 
      main: true}),
      */
      
    babel({
      exclude: "node_modules/**"})
  ]
};