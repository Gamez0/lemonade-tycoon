const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
    testDir: "./tests/browser",
    timeout: 120000,
    expect: { timeout: 30000 },
    fullyParallel: true,
    workers: 1,
    use: { baseURL: "http://127.0.0.1:8081", viewport: { width: 1280, height: 1000 }, trace: "retain-on-failure" },
    webServer: {
        command: "node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 8081 --strictPort",
        url: "http://127.0.0.1:8081",
        reuseExistingServer: false,
    },
});
