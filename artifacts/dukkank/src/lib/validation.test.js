import { describe, it, expect } from "vitest";
import { validateFullName, validatePhoneNumber } from "./validation";

describe("Dukkank Store Input & Coupon Validation Suite", () => {
  describe("validateFullName", () => {
    it("should accept valid Arabic full names with at least 2 words", () => {
      const res = validateFullName("أحمد العبداللات");
      expect(res.valid).toBe(true);
      expect(res.clean).toBe("أحمد العبداللات");
    });

    it("should reject single word names", () => {
      const res = validateFullName("أحمد");
      expect(res.valid).toBe(false);
    });

    it("should reject names containing numbers or special symbols", () => {
      const res = validateFullName("أحمد123 علي");
      expect(res.valid).toBe(false);
    });

    it("should reject excessively short names", () => {
      const res = validateFullName("أ د");
      expect(res.valid).toBe(false);
    });
  });

  describe("validatePhoneNumber", () => {
    it("should accept valid local and international phone numbers", () => {
      const res1 = validatePhoneNumber("0775589911");
      expect(res1.valid).toBe(true);

      const res2 = validatePhoneNumber("+962775589911");
      expect(res2.valid).toBe(true);
    });

    it("should reject dummy repeating digit phone numbers", () => {
      const res = validatePhoneNumber("0000000000");
      expect(res.valid).toBe(false);
    });

    it("should reject invalid short numbers", () => {
      const res = validatePhoneNumber("12345");
      expect(res.valid).toBe(false);
    });
  });

  describe("Coupon Calculation Logic", () => {
    const calculateDiscount = (total, coupon) => {
      if (!coupon || !coupon.is_active && !coupon.active) return 0;
      if (coupon.minOrder && total < coupon.minOrder) return 0;
      if (coupon.type === "percentage" || coupon.discount_type === "percentage") {
        const val = coupon.value || coupon.discount_value || 0;
        return (total * val) / 100;
      }
      return coupon.value || coupon.discount_value || 0;
    };

    it("should calculate percentage discount correctly", () => {
      const coupon = { discount_type: "percentage", discount_value: 10, is_active: true };
      const discount = calculateDiscount(100, coupon);
      expect(discount).toBe(10);
    });

    it("should respect minimum order thresholds", () => {
      const coupon = { discount_type: "percentage", discount_value: 20, minOrder: 50, is_active: true };
      const discountLow = calculateDiscount(30, coupon);
      expect(discountLow).toBe(0);

      const discountHigh = calculateDiscount(100, coupon);
      expect(discountHigh).toBe(20);
    });
  });
});
