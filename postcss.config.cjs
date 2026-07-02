// Autoprefixer only — targets come from the "browserslist" field in
// package.json. Minification is handled by Sass (--style=compressed).
module.exports = {
  plugins: [require("autoprefixer")],
};
