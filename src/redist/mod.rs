use std::collections::HashMap;

use ahqstore_types::{AHQStoreApplication, AppRepo, DownloadUrl, InstallerFormat, InstallerOptions, InstallerOptionsLinux, InstallerOptionsWindows, WindowsInstallScope};
use serde::{Deserialize, Serialize};

use crate::shared::CLIENT;

#[derive(Debug, Serialize, Deserialize)]
pub struct GitHubRelease {
  pub tag_name: String,
  pub assets: Vec<Asset>
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Asset {
  pub name: String,
  pub browser_download_url: String
}

pub fn get_redistapps() -> Option<Vec<AHQStoreApplication>> {
  let mut data = vec![];

  data.push(get_vscodium()?);

  Some(data)
}

pub fn get_vscodium() -> Option<AHQStoreApplication> {
  let dat: GitHubRelease = CLIENT.get("https://api.github.com/repos/VSCodium/vscodium/releases/latest")
    .send()
    .ok()?
    .json()
    .ok()?;

  let iter = dat.assets.into_iter();

  let version = dat.tag_name;

  let mut win32_msi = None;
  let mut linux_appimage = None;
  let mut winarm_zip = None;

  for x in iter {
    if x.name.ends_with(".msi") && x.name.contains("x64") && !x.name.contains("disabled") {
      win32_msi = Some(x.browser_download_url);
    } else if x.name.ends_with("x86_64.AppImage") {
      linux_appimage = Some(x.browser_download_url);
    } else if x.name.ends_with(".zip") && x.name.contains("win32") && x.name.contains("arm64") {
      winarm_zip = Some(x.browser_download_url);
    }
  }

  let win32_msi = win32_msi?;
  let linux_appimage = linux_appimage?;
  let winarm_zip = winarm_zip?;

  let mut dwnl = HashMap::new();

  dwnl.insert(0, DownloadUrl {
    asset: format!("null"),
    installerType: InstallerFormat::WindowsZip,
    url: winarm_zip
  });

  dwnl.insert(1, DownloadUrl {
    asset: format!("null"),
    installerType: InstallerFormat::WindowsInstallerMsi,
    url: win32_msi
  });

  dwnl.insert(3, DownloadUrl {
    asset: format!("null"),
    installerType: InstallerFormat::LinuxAppImage,
    url: linux_appimage
  });

  Some(
    AHQStoreApplication {
      appDisplayName: format!("VSCodium"),
      appId: format!("vscodium"),
      appShortcutName: format!("VSCodium"),
      authorId: format!("2"),
      releaseTagName: format!("latest"),
      description: format!(""),
      displayImages: vec![1],
      downloadUrls: dwnl,
      install: InstallerOptions {
        android: None,
        linuxArm64: None,
        linuxArm7: None,
        linux: Some(InstallerOptionsLinux {
          assetId: 3
        }),
        winarm: Some(InstallerOptionsWindows {
          assetId: 0,
          exec: Some(format!("VSCodium.exe")),
          installerArgs: None,
          scope: Some(WindowsInstallScope::Machine)
        }),
        win32: Some(InstallerOptionsWindows {
          assetId: 1,
          exec: None,
          installerArgs: None,
          scope: None
        }),
      },
      license_or_tos: Some("MIT".into()),
      repo: AppRepo {
        author: format!("VSCodium"),
        repo: format!("vscodium")
      },
      site: Some(format!("https://vscodium.com/")),
      source: Some(format!("https://vscodium.com")),
      verified: true,
      version,
      resources: Some(
        {
          let mut hashmap = HashMap::new();

          let bytes = CLIENT.get("https://avatars.githubusercontent.com/u/40338071?v=4")
            .send()
            //.ok()?
            .unwrap()
            .bytes()
            //.ok()?
            .unwrap()
            .to_vec();

          hashmap.insert(0, bytes);

          let bytes = CLIENT.get("https://vscodium.com/img/vscodium.png")
            .send()
            .unwrap()
            //.ok()?
            .bytes()
            .unwrap()
            //.ok()?
            .to_vec();

          hashmap.insert(1, bytes);

          hashmap
        }
      )
    }
  )
}