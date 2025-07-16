# @naverpay/eslint-plugin-use-client

> ESLint plugin that automatically detects when React Server Components need the `'use client'` directive

This ESLint plugin provides rules to determine if a React Server Component needs the `'use client'` directive based on the usage of client-side features like React hooks, browser APIs, and event handlers.

## Features

- 🔍 **Automatic Detection**: Detects when client-side features are used in React components
- 🔧 **Auto-fix**: Automatically adds `'use client'` directive when needed
- 🎯 **Three Rule Types**: Covers React hooks, browser APIs, and event handlers
- ⚙️ **Configurable**: Supports ignore paths for specific files or patterns
- 🎛️ **API Filtering**: Exclude specific browser APIs from detection (browser-api rule)
- 🚀 **Next.js Ready**: Perfect for Next.js 13+ App Router with React Server Components

## Installation

```bash
npm install @naverpay/eslint-plugin-use-client --save-dev
# or
yarn add @naverpay/eslint-plugin-use-client --dev
# or
pnpm add @naverpay/eslint-plugin-use-client --save-dev
```

## Usage

### ESLint Config (Flat Config)

```javascript
// eslint.config.js
import useClientPlugin from '@naverpay/eslint-plugin-use-client'

export default [
  {
    plugins: {
      'use-client': useClientPlugin
    },
    rules: {
      'use-client/use-client-hook': 'error',
      'use-client/browser-api': 'error',
      'use-client/event-handler': 'error'
    }
  }
]
```

### Legacy ESLint Config

```json
{
  "plugins": ["@naverpay/eslint-plugin-use-client"],
  "rules": {
    "@naverpay/use-client/use-client-hook": "error",
    "@naverpay/use-client/browser-api": "error",
    "@naverpay/use-client/event-handler": "error"
  }
}
```

## Rules

### `use-client-hook`

Detects when React hooks are used in components and requires `'use client'` directive.

#### ❌ Incorrect

```tsx
import { useState } from 'react'

function MyComponent() {
  const [count, setCount] = useState(0) // Error: React hook detected
  
  return <div>{count}</div>
}
```

#### ✅ Correct

```tsx
'use client'

import { useState } from 'react'

function MyComponent() {
  const [count, setCount] = useState(0)
  
  return <div>{count}</div>
}
```

### `browser-api`

Detects when browser APIs (like `window`, `document`, `localStorage`, etc.) are used and requires `'use client'` directive.

#### ❌ Incorrect

```tsx
function MyComponent() {
  const handleClick = () => {
    window.alert('Hello') // Error: Browser API detected
  }
  
  return <button onClick={handleClick}>Click me</button>
}
```

#### ✅ Correct

```tsx
'use client'

function MyComponent() {
  const handleClick = () => {
    window.alert('Hello')
  }
  
  return <button onClick={handleClick}>Click me</button>
}
```

### `event-handler`

Detects when HTML elements have event handlers (onClick, onChange, etc.) and requires `'use client'` directive.

#### ❌ Incorrect

```tsx
function MyComponent() {
  return (
    <button onClick={() => console.log('clicked')}> {/* Error: Event handler detected */}
      Click me
    </button>
  )
}
```

#### ✅ Correct

```tsx
'use client'

function MyComponent() {
  return (
    <button onClick={() => console.log('clicked')}>
      Click me
    </button>
  )
}
```

## Configuration

Each rule supports configuration options to customize its behavior:

### `ignorePath` Option

Exclude specific files or patterns from being checked:

```javascript
{
  rules: {
    'use-client/use-client-hook': ['error', {
      ignorePath: [
        'src/components/server/**',
        '**/*.server.tsx'
      ]
    }],
    'use-client/browser-api': ['error', {
      ignorePath: 'src/lib/**'
    }],
    'use-client/event-handler': ['error', {
      ignorePath: [
        'src/pages/**',
        'src/app/**/page.tsx'
      ]
    }]
  }
}
```

### `ignoreApis` Option (browser-api rule only)

Exclude specific API names from being detected by the `browser-api` rule:

```javascript
{
  rules: {
    'use-client/browser-api': ['error', {
      ignoreApis: [
        'console',
        'fetch',
        'setTimeout'
      ]
    }]
  }
}
```

This is useful when you want to allow certain browser APIs in server components. For example:

```tsx
// This won't trigger the rule if 'console' is in ignoreApis
function ServerComponent() {
  console.log('This is allowed') // No error
  
  return <div>Server Component</div>
}
```

You can also specify a single API name as a string:

```javascript
{
  rules: {
    'use-client/browser-api': ['error', {
      ignoreApis: 'console'
    }]
  }
}
```

## Supported React Hooks

The plugin detects all React hooks including:

- Built-in hooks: `useState`, `useEffect`, `useContext`, etc.
- Custom hooks: any function starting with `use` followed by a capital letter
- React namespace hooks: `React.useState`, `React.useEffect`, etc.

## Why Use This Plugin?

When working with Next.js 13+ App Router and React Server Components, it's crucial to properly mark components that use client-side features with the `'use client'` directive. This plugin helps by:

1. **Preventing Runtime Errors**: Automatically catches when client-side code is used in server components
2. **Improving Developer Experience**: No need to manually remember when to add `'use client'`
3. **Maintaining Performance**: Ensures only necessary components are marked as client components
4. **Code Consistency**: Enforces consistent usage of `'use client'` across your codebase

## License

MIT © [NaverPayDev](https://github.com/NaverPayDev/hidash/blob/main/LICENSE)