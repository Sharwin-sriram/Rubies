import Header from "@components/Header";
import style from "@styles/pages/Home.module.css";
import { useEffect, useState } from "react";

export default () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState("");

  useEffect(() => {
    setResults(`Search results for ${query}`);
  }, [query]);

  return (
    <>
      <Header setSearch={setQuery} search={query} />
      <section className={style.HomePage}>{query ? results : ""}</section>
    </>
  );
};
