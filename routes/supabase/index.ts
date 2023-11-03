import { HandlerContext } from "$fresh/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const supabasee = createClient(
  "https://ouacxkdusjhgnuvzbgyf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91YWN4a2R1c2poZ251dnpiZ3lmIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTUwNTYyMTgsImV4cCI6MjAxMDYzMjIxOH0.Ob1wegNZILDGgibX-pI_tvrIrT313QTfqrIi1810HeY"
);

async function supabase(req: Request, _ctx: HandlerContext) {
  if (req.method == "GET") {
    const { data } = await supabasee.from("recommender").select("*");

    return data;
  }
  if (req.method == "POST") {
    const body = req.text;
    await supabasee
      .from("recommender")
      .insert({ userId: body.userId, category: body.category });

    return "data";
  }
}

export default supabase;
