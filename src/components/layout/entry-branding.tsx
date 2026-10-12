import { CoBranding } from "./co-branding";
export function EntryBranding({verification=false}:{verification?:boolean}) {
 return <header className="entry-branding" data-verification={verification}><CoBranding/></header>;
}
