/** Indian mobile numbers as typed on the contact form: +91, then 10 digits starting with 6, 7, 8 or 9. */
export const IN_MOBILE_PATTERN = "^\\+91 ?[6-9][0-9]{9}$";
export const IN_MOBILE_HINT = "Enter a valid Indian mobile number: +91 followed by 10 digits that start with 6, 7, 8 or 9.";

/** Checks a number with its spaces already removed, e.g. +919876543210. Rejects made-up numbers like +919999999999. */
export function isValidIndianMobile(phone: string) {
  return /^\+91[6-9][0-9]{9}$/.test(phone) && !/^(\d)\1{9}$/.test(phone.slice(3));
}
