import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState, type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { LocationForm } from "@/features/location/location-form";
import { InspectionLocationMap } from "@/components/location/inspection-location-map";
import { developmentLocationAdapter, isGpsMatched, LocationServiceError } from "@/lib/map/location-adapter";
import { IranianPlate } from "@/components/vehicle/iranian-plate";
import { VehicleCard } from "@/components/vehicle/vehicle-card";
import { PlateInput, parsePastedPlate, type PlateDraft } from "@/components/vehicle/plate-input";
import { VehicleForm } from "@/features/vehicle/vehicle-form";
import { createMockInspectionRepository } from "@/mocks/inspection-repository";
import { inspectionFixture, mockInspectionId } from "@/mocks/fixtures";
import { vehicleSchema } from "@/schemas/domain";
import { consentTermsVersion } from "@/features/consent/consent-model";
import { endpoints } from "@/lib/api/endpoints";

const vehicle = vehicleSchema.parse(inspectionFixture.vehicleDetails);
const location = developmentLocationAdapter.initialLocation;
function mount(children: ReactNode) {
  return render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })}>{children}</QueryClientProvider>);
}

describe("location form and map", () => {
  it("renders the address, GPS accuracy and accessible map/locate controls", () => {
    mount(<LocationForm initialLocation={location} onConfirm={vi.fn()} />);
    expect(screen.getByText(location.formattedAddress)).toBeVisible();
    expect(screen.getByText("دقت موقعیت ± ۸ متر")).toBeVisible();
    expect(screen.getByRole("group", { name: "جابجایی نقشه" })).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("img", { name: "نشانگر ثابت موقعیت انتخابی" })).toBeVisible();
    expect(screen.getByRole("button", { name: "بازگشت به موقعیت من" })).toBeEnabled();
    expect(screen.getByLabelText("طبقه / واحد (اختیاری)")).toHaveValue(location.unitFloor);
  });
  it("edits the address, preserves optional fields and confirms normalized building digits", async () => {
    const user = userEvent.setup(), confirm = vi.fn();
    mount(<LocationForm initialLocation={location} onConfirm={confirm} />);
    await user.click(screen.getByRole("button", { name: "ویرایش" }));
    const address = screen.getByLabelText("آدرس بازدید");
    await waitFor(() => expect(address).toHaveFocus());
    await user.clear(address); await user.type(address, "تهران، خیابان نمونه، ساختمان دوم");
    await user.clear(screen.getByLabelText("شماره پلاک ساختمان"));
    await user.type(screen.getByLabelText("شماره پلاک ساختمان"), "۴۲");
    await user.clear(screen.getByLabelText("طبقه / واحد (اختیاری)"));
    await user.clear(screen.getByLabelText("توضیحات محل پارک (اختیاری)"));
    await user.click(screen.getByRole("button", { name: "پایان ویرایش آدرس" }));
    expect(screen.getByRole("button", { name: "ویرایش" })).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "تأیید این موقعیت" }));
    await waitFor(() => expect(confirm).toHaveBeenCalled());
    expect(confirm.mock.calls[0][0]).toMatchObject({ formattedAddress: "تهران، خیابان نمونه، ساختمان دوم", buildingNumber: "42", unitFloor: "", parkingDescription: "" });
  });
  it("associates address validation errors and blocks invalid submission", async () => {
    const confirm = vi.fn();
    mount(<LocationForm initialLocation={location} onConfirm={confirm} />);
    await userEvent.click(screen.getByRole("button", { name: "ویرایش" }));
    const input = screen.getByLabelText("آدرس بازدید");
    await userEvent.clear(input);
    await userEvent.click(screen.getByRole("button", { name: "تأیید این موقعیت" }));
    expect(await screen.findByText("آدرس کامل بازدید را وارد کنید.")).toBeVisible();
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(document.getElementById(input.getAttribute("aria-describedby")!)).toHaveTextContent("آدرس کامل");
    expect(confirm).not.toHaveBeenCalled();
  });
  it("blocks submission while saving and exposes the recoverable save error", async () => {
    const confirm = vi.fn();
    mount(<LocationForm initialLocation={location} onConfirm={confirm} pending error="ذخیره موقعیت انجام نشد؛ دوباره تلاش کنید." />);
    expect(screen.getByRole("button", { name: "تأیید این موقعیت" })).toBeDisabled();
    expect(screen.getByLabelText("شماره پلاک ساختمان")).toBeDisabled();
    expect(screen.getByRole("alert")).toHaveTextContent("ذخیره موقعیت انجام نشد");
    fireEvent.submit(screen.getByRole("button", { name: "تأیید این موقعیت" }).closest("form")!);
    await waitFor(() => expect(confirm).not.toHaveBeenCalled());
  });
  it("updates coordinates with keyboard panning and recenters deterministically", async () => {
    const changed = vi.fn();
    mount(<InspectionLocationMap location={location} onChange={changed} />);
    const surface = screen.getByRole("group", { name: "جابجایی نقشه" });
    fireEvent.keyDown(surface, { key: "ArrowLeft" });
    expect(changed.mock.calls[0][0].longitude).toBeLessThan(location.longitude);
    expect(changed.mock.calls[0][0].latitude).toBe(location.latitude);
    expect(developmentLocationAdapter.coordinatesOffset(location, changed.mock.calls[0][0]).x).toBeCloseTo(20);
    await userEvent.click(screen.getByRole("button", { name: "بازگشت به موقعیت من" }));
    await waitFor(() => expect(changed).toHaveBeenCalledTimes(2));
    expect(changed.mock.calls[1][0]).toEqual(location);
    expect(isGpsMatched(location, location)).toBe(true);
    expect(isGpsMatched({ ...location, latitude: location.latitude + 0.01 }, location)).toBe(false);
  });
  it("preserves geometry/accuracy while locating and exposes denied/unavailable/unsupported states", async () => {
    let reject!: (error: Error) => void;
    mount(<InspectionLocationMap location={location} onChange={vi.fn()} adapter={{ ...developmentLocationAdapter, locate: () => new Promise((_, fail) => { reject = fail; }) }} />);
    const button = screen.getByRole("button", { name: "بازگشت به موقعیت من" });
    await userEvent.click(button);
    expect(button).toBeDisabled();
    expect(screen.getByText("در حال یافتن موقعیت…")).toBeVisible();
    await act(async () => reject(new LocationServiceError("denied")));
    expect(await screen.findByText("دسترسی به موقعیت داده نشده است")).toBeVisible();
    expect(button).toBeEnabled();
  });
  it.each([["unavailable", "موقعیت در دسترس نیست"], ["unsupported", "موقعیت در این دستگاه پشتیبانی نمی‌شود"]] as const)("handles %s locate failures", async (code, message) => {
    mount(<InspectionLocationMap location={location} onChange={vi.fn()} adapter={{ ...developmentLocationAdapter, locate: async () => { throw new LocationServiceError(code); } }} />);
    await userEvent.click(screen.getByRole("button", { name: "بازگشت به موقعیت من" }));
    expect(await screen.findByText(message)).toBeVisible();
  });
});

