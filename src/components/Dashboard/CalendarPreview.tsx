'use client';
import { useState, useEffect } from 'react';

export default function CalendarPreview() {   // ✅ export default 꼭 있어야 함
  const [events, setEvents] = useState<{ date: string; title: string }[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('events');
    if (stored) setEvents(JSON.parse(stored));
  }, []);

  return (
    <div>
      <p>✅ CalendarPreview 로드됨</p>
      <ul>
        {events.length > 0 ? (
          events.map((e, i) => (
            <li key={i}>
              {e.date} — <strong>{e.title}</strong>
            </li>
          ))
        ) : (
          <li>일정이 없습니다.</li>
        )}
      </ul>
    </div>
  );
}
