"use client";

import { useEffect, useState } from "react";

type Quote = { text: string; author: string };

const QUOTES: Quote[] = [
  { text: "Practice means to perform, in the face of all obstacles, some act of vision, of faith, of desire.", author: "Martha Graham" },
  { text: "Nothing is more revealing than movement. The body says what words cannot.", author: "Martha Graham" },
  { text: "Great dancers are not great because of their technique; they are great because of their passion.", author: "Martha Graham" },
  { text: "I do not try to dance better than anyone else. I only try to dance better than myself.", author: "Mikhail Baryshnikov" },
  { text: "No one is born a dancer. You have to want it more than anything.", author: "Mikhail Baryshnikov" },
  { text: "No one can arrive from being talented alone. Work transforms talent into genius.", author: "Anna Pavlova" },
  { text: "To follow, without halt, one aim: there is the secret of success.", author: "Anna Pavlova" },
  { text: "Get the basics right and the rest will follow.", author: "Margot Fonteyn" },
  { text: "Take your work seriously, but never yourself.", author: "Margot Fonteyn" },
  { text: "I don't want people who want to dance. I want people who have to dance.", author: "George Balanchine" },
  { text: "When you dance, your purpose is not to get to a certain place on the floor. It's to enjoy each step along the way.", author: "Wayne Dyer" },
  { text: "I would believe only in a god who could dance.", author: "Friedrich Nietzsche" },
  { text: "Technique is what you fall back on when you run out of inspiration.", author: "Rudolf Nureyev" },
  { text: "You live as long as you dance.", author: "Rudolf Nureyev" },
  { text: "The truest expression of a people is in its dance and in its music. Bodies never lie.", author: "Agnes de Mille" },
  { text: "To dance is to be out of yourself — larger, more beautiful, more powerful.", author: "Agnes de Mille" },
  { text: "Dancing is creating a sculpture that is visible only for a moment.", author: "Erol Ozan" },
];

function quoteForToday(): Quote {
  const now = new Date();
  const dayNumber = Math.floor((now.getTime() - now.getTimezoneOffset() * 60000) / 86400000);
  return QUOTES[dayNumber % QUOTES.length];
}

export default function DailyQuote() {
  const [q, setQ] = useState<Quote | null>(null);
  useEffect(() => { setQ(quoteForToday()); }, []);
  if (!q) return <div className="h-px" aria-hidden />;

  return (
    <div className="card quote-card animate-in">
      <span className="quote-mark" aria-hidden>“</span>
      <p className="eyebrow mt-1">For today</p>
      <p className="font-display text-[25px] md:text-[28px] font-bold leading-[1.03] text-navy mt-3">{q.text}</p>
      <p className="text-grey text-[11px] mt-4 tracking-wide">{q.author}</p>
    </div>
  );
}