describe("vehicle and Iranian plate controls", () => {
  it("renders vehicle information, masked LTR VIN and a semantic dynamic plate", () => {
    render(<><VehicleCard vehicle={vehicle} /><IranianPlate plate={vehicle.plate} /></>);
    expect(screen.getByRole("heading", { name: `${vehicle.make} ${vehicle.model}` })).toBeVisible();
    expect(screen.getByText("مدل ۲۰۲۳")).toBeVisible();
    expect(screen.getByText(vehicle.colorName)).toBeVisible();
    expect(screen.getByText(vehicle.vinMasked)).toHaveAttribute("dir", "ltr");
    expect(screen.getByRole("img", { name: "پلاک خودرو: ۴۵ ب ۷۲۳، ایران ۱۱" })).toHaveAttribute("dir", "ltr");
  });
  it("confirms the correct plate and activates correction with visible focus", async () => {
    const confirm = vi.fn();
    render(<VehicleForm vehicle={vehicle} onConfirm={confirm} />);
    expect(screen.getByRole("button", { name: "درست است" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByLabelText("دو رقم اول پلاک")).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "تأیید مشخصات و ادامه" }));
    await waitFor(() => expect(confirm).toHaveBeenCalled());
    expect(confirm.mock.calls[0][0]).toEqual({ plate: vehicle.plate });
    await userEvent.click(screen.getByRole("button", { name: "پلاک اشتباه است، اصلاح می‌کنم" }));
    expect(screen.getByLabelText("دو رقم اول پلاک")).toBeEnabled();
    expect(screen.getByLabelText("دو رقم اول پلاک")).toHaveFocus();
    expect(screen.getByRole("button", { name: "درست است" })).toHaveAttribute("aria-pressed", "false");
  });
  it("normalizes Persian/Arabic digits, filters letters from numbers and advances focus in LTR segment order", async () => {
    function Control() { const [value, setValue] = useState<PlateDraft>({ firstTwoDigits: "", letter: "ب", threeDigits: "", regionDigits: "" }); return <PlateInput value={value} onChange={setValue} />; }
    render(<Control />);
    const first = screen.getByLabelText("دو رقم اول پلاک"), letter = screen.getByLabelText("حرف پلاک"), main = screen.getByLabelText("سه رقم اصلی پلاک"), region = screen.getByLabelText("دو رقم کد ایران");
    fireEvent.change(first, { target: { value: "۴a٥" } });
    expect(first).toHaveValue("45"); expect(letter).toHaveFocus();
    await userEvent.selectOptions(letter, "ج");
    expect(letter).toHaveValue("ج");
    fireEvent.change(main, { target: { value: "۷٢۳" } });
    expect(main).toHaveValue("723"); expect(region).toHaveFocus();
    fireEvent.keyDown(region, { key: "Backspace" }); expect(main).toHaveFocus();
    expect(first.closest('[dir="ltr"]')).not.toBeNull();
    expect(first).toHaveAttribute("autocomplete", "off");
  });
  it("pastes a complete semantic plate and submits only valid corrected values", async () => {
    const confirm = vi.fn();
    render(<VehicleForm vehicle={vehicle} onConfirm={confirm} />);
    await userEvent.click(screen.getByRole("button", { name: /پلاک اشتباه/ }));
    fireEvent.paste(screen.getByLabelText("دو رقم اول پلاک"), { clipboardData: { getData: () => "۶۷ ج ۸۹۰ ایران ۲۲" } });
    expect(screen.getByLabelText("دو رقم اول پلاک")).toHaveValue("67");
    expect(screen.getByLabelText("حرف پلاک")).toHaveValue("ج");
    expect(screen.getByLabelText("سه رقم اصلی پلاک")).toHaveValue("890");
    expect(screen.getByLabelText("دو رقم کد ایران")).toHaveValue("۲۲");
    fireEvent.change(screen.getByLabelText("سه رقم اصلی پلاک"), { target: { value: "1" } });
    await userEvent.click(screen.getByRole("button", { name: "تأیید مشخصات و ادامه" }));
    expect(await screen.findByText("سه رقم اصلی پلاک را وارد کنید.")).toBeVisible();
    expect(screen.getByLabelText("سه رقم اصلی پلاک")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("سه رقم اصلی پلاک")).toHaveFocus();
    expect(confirm).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText("سه رقم اصلی پلاک"), { target: { value: "890" } });
    await userEvent.click(screen.getByRole("button", { name: "تأیید مشخصات و ادامه" }));
    await waitFor(() => expect(confirm).toHaveBeenCalled());
    expect(confirm.mock.calls[0][0]).toEqual({ plate: { firstTwoDigits: "67", letter: "ج", threeDigits: "890", regionDigits: "22" } });
  });
  it("collapses/expands alternate-format guidance and blocks unverified/pending confirmation", async () => {
    const rendered = render(<VehicleForm vehicle={vehicle} onConfirm={vi.fn()} canConfirm={false} />);
    const toggle = screen.getByRole("button", { name: "پلاک من فرمت متفاوتی دارد" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(document.getElementById(toggle.getAttribute("aria-controls")!)).toBeVisible();
    await userEvent.click(toggle); expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("button", { name: "تأیید مشخصات و ادامه" })).toBeDisabled();
    rendered.rerender(<VehicleForm vehicle={vehicle} onConfirm={vi.fn()} pending />);
    expect(screen.getByRole("button", { name: "تأیید مشخصات و ادامه" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "درست است" })).toBeDisabled();
  });
  it("records a discrepancy draft without letting its portalled submit confirm the parent vehicle form", async () => {
    const prototype = HTMLDialogElement.prototype;
    const show = Object.getOwnPropertyDescriptor(prototype, "showModal"), close = Object.getOwnPropertyDescriptor(prototype, "close");
    Object.defineProperty(prototype, "showModal", { configurable: true, value() { this.setAttribute("open", ""); } });
    Object.defineProperty(prototype, "close", { configurable: true, value() { this.removeAttribute("open"); } });
    try {
      const confirm = vi.fn();
      render(<VehicleForm vehicle={vehicle} onConfirm={confirm} />);
      await userEvent.click(screen.getByRole("button", { name: "مشخصات دیگری مغایرت دارد" }));
      await userEvent.selectOptions(screen.getByLabelText("مشخصات دارای مغایرت"), "color");
      await userEvent.type(screen.getByLabelText("توضیح مغایرت"), "رنگ بدنه سفید است");
      await userEvent.click(screen.getByRole("button", { name: "ثبت توضیح" }));
      expect(await screen.findByRole("button", { name: "توضیح مغایرت ثبت شد؛ ویرایش" })).toBeVisible();
      expect(confirm).not.toHaveBeenCalled();
      await userEvent.click(screen.getByRole("button", { name: "تأیید مشخصات و ادامه" }));
      await waitFor(() => expect(confirm).toHaveBeenCalled());
      expect(confirm.mock.calls[0][0]).toMatchObject({ discrepancy: { field: "color", description: "رنگ بدنه سفید است" } });
    } finally {
      if (show) Object.defineProperty(prototype, "showModal", show); else Reflect.deleteProperty(prototype, "showModal");
      if (close) Object.defineProperty(prototype, "close", close); else Reflect.deleteProperty(prototype, "close");
    }
  });
});

