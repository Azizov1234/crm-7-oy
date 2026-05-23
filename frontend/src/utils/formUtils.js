const UZ_PHONE_REGEX = /^998(20|25|33|50|55|70|71|77|78|88|90|91|93|94|95|97|98|99)\d{7}$/;

export function getApiErrorMessage(error, fallback = "Xatolik yuz berdi") {
  const raw = error?.response?.data?.message;
  if (Array.isArray(raw)) return raw.join(', ');
  if (typeof raw === 'string' && raw.trim()) return raw;
  return fallback;
}

export function normalizeUzPhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('998')) return digits.slice(0, 12);
  if (digits.length === 9) return `998${digits}`;
  if (digits.startsWith('0')) return `998${digits.slice(1)}`.slice(0, 12);
  return digits.slice(0, 12);
}

export function isValidUzPhone(value) {
  return UZ_PHONE_REGEX.test(normalizeUzPhone(value));
}

export function isStrongPassword(value) {
  const password = String(value || '');
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password);
}
