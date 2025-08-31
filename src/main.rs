mod parser;
mod types;

#[cfg(feature = "load_bytes")]
mod load;

#[cfg(feature = "remove_manifest")]
mod remove;

pub mod redist;
pub mod shared;

use parser::*;
use types::*;

fn main() {
  #[cfg(feature = "load_bytes")]
  load::run();

  #[cfg(feature = "remove_manifest")]
  remove::remove_manifest();

  parser();
}
