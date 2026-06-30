import dfsLogo from "@/assets/dfs_logo.png.asset.json";
import dfgCrest from "@/assets/dfg_crest.png.asset.json";

export const DFS_LOGO = dfsLogo.url;
export const DFG_CREST = dfgCrest.url;

export function DfsMark({ className = "h-10 w-10" }: { className?: string }) {
  return <img src={DFS_LOGO} alt="DFS" className={className} />;
}

export function DfgMark({ className = "h-10 w-10" }: { className?: string }) {
  return <img src={DFG_CREST} alt="D'Famocious Group" className={className} />;
}

export function Motto({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display tracking-[0.3em] uppercase text-xs text-gold-deep ${className}`}>
      Fortuna Audentes Iuvat
    </span>
  );
}
