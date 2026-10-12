const lintStagedConfig = {
  "*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,mdx,css,scss,yml,yaml}": "prettier --write",
};

export default lintStagedConfig;
