import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Scale, ChevronRight } from "lucide-react";
import { c } from "../lib/theme";
import { getHome, formatDate } from "../lib/api";
import { Avatar, Label, Loading, Empty } from "../components/ui";

export default function HomePage({ profile }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    let on = true;
    getHome().then((d) => on && setData(d)).catch((e) => { console.error(e); on && setErr(true); });
    return () => { on = false; };
  }, []);

  if (err) return <Empty text="불러오지 못했어요. 잠시 후 새로고침해 주세요." />;
  if (!data) return <Loading />;

  const { activeBook, nextTopic, activity } = data;
  const dotColor = (k) => (k === "reflection" ? c.sage : k === "argument" ? c.plum : c.amber);
  const go = (to) => to && nav(to.v === "book" ? `/reading/${to.id}` : `/debate/${to.id}`);

  return (
    <div className="sp-fade">
      <p style={{ color: c.inkSoft, fontSize: 14 }}>오늘도 한 걸음</p>
      <h2 className="sp-serif" style={{ fontSize: 28, fontWeight: 800, margin: "2px 0 24px" }}>
        안녕하세요, {(profile.name || "").slice(0, 3)}님
      </h2>

      <Label>다가오는 모임</Label>
      <div style={{ display: "grid", gap: 12, marginBottom: 30 }}>
        {activeBook && (
          <div className="sp-card" style={{ borderRadius: 16, padding: 18, display: "flex", gap: 14, alignItems: "center" }}
            onClick={() => nav(`/reading/${activeBook.id}`)}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: c.sageSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <BookOpen size={20} color={c.sage} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: c.inkSoft }}>독서토론 · {activeBook.title}</div>
              <div style={{ fontWeight: 600, marginTop: 2 }}>{activeBook.meeting}</div>
            </div>
            <ChevronRight size={18} color={c.faint} />
          </div>
        )}
        {nextTopic && (
          <div className="sp-card" style={{ borderRadius: 16, padding: 18, display: "flex", gap: 14, alignItems: "center" }}
            onClick={() => nav(`/debate/${nextTopic.id}`)}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: c.plumSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Scale size={20} color={c.plum} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: c.inkSoft }}>시사토론 · {nextTopic.topic_date}</div>
              <div style={{ fontWeight: 600, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nextTopic.title}</div>
            </div>
            <ChevronRight size={18} color={c.faint} />
          </div>
        )}
      </div>

      <Label>산책 기록</Label>
      {activity.length === 0 ? (
        <Empty text="아직 활동이 없어요. 첫 생각을 남겨보세요." />
      ) : (
        <div style={{ position: "relative", paddingLeft: 8 }}>
          {activity.map((a, i) => (
            <div key={i} style={{ display: "flex", gap: 14, position: "relative", paddingBottom: i === activity.length - 1 ? 0 : 22 }}>
              {i !== activity.length - 1 && (
                <div style={{ position: "absolute", left: 6, top: 16, bottom: -6, width: 2, background: c.lineSoft }} />
              )}
              <div style={{ width: 14, height: 14, borderRadius: "50%", background: c.paper, border: `2.5px solid ${dotColor(a.kind)}`, marginTop: 3, flexShrink: 0, zIndex: 1 }} />
              <div onClick={() => go(a.to)} style={{ cursor: a.to ? "pointer" : "default", flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Avatar profile={a.who} size={24} />
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{a.who?.name}</span>
                  <span style={{ fontSize: 12, color: c.faint }}>· {formatDate(a.when)}</span>
                </div>
                <div style={{ fontSize: 14, color: c.inkSoft, marginTop: 4 }}>{a.text}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
