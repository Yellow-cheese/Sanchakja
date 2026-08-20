import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MessageCircle, Plus } from "lucide-react";
import { c } from "../lib/theme";
import { listTopics, getTopic, setStance, addArgument, tallyOf, formatDate } from "../lib/api";
import { Avatar, SideTag, TallyBar, Label, Loading, Empty, BackBar } from "../components/ui";

/* ------------------------- 토론 목록 ------------------------- */
export function DebateList() {
  const [topics, setTopics] = useState(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    let on = true;
    listTopics().then((t) => on && setTopics(t)).catch((e) => { console.error(e); on && setErr(true); });
    return () => { on = false; };
  }, []);

  if (err) return <Empty text="불러오지 못했어요. 잠시 후 새로고침해 주세요." />;
  if (!topics) return <Loading />;

  return (
    <div className="sp-fade">
      <Label>시사토론</Label>
      <h2 className="sp-serif" style={{ fontSize: 26, fontWeight: 800, margin: "0 0 6px" }}>지금, 우리의 물음</h2>
      <p style={{ color: c.inkSoft, fontSize: 14, marginBottom: 22 }}>찬성과 반대 사이에서 각자의 자리를 밝히고 근거를 나눕니다.</p>

      {topics.length === 0 ? <Empty text="아직 토론 주제가 없어요." /> : (
        <div style={{ display: "grid", gap: 14 }}>
          {topics.map((tp) => (
            <Link key={tp.id} to={`/debate/${tp.id}`} className="sp-card" style={{ borderRadius: 16, padding: 18, display: "block" }}>
              <div style={{ fontSize: 13, color: c.plum, fontWeight: 600, marginBottom: 6 }}>{tp.topic_date}</div>
              <h3 className="sp-serif" style={{ fontSize: 19, fontWeight: 700, margin: "0 0 14px", lineHeight: 1.4 }}>{tp.title}</h3>
              <TallyBar t={tp.tally} />
              <div style={{ display: "flex", gap: 14, marginTop: 10, fontSize: 13, color: c.inkSoft }}>
                <span style={{ color: c.agree, fontWeight: 600 }}>찬성 {tp.tally.찬성}</span>
                <span style={{ color: c.oppose, fontWeight: 600 }}>반대 {tp.tally.반대}</span>
                <span style={{ color: c.neutral, fontWeight: 600 }}>중립 {tp.tally.중립}</span>
                <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5 }}><MessageCircle size={14} /> {tp.argCount}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------- 토론 상세 ------------------------- */
export function TopicDetail({ profile }) {
  const { id } = useParams();
  const [topic, setTopic] = useState(null);
  const [err, setErr] = useState(false);
  const [side, setSide] = useState("찬성");
  const [keyLine, setKeyLine] = useState("");
  const [body, setBody] = useState("");
  const [writing, setWriting] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let on = true;
    setTopic(null); setErr(false);
    getTopic(id).then((t) => on && setTopic(t)).catch((e) => { console.error(e); on && setErr(true); });
    return () => { on = false; };
  }, [id]);

  const applyStance = (t, s) => {
    const others = t.stances.filter((x) => x.member_id !== profile.id);
    return { ...t, stances: [...others, { member_id: profile.id, side: s }] };
  };

  const chooseStance = async (s) => {
    setTopic((t) => applyStance(t, s));
    try { await setStance(id, profile.id, s); }
    catch (e) { console.error(e); }
  };

  const submit = async () => {
    if (!body.trim() || busy) return;
    setBusy(true);
    try {
      const created = await addArgument({
        topic_id: id, author_id: profile.id, side,
        key_sentence: keyLine.trim(), body: body.trim(),
      });
      await setStance(id, profile.id, side);
      setTopic((t) => ({ ...applyStance(t, side), arguments: [created, ...t.arguments] }));
      setKeyLine(""); setBody(""); setWriting(false);
    } catch (e) {
      console.error(e);
      alert("주장을 올리지 못했어요. 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  };

  if (err) return (<div><BackBar to="/debate" label="시사토론" /><Empty text="이 토론을 찾지 못했어요." /></div>);
  if (!topic) return (<div><BackBar to="/debate" label="시사토론" /><Loading /></div>);

  const t = tallyOf(topic.stances);
  const myStance = topic.stances.find((s) => s.member_id === profile.id)?.side;

  const stanceBtn = (s, color) => (
    <button className="sp-chip" onClick={() => chooseStance(s)} style={{
      flex: 1, padding: "10px", borderRadius: 10, fontSize: 14, fontWeight: 700,
      border: `1.5px solid ${myStance === s ? color : c.line}`,
      background: myStance === s ? color : "transparent",
      color: myStance === s ? "#fff" : c.inkSoft,
    }}>{s}</button>
  );

  return (
    <div className="sp-fade">
      <BackBar to="/debate" label="시사토론" />
      <div style={{ fontSize: 13, color: c.plum, fontWeight: 600, marginTop: 6 }}>{topic.topic_date}</div>
      <h2 className="sp-serif" style={{ fontSize: 23, fontWeight: 800, margin: "6px 0 14px", lineHeight: 1.4 }}>{topic.title}</h2>
      <p style={{ color: c.inkSoft, fontSize: 15, lineHeight: 1.75, marginBottom: 24 }}>{topic.background}</p>

      <div style={{ background: "#fff", border: `1px solid ${c.line}`, borderRadius: 16, padding: 18, marginBottom: 26 }}>
        <Label>찬반 현황</Label>
        <TallyBar t={t} />
        <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 13 }}>
          <span style={{ color: c.agree, fontWeight: 600 }}>찬성 {t.찬성}</span>
          <span style={{ color: c.oppose, fontWeight: 600 }}>반대 {t.반대}</span>
          <span style={{ color: c.neutral, fontWeight: 600 }}>중립 {t.중립}</span>
        </div>
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${c.lineSoft}` }}>
          <div style={{ fontSize: 13, color: c.inkSoft, marginBottom: 8 }}>나의 입장</div>
          <div style={{ display: "flex", gap: 8 }}>
            {stanceBtn("찬성", c.agree)}{stanceBtn("중립", c.neutral)}{stanceBtn("반대", c.oppose)}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <Label>주장 · {topic.arguments.length}</Label>
        <button className="sp-accent" onClick={() => setWriting((w) => !w)}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 999, fontSize: 13, fontWeight: 700 }}>
          <Plus size={15} /> 주장 쓰기
        </button>
      </div>

      {writing && (
        <div className="sp-fade" style={{ background: "#fff", border: `1px solid ${c.amber}`, borderRadius: 16, padding: 16, marginBottom: 18 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            {["찬성", "중립", "반대"].map((s) => (
              <button key={s} className="sp-chip" onClick={() => setSide(s)} style={{
                flex: 1, padding: "8px", borderRadius: 8, fontSize: 13, fontWeight: 700,
                border: `1.5px solid ${side === s ? c.ink : c.line}`,
                background: side === s ? c.ink : "transparent", color: side === s ? "#fff" : c.inkSoft,
              }}>{s}</button>
            ))}
          </div>
          <div style={{ fontSize: 12, color: c.amber, fontWeight: 700, letterSpacing: ".04em", margin: "2px 0 6px" }}>핵심 한 문장</div>
          <input className="sp-input sp-serif" style={{ padding: "11px 12px", borderRadius: 10, marginBottom: 10, fontSize: 15.5, fontWeight: 700 }}
            placeholder="내 주장을 한 문장으로 요약하면." value={keyLine} onChange={(e) => setKeyLine(e.target.value)} />
          <textarea className="sp-input" style={{ padding: "11px 12px", borderRadius: 10, minHeight: 100, fontSize: 15, resize: "vertical", lineHeight: 1.6 }}
            placeholder="근거와 함께 생각을 적어주세요." value={body} onChange={(e) => setBody(e.target.value)} />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 10 }}>
            <button className="sp-ghost" style={{ padding: "9px 16px", borderRadius: 10, fontSize: 14 }} onClick={() => setWriting(false)}>취소</button>
            <button className="sp-primary" style={{ padding: "9px 18px", borderRadius: 10, fontSize: 14, fontWeight: 600 }} onClick={submit} disabled={busy}>
              {busy ? "올리는 중…" : "올리기"}
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gap: 14 }}>
        {topic.arguments.length === 0 && !writing && <Empty text="아직 올라온 주장이 없어요. 첫 주장을 남겨보세요." />}
        {topic.arguments.map((a) => (
          <div key={a.id} style={{ background: "#fff", border: `1px solid ${c.line}`, borderRadius: 16, padding: 18, borderLeft: `4px solid ${a.side === "찬성" ? c.agree : a.side === "반대" ? c.oppose : c.neutral}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <Avatar profile={a.author} size={30} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{a.author?.name}</div>
                <div style={{ fontSize: 12, color: c.faint }}>{formatDate(a.created_at)}</div>
              </div>
              <SideTag side={a.side} />
            </div>
            {a.key_sentence && (
              <p className="sp-serif" style={{ fontSize: 15.5, color: c.ink, fontWeight: 700, lineHeight: 1.6, margin: "0 0 10px" }}>{a.key_sentence}</p>
            )}
            <p style={{ fontSize: 14.5, color: c.inkSoft, lineHeight: 1.75, margin: 0 }}>{a.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
