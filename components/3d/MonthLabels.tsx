"use client";

import { Text } from "@react-three/drei";

type Props = {
  weeks: { days: { date: string }[] }[];
  offsetX: number;
  cell: number;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function MonthLabels({ weeks, offsetX, cell }: Props) {
  // Determine first week of each month
  const labels: { month: string; x: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((w, wi) => {
    const first = w.days[0];
    if (!first) return;
    const d = new Date(first.date + "T00:00:00");
    const m = d.getMonth();
    if (m !== lastMonth) {
      // only add if this week actually contains the 1st or first occurrence
      const hasFirst = w.days.some((day) => new Date(day.date + "T00:00:00").getDate() <= 7);
      if (hasFirst || labels.length === 0) {
        labels.push({ month: MONTHS[m], x: offsetX + wi * cell + cell / 2 });
        lastMonth = m;
      }
    }
  });

  return (
    <group position={[0, 0.08, -5.2]}>
      {labels.map((l) => (
        <Text
          key={l.month + l.x}
          position={[l.x, 0, 0]}
          fontSize={0.42}
          color="#3d6b4e"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#05080b"
        >
          {l.month}
        </Text>
      ))}
      {/* subtle holographic line under labels */}
      <mesh position={[0, -0.22, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[weeks.length * cell, 0.04]} />
        <meshBasicMaterial color="#1a3d24" transparent opacity={0.18} />
      </mesh>
    </group>
  );
}
