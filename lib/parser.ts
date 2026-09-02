import { Priority } from '@/types';

export interface ParsedTaskInput {
  raw: string;
  cleanTitle: string;
  projectName: string | null;
  labels: string[];
  priority: Priority;
  dueDate: string | null;
  deadline: string | null;
  recurrence: string | null;
}

/**
 * Format a Date object to YYYY-MM-DD
 */
export function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Deterministic Non-AI text parser for quick task entry:
 * - #ProjectName => assigns project
 * - @LabelName => adds label tag
 * - p1, p2, p3, p4 => assigns priority
 * - today, tomorrow, every day, every week => due date / recurrence
 * - {deadline} => hard external deadline
 */
export function parseTaskInput(text: string): ParsedTaskInput {
  if (!text) {
    return {
      raw: '',
      cleanTitle: '',
      projectName: null,
      labels: [],
      priority: 'p4',
      dueDate: null,
      deadline: null,
      recurrence: null,
    };
  }

  let remaining = text;
  let projectName: string | null = null;
  const labels: string[] = [];
  let priority: Priority = 'p4';
  let dueDate: string | null = null;
  let deadline: string | null = null;
  let recurrence: string | null = null;

  // 1. Parse Hard Deadline: {deadline}
  const deadlineMatch = remaining.match(/\{([^}]+)\}/);
  if (deadlineMatch) {
    deadline = deadlineMatch[1].trim();
    remaining = remaining.replace(deadlineMatch[0], ' ');
  }

  // 2. Parse Project: #ProjectName or #"Project Name"
  const projectQuoteMatch = remaining.match(/#\"([^\"]+)\"/);
  if (projectQuoteMatch) {
    projectName = projectQuoteMatch[1].trim();
    remaining = remaining.replace(projectQuoteMatch[0], ' ');
  } else {
    const projectMatch = remaining.match(/#([\w\-]+)/);
    if (projectMatch) {
      projectName = projectMatch[1].trim();
      remaining = remaining.replace(projectMatch[0], ' ');
    }
  }

  // 3. Parse Labels: @LabelName
  const labelRegex = /@([\w\-]+)/g;
  let labelMatch;
  while ((labelMatch = labelRegex.exec(remaining)) !== null) {
    const tag = labelMatch[1].trim();
    if (tag && !labels.includes(tag)) {
      labels.push(tag);
    }
  }
  remaining = remaining.replace(/@[\w\-]+/g, ' ');

  // 4. Parse Priority: \b(p1|p2|p3|p4|P1|P2|P3|P4)\b
  const priorityMatch = remaining.match(/\b([pP][1-4])\b/);
  if (priorityMatch) {
    priority = priorityMatch[1].toLowerCase() as Priority;
    remaining = remaining.replace(priorityMatch[0], ' ');
  }

  // 5. Parse Due Date / Recurrence:
  // "every day", "every week", "today", "tomorrow", "next week"
  const recurrenceRegex = /\b(every\s+day|every\s+week)\b/i;
  const recMatch = remaining.match(recurrenceRegex);
  if (recMatch) {
    recurrence = recMatch[1].toLowerCase();
    const today = new Date();
    dueDate = formatDate(today);
    remaining = remaining.replace(recMatch[0], ' ');
  } else {
    const todayMatch = remaining.match(/\btoday\b/i);
    if (todayMatch) {
      dueDate = formatDate(new Date());
      remaining = remaining.replace(todayMatch[0], ' ');
    } else {
      const tomorrowMatch = remaining.match(/\btomorrow\b/i);
      if (tomorrowMatch) {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        dueDate = formatDate(d);
        remaining = remaining.replace(tomorrowMatch[0], ' ');
      } else {
        const nextWeekMatch = remaining.match(/\bnext\s+week\b/i);
        if (nextWeekMatch) {
          const d = new Date();
          d.setDate(d.getDate() + 7);
          dueDate = formatDate(d);
          remaining = remaining.replace(nextWeekMatch[0], ' ');
        }
      }
    }
  }

  // Clean title: compress spaces
  const cleanTitle = remaining.replace(/\s+/g, ' ').trim();

  return {
    raw: text,
    cleanTitle: cleanTitle || text.trim(),
    projectName,
    labels,
    priority,
    dueDate,
    deadline,
    recurrence,
  };
}
