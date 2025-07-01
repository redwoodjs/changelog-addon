# RedwoodSDK Changelog Addon

This add-on grabs the releases from a GitHub repository and displays them in a web page. This allows you to have a published changelog on your website. 

## Architecture

GitHub releases are written in Markdown. This requires some dependencies in order to convert Markdown into HTML. These are fetched from GitHub, converted to HTML, and cached for 30 minutes in KV namespace.

Tailwind is used for styling. Each section is broken up into a discrete component. If you wish to change the style, change the component. 

## How to add to your project

These instructions assume you are starting with a new RedwoodSDK project, for example from `npx create-rwsdk -t minimal my-project-name`.

### 0. Decide whether to add this manually or via AI

To use your editor's AI agent support to add this addon for you (e.g. Cursor, VSCode Copilot):
1. Make sure your project dir is open in your editor. You can create a new project with: `npx create-rwsdk -t minimal my-project-name`
2. Open a new AI chat window for your project
3. Make sure you are in `Agent` mode
4. Send the following chat prompt in the chat window - it will do the rest for you!

```
Please apply this addon to my RedwoodSDK project using these instructions: https://raw.githubusercontent.com/redwoodjs/changelog-addon/refs/heads/main/README.md
```

Alternatively, to apply this addon manually, simply follow the steps below.

### 1. Download this addon

```
npx degit redwoodjs/changelog-addon _tmp_passkey_addon
```

### 2. Copy files

Copy the `src/changelog` directory into your project's `addon` directory. This will add the following directories:

- `src/addon/changelog`: Functionality.


### 3. Install TailwindCSS

Follow the [RedwoodSDK installation guide for Tailwind CSS]https://docs.rwsdk.com/guides/frontend/tailwind/)


### 4. Update `package.json`

Add the following dependencies to your `package.json` file:

```json
"dependencies": {
  "marked": "^15.0.8",
  "marked-highlight": "^2.2.1",
  "highlight.js": "^11.11.1"
}
```

Then run `pnpm install`.

### 5. Install Tailwind CSS

Follow the 

### 6. Update `wrangler.jsonc`

Run the wrangler command to create a new KV namespace:

```bash
npx wrangler kv namespace create KV_CHANGELOG_ADDON
```

This will automatically update your `wrangler.jsonc` file, you must
also add the `CHANGELOG_ADDON_REPO` env-var.

```jsonc
{
  // ... existing configuration ...

  "kv_namespaces": [
    {
      "binding": "KV_CHANGELOG_ADDON",
      "id": "<BINDING_ID>"
    }
  ],
  // Environment variables
  "vars": {
    "CHANGELOG_ADDON_REPO": "redwoodjs/sdk"
  },
}
```

### 7. Update `src/worker.tsx`

Modify `src/worker.tsx` to integrate the passkey authentication and routes.

```typescript
// ...

import  { changelogRoutes } from '@/app/addons/changelog/routes'

export default defineApp([
  // ...
  render(Document, [
    // ...
    prefix('/changelog/', changelogRoutes)
  ]),
]);
```

### 8. Run the dev server

Now you can run the dev server:

```shell
pnpm dev
```

You should now be able to access "/changelog" in your browser to view the releases associated to your Github repository.