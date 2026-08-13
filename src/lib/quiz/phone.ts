export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/** Valida celular brasileiro: DDD 11-99 + 9 dígitos iniciando em 9. */
export function isValidBrPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 11) return false;
  const ddd = Number(digits.slice(0, 2));
  if (ddd < 11 || ddd > 99) return false;
  return digits[2] === "9";
}
