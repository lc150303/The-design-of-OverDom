# typed-screeps-arena

Typings for the game Screeps:Arena based on the following docs https://steamcommunity.com/sharedfiles/filedetails/?id=2505541950

They are currently used primarly for https://github.com/screepers/screeps-arena-typescript-starter but the intention is for them to be usefull in general.

## Installation

Current installation instructions untill we have pushed a package to DT

- Add the following to your `packages.json`
- `"@types/screeps-arena": "screepers/typed-screeps-arena#develop",`
- do an `npm i` to make it fetch and build the repo from git.
- Update your `tsconfig.json` typeRoots so it loads the types from the dist folder
  Example: `"typeRoots": ["./node_modules/@types", "./@types", "./node_modules/@types/screeps-arena/dist"]`

This is all temporary untill we get a DefinatelyTyped package working properly.

Updating types

- delete `node_modules/@types/screeps-arena`
- run `npm i` to reinstall the packages
  You might need to delete `package-lock.json` to get the types.

## Future Installation

The type definitions are not yet published on [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped). ~~To install them, run the following.~~

```bash
# npm
npm install @types/screeps-arena --save-dev

# yarn
yarn add @types/screeps-arena
```

## How to push updates to `@types/screeps-arena` on DefinitelyTyped

- Fork DefinitelyTyped
- Partial clone DefinitelyTyped, the repo is huge.

  https://github.com/DefinitelyTyped/DefinitelyTyped#partial-clone

  ```
  git clone --sparse --filter=blob:none --depth=1 <forkedUrl>
  git sparse-checkout add types/screeps-arena
  ```

- create a branch named `screeps-arena-v[major].[minor].[patch]`
- copy the `*.d.ts` files as well as any tests into `types/screeps-arena`
- commit the update to your branch
- create a PR from your updated branch to master on DefinitelyTyped
- follow the feedback `typescript-bot` gives you.
