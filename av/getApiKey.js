const { launch } = require("puppeteer");
const { writeFileSync } = require("node:fs");

const delay = (ms) => new Promise((r) => setTimeout(() => r(), ms));

(async () => {
  let ready = false;

  while (!ready) {
    console.log("Pinging");

    const sg = new AbortController();

    try {
      await fetch("http://localhost:8000", {
        method: "GET",
        signal: sg.signal,
      }).then((ok) => {
        if (ok.ok) {
          ready = true;
        }
      });
    } catch (_) {}

    await delay(5 * 1000);

    sg.abort();
  }

  const browser = await launch({
    headless: process.env["GUI"] != "true",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const tab = await browser.newPage();

  await tab.goto("http://localhost:8000/login/?next=/api_docs");

  await tab.waitForNetworkIdle();

  await delay(2000);

  const username = await tab.waitForSelector(
    "body > div.wrapper > div.content-wrapper > div.container-fluid > div > div > div > div > div > div > div.card > div > form > div:nth-child(2) > input"
  );
  username.click();

  await delay(2000);

  username.type("mobsf", { delay: 100 });

  await delay(2000);

  const pwd = await tab.waitForSelector(
    "body > div.wrapper > div.content-wrapper > div.container-fluid > div > div > div > div > div > div > div.card > div > form > div:nth-child(3) > input"
  );
  pwd.click();

  await delay(2000);

  pwd.type("mobsf", { delay: 100 });

  await tab.waitForNetworkIdle();

  (
    await tab.waitForSelector(
      "body > div.wrapper > div.content-wrapper > div.container-fluid > div > div > div > div > div > div > div.card > div > form > div.col-12 > button"
    )
  ).click();

  await delay(1000);

  const val = await tab.waitForSelector(
    "body > div.wrapper > div.content-wrapper > div.container-fluid > div > div > div > div > p.lead > strong > code"
  );

  await tab.waitForNetworkIdle();

  await delay(2000);

  const token = await val.evaluate((handle) => handle.innerHTML);

  console.log(token);

  writeFileSync("./token", token);

  await tab.close();
  await browser.close();
})();
