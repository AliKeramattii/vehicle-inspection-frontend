import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { useForm } from "react-hook-form";
import { SettingsColorField } from "@/features/admin/settings-color-field";
import type { SiteSettings } from "@/config/site-settings.schema";
function Editor(){const form=useForm<SiteSettings>({defaultValues:{theme:{primary:"#2563EB"}}});return <SettingsColorField form={form} role="primary" label="رنگ اصلی" hint="برند مشتری"/>;}
it("native picker and HEX share the registered draft field; malformed HEX cannot produce a false swatch",()=>{
 render(<Editor/>);const hex=screen.getByLabelText("رنگ اصلی",{exact:true}),picker=screen.getByLabelText("رنگ اصلی، انتخاب از پالت");
 fireEvent.change(picker,{target:{value:"#164e63"}});expect(hex).toHaveValue("#164E63");
 fireEvent.change(hex,{target:{value:"#0369A1"}});expect(picker).toHaveValue("#0369a1");
 fireEvent.change(hex,{target:{value:"invalid"}});expect(picker).toBeDisabled();expect(hex).toHaveAttribute("name","theme.primary");
});