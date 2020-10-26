const fs = require("fs");
const openDatabase = require("./db.ts");

(async () => {
  const db = await openDatabase();
  const result = await db.all(
    `
    SELECT 
      runId,
      name,
      firstContentfulPaint,
      firstContentfulPaintDisplayValue,
      largestContentfulPaint,
      largestContentfulPaintDisplayValue,
      firstMeaningfulPaint,
      firstMeaningfulPaintDisplayValue,
      loadFastEnoughForPwa,
      loadFastEnoughForPwaDisplayValue,
      speedIndex,
      speedIndexDisplayValue,
      interactive,
      interactiveDisplayValue,
      jsonFile
    FROM reports
    LIMIT 10000;
    `
  );

  fs.writeFileSync("./database.json", JSON.stringify(result));
})();
