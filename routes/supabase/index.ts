import { Handlers } from "$fresh/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

export const supabase = createClient(
  "https://ouacxkdusjhgnuvzbgyf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91YWN4a2R1c2poZ251dnpiZ3lmIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTUwNTYyMTgsImV4cCI6MjAxMDYzMjIxOH0.Ob1wegNZILDGgibX-pI_tvrIrT313QTfqrIi1810HeY"
);

export type Body = {
  userId: string;
  url: string;
};

export const handler: Handlers = {
  async GET(_req, ctx) {
    const { data } = await supabase.from("recommender").select('*').eq('userId', ctx.remoteAddr.hostname);

    return new Response(JSON.stringify(data));
  },
  async POST(_req, ctx) {
    const body = await _req.json()
  
    if (!body) {
      return new Response("Body is missing");
    }

    try {
    const data: Body = { userId: ctx.remoteAddr.hostname, url:body.url };
  
      if (!data.userId || !data.url) {
        return new Response("Data extraction error");
      }
  
      await supabase.from("recommender").insert(data);
  
      return new Response(JSON.stringify(data));
    } catch (error) {
      return new Response("An error occurred: " + error);
    }
  }
}
export default handler;
