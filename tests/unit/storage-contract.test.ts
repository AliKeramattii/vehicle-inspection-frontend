import {it,expect} from "vitest";
import {inspectionFolder,evidenceRelativePath,assertUniqueEvidencePaths,evidenceMetadataColumns} from "@/lib/storage/inspection-storage-contract";
it("creates separate inspection-owned folders and revision paths",()=>{
  expect(inspectionFolder("BDI-8F31K2")).toBe("INSPECTION_BDI-8F31K2");
  const input={inspectionId:"BDI-8F31K2",evidenceId:"EV-001",revision:1,extension:"webp" as const};
  expect(evidenceRelativePath(input)).toBe("INSPECTION_BDI-8F31K2/EV-001-rev-1.webp");
  expect(evidenceRelativePath({...input,inspectionId:"BDI-9A72B1"})).not.toBe(evidenceRelativePath(input));
  expect(evidenceRelativePath({...input,revision:2})).not.toBe(evidenceRelativePath(input));
});
it.each(["../private","BDI/x","BDI\\x","%2e%2e","", "/root","a:b","a b"])("rejects invalid or traversal identifiers %s",id=>{expect(()=>inspectionFolder(id)).toThrow();expect(()=>evidenceRelativePath({inspectionId:"BDI-1",evidenceId:id,revision:1,extension:"webp"})).toThrow();});
it("rejects duplicate names, invalid revisions and unsupported extensions",()=>{expect(()=>assertUniqueEvidencePaths(["one","one"])).toThrow();expect(()=>evidenceRelativePath({inspectionId:"BDI-1",evidenceId:"EV-1",revision:0,extension:"webp"})).toThrow();expect(()=>evidenceRelativePath({inspectionId:"BDI-1",evidenceId:"EV-1",revision:1,extension:"exe" as "webp"})).toThrow();});
it("specifies metadata only, without binary or customer path fields",()=>{expect(evidenceMetadataColumns).toContain("RelativeFilePath");expect(evidenceMetadataColumns.some(name=>/blob|binary|filestream|customer/i.test(name))).toBe(false);});
