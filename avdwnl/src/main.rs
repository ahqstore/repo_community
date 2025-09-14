use std::fs::{create_dir_all, write};

use ahqstore_types::{AHQStoreApplication, InstallerFormat};
use reqwest::{ClientBuilder, header::{AUTHORIZATION, HeaderMap, HeaderValue}};

macro_rules! dwnl {
  ($c:ident, $f:ident, $os:ident, $cntr: ident) => {
    {
      $cntr += 1;
      
      let asset = $f.install.$os.as_ref().unwrap().assetId;

      let url = $f.downloadUrls.get(&asset);

      if let Some(url) = url {
        let bytes = $c.get(&url.url)
          .send()
          .await
          .unwrap()
          .bytes()
          .await
          .unwrap();

        let ext = match url.installerType {
          InstallerFormat::AndroidApkZip => ".apk",
          InstallerFormat::LinuxAppImage => ".AppImage",
          InstallerFormat::WindowsInstallerExe => ".exe",
          InstallerFormat::WindowsInstallerMsi => ".msi",
          InstallerFormat::WindowsUWPMsix => ".msix",
          InstallerFormat::WindowsZip => ".zip"
        };

        let fle = format!("{}{ext}", $cntr);

        write(format!("./samples/{fle}"), bytes).unwrap();
      }
    }
  };
}

#[tokio::main(flavor = "current_thread")]
async fn main() {
  let url = option_env!("DWNL_URL").unwrap_or("");

  let mut headers = HeaderMap::new();
  let mut auth_value = HeaderValue::from_static(option_env!("GITHUB_TOKEN").unwrap_or(""));
  auth_value.set_sensitive(true);
  headers.insert(AUTHORIZATION, auth_value);

  let client = ClientBuilder::new()
    .user_agent("AHQ Store / Downloader")
    .default_headers(headers)
    .build()
    .unwrap();

  let file = client.get(url)
    .send()
    .await
    .unwrap()
    .json::<AHQStoreApplication>()
    .await
    .unwrap();

  if &file.authorId == "1" {
    panic!("Sorry, but if you're the author you can just directly commit to the repo");
  }

  let (file,_) = file.export();
  let file: AHQStoreApplication = serde_json::from_str(&file).unwrap();
  
  create_dir_all("./samples").unwrap();

  let mut counter = 0;

  // Windows
  dwnl!(client, file, win32, counter);
  dwnl!(client, file, winarm, counter);

  // Android
  dwnl!(client, file, android, counter);

  // Linux
  dwnl!(client, file, linux, counter);
  dwnl!(client, file, linuxArm64, counter);

  println!("Downloads complete!");
}

