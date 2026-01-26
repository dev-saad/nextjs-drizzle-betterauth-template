import { isEqual, isObject, transform } from "lodash";

/**
 * Compares current values against default values and returns only the modified fields.
 * detailed enough to handle nested objects like socialLinks.
 */
export function getChangedValues<T extends Record<string, any>>(
 currentValues: T,
 defaultValues: T,
): Partial<T> {
 return transform(currentValues, (result: any, value, key) => {
  const defaultValue = defaultValues[key];

  // If values are exactly the same, skip
  if (isEqual(value, defaultValue)) {
   return;
  }

  // If both are objects (and not arrays/dates), recurse to find nested changes
  if (
   isObject(value) &&
   isObject(defaultValue) &&
   !Array.isArray(value) &&
   !(value instanceof Date)
  ) {
   const nestedChanges = getChangedValues(value, defaultValue);
   // Only include the nested object if it actually has changes inside
   if (Object.keys(nestedChanges).length > 0) {
    result[key] = nestedChanges;
   }
  } else {
   // Primitive value changed, or array changed (taking full new array)
   result[key] = value;
  }
 });
}

export function getAuditDiff(newValues: any, oldValues: any) {
 return transform(newValues, (result: any, value, key) => {
  const oldValue = oldValues[key];

  // Skip if identical
  if (isEqual(value, oldValue)) return;

  // Handle Nested Objects (Recursion)
  if (
   isObject(value) &&
   isObject(oldValue) &&
   !Array.isArray(value) &&
   !(value instanceof Date)
  ) {
   const nestedDiff = getAuditDiff(value, oldValue);
   if (Object.keys(nestedDiff).length > 0) {
    result[key] = nestedDiff;
   }
  } else {
   // Create the "From -> To" entry
   result[key] = {
    from: oldValue ?? null,
    to: value,
   };
  }
 });
}
