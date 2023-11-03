import { Handlers } from "$fresh/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const supabase = createClient(
  "https://ouacxkdusjhgnuvzbgyf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91YWN4a2R1c2poZ251dnpiZ3lmIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTUwNTYyMTgsImV4cCI6MjAxMDYzMjIxOH0.Ob1wegNZILDGgibX-pI_tvrIrT313QTfqrIi1810HeY"
);

export type Body = {
  userId: string;
  category: string;
};

export const handler: Handlers = {
  async GET(_req, ctx) {
    const { data } = await supabase.from("recommender").eq('userId', ctx.remoteAddr.hostname).select('*');

    return new Response(JSON.stringify(data));
  },
  async POST(_req, ctx) {
    const body = _req.body;
  
    if (!body) {
      return new Response("Body is missing");
    }
  
    let chunk = "";
    // I'm sorry about all this code below I know that is terrible but we don't have time anymore
    try {
      const { done, value } = await body.getReader().read();
      if (!done) {
        chunk = new TextDecoder().decode(value);
      } else {
        return new Response("Empty body");
      }
  
      const [firstValue, secondValue] = chunk.split(",");

      const userIdValue = firstValue.split(':')[1]

      const categoryValue = secondValue.split(':')[1]

      categoryValue.replace(new RegExp(`"`, "g"),"")
      categoryValue.replace(new RegExp(`}`, "g"),"")
      let resultCategoryValue = categoryValue.replace(new RegExp(`}`, "g"),"")
  
      userIdValue.replace(new RegExp(`"`, "g"),"")
      userIdValue.replace(new RegExp(`}"`, "g"),"")

      const data = { category: resultCategoryValue.replace(new RegExp(`"`, "g"),""), userId: userIdValue.replace(new RegExp(`"`, "g"),"") };
  
      if (!data.userId || !data.category) {
        return new Response("Data extraction error");
      }
  
      await supabase.from("recommender").insert({ userId: ctx.remoteAddr.hostname, category: data.category });
  
      return new Response("Saved");
    } catch (error) {
      return new Response("An error occurred: " + error);
    }
  }
}
export default handler;
