import { ScanLine, Ruler, RotateCw, Power, Sun, Armchair, Wrench, TextSearch, Focus, Car, type LucideIcon } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import type { PhotoRequirement } from "@/schemas/photography";
type Topic=NonNullable<PhotoRequirement["guidanceTopics"]>[number];
const icons:Partial<Record<Topic,LucideIcon>>={frame:ScanLine,distance:Ruler,angle:RotateCw,ignition:Power,glare:Sun,interior:Armchair,hood:Wrench,text:TextSearch,focus:Focus,roof:Car};
export function GuidanceIcon({topic}:{topic:Topic}) {const Glyph=icons[topic];return Glyph?<Glyph size={24} strokeWidth={1.8} aria-hidden="true"/>:<Icon name="stability" size={24}/>;}
