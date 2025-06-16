"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { agentsList } from "@/constants/common-constant";
import { Agent } from "@/types/common-types";
export default function Agents() {
  const router = useRouter();

  const handleAgentClick = (agent: Agent) => {
    if (agent.comingSoon) {
      toast.info(`${agent.name} is coming soon!`);
      return;
    }
    router.push(agent.path);
  };

  const handleAgentKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
    agent: Agent
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      handleAgentClick(agent);
    }
  };

  return (
    <div className="grid place-items-center h-[calc(100dvh-var(--header-height))] w-full p-4">
      <div className="flex gap-6 items-center justify-center flex-wrap w-fit">
        {agentsList.map((agent) => (
          <div
            key={agent.id}
            className={`
              p-6 flex gap-4 flex-col w-[320px] sm:w-[380px] bg-white 
              border-gray-200 border rounded-xl shadow-sm 
              transition-all duration-300
              ${
                agent.comingSoon
                  ? "hover:shadow-md cursor-default"
                  : "hover:shadow-xl hover:border-emerald-100 hover:-translate-y-1 cursor-pointer"
              }
              outline-none focus:ring-2 focus:ring-emerald-700
            `}
            tabIndex={0}
            aria-label={
              agent.comingSoon
                ? `${agent.name} (Coming Soon)`
                : `Open ${agent.name} Agent`
            }
            onClick={() => handleAgentClick(agent)}
            onKeyDown={(e) => handleAgentKeyDown(e, agent)}
            role="button"
          >
            <div className="flex w-full justify-between items-start">
              <div className="bg-zinc-100 p-3 mt-2 flex justify-between rounded-lg w-fit">
                <agent.icon
                  size={25}
                  className="text-emerald-900"
                  aria-hidden="true"
                />
              </div>
              {agent.comingSoon && (
                <span className="text-gray-600 bg-zinc-100 h-fit px-3 py-1 text-xs font-medium rounded-full">
                  Coming Soon
                </span>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-green-900 text-xl font-bold">{agent.name}</p>
              <p className="text-gray-700 font-medium text-base">
                {agent.info}
              </p>
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
