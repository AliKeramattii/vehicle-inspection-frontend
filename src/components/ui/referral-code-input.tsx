import { SegmentedCodeInput, type SegmentedCodeInputProps } from "./segmented-code-input";
export function ReferralCodeInput(props: Omit<SegmentedCodeInputProps, "label"> & { label?: string }) {
  return <SegmentedCodeInput {...props} label={props.label ?? "کد معرفی / کد ارجاع"} length={6} />;
}
