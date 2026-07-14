export function decimalToSubunits(value: string) {
  const [whole, fraction = ''] = value.split('.');
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0').slice(0, 2));
}

export function subunitsToDecimal(subunits: number) {
  const absolute = Math.abs(subunits);
  const sign = subunits < 0 ? '-' : '';
  return `${sign}${Math.floor(absolute / 100)}.${String(absolute % 100).padStart(2, '0')}`;
}
