import { readFileSync, writeFileSync } from "node:fs";

// Define the file path and API details
const fileHash = readFileSync("./hash").toString().trim();
const url = "http://localhost:8000/api/v1/scan";
const urlScorecard = "http://localhost:8000/api/v1/scorecard";
const urlReport = "http://localhost:8000/api/v1/report_json";

const authorizationToken = readFileSync("./token").toString().trim();

console.log(`Using token: \`${authorizationToken}\``);

async function scanFile() {
  try {
    const response = await fetch(url, {
      method: "POST",
      body: `hash=${fileHash}`,
      headers: {
        "Authorization": authorizationToken,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    // Handle the response
    if (response.ok) {
      const data = await response.json();
      console.log("Scan request successful! 🎉");
      console.log(data);

      const scorecard = await fetch(urlScorecard, {
        method: "POST",
        body: `hash=${fileHash}`,
        headers: {
          "Authorization": authorizationToken,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }).then((r) => r.json());

      const report = await fetch(urlReport, {
        method: "POST",
        body: `hash=${fileHash}`,
        headers: {
          "Authorization": authorizationToken,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }).then((r) => r.json());

      writeFileSync(
        "./android-alldata.json",
        JSON.stringify({ data, scorecard, report }, null, 2)
      );
      writeFileSync(
        "./android-appsec.json",
        JSON.stringify(data.appsec, null, 2)
      );
    } else {
      console.error(`Scan failed with status: ${response.status}`);
      const errorText = await response.text();
      console.error("Error:", errorText);
      process.exit(1);
    }
  } catch (error) {
    console.error("An error occurred during the file upload:", error);
  }
}

// Run the function
scanFile();
