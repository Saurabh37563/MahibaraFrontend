import { BiFile } from "react-icons/bi";
import { LuFileSearch } from "react-icons/lu";
import { FiMessageSquare } from "react-icons/fi";
export default function Agents() {
  const agentsList = [
    {
      name: "Akash",
      icon: LuFileSearch,
      info: "Your Very Own Smart Data Analyst powered by AI",
      comingSoon: false,
    },
    {
      name: "Mony",
      icon: FiMessageSquare,
      info: "Interact with 45+ years of history of records powered by AI",
      comingSoon: true,
    },
    {
      name: "Vanita",
      icon: BiFile,
      info: "Advanced optical lens powered by AI",
      comingSoon: true,
    },
  ];
  return (
    <div className="grid place-items-center h-screen w-full">
      <div className="flex gap-6 items-center justify-center flex-wrap">
        {agentsList.map((agent) => (
          <div key={agent?.name} className="p-6 flex gap-4 flex-col w-[400px] bg-white border-gray-400 border rounded-xl hover:shadow-xl ">
            <div className="flex w-full justify-between">
              <div className="bg-zinc-100 p-3 mt-2 flex justify-between rounded-lg w-fit">
                <agent.icon size={25} className="text-emerald-900" />
              </div>
             {
              agent?.comingSoon &&  <span className=" text-gray-700 bg-zinc-200 h-fit px-2 text-xs font-medium rounded-full">
              Coming Soon
            </span>
             }
            </div>
            <p className="text-green-900 text-xl font-bold ">{agent?.name}</p>
            <p className="text-gray-700 font-medium text-[16px] ">{agent?.info}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
