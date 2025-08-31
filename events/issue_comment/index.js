//@ts-check

// @ts-ignore
const { exec } = require("child_process");

// @ts-ignore
const { writeFileSync, rmSync, existsSync, readFileSync } = require("fs");

// @ts-ignore
const { join } = require("path");

/**
 * Handle
 * @param {import("@octokit/rest").Octokit} github
 * @param {{ payload: { comment: { number: number, id: number, body: string, user: { login: string } }, issue: { number: number, id: number, labels: {name: string}[] } }}} ctx
 */
module.exports = async (github, ctx) => {
  const {
    // @ts-ignore
    default: { default: hash },
  } = await import("@ahqstore/gh_hash");

  console.log(ctx.payload.comment.user);

  const issue_number = ctx.payload.issue.number;

  const author_username = ctx.payload.comment.user.login.toLowerCase();

  const body = ctx.payload.comment.body;

  const [slash, cmd, link] = body.split(" ");

  const owner = "ahqstore";
  const repo = "apps";

  if (slash == "/store") {
    if (cmd == "set") {
      const req = await fetch(link).then((req) => req.text());
      const bytes = new TextEncoder().encode(req);

      writeFileSync("./bytes.txt", `${author_username}&[${bytes}]`);

      // @ts-ignore
      const workspace = join(__dirname, "../../");
      exec(
        "cargo run --features load_bytes",
        {
          cwd: workspace,
          env: {
            // @ts-ignore
            ...process.env,
            RUSTFLAGS: "-Awarnings",
          },
        },
        async (err, out, stderr) => {
          const body = `@${author_username}
# Console
\`\`\`
${out}
\`\`\`
# IO ERR
\`\`\`
${stderr}

--- ERR ---
${String(err) == String(stderr) ? "None" : err}
\`\`\``;

          console.log(body);

          await github.rest.issues.createComment({
            body,
            owner,
            repo,
            issue_number,
          });

          return out.includes("Successful");
        }
      );
    } else if (cmd == "remove") {
      let page;
      try {
        const author = JSON.parse(
          readFileSync(`./db/apps/${link}.json`).toString()
        ).repo.author;

        page = `./manifests/${author[0]}/${author}/${link}.json`;
      } catch (e) {
        return;
      }
      writeFileSync("./bytes.txt", page);

      // @ts-ignore
      const workspace = join(__dirname, "../../");
      exec(
        "cargo run --features remove_manifest",
        {
          cwd: workspace,
          env: {
            // @ts-ignore
            ...process.env,
            RUSTFLAGS: "-Awarnings",
            GH_USER_USERNAME: author_username,
          },
        },
        async (err, out, stderr) => {
          const body = `@${author_username}
# Console
\`\`\`
${out || "No Output"}
\`\`\`
# IO
\`\`\`
${err || "No Error"}
${stderr || "No StdErr Terminal"}
\`\`\``;

          console.log(body);

          await github.rest.issues.createComment({
            body,
            owner,
            repo,
            issue_number,
          });

          return out.includes("Successful");
        }
      );
    }
  } else if (slash == "/account") {
    if (cmd == "create" || cmd == "mutate") {
      const author_hashed_username = hash(author_username);

      const path = join(
        // @ts-ignore
        __dirname,
        `../../users/${author_hashed_username}.json`
      );

      if (existsSync(path) && cmd == "create") {
        await github.rest.issues.createComment({
          body: "User already exists, use /account mutate <path to acc file>",
          owner,
          repo,
          issue_number,
        });
        return;
      }

      const acc = await fetch(link).then((s) => s.json());

      writeFileSync(
        path,
        JSON.stringify(
          {
            name: acc.name,
            id: author_hashed_username,
            github: author_username,
            avatar_url: (() => {
              if (typeof acc.avatar_url != "string") {
                return null;
              } else if (!acc.avatar_url.startsWith("https://")) {
                return null;
              } else if (acc.avatar_url.length > 30) {
                return null;
              }

              return acc.avatar_url;
            })(),
            verified: false,
          },
          null,
          2
        )
      );
    } else if (cmd == "remove") {
      const author_hashed_username = hash(author_username);

      const manifestPath = `./manifests/${author_username[0]}/${author_username}`;

      if (existsSync(manifestPath)) {
        await github.rest.issues.createComment({
          body: "Please remove all your registered apps before you delete your account",
          owner,
          repo,
          issue_number,
        });
        return;
      }

      const path = join(
        // @ts-ignore
        __dirname,
        `../../users/${author_hashed_username}.json`
      );

      rmSync(path);
    }
  }
};
