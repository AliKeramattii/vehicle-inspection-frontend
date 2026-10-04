import { ConsentBranding } from "@/features/preparation/preparation-header";
import { CollectionSummary } from "./collection-summary";
import { ConsentWorkflow } from "./consent-form";
import { PrivacyArtwork } from "./privacy-artwork";
import "@/features/preparation/preparation.css";

export function ConsentScreen() {
  return <main id="main-content" tabIndex={-1} className="preparation-screen consent-screen">
    <ConsentBranding />
    <div className="consent-intro"><h1>رضایت و حریم خصوصی</h1><p>برای ادامه بازدید، لطفاً با شرایط زیر موافقت کنید.</p></div>
    <PrivacyArtwork />
    <div className="consent-surface"><CollectionSummary /><ConsentWorkflow /></div>
  </main>;
}
