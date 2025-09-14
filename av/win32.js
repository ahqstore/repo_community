const { spawn } = require("node:child_process");
const { resolve } = require("node:path");
const { readdirSync, writeFileSync } = require("node:fs");

const scanWindows = (file) => {
  const proc = spawn(`C:\\Program Files\\Windows Defender\\MpCmdRun.exe`, [
    "-Scan",
    "-ScanType",
    "3",
    "-File",
    file,
  ]);

  let output = "";

  proc.stdout.on("data", (resp) => {
    output += resp.toString();
  });

  return new Promise((res) => {
    proc.on("close", (code) => {
      res({ code, out: output });
    });
  });
};

async function scanWindowsDefender() {
  const files = readdirSync("./samples");

  /**
   * @type {{
   *  isInfected: boolean,
   *  goodFiles: string[],
   *  badFiles: string[],
   *  skipped: string[],
   *  viruses: string[],
   *  total: number
   * }}
   */
  const response = {
    isInfected: false,
    goodFiles: [],
    badFiles: [],
    skipped: [],
    viruses: [],
    total: files.length,
  };

  for (const index in files) {
    const file = files[index];

    console.log(`Scanning ${file}`);

    const out = await scanWindows(resolve(__dirname, "..", "samples", file));

    const output = out.out;

    if (output.includes("was skipped")) {
      response.skipped.push(file);
    } else if (output.includes("found no threats")) {
      response.goodFiles.push(file);
    } else {
      response.isInfected = true;
      response.badFiles.push(file);
      response.viruses.push(`${file}\n${output}`);
    }
  }

  return response;
}

scanWindowsDefender().then((report) => {
  console.log(report);
  writeFileSync("./report.json", JSON.stringify(report, null, 4));
});
