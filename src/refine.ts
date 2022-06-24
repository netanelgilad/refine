import { z, ZodType } from "zod";

export type Refine<Type, Tokens extends keyof { [key: string]: null }> = {
  readonly __opaque__: KeySet<Tokens>;
} & Type;

export type KeySet<T extends keyof { [key: string]: null }> = {
  [key in T]: null;
};

export type Refiner<K, U extends string> = {
  encode(val: K): val is Refine<K, U>;
  ensure(val: K): asserts val is Refine<K, U>;
  zod(): ZodRefine<K, U>;
};

export type infer<T extends Refiner<any, string>> = T extends Refiner<
  infer Type,
  infer Knowledge
>
  ? Refine<Type, Knowledge>
  : never;

export function create<Type, Knowledge extends string>(
  validator: (val: Type) => boolean
): Refiner<Type, Knowledge> {
  return {
    encode(val: Type): val is Refine<Type, Knowledge> {
      return validator(val);
    },
    ensure(val: Type): asserts val is Refine<Type, Knowledge> {
      if (!validator(val)) {
        throw new Error("Invalid");
      }
    },
    zod() {
      return new ZodRefine<Type, Knowledge>({});
    },
  };
}

class ZodRefine<Type, Knowledge extends string> extends ZodType<
  Refine<Type, Knowledge>
> {
  _parse(input: z.ParseInput): z.ParseReturnType<Refine<Type, Knowledge>> {
    return {
      status: "valid",
      value: input as unknown as Refine<Type, Knowledge>,
    };
  }
}
