"use client";

import { usePathname } from "next/navigation";
import Tour from "@/components/Tour";
import { tourFor } from "@/lib/tour-steps";

// Drops the right walkthrough onto whatever page it's mounted on, chosen by
// route. If no tour exists for the page, renders nothing.
export default function PageTour() {
  const pathname = usePathname();
  const steps = tourFor(pathname);
  if (!steps) return null;
  return <Tour steps={steps} />;
}
