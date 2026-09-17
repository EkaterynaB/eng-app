import { diffWords } from "diff";

interface DiffViewProps {
  expected: string;
  actual: string;
}

export function DiffView({ expected, actual }: DiffViewProps) {
  const parts = diffWords(actual, expected);

  return (
    <p className="diff-view">
      {parts.map((part, index) => {
        const key = `${index}-${part.value}`;
        if (part.added) {
          return (
            <span key={key} className="diff-missing">
              {part.value}
            </span>
          );
        }
        if (part.removed) {
          return (
            <span key={key} className="diff-extra">
              {part.value}
            </span>
          );
        }
        return <span key={key}>{part.value}</span>;
      })}
    </p>
  );
}
