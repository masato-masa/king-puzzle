// ヘッダーの丸ボタンのアイコン。ほかのゲーム（cat-maze の icons.ts）と同じ形・同じ太さ。

function Round({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9.4" fill="var(--accent)" />
      {children}
    </svg>
  );
}

export function BackIcon() {
  return (
    <Round>
      <path d="M13.6 7.8 L9.4 12 l4.2 4.2" fill="none" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
    </Round>
  );
}

export function HelpIcon() {
  return (
    <Round>
      <path d="M9.5 9.3 a2.6 2.6 0 1 1 3.2 2.9 v1.5" fill="none" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" />
      <circle cx="12.6" cy="16.6" r="1.25" fill="#fff" />
    </Round>
  );
}

export function GearIcon() {
  return (
    <Round>
      <path
        fill="#fff"
        d="M10.65 7.29 L10.86 5.19 A6.9 6.9 0 0 1 13.14 5.19 L13.35 7.29 A4.9 4.9 0 0 1 14.38 7.71 L16.01 6.38 A6.9 6.9 0 0 1 17.62 7.99 L16.29 9.62 A4.9 4.9 0 0 1 16.71 10.65 L18.81 10.86 A6.9 6.9 0 0 1 18.81 13.14 L16.71 13.35 A4.9 4.9 0 0 1 16.29 14.38 L17.62 16.01 A6.9 6.9 0 0 1 16.01 17.62 L14.38 16.29 A4.9 4.9 0 0 1 13.35 16.71 L13.14 18.81 A6.9 6.9 0 0 1 10.86 18.81 L10.65 16.71 A4.9 4.9 0 0 1 9.62 16.29 L7.99 17.62 A6.9 6.9 0 0 1 6.38 16.01 L7.71 14.38 A4.9 4.9 0 0 1 7.29 13.35 L5.19 13.14 A6.9 6.9 0 0 1 5.19 10.86 L7.29 10.65 A4.9 4.9 0 0 1 7.71 9.62 L6.38 7.99 A6.9 6.9 0 0 1 7.99 6.38 L9.62 7.71 A4.9 4.9 0 0 1 10.65 7.29 Z"
      />
      <circle cx="12" cy="12" r="2.1" fill="var(--accent)" />
    </Round>
  );
}
