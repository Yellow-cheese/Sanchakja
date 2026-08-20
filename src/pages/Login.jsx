import { useState } from "react";
import { c } from "../lib/theme";
import { signInWithEmail } from "../lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!email.trim() || busy) return;
    setBusy(true); setError("");
    try {
      await signInWithEmail(email.trim());
      setSent(true);
    } catch (e) {
      setError("메일을 보내지 못했어요. 주소를 확인하고 다시 시도해 주세요.");
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="sp-root" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div className="sp-fade" style={{ width: "100%", maxWidth: 420, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.amber, marginTop: 6 }} />
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.line, marginTop: 14 }} />
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.amber, marginTop: 6 }} />
        </div>
        <h1 className="sp-serif" style={{ fontSize: 40, fontWeight: 800, margin: "6px 0 6px", letterSpacing: "-.01em" }}>산책자들</h1>
        <p style={{ color: c.inkSoft, marginBottom: 34, fontSize: 15 }}>함께 읽고, 함께 걷고, 함께 나눕니다.</p>

        {sent ? (
          <div style={{ background: "#fff", border: `1px solid ${c.line}`, borderRadius: 16, padding: "26px 22px" }}>
            <h2 className="sp-serif" style={{ fontSize: 20, fontWeight: 700, margin: "0 0 8px" }}>메일함을 확인하세요</h2>
            <p style={{ color: c.inkSoft, fontSize: 14.5, lineHeight: 1.7, margin: 0 }}>
              <b style={{ color: c.ink }}>{email}</b> 으로 로그인 링크를 보냈어요. 링크를 누르면 바로 들어옵니다.
            </p>
            <button className="sp-link" style={{ marginTop: 18, fontSize: 13 }} onClick={() => setSent(false)}>
              다른 주소로 다시 보내기
            </button>
          </div>
        ) : (
          <div style={{ textAlign: "left" }}>
            <label style={{ fontSize: 13, color: c.inkSoft, fontWeight: 600 }}>이메일</label>
            <input
              className="sp-input"
              style={{ marginTop: 8, padding: "13px 14px", borderRadius: 12, fontSize: 15 }}
              placeholder="name@email.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
            <button
              className="sp-accent"
              style={{ width: "100%", marginTop: 12, padding: "13px", borderRadius: 12, fontSize: 15, fontWeight: 700 }}
              onClick={submit}
              disabled={busy}
            >
              {busy ? "보내는 중…" : "이메일로 계속하기"}
            </button>
            {error && <p style={{ color: c.oppose, fontSize: 13, marginTop: 10 }}>{error}</p>}
            <p style={{ fontSize: 12, color: c.faint, marginTop: 20, textAlign: "center", lineHeight: 1.6 }}>
              비밀번호는 필요 없어요. 메일로 받은 링크를 누르면 로그인됩니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
