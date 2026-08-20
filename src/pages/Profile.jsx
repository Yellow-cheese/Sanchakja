import { useEffect, useState } from "react";
import { LogOut, Pencil } from "lucide-react";
import { c } from "../lib/theme";
import { getMyPosts, updateProfile, signOut } from "../lib/api";
import { Avatar, SideTag, Label, Loading, Empty } from "../components/ui";

export default function Profile({ profile, setProfile }) {
  const [posts, setPosts] = useState(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile.name || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let on = true;
    getMyPosts(profile.id).then((p) => on && setPosts(p)).catch((e) => console.error(e));
    return () => { on = false; };
  }, [profile.id]);

  const save = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const updated = await updateProfile(profile.id, { name: name.trim() || "산책자", bio: bio.trim() });
      setProfile(updated);
      setEditing(false);
    } catch (e) {
      console.error(e);
      alert("저장하지 못했어요. 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  };

  const myRefs = posts?.reflections || [];
  const myArgs = posts?.arguments || [];

  return (
    <div className="sp-fade">
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 6 }}>
        <Avatar profile={profile} size={58} />
        <div style={{ flex: 1 }}>
          <h2 className="sp-serif" style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>{profile.name}</h2>
          <p style={{ color: c.inkSoft, fontSize: 14, margin: "4px 0 0" }}>{profile.bio || "소개가 아직 없어요."}</p>
        </div>
        <button className="sp-ghost" onClick={() => { setName(profile.name || ""); setBio(profile.bio || ""); setEditing((v) => !v); }}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 999, fontSize: 13, alignSelf: "flex-start" }}>
          <Pencil size={14} /> 편집
        </button>
      </div>

      {editing && (
        <div className="sp-fade" style={{ background: "#fff", border: `1px solid ${c.amber}`, borderRadius: 16, padding: 16, margin: "14px 0 6px" }}>
          <label style={{ fontSize: 13, color: c.inkSoft, fontWeight: 600 }}>이름</label>
          <input className="sp-input" style={{ padding: "10px 12px", borderRadius: 10, margin: "6px 0 12px", fontSize: 15 }}
            value={name} onChange={(e) => setName(e.target.value)} />
          <label style={{ fontSize: 13, color: c.inkSoft, fontWeight: 600 }}>소개</label>
          <input className="sp-input" style={{ padding: "10px 12px", borderRadius: 10, marginTop: 6, fontSize: 15 }}
            value={bio} onChange={(e) => setBio(e.target.value)} placeholder="한 줄 소개" />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
            <button className="sp-ghost" style={{ padding: "9px 16px", borderRadius: 10, fontSize: 14 }} onClick={() => setEditing(false)}>취소</button>
            <button className="sp-primary" style={{ padding: "9px 18px", borderRadius: 10, fontSize: 14, fontWeight: 600 }} onClick={save} disabled={busy}>
              {busy ? "저장 중…" : "저장"}
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 12, margin: "22px 0 30px" }}>
        {[["남긴 생각", myRefs.length], ["올린 주장", myArgs.length]].map(([k, v]) => (
          <div key={k} style={{ flex: 1, background: "#fff", border: `1px solid ${c.line}`, borderRadius: 14, padding: 16, textAlign: "center" }}>
            <div className="sp-serif" style={{ fontSize: 28, fontWeight: 800, color: c.amber }}>{v}</div>
            <div style={{ fontSize: 13, color: c.inkSoft, marginTop: 2 }}>{k}</div>
          </div>
        ))}
      </div>

      {!posts ? <Loading /> : (
        <>
          <Label>내 독후감</Label>
          <div style={{ display: "grid", gap: 12, marginBottom: 28 }}>
            {myRefs.length === 0 && <Empty text="아직 남긴 생각이 없어요." />}
            {myRefs.map((r) => (
              <div key={r.id} style={{ background: "#fff", border: `1px solid ${c.line}`, borderRadius: 14, padding: 16 }}>
                <div style={{ fontSize: 12, color: c.sage, fontWeight: 600, marginBottom: 4 }}>{r.book?.title}</div>
                {r.title && <div className="sp-serif" style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{r.title}</div>}
                {r.key_sentence && <div className="sp-serif" style={{ fontWeight: 700, fontSize: 14.5, color: c.ink, marginBottom: 6 }}>“{r.key_sentence}”</div>}
                <p style={{ fontSize: 14, color: c.inkSoft, lineHeight: 1.7, margin: 0 }}>{r.body}</p>
              </div>
            ))}
          </div>

          <Label>내 주장</Label>
          <div style={{ display: "grid", gap: 12, marginBottom: 30 }}>
            {myArgs.length === 0 && <Empty text="아직 올린 주장이 없어요." />}
            {myArgs.map((a) => (
              <div key={a.id} style={{ background: "#fff", border: `1px solid ${c.line}`, borderRadius: 14, padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
                  <div style={{ fontSize: 12, color: c.plum, fontWeight: 600 }}>{a.topic?.title}</div>
                  <SideTag side={a.side} />
                </div>
                {a.key_sentence && <div className="sp-serif" style={{ fontWeight: 700, fontSize: 14.5, color: c.ink, marginBottom: 6 }}>“{a.key_sentence}”</div>}
                <p style={{ fontSize: 14, color: c.inkSoft, lineHeight: 1.7, margin: 0 }}>{a.body}</p>
              </div>
            ))}
          </div>
        </>
      )}

      <button className="sp-ghost" onClick={signOut}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "12px", borderRadius: 12, fontSize: 14, color: c.inkSoft }}>
        <LogOut size={16} /> 로그아웃
      </button>
    </div>
  );
}
