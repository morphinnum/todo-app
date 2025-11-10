import { Check, Trash2, Archive, Calendar, ArchiveRestore, Edit } from 'lucide-react';

export default function TaskItem({ 
  task, 
  onToggle, 
  onDelete, 
  onArchive, 
  onUnarchive, 
  onEdit,
  isArchived 
}) {
  const formatDeadline = (deadline) => {
    if (!deadline) return null;
    const date = new Date(deadline);
    const now = new Date();
    
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const diffTime = dateOnly - nowOnly;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const dateStr = `${day}.${month}.${year}`;
    
    let label = '';
    let color = '';
    
    if (diffDays < 0) {
      const absDays = Math.abs(diffDays);
      label = absDays === 1 ? '(overdue 1 day)' : `(overdue ${absDays} days)`;
      color = 'text-red-600 bg-red-50';
    } else if (diffDays === 0) {
      label = '(today)';
      color = 'text-orange-600 bg-orange-50';
    } else if (diffDays === 1) {
      label = '(tomorrow)';
      color = 'text-yellow-600 bg-yellow-50';
    } else if (diffDays <= 7) {
      label = `(${diffDays} days)`;
      color = 'text-blue-600 bg-blue-50';
    } else {
      label = '';
      color = 'text-gray-600 bg-gray-50';
    }
    
    return { text: `${dateStr} ${label}`.trim(), color };
  };

  const deadlineInfo = task.deadline ? formatDeadline(task.deadline) : null;

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
        <div className="flex flex-wrap gap-2 mt-2 items-center">
          {task.tags && task.tags.length > 0 && (
            <>
              {task.tags.map((tag) => (
                <span
                  key={tag.value}
                  className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full"
                >
                  {tag.label}
                </span>
              ))}
            </>
          )}
          
          {deadlineInfo && (
            <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${deadlineInfo.color}`}>
              <Calendar size={12} />
              {deadlineInfo.text}
            </span>
          )}
        </div>
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