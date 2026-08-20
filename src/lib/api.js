import { supabase } from "./supabase";
import { pickTint } from "./theme";

/* ---------------- 날짜 표시 ---------------- */
export function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const sameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(d, now)) return "오늘";
  if (sameDay(d, yesterday)) return "어제";
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

/* ---------------- 인증 ---------------- */
export function onAuthChange(cb) {
  return supabase.auth.onAuthStateChange((_event, session) => cb(session));
}
export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}
export async function signInWithEmail(email) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: "https://sanchakja.vercel.app/" },
  });
  if (error) throw error;
}
export async function signOut() {
  await supabase.auth.signOut();
}

/* 로그인한 유저에 대응하는 프로필을 보장(없으면 생성)합니다. */
export async function ensureProfile(user) {
  const { data, error } = await supabase
    .from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (error) throw error;
  if (data) return data;
  const name = (user.email || "산책자").split("@")[0];
  const { data: created, error: e2 } = await supabase
    .from("profiles")
    .insert({ id: user.id, name, tint: pickTint() })
    .select().single();
  if (e2) throw e2;
  return created;
}
export async function updateProfile(id, patch) {
  const { data, error } = await supabase
    .from("profiles").update(patch).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

/* ---------------- 도서 ---------------- */
const STATUS_ORDER = { 진행중: 0, 예정: 1, 완료: 2 };

export async function listBooks() {
  const { data, error } = await supabase
    .from("books").select("*, reflections(count)");
  if (error) throw error;
  return (data || [])
    .map((b) => ({ ...b, reflectionCount: b.reflections?.[0]?.count ?? 0 }))
    .sort((a, b) =>
      (STATUS_ORDER[a.status] - STATUS_ORDER[b.status]) ||
      new Date(a.created_at) - new Date(b.created_at));
}

export async function getBook(id) {
  const { data, error } = await supabase
    .from("books")
    .select("*, reflections(*, author:profiles(id,name,tint))")
    .eq("id", id)
    .order("created_at", { referencedTable: "reflections", ascending: false })
    .single();
  if (error) throw error;
  return data;
}

export async function addReflection(row) {
  const { data, error } = await supabase
    .from("reflections").insert(row)
    .select("*, author:profiles(id,name,tint)").single();
  if (error) throw error;
  return data;
}

/* ---------------- 토론 ---------------- */
export function tallyOf(stances = []) {
  const t = { 찬성: 0, 반대: 0, 중립: 0 };
  stances.forEach((s) => { if (t[s.side] !== undefined) t[s.side] += 1; });
  return t;
}

export async function listTopics() {
  const { data, error } = await supabase
    .from("topics")
    .select("*, stances(side), arguments(count)")
    .order("created_at");
  if (error) throw error;
  return (data || []).map((tp) => ({
    ...tp,
    tally: tallyOf(tp.stances),
    argCount: tp.arguments?.[0]?.count ?? 0,
  }));
}

export async function getTopic(id) {
  const { data, error } = await supabase
    .from("topics")
    .select(
      "*, stances(side, member_id, member:profiles(id,name,tint)), arguments(*, author:profiles(id,name,tint))"
    )
    .eq("id", id)
    .order("created_at", { referencedTable: "arguments", ascending: false })
    .single();
  if (error) throw error;
  return data;
}

export async function setStance(topic_id, member_id, side) {
  const { data, error } = await supabase
    .from("stances")
    .upsert(
      { topic_id, member_id, side, updated_at: new Date().toISOString() },
      { onConflict: "topic_id,member_id" }
    )
    .select().single();
  if (error) throw error;
  return data;
}

export async function addArgument(row) {
  const { data, error } = await supabase
    .from("arguments").insert(row)
    .select("*, author:profiles(id,name,tint)").single();
  if (error) throw error;
  return data;
}

/* ---------------- 내 서재 ---------------- */
export async function getMyPosts(userId) {
  const [refs, args] = await Promise.all([
    supabase.from("reflections")
      .select("*, book:books(title)").eq("author_id", userId)
      .order("created_at", { ascending: false }),
    supabase.from("arguments")
      .select("*, topic:topics(title)").eq("author_id", userId)
      .order("created_at", { ascending: false }),
  ]);
  if (refs.error) throw refs.error;
  if (args.error) throw args.error;
  return { reflections: refs.data || [], arguments: args.data || [] };
}

/* ---------------- 홈 ---------------- */
export async function getHome() {
  const [active, next, refs, args] = await Promise.all([
    supabase.from("books").select("*").eq("status", "진행중")
      .order("created_at").limit(1),
    supabase.from("topics").select("*").order("created_at").limit(1),
    supabase.from("reflections")
      .select("id, created_at, book:books(id,title), author:profiles(id,name,tint)")
      .order("created_at", { ascending: false }).limit(6),
    supabase.from("arguments")
      .select("id, side, created_at, topic:topics(id,title), author:profiles(id,name,tint)")
      .order("created_at", { ascending: false }).limit(6),
  ]);
  for (const r of [active, next, refs, args]) if (r.error) throw r.error;

  const activity = [
    ...(refs.data || []).map((r) => ({
      kind: "reflection", who: r.author, when: r.created_at,
      to: r.book ? { v: "book", id: r.book.id } : null,
      text: r.book ? `‘${r.book.title}’에 생각을 남겼어요` : "생각을 남겼어요",
    })),
    ...(args.data || []).map((a) => ({
      kind: "argument", who: a.author, when: a.created_at,
      to: a.topic ? { v: "topic", id: a.topic.id } : null,
      text: a.topic ? `‘${a.topic.title}’에 ${a.side} 주장을 올렸어요` : "주장을 올렸어요",
    })),
  ]
    .sort((x, y) => new Date(y.when) - new Date(x.when))
    .slice(0, 6);

  return {
    activeBook: active.data?.[0] || null,
    nextTopic: next.data?.[0] || null,
    activity,
  };
}
