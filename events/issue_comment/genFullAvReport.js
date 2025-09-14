//@ts-check

const { readFileSync } = require("fs");
const { join } = require("path");

/**
 * Handle
 * @param {import("@octokit/rest").Octokit} github
 * @param {{ payload: { comment: { number: number, id: number, body: string, user: { login: string } }, issue: { number: number, id: number, labels: {name: string}[] } }}} ctx
 */
module.exports = async (github, ctx) => {
  const owner = "ahqstore";
  const repo = "repo_community";

  const win32 = JSON.parse(
    readFileSync(join(__dirname, "../../reports/win32/report.json")).toString()
  );

  const linux = JSON.parse(
    readFileSync(join(__dirname, "../../reports/linux/report.json")).toString()
  );

  let android = null;

  try {
    android = JSON.parse(
      readFileSync(
        join(__dirname, "../../reports/android/android-appsec.json")
      ).toString()
    );
  } catch (e) {
    console.log(e);
  }

  let infected = false;

  if (win32.isInfected || linux.isInfected) {
    infected = true;
  }

  if (android && (android.high.length > 0 || android.security_score <= 85)) {
    infected = true;
  }

  const { id } = (
    await github.rest.issues.createComment({
      issue_number: ctx.payload.issue.id,
      owner,
      repo,
      body: JSON.stringify({ win32, linux, android }, null, 4),
    })
  ).data;

  await github.rest.issues.updateComment({
    owner,
    repo,
    comment_id: id,
    body: infected
      ? "⚠️ Probable malware detected. We cannot proceed. This can happen for two reasons.\n\n1. The Application is malware of contains malicious code.\n2. The Android analysis score has been less than `85` (the threshold) or there's at least 1 high severity vulnerability.\n3. This is a false positive (highly unlikely; though we still can't procceed if that's the case)\n\n> You might want to contact us at our discord server: https://discord.gg/sxgr5dh2fz\n\n\n_This might be automatically associated into an account suspension strike in the future_"
      : "✅ Malware check has completed. Running general procedure",
  });

  if (infected) {
    throw new Error("Cannot continue. Malware detected");
  }
};
