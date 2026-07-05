import React from 'react';

interface StatCardProps {
  label: string;
  value: number;
  delta?: string;
  deltaColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, delta, deltaColor }) => (
  <div style={{
    background: 'var(--color-background-secondary)',
    borderRadius: 8,
    padding: 14,
  }}>
    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 6 }}>{label}</div>
    <div style={{ fontSize: 22, fontWeight: 500, color: 'var(--color-text-primary)' }}>{value}</div>
    {delta && (
      <div style={{ fontSize: 11, color: deltaColor ?? 'var(--color-text-success)', marginTop: 3 }}>{delta}</div>
    )}
  </div>
);

export default StatCard;
