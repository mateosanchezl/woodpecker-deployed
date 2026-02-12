import * as React from 'react';

interface DailySummaryProps {
  date: string;
  puzzlesCompleted: number;
  newUsers: number;
}

export function DailySummary({
  date,
  puzzlesCompleted,
  newUsers,
}: DailySummaryProps) {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px' }}>
      <h1 style={{ color: '#333' }}>Peck – Daily Summary</h1>
      <p style={{ color: '#666', marginBottom: '24px' }}>Summary for {date}</p>
      <ul style={{ lineHeight: '2' }}>
        <li>
          <strong>Puzzles completed:</strong> {puzzlesCompleted.toLocaleString()}
        </li>
        <li>
          <strong>New users:</strong> {newUsers.toLocaleString()}
        </li>
      </ul>
      <p style={{ color: '#888', fontSize: '14px', marginTop: '24px' }}>
        This is an automated daily report from your Peck cron job.
      </p>
    </div>
  );
}
