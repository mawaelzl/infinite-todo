import { useMemo, useState } from 'react';
import type { Todo } from '../types';
import { isFutureKey, isPastKey, isTodayKey, parseDateKey } from '../storage';
import { useLocale } from '../i18n/useLocale';
import { formatDuration, type DurationMinutes } from '../duration';
import { ClockDurationPicker } from './ClockDurationPicker';
import { DurationIcon } from './DurationIcon';
import { AnimatedCheckbox } from './AnimatedCheckbox';
import { randomAllDoneMessage, randomRemainingMessage } from '../i18n/remainingMessages';

interface DayCardProps {
  dateKey: string;
  todos: Todo[];
  onAdd: (text: string, durationMinutes?: number) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateDuration: (id: string, durationMinutes: number) => void;
}

export function DayCard({
  dateKey,
  todos,
  onAdd,
  onToggle,
  onDelete,
  onUpdateDuration,
}: DayCardProps) {
  const [draft, setDraft] = useState('');
  const [draftDuration, setDraftDuration] = useState<DurationMinutes>(5);
  const { locale, t } = useLocale();
  const date = parseDateKey(dateKey);
  const today = isTodayKey(dateKey);
  const past = isPastKey(dateKey);
  const future = isFutureKey(dateKey);
  const editable = today || future;

  const weekdayFormat = useMemo(
    () => new Intl.DateTimeFormat(locale, { weekday: 'long' }),
    [locale],
  );
  const dateFormat = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: 'long', day: 'numeric', year: 'numeric' }),
    [locale],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    onAdd(draft, draftDuration);
    setDraft('');
    setDraftDuration(5);
  };

  const totalMinutes = useMemo(
    () => todos.reduce((sum, todo) => sum + (todo.durationMinutes ?? 0), 0),
    [todos],
  );

  const remainingCount = useMemo(
    () => todos.filter((todo) => !todo.done).length,
    [todos],
  );

  const remainingMinutes = useMemo(() => {
    const undoneWithDuration = todos.filter(
      (todo) => !todo.done && todo.durationMinutes !== undefined,
    );
    if (undoneWithDuration.length === 0) return null;
    return undoneWithDuration.reduce((sum, todo) => sum + (todo.durationMinutes ?? 0), 0);
  }, [todos]);

  const remainingMessage = useMemo(() => {
    if (todos.length === 0) return null;
    if (remainingCount === 0) return randomAllDoneMessage(locale);
    const timeLabel = remainingMinutes !== null ? formatDuration(remainingMinutes, t) : '';
    return randomRemainingMessage(locale, remainingCount, remainingMinutes, timeLabel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateKey, remainingCount, remainingMinutes, locale]);

  return (
    <article
      className={`day-card${today ? ' day-card--today' : ''}${past ? ' day-card--past' : ''}`}
      data-date={dateKey}
    >
      <header className="day-card__header">
        <div>
          <h2 className="day-card__weekday">{weekdayFormat.format(date)}</h2>
          <p className="day-card__date">{dateFormat.format(date)}</p>
        </div>
        {today && <span className="day-card__badge">{t.today}</span>}
      </header>

      {totalMinutes > 0 && (
        <p className="day-card__total">{t.dayTotalApprox(formatDuration(totalMinutes, t))}</p>
      )}

      {remainingMessage && <p className="day-card__encouragement">{remainingMessage}</p>}

      <ul className="day-card__list">
        {todos.length === 0 && (
          <li className="day-card__empty">{past ? t.nothingRecorded : t.noTodosYet}</li>
        )}
        {todos.map((todo) => (
          <li key={todo.id} className={`todo-item${todo.done ? ' todo-item--done' : ''}`}>
            <label className="todo-item__label">
              <AnimatedCheckbox
                checked={todo.done}
                disabled={past}
                onChange={() => onToggle(todo.id)}
                aria-label={todo.text}
              />
              <span className="todo-item__text">
                <span className="todo-item__text-inner">{todo.text}</span>
              </span>
            </label>
            {todo.durationMinutes !== undefined && (
              editable ? (
                <ClockDurationPicker
                  value={todo.durationMinutes}
                  onChange={(minutes) => onUpdateDuration(todo.id, minutes)}
                  variant="badge"
                />
              ) : (
                <span className="todo-item__duration">
                  <DurationIcon minutes={todo.durationMinutes} size={14} />
                  {formatDuration(todo.durationMinutes, t)}
                </span>
              )
            )}
            {editable && (
              <button
                type="button"
                className="todo-item__delete"
                aria-label={t.deleteTodoAria(todo.text)}
                onClick={() => onDelete(todo.id)}
              >
                ✕
              </button>
            )}
          </li>
        ))}
      </ul>

      {editable && (
        <form className="day-card__add" onSubmit={handleSubmit}>
          <input
            type="text"
            value={draft}
            placeholder={t.addPlaceholder}
            onChange={(e) => setDraft(e.target.value)}
          />
          <ClockDurationPicker value={draftDuration} onChange={setDraftDuration} />
          <button type="submit" disabled={!draft.trim()}>
            {t.add}
          </button>
        </form>
      )}
    </article>
  );
}
