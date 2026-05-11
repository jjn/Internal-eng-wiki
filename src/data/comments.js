export const comments = [
  {
    id: "c1",
    userId: "u2",
    author: "Marcus Johnson",
    avatarColor: "#2196f3",
    timestamp: "2026-05-08T14:23:00Z",
    text: "Updated the rollback steps in section 5 to reflect the new blue-green deployment process we adopted last sprint. The old steps were referencing the deprecated deploy-v1 CLI.",
  },
  {
    id: "c2",
    userId: "u4",
    author: "Alex Rivera",
    avatarColor: "#4caf50",
    timestamp: "2026-05-09T09:47:00Z",
    text: "Should we add the new Google OAuth provider flow to this runbook? We launched it two weeks ago and on-call has already gotten paged for it twice without any documentation to reference.",
  },
  {
    id: "c3",
    userId: "u6",
    author: "Taylor Brooks",
    avatarColor: "#009688",
    timestamp: "2026-05-09T16:05:00Z",
    text: "Heads up — the Grafana dashboard link in the monitoring section is pointing to the old cluster. I've updated it to the new URL. Also added the PagerDuty escalation policy ID.",
  },
  {
    id: "c4",
    userId: "u1",
    author: "Sarah Chen",
    avatarColor: "#6c63ff",
    timestamp: "2026-05-10T11:30:00Z",
    text: "Good catch Taylor. I also noticed the Redis connection pool config is outdated — we bumped max connections from 20 to 50 after the Black Friday incident. Updating that section now.",
  },
];
