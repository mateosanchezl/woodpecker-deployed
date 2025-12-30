import * as React from 'react';

interface NewUserNotificationProps {
  userEmail: string;
  userName: string | null;
  createdAt: string;
}

export function NewUserNotification({
  userEmail,
  userName,
  createdAt,
}: NewUserNotificationProps) {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px' }}>
      <h1 style={{ color: '#333' }}>New User Signup</h1>
      <p>A new user has signed up for Peck:</p>
      <ul style={{ lineHeight: '1.8' }}>
        <li>
          <strong>Email:</strong> {userEmail}
        </li>
        <li>
          <strong>Name:</strong> {userName || 'Not provided'}
        </li>
        <li>
          <strong>Signed up at:</strong> {createdAt}
        </li>
      </ul>
    </div>
  );
}
