import { ChevronLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { c } from "../lib/theme";

export const initial = (name = "") => name.charAt(0) || "산";

export function Avatar({ profile, size = 34 }) {
  const tint = profile?.tint || c.faint;
  const name = profile?.name || "산책자";
  return (
    <div className="sp-serif" style={{
      width: size, height: size, borderRadius: "50%", background: tint,
      color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.42, flexShrink: 0, fontWeight: 700,
    }}>{initial(name)}</div>
  );
}

export function StatusChip({ status }) {
  const map = {
    진행중: [c.sage, c.sageSoft],
    예정: [c.amber, c.amberSoft],
    완료: [c.faint, "#EFECE4"],
  };
  const [fg, bg] = map[status] || [c.inkSoft, c.lineSoft];
  return (
    <span style={{
      fontSize: 12, fontWeight: 600, color: fg, background: bg,
      padding: "3px 10px", borderRadius: 999, letterSpacing: ".02em",
    }}>{status}</span>
  );
}

export function SideTag({ side }) {
  const map = { 찬성: c.agree, 반대: c.oppose, 중립: c.neutral };
  return (
    <span style={{
      fontSize: 12, fontWeight: 700, color: map[side],
      border: `1px solid ${map[side]}`, padding: "2px 8px", borderRadius: 6,
    }}>{side}</span>
  );
}

export function Label({ children }) {
  return (
    <div style={{
      fontSize: 12, letterSpacing: ".16em", color: c.amber,
      fontWeight: 700, textTransform: "uppercase", marginBottom: 10,
    }}>{children}</div>
  );
}

/* 발자국 진행 표시 — 시그니처 모티프 */
export function StepPath({ total = 10, done = 0 }) {
  return (
    <div style={{ display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap" }}>
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} style={{
          width: 10, height: 10, borderRadius: "50%",
          background: i < done ? c.amber : "transparent",
          border: `1.5px solid ${i < done ? c.amber : c.line}`,
        }} />
      ))}
      <span style={{ fontSize: 13, color: c.inkSoft, marginLeft: 4 }}>{done} / {total}</span>
    </div>
  );
}

export function TallyBar({ t }) {
  const total = (t.찬성 + t.반대 + t.중립) || 1;
  const seg = (n, color) => n > 0 && <div style={{ width: `${(n / total) * 100}%`, background: color }} />;
  return (
    <div style={{ display: "flex", height: 8, borderRadius: 999, overflow: "hidden", background: c.lineSoft }}>
      {seg(t.찬성, c.agree)}{seg(t.중립, c.neutral)}{seg(t.반대, c.oppose)}
    </div>
  );
}

export function Empty({ text }) {
  return <div style={{ textAlign: "center", color: c.faint, fontSize: 14, padding: "28px 0" }}>{text}</div>;
}

export function Loading() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "60px 0", color: c.faint }}>
      <Loader2 className="sp-spin" size={26} />
    </div>
  );
}

export function BackBar({ to, label }) {
  return (
    <Link to={to} className="sp-nav" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 14, marginBottom: 8, fontWeight: 500 }}>
      <ChevronLeft size={18} /> {label}
    </Link>
  );
}
