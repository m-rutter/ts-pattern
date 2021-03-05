import { Primitives, IsPlainObject, All } from './helpers';

export type IsMatching<a, p> =
  // Special case for unknown, because this is the type
  // of the inverted `__` wildcard pattern, which should
  // match everything.
  unknown extends p
    ? true
    : p extends Primitives
    ? p extends a
      ? true
      : false
    : [a, p] extends [any[], any[]]
    ? [a, p] extends [
        [infer a1, infer a2, infer a3, infer a4, infer a5],
        [infer p1, infer p2, infer p3, infer p4, infer p5]
      ]
      ? All<
          [
            IsMatching<a1, p1>,
            IsMatching<a2, p2>,
            IsMatching<a3, p3>,
            IsMatching<a4, p4>,
            IsMatching<a5, p5>
          ]
        >
      : [a, p] extends [
          [infer a1, infer a2, infer a3, infer a4],
          [infer p1, infer p2, infer p3, infer p4]
        ]
      ? All<
          [
            IsMatching<a1, p1>,
            IsMatching<a2, p2>,
            IsMatching<a3, p3>,
            IsMatching<a4, p4>
          ]
        >
      : [a, p] extends [
          [infer a1, infer a2, infer a3],
          [infer p1, infer p2, infer p3]
        ]
      ? All<[IsMatching<a1, p1>, IsMatching<a2, p2>, IsMatching<a3, p3>]>
      : [a, p] extends [[infer a1, infer a2], [infer p1, infer p2]]
      ? All<[IsMatching<a1, p1>, IsMatching<a2, p2>]>
      : [a, p] extends [[infer a1], [infer p1]]
      ? All<[IsMatching<a1, p1>]>
      : p extends a
      ? true
      : false
    : IsPlainObject<p> extends true
    ? true extends (
        // `true extends union` means "if some cases of the a union are matching"
        a extends any // loop over the `a` union
          ? [keyof p & keyof a] extends [never] // if no common keys
            ? false
            : /**
             * Intentionally not using ValueOf, to avoid reaching the
             * 'type instanciation is too deep error'.
             */
            { [k in keyof p & keyof a]: IsMatching<a[k], p[k]> }[keyof p &
                keyof a] extends true
            ? true // all values are matching
            : false
          : never
      )
      ? true
      : false
    : p extends a
    ? true
    : false;
