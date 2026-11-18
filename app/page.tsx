"use client";

import { useEffect, useState } from "react";

const collaborators = ["Yung Shugo", "STXPHNE", "Lino_Killa Beat", "AxL"];

const roleWeights = {
  lyrics: { label: "Lyrics & performance", weight: 40 },
  production: { label: "Production", weight: 30 },
  mixing: { label: "Mixing", weight: 20 },
  mastering: { label: "Mastering", weight: 10 },
};

type RoleKey = keyof typeof roleWeights;

type Track = {
  id: number;
  title: string;
  artist: string;
  roles: Record<RoleKey, string[]>;
};

const initialTracks: Track[] = [
  {
    id: 1,
    title: "golddigger",
    artist: "STXPHNE",
    roles: {
      lyrics: ["STXPHNE"],
      production: ["Lino_Killa Beat"],
      mixing: ["STXPHNE", "Yung Shugo"],
      mastering: ["Yung Shugo"],
    },
  },
  {
    id: 2,
    title: "school kidd",
    artist: "STXPHNE",
    roles: {
      lyrics: ["STXPHNE"],
      production: ["Yung Shugo"],
      mixing: ["Yung Shugo"],
      mastering: ["Yung Shugo"],
    },
  },
  {
    id: 3,
    title: "still dgaf",
    artist: "AxL & STXPHNE",
    roles: {
      lyrics: ["AxL", "STXPHNE"],
      production: ["Yung Shugo", "Lino_Killa Beat"],
      mixing: ["Yung Shugo"],
      mastering: ["Yung Shugo"],
    },
  },
  {
    id: 4,
    title: "apple pay",
    artist: "STXPHNE",
    roles: {
      lyrics: ["STXPHNE"],
      production: ["Yung Shugo"],
      mixing: ["STXPHNE", "Yung Shugo"],
      mastering: ["Yung Shugo"],
    },
  },
  {
    id: 5,
    title: "rstfr!",
    artist: "STXPHNE",
    roles: {
      lyrics: ["STXPHNE"],
      production: ["Yung Shugo"],
      mixing: ["STXPHNE", "Yung Shugo"],
      mastering: ["Yung Shugo"],
    },
  },
];

// Distributes each role's weight in whole numbers.
// Any remainder is assigned one point at a time.
function calculateSplits(roles: Track["roles"]) {
  const totals: Record<string, number> = {};
  let assignedWeight = 0;
  const missingRoles: string[] = [];

  Object.entries(roleWeights).forEach(([key, role]) => {
    const members = roles[key as RoleKey];
    if (members.length === 0) {
      missingRoles.push(role.label);
      return;
    }

    assignedWeight += role.weight;

    const base = Math.floor(role.weight / members.length);
    const remainder = role.weight % members.length;

    members.forEach((member, index) => {
      totals[member] =
        (totals[member] || 0) + base + (index < remainder ? 1 : 0);
    });
  });

  return { totals, assignedWeight, missingRoles };
}

