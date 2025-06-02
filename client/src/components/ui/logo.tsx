export function InvestmeLogo({ className = "h-8" }: { className?: string }) {
  return (
    <div className={`${className} flex items-center`}>
      <div className="bg-indigo-600 text-white px-3 py-1 rounded-md font-bold text-xl">
        Invest
        <span className="inline-block transform scale-x-[-1]">↪</span>
        me
      </div>
    </div>
  );
}