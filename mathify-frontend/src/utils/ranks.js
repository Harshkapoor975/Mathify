export const MATHEMATICIANS = [
    {
        minRating: 0,
        maxRating: 999,
        title: "Euclid Initiate",
        discovery: "Elements of Geometry",
        character: "Euclid of Alexandria",
        color: "#9ca3af", // Steel grey
        badge: "📐",
        description: "The Father of Geometry. Lays the foundations of logical proof, axiomatic math, and spatial reasoning."
    },
    {
        minRating: 1000,
        maxRating: 1199,
        title: "Pythagoras Warrior",
        discovery: "Pythagorean Theorem",
        character: "Pythagoras of Samos",
        color: "#d4af37", // Bronze gold
        badge: "🔺",
        description: "Unlocking the cosmic secrets of the right triangle: a² + b² = c². Believed numbers form the basic essence of reality."
    },
    {
        minRating: 1200,
        maxRating: 1399,
        title: "Fibonacci Weaver",
        discovery: "Golden Ratio & Recurrence",
        character: "Leonardo Fibonacci",
        color: "#e5c158", // Goldish
        badge: "🌀",
        description: "Tracing nature's infinite spiral through the beauty of golden recurrence relations and sequence progression."
    },
    {
        minRating: 1400,
        maxRating: 1599,
        title: "Descartes Architect",
        discovery: "Cartesian Coordinates",
        character: "René Descartes",
        color: "#f59e0b", // Amber gold
        badge: "🌐",
        description: "Bridging geometry and algebra. Synthesized geometry with algebra, allowing shapes to be solved as algebraic coordinates."
    },
    {
        minRating: 1600,
        maxRating: 1799,
        title: "Newtonian Force",
        discovery: "Infinitesimal Calculus",
        character: "Sir Isaac Newton",
        color: "#facc15", // Bright gold
        badge: "🍎",
        description: "Fluxions and gravity. Mapping the continuous change of the physical universe through differential and integral calculus."
    },
    {
        minRating: 1800,
        maxRating: 1999,
        title: "Euler Overlord",
        discovery: "Graph Theory & Identity",
        character: "Leonhard Euler",
        color: "#fbbf24", // Premium gold
        badge: "🔗",
        description: "Master of analysis, graph theory, and mathematical beauty. Discovered the elegant identity: e^(iπ) + 1 = 0."
    },
    {
        minRating: 2000,
        maxRating: 2199,
        title: "Gauss Sovereign",
        discovery: "Modular Arithmetic & Distribution",
        character: "Carl Friedrich Gauss",
        color: "#f59e0b", // Rich deep gold
        badge: "👑",
        description: "The Prince of Mathematicians. Conquered number theory, modular arithmetic, normal distribution, and electromagnetism."
    },
    {
        minRating: 2200,
        maxRating: 99999,
        title: "Ramanujan Master",
        discovery: "Infinite Series & Mock Theta Functions",
        character: "Srinivasa Ramanujan",
        color: "#ffd700", // Legendary golden glow
        badge: "✨",
        description: "An extraordinary self-taught genius who saw visions of infinite series, partitions, and mock theta functions."
    }
];

export function getRank(rating) {
    const val = typeof rating === "number" ? rating : 1000;
    return MATHEMATICIANS.find(m => val >= m.minRating && val <= m.maxRating) || MATHEMATICIANS[0];
}
