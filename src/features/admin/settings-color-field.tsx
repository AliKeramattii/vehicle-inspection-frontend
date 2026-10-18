"use client";
import { useWatch, type UseFormReturn } from "react-hook-form";
import { TextInput } from "@/components/ui/text-input";
import type { SiteSettings } from "@/config/site-settings.schema";
type ColorRole = keyof SiteSettings["theme"];
export function SettingsColorField({form,role,label,hint}:{form:UseFormReturn<SiteSettings>;role:ColorRole;label:string;hint:string}) {
 const name = `theme.${role}` as const;
 const value = useWatch({control:form.control,name});
 const valid = /^#[0-9a-f]{6}$/i.test(value);
 return <div className="settings-color-field"><div className="settings-color-controls"><input type="color" aria-label={label+"، انتخاب از پالت"} value={valid?value:"#000000"} disabled={!valid} onChange={event=>form.setValue(name,event.target.value.toUpperCase(),{shouldDirty:true,shouldValidate:true})}/><TextInput label={label} dir="ltr" spellCheck={false} error={form.getFieldState(name,form.formState).error?.message} {...form.register(name)}/></div><p>{hint}</p></div>;
}