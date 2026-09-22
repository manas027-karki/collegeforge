import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '../components/Button'
import {
  ConfirmDeleteTaskDialog,
} from '../components/study/ConfirmDeleteTaskDialog'
import { EmptyTasks } from '../components/study/EmptyTasks'
import { StudyStats } from '../components/study/StudyStats'
import { TaskFilters } from '../components/study/TaskFilters'
import { TaskList } from '../components/study/TaskList'
import { TaskModal, type TaskFormValues } from '../components/study/TaskModal'
import { WeeklyProgressChart } from '../components/study/WeeklyProgressChart'
import { filterStudyTasks, groupStudyTasks } from '../components/study/studyFilter'
import {
  computeStudyStats,
  computeWeeklyProgress,
} from '../components/study/studyStatsUtils'
import { TODAY_ISO } from '../lib/dates'
import { useAppStore } from '../store/useAppStore'
import type { StudyTask } from '../types'

export function StudyPlanner() {
  const tasks = useAppStore((s) => s.tasks)
  const studyTaskFilters = useAppStore((s) => s.studyTaskFilters)
  const setStudyTaskFilters = useAppStore((s) => s.setStudyTaskFilters)
  const addStudyTask = useAppStore((s) => s.addStudyTask)
  const updateStudyTask = useAppStore((s) => s.updateStudyTask)
  const deleteStudyTask = useAppStore((s) => s.deleteStudyTask)
  const toggleStudyTask = useAppStore((s) => s.toggleStudyTask)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<StudyTask | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<StudyTask | null>(null)

  const stats = useMemo(() => computeStudyStats(tasks), [tasks])
  const weekData = useMemo(() => computeWeeklyProgress(tasks), [tasks])

  const filteredTasks = useMemo(
    () => filterStudyTasks(tasks, studyTaskFilters),
    [tasks, studyTaskFilters],
  )

  const grouped = useMemo(() => groupStudyTasks(filteredTasks), [filteredTasks])

  const openAddModal = () => {
    setEditingTask(null)
    setModalOpen(true)
  }

  const openEditModal = (task: StudyTask) => {
    setEditingTask(task)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingTask(null)
  }

  const handleSave = (values: TaskFormValues) => {
    if (editingTask) {
      updateStudyTask(editingTask.id, { ...values, status: editingTask.status })
    } else {
      addStudyTask({
        id: `task-${Date.now()}`,
        createdAt: TODAY_ISO,
        status: 'TODO',
        ...values,
      })
    }
    closeModal()
  }

  const handleResetFilters = () => {
    setStudyTaskFilters({
      search: '',
      status: 'ALL',
      priority: 'ALL',
      category: 'ALL',
      sort: 'DUE_DATE',
    })
  }

  const handleConfirmDelete = () => {
    if (deleteTarget) deleteStudyTask(deleteTarget.id)
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Study Planner
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Plan your preparation and stay consistent.
          </p>
        </div>
        <Button onClick={openAddModal} className="shrink-0">
          <Plus aria-hidden="true" className="h-4 w-4" />
          Add Task
        </Button>
      </section>

      <StudyStats stats={stats} />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <TaskFilters
            search={studyTaskFilters.search}
            onSearchChange={(value) => setStudyTaskFilters({ search: value })}
            status={studyTaskFilters.status}
            onStatusChange={(value) => setStudyTaskFilters({ status: value })}
            priority={studyTaskFilters.priority}
            onPriorityChange={(value) => setStudyTaskFilters({ priority: value })}
            category={studyTaskFilters.category}
            onCategoryChange={(value) => setStudyTaskFilters({ category: value })}
            sort={studyTaskFilters.sort}
            onSortChange={(value) => setStudyTaskFilters({ sort: value })}
            resultCount={filteredTasks.length}
            totalCount={tasks.length}
            onClear={handleResetFilters}
          />

          {tasks.length === 0 ? (
            <EmptyTasks variant="empty" onAdd={openAddModal} onClear={handleResetFilters} />
          ) : (
            <TaskList
              overdue={grouped.overdue}
              today={grouped.today}
              upcoming={grouped.upcoming}
              completed={grouped.completed}
              emptyState={
                <EmptyTasks
                  variant="no-matches"
                  onAdd={openAddModal}
                  onClear={handleResetFilters}
                />
              }
              onToggle={(task) => toggleStudyTask(task.id)}
              onEdit={openEditModal}
              onDelete={setDeleteTarget}
            />
          )}
        </div>

        <div className="space-y-6">
          <WeeklyProgressChart data={weekData} />
        </div>
      </div>

      {modalOpen ? (
        <TaskModal
          task={editingTask}
          onClose={closeModal}
          onSave={handleSave}
        />
      ) : null}

      {deleteTarget ? (
        <ConfirmDeleteTaskDialog
          task={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
        />
      ) : null}
    </div>
  )
}