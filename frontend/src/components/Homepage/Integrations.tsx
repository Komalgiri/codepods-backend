const tools = ["GitHub", "GitLab", "Slack", "VS Code"];

const Integrations = () => {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-200 dark:border-border-dark">
      <h2 className="text-sm font-bold uppercase tracking-widest text-center text-slate-400 mb-12">
        Powered by your favorite tools
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tools.map(tool => (
          <div
            key={tool}
            className="p-6 rounded-xl border bg-slate-50 dark:bg-surface-dark hover:bg-white dark:hover:bg-slate-800 transition"
          >
            <span className="font-bold text-lg">{tool}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Integrations;
