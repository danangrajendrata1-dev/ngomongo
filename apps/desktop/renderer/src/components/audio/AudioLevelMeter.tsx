type AudioLevelMeterProps = {
  level: number;
  label?: string;
};

export function AudioLevelMeter({ level, label = 'Audio level' }: AudioLevelMeterProps) {
  const bars = Array.from({ length: 10 }, (_, index) => index + 1);
  const normalizedLevel = Math.max(0, Math.min(1, level));
  const activeBars = Math.round(normalizedLevel * bars.length);

  return (
    <div className="meter">
      <div className="meter__header">
        <span className="meter__label">{label}</span>
        <span className="meter__value">{Math.round(normalizedLevel * 100)}%</span>
      </div>
      <div
        className="meter__bars"
        aria-hidden="true"
      >
        {bars.map((bar) => (
          <span
            key={bar}
            className="meter__bar"
            style={{
              opacity: bar <= activeBars ? 1 : 0.18,
              transform: `scaleY(${0.3 + (bar <= activeBars ? normalizedLevel + 0.3 : 0.15)})`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
