"use client";
import "@/features/inspection/identity.css";
import { useState, useId } from "react";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "@/features/auth/auth-workflow-provider";
import { PlateInput, type PlateDraft } from "@/components/vehicle/plate-input";
import { PrimaryButton } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/status";
import { normalizeDigits } from "@/lib/utils/persian";
import { vehicleColors } from "@/features/vehicle/vehicle-colors";
import type { Vehicle } from "@/types/domain";
import { lifecycleRepository, vehicleCorrectionSchema } from "./lifecycle-repository";
import { fieldCorrectionLabels, type VehicleCorrectionValue, type VehicleFieldCorrection } from "./lifecycle-model";
const correctionInputSchema = z.discriminatedUnion("field", [
 z.object({field:z.literal("plate"),value:z.object({firstTwoDigits:z.string(),letter:z.string(),threeDigits:z.string(),regionDigits:z.string()})}),
 z.object({field:z.literal("color"),value:z.string()}),
 z.object({field:z.literal("modelYear"),value:z.number()}),
]).pipe(vehicleCorrectionSchema);
export function VehicleCorrectionEditor({task,inspectionId,vehicle}:{task:VehicleFieldCorrection;inspectionId:string;vehicle?:Vehicle|null}) {
 const {source}=useAuthContext(), cache=useQueryClient(), id=useId(), [error,setError]=useState("");
 const defaults:VehicleCorrectionValue=task.proposal??(task.field==="plate"?{field:"plate",value:vehicle?.plate??{firstTwoDigits:"",letter:"ب",threeDigits:"",regionDigits:""}}:task.field==="color"?{field:"color",value:vehicleColors.find(c=>c.hex.toLowerCase()===vehicle?.colorHex?.toLowerCase())?.id??"white"}:{field:"modelYear",value:vehicle?.year??2023});
 const {register,control,setValue,handleSubmit,formState}=useForm<z.input<typeof correctionInputSchema>, unknown, VehicleCorrectionValue>({resolver:zodResolver(correctionInputSchema),defaultValues:defaults});
 const value=useWatch({control,name:"value"});
 const plateErrors=task.field==="plate"&&formState.errors.value?{firstTwoDigits:"پلاک صحیح را در چهار بخش وارد کنید."}:{};
 return <section className="customer-correction"><h3>{fieldCorrectionLabels[task.field]}</h3><p className="customer-reviewer-reason">{task.customerReason}</p>
 {task.state!=="requested"?<p role="status">{task.state==="approved"?"اصلاح مشخصات توسط کارشناس تأیید شد.":"اصلاح ثبت شد و در انتظار بررسی کارشناس است."}</p>:<form onSubmit={handleSubmit(async input=>{setError("");try{await lifecycleRepository.submitField(await source.resolve(),inspectionId,task.id,input);await cache.invalidateQueries({queryKey:["customer-status"]});await cache.invalidateQueries({queryKey:["review-workspace"]});}catch(e){setError(e instanceof Error?e.message:"ثبت اصلاح ممکن نشد.");}})}>
 {task.field==="plate"&&<PlateInput errors={plateErrors} value={value as PlateDraft} onChange={plate=>setValue("value",plate,{shouldDirty:true,shouldValidate:true})} disabled={formState.isSubmitting}/>}
 {task.field==="color"&&<label htmlFor={id}>رنگ صحیح بدنه<select id={id} {...register("value")} aria-describedby={id+"-error"}>{vehicleColors.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}</select></label>}
 {task.field==="modelYear"&&<label htmlFor={id}>سال ساخت صحیح<input id={id} inputMode="numeric" dir="ltr" {...register("value",{setValueAs:v=>Number(normalizeDigits(String(v)))})} aria-describedby={id+"-error"}/></label>}
 {formState.errors.value&&<p id={id+"-error"} role="alert">مقدار صحیح را وارد کنید.</p>}{error&&<InlineAlert tone="destructive">{error}</InlineAlert>}
 <PrimaryButton type="submit" loading={formState.isSubmitting}>ثبت اصلاح برای بررسی</PrimaryButton></form>}
 </section>;
}
