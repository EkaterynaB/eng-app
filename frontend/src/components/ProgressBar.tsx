interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percent = total === 0 ? 0 : Math.round((current / total) * 100);

  return (
    <div className="progress">
      <div className="progress-label">
        {Math.min(current, total)} / {total}
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
