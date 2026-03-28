export default function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className="flex border-b border-border">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-2.5 text-sm font-medium transition-colors relative cursor-pointer ${
            activeTab === tab.id
              ? "text-primary"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
              activeTab === tab.id
                ? "bg-primary/10 text-primary"
                : "bg-surface text-text-secondary"
            }`}>
              {tab.count}
            </span>
          )}
          {activeTab === tab.id && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t" />
          )}
        </button>
      ))}
    </div>
  );
}
