/**
 * Parses a URL query param as JSON, falling back to a safe default on
 * malformed input or an unexpected shape (e.g. an object where an array
 * was expected) instead of throwing.
 * @param {?string} raw - the raw query param value (may be null/empty)
 * @param {*} fallback - value to return if parsing fails or the shape is wrong
 * @param {?function(*): boolean} [isValidShape] - optional shape validator
 * @return {*} the parsed value, or fallback
 */
function safeParseJsonParam(raw, fallback, isValidShape) {
  if (!raw) return fallback;
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
  if (isValidShape && !isValidShape(parsed)) {
    return fallback;
  }
  return parsed;
}

if (typeof process !== 'undefined' && process.versions && process.versions.node) {
  module.exports = safeParseJsonParam;
}
