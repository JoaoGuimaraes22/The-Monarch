// app/(app)/novels/[novelId]/characters/page.tsx
// Lightweight characters page - coordinator only

"use client";

import React, { use } from "react";
import { CharactersPageContent } from "@/app/components/characters";

interface CharactersPageProps {
  params: Promise<{
    novelId: string;
  }>;
}

export default function CharactersPage({ params }: CharactersPageProps) {
  const { novelId } = use(params);

  return <CharactersPageContent novelId={novelId} />;
}
