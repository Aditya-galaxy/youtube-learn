// Preloaded with `tsx --require` so env is populated before any ES module is
// evaluated. Calling dotenv from inside a script runs after ESM has already
// hoisted and executed the imports, and node's --env-file-if-exists needs
// Node >= 22.9, above this project's engines floor.
const { config } = require("dotenv");
config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });
