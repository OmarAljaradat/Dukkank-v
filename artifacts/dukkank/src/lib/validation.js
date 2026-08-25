/**
 * Strict Smart Validation Utility for Dukkank Store
 */

// Disposable / Fake Email Domain List
const BANNED_EMAIL_DOMAINS = [
    "test.com", "example.com", "asdf.com", "temp.com", "mailinator.com",
    "yopmail.com", "123.com", "abc.com", "fake.com", "dispostable.com",
    "trashmail.com", "guerrillamail.com", "sharklasers.com", "g.c"
];

/**
 * Validate Full Name (الاسم الكامل)
 */
export function validateFullName(name) {
    if (!name || typeof name !== "string") {
        return { valid: false, error: "الاسم غير صحيح" };
    }
    const clean = name.trim();
    if (clean.length < 5) {
        return { valid: false, error: "الاسم غير صحيح" };
    }
    
    // Split into words
    const words = clean.split(/\s+/);
    if (words.length < 2) {
        return { valid: false, error: "الاسم غير صحيح" };
    }

    // Check for numbers or special symbols
    if (/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(clean)) {
        return { valid: false, error: "الاسم غير صحيح" };
    }

    // Check for repeating characters
    if (/(.)\1{3,}/.test(clean)) {
        return { valid: false, error: "الاسم غير صحيح" };
    }

    return { valid: true, clean };
}

/**
 * Validate Phone Number (رقم الهاتف / الواتساب)
 */
export function validatePhoneNumber(phone) {
    if (!phone || typeof phone !== "string") {
        return { valid: false, error: "رقم الهاتف غير صحيح" };
    }
    
    const clean = phone.replace(/[\s\-\(\)\.]/g, "").trim();

    // Check minimum length (7 to 16 digits, optional leading + or 00)
    const digitsOnly = clean.replace(/^(\+|00)/, "");
    if (!/^[0-9]{7,16}$/.test(digitsOnly)) {
        return { valid: false, error: "رقم الهاتف غير صحيح" };
    }

    // Rejects only if completely identical repeating digits like 000000000 or 111111111
    if (/^(\d)\1{7,}$/.test(digitsOnly)) {
        return { valid: false, error: "رقم الهاتف غير صحيح" };
    }

    // Jordanian formats (079..., 078..., 077..., 962..., +962..., 00962...)
    if (/^(00962|\+962|962|0)?7[789]\d{7}$/.test(clean) || /^(00962|\+962|962)\d{8,9}$/.test(clean)) {
        return { valid: true, clean, country: "JO" };
    }

    // Saudi Arabia (05..., 9665..., +9665..., 00966...)
    if (/^(00966|\+966|966|0)?5\d{8}$/.test(clean)) {
        return { valid: true, clean, country: "SA" };
    }

    // UAE (05..., 9715..., +9715..., 00971...)
    if (/^(00971|\+971|971|0)?5[024568]\d{7}$/.test(clean)) {
        return { valid: true, clean, country: "AE" };
    }

    // General valid phone number
    return { valid: true, clean, country: "INTL" };
}

/**
 * Validate Email Address (البريد الإلكتروني)
 */
export function validateEmailAddress(email) {
    if (!email || typeof email !== "string") {
        return { valid: false, error: "البريد الإلكتروني غير صحيح" };
    }
    const clean = email.trim().toLowerCase();

    // Email regex check
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(clean)) {
        return { valid: false, error: "البريد الإلكتروني غير صحيح" };
    }

    const domain = clean.split("@")[1];
    if (BANNED_EMAIL_DOMAINS.includes(domain)) {
        return { valid: false, error: "البريد الإلكتروني غير صحيح" };
    }

    const userPart = clean.split("@")[0];
    if (userPart.length < 3) {
        return { valid: false, error: "البريد الإلكتروني غير صحيح" };
    }

    return { valid: true, clean };
}

/**
 * Validate Password Strength (كلمة المرور)
 */
export function validatePassword(password) {
    if (!password || typeof password !== "string") {
        return { valid: false, error: "كلمة المرور غير صحيحة" };
    }
    const clean = password.trim();

    if (clean.length < 6) {
        return { valid: false, error: "كلمة المرور غير صحيحة (6 أحرف/أرقام دمج على الأقل)" };
    }

    const WEAK_PASSWORDS = ["123456", "654321", "000000", "111111", "123123", "password", "qwerty", "admin123"];
    if (WEAK_PASSWORDS.includes(clean.toLowerCase())) {
        return { valid: false, error: "كلمة المرور ضعيفة وغير آمنة" };
    }

    if (/^\d+$/.test(clean)) {
        return { valid: false, error: "كلمة المرور يجب أن تدمج أحرفاً وأرقاماً" };
    }

    if (/(.)\1{4,}/.test(clean)) {
        return { valid: false, error: "كلمة المرور غير صحيحة" };
    }

    return { valid: true, clean };
}
