export function isPlaceholderValue(value) {
  return !value || (value.startsWith("`") && value.includes("|"));
}

export function filled(value) {
  return Boolean(value && !isPlaceholderValue(value) && value.trim() !== "");
}
