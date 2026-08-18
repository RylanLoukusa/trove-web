import type { Metadata } from "next";
import { fetchPublicFolder, itemSummaryText, PublicFolderData, PublicFolderItem } from "@/lib/publicFolder";

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

const ItemCard = ({ item }: { item: PublicFolderItem }) => (
  <article className="rounded-xl border border-black/10 dark:border-white/15 p-4 flex flex-col gap-2">
    {item.mediaUrl && (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={item.mediaUrl} alt="" className="rounded-lg w-full max-h-80 object-cover" />
    )}
    <h3 className="font-semibold text-base">{item.title}</h3>
    {(item.description || item.sharedText) && (
      <p className="text-sm opacity-75">{item.description || item.sharedText}</p>
    )}
    {item.url && (
      <a href={item.url} target="_blank" rel="noreferrer" className="text-sm underline break-all opacity-80">
        {item.url}
      </a>
    )}
    {item.listItems.length > 0 && (
      <ul className="text-sm flex flex-col gap-1 mt-1">
        {item.listItems.map((listItem) => (
          <li key={listItem.id} className={listItem.checked ? "line-through opacity-50" : ""}>
            {listItem.kind === "check" ? (listItem.checked ? "☑" : "☐") : "•"} {listItem.text}
          </li>
        ))}
      </ul>
    )}
  </article>
);

const FolderSection = ({ data, folderId }: { data: PublicFolderData; folderId: string }) => {
  const folder = data.folders.find((candidate) => candidate.id === folderId);
  const items = data.items.filter((item) => item.folderId === folderId);
  if (!folder) return null;
  if (folder.id !== data.folder.id && items.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      {folder.id !== data.folder.id && (
        <span className="self-start text-xs font-semibold uppercase tracking-wide opacity-60 border border-black/10 dark:border-white/15 rounded-full px-3 py-1">
          {folder.icon ?? "📁"} {folder.name}
        </span>
      )}
      {items.length === 0 ? (
        folder.id === data.folder.id && <p className="text-sm opacity-60">This folder is empty.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
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
          <h1 className="text-xl font-bold">Link unavailable</h1>
          <p className="opacity-70">{result.error}</p>
        </div>
      </main>
    );
  }

  const data = result.data;

  return (
    <main className="flex-1 flex flex-col max-w-3xl w-full mx-auto p-6 sm:p-10 gap-8">
      <header className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wide opacity-60">Shared folder</span>
        <h1 className="text-3xl font-black">
          {data.folder.icon ?? "📁"} {data.folder.name}
        </h1>
        {data.folder.purpose && <p className="opacity-70">{data.folder.purpose}</p>}
      </header>

      <div className="flex flex-col gap-6">
        {data.folders.map((folder) => (
          <FolderSection key={folder.id} data={data} folderId={folder.id} />
        ))}
      </div>

      <footer className="flex flex-col items-center gap-3 pt-8 border-t border-black/10 dark:border-white/15 text-center">
        <p className="text-sm opacity-70">Shared read-only via Trove</p>
        <a
          href={`trove://shared/${encodeURIComponent(token)}`}
          className="rounded-full bg-foreground text-background px-5 py-2 text-sm font-semibold"
        >
          Open in Trove
        </a>
      </footer>
    </main>
  );
}
