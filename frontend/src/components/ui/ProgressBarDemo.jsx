import { useEffect, useState } from "react";
import { ProgressBar } from "./ProgressBar";

/**
 * Demo: cycles indeterminate -> filling -> complete -> reset.
 * Import anywhere, e.g. <ProgressBarDemo /> on a page, to preview.
 */
export default function ProgressBarDemo() {
  const [value, setValue] = useState(null);

  useEffect(() => {
    if (value === null) {
      const id = setTimeout(() => setValue(8), 1300);
      return () => clearTimeout(id);
    }
    if (value < 100) {
      const id = setTimeout(() => setValue(Math.min(100, value + 14)), 520);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => setValue(null), 1800);
    return () => clearTimeout(id);
  }, [value]);

  return (
    <div style={{ margin: "0 auto", width: "100%", maxWidth: "360px" }}>
      <ProgressBar
        value={value}
        label="roadmap.pdf"
        pendingLabel="Sizing"
        completeLabel="Upload complete"
      />
    </div>
  );
}
