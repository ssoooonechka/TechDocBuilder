import React from 'react';
import { Tabs } from 'antd';
import useWorkspaceStore from '../store/workspaceStore';
import { TemplateEditor, TemplateUpdater } from '../pages/Templates';

const TemplatesMode = () => {
  const { templates, setActiveTemplateTab } = useWorkspaceStore();

  const items = [
    {
      key: 'create',
      label: 'Создать шаблон',
      children: <TemplateEditor />
    },
    {
      key: 'edit',
      label: 'Редактировать шаблон',
      children: <TemplateUpdater />
    }
  ];

  return (
    <div className="templates-mode">
      <Tabs
        activeKey={templates.activeTab}
        onChange={setActiveTemplateTab}
        items={items}
      />
    </div>
  );
};

export default TemplatesMode;