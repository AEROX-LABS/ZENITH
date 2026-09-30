import { CustomTemplate } from '@/types';

/**
 * INITIAL USER-OWNED SYSTEM TEMPLATES
 * Unlike previous static templates, these are full User-Owned Custom Systems stored in 
 * `custom_templates` schema format with full JSONB `system_structure`.
 * Users can launch, architect, edit, or delete these freely.
 */
export const INITIAL_CUSTOM_TEMPLATES: CustomTemplate[] = [
  {
    id: 'tmpl_obsidian_core',
    user_id: null,
    name: 'Obsidian Reactive Engine',
    description: 'High-throughput local-first architecture with real-time replication and multi-node sync.',
    icon: 'Cpu',
    category: 'Architecture',
    color: '#00f0ff',
    system_structure: {
      view_mode: 'board',
      color: '#00f0ff',
      sections: [
        {
          name: 'Core Spec & Blueprints',
          tasks: [
            {
              title: 'Design zero-latency optimistic reducer',
              description: 'Local cache write with optimistic UI updates before remote ack.',
              priority: 'p1',
              labels: ['Architecture', 'Core'],
            },
            {
              title: 'Benchmark SQLite vs IndexedDB persistence layer',
              description: 'Measure read/write IOPS under 10k items.',
              priority: 'p2',
              labels: ['Benchmark'],
            },
          ],
        },
        {
          name: 'Engine Development',
          tasks: [
            {
              title: 'Implement SVG curved branching guide lines',
              description: 'Smooth vector connectors linking parents to hierarchical child subtasks.',
              priority: 'p1',
              labels: ['Frontend', 'Vectors'],
            },
            {
              title: 'Wire broadcast channel for multi-tab sync',
              description: 'Broadcast Channel API listener for instant cross-tab state updates.',
              priority: 'p2',
              labels: ['Realtime'],
            },
          ],
        },
        {
          name: 'Verification & Launch',
          tasks: [
            {
              title: 'Run end-to-end stress tests with 5,000 tasks',
              description: 'Verify 60fps scrolling and instant filtering under load.',
              priority: 'p3',
              labels: ['QA'],
            },
          ],
        },
      ],
    },
    created_at: new Date().toISOString(),
  },
  {
    id: 'tmpl_velocity_sprint',
    user_id: null,
    name: 'Tactical Sprint & Pipeline',
    description: 'Agile 2-week execution cycle with backlog refinement, active dev stages, and QA gate.',
    icon: 'Zap',
    category: 'Engineering',
    color: '#a855f7',
    system_structure: {
      view_mode: 'board',
      color: '#a855f7',
      sections: [
        {
          name: 'Sprint Backlog',
          tasks: [
            {
              title: 'Refactor modal focus trap & keyboard hotkeys',
              description: 'Ensure Cmd+K and Esc behave deterministically in all overlays.',
              priority: 'p2',
              labels: ['Accessibility'],
            },
          ],
        },
        {
          name: 'In Development',
          tasks: [
            {
              title: 'Build user-owned System Architect builder modal',
              description: 'Frosted glass modal with dynamic column and task inputs.',
              priority: 'p1',
              labels: ['Feature', 'UI'],
            },
          ],
        },
        {
          name: 'Quality Gate & Review',
          tasks: [
            {
              title: 'Verify RLS isolation on custom_templates table',
              description: 'Ensure users cannot read or delete foreign template definitions.',
              priority: 'p1',
              labels: ['Security', 'Supabase'],
            },
          ],
        },
        {
          name: 'Shipped to Production',
          tasks: [
            {
              title: 'Deploy v1.0 Obsidian Core release bundle',
              description: 'Automated CI/CD pipeline triggers preview and production tags.',
              priority: 'p3',
              labels: ['Release'],
            },
          ],
        },
      ],
    },
    created_at: new Date().toISOString(),
  },
];
