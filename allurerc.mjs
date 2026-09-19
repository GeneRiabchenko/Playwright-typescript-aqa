import { defineConfig } from "allure";

export default defineConfig({
  name: "Playwright AQA Report",
  output: "./allure-report",
  historyPath: "./history.jsonl",
  plugins: {
    awesome: {
      options: {
        reportName: "Playwright AQA Report",
        reportLanguage: "en",
      },
    },
  },
});
