import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PenLine, Calendar, Clock, Plus, Quote } from "lucide-react";
import { c } from "../lib/theme";
import { listBooks, getBook, addReflection, formatDate } from "../lib/api";
import { Avatar, StatusChip, StepPath, Label, Loading, Empty, BackBar } from "../components/ui";

/* ------------------------- 서재 목록 ------------------------- */
export function ReadingList() {
  const [books, setBooks] = useState(null);
  const [err, setErr] = useState(false);
  const [filter, setFilter] = useState("전체");
  const filters = ["전체", "진행중", "예정", "완료"];

  useEffect(() => {
    let on = true;
    listBooks().then((b) => on && setBooks(b)).catch((e) => { console.error(e); on && setErr(true); });
    return () => { on = false; };
  }, []);

  if (err) return <Empty text="불러오지 못했어요. 잠시 후 새로고침해 주세요." />;
  if (!books) return <Loading />;
  const shown = filter === "전체" ? books : books.filter((b) => b.status === filter);

  return (
    <div className="sp-fade">
      <Label>독서토론</Label>
      <h2 className="sp-serif" style={{ fontSize: 26, fontWeight: 800, margin: "0 0 6px" }}>서재</h2>
      <p style={{ color: c.inkSoft, fontSize: 14, marginBottom: 20 }}>함께 읽은 책과 읽어갈 책, 그리고 남긴 생각들.</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {filters.map((f) => (
          <button key={f} className="sp-chip" onClick={() => setFilter(f)}
            style={{
              fontSize: 13, fontWeight: 600, padding: "7px 14px", borderRadius: 999,
              border: `1px solid ${filter === f ? c.ink : c.line}`,
              background: filter === f ? c.ink : "transparent",
              color: filter === f ? "#fff" : c.inkSoft,
            }}>{f}</button>
        ))}
      </div>

      {shown.length === 0 ? <Empty text="이 분류에는 아직 책이 없어요." /> : (
        <div style={{ display: "grid", gap: 14 }}>
          {shown.map((b) => (
            <Link key={b.id} to={`/reading/${b.id}`} className="sp-card"
              style={{ borderRadius: 16, padding: 16, display: "flex", gap: 16 }}>
              <div style={{ width: 60, height: 84, borderRadius: 8, background: b.spine, flexShrink: 0, position: "relative", boxShadow: "inset -6px 0 0 rgba(0,0,0,.12)" }}>
                <div className="sp-serif" style={{ position: "absolute", inset: 0, color: "#fff", fontSize: 11, padding: 8, fontWeight: 700, lineHeight: 1.3, opacity: .95 }}>{b.title}</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <h3 className="sp-serif" style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{b.title}</h3>
                  <StatusChip status={b.status} />
                </div>
                <div style={{ fontSize: 13, color: c.inkSoft, marginTop: 2 }}>{b.author}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 12, fontSize: 13, color: c.faint }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }}><PenLine size={14} /> 생각 {b.reflectionCount}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Calendar size={14} /> {(b.meeting || "").split(" · ")[0]}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------- 책 상세 ------------------------- */
export function BookDetail({ profile }) {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [err, setErr] = useState(false);
  const [writing, setWriting] = useState(false);
  const [title, setTitle] = useState("");
  const [keyLine, setKeyLine] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let on = true;
    setBook(null); setErr(false);
    getBook(id).then((b) => on && setBook(b)).catch((e) => { console.error(e); on && setErr(true); });
    return () => { on = false; };
  }, [id]);

  const submit = async () => {
    if (!body.trim() || busy) return;
    setBusy(true);
    try {
      const created = await addReflection({
        book_id: book.id, author_id: profile.id,
        title: title.trim() || "제목 없는 생각",
        key_sentence: keyLine.trim(), body: body.trim(), quote: "",
      });
      setBook({ ...book, reflections: [created, ...book.reflections] });
      setTitle(""); setKeyLine(""); setBody(""); setWriting(false);
    } catch (e) {
      console.error(e);
      alert("생각을 남기지 못했어요. 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  };

  if (err) return (<div><BackBar to="/reading" label="서재" /><Empty text="이 책을 찾지 못했어요." /></div>);
  if (!book) return (<div><BackBar to="/reading" label="서재" /><Loading /></div>);

  return (
    <div className="sp-fade">
      <BackBar to="/reading" label="서재" />
      <div style={{ display: "flex", gap: 18, marginTop: 8 }}>
        <div style={{ width: 84, height: 118, borderRadius: 10, background: book.spine, flexShrink: 0, boxShadow: "inset -8px 0 0 rgba(0,0,0,.12)" }}>
          <div className="sp-serif" style={{ color: "#fff", fontSize: 13, padding: 12, fontWeight: 700, lineHeight: 1.35 }}>{book.title}</div>
        </div>
        <div style={{ flex: 1 }}>
          <StatusChip status={book.status} />
          <h2 className="sp-serif" style={{ fontSize: 24, fontWeight: 800, margin: "10px 0 2px" }}>{book.title}</h2>
          <div style={{ color: c.inkSoft, fontSize: 14 }}>{book.author}</div>
        </div>
      </div>
      <p style={{ color: c.inkSoft, fontSize: 15, lineHeight: 1.7, margin: "18px 0 24px" }}>{book.blurb}</p>

      <div style={{ background: "#fff", border: `1px solid ${c.line}`, borderRadius: 16, padding: 18, marginBottom: 28 }}>
        <Label>독서 계획</Label>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: c.inkSoft }}><Clock size={15} /> {book.plan_period}</span>
          <span style={{ fontSize: 14, color: c.ink, fontWeight: 600 }}>{book.plan_note}</span>
        </div>
        <StepPath total={book.plan_total} done={book.plan_done} />
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${c.lineSoft}`, display: "flex", alignItems: "center", gap: 7, fontSize: 14, color: c.inkSoft }}>
          <Calendar size={15} /> {book.meeting}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <Label>멤버들의 생각 · {book.reflections.length}</Label>
        <button className="sp-accent" onClick={() => setWriting((w) => !w)}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 999, fontSize: 13, fontWeight: 700 }}>
          <Plus size={15} /> 생각 쓰기
        </button>
      </div>

      {writing && (
        <div className="sp-fade" style={{ background: "#fff", border: `1px solid ${c.amber}`, borderRadius: 16, padding: 16, marginBottom: 18 }}>
          <input className="sp-input" style={{ padding: "11px 12px", borderRadius: 10, marginBottom: 10, fontSize: 15 }}
            placeholder="제목 (선택)" value={title} onChange={(e) => setTitle(e.target.value)} />
          <div style={{ fontSize: 12, color: c.amber, fontWeight: 700, letterSpacing: ".04em", margin: "2px 0 6px" }}>핵심 한 문장</div>
          <input className="sp-input sp-serif" style={{ padding: "11px 12px", borderRadius: 10, marginBottom: 10, fontSize: 15.5, fontWeight: 700 }}
            placeholder="이 책에서 가장 하고 싶은 말을 한 문장으로." value={keyLine} onChange={(e) => setKeyLine(e.target.value)} />
          <textarea className="sp-input" style={{ padding: "11px 12px", borderRadius: 10, minHeight: 110, fontSize: 15, resize: "vertical", lineHeight: 1.6 }}
            placeholder="읽으며 떠오른 생각을 남겨보세요." value={body} onChange={(e) => setBody(e.target.value)} />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 10 }}>
            <button className="sp-ghost" style={{ padding: "9px 16px", borderRadius: 10, fontSize: 14 }} onClick={() => setWriting(false)}>취소</button>
            <button className="sp-primary" style={{ padding: "9px 18px", borderRadius: 10, fontSize: 14, fontWeight: 600 }} onClick={submit} disabled={busy}>
              {busy ? "남기는 중…" : "남기기"}
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gap: 14 }}>
        {book.reflections.length === 0 && !writing && (
          <Empty text="아직 남긴 생각이 없어요. 첫 생각을 적어보세요." />
        )}
        {book.reflections.map((r) => (
          <div key={r.id} style={{ background: "#fff", border: `1px solid ${c.line}`, borderRadius: 16, padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <Avatar profile={r.author} size={32} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{r.author?.name}</div>
                <div style={{ fontSize: 12, color: c.faint }}>{formatDate(r.created_at)}</div>
              </div>
            </div>
            {r.title && <h4 className="sp-serif" style={{ fontSize: 17, fontWeight: 700, margin: "0 0 8px" }}>{r.title}</h4>}
            {r.key_sentence && (
              <p className="sp-serif" style={{ fontSize: 15.5, color: c.ink, fontWeight: 700, lineHeight: 1.6, margin: "0 0 10px", paddingLeft: 12, borderLeft: `3px solid ${c.amber}` }}>{r.key_sentence}</p>
            )}
            <p style={{ fontSize: 14.5, color: c.inkSoft, lineHeight: 1.75, margin: 0 }}>{r.body}</p>
            {r.quote && (
              <div style={{ display: "flex", gap: 8, marginTop: 14, padding: "10px 14px", background: c.sageSoft, borderRadius: 10 }}>
                <Quote size={16} color={c.sage} style={{ flexShrink: 0, marginTop: 2 }} />
                <span className="sp-serif" style={{ fontSize: 14, color: c.sage, fontStyle: "italic", lineHeight: 1.6 }}>{r.quote}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
