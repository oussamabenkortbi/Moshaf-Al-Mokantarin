export const interpolate = (widthOrHeight: number, minValue: number, maxValue: number, minScreen: number, maxScreen: number) => {
  return Math.max(
    minValue,
    Math.min(maxValue, minValue + ((maxValue - minValue) * (widthOrHeight - minScreen)) / (maxScreen - minScreen))
  );
};