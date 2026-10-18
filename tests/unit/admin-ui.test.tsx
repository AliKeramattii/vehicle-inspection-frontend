import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({ loading:false, error:false, workspace:{} as object | undefined, refresh:vi.fn() }));
vi.mock("@/features/admin/admin-context",()=>({useAdmin:()=>state}));
import { WorkspaceState } from "@/features/admin/admin-common";
beforeEach(()=>{state.loading=false;state.error=false;state.workspace={};state.refresh.mockReset();});
it("retains unsaved input across background read failures and recovery",()=>{
  const content=<input aria-label="unsaved draft" defaultValue="original" />;
  const result=render(<WorkspaceState>{content}</WorkspaceState>);
  const input=screen.getByLabelText("unsaved draft");fireEvent.change(input,{target:{value:"unsaved"}});
  state.error=true; result.rerender(<WorkspaceState>{content}</WorkspaceState>);
  expect(screen.getByLabelText("unsaved draft")).toBe(input);
  expect(input).toHaveValue("unsaved");
  fireEvent.click(screen.getByRole("button",{name:"تلاش مجدد"})); expect(state.refresh).toHaveBeenCalledOnce();
  state.error=false;result.rerender(<WorkspaceState>{content}</WorkspaceState>);expect(input).toHaveValue("unsaved");
});
it("offers recovery for initial storage failure without claiming load success",()=>{
  state.workspace=undefined;state.error=true;render(<WorkspaceState><h1>loaded</h1></WorkspaceState>);
  expect(screen.queryByText("loaded")).not.toBeInTheDocument();expect(screen.getByRole("alert")).toBeInTheDocument();
});
it("preserves loading composition with an accessible status",()=>{
  state.workspace=undefined;state.loading=true;render(<WorkspaceState><h1>loaded</h1></WorkspaceState>);
  expect(screen.getByRole("status",{name:"بارگذاری مدیریت"})).toBeInTheDocument();
});