export default function Home() {
  const [tracks, setTracks] = useState(initialTracks);
  const [storageReady, setStorageReady] = useState(false);

  // Load saved project data when the app opens
  useEffect(() => {
    try {
      const savedTracks = localStorage.getItem("sls-project-v1");

      if (savedTracks) {
        setTracks(JSON.parse(savedTracks));
      }
    } catch (error) {
      console.error("Could not load saved SLS project:", error);
    } finally {
      setStorageReady(true);
    }
  }, []);

  // Save changes whenever track data changes
  useEffect(() => {
    if (!storageReady) return;

    try {
      localStorage.setItem("sls-project-v1", JSON.stringify(tracks));
    } catch (error) {
      console.error("Could not save SLS project:", error);
    }
  }, [tracks, storageReady]);

  function toggleContributor(trackId: number, role: RoleKey, person: string) {
    setTracks((current) =>
      current.map((track) => {
        if (track.id !== trackId) return track;

        const currentMembers = track.roles[role];

        const updatedMembers = currentMembers.includes(person)
          ? currentMembers.filter((member) => member !== person)
          : [...currentMembers, person];

        return {
          ...track,
          roles: {
            ...track.roles,
            [role]: updatedMembers,
          },
        };
      }),
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <p className="text-sm text-zinc-400">PROJECT MANAGEMENT</p>
            <h1 className="text-4xl font-bold mt-2">SLS</h1>
            <p className="text-zinc-400 mt-1">Split Agreement Management</p>
          </div>
          <span className="border border-zinc-700 rounded-full px-4 py-2 text-sm">
            {storageReady ? "Saved locally" : "Loading project..."}
          </span>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {[
            ["Tracks", "05"],
            ["Collaborators", "04"],
            ["Planned release", "20 Nov 2026"],
          ].map(([label, value]) => (
            <div key={label} className="bg-zinc-900 rounded-xl p-5">
              <p className="text-zinc-400 text-sm">{label}</p>
              <p className="text-2xl font-bold mt-2">{value}</p>
            </div>
          ))}
        </section>

        <section className="mb-8 bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h2 className="font-semibold text-lg mb-3">Contribution weighting</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(roleWeights).map(([key, role]) => (
              <div key={key} className="bg-zinc-800 rounded-lg p-3">
                <p className="text-sm text-zinc-400">{role.label}</p>
                <p className="text-xl font-bold">{role.weight}%</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-zinc-500 mt-3">
            Shared roles are divided equally among their contributors.
          </p>
        </section>

        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-semibold">Track editor</h2>
          <span className="text-sm text-zinc-400">
            Master revenue · DistroKid
          </span>
        </div>

        <div className="space-y-6">
          {tracks.map((track) => {
            const result = calculateSplits(track.roles);
            const valid = result.assignedWeight === 100;

            return (
              <article
                key={track.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"
              >
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <h3 className="font-semibold text-lg">{track.title}</h3>
                    <p className="text-sm text-zinc-400">{track.artist}</p>
                  </div>
                  <span
                    className={`text-xs px-3 py-1 rounded-full ${
                      valid
                        ? "bg-emerald-950 text-emerald-300"
                        : "bg-amber-950 text-amber-300"
                    }`}
                  >
                    {valid ? "100% allocated" : "Incomplete credits"}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {(
                    Object.entries(roleWeights) as [
                      RoleKey,
                      (typeof roleWeights)[RoleKey],
                    ][]
                  ).map(([key, role]) => (
                    <div key={key} className="bg-zinc-800/60 rounded-lg p-4">
                      <div className="flex justify-between mb-3">
                        <p className="font-medium text-sm">{role.label}</p>
                        <span className="text-indigo-300 text-sm">
                          {role.weight}%
                        </span>
                      </div>

                      <div className="space-y-2">
                        {collaborators.map((person) => (
                          <label
                            key={person}
                            className="flex items-center gap-2 text-sm cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={track.roles[key].includes(person)}
                              onChange={() =>
                                toggleContributor(track.id, key, person)
                              }
                              className="accent-indigo-500"
                            />
                            {person}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-zinc-800 mt-5 pt-5">
                  <h4 className="font-medium mb-3">
                    Calculated revenue allocation
                  </h4>

                  {Object.entries(result.totals).map(([person, percentage]) => (
                    <div key={person} className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>{person}</span>
                        <span className="font-semibold">{percentage}%</span>
                      </div>
                      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-between text-sm mt-4">
                    <span className="text-zinc-400">Total allocated</span>
                    <span
                      className={valid ? "text-emerald-400" : "text-amber-400"}
                    >
                      {result.assignedWeight}%
                    </span>
                  </div>

                  {!valid && (
                    <p className="text-amber-300 text-xs mt-2">
                      Assign at least one collaborator to every role before
                      finalizing this track. Missing:{" "}
                      {result.missingRoles.join(", ")}
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        <footer className="mt-12 border-t border-zinc-800 pt-5 text-sm text-zinc-500">
          SLS Agreement Manager · Version 0.2 · Editable draft
        </footer>
      </div>
    </main>
  );
}
