"use client";

import { useEffect, useState } from "react";

// Greets the member by name with a time-of-day greeting based on THEIR local
// time (computed in the browser), not the server. Renders a neutral default
// on the server / first paint to avoid a hydration mismatch, then updates.
export default function Greeting({ name, programName }: { name?: string; programName?: string }) {
  const [greeting, setGreeting] = useState("Welcome back");

  useEffect(() => {
    const h = new Date().getHours(); // user's local hour
    setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
  }, []);

  const first = (name || "").trim().split(/\s+/)[0];

  return (
    <div>
      <p className="eyebrow">{greeting}{first ? `, ${first}` : ""}</p>
      <h2 className="text-2xl font-extrabold text-navy mt-1">Ready to train?</h2>
      {programName && <p className="text-grey text-sm mt-0.5">{programName}</p>}
    </div>
  );
}
