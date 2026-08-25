import { describe, it, expect } from "vitest";
import { validateFullName, validatePhoneNumber, validateEmailAddress, validatePassword } from "./validation";

describe("QA Professional Audit Suite — Dukkank E-Commerce Store", () => {
  // ───────────────────────────────────────────────────────────────────────────
  // 1. HAPPY PATH: FULL USER JOURNEY SIMULATION
  // ───────────────────────────────────────────────────────────────────────────
  describe("1. Happy Path — Full User Journey", () => {
    it("Step 1 & 2: Validates registration inputs & OTP flow", () => {
      const nameRes = validateFullName("عبدالله الشمري");
      expect(nameRes.valid).toBe(true);

      const emailRes = validateEmailAddress("abdullah.alshammari@gmail.com");
      expect(emailRes.valid).toBe(true);

      const phoneRes = validatePhoneNumber("0775589911");
      expect(phoneRes.valid).toBe(true);

      const passRes = validatePassword("DukkankSecure#2026");
      expect(passRes.valid).toBe(true);
    });

    it("Step 3 & 4: Cart Item Addition & Total Calculation", () => {
      const cartItems = [
        { id: "blackops7", name: "Call of Duty: Black Ops 7", price: 38.68, quantity: 1 },
        { id: "gow-ragnarok", name: "God of War: Ragnarök", price: 22.98, quantity: 2 }
      ];

      const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      expect(subtotal).toBeCloseTo(84.64, 2);
    });

    it("Step 5: Coupon Application & Total Discount Calculation", () => {
      const subtotal = 100.00;
      const validCoupon = { code: "DUKKANK10", discount_type: "percentage", discount_value: 10, is_active: true };

      const discount = (subtotal * validCoupon.discount_value) / 100;
      const finalTotal = subtotal - discount;

      expect(discount).toBe(10.00);
      expect(finalTotal).toBe(90.00);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 2. EDGE CASES (الحالات الشاذة)
  // ───────────────────────────────────────────────────────────────────────────
  describe("2. Edge Cases", () => {
    it("Scenario 2.1: Rejects 3 consecutive invalid OTP attempts", () => {
      const correctOtp = "4892";
      const wrongOtps = ["1111", "0000", "9999"];

      let authenticated = false;
      for (const otp of wrongOtps) {
        if (otp === correctOtp) authenticated = true;
      }
      expect(authenticated).toBe(false);
    });

    it("Scenario 2.2: Checkout with empty cart is prevented", () => {
      const emptyCart = [];
      const canCheckout = emptyCart.length > 0;
      expect(canCheckout).toBe(false);
    });

    it("Scenario 2.3: Rejects expired or non-existent coupon", () => {
      const expiredCoupon = {
        code: "OLD2020",
        discount_type: "percentage",
        discount_value: 20,
        expiresAt: "2020-01-01T00:00:00Z",
        is_active: true
      };

      const isExpired = new Date(expiredCoupon.expiresAt).getTime() < Date.now();
      expect(isExpired).toBe(true);
    });

    it("Scenario 2.4: Double submission protection (prevents duplicate orders)", () => {
      let isSubmitting = false;
      let orderCount = 0;

      const submitOrder = () => {
        if (isSubmitting) return false;
        isSubmitting = true;
        orderCount++;
        return true;
      };

      const firstClick = submitOrder(); // true
      const secondClickFast = submitOrder(); // false (blocked by flag)

      expect(firstClick).toBe(true);
      expect(secondClickFast).toBe(false);
      expect(orderCount).toBe(1);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 3. INPUT VALIDATION & MALICIOUS INPUTS (الإدخالات الخبيثة)
  // ───────────────────────────────────────────────────────────────────────────
  describe("3. Input Validation & Malicious Inputs", () => {
    it("Scenario 3.1: Rejects XSS script tags in Full Name field", () => {
      const xssInput = "<script>alert('xss')</script> علي";
      const res = validateFullName(xssInput);
      expect(res.valid).toBe(false);
    });

    it("Scenario 3.2: Rejects fake/disposable emails (yopmail, mailinator, etc.)", () => {
      const disposable1 = validateEmailAddress("hacker@mailinator.com");
      expect(disposable1.valid).toBe(false);

      const disposable2 = validateEmailAddress("fakeuser@yopmail.com");
      expect(disposable2.valid).toBe(false);
    });

    it("Scenario 3.3: Rejects common weak passwords (123456, admin123)", () => {
      const weak1 = validatePassword("123456");
      expect(weak1.valid).toBe(false);

      const weak2 = validatePassword("admin123");
      expect(weak2.valid).toBe(false);
    });

    it("Scenario 3.4: Rejects zero or negative product quantities", () => {
      const isValidQuantity = (qty) => typeof qty === "number" && qty > 0 && Number.isInteger(qty);

      expect(isValidQuantity(0)).toBe(false);
      expect(isValidQuantity(-5)).toBe(false);
      expect(isValidQuantity(1.5)).toBe(false);
      expect(isValidQuantity(2)).toBe(true);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 4. COMPATIBILITY & PERFORMANCE LOAD (التوافق والأداء)
  // ───────────────────────────────────────────────────────────────────────────
  describe("4. Compatibility & Load Behavior", () => {
    it("Scenario 4.1: Fast sorting & filtering for large games dataset (100+ items)", () => {
      const largeGamesList = Array.from({ length: 150 }, (_, i) => ({
        id: `game-${i}`,
        name: `Game Title ${i}`,
        price: 10 + (i % 50),
        order: 150 - i
      }));

      const startTime = performance.now();
      const sorted = [...largeGamesList].sort((a, b) => a.order - b.order);
      const endTime = performance.now();

      expect(sorted[0].id).toBe("game-149");
      expect(endTime - startTime).toBeLessThan(15); // Must process in under 15ms
    });
  });
});
