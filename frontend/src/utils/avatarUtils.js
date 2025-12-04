export const getInitials = (name) => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export const getRandomColor = (id) => {
  const colors = [
    "from-pink-400 to-pink-600",
    "from-purple-400 to-purple-600",
    "from-blue-400 to-blue-600",
    "from-green-400 to-green-600",
    "from-yellow-400 to-yellow-600",
    "from-red-400 to-red-600",
    "from-indigo-400 to-indigo-600",
    "from-teal-400 to-teal-600",
    "from-orange-400 to-orange-600",
    "from-cyan-400 to-cyan-600",
    "from-emerald-400 to-emerald-600",
    "from-lime-400 to-lime-600",
    "from-fuchsia-400 to-fuchsia-600",
    "from-rose-400 to-rose-600",
    "from-violet-400 to-violet-600",
    "from-sky-400 to-sky-600",
    "from-amber-400 to-amber-600",
    "from-slate-400 to-slate-600",
    "from-zinc-400 to-zinc-600",
    "from-stone-400 to-stone-600",
    "from-pink-500 to-pink-700",
    "from-purple-500 to-purple-700",
    "from-blue-500 to-blue-700",
    "from-green-500 to-green-700",
    "from-yellow-500 to-yellow-700",
    "from-red-500 to-red-700",
    "from-indigo-500 to-indigo-700",
    "from-teal-500 to-teal-700",
    "from-orange-500 to-orange-700",
    "from-cyan-500 to-cyan-700",
  ];
  const index = id ? id.toString().split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % colors.length : 0;
  return colors[index];
};
