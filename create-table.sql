CREATE TABLE reports (
    id INTEGER PRIMARY KEY,
    runId INTEGER,
    name CHAR(200),
    mode CHAR(200),
    firstContentfulPaint FLOAT,
    firstContentfulPaintDisplayValue CHAR(200),
    largestContentfulPaint FLOAT,
    largestContentfulPaintDisplayValue CHAR(200),
    cumulativeLayoutShift FLOAT,
    cumulativeLayoutShiftDisplayValue CHAR(200),
    loadFastEnoughForPwa FLOAT,
    loadFastEnoughForPwaDisplayValue CHAR(200),
    speedIndex FLOAT,
    speedIndexDisplayValue CHAR(200),
    interactive FLOAT,
    interactiveDisplayValue CHAR(200),
    jsonFile CHAR(200)
); 