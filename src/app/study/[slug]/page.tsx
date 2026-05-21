import { notFound } from "next/navigation";
import { loadDeck } from "@/lib/load-decks";
import StudySession from "@/components/StudySession";

type Props = { params: Promise<{ slug: string }> };

export default async function StudyPage({ params }: Props) {
  const { slug } = await params;
  const deck = await loadDeck(slug);
  if (!deck) notFound();
  return <StudySession deck={deck} />;
}
