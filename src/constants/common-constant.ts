import { BiFile } from "react-icons/bi";
import { LuFileSearch } from "react-icons/lu";
import { FiMessageSquare } from "react-icons/fi";
import { Agent } from "@/types/common-types";
export const ERROR_MESSAGE = 'Something went wrong';

export const agentsList: Agent[] = [
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