export type Assign<
  T1 = Record<string, unknown>,
  T2 = Record<string, unknown>
> = T1 extends any ? Omit<T1, keyof T2> & T2 : never;

export type IntrinsicElementsKeys = keyof JSX.IntrinsicElements;

export type StyleConfig =
  | {
      variants?: {
        [Name in string]: {
          [Pair in number | string]: string;
        };
      };
      forwardProps?: string[];
      defaultVariants?: {
        [Name in string]: string | number | boolean;
      };
      compoundVariants?: ({
        [Name in string]: string | number | boolean;
      } & { className: string })[];
    }
  | string;

export type StyledComponentProps<TConfig extends any[]> = (TConfig[0] extends {
  variants: { [name: string]: unknown };
}
  ? {
      [K in keyof TConfig[0]['variants']]?: StrictValue<
        keyof TConfig[0]['variants'][K]
      >;
    }
  : unknown) &
  (TConfig extends [first: any, ...rest: infer V]
    ? StyledComponentProps<V>
    : unknown);

export type StrictValue<T> = T extends number
  ? T
  : T extends 'true'
  ? boolean
  : T extends 'false'
  ? boolean
  : T extends `${number}`
  ? number
  : T;

export interface StyledComponent<TType, TProps>
  extends React.ForwardRefExoticComponent<
    Assign<
      TType extends IntrinsicElementsKeys | React.ComponentType<any>
        ? React.ComponentPropsWithRef<TType>
        : never,
      TProps
    >
  > {
  (
    props: Assign<
      TType extends IntrinsicElementsKeys | React.ComponentType<any>
        ? React.ComponentPropsWithRef<TType>
        : Record<string, unknown>,
      TProps
    >
  ): React.ReactElement | null;
}
