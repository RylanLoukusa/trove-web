import type { Metadata } from "next";
import {
  fetchPublicFolder,
  itemSummaryText,
  PublicFolderData,
  PublicFolderItem,
  PublicFolderMediaItem,
  PublicFolderSummary,
} from "@/lib/publicFolder";

type Params = { token: string };
type Props = { params: Promise<Params> };

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
        <div className="flex gap-2.5 overflow-x-auto mt-4">
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
    </article>
  );
};

// Matches trove-app's FolderCard (src/components/FolderCard.tsx) visually -- icon, name,
// item count -- minus the press/chevron affordance, since items are listed inline below
// rather than navigated into.
const FolderCard = ({ folder, itemCount }: { folder: PublicFolderSummary; itemCount: number }) => (
  <div className="flex items-center bg-surface rounded-[18px] p-4 shadow-sm mt-6">
    <div
      className="flex items-center justify-center rounded-[14px] h-[46px] w-[46px] text-xl shrink-0"
      style={{ backgroundColor: folder.color ?? "var(--border-color)" }}
    >
      {folder.icon ?? "📁"}
    </div>
    <div className="flex flex-col ml-4">
      <span className="text-ink text-[17px] font-extrabold">{folder.name}</span>
      <span className="text-muted text-[13px] mt-0.5">{itemCount} saved here</span>
    </div>
  </div>
);

const FolderSection = ({ data, folderId }: { data: PublicFolderData; folderId: string }) => {
  const folder = data.folders.find((candidate) => candidate.id === folderId);
  const items = data.items.filter((item) => item.folderId === folderId);
  if (!folder) return null;
  if (folder.id !== data.folder.id && items.length === 0) return null;

  return (
    <section className="flex flex-col">
      {folder.id !== data.folder.id && <FolderCard folder={folder} itemCount={items.length} />}
      {items.length === 0 ? (
        folder.id === data.folder.id && <p className="text-muted text-sm mt-4">This folder is empty.</p>
      ) : (
        <div className="flex flex-col gap-3 mt-4">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
};

export default async function SharedFolderPage({ params }: Props) {
  const { token } = await params;
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

  const data = result.data;

  return (
    <main className="flex-1 flex flex-col max-w-xl w-full mx-auto p-6 sm:p-10">
      <span className="text-muted text-[13px] font-bold uppercase tracking-wide">Shared folder</span>
      <h1 className="text-ink text-[26px] font-black mt-1">
        {data.folder.icon ?? "📁"} {data.folder.name}
      </h1>
      {data.folder.purpose && <p className="text-muted text-[15px] mt-1">{data.folder.purpose}</p>}

      {data.folders.map((folder) => (
        <FolderSection key={folder.id} data={data} folderId={folder.id} />
      ))}

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
