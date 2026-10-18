export const vehicleColors = [
{id:"white",label:"سفید",hex:"#F1F5F9"},{id:"black",label:"مشکی",hex:"#18181B"},
{id:"silver",label:"نقره‌ای",hex:"#C0C4CA"},{id:"grey",label:"خاکستری",hex:"#9CA3AF"},
{id:"charcoal",label:"نوک‌مدادی",hex:"#4B5563"},{id:"blue",label:"آبی",hex:"#2563EB"},
{id:"red",label:"قرمز",hex:"#B91C1C"},{id:"green",label:"سبز",hex:"#166534"},
{id:"beige",label:"بژ",hex:"#D9C5A2"},{id:"brown",label:"قهوه‌ای",hex:"#785548"},
] as const;
export type VehicleColorId=typeof vehicleColors[number]["id"];
