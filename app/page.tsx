'use client';

import React from 'react';
import { Layout } from '@/components/Layout';
import { TaskView } from '@/components/TaskView';
import { AddTaskModal } from '@/components/AddTaskModal';
import { TaskDrawer } from '@/components/TaskDrawer';
import { TemplateModal } from '@/components/TemplateModal';
import { SystemBuilderModal } from '@/components/SystemBuilderModal';
import { KarmaModal } from '@/components/KarmaModal';
import { AuthModal } from '@/components/AuthModal';
import { TutorialModal } from '@/components/TutorialModal';

export default function Home() {
  return (
    <Layout>
      <TaskView />
      <TaskDrawer />
      <AddTaskModal />
      <TemplateModal />
      <SystemBuilderModal />
      <KarmaModal />
      <AuthModal />
      <TutorialModal />
    </Layout>
  );
}
