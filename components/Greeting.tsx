"use client";

import { useEffect, useState } from "react";

export default function Greeting({ name, programName }: { name?: string; programName?: string }) {
  const [greeting, setGreeting] = useState("Welcome back");

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
  }, []);

  const first = (name || "").trim().split(/\s+/)[0];

  return (
    <div>
      <h1 className="dashboard-intro-title">{greeting}{first ? `, ${first}` : ""}.</h1>
      <p className="dashboard-program-name">Discipline today. Artistry forever.{programName ? <> <span className="text-ink/60">· {programName}</span></> : null}</p>
    </div>
  );
}
