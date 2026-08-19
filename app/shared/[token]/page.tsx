import type { Metadata } from "next";
import Link from "next/link";
import {
  fetchPublicFolder,
  itemSummaryText,
  PublicFolderData,
  PublicFolderItem,
  PublicFolderMediaItem,
  PublicFolderSummary,
} from "@/lib/publicFolder";

type Params = { token: string };
type SearchParams = { folder?: string };
type Props = { params: Promise<Params>; searchParams: Promise<SearchParams> };

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const { token } = await params;
  const result = await fetchPublicFolder(token);

  if (!result.data) {
    return { title: "Shared folder — Trove" };
  }

  const title = `${result.data.folder.name} — Trove`;
  const description = itemSummaryText(result.data);

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary", title, description },
  };
};

// Mirrors resolveDisplayItems in trove-app's PublicFolderPreview screen: mediaItems
// (multiple photos/videos) takes priority over a single mediaUrl, matching how the
// app itself renders a folder's items (see FolderScreen's MediaCollectionDisplay usage).
const resolveDisplayItems = (item: PublicFolderItem): PublicFolderMediaItem[] => {
  if (item.mediaItems.length) return item.mediaItems;
  if (item.mediaUrl) return [{ id: item.id, mediaType: "image", url: item.mediaUrl, thumbnailUrl: item.thumbnailUrl }];
  return [];
};

// No app installed to actually play video for a web visitor, so video tiles show a
// locked placeholder instead, matching trove-app's PublicFolderPreview screen.
const VideoLockedTile = ({ className }: { className: string }) => (
  <div className={`bg-black text-white flex flex-col items-center justify-center gap-1.5 rounded-lg text-center px-2 ${className}`}>
    <span aria-hidden className="text-lg">
      🔒
    </span>
    <span className="text-xs font-semibold">Open Trove to watch this video</span>
  </div>
);

// Matches trove-app's TagChip (src/components/TagChip.tsx) -- visible, not interactive.
const TagPill = ({ name, color }: { name: string; color?: string | null }) => (
  <span
    className="rounded-full border px-4 py-1.5 text-[13px] font-extrabold bg-background"
    style={{ borderColor: color ?? "var(--border-color)", color: color ?? "var(--accent-dark)" }}
  >
    {name}
  </span>
);

// Values below (colors, border radius, spacing, font sizes/weights) are copied from
// trove-app's FolderScreen fullItem* styles (src/screens/FolderScreen/styles.ts) so a
// shared folder reads as the same design here as it does in the app, not a generic
// web approximation of it.
const ItemCard = ({ item }: { item: PublicFolderItem }) => {
  const displayItems = resolveDisplayItems(item);
  const hasStoredMedia = displayItems.length > 0;
  const shouldShowAttachments = item.attachments.length > 0 && !hasStoredMedia;

  return (
    <article className="bg-surface border border-border rounded-[18px] p-4 flex flex-col">
      <h3 className="text-ink text-lg font-black">{item.title}</h3>

      {item.url && (
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="text-blue font-extrabold text-sm underline break-all bg-background rounded-[14px] px-4 py-4 mt-4"
        >
          {item.url}
        </a>
      )}

      {hasStoredMedia && (
        <div className={`flex gap-2.5 overflow-x-auto mt-4 ${displayItems.length === 1 ? "justify-center" : ""}`}>
          {displayItems.map((mediaItem) =>
            mediaItem.mediaType === "video" ? (
              <VideoLockedTile key={mediaItem.id} className="h-[300px] w-[300px] shrink-0" />
            ) : mediaItem.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={mediaItem.id}
                src={mediaItem.url}
                alt=""
                className="rounded-lg h-[300px] w-[300px] object-cover shrink-0"
              />
            ) : null,
          )}
        </div>
      )}

      {(item.description || item.sharedText) && (
        <p className="text-ink text-[15px] leading-[22px] mt-4">{item.description || item.sharedText}</p>
      )}

      {item.type === "list" && item.listItems.length > 0 && (
        <ul className="flex flex-col bg-background rounded-[14px] mt-4 p-2.5">
          {item.listItems.map((listItem) => (
            <li
              key={listItem.id}
              className="flex items-center gap-2.5 py-1"
              style={{ marginLeft: Math.min(listItem.indentLevel ?? 0, 3) * 16 }}
            >
              <span className="text-accent-dark text-2xl font-black w-[30px] text-center shrink-0">
                {listItem.kind === "check" ? (listItem.checked ? "☑" : "☐") : "•"}
              </span>
              <span className={`text-ink text-[15px] leading-[22px] ${listItem.checked ? "text-muted line-through" : ""}`}>
                {listItem.text}
              </span>
            </li>
          ))}
        </ul>
      )}

      {shouldShowAttachments && (
        <div className="flex flex-col gap-2.5 mt-4">
          {item.attachments.map((attachment) =>
            attachment.mediaType === "video" ? (
              <VideoLockedTile key={attachment.id} className="w-full h-[300px]" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={attachment.id} src={attachment.uri} alt="" className="rounded-[14px] w-full h-[300px] object-cover" />
            ),
          )}
        </div>
      )}

      {item.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {item.tags.map((tag) => (
            <TagPill key={tag.id} name={tag.name} color={tag.color} />
          ))}
        </div>
      )}
    </article>
  );
};

