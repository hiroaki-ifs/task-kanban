import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Task } from '@/types/task'

type TaskCardProps = {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}

export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  return (
    <li>
      <Card size="sm" className="shadow-xs transition-shadow hover:shadow-md">
        <CardContent className="flex flex-col gap-2">
          <h3 className="break-words font-medium leading-snug">{task.title}</h3>
          {task.description && (
            <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">
              {task.description}
            </p>
          )}
          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label={`${task.title}を編集`}
              onClick={() => onEdit(task)}
            >
              <Pencil />
              編集
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              aria-label={`${task.title}を削除`}
              onClick={() => onDelete(task)}
            >
              <Trash2 />
              削除
            </Button>
          </div>
        </CardContent>
      </Card>
    </li>
  )
}
