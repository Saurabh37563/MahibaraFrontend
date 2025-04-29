"use client";

import { BiFile } from "react-icons/bi";
import { LuFileSearch } from "react-icons/lu";
import { FiMessageSquare } from "react-icons/fi";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function Agents() {
  const router = useRouter();

  const agentsList = [
    {
      id: "akash",
      name: "Akash",
      icon: LuFileSearch,
      info: "Your Very Own Smart Data Analyst powered by AI",
      comingSoon: false,
      path: "/functions",
    },
    {
      id: "mony",
      name: "Mony",
      icon: FiMessageSquare,
      info: "Interact with 45+ years of history of records powered by AI",
      comingSoon: true,
      path: "/agents/mony",
    },
    {
      id: "vanita",
      name: "Vanita",
      icon: BiFile,
      info: "Advanced optical lens powered by AI",
      comingSoon: true,
      path: "/agents/vanita",
    },
  ];

  const handleAgentClick = (agent: any) => {
    if (agent.comingSoon) {
      toast.info(`${agent.name} is coming soon!`);
    } else {
      router.push(agent.path);
    }
  };

  return (
    <div className="grid place-items-center h-screen w-full p-4">
      <div className="flex gap-6 items-center justify-center flex-wrap w-fit">
        {agentsList.map((agent) => (
          <div
            key={agent.id}
            className={`
              p-6 flex gap-4 flex-col w-[320px] sm:w-[380px] bg-white 
              border-gray-200 border rounded-xl shadow-sm 
              transition-all duration-300
              ${agent.comingSoon 
                ? "hover:shadow-md" 
                : "hover:shadow-xl hover:border-emerald-100 hover:-translate-y-1"
              }
            `}
            onClick={() => handleAgentClick(agent)}
            style={{ 
              cursor: agent.comingSoon ? "default" : "pointer" 
            }}
          >
            <div className="flex w-full justify-between items-start">
              <div className="bg-zinc-100 p-3 mt-2 flex justify-between rounded-lg w-fit">
                <agent.icon size={25} className="text-emerald-900" />
              </div>
              {agent.comingSoon && (
                <span className="text-gray-600 bg-zinc-100 h-fit px-3 py-1 text-xs font-medium rounded-full">
                  Coming Soon
                </span>
              )}
            </div>
            
            <div className="space-y-2">
              <p className="text-green-900 text-xl font-bold">{agent.name}</p>
              <p className="text-gray-700 font-medium text-base">{agent.info}</p>
            </div>
            
            {!agent.comingSoon && (
              <div className="flex justify-end mt-2">
                <span className="text-emerald-700 text-sm font-medium hover:underline">
                  Open Agent →
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}