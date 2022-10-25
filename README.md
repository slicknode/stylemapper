# Slicknode Stylemapper

[![npm version](https://badge.fury.io/js/@slicknode%2Fstylemapper.svg)](https://www.npmjs.com/package/@slicknode/stylemapper)
[![Build passing](https://github.com/slicknode/stylemapper/actions/workflows/main.yml/badge.svg?branch=main)](https://github.com/slicknode/stylemapper/actions/workflows/main.yml)
[![Test Coverage](https://badgen.net/codecov/c/github/slicknode/stylemapper)](https://app.codecov.io/github/slicknode/stylemapper)
[![License](https://badgen.net/github/license/slicknode/stylemapper)](https://github.com/slicknode/stylemapper/blob/main/LICENSE)
[![Dependency Count](https://badgen.net/bundlephobia/dependency-count/@slicknode/stylemapper)](https://www.npmjs.com/package/@slicknode/stylemapper)
[![Types included](https://badgen.net/npm/types/@slicknode/stylemapper)](https://www.npmjs.com/package/@slicknode/stylemapper)

Easily create styled, strictly typed React components and simplify your component code.

Stylemapper is a small, flexible and zero-dependency utility to **add CSS classes to React components**. It eliminates the boilerplate you usually need for changing styles based on state, define typescript definitions, etc. This simplifies the creation and maintenance of your style and design system:

- Get **strictly typed components** without writing Typescript prop type definitions (Stylemapper infers types automatically)
- Automatically create **variant props** without complicating your component code (success/error, large/medium etc.)
- **Add styles to 3rd party libraries** without manually creating wrapper components, type definitions, etc.
- Have a **single source of truth for your styles** instead of spreading classnames all over your React components

Works especially great with utility based CSS frameworks like [Tailwind CSS](https://tailwindcss.com/).

## Installation

Add Slicknode Stylemapper as a dependency to your project:

    npm install --save @slicknode/stylemapper

## Usage

Import the `styled` utility function and create styled components. Examples are using [Tailwind CSS](https://tailwindcss.com/) utility classes.

### Basic Example

```ts
import { styled } from '@slicknode/stylemapper';

// Create styled components with CSS classes
const Menu = styled('ul', 'space-x-2 flex');
const MenuItem = styled('li', 'w-9 h-9 flex items-center justify-center');

// Then use the components in your app
const App = () => {
  return (
    <Menu>
      <MenuItem>Home</MenuItem>
      <MenuItem>Product</MenuItem>
      <MenuItem>Signup Now</MenuItem>
    </Menu>
  );
};
```

### Variants

Create variants by passing a configuration object. Stylemapper automatically infers the correct prop type definitions and passes the resulting `className` prop to the component:

```ts
const Button = styled('button', {
  variants: {
    intent: {
      neutral: 'bg-slate-300 border border-slate-500',
      danger: 'bg-red-300 border border-red-500',
      success: 'bg-green-300 border border-green-500',
    },
    size: {
      small: 'p-2',
      medium: 'p-4',
      large: 'p-8',
    },
    // Add any number of variants...
  },
  // Optionally set default variant values
  defaultVariants: {
    intent: 'neutral',
    size: 'medium',
  },
});

const App = () => {
  return (
    <Button intent={'danger'} size={'large'}>
      Delete Account
    </Button>
  );
};
```

### Compound Variants

If you only want to add class names to a component if multiple props have particular values, you can configure `compountVariants`:

```ts
const Button = styled('button', {
  variants: {
    intent: {
      danger: 'bg-red-300',
      success: 'bg-green-300',
    },
    outline: {
      true: 'border',
      false: '',
    },
    // Add any number of variants...
  },
  compoundVariants: [
    {
      intent: 'success',
      outline: true,
      className: 'border-green-500',
    },
    {
      intent: 'danger',
      outline: true,
      className: 'border-red-500',
    },
  ],
});

const App = () => {
  return (
    <Button intent={'danger'} outline>
      Delete Account
    </Button>
  );
};
```

### Custom Components

Stylemapper works with any React component, as long as the component has a `className` prop. This makes it easy to add styles to your own components or to UI libraries like [Headless UI](https://headlessui.com/), [Radix UI](https://www.radix-ui.com/) and [Reach UI](https://reach.tech/). Just pass in the component as a first argument:

```ts
const CustomComponent = ({ className }) => {
  return (
    // Make sure you add the className from the props to the DOM node
    <div className={className}>My custom react component</div>
  );
};

const StyledCustomComponent = styled(CustomComponent, {
  variants: {
    intent: {
      danger: 'bg-red-300 border border-red-500',
      success: 'bg-green-300 border border-green-500',
    },
  },
});

// Extending styled components
const SizedComponent = styled(StyledCustomComponent, {
  variants: {
    size: {
      small: 'p-2',
      medium: 'p-4',
      large: 'p-8',
    },
  },
});

const App = () => {
  return (
    <SizedComponent intent="danger" size="large">
      Large error message
    </SizedComponent>
  );
};
```

### Variant Type Casting

You can define `boolean` and `numeric` variant values. The type definition for the resulting prop is automatically inferred:

```ts
const StyledComponent = styled('div', {
  variants: {
    selected: {
      true: 'bg-red-300 border border-red-500',
      false: 'bg-green-300 border border-green-500',
    },
    size: {
      1: 'p-2'
      2: 'p-4'
      3: 'p-8'
    }
  },
});

const App = () => (
  // This component now expects a boolean and a number value as props
  <StyledComponent selected={true} size={2}/>
);
```

### Prop Forwarding

By default, variant props are **not** passed to the wrapped component to prevent invalid props to be attached to DOM nodes. If you need the values of variants inside of your custom components, specify them in the configuration:

```ts
const CustomComponent = ({ open, className }) => {
  return (
    <div className={className}>Component is {open ? 'open' : 'closed'}</div>
  );
};

const StyledComponent = styled('div', {
  variants: {
    selected: {
      true: 'bg-red-300 border border-red-500',
      false: 'bg-green-300 border border-green-500',
    },
  },
  forwardProps: ['selected'],
});
```

### Composing Configurations

You can pass any number of configurations to the `styled` function. This allows you to reuse styles and variants across components. Pass either a string with class names or a configuration object as input values:

```ts
import { intentVariants, sizeVariants } from './shared';
const StyledComponent = styled(
  'div',

  // Add some base styles that are added every time
  'p-2 flex gap-2',

  // Add imported variants
  intentVariants,
  sizeVariants,

  // Add other custom variants
  {
    selected: {
      true: 'border border-green-500',
      false: 'border border-green-100',
    },
  }
);
```

### IntelliSense for Tailwind CSS

If you are using the offical [TailwindCSS extension for VSCode](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss), you can enable intellisense for style mapper by updating your [settings](https://code.visualstudio.com/docs/getstarted/settings):

```json
{
  "tailwindCSS.experimental.classRegex": [
    ["styled\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

## Credits

This library is heavily inspired by [Stitches](https://stitches.dev/), a great CSS in Javascript library. Stylemapper brings a similar API to utility based CSS frameworks without requiring a specific library.
