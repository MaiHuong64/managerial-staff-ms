const ICONS: Record<string, React.ReactNode> = {
    dashboard: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor"/><rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor"/><rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor"/><rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor"/></svg>,
    bell:      <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 1a5 5 0 00-5 5v3l-1 2h12l-1-2V6a5 5 0 00-5-5zM6 13a2 2 0 004 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
    user:      <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4"/><path d="M2 14c0-2.2 2.7-4 6-4s6 1.8 6 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
    users:     <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4"/><circle cx="11" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4"/><path d="M1 13c0-1.7 1.8-3 4-3s4 1.3 4 3M9 11c.6-.6 2-.9 3-.9 2.2 0 4 1.3 4 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
    check:     <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    doc:       <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 2h10a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.4"/><path d="M5 5h6M5 8h4M5 11h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
    tag:       <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 2h5l7 7-5 5-7-7V2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><circle cx="5" cy="5" r="1" fill="currentColor"/></svg>,
    building:  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 12V6l6-4 6 4v6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><rect x="5" y="8" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/></svg>,
    chart:     <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 12l3-4 3 2 3-5 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    plus:      <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4"/><path d="M8 5v6M5 8h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
};

export const NavIcon = ({ name }: { name: string }) => (
    <span style={{ color: 'currentColor', display: 'flex' }}>
        {ICONS[name] || null}
    </span>
);