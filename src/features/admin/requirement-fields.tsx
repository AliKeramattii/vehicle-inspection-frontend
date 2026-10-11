"use client";
import type { UseFormReturn } from "react-hook-form";
import type { PhotographyTemplate, InspectionSectionId } from "@/schemas/photography";
import { Checkbox } from "@/components/ui/checkbox";
import { TextInput } from "@/components/ui/text-input";
import { GuideImage } from "./admin-common";
import { canonicalAssets, sectionLabels } from "./model";
export function RequirementFields({ form, snapshot, requirementId, editable }: {
  form: UseFormReturn<PhotographyTemplate>; snapshot: PhotographyTemplate; requirementId: string; editable: boolean;
}) {
  const si = snapshot.sections.findIndex(s => s.photoRequirements.some(r => r.id === requirementId));
  const pi = snapshot.sections[si]?.photoRequirements.findIndex(r => r.id === requirementId) ?? -1;
  const requirement = snapshot.sections[si]?.photoRequirements[pi];
  if (!requirement) return <p>نیازمندی را از فهرست انتخاب کنید.</p>;
  const prefix = `sections.${si}.photoRequirements.${pi}` as const;
  const error = form.formState.errors.sections?.[si]?.photoRequirements?.[pi];
  function changeSection(target: InspectionSectionId) {
    if (target === snapshot.sections[si].id) return;
    const next = structuredClone(snapshot.sections);
    next[si].photoRequirements.splice(pi, 1);
    next.find(s => s.id === target)!.photoRequirements.push(requirement);
    form.setValue("sections", next, { shouldDirty: true });
  }
  return <aside className="admin-requirement-editor" aria-label="ویرایش نیازمندی عکس">
    <h2>ویرایش نیازمندی عکاسی</h2>
    <div className="admin-requirement-identity"><GuideImage key={requirement.sampleImage} src={requirement.sampleImage} title="" sizes="74px" /><div><bdi className="admin-technical">{requirement.id}</bdi><strong>{requirement.title || "بدون عنوان"}</strong></div></div>
    <fieldset disabled={!editable}>
      <div className="admin-two-fields"><TextInput label="عنوان تصویر" {...form.register(`${prefix}.title`)} error={error?.title ? "عنوان تصویر را وارد کنید." : undefined} />
        <label>بخش تصویر<select aria-label="بخش تصویر" value={snapshot.sections[si].id} onChange={e => changeSection(e.target.value as InspectionSectionId)}>{snapshot.sections.map(s => <option key={s.id} value={s.id}>{sectionLabels[s.id]}</option>)}</select></label></div>
      <label>دستورالعمل عکاسی <small>هر دستور در یک خط</small><textarea rows={3} value={requirement.instructions.join("\n")} onChange={e => form.setValue(`${prefix}.instructions`, e.target.value.split("\n"), { shouldDirty: true })} aria-invalid={!!error?.instructions} aria-describedby={error?.instructions ? "admin-guidance-error" : undefined} /></label>
      {error?.instructions && <p id="admin-guidance-error" className="admin-field-error">حداقل یک دستور کامل و خوانا وارد کنید.</p>}
      <Checkbox label="این تصویر الزامی است" {...form.register(`${prefix}.required`)} disabled={!editable || requirement.id === "odometer-on"} />
      <div className="admin-three-fields"><TextInput label="فاصله از خودرو" {...form.register(`${prefix}.distance`)} />
        <TextInput label="ارتفاع گوشی" {...form.register(`${prefix}.height`)} />
        <label>جهت تصویر<select aria-label="جهت تصویر" {...form.register(`${prefix}.orientation`)}><option value="landscape">افقی</option><option value="portrait">عمودی</option></select></label></div>
    </fieldset>
    <div className="admin-large-guide"><GuideImage key={requirement.sampleImage} src={requirement.sampleImage} title={"تصویر مرجع " + requirement.title} /></div>
    <details className="admin-advanced-fields" open={error?.description ? true : undefined}><summary>توضیح کوتاه و تصویر مرجع</summary><fieldset disabled={!editable}>
      <label>توضیح کوتاه<textarea rows={2} {...form.register(`${prefix}.description`)} aria-invalid={!!error?.description} /></label>
      <label>تصویر مرجع<select aria-label="تصویر مرجع" value={requirement.sampleImage} onChange={e => form.setValue(`${prefix}.sampleImage`, e.target.value, { shouldDirty: true })}>{canonicalAssets.map(asset => <option key={asset} value={asset}>{asset.split("/").at(-1)}</option>)}</select></label>
    </fieldset></details>
    <p className="admin-footnote">نمای دوبعدی مرتبط: {sectionLabels[snapshot.sections[si].id]}. شناسه مارکر از پیکربندی فعلی خوانده می‌شود.</p>
  </aside>;
}
