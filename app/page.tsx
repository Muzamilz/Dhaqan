import { Suspense } from "react";
import UserTable from "@/components/user-table";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black">
        <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
          Database test
        </h1>
        <Suspense
          fallback={
            <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
              Querying app_dev…
            </p>
          }
        >
          <UserTable />
        </Suspense>
      </main>
    </div>
  );
}