const NodeClam = require("clamscan");
const fs = require("fs");
const { join } = require("path");

(async () => {
  const av = await new NodeClam().init({
    removeInfected: false, // If true, removes infected files
    quarantineInfected: false, // False: Don't quarantine, Path: Moves files to this place.
    scanLog: undefined, // Path to a writeable log file to write scan results into
    debugMode: false, // Whether or not to log info/debug/error msgs to the console
    fileList: undefined, // path to file containing list of files to scan (for scanFiles method)
    scanRecursively: true, // If true, deep scan folders recursively
    clamscan: {
      path: "/usr/bin/clamscan", // Path to clamscan binary on your server
      db: undefined, // Path to a custom virus definition database
      scanArchives: true, // If true, scan archives (ex. zip, rar, tar, dmg, iso, etc...)
      active: true, // If true, this module will consider using the clamscan binary
    },
    clamdscan: {
      socket: false, // Socket file for connecting via TCP
      host: "localhost", // IP of host to connect to TCP interface
      port: 3310, // Port of host to use when connecting via TCP interface
      timeout: 60000, // Timeout for scanning files
      localFallback: true, // Use local preferred binary to scan if socket/tcp fails
      path: "/usr/bin/clamdscan", // Path to the clamdscan binary on your server
      configFile: undefined, // Specify config file if it's in an unusual place
      multiscan: true, // Scan using all available cores! Yay!
      reloadDb: true, // If true, will re-load the DB on every call (slow)
      active: true, // If true, this module will consider using the clamdscan binary
      bypassTest: false, // Check to see if socket is available when applicable
      tls: false, // Use plaintext TCP to connect to clamd
    },
    preference: "clamscan", // If clamdscan is found and active, it will be used by default
  });

  const { badFiles, goodFiles, viruses } = await av.scanDir(
    join(__dirname, "..", "samples")
  );

  const isInfected = badFiles.length > 0;

  console.log(isInfected, badFiles, goodFiles, viruses);

  fs.writeFileSync(
    "./report.json",
    JSON.stringify(
      {
        isInfected,
        badFiles,
        goodFiles,
        viruses,
      },
      null,
      2
    )
  );
})();
