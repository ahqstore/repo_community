# AHQ Store Win32 Repository

A part of the **AHQ Store _NEO_** project

# This Repo

Contribute your powerful programs in our registry and index. Supports **Windows x86_64, arm64**, **Linux x86_64, arm64** and **Android x86_64, x86, armv7, arm64**

# Commands

> Last Updated: 30-Aug-2024

- `/account create <link>`

  - Creates an account
  - `<link>` Link to a file with the [schema](#account-schema)

- `/account mutate <link>`

  - Update your account
  - `<link>` Link to a file with the [schema](#account-schema)

- `/account remove confirm`

  - Removes your account

- `/store set <link>`

  - Adds/Updates an app to the store
  - `<link>` Link to a file with the [schema ↗](https://docs.rs/ahqstore-types/latest/ahqstore_types/app/struct.AHQStoreApplication.html)

- `/store remove <id>`
  - Removes an app from the store
  - `<id>` Your (custom set, permanent) App Id

# Account Schema

### File Format: json

### Schema:

```json
{
  "name": "string"
}
```

# Privacy Policy

This is the repo that stores AHQ Store apps and user data. Note that all the information provided is publically available and accessible to all and can be deleted as well. Refer to our Privacy Policy for details:

- [**Information we collect**](https://ahqstore.github.io/privacy/index.html#information-we-collect)
- [**Usage of this Information**](https://ahqstore.github.io/privacy/index.html#how-we-use-information)
- [**Information Disclosure**](https://ahqstore.github.io/privacy/index.html#information-disclosure)
