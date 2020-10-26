import { useEffect, useState } from "react";
import Head from "next/head";
import ReportViewer from "react-lighthouse-viewer";

import Modal from "react-modal";

// import reportJson from "/home/oh/Development/project/reporting/pages/reports/www.modrastrecha.sk.json";

import database from "../database.json";

import styles from "../styles/Home.module.css";

const customStyles = {
  content: {
    maxWidth: "80%",
    maxHeight: "80%",
    margin: "0 auto",
  },
};

// Make sure to bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement("#__next");

const appendByValue = (clsname, value) => {
  if (value < 0.3) {
    return [clsname, styles.bad].join(" ");
  }
  if (value < 0.7) {
    return [clsname, styles.moderate].join(" ");
  }
  return clsname;
};

class Run {
  constructor(id, data) {
    this.id = id;
    this.data = data;
  }

  avg = (param) => {
    let sum = 0;
    this.data.forEach((run) => {
      sum += run[param];
    });
    return Math.round((sum * 100) / this.data.length);
  };
}

const transformDB = (database) => {
  const result = new Map();

  database.forEach((row) => {
    if (!result.has(row.runId)) {
      result.set(row.runId, []);
    }
    const run = result.get(row.runId);
    run.push({ ...row });
  });

  return Array.from(result)
    .sort((a, b) => a[1] - b[1])
    .map(([key, run]) => new Run(key, run));
};

export default function Home() {
  const runs = transformDB(database);

  const [file, setFile] = useState();

  return (
    <>
      <Modal
        style={customStyles}
        isOpen={!!file}
        onRequestClose={() => setFile(null)}
        contentLabel="Report Detail"
      >
        {file ? <ReportViewer json={file} /> : null}
      </Modal>
      <div className={styles.container}>
        <Head>
          <title>Reports</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <main className={styles.main}>
          <h1 className={styles.h1}>4networks Lighthouse reporting</h1>
          <div className={styles.widget}>
            <div className={styles.widgetTitle}>first Contentful Paint</div>
            <div className={styles.widgetValue}>
              {runs[0].avg("firstContentfulPaint")}%
            </div>
            {/* <div className={styles.widgetImage}></div> */}
            <div className={styles.widgeSubtext}></div>
            First Contentful Paint marks the time at which the first text or
            image is painted.
          </div>

          <div className={styles.widget}>
            <div className={styles.widgetTitle}>largest Contentful Paint</div>
            <div className={styles.widgetValue}>
              {runs[0].avg("largestContentfulPaint")}%
            </div>
            {/* <div className={styles.widgetImage}></div> */}
            <div className={styles.widgeSubtext}></div>
            Largest Contentful Paint marks the time at which the largest text or
            image is painted.
          </div>

          <div className={styles.widget}>
            <div className={styles.widgetTitle}>first Meaningful Paint</div>
            <div className={styles.widgetValue}>
              {runs[0].avg("firstMeaningfulPaint")}%
            </div>
            {/* <div className={styles.widgetImage}></div> */}
            <div className={styles.widgeSubtext}></div>
            First Meaningful Paint measures when the primary content of a page
            is visible.
          </div>

          <div className={styles.widget}>
            <div className={styles.widgetTitle}>time to interactive</div>
            <div className={styles.widgetValue}>
              {runs[0].avg("interactive")}%
            </div>
            {/* <div className={styles.widgetImage}></div> */}
            <div className={styles.widgeSubtext}></div>
            Time to interactive is the amount of time it takes for the page to
            become fully interactive.
          </div>
          <h2 className={styles.h2}>Breakdown</h2>
          <div className={styles.table}>
            <div className={styles.headingRow}>
              <div className={styles.headingCell}>Page</div>
              <div className={styles.headingCell}>First Cont. P.</div>
              <div className={styles.headingCell}>Largest Cont. P.</div>
              <div className={styles.headingCell}>First Meaningful P.</div>
              <div className={styles.headingCell}>Speed Index</div>
              <div className={styles.headingCell}>Time To Interactive</div>
            </div>
            {runs[0].data.map((row) => (
              <div className={styles.row} key={`${row.name}-${row.runId}`}>
                <div className={styles.rowCell}>
                  <button
                    onClick={async () => {
                      const data = await import(
                        `../reports/${row.runId}/${row.jsonFile}`
                      );
                      setFile(data);
                    }}
                  >
                    {row.name}
                  </button>
                </div>
                <div
                  className={appendByValue(
                    styles.rowCell,
                    row.firstContentfulPaint
                  )}
                >
                  {row.firstContentfulPaint} (
                  {row.firstContentfulPaintDisplayValue})
                </div>
                <div
                  className={appendByValue(
                    styles.rowCell,
                    row.largestContentfulPaint
                  )}
                >
                  {row.largestContentfulPaint} (
                  {row.largestContentfulPaintDisplayValue})
                </div>
                <div
                  className={appendByValue(
                    styles.rowCell,
                    row.firstMeaningfulPaint
                  )}
                >
                  {row.firstMeaningfulPaint} (
                  {row.firstMeaningfulPaintDisplayValue})
                </div>
                <div className={appendByValue(styles.rowCell, row.speedIndex)}>
                  {row.speedIndex} ({row.speedIndexDisplayValue})
                </div>
                <div className={appendByValue(styles.rowCell, row.interactive)}>
                  {row.interactive} ({row.interactiveDisplayValue})
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>{" "}
    </>
  );
}
