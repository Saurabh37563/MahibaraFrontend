import { FiEdit2, FiTrash2 } from "react-icons/fi";

interface SidebarItemProps {
  name: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function SidebarItem({ name, onEdit, onDelete }: SidebarItemProps) {
  return (
    <div className="flex justify-between items-center p-2 rounded-md hover:bg-green-50 group transition">
      <span className="text-sm text-gray-800">{name}</span>
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onEdit} title="Edit">
          <FiEdit2 size={16} className="text-gray-500 hover:text-gray-700" />
        </button>
        <button onClick={onDelete} title="Delete">
          <FiTrash2 size={16} className="text-gray-500 hover:text-gray-700" />
        </button>
      </div>
    </div>
  );
}
