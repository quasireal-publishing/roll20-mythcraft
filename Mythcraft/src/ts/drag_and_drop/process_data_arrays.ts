const processDataArrays = (
  array: string | string[],
  callback: (arg0: { [key: string]: AttrValue }) => { [key: string]: AttrValue }
) => {
  if (array === undefined) {
    return;
  }
  const parsed = typeof array === "string" ? parseJSON(array) : array;
  const map = parsed.map((e: { [key: string]: string }) => callback(e));
  return map?.reduce((acc: any, val: any) => ({ ...acc, ...val }));
};
