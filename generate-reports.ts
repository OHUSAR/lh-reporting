const fs = require("fs");
const lighthouse = require("lighthouse");
const chromeLauncher = require("chrome-launcher");

const openDb = require("./db.ts");

(async () => {
  const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless"] });
  const options = {
    logLevel: "info",
    output: "json",
    onlyCategories: ["performance"],
    port: chrome.port,
    throttling: {
      // // The round trip time in milliseconds
      rttMs: 50,
      // // The network throughput in kilobytes per second
      throughputKbps: 3840,
      // // // devtools settings
      // // // // The network request latency in milliseconds
      // // // requestLatencyMs?: number;
      // // // // The network download throughput in kilobytes per second
      downloadThroughputKbps: 3840,
      // // The network upload throughput in kilobytes per second
      uploadThroughputKbps: 3840,
      // uploadThroughputKbps?: number;
      // // used by both
      // // The amount of slowdown applied to the cpu (1/<cpuSlowdownMultiplier>)
      cpuSlowdownMultiplier: 1,
    },
  };

  const pagesToTest = [
    { url: "https://www.modrastrecha.sk/", name: "homepage" },
    { url: "https://www.modrastrecha.sk/forum/", name: "forum" },
    { url: "https://www.modrastrecha.sk/blogs/", name: "blogs" },
    { url: "https://www.modrastrecha.sk/market/", name: "market" },
    { url: "https://www.modrastrecha.sk/catalog/", name: "catalog" },
    {
      url: "https://www.modrastrecha.sk/list-of-groups/",
      name: "list-of-groups",
    },
    {
      url: "https://www.modrastrecha.sk/blog/janamartish/",
      name: "blog-janamartish",
    },
  ];

  const timestamp = new Date().getTime();

  const modes = ["mobile", "desktop"];

  for (let modeI = 0; modeI < modes.length; modeI++) {
    for (let i = 0; i < pagesToTest.length; i++) {
      const url = pagesToTest[i].url;
      const name = pagesToTest[i].name;
      const filename = `${timestamp}-${name}-${modes[modeI]}.json`;

      const runnerResult = await lighthouse(url, {
        ...options,
        emulatedFormFactor: modes[modeI] === "desktop" ? "desktop" : undefined,
      });
      const reportJson = runnerResult.report;

      if (!fs.existsSync(`./reports/${timestamp}/`)) {
        fs.mkdirSync(`./reports/${timestamp}/`);
      }
      fs.writeFileSync(`./reports/${timestamp}/${filename}`, reportJson);

      const db = await openDb();
      const resultObj = JSON.parse(runnerResult.report);

      await db.run(
        `INSERT INTO reports (
            runId,
            name,
            mode,
            firstContentfulPaint,
            firstContentfulPaintDisplayValue,
            largestContentfulPaint,
            largestContentfulPaintDisplayValue,
            cumulativeLayoutShift,
            cumulativeLayoutShiftDisplayValue,
            loadFastEnoughForPwa,
            loadFastEnoughForPwaDisplayValue,
            speedIndex,
            speedIndexDisplayValue,
            interactive,
            interactiveDisplayValue,
            jsonFile
        ) VALUES (
            :runId,
            :name,
            :mode,
            :firstContentfulPaint,
            :firstContentfulPaintDisplayValue,
            :largestContentfulPaint,
            :largestContentfulPaintDisplayValue,
            :cumulativeLayoutShift,
            :cumulativeLayoutShiftDisplayValue,
            :loadFastEnoughForPwa,
            :loadFastEnoughForPwaDisplayValue,
            :speedIndex,
            :speedIndexDisplayValue,
            :interactive,
            :interactiveDisplayValue,
            :jsonFile
        );`,
        {
          ":runId": timestamp,
          ":name": name,
          ":mode": modes[modeI],
          ":firstContentfulPaint":
            resultObj["audits"]["first-contentful-paint"]["score"],
          ":firstContentfulPaintDisplayValue":
            resultObj["audits"]["first-contentful-paint"]["displayValue"],
          ":largestContentfulPaint":
            resultObj["audits"]["largest-contentful-paint"]["score"],
          ":largestContentfulPaintDisplayValue":
            resultObj["audits"]["largest-contentful-paint"]["displayValue"],
          ":cumulativeLayoutShift":
            resultObj["audits"]["cumulative-layout-shift"]["score"],
          ":cumulativeLayoutShiftDisplayValue":
            resultObj["audits"]["cumulative-layout-shift"]["displayValue"],
          ":loadFastEnoughForPwa":
            (resultObj["audits"]["load-fast-enough-for-pwa"] &&
              resultObj["audits"]["load-fast-enough-for-pwa"]["score"]) ||
            "",
          ":loadFastEnoughForPwaDisplayValue":
            (resultObj["audits"]["load-fast-enough-for-pwa"] &&
              resultObj["audits"]["load-fast-enough-for-pwa"][
                "displayValue"
              ]) ||
            "",
          ":speedIndex": resultObj["audits"]["speed-index"]["score"],
          ":speedIndexDisplayValue":
            resultObj["audits"]["speed-index"]["displayValue"],
          ":interactive": resultObj["audits"]["interactive"]["score"],
          ":interactiveDisplayValue":
            resultObj["audits"]["interactive"]["displayValue"],
          ":jsonFile": filename,
        }
      );
    }
  }

  await chrome.kill();
})();
