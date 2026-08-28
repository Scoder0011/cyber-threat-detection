import { useState, useEffect } from "react";

export function useCountUp(targetValue, duration = 1200) {
  const [displayValue, setDisplayValue] = useState(() => {
    // If it's a compound string like "94/100" or has commas like "17,483"
    return typeof targetValue === "number" ? 0 : targetValue;
  });

  useEffect(() => {
    // Parse numeric value and any suffix
    const str = String(targetValue);
    const numericMatch = str.match(/[\d,.]+/);

    if (!numericMatch) {
      setDisplayValue(targetValue);
      return;
    }

    const rawNumStr = numericMatch[0].replace(/,/g, "");
    const targetNum = parseFloat(rawNumStr);

    if (isNaN(targetNum)) {
      setDisplayValue(targetValue);
      return;
    }

    let startTime = null;
    let animationFrameId = null;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Smooth easeOutExpo curve
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentNum = Math.floor(targetNum * easeProgress);

      const formattedNum = str.includes(",")
        ? currentNum.toLocaleString()
        : String(currentNum);

      const replaced = str.replace(numericMatch[0], formattedNum);
      setDisplayValue(replaced);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setDisplayValue(str);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [targetValue, duration]);

  return displayValue;
}
