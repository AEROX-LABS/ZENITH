'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { AppProvider, useApp } from '@/context/AppContext';
import { Layout } from '@/components/Layout';
import { TaskView } from '@/components/TaskView';
import { AddTaskModal } from '@/components/AddTaskModal';
import { TaskDrawer } from '@/components/TaskDrawer';
import { TemplateModal } from '@/components/TemplateModal';
import { KarmaModal } from '@/components/KarmaModal';
import { AuthModal } from '@/components/AuthModal';
import { TutorialModal } from '@/components/TutorialModal';

function WorkspaceRouteSync() {
  const params = useParams();
  const { setActiveView } = useApp();

  useEffect(() => {
    if (params?.id && typeof params.id === 'string') {
      setActiveView(params.id);
    }
  }, [params?.id, setActiveView]);

  return null;
}

export default function WorkspacePage() {
  return (
    <AppProvider>
      <WorkspaceRouteSync />
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
