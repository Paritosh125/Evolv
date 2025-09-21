export default function BadgeCard({ badge, unlocked }) {
    return (
        <div
            className={`p-4 rounded-xl shadow-md border-2 flex flex-col items-center text-center transition
          ${unlocked ? "bg-background border-reward" : "bg-card border-gray-700 opacity-50"}
        `}
        >
            <div className="text-4xl mb-2">
                {badge.icon || "🏅"}
            </div>
            <h3 className="font-bold text-lg mb-1 text-accent">{badge.name}</h3>
            <p className="text-sm text-text mb-2">{badge.description}</p>
            {unlocked ? (
                <span className="text-reward font-semibold">Unlocked</span>
            ) : (
                <span className="text-gray-400 italic">Locked</span>
            )}
        </div>
    );
}
