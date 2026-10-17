import { prisma } from "@/lib/prisma";

export default async function UserTable() {
  let users: { id: number; email: string; name: string | null }[] = [];
  let error: string | null = null;

  try {
    users = await prisma.user.findMany({ orderBy: { id: "asc" } });
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  return (
    <div className="mt-4 w-full">
      <p className="text-sm font-mono text-zinc-600 dark:text-zinc-400">
        table: <code>User</code> · rows: {users.length}
      </p>
      {error && (
        <pre className="mt-4 w-full rounded border border-red-300 bg-red-50 p-4 text-xs text-red-700 dark:border-red-500/40 dark:bg-red-950 dark:text-red-300">
          {error}
        </pre>
      )}
      <ul className="mt-6 flex w-full flex-col gap-2 text-sm">
        {users.length === 0 && !error && (
          <li className="text-zinc-500 dark:text-zinc-400">
            No rows yet — the migration ran but nothing was inserted.
          </li>
        )}
        {users.map((user) => (
          <li
            key={user.id}
            className="flex items-center gap-3 rounded border border-black/10 px-4 py-2 dark:border-white/10"
          >
            <span className="font-mono text-zinc-400">{user.id}</span>
            <span className="text-black dark:text-zinc-50">
              {user.name ?? "—"}
            </span>
            <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
              {user.email}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}