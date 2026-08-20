import { useEffect, useState } from "react";
import { Routes, Route, NavLink, Link, useLocation } from "react-router-dom";
import { Home as HomeIcon, BookOpen, Scale, User } from "lucide-react";
import { c } from "./lib/theme";
import { getSession, onAuthChange, ensureProfile } from "./lib/api";
import { Avatar, Loading } from "./components/ui";

import Login from "./pages/Login";
import HomePage from "./pages/Home";
import { ReadingList, BookDetail } from "./pages/Reading";
import { DebateList, TopicDetail } from "./pages/Debate";
import Profile from "./pages/Profile";

const TABS = [
  { to: "/", label: "홈", icon: HomeIcon, end: true },
  { to: "/reading", label: "독서토론", icon: BookOpen },
  { to: "/debate", label: "시사토론", icon: Scale },
  { to: "/me", label: "내 서재", icon: User },
];

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);

  useEffect(() => {
    let active = true;
    (async () => {
      const s = await getSession();
      if (!active) return;
      setSession(s);
      if (s?.user) {
        try { setProfile(await ensureProfile(s.user)); } catch (e) { console.error(e); }
      }
      setLoading(false);
    })();

    const listener = onAuthChange(async (s) => {
      setSession(s);
      if (s?.user) {
        try { setProfile(await ensureProfile(s.user)); } catch (e) { console.error(e); }
      } else {
        setProfile(null);
      }
    });
    return () => {
      active = false;
      listener?.data?.subscription?.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div className="sp-root" style={{ minHeight: "100vh" }}><Loading /></div>;
  }
  if (!session || !profile) {
    return <Login />;
  }

  return (
    <div className="sp-root" style={{ minHeight: "100vh" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(251,249,243,.9)", backdropFilter: "blur(8px)", borderBottom: `1px solid ${c.line}` }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link to="/" className="sp-serif" style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-.01em" }}>산책자들</Link>
          <Link to="/me"><Avatar profile={profile} size={32} /></Link>
        </div>
      </header>

      <main style={{ maxWidth: 640, margin: "0 auto", padding: "26px 20px 100px" }}>
        <Routes>
          <Route path="/" element={<HomePage profile={profile} />} />
          <Route path="/reading" element={<ReadingList />} />
          <Route path="/reading/:id" element={<BookDetail profile={profile} />} />
          <Route path="/debate" element={<DebateList />} />
          <Route path="/debate/:id" element={<TopicDetail profile={profile} />} />
          <Route path="/me" element={<Profile profile={profile} setProfile={setProfile} />} />
          <Route path="*" element={<HomePage profile={profile} />} />
        </Routes>
      </main>

      <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 20, background: "rgba(251,249,243,.94)", backdropFilter: "blur(8px)", borderTop: `1px solid ${c.line}` }}>
        <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", padding: "8px 12px" }}>
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <NavLink key={t.to} to={t.to} end={t.end}
                style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "6px 0" }}>
                {({ isActive }) => (
                  <>
                    <Icon size={21} color={isActive ? c.amber : c.inkSoft} strokeWidth={isActive ? 2.2 : 1.8} />
                    <span style={{ fontSize: 11, fontWeight: isActive ? 700 : 500, color: isActive ? c.ink : c.inkSoft }}>{t.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
