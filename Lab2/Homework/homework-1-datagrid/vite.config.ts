
import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
    resolve: {
        alias: {
            "@mini-react": fileURLToPath(
                new URL("./src/mini-react", import.meta.url)
            ),
        },
    },
    oxc: {
        jsx: {
            runtime: "automatic",
            importSource: "@mini-react",
        },
    },
});
