import {
  AnnouncementEntity,
  AnnouncementStatus,
  AnnouncementRecipientScope,
  AnnouncementTemplate,
  AnnouncementMetrics,
} from './announcements-types';

export const OPERATIONAL_TEMPLATES: AnnouncementTemplate[] = [
  {
    id: 'tmpl_deadline_reminder',
    name: 'Submission Deadline Reminder',
    category: 'Submissions',
    title: 'Final 6 Hours: Submission Window Closing Tonight at 11:59 PM UTC',
    body: `Attention all builders:

The official submission window for Hack The Future 2026 closes strictly at 11:59 PM UTC tonight.

Please ensure:
1. Your repository is linked and your main branch is synced.
2. Your project description and 2-minute demo video link are attached.
3. All contributing team members are included on your team roster.

Late submissions will not be admitted to the judging queue. Good luck with your final pushes!`,
    scope: AnnouncementRecipientScope.ALL_PARTICIPANTS,
  },
  {
    id: 'tmpl_judging_kickoff',
    name: 'Judging Window Kickoff',
    category: 'Judging',
    title: 'Judging Window Officially Open: Please Begin Evaluations',
    body: `Dear Reviewers and Domain Judges,

The project submission deadline has passed, and all 84 qualifying repositories have been assigned to your scoring queues.

Please review the judging criteria and rubric before evaluating:
- Technical Architecture & Code Integrity (30%)
- Innovation & Problem Significance (25%)
- Working Demo & User Experience (25%)
- Presentation & Documentation (20%)

Target completion time: All evaluations must be submitted by tomorrow at 4:00 PM UTC.`,
    scope: AnnouncementRecipientScope.ALL_JUDGES,
  },
  {
    id: 'tmpl_team_matching',
    name: 'Team Matching Assistance',
    category: 'Team Formation',
    title: 'Team Formation Window: Unassigned Participants & Open Squads',
    body: `Looking for teammates?

The team formation window is open. If you are an unassigned participant, please visit the Teams directory to browse open squads or list your profile for matchmaking.

Remember: All projects must have between 1 and 4 verified members before the hacking window begins.`,
    scope: AnnouncementRecipientScope.ALL_PARTICIPANTS,
  },
  {
    id: 'tmpl_results_published',
    name: 'Official Results Broadcast',
    category: 'Results',
    title: 'Official Hackathon Results & Winners Announced!',
    body: `The evaluations are in!

After rigorous review across 84 project submissions and calibrated scoring from our panel of judges, the official results and winners of Hack The Future 2026 are now live on the Leaderboard.

Congratulations to our Grand Champions, Track Winners, and all finalists! Thank you to every builder for participating.`,
    scope: AnnouncementRecipientScope.ALL_PARTICIPANTS,
  },
  {
    id: 'tmpl_certificates_available',
    name: 'Verifiable Credentials Ready',
    category: 'Certificates',
    title: 'Your Official Verifiable Certificates Are Now Available',
    body: `Congratulations on completing Hack The Future 2026!

Official digital credentials with cryptographic SHA-256 signatures have been issued to all eligible builders and winning teams.

Visit your Certificates tab to preview, download PDF credentials, and share your public verification link.`,
    scope: AnnouncementRecipientScope.ALL_PARTICIPANTS,
  },
];

export const MOCK_ANNOUNCEMENTS: AnnouncementEntity[] = [
  {
    id: 'ann_01',
    hackathonId: 'htf-2026',
    organizationId: 'org_alex_labs',
    authorId: 'usr_org_01',
    title: 'Final 6 Hours: Submission Window Closing Tonight at 11:59 PM UTC',
    body: `Attention all builders: The official submission window for Hack The Future 2026 closes strictly at 11:59 PM UTC tonight. Ensure your GitHub commits are pushed and demo links verified.`,
    status: AnnouncementStatus.PUBLISHED,
    recipientScope: AnnouncementRecipientScope.ALL_PARTICIPANTS,
    targetTrackId: null,
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    version: 1,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    author: {
      id: 'usr_org_01',
      email: 'lead@alexlabs.dev',
      name: 'Alex Sharma',
    },
  },
  {
    id: 'ann_02',
    hackathonId: 'htf-2026',
    organizationId: 'org_alex_labs',
    authorId: 'usr_org_01',
    title: 'Judging Window Opens Tomorrow at 9:00 AM UTC',
    body: `All domain judges: Review assignments will appear on your workspace dashboard at 9:00 AM UTC. Please join the judges briefing link in your email.`,
    status: AnnouncementStatus.SCHEDULED,
    recipientScope: AnnouncementRecipientScope.ALL_JUDGES,
    targetTrackId: null,
    scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(),
    version: 1,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    author: {
      id: 'usr_org_01',
      email: 'lead@alexlabs.dev',
      name: 'Alex Sharma',
    },
  },
  {
    id: 'ann_03',
    hackathonId: 'htf-2026',
    organizationId: 'org_alex_labs',
    authorId: 'usr_org_02',
    title: 'AI Safety & Intelligent Workflows Track: Office Hours at 4 PM',
    body: `Track participants: Mentors from the AI safety team will be hosting live Q&A in Discord Stage A to help with LLM evaluation pipelines and API integration.`,
    status: AnnouncementStatus.PUBLISHED,
    recipientScope: AnnouncementRecipientScope.TRACK,
    targetTrackId: 'trk_ai',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    version: 1,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    author: {
      id: 'usr_org_02',
      email: 'priya@alexlabs.dev',
      name: 'Priya Sharma',
    },
  },
  {
    id: 'ann_04',
    hackathonId: 'htf-2026',
    organizationId: 'org_alex_labs',
    authorId: 'usr_org_01',
    title: 'Closing Ceremony & Finalist Presentations Livestream Link',
    body: `Draft: Join us tomorrow for the closing ceremony where our top 5 finalists will present 3-minute live demos before final award announcements.`,
    status: AnnouncementStatus.DRAFT,
    recipientScope: AnnouncementRecipientScope.ALL_PARTICIPANTS,
    targetTrackId: null,
    version: 1,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    author: {
      id: 'usr_org_01',
      email: 'lead@alexlabs.dev',
      name: 'Alex Sharma',
    },
  },
  {
    id: 'ann_05',
    hackathonId: 'htf-2026',
    organizationId: 'org_alex_labs',
    authorId: 'usr_org_01',
    title: 'Scheduled Cloud Infrastructure Maintenance Notice',
    body: `This scheduled notification was cancelled as maintenance completed without downtime.`,
    status: AnnouncementStatus.CANCELLED,
    recipientScope: AnnouncementRecipientScope.ALL_ORGANIZERS,
    targetTrackId: null,
    cancelledAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    version: 2,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    author: {
      id: 'usr_org_01',
      email: 'lead@alexlabs.dev',
      name: 'Alex Sharma',
    },
  },
];

export const MOCK_ANNOUNCEMENT_METRICS: AnnouncementMetrics = {
  total: 5,
  published: 2,
  scheduled: 1,
  drafts: 1,
  recipientsReached: 1460,
};
