import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import "./ProgressBar.css";

/**
 * ProgressBar
 * Adapted for CodeViz (JS + plain CSS + framer-motion). Determinate when
 * `value` is a number, indeterminate ("working") when `value` is null.
 *
 * @param {object} props
 * @param {number|null} props.value        Current progress (null = indeterminate)
 * @param {number}      [props.max=100]    Maximum value
 * @param {string}      [props.label]      Left-hand label
 * @param {string}      [props.pendingLabel]  Shown while indeterminate
 * @param {string}      [props.completeLabel] Announced when complete
 * @param {string}      [props.className]  Extra class on the root
 */
const FILL = { type: "spring", stiffness: 210, damping: 34, mass: 0.9 };
const CROSSFADE = { type: "spring", stiffness: 260, damping: 34, mass: 0.8 };
const INSTANT = { duration: 0 };

export function ProgressBar({
  value,
  max = 100,
  label = "Progress",
  pendingLabel = "Working",
  completeLabel = "Complete",
  className = "",
}) {
  const reduced = useReducedMotion();
  const labelId = useId();

  const indeterminate = value === null;
  const fraction =
    value === null || max <= 0 ? 0 : Math.min(1, Math.max(0, value / max));
  const percent = Math.round(fraction * 100);
  const complete = !indeterminate && fraction >= 1;

  const measured = indeterminate
    ? {}
    : {
        "aria-valuenow": Math.round(fraction * max * 100) / 100,
        "aria-valuetext": `${percent}%`,
      };

  return (
    <div className={`pb-root ${className}`.trim()}>
      <div className="pb-header">
        <span id={labelId} className="pb-label">
          {label}
        </span>

        <span aria-hidden className="pb-status">
          <motion.span
            className="pb-status-pending"
            initial={false}
            animate={{ opacity: indeterminate ? 1 : 0 }}
            transition={reduced ? INSTANT : CROSSFADE}
          >
            {pendingLabel}
          </motion.span>

          <motion.span
            className="pb-status-percent"
            initial={false}
            animate={{ opacity: indeterminate ? 0 : 1 }}
            transition={reduced ? INSTANT : CROSSFADE}
          >
            {percent}%
          </motion.span>
        </span>
      </div>

      <div
        role="progressbar"
        aria-labelledby={labelId}
        aria-valuemin={0}
        aria-valuemax={max}
        {...measured}
        className="pb-track"
      >
        <div className="pb-inner">
          <motion.span
            aria-hidden
            className="pb-fill"
            initial={false}
            animate={{ scaleX: indeterminate ? 0 : fraction }}
            transition={reduced ? INSTANT : FILL}
          />

          {indeterminate && !reduced ? (
            <motion.span
              aria-hidden
              className="pb-shuttle"
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: "250%", opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                x: { duration: 1.25, ease: "easeInOut", repeat: Infinity },
                opacity: { duration: 0.18 },
              }}
            />
          ) : null}
        </div>
      </div>

      <span aria-live="polite" className="pb-sr">
        {complete ? completeLabel : indeterminate ? pendingLabel : ""}
      </span>
    </div>
  );
}

export default ProgressBar;
