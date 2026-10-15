import {afterEach,describe,it,expect,vi} from "vitest";
import {act,render,screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {readFileSync} from "node:fs";
import {AdminThemeScope,AdminThemeControl,setAdminTheme,readAdminTheme} from "@/features/admin/admin-theme";
import {ApplicationLogo} from "@/components/layout/application-logo";
import {filterReviewCases,reviewCounts,evidenceDecision} from "@/features/review-operations/review-presentation";
import type {ReviewCase} from "@/features/review-operations/model";
import type {UploadJob} from "@/features/upload/upload-model";
import {inspectionPhotographyTemplate as template} from "@/features/photography/inspection-template";
const makeCase=():ReviewCase=>({template,id:"case",reference:"BDI-8F31K2",submittedAt:"2026-10-15T00:00:00Z",status:"in-review",decisions:[],summary:{inspection:{vehicle:{make:"کیا",model:"اسپورتیج",plate:{firstTwoDigits:"45",letter:"ب",threeDigits:"723",regionDigits:"11"}}},jobs:[{id:"photo",current:true,requirementId:"front-plate",evidenceKind:"photo",revision:"r2"},{id:"video",current:true,evidenceKind:"video-360",revision:"v1"}]} as ReviewCase["summary"]} as ReviewCase);
afterEach(()=>{vi.restoreAllMocks();vi.unstubAllGlobals();localStorage.clear();});
describe("premium operations presentation",()=>{
 it("retains the approved logo bytes, colors and accessible identity",()=>{
  expect(readFileSync("public/brand/application-logo.svg")).toEqual(readFileSync("references/ui/ui-ux-refinement/vehicle-inspection-logo.svg"));
  const {container}=render(<ApplicationLogo/>);expect(screen.getByRole("img",{name:"سامانه بازدید خودرو"})).toBeVisible();expect(container.querySelector("img")).toHaveAttribute("src","/brand/application-logo.svg");expect(container.querySelector("img")).toHaveAttribute("alt","");
 });
 it("counts only current revisions and separates unreviewed, approved and rejected evidence",()=>{
  const record=makeCase();record.summary.jobs.push({id:"obsolete",current:false,requirementId:"front-plate",revision:"r1"} as UploadJob);
  record.decisions.push({id:"old",requirementId:"front-plate",revision:"r1",decision:"approved"} as ReviewCase["decisions"][number]);
  expect(reviewCounts(record)).toEqual({total:2,remaining:2,approved:0,attention:0});expect(evidenceDecision(record,record.summary.jobs[0])).toBeUndefined();
  record.decisions.push({id:"new",requirementId:"front-plate",revision:"r2",decision:"rejected",reason:"پلاک خوانا نیست."} as ReviewCase["decisions"][number]);
  record.decisions.push({id:"vid",requirementId:"video-360",revision:"v1",decision:"approved"} as ReviewCase["decisions"][number]);
  expect(reviewCounts(record)).toEqual({total:2,remaining:0,approved:1,attention:1});expect(evidenceDecision(record,record.summary.jobs[0])?.reason).toBe("پلاک خوانا نیست.");
 });
 it("searches reference/model/plate with Persian and Arabic digit normalization and combines status filters",()=>{
  const records=[makeCase()];expect(filterReviewCases(records,"BDI-8f31k2","all")).toHaveLength(1);expect(filterReviewCases(records,"۷۲۳","in-review")).toHaveLength(1);expect(filterReviewCases(records,"٧٢٣","in-review")).toHaveLength(1);expect(filterReviewCases(records,"كيا","all")).toHaveLength(1);expect(filterReviewCases(records,"","needs-more-evidence")).toHaveLength(0);
 });
 it("never treats binary upload as a reviewer decision",()=>{const record=makeCase();record.summary.jobs[0].upload="uploaded";record.summary.jobs[0].verification="verified";expect(reviewCounts(record).approved).toBe(0);});
});
describe("animated operations theme preference",()=>{
 function media(){const target=new EventTarget();let dark=false;const mql=Object.assign(target,{get matches(){return dark;},media:"(prefers-color-scheme: dark)"});Object.defineProperty(mql,"matches",{get:()=>dark});vi.stubGlobal("matchMedia",()=>mql);return {mql,change:(value:boolean)=>{dark=value;mql.dispatchEvent(new Event("change"));}};}
 it("supports keyboard toggle, explicit preference, system changes and persisted state",async()=>{
  const os=media(),user=userEvent.setup();render(<AdminThemeScope><AdminThemeControl/></AdminThemeScope>);
  const toggle=screen.getByRole("switch",{name:"پوسته تیره"});expect(toggle).not.toBeChecked();toggle.focus();await user.keyboard(" ");expect(toggle).toBeChecked();expect(readAdminTheme()).toBe("dark");
  await user.click(screen.getByRole("button",{name:"استفاده از پوسته دستگاه"}));expect(readAdminTheme()).toBe("system");expect(toggle).not.toBeChecked();act(()=>os.change(true));expect(toggle).toBeChecked();expect(screen.getByRole("button",{name:"استفاده از پوسته دستگاه"})).toHaveAttribute("aria-pressed","true");
  await user.click(toggle);expect(readAdminTheme()).toBe("light");expect(toggle).not.toBeChecked();
 });
 it("keeps the control usable and reports when browser storage rejects persistence",async()=>{
  media();const user=userEvent.setup();render(<AdminThemeScope><AdminThemeControl/></AdminThemeScope>);const write=vi.spyOn(Storage.prototype,"setItem").mockImplementation(()=>{throw new DOMException("blocked");});await user.click(screen.getByRole("switch",{name:"پوسته تیره"}));expect(screen.getByRole("switch")).toBeChecked();expect(screen.getByRole("status")).toHaveTextContent("ذخیره پوسته ممکن نشد");write.mockRestore();act(()=>{setAdminTheme("system");});
 });
});
