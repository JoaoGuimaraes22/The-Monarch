// app/(app)/novels/[novelId]/characters/[characterId]/page.tsx
// Character detail page - coordinator only

"use client";

import React, { use } from "react";
import { CharacterDetailPageContent } from "@/app/components/characters";

interface CharacterDetailPageProps {
  params: Promise<{
    novelId: string;
    characterId: string;
  }>;
}

export default function CharacterDetailPage({
  params,
}: CharacterDetailPageProps) {
  const { novelId, characterId } = use(params);

  return (
    <CharacterDetailPageContent novelId={novelId} characterId={characterId} />
  );
}