// Matches trove-app's FolderCard (src/components/FolderCard.tsx) visually -- icon, name,
// item count -- and, like the app, tapping navigates into the subfolder (here via a real
// ?folder= URL, so the browser back button works the same way a native back gesture would).
const FolderTile = ({ token, folder, itemCount }: { token: string; folder: PublicFolderSummary; itemCount: number }) => (
  <Link
    href={`/shared/${token}?folder=${encodeURIComponent(folder.id)}`}
    className="flex items-center bg-surface rounded-[18px] p-4 shadow-sm mt-3 hover:opacity-80"
  >
    <div
      className="flex items-center justify-center rounded-[14px] h-[46px] w-[46px] text-xl shrink-0"
      style={{ backgroundColor: folder.color ?? "var(--border-color)" }}
    >
      {folder.icon ?? "📁"}
    </div>
    <div className="flex flex-col ml-4 flex-1">
      <span className="text-ink text-[17px] font-extrabold">{folder.name}</span>
      <span className="text-muted text-[13px] mt-0.5">{itemCount} saved here</span>
    </div>
    <span className="text-muted text-2xl">›</span>
  </Link>
);

export default async function SharedFolderPage({ params, searchParams }: Props) {
  const { token } = await params;
  const { folder: folderParam } = await searchParams;
  const result = await fetchPublicFolder(token);

  if (!result.data) {
    return (
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-sm flex flex-col gap-2">
          <h1 className="text-ink text-xl font-bold">Link unavailable</h1>
          <p className="text-muted">{result.error}</p>
        </div>
      </main>
    );
  }

  const data: PublicFolderData = result.data;
  const activeFolderId = folderParam ?? data.folder.id;
  const activeFolder = data.folders.find((folder) => folder.id === activeFolderId) ?? data.folder;
  const parentFolder = activeFolder.parentFolderId
    ? data.folders.find((folder) => folder.id === activeFolder.parentFolderId)
    : undefined;
  const subfolders = data.folders.filter((folder) => folder.parentFolderId === activeFolderId);
  const folderItems = data.items.filter((item) => item.folderId === activeFolderId);
  const itemCountByFolderId = new Map<string, number>();
  data.items.forEach((item) => {
    itemCountByFolderId.set(item.folderId, (itemCountByFolderId.get(item.folderId) ?? 0) + 1);
  });

  return (
    <main className="flex-1 flex flex-col max-w-xl w-full mx-auto p-6 sm:p-10">
      {activeFolder.id !== data.folder.id && (
        <Link
          href={parentFolder ? `/shared/${token}?folder=${encodeURIComponent(parentFolder.id)}` : `/shared/${token}`}
          className="text-accent-dark text-sm font-extrabold mb-3"
        >
          ‹ Back to {parentFolder?.name ?? data.folder.name}
        </Link>
      )}

      <span className="text-muted text-[13px] font-bold uppercase tracking-wide">Shared folder</span>
      <h1 className="text-ink text-[26px] font-black mt-1">
        {activeFolder.icon ?? "📁"} {activeFolder.name}
      </h1>
      {activeFolder.purpose && <p className="text-muted text-[15px] mt-1">{activeFolder.purpose}</p>}

      <h2 className="text-ink text-base font-extrabold mt-6 mb-1">Subfolders</h2>
      {subfolders.length === 0 ? (
        <p className="text-muted text-sm">This folder has no subfolders.</p>
      ) : (
        subfolders.map((subfolder) => (
          <FolderTile key={subfolder.id} token={token} folder={subfolder} itemCount={itemCountByFolderId.get(subfolder.id) ?? 0} />
        ))
      )}

      <h2 className="text-ink text-base font-extrabold mt-6 mb-1">Items</h2>
      {folderItems.length === 0 ? (
        <p className="text-muted text-sm">This folder is empty.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {folderItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}

      <footer className="flex flex-col items-center gap-3 mt-12 pt-8 border-t border-border text-center">
        <p className="text-muted text-sm">Shared read-only via Trove</p>
        <a
          href={`trove://shared/${encodeURIComponent(token)}`}
          className="rounded-full bg-accent-dark text-on-accent px-5 py-3 text-sm font-extrabold"
        >
          Open in Trove
        </a>
      </footer>
    </main>
  );
}
