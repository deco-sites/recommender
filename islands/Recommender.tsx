import { useEffect } from "preact/hooks";

export type Props ={
    url: string | undefined
}

function Recommender({url}: Props) {
  useEffect(() => {
    (async () => {
      const rawResponse = await fetch("http://localhost:8000/supabase", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url:url }),
      });
      const content = await rawResponse.text();

      console.log(content);
    })();
  }, []);

  return <></>;
}

export default Recommender;
