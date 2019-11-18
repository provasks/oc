export const Settings: any = {
  perfArchive: 'PerfArchive - ontap',
  languages: ['en', 'ja', 'zh', 'zh-CN', 'zh-cn'],
  defaultTranslation: 'default',
  autoDiscovery: {
    filter: [
      {
        value: 'offline',
        text: 'Offline'
      },
      {
        value: 'online',
        text: 'Online'
      },
      {
        value: 'mapped',
        text: 'Mapped'
      },
      {
        value: 'unmapped',
        text: 'Unmapped'
      },
      {
        value: 'all',
        text: 'All'
      }
    ],
    selected: 'online',
    progressInterval: 3000,
    notification: {
      width: '300',
      color: 'red'
    },
    validation: {
      subnet: {
        min: 20,
        max: 32
      }
    }
  },
  credentialManagement: {
    showSubtypes: false,
    allSelected: false,
    defaultPort: 22,
    priorities: ['High', 'Medium', 'Low'],
    defaultPriority: 'High'
  },
  Objectives: [
    {
      id: 1,
      name: 'Purpose_presales_name',
      description: 'Purpose_presales_description',
      image: 'pre-sales.png',
      purposes: [
        { component: 'performance', keyword: 'presales' },
        {
          component: 'device-based',
          valueOf: 'type',
          keyword: 'Other Storage Controller'
        }
      ]
    },
    {
      id: 2,
      name: 'Purpose_healthcheck_name',
      description: 'Purpose_healthcheck_description',
      image: 'healthcheck.png',
      purposes: [
        {
          component: 'solution-based',
          persona: 'Analysis',
          keyword: 'healthcheck'
        },
        { component: 'asup-based' }
      ]
    },
    {
      id: 3,
      name: 'Purpose_upgrade_name',
      description: 'Purpose_upgrade_description',
      image: 'upgradeormigration.png',
      purposes: [
        { component: 'device-based', valueOf: 'persona', keyword: 'general' }
      ]
    },
    {
      id: 4,
      name: 'Purpose_case_troubleshooting_name',
      description: 'Purpose_case_troubleshooting_description',
      image: 'casetroubleshooting.png',
      purposes: [
        {
          component: 'device-based',
          valueOf: 'persona',
          keyword: 'diagnostic'
        }
      ]
    }
  ]
};
