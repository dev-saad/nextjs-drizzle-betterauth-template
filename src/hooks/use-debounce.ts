// import debounce from "lodash/debounce";
// import { useEffect, useMemo, useState } from "react";

// export function useDebounceValue<T>(value: T, delay: number = 500) {
//  const [debouncedValue, setDebouncedValue] = useState<T>(value);

//  const debouncedSet = useMemo(
//   () => debounce((val: T) => setDebouncedValue(val), delay),
//   [delay]
//  );

//  useEffect(() => {
//   debouncedSet(value);
//   return () => {
//    debouncedSet.cancel();
//   };
//  }, [value, debouncedSet]);

//  return debouncedValue;
// }

// export function useDebounceState<T>(initialValue: T, delay: number = 500) {
//  const [value, setValue] = useState<T>(initialValue);
//  const debouncedValue = useDebounceValue(value, delay);

//  return [value, debouncedValue, setValue] as const;
// }
