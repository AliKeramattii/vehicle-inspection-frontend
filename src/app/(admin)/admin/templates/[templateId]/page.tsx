import { TemplateEditor } from "@/features/admin/template-editor";
export const metadata = { title: "ویرایش قالب بازدید | مدیریت" };
export default async function Page({ params }: { params: Promise<{ templateId: string }> }) { const { templateId } = await params; return <TemplateEditor templateId={templateId} />; }
