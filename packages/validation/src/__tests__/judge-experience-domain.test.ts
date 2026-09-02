import { submitEvaluationSchema } from '../hackathon';

describe('UI-15 Judge Experience Domain Logic', () => {
  const criteria = [
    {
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      name: 'Technical Execution',
      weight: 0.4,
      maxScore: 10,
    },
    {
      id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
      name: 'Novelty & Innovation',
      weight: 0.3,
      maxScore: 10,
    },
    {
      id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
      name: 'Impact & Utility',
      weight: 0.3,
      maxScore: 10,
    },
  ];

  it('should validate valid evaluation submission payload', () => {
    const validPayload = {
      generalFeedback: 'Solid implementation of zero-knowledge privacy circuits.',
      scores: [
        {
          criterionId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          score: 9.0,
          comment: 'Clean Rust code and documentation',
        },
        {
          criterionId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
          score: 8.5,
          comment: 'Creative approach',
        },
        {
          criterionId: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
          score: 8.0,
          comment: null,
        },
      ],
    };

    const parsed = submitEvaluationSchema.safeParse(validPayload);
    expect(parsed.success).toBe(true);
  });

  it('should calculate weighted score percentage accurately', () => {
    const scores = {
      'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11': 9.0, // 9/10 * 0.4 = 0.36
      'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22': 8.0, // 8/10 * 0.3 = 0.24
      'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33': 10.0, // 10/10 * 0.3 = 0.30
    };

    let totalWeightedScore = 0;
    let totalWeight = 0;

    criteria.forEach((c) => {
      const score = scores[c.id as keyof typeof scores];
      const normalizedPercent = (score / c.maxScore) * 100;
      totalWeightedScore += normalizedPercent * c.weight;
      totalWeight += c.weight;
    });

    const finalPercent = Math.round(totalWeightedScore / totalWeight);
    expect(finalPercent).toBe(90); // 36 + 24 + 30 = 90%
  });

  it('should discover the next pending assignment after submission', () => {
    const assignments = [
      { id: 'asgn_1', status: 'COMPLETED' },
      { id: 'asgn_2', status: 'COMPLETED' },
      { id: 'asgn_3', status: 'IN_PROGRESS' },
      { id: 'asgn_4', status: 'ASSIGNED' },
    ];

    const nextPending = assignments.find((a) => a.status !== 'COMPLETED');
    expect(nextPending).toBeDefined();
    expect(nextPending!.id).toBe('asgn_3');
  });

  it('should calculate judge workload progress metrics', () => {
    const assignments = [
      { id: '1', status: 'COMPLETED' },
      { id: '2', status: 'COMPLETED' },
      { id: '3', status: 'IN_PROGRESS' },
      { id: '4', status: 'ASSIGNED' },
      { id: '5', status: 'CONFLICT' },
    ];

    const totalAssigned = assignments.length;
    const completed = assignments.filter((a) => a.status === 'COMPLETED').length;
    const progressPercent = Math.round((completed / totalAssigned) * 100);

    expect(totalAssigned).toBe(5);
    expect(completed).toBe(2);
    expect(progressPercent).toBe(40);
  });
});
