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
      <p className="eyebrow">{greeting}{first ? `, ${first}` : ""}</p>
      <h1 className="dashboard-intro-title">Ready to dance?</h1>
      {programName && <p className="dashboard-program-name">Current program · <span className="text-ink font-medium">{programName}</span></p>}
    </div>
  );
}
