'use client';

import React from 'react';
import { AppProvider } from '@/context/AppContext';
import { Layout } from '@/components/Layout';
import { TaskView } from '@/components/TaskView';
import { AddTaskModal } from '@/components/AddTaskModal';
import { TaskDrawer } from '@/components/TaskDrawer';
import { TemplateModal } from '@/components/TemplateModal';
import { KarmaModal } from '@/components/KarmaModal';
import { AuthModal } from '@/components/AuthModal';
import { TutorialModal } from '@/components/TutorialModal';

export default function Home() {
  return (
    <AppProvider>
      <Layout>
        <TaskView />
        <TaskDrawer />
        <AddTaskModal />
        <TemplateModal />
        <KarmaModal />
        <AuthModal />
        <TutorialModal />
      </Layout>
    </AppProvider>
  );
}
