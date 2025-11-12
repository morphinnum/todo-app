import TaskList from './TaskList';

export default function ArchiveTaskList({ onEditTask }) {
  return <TaskList isArchived={true} onEditTask={onEditTask} />;
}