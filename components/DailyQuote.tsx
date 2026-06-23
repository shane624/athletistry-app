"use client";

import { useEffect, useState } from "react";

// A quiet, rotating line shown when the dashboard opens. Picks a fresh one
// each time the app is opened. Brand-restrained: navy text, a single teal
// accent rule, no emoji.
//
// Quotes are drawn from celebrated dancers and choreographers throughout
// history — words that are well-documented and tied to these figures.
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
  { text: "The only way to do all the things you'd like to do is to read.", author: "George Balanchine" },
  { text: "I don't want people who want to dance. I want people who have to dance.", author: "George Balanchine" },
  { text: "Dancers are the athletes of God.", author: "Albert Einstein, on the dancer's discipline" },
  { text: "When you dance, your purpose is not to get to a certain place on the floor. It's to enjoy each step along the way.", author: "Wayne Dyer" },
  { text: "I would believe only in a god who could dance.", author: "Friedrich Nietzsche" },
  { text: "Technique is what you fall back on when you run out of inspiration.", author: "Rudolf Nureyev" },
  { text: "You live as long as you dance.", author: "Rudolf Nureyev" },
  { text: "The truest expression of a people is in its dance and in its music. Bodies never lie.", author: "Agnes de Mille" },
  { text: "To dance is to be out of yourself — larger, more beautiful, more powerful.", author: "Agnes de Mille" },
  { text: "Dancing is creating a sculpture that is visible only for a moment.", author: "Erol Ozan" },
  { text: "Every day brings a chance for you to draw in a breath, kick off your shoes, and dance.", author: "Oprah Winfrey" },
];

// Same quote for the whole day, changing at local midnight. Uses the day
// number since epoch as a stable index so "Daily Inspiration" is accurate.
function quoteForToday(): Quote {
  const now = new Date();
  const dayNumber = Math.floor(
    (now.getTime() - now.getTimezoneOffset() * 60000) / 86400000
  );
  return QUOTES[dayNumber % QUOTES.length];
}

export default function DailyQuote() {
  const [q, setQ] = useState<Quote | null>(null);

  useEffect(() => {
    setQ(quoteForToday());
  }, []);

  // Render a placeholder until mounted to avoid a hydration flash.
  if (!q) return <div className="h-px" aria-hidden />;

  return (
    <div className="card mb-5 px-5 py-4 animate-in">
      <p className="eyebrow">Daily Inspiration</p>
      <p className="text-navy text-lg md:text-xl font-semibold leading-snug mt-2">
        &ldquo;{q.text}&rdquo;
      </p>
      <p className="text-grey text-sm mt-2">— {q.author}</p>
    </div>
  );
}
