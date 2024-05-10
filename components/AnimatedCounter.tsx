"use client";

import CountUp from "react-countup";

function AnimatedCounter({ amount }: { amount: number }) {
  return (
    <div className="w-full">
      <CountUp end={amount} prefix="₹" duration={2.75} decimals={2} />
    </div>
  );
}

export default AnimatedCounter;
