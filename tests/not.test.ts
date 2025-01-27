import { Expect, Equal } from '../src/types/helpers';
import { match, __, not, when } from '../src';

describe('not', () => {
  describe('pattern containing a not clause', () => {
    it('should work at the top level', () => {
      const get = (x: unknown): string =>
        match(x)
          .with(not(__.number), (x) => {
            type t = Expect<Equal<typeof x, unknown>>;
            return 'not a number';
          })
          .with(not(__.string), (x) => {
            type t = Expect<Equal<typeof x, unknown>>;
            return 'not a string';
          })
          .run();

      expect(get(20)).toEqual('not a string');
      expect(get('hello')).toEqual('not a number');
    });

    it('should work in a nested structure', () => {
      type DS = { x: string | number; y: string | number };
      const get = (x: DS) =>
        match(x)
          .with({ y: __.number, x: not(__.string) }, (x) => {
            type t = Expect<Equal<typeof x, { x: number; y: number }>>;
            return 'yes';
          })
          .with(__, () => 'no')
          .run();

      expect(get({ x: 2, y: 2 })).toEqual('yes');
      expect(get({ y: 2, x: 'hello' })).toEqual('no');
    });

    it('should discriminate union types correctly', () => {
      const one = 'one';
      const two = 'two';

      const get = (x: 'one' | 'two') =>
        match(x)
          .with(not(one), (x) => {
            type t = Expect<Equal<typeof x, 'two'>>;
            return 'not 1';
          })
          .with(not(two), (x) => {
            type t = Expect<Equal<typeof x, 'one'>>;
            return 'not 2';
          })
          .run();

      expect(get('two')).toEqual('not 1');
      expect(get('one')).toEqual('not 2');
    });

    it('should discriminate union types correctly', () => {
      type Input =
        | {
            type: 'success';
          }
        | { type: 'error' };

      const get = (x: Input) =>
        match(x)
          .with({ type: not('success') }, (x) => {
            type t = Expect<Equal<typeof x, { type: 'error' }>>;
            return 'error';
          })
          .with({ type: not('error') }, (x) => {
            type t = Expect<Equal<typeof x, { type: 'success' }>>;
            return 'success';
          })
          .run();

      expect(get({ type: 'error' })).toEqual('error');
      expect(get({ type: 'success' })).toEqual('success');
    });

    it('should correctly invert the type of a GuardPattern', () => {
      const nullable = when(
        (x: unknown): x is null | undefined => x === null || x === undefined
      );

      expect(
        match<{ str: string } | null>({ str: 'hello' })
          .with(not(nullable), ({ str }) => str)
          .with(nullable, () => '')
          .exhaustive()
      ).toBe('hello');

      const untypedNullable = when((x) => x === null || x === undefined);

      expect(
        match<{ str: string }>({ str: 'hello' })
          .with(not(untypedNullable), ({ str }) => str)
          // @ts-expect-error
          .exhaustive()
      ).toBe('hello');
    });
  });
});
