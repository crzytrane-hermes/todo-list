import { useState, useEffect, useCallback } from 'react';

type Todo = {
  id: string;
  text: string;
  completed: boolean;
};

type Filter = 'all' | 'active' | 'completed';

const STORAGE_KEY = 'todolist-data';

function loadTodos(): Todo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTodos(todos: Todo[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>(loadTodos);
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  const filteredTodos = todos.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const remaining = todos.filter((t) => !t.completed).length;

  const addTodo = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setTodos((prev) => [
      ...prev,
      { id: generateId(), text: trimmed, completed: false },
    ]);
    setInput('');
  }, [input]);

  const toggleTodo = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const startEdit = useCallback((todo: Todo) => {
    setEditId(todo.id);
    setEditText(todo.text);
  }, []);

  const saveEdit = useCallback(() => {
    const trimmed = editText.trim();
    if (!trimmed || !editId) {
      setEditId(null);
      return;
    }
    setTodos((prev) =>
      prev.map((t) => (t.id === editId ? { ...t, text: trimmed } : t)),
    );
    setEditId(null);
  }, [editText, editId]);

  const clearCompleted = useCallback(() => {
    setTodos((prev) => prev.filter((t) => !t.completed));
  }, []);

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="mb-8 text-center text-4xl font-light tracking-tight text-slate-800">
        todos
      </h1>

      {/* Input */}
      <div className="mb-6 flex gap-2">
        <input
          type="text"
          className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-700 shadow-sm placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          placeholder="What needs to be done?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTodo()}
        />
        <button
          onClick={addTodo}
          className="rounded-lg bg-indigo-600 px-5 py-3 font-medium text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.97]"
        >
          Add
        </button>
      </div>

      {/* Todo list */}
      {filteredTodos.length > 0 ? (
        <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white shadow-sm">
          {filteredTodos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center gap-3 px-4 py-3 transition hover:bg-slate-50"
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleTodo(todo.id)}
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
                  todo.completed
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : 'border-slate-300 hover:border-indigo-400'
                }`}
              >
                {todo.completed && (
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>

              {/* Text / Edit */}
              {editId === todo.id ? (
                <input
                  type="text"
                  className="flex-1 rounded border border-indigo-300 bg-white px-2 py-1 text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveEdit();
                    if (e.key === 'Escape') setEditId(null);
                  }}
                  autoFocus
                />
              ) : (
                <span
                  className={`flex-1 text-slate-700 ${
                    todo.completed ? 'text-slate-400 line-through' : ''
                  }`}
                  onDoubleClick={() => startEdit(todo)}
                >
                  {todo.text}
                </span>
              )}

              {/* Actions */}
              <div className="flex gap-1">
                {editId === todo.id ? (
                  <button
                    onClick={saveEdit}
                    className="rounded px-2 py-1 text-sm font-medium text-emerald-600 transition hover:bg-emerald-50"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => startEdit(todo)}
                    className="rounded px-2 py-1 text-sm text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="rounded px-2 py-1 text-sm text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-12 text-center text-slate-400">
          {filter === 'all'
            ? 'No todos yet. Add one above!'
            : filter === 'active'
              ? 'No active todos.'
              : 'No completed todos.'}
        </p>
      )}

      {/* Footer */}
      {todos.length > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
          <span>
            {remaining} item{remaining !== 1 ? 's' : ''} remaining
          </span>

          <div className="flex gap-1">
            {(['all', 'active', 'completed'] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded px-3 py-1 font-medium capitalize transition ${
                  filter === f
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <button
            onClick={clearCompleted}
            className="rounded px-3 py-1 text-sm transition hover:bg-red-50 hover:text-red-500"
          >
            Clear completed
          </button>
        </div>
      )}
    </div>
  );
}
