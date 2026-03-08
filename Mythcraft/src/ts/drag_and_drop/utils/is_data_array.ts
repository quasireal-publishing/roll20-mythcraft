const isDataArray = (data: unknown): data is string | string[] =>
  Array.isArray(data) || (typeof data === "string" && data.startsWith("["));
