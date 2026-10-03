import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ReferralCodeInput } from "@/components/ui/referral-code-input";
import { OTPInput } from "@/components/ui/otp-input";
import { formatCountdown, maskMobile, normalizeCode, normalizeDigits, toPersianDigits } from "@/lib/utils/persian";
import { createMockAuthRepository } from "@/mocks/auth-repository";

function ReferralFixture() {
  const [value, setValue] = useState("");
  return <div dir="rtl"><ReferralCodeInput value={value} onChange={setValue} /></div>;
}
function OtpFixture({ complete }: { complete: (code: string) => void }) {
  const [value, setValue] = useState("");
  return <div dir="rtl"><OTPInput value={value} onChange={setValue} onComplete={complete} /></div>;
}
describe("segmented native inputs", () => {
  it("keeps referral value/cells in LTR order inside RTL and supports full-code paste", async () => {
    const user = userEvent.setup();
    const { container } = render(<ReferralFixture />);
    const input = screen.getByRole("textbox", { name: "کد معرفی / کد ارجاع" });
    await user.click(input);
    await user.paste("a4 k9p2");
    expect(input).toHaveValue("A4K9P2");
    expect(input).toHaveAttribute("dir", "ltr");
    expect(container.querySelector(".code-control")).toHaveAttribute("dir", "ltr");
    expect([...container.querySelectorAll(".code-cell")].map((cell) => cell.textContent)).toEqual(["A", "4", "K", "9", "P", "2"]);
  });
  it("supports keyboard editing and an active cell", async () => {
    const user = userEvent.setup();
    const { container } = render(<ReferralFixture />);
    const input = screen.getByRole("textbox");
    await user.click(input);
    await user.type(input, "a4k9p2");
    await user.keyboard("{Backspace}");
    expect(input).toHaveValue("A4K9P");
    expect(container.querySelectorAll('[data-active="true"]')).toHaveLength(1);
    await user.keyboard("{Control>}a{/Control}{Backspace}");
    expect(input).toHaveValue("");
  });
  it("uses one SMS-autofill field, presents Persian digits, and completes only at five digits", () => {
    const complete = vi.fn();
    const { container } = render(<OtpFixture complete={complete} />);
    const input = screen.getByRole("textbox", { name: "کد تأیید پنج‌رقمی" });
    expect(container.querySelectorAll("input")).toHaveLength(1);
    expect(input).toHaveAttribute("autocomplete", "one-time-code");
    expect(input).toHaveAttribute("inputmode", "numeric");
    expect(input).toHaveAttribute("maxlength", "5");
    fireEvent.change(input, { target: { value: "۱۲۳۴" } });
    expect(input).toHaveValue("1234");
    expect(complete).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: "۱۲۳۴۵" } });
    expect(input).toHaveValue("12345");
    expect(complete).toHaveBeenCalledExactlyOnceWith("12345");
    expect([...container.querySelectorAll(".code-cell")].map((cell) => cell.textContent)).toEqual(["۱", "۲", "۳", "۴", "۵"]);
    fireEvent.change(input, { target: { value: "12345" } });
    expect(complete).toHaveBeenCalledTimes(1);
  });
  it("associates incomplete/invalid referral errors", () => {
    render(<ReferralCodeInput value="A4" onChange={() => undefined} error="کد معرفی باید ۶ حرف یا رقم باشد." />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("textbox")).toHaveAccessibleDescription("کد معرفی باید ۶ حرف یا رقم باشد.");
  });
  it("keeps the caret after a partial Persian OTP paste before the final digit", async () => {
    const user = userEvent.setup();
    const complete = vi.fn();
    render(<OtpFixture complete={complete} />);
    const input = screen.getByRole("textbox");
    await user.click(input);
    await user.paste("۱۲۳۴");
    await user.keyboard("5");
    expect(input).toHaveValue("12345");
    expect(complete).toHaveBeenCalledExactlyOnceWith("12345");
  });
});
describe("auth presentation and mock timing", () => {
  it("normalizes both numeral families and formats the masked number/countdown", () => {
    expect(normalizeDigits("۰۹١۲٣۴٥۶۷۸۹")).toBe("09123456789");
    expect(normalizeCode("a4 k9p2!!", 6, false)).toBe("A4K9P2");
    expect(toPersianDigits(maskMobile("09120004567"))).toBe("۰۹۱۲•••۴۵۶۷");
    expect(formatCountdown(102)).toBe("۱:۴۲");
    expect(formatCountdown(-1)).toBe("۰:۰۰");
  });
  it("returns authoritative remaining attempts and enforces resend timing", async () => {
    let time = Date.parse("2026-10-04T00:00:00Z");
    const auth = createMockAuthRepository(() => time, 120);
    const input = { mobile: "09120004567", referralCode: "A4K9P2" };
    expect(await auth.requestOtp(input)).toMatchObject({ remainingAttempts: 3, retryAfterSeconds: 120 });
    time += 18_000;
    await expect(auth.requestOtp(input)).rejects.toMatchObject({ code: "OTP_RESEND_TOO_SOON", details: { retryAfterSeconds: 102 } });
    await expect(auth.verifyOtp({ mobile: input.mobile, code: "99999" })).rejects.toMatchObject({ details: { remainingAttempts: 2 } });
    time += 102_000;
    expect(await auth.requestOtp(input)).toMatchObject({ remainingAttempts: 3 });
    expect(await auth.verifyOtp({ mobile: input.mobile, code: "12345" })).toMatchObject({ verified: true });
  });
});
