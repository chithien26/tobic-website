import { notFound } from "next/navigation";

// Renders the localized site 404 (with header/footer) for unknown paths under /{lang}.
export default function CatchAll() {
  notFound();
}
