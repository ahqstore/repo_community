use std::sync::LazyLock;

use reqwest::{blocking::{Client, ClientBuilder}, header::HeaderMap};
use serde::Deserialize;

#[derive(Deserialize)]
struct Org {
  login: String,
}

pub static CLIENT: LazyLock<Client> = LazyLock::new(|| {
  ClientBuilder::new()
    .user_agent("AHQ Store")
    .default_headers({
      let mut h = HeaderMap::new();

      if let Some(x) = option_env!("GH_TOKEN") {
        h.insert("Authorization", format!("Bearer {}", x).parse().unwrap());
      }

      h
    })
    .build()
    .unwrap()
});

pub fn has_org_members(org: &str, user: &str) -> bool {
  let calc: Option<bool> = (|| {
    let authors = CLIENT
      .get(format!("https://api.github.com/orgs/{org}/public_members"))
      .send()
      .ok()?
      .json::<Vec<Org>>()
      .ok()?;

    Some(
      authors
        .iter()
        .find(|author| &author.login == user)
        .is_some(),
    )
  })();

  calc.unwrap_or(false)
}
