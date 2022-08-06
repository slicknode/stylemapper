import * as React from 'react';
import {
  StyledComponent,
  StyledComponentProps,
  StyleConfig,
  StrictValue,
} from './types';

export function styled<
  TComponent extends keyof JSX.IntrinsicElements | React.ComponentType<any>,
  TConfigs extends (string | { [key: string]: unknown })[]
>(
  Component: TComponent,
  ...configs: {
    [K in keyof TConfigs]: string extends TConfigs[K]
      ? TConfigs[K]
      :
          | {
              variants?: {
                [Name in string]: {
                  [Pair in number | string]: string;
                };
              };
              defaultVariants?: 'variants' extends keyof TConfigs[K]
                ? {
                    [Name in keyof TConfigs[K]['variants']]?: StrictValue<
                      keyof TConfigs[K]['variants'][Name]
                    >;
                  }
                : Record<string, never>;
              compoundVariants?: 'variants' extends keyof TConfigs[K]
                ? Array<
                    {
                      [Name in keyof TConfigs[K]['variants']]?: StrictValue<
                        keyof TConfigs[K]['variants'][Name]
                      >;
                    } & { className: string }
                  >
                : [];
              forwardProps?: 'variants' extends keyof TConfigs[K]
                ? (keyof TConfigs[K]['variants'])[]
                : [];
            }
          | string;
  }
): StyledComponent<TComponent, StyledComponentProps<TConfigs>> &
  React.RefAttributes<TComponent> {
  const preparedConfig = prepareConfig(configs);

  const styledComponent = React.forwardRef<
    React.RefAttributes<TComponent>,
    React.ComponentPropsWithoutRef<TComponent>
  >((props, ref) => {
    const className = React.useMemo<string | undefined>(() => {
      // Add variant classes
      let classNames = preparedConfig.variantProps.reduce((acc, propName) => {
        const propValue =
          propName in props
            ? props[propName]
            : propName in preparedConfig.defaultProps
            ? preparedConfig.defaultProps[propName]
            : undefined;
        if (String(propValue) in preparedConfig.variantClasses[propName]) {
          return acc.concat(
            preparedConfig.variantClasses[propName][String(propValue)]
          );
        }
        return acc;
      }, preparedConfig.defaultClassNames.concat(props.className ? props.className.split(' ') : []));

      // Add composite variant classes
      classNames = preparedConfig.compoundVariants.reduce((acc, cv) => {
        const { className, ...variantProps } = cv;
        // If all compound variable props match, add the classNames
        return Object.keys(variantProps).every(
          (propName) =>
            String(props[propName]) === String(variantProps[propName])
        )
          ? acc.concat(className)
          : acc;
      }, classNames);

      return unique(classNames).join(' ');
    }, preparedConfig.variantProps.map((p) => props[p]).concat([props.className]));

    const forwardProps = React.useMemo(() => {
      const baseProps =
        preparedConfig.strippedProps.length > 0
          ? omit(props, preparedConfig.strippedProps)
          : props;
      return {
        ...baseProps,
        ref,
        className,
      };
    }, [props, ref, className]);

    return React.createElement(Component, forwardProps);
  });

  styledComponent.displayName = getDisplayName(Component);

  return styledComponent as any; // TODO: Figure out how to type this properly
}

function getDisplayName(
  component: keyof JSX.IntrinsicElements | React.ComponentType<any>
) {
  const innerName =
    typeof component === 'string'
      ? component
      : component.displayName || component.name || 'Component';
  return `styled.${innerName}`;
}

type PreparedConfig = {
  // Classes that are applied to the component
  defaultClassNames: string[];
  // Merged variant configurations
  variantClasses: {
    [propName: string]: {
      // Stringified variant value
      [value: string]: string[];
    };
  };
  // Props to be stripped from the input props
  strippedProps: string[];
  forwardProps: string[];
  variantProps: string[];
  defaultProps: { [key: string]: unknown };
  compoundVariants: ({ [key: string]: unknown } & { className: string[] })[];
};

// Merges the provided configurations into a single configuration
function prepareConfig(configs: StyleConfig[]): PreparedConfig {
  const combinedConfigs = configs.reduce<PreparedConfig>(
    (acc, config) => {
      if (typeof config === 'string') {
        return {
          ...acc,
          defaultClassNames: acc.defaultClassNames.concat(config.split(' ')),
        };
      } else {
        return {
          ...acc,
          variantProps: config.variants
            ? acc.variantProps.concat(Object.keys(config.variants))
            : acc.variantProps,
          forwardProps: config.forwardProps
            ? acc.forwardProps.concat(config.forwardProps)
            : acc.forwardProps,
          defaultProps: config.defaultVariants
            ? {
                ...acc.defaultProps,
                ...config.defaultVariants,
              }
            : acc.defaultProps,
          variantClasses: config.variants
            ? Object.keys(config.variants).reduce((vacc, variantName) => {
                return {
                  ...vacc,
                  [variantName]: Object.entries(
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    config.variants![variantName]
                  ).reduce((valueAcc, [value, className]) => {
                    if (!(String(value) in valueAcc)) {
                      valueAcc[String(value)] = className
                        .split(' ')
                        .filter((c) => c);
                    }
                    return {
                      ...valueAcc,
                      [String(value)]: [
                        ...(String(value) in valueAcc
                          ? valueAcc[String(value)]
                          : []),
                        ...className.split(' ').filter((c) => c),
                      ],
                    };
                  }, acc.variantClasses[variantName] || {}),
                };
              }, acc.variantClasses)
            : acc.variantClasses,
          compoundVariants: config.compoundVariants
            ? [
                ...acc.compoundVariants,
                ...config.compoundVariants.map((cv) => ({
                  ...cv,
                  className: cv.className.split(' '),
                })),
              ]
            : acc.compoundVariants,
        };
      }
    },
    {
      defaultClassNames: [],
      variantClasses: {},
      strippedProps: [],
      variantProps: [],
      forwardProps: [],
      defaultProps: {},
      compoundVariants: [],
    }
  );

  return {
    ...combinedConfigs,
    forwardProps: unique(combinedConfigs.forwardProps),
    variantProps: unique(combinedConfigs.variantProps),
    defaultClassNames: unique(combinedConfigs.defaultClassNames),
    strippedProps: unique(
      combinedConfigs.variantProps.filter(
        (p) => !combinedConfigs.forwardProps.includes(p)
      )
    ),
  };
}

/**
 * Creates a new object without the specified keys
 *
 * @param obj
 * @param keys
 * @returns
 */
function omit<T extends object, K extends string[]>(
  obj: T,
  keys: string[]
): Pick<T, Exclude<keyof T, K[number]>> {
  const newObj = { ...obj };
  keys.forEach((key) => delete (newObj as any)[key]);
  return newObj;
}

function unique<T>(array: T[]): T[] {
  return array.filter((item, index, arr) => {
    return arr.indexOf(item) === index;
  });
}
