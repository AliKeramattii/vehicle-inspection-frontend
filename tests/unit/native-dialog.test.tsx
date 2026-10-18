import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { NativeDialog } from "@/components/ui/native-dialog";
afterEach(()=>vi.restoreAllMocks());
it("skips hidden fields, exposes an SVG close control and restores the initiating control",()=>{
  Object.defineProperty(HTMLDialogElement.prototype,"showModal",{configurable:true,value:function(this:HTMLDialogElement){this.setAttribute("open","");}});
  Object.defineProperty(HTMLDialogElement.prototype,"close",{configurable:true,value:function(this:HTMLDialogElement){this.removeAttribute("open");}});
  const trigger=document.createElement("button");document.body.append(trigger);trigger.focus();
  const dismiss=vi.fn();const view=render(<NativeDialog title="ویرایش" onDismiss={dismiss}><input type="hidden"/><label>نام<input aria-label="نام"/></label></NativeDialog>);
  expect(screen.getByLabelText("نام")).toHaveFocus();
  const close=screen.getByRole("button",{name:"بستن"});expect(close.querySelector("svg")).not.toBeNull();fireEvent.click(close);expect(dismiss).toHaveBeenCalledOnce();
  view.unmount();expect(trigger).toHaveFocus();trigger.remove();
});
