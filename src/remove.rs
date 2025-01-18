use std::fs;

use crate::{shared::has_org_members, Data};

pub fn remove_manifest() {
  let val = fs::read_to_string("./bytes.txt").unwrap();

  if !fs::metadata(&val).unwrap().is_file() {
    panic!("Expected File!");
  }

  let app = Data::from_bytes(&fs::read_to_string(&val).expect("Unable to read file, impossible technically")).0;

  let gh = env!("GH_USER_USERNAME");

  if &app.repo.author != gh && !has_org_members(&app.repo.author, gh) {
    panic!("You are neither the author nor a public member of this organization... Cannot continue");
  }

  fs::remove_file(val).unwrap();
  println!("Successful");
}
