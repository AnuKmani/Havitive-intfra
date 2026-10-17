/** Indian mobile numbers as typed on the contact form: +91, then 10 digits starting with 6, 7, 8 or 9. */
export const IN_MOBILE_PATTERN = "^\\+91 ?[6-9][0-9]{9}$";
export const IN_MOBILE_HINT = "Enter a valid Indian mobile number: +91 followed by 10 digits that start with 6, 7, 8 or 9.";
export const IN_MOBILE_FAKE_HINT = "That doesn't look like a real mobile number. Please enter the number we can call you on.";

/** True when the digits climb or fall by one for `length` digits in a row, e.g. 123456 or 765432. */
function hasRun(digits: string, length: number) {
  let run = 1;
  let step = 0;
  for (let i = 1; i < digits.length; i++) {
    const d = Number(digits[i]) - Number(digits[i - 1]);
    if ((d === 1 || d === -1) && (run === 1 || d === step)) {
      run += 1;
      step = d;
      if (run >= length) return true;
    } else {
      run = d === 1 || d === -1 ? 2 : 1;
      step = d === 1 || d === -1 ? d : 0;
    }
  }
  return false;
}

/**
 * Checks a number with its spaces already removed, e.g. +919876543210. Besides the format it refuses made-up numbers:
 * one digit repeated (9999999999), 6 or more of the same digit in a row (9000000123), a short pattern repeated
 * (9898989898), and long runs like 123456 or 987654.
 */
export function isValidIndianMobile(phone: string) {
  if (!/^\+91[6-9][0-9]{9}$/.test(phone)) return false;
  const n = phone.slice(3);
  if (/(\d)\1{5}/.test(n)) return false;
  if (/^(\d\d)\1{4}$/.test(n) || /^(\d{5})\1$/.test(n)) return false;
  if (hasRun(n, 6)) return false;
  return true;
}
