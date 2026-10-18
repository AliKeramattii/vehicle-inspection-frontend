"use client";
import { useState } from "react";
import type { PhotographyTemplate } from "@/schemas/photography";
import { GuideImage, persian } from "./admin-common";
import { sectionLabels } from "./model";
import { Icon } from "@/components/ui/icon";
export function RequirementTable({ snapshot, selected, onSelect, onMove, editable }: {
  snapshot: PhotographyTemplate; selected: string; onSelect: (id: string) => void;
  onMove: (id: string, direction: -1 | 1) => void; editable: boolean;
}) {
  const [search, setSearch] = useState("");
  const rows = snapshot.sections.flatMap(s => s.photoRequirements.map((requirement,i) => ({ requirement, section: s.id, index: i, length: s.photoRequirements.length })))
    .filter(({ requirement }) => requirement.title.includes(search) || requirement.id.includes(search));
  return <section className="admin-requirement-list" aria-label="فهرست نیازمندی‌ها">
    <div className="admin-list-toolbar"><label className="sr-only" htmlFor="requirement-search">جست‌وجوی نیازمندی</label><input id="requirement-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="جست‌وجوی شناسه یا عنوان..." /><span>{persian(rows.length)} تصویر</span></div>
    <div className="admin-table-wrap"><table><caption className="sr-only">نیازمندی‌های عکاسی</caption><thead><tr><th>شناسه</th><th>عنوان</th><th>بخش</th><th>اجباری</th><th>راهنما</th><th>ترتیب</th></tr></thead><tbody>
      {rows.map(({ requirement: r, section, index, length }) => <tr key={r.id} data-selected={selected === r.id}>
        <td><bdi className="admin-technical">{r.id}</bdi></td>
        <td><button type="button" className="admin-row-select" aria-label={"ویرایش " + r.title} aria-pressed={selected === r.id} onClick={() => onSelect(r.id)}><GuideImage key={r.sampleImage} src={r.sampleImage} title="" sizes="42px" /><span>{r.title || "بدون عنوان"}</span></button></td>
        <td>{sectionLabels[section]}</td><td><span className={r.required ? "admin-required" : "admin-optional"}>{r.required ? "بله" : "خیر"}</span></td>
        <td><span className="admin-guidance-state"><Icon name="document" size={15} />{persian(r.instructions.filter(s => s.trim()).length)} دستور</span></td>
        <td><div className="admin-order-actions"><button type="button" disabled={!editable || index === 0} aria-label={"انتقال " + r.title + " به بالا"} onClick={() => onMove(r.id,-1)}><Icon name="down" size={17} className="rotate-180" /></button>
          <button type="button" disabled={!editable || index === length - 1} aria-label={"انتقال " + r.title + " به پایین"} onClick={() => onMove(r.id,1)}><Icon name="down" size={17} /></button></div></td>
      </tr>)}
    </tbody></table></div>{!rows.length && <p className="admin-empty">نیازمندی پیدا نشد.</p>}
    <div className="admin-template-package"><strong>الزامات مستقل بازدید</strong><p>کیلومتر دستی <span>متصل به تصویر کیلومترشمار</span></p><p>ویدیوی ۳۶۰ درجه <span>یک ویدیوی الزامی؛ خارج از شمارش تصاویر</span></p></div>
  </section>;
}
