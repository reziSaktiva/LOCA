export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">Loca</h1>
        <p className="max-w-sm text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Brand Hub &amp; D2C E-Commerce sedang dalam tahap fondasi implementasi. Lihat{" "}
          <code className="rounded bg-zinc-200 px-1 py-0.5 dark:bg-zinc-800">PROJECT_STATE.md</code>{" "}
          untuk status terkini.
        </p>
      </main>
    </div>
  );
}
