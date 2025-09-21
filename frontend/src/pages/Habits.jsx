export default function Habits() {
    return (
        <div className="bg-card rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-accent mb-4">Your Habits</h2>
            <ul className="space-y-3">
                <li className="p-4 bg-background rounded-lg shadow border border-accent">
                    🏋️ Workout - Streak: 5 days
                </li>
                <li className="p-4 bg-background rounded-lg shadow border border-xp">
                    📚 Study - Streak: 3 days
                </li>
            </ul>
        </div>
    );
}
