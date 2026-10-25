import { supabase } from "./supabase";

async function testSupabase() {
  const { data, error } = await supabase
    .from("schemes")
    .select("*")
    .limit(5);

  if (error) {
    console.error("Supabase error:", error.message);
    return;
  }

  console.log("Schemes fetched:", data);
}

testSupabase();
