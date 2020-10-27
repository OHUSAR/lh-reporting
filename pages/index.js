import { useState } from "react";
import Head from "next/head";
import ReportViewer from "react-lighthouse-viewer";
import {
  FaServer,
  FaArrowsAltV,
  FaSquareFull,
  FaHandPointer,
} from "react-icons/fa";
import { LineChart } from "react-chartkick";
import "chart.js";

import Modal from "react-modal";

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
  if (value > 0.9) {
    return [clsname, styles.good].join(" ");
  }
  return clsname;
};

const milisecondsToDate = (miliseconds) => {
  var epoch = new Date(1970, 0, 1);
  epoch.setMilliseconds(miliseconds);
  return epoch;
};

class Run {
  constructor(id, data) {
    this.id = id;
    this.data = data;
  }

  avg = (param, mode) => {
    console.log(param, mode);

    let sum = 0;

    let dataWithMode = this.data;
    if (mode) {
      dataWithMode = this.data.filter((run) => run.mode === mode);
    }

    dataWithMode.forEach((run) => {
      sum += run[param];
    });
    return Math.round((sum * 100) / dataWithMode.length);
  };

  rows = (mode) => {
    if (mode) {
      return this.data.filter((run) => run.mode === mode);
    }
    return this.data;
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
    .sort((a, b) => b[0] - a[0])
    .map(([key, run]) => new Run(key, run));
};

export default function Home() {
  const runs = transformDB(database);

  const [runIndex, setRunIndex] = useState(0);
  const [file, setFile] = useState();
  const [mode, setMode] = useState("desktop");

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
          <div className={styles.titleRow}>
            <h1 className={styles.h1}>
              Modrastrecha.sk LH report -{" "}
              {milisecondsToDate(runs[runIndex].id).toDateString()}{" "}
              {milisecondsToDate(runs[runIndex].id).toLocaleTimeString()}
            </h1>
            <select
              className={styles.select}
              value={mode}
              onChange={(event) => {
                setMode(event.target.value);
              }}
            >
              <option value="desktop" name="desktop">
                Desktop
              </option>
              <option value="mobile" name="mobile">
                Mobile
              </option>
              <option value={null} name={null}></option>
            </select>
            <select
              className={styles.select}
              value={runIndex}
              onChange={(event) => {
                setRunIndex(event.target.value);
              }}
            >
              {runs.map((run, index) => (
                <option value={index} name={index}>
                  {milisecondsToDate(run.id).toDateString()}{" "}
                  {milisecondsToDate(run.id).toLocaleTimeString()}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.widget}>
            <div className={styles.widgetTitle}>first Contentful Paint</div>
            <div className={styles.widgetValue}>
              {runs[runIndex].avg("firstContentfulPaint", mode)}%
            </div>
            <div className={styles.widgetImage}>
              <FaServer />
            </div>
            <div className={styles.widgeSubtext}></div>
            First Contentful Paint marks the time at which the first text or
            image is painted.
          </div>

          <div className={styles.widget}>
            <div className={styles.widgetTitle}>largest Contentful Paint</div>
            <div className={styles.widgetValue}>
              {runs[runIndex].avg("largestContentfulPaint", mode)}%
            </div>
            <div className={styles.widgetImage}>
              <FaSquareFull />
            </div>
            <div className={styles.widgeSubtext}></div>
            Largest Contentful Paint marks the time at which the largest text or
            image is painted.
          </div>

          <div className={styles.widget}>
            <div className={styles.widgetTitle}>Cumulative Layout Shift</div>
            <div className={styles.widgetValue}>
              {runs[runIndex].avg("cumulativeLayoutShift", mode)}%
            </div>
            <div className={styles.widgetImage}>
              <FaArrowsAltV />
            </div>
            <div className={styles.widgeSubtext}></div>
            Cumulative Layout Shift measures the movement of visible elements
            within the viewport.
          </div>

          <div className={styles.widget}>
            <div className={styles.widgetTitle}>time to interactive</div>
            <div className={styles.widgetValue}>
              {runs[runIndex].avg("interactive", mode)}%
            </div>
            <div className={styles.widgetImage}>
              <FaHandPointer />
            </div>
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
              <div className={styles.headingCell}>Cumulative Layout Shift</div>
              <div className={styles.headingCell}>Speed Index</div>
              <div className={styles.headingCell}>Time To Interactive</div>
            </div>
            {runs[runIndex].rows(mode).map((row) => (
              <div
                className={styles.row}
                key={`${row.name}-${row.runId}-${row.mode}`}
              >
                <div className={styles.rowCell}>
                  <button
                    className={styles.button}
                    onClick={async () => {
                      const data = await import(
                        `../reports/${row.runId}/${row.jsonFile}`
                      );
                      setFile(data);
                    }}
                  >
                    {row.name} ({row.mode})
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
                    row.cumulativeLayoutShift
                  )}
                >
                  {row.cumulativeLayoutShift} (
                  {row.cumulativeLayoutShiftDisplayValue})
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
          <div className={styles.stats}>
            <div className={styles.widget} style={{ height: "auto" }}>
              <div className={styles.widgetTitle}>first Contentful Paint</div>
              <LineChart
                min={0}
                max={100}
                data={runs.map((run) => [
                  milisecondsToDate(run.id),
                  run.avg("firstContentfulPaint", mode),
                ])}
              />
            </div>

            <div className={styles.widget} style={{ height: "auto" }}>
              <div className={styles.widgetTitle}>largest Contentful Paint</div>
              <LineChart
                min={0}
                max={100}
                data={runs.map((run) => [
                  milisecondsToDate(run.id),
                  run.avg("largestContentfulPaint", mode),
                ])}
              />
            </div>

            <div className={styles.widget} style={{ height: "auto" }}>
              <div className={styles.widgetTitle}>Cumulative Layout Shift</div>
              <LineChart
                min={0}
                max={100}
                data={runs.map((run) => [
                  milisecondsToDate(run.id),
                  run.avg("cumulativeLayoutShift", mode),
                ])}
              />
            </div>

            <div className={styles.widget} style={{ height: "auto" }}>
              <div className={styles.widgetTitle}>time to interactive</div>
              <LineChart
                min={0}
                max={100}
                data={runs.map((run) => [
                  milisecondsToDate(run.id),
                  run.avg("interactive", mode),
                ])}
              />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
