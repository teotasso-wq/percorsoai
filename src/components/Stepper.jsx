export default function Stepper({ current }) {
  const steps = [1, 2, 3, 4];
  return (
    <div className="mb-10">
      <div className="relative h-1 bg-navy/15 rounded-full mb-4">
        <div
          className="absolute top-0 left-0 h-1 bg-navy rounded-full transition-all duration-500"
          style={{ width: `${((current - 1) / 3) * 100}%` }}
        />
      </div>
      <div className="flex justify-between">
        {steps.map((s) => (
          <div
            key={s}
            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors ${
              s < current
                ? 'bg-navy border-navy text-paper'
                : s === current
                ? 'bg-verificato border-verificato text-paper'
                : 'bg-paper border-navy/20 text-navy/40'
            }`}
          >
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}
