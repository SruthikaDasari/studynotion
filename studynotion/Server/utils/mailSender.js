const nodemailer = require("nodemailer");

// Brevo sends over HTTPS, which works on Render's free plan (SMTP ports are blocked there).
// Set BREVO_API_KEY and MAIL_FROM (a sender verified in Brevo) to use it.
const sendWithBrevo = async (email, title, body) => {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
            "api-key": process.env.BREVO_API_KEY,
            "Content-Type": "application/json",
            accept: "application/json",
        },
        body: JSON.stringify({
            sender: { name: "StudyNotion", email: process.env.MAIL_FROM },
            to: [{ email: `${email}` }],
            subject: `${title}`,
            htmlContent: `${body}`,
        }),
        signal: AbortSignal.timeout(15000),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(`Brevo error ${res.status}: ${data.message || "unknown"}`);
    }
    return data;
};

const sendWithSmtp = async (email, title, body) => {
    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        // e.g. 2525 for Brevo on Render (Render free blocks 25/465/587)
        port: process.env.MAIL_PORT ? Number(process.env.MAIL_PORT) : undefined,
        // Fail fast instead of hanging ~2 min when SMTP is blocked/unreachable
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        },
    });
    return transporter.sendMail({
        from: `StudyNotion <${process.env.MAIL_FROM || process.env.MAIL_USER}>`,
        to: `${email}`,
        subject: `${title}`,
        html: `${body}`,
    });
};

const mailSender = async (email, title, body) => {
    try {
        const info = process.env.BREVO_API_KEY
            ? await sendWithBrevo(email, title, body)
            : await sendWithSmtp(email, title, body);
        console.log(info);
        return info;
    } catch (error) {
        console.log("Mail error:", error.message);
    }
};

module.exports = mailSender;
