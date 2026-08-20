import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // .env 를 아직 안 채웠을 때 친절히 알려줍니다.
  console.warn(
    "[산책자들] .env 에 VITE_SUPABASE_URL 과 VITE_SUPABASE_ANON_KEY 를 넣어주세요."
  );
}

export const supabase = createClient(url || "", anonKey || "");
