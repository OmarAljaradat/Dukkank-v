import { Router } from "express";
import { sendEmail, sendOrderReceiptEmail, sendOtpEmail } from "../lib/email.js";

const router = Router();

// POST /api/send-otp - 4-digit OTP email endpoint
router.post("/send-otp", async (req, res) => {
    try {
        const { to, otpCode } = req.body;
        if (!to || !otpCode) {
            return res.status(400).json({ error: "Missing email or otpCode" });
        }
        const result = await sendOtpEmail(to, otpCode);
        return res.json(result);
    } catch (error: any) {
        console.error("Route send-otp error:", error);
        return res.status(500).json({ error: error.message || "Failed to send OTP" });
    }
});

// POST /api/send-email - Custom email endpoint
router.post("/send-email", async (req, res) => {
    try {
        const { to, subject, html, orderDetails } = req.body;

        if (orderDetails && to) {
            const result = await sendOrderReceiptEmail(to, orderDetails);
            return res.json(result);
        }

        if (!to || !subject || !html) {
            return res.status(400).json({ error: "Missing required fields (to, subject, html)" });
        }

        const result = await sendEmail({ to, subject, html });
        return res.json(result);
    } catch (error: any) {
        console.error("Route send-email error:", error);
        return res.status(500).json({ error: error.message || "Failed to send email" });
    }
});

export default router;
