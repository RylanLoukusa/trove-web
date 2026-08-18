// Mirrors the response shape of the get-public-folder Supabase edge function
// (see trove-app/supabase/functions/get-public-folder/index.ts) and the
// equivalent client types in trove-app/src/collaboration/folderPublicLinks.ts.
// Keep these two in sync if the edge function's payload shape changes.

export type PublicFolderSummary = {
  id: string;
  name: string;
  icon?: string | null;
  color?: string | null;
  purpose?: string | null;
  parentFolderId?: string | null;
};

export type PublicFolderMediaItem = {
  id: string;
  mediaType?: "image" | "video" | null;
  url?: string | null;
  thumbnailUrl?: string | null;
};

export type PublicFolderAttachment = {
  id: string;
  uri: string;
  mediaType: "image" | "video";
  caption?: string | null;
};

export type PublicFolderListItem = {
  id: string;
  kind: "check" | "bullet";
  text: string;
  checked?: boolean;
  indentLevel?: number;
};

export type PublicFolderItem = {
  id: string;
  folderId: string;
  title: string;
  description?: string | null;
  type: string;
  url?: string | null;
  sourceUrl?: string | null;
  sourcePlatform?: string | null;
  sharedText?: string | null;
  mediaUrl?: string | null;
  thumbnailUrl?: string | null;
  mediaItems: PublicFolderMediaItem[];
  attachments: PublicFolderAttachment[];
  listItems: PublicFolderListItem[];
  richText?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PublicFolderData = {
  folder: PublicFolderSummary;
  folders: PublicFolderSummary[];
  items: PublicFolderItem[];
  link: { scope: "folder_only" | "folder_and_subfolders" };
};

export type PublicFolderResult = { data: PublicFolderData; error?: undefined } | { data?: undefined; error: string };

export const fetchPublicFolder = async (token: string): Promise<PublicFolderResult> => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return { error: "This site is not configured correctly." };
  }

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/get-public-folder`, {
      body: JSON.stringify({ token }),
      cache: "no-store",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    const payload = (await response.json().catch(() => null)) as (PublicFolderData & { error?: string }) | null;

    if (!response.ok || !payload || payload.error) {
      return { error: payload?.error ?? "This link is no longer available." };
    }

    return { data: payload };
  } catch {
    return { error: "This link is no longer available." };
  }
};

export const itemSummaryText = (data: PublicFolderData): string => {
  const count = data.items.length;
  if (count === 0) return "An empty folder shared from Trove.";
  return `${count} saved item${count === 1 ? "" : "s"} shared from Trove.`;
};
