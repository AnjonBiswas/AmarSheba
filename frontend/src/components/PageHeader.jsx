export default function PageHeader({ title, intro }) {
  return (
    <header className="container-shell py-10 sm:py-14">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl dark:text-white">{title}</h1>
        <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300">{intro}</p>
      </div>
    </header>
  );
}
