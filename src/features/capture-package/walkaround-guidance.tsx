"use client";
import { WalkaroundPreview } from "./walkaround-preview";
import { NativeDialog } from "@/components/ui/native-dialog";
import { Icon } from "@/components/ui/icon";
export function WalkaroundGuidance({onDismiss}:{onDismiss:()=>void}){
 return <NativeDialog title="راهنمای ویدیوی ۳۶۰ درجه" onDismiss={onDismiss}><div className="walkaround-guide-copy">
 <WalkaroundPreview />
 <p><Icon name="walkaroundSpeed" size={22}/>آرام حرکت کنید؛ خودرو باید در کادر بماند.</p>
 <p><Icon name="walkaroundLevel" size={22}/>دوربین را تراز نگه دارید و در فضای روشن ضبط کنید.</p>
 <p>این راهنما موقعیت، سرعت یا کیفیت ویدیو را اندازه‌گیری نمی‌کند.</p>
 </div></NativeDialog>;
}