describe("Phase-03 mock repository boundary", () => {
  it("requires consent/location and validates semantic saves without mutating shared fixtures", async () => {
    const repository = createMockInspectionRepository();
    await expect(repository.saveLocation(mockInspectionId, location)).rejects.toMatchObject({ code: "CONSENT_REQUIRED" });
    await expect(repository.confirmVehicle(mockInspectionId, { plate: vehicle.plate })).rejects.toMatchObject({ code: "LOCATION_REQUIRED" });
    await repository.recordConsent(mockInspectionId, { accepted: true, termsVersion: consentTermsVersion });
    await expect(repository.saveLocation(mockInspectionId, { ...location, latitude: 100 })).rejects.toThrow();
    const saved = await repository.saveLocation(mockInspectionId, location);
    saved.buildingNumber = "changed";
    expect((await repository.getInspection(mockInspectionId)).location?.buildingNumber).toBe(location.buildingNumber);
    expect((await createMockInspectionRepository().getInspection(mockInspectionId)).location).toBeNull();
    const plate = { firstTwoDigits: "67", letter: "ج", threeDigits: "890", regionDigits: "22" } as const;
    const receipt = await repository.confirmVehicle(mockInspectionId, { plate, discrepancy: { field: "color", description: "رنگ خودرو سفید است" } });
    expect(receipt).toMatchObject({ inspectionId: mockInspectionId, plate, discrepancy: { field: "color" } });
    expect(await repository.confirmVehicle(mockInspectionId, { plate, discrepancy: { field: "color", description: "رنگ خودرو سفید است" } })).toEqual(receipt);
    receipt.plate.firstTwoDigits = "99";
    expect((await repository.getVehicle(mockInspectionId))?.plate).toEqual(plate);
    await expect(repository.confirmVehicle(mockInspectionId, { plate: { ...plate, threeDigits: "9" } })).rejects.toThrow();
    expect(parsePastedPlate("۴۵ب۷۲۳۱۱")).toEqual(vehicle.plate);
    expect(parsePastedPlate("45X72311")).toBeNull();
    expect(endpoints.inspections.location("a/b")).toBe("/api/inspections/a%2Fb/location");
    expect(endpoints.inspections.vehicle("a/b")).toBe("/api/inspections/a%2Fb/vehicle");
    expect(endpoints.inspections.plate("a/b")).toBe("/api/inspections/a%2Fb/vehicle/plate");
  });
});
