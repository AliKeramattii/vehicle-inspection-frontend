import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PrimaryButton } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { Checkbox } from "@/components/ui/checkbox";
import { GalleryControls } from "@/features/foundation/gallery-controls";

describe("accessible controls", () => {
  it("associates validation text and preserves external descriptions", () => {
    render(<><p id="external">توضیحات</p><TextInput label="نام" hint="راهنما" error="نام معتبر نیست" aria-describedby="external" /></>);
    const input = screen.getByRole("textbox", { name: "نام" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("توضیحات نام معتبر نیست");
  });
  it("blocks interaction on a loading button", async () => {
    const click = vi.fn();
    render(<PrimaryButton loading onClick={click}>در حال ثبت</PrimaryButton>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    await userEvent.click(button);
    expect(click).not.toHaveBeenCalled();
  });
  it("toggles a checkbox from its label and keyboard", async () => {
    const user = userEvent.setup();
    render(<Checkbox label="انتخاب نمونه" />);
    const checkbox = screen.getByRole("checkbox", { name: "انتخاب نمونه" });
    await user.click(screen.getByText("انتخاب نمونه"));
    expect(checkbox).toBeChecked();
    checkbox.focus();
    await user.keyboard(" ");
    expect(checkbox).not.toBeChecked();
  });
  it("validates the gallery form, focuses invalid input, and resets success", async () => {
    const user = userEvent.setup();
    render(<GalleryControls />);
    await user.click(screen.getByRole("button", { name: "ثبت نمونه" }));
    const input = screen.getByRole("textbox", { name: "نام نمونه" });
    expect(await screen.findByText("نام باید حداقل ۲ حرف داشته باشد.")).toBeVisible();
    expect(input).toHaveFocus();
    await user.type(input, "علی");
    await user.click(screen.getByRole("button", { name: "ثبت نمونه" }));
    expect(await screen.findByRole("status")).toHaveTextContent("نمونه با موفقیت ثبت شد.");
    await user.click(screen.getByRole("button", { name: "پاک کردن" }));
    expect(input).toHaveValue("");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
