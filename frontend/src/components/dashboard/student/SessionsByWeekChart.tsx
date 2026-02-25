"use client";

import { useMemo } from "react";
import { Box, Text } from "@mantine/core";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { SessionHistoryItem } from "@/lib/types";

interface SessionsByWeekChartProps {
  sessionHistory: SessionHistoryItem[];
}

function getWeekKey(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 = Sun, 1 = Mon, ...
  const daysToMonday = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - daysToMonday);
  return d.toISOString().slice(0, 10);
}

function getWeekLabel(weekKey: string): string {
  const d = new Date(weekKey);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function SessionsByWeekChart({ sessionHistory }: SessionsByWeekChartProps) {
  const chartData = useMemo(() => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const byWeek: Record<string, number> = {};

    sessionHistory.forEach((session) => {
      const dateStr = session.startTime || session.endTime || session.createdAt;
      if (!dateStr) return;
      const date = new Date(dateStr);
      if (date < startOfYear) return;
      const weekKey = getWeekKey(date);
      byWeek[weekKey] = (byWeek[weekKey] || 0) + 1;
    });

    const weeks = Object.keys(byWeek).sort();
    return weeks.map((weekKey) => ({
      week: weekKey,
      label: getWeekLabel(weekKey),
      sessions: byWeek[weekKey],
    }));
  }, [sessionHistory]);

  if (chartData.length === 0) {
    return (
      <Box py="xl" style={{ borderTop: "1px solid var(--mantine-color-gray-3)" }}>
        <Text fw={500} mb="md">Sessions by week (YTD)</Text>
        <Box h={240} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Text size="sm" c="dimmed">No session data this year yet</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box py="lg" style={{ borderTop: "1px solid var(--mantine-color-gray-3)" }}>
      <Text fw={500} mb="md">Sessions by week (YTD)</Text>
      <Box h={280}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-gray-2)" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12 }}
              stroke="var(--mantine-color-gray-6)"
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 12 }}
              stroke="var(--mantine-color-gray-6)"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--mantine-color-body)",
                border: "1px solid var(--mantine-color-gray-3)",
                borderRadius: "var(--mantine-radius-sm)",
              }}
              labelStyle={{ color: "var(--mantine-color-text)" }}
              formatter={(value: number) => [value, "Sessions"]}
              labelFormatter={(label) => `Week of ${label}`}
            />
            <Bar
              dataKey="sessions"
              fill="var(--mantine-color-blue-6)"
              radius={[4, 4, 0, 0]}
              name="Sessions"
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
