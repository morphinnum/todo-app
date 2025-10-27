import { Check, Trash2, Archive, ArchiveRestore, Edit } from 'lucide-react';

export default function TaskItem({ 
  task, 
  onToggle, 
  onDelete, 
  onArchive, 
  onUnarchive, 
  onEdit,
  isArchived 
}) {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-3 flex items-start gap-3">
      <button
        onClick={() => onToggle(task.id)}
        className={`mt-1 flex-shrink-0 w-6 h-6 p-0 rounded border-0 flex items-center justify-center focus:outline-none ${
          task.completed ? 'bg-emerald-500' : 'bg-gray-200'
        }`}
      >
        {task.completed && <Check size={16} className="text-white" />}
      </button>
      
      <div className="flex-1">
        <h3 className={`font-semibold ${task.completed ? 'line-through text-gray-500' : ''}`}>
          {task.title}
        </h3>
        {task.description && (
          <p className="text-gray-600 text-sm mt-1">{task.description}</p>
        )}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {task.tags.map((tag) => (
              <span
                key={tag.value}
                className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full"
              >
                {tag.label}
              </span>
            ))}
          </div>
        )}
      </div>
      
      <div className="flex gap-1">
        {!isArchived && (
          <button
            onClick={() => onEdit(task)}
            className="text-blue-600 hover:text-blue-700 transition p-2"
            title="Edit"
          >
            <Edit size={20} />
          </button>
        )}
        {isArchived ? (
          <button
            onClick={() => onUnarchive(task.id)}
            className="text-green-600 hover:text-green-700 transition p-2"
            title="Unarchive"
          >
            <ArchiveRestore size={20} />
          </button>
        ) : (
          <button
            onClick={() => onArchive(task.id)}
            className="text-yellow-600 hover:text-yellow-700 transition p-2"
            title="Archive"
          >
            <Archive size={20} />
          </button>
        )}
        <button
          onClick={() => onDelete(task.id)}
          className="text-red-600 hover:text-red-700 transition p-2"
          title="Delete"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
}