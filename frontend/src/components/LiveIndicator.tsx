export function LiveIndicator({ minute }: { minute?: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-ndembo-live/15 rounded-full">
      <span className="w-1.5 h-1.5 bg-ndembo-live rounded-full animate-pulse-live" />
      <span className="text-[10px] font-bold text-ndembo-live uppercase tracking-wide">
        {minute ? minute : 'Live'}
      </span>
    </div>
  );
}
