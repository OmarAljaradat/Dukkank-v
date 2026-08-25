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

    if (!/^\+?[0-9]{8,15}$/.test(clean)) {
        return { valid: false, error: "رقم الهاتف غير صحيح" };
    }

    const digitsOnly = clean.replace(/^\+/, "");

    // Rejects repeating digits
    if (/^(\d)\1+$/.test(digitsOnly) || /(.)\1{6,}/.test(digitsOnly)) {
        return { valid: false, error: "رقم الهاتف غير صحيح" };
    }

    // Sequential fake check
    if (digitsOnly.includes("1234567") || digitsOnly.includes("7654321") || digitsOnly.includes("0123456")) {
        return { valid: false, error: "رقم الهاتف غير صحيح" };
    }

    // 1. JORDAN
    if (/^07[789]\d{7}$/.test(clean) || /^(\+?962)7[789]\d{7}$/.test(clean)) {
        return { valid: true, clean, country: "JO" };
    }
    if (/^07[0-6]\d{7}$/.test(clean) || /^(\+?962)7[0-6]\d{7}$/.test(clean)) {
        return { valid: false, error: "رقم الهاتف غير صحيح" };
    }

    // 2. SAUDI ARABIA
    if (/^05\d{8}$/.test(clean) || /^(\+?966)5\d{8}$/.test(clean)) {
        return { valid: true, clean, country: "SA" };
    }
    if (/^05/.test(clean) && clean.length !== 10) {
        return { valid: false, error: "رقم الهاتف غير صحيح" };
    }

    // 3. UAE
    if (/^05[024568]\d{7}$/.test(clean) || /^(\+?971)5[024568]\d{7}$/.test(clean)) {
        return { valid: true, clean, country: "AE" };
    }

    // 4. KUWAIT
    if (/^(00965|\+965|[569])\d{7}$/.test(clean)) {
        return { valid: true, clean, country: "KW" };
    }

    // 5. QATAR
    if (/^(00974|\+974|[3567])\d{7}$/.test(clean)) {
        return { valid: true, clean, country: "QA" };
    }

    // 6. BAHRAIN
    if (/^(00973|\+973|[36])\d{7}$/.test(clean)) {
        return { valid: true, clean, country: "BH" };
    }

    // 7. OMAN
    if (/^(00968|\+968|[79])\d{7}$/.test(clean)) {
        return { valid: true, clean, country: "OM" };
    }

    // 8. EGYPT
    if (/^01[0125]\d{8}$/.test(clean) || /^(\+?20)1[0125]\d{8}$/.test(clean)) {
        return { valid: true, clean, country: "EG" };
    }

    // 9. PALESTINE
    if (/^05[69]\d{7}$/.test(clean) || /^(\+?970|\+?972)5[69]\d{7}$/.test(clean)) {
        return { valid: true, clean, country: "PS" };
    }

    // 10. IRAQ
    if (/^07[5789]\d{8}$/.test(clean) || /^(\+?964)7[5789]\d{8}$/.test(clean)) {
        return { valid: true, clean, country: "IQ" };
    }

    // 11. GENERAL INTL
    if (/^\+[1-9]\d{8,13}$/.test(clean)) {
        return { valid: true, clean, country: "INTL" };
    }

    return { valid: false, error: "رقم الهاتف غير صحيح" };
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
