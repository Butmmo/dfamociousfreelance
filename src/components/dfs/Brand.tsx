import dbiLogo from "@/assets/dbi_logo.png";
import dfgCrest from "@/assets/dfg_crest.png";

export const DBI_LOGO = dbiLogo;
export const DFG_CREST = dfgCrest;

export function DbiMark({ className = "h-10 w-10" }: { className?: string }) {
  return <img src={DBI_LOGO} alt="DBI" className={className} />;
}

/** Legacy alias — kept so older imports keep working. */
export const DfsMark = DbiMark;

export function DfgMark({ className = "h-10 w-10" }: { className?: string }) {
  return <img src={DFG_CREST} alt="D'Famocious Group" className={className} />;
}

export function Motto({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display tracking-[0.3em] text-xs text-gold-deep ${className}`}>
      Fortuna Audentes Iuvat
    </span>
  );
}
