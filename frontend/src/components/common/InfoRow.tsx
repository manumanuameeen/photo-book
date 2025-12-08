import type { LucideIcon } from "lucide-react";

export interface IInfoRowProps{
    Icon:LucideIcon;
    label:string;
    value:string | number;
}


export function InfoRow({  Icon, label, value }:IInfoRowProps) {
  return (
    <div className="flex items-center gap-3 py-2">
      <Icon className="text-yellow-400" size={18} />
      <div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-lg text-emerald-950 font-semibold">{value}</p>
      </div>
    </div>
  );
}
