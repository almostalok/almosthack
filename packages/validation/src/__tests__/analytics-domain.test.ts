describe('UI-12 Analytics and Insights Domain Logic', () => {
  const sampleFunnel = [
    { stage: 'Registered', count: 1240 },
    { stage: 'Approved', count: 1080 },
    { stage: 'Team Formed', count: 912 },
    { stage: 'Submitted', count: 684 },
  ];

  it('should accurately compute stage-by-stage drop-off percentages', () => {
    const computed = sampleFunnel.map((item, idx) => {
      const percentage = (item.count / sampleFunnel[0].count) * 100;
      const prevCount = idx === 0 ? item.count : sampleFunnel[idx - 1].count;
      const dropoffPercentage = ((prevCount - item.count) / prevCount) * 100;
      return {
        ...item,
        percentage: Number(percentage.toFixed(1)),
        dropoffPercentage: Number(dropoffPercentage.toFixed(1)),
      };
    });

    expect(computed[0].percentage).toBe(100.0);
    expect(computed[1].percentage).toBe(87.1);
    expect(computed[2].percentage).toBe(73.5);
    expect(computed[3].percentage).toBe(55.2);

    expect(computed[1].dropoffPercentage).toBe(12.9);
    expect(computed[2].dropoffPercentage).toBe(15.6);
  });

  it('should calculate deadline rush concentration correctly', () => {
    const arrivals = [
      { bucket: 'T-24h', count: 8, isDeadlineWindow: false },
      { bucket: 'T-18h', count: 12, isDeadlineWindow: false },
      { bucket: 'T-12h', count: 13, isDeadlineWindow: false },
      { bucket: 'T-6h', count: 21, isDeadlineWindow: true },
      { bucket: 'T-2h', count: 20, isDeadlineWindow: true },
      { bucket: 'T-30m', count: 10, isDeadlineWindow: true },
    ];

    const total = arrivals.reduce((acc, a) => acc + a.count, 0);
    const deadlineRush = arrivals
      .filter((a) => a.isDeadlineWindow)
      .reduce((acc, a) => acc + a.count, 0);

    const deadlinePercentage = Number(((deadlineRush / total) * 100).toFixed(1));
    expect(total).toBe(84);
    expect(deadlineRush).toBe(51);
    expect(deadlinePercentage).toBe(60.7);
  });

  it('should compute unassigned builder ratio accurately', () => {
    const totalApproved = 1080;
    const assignedBuilders = 912;
    const unassigned = totalApproved - assignedBuilders;

    const unassignedPercentage = Number(((unassigned / totalApproved) * 100).toFixed(1));
    expect(unassigned).toBe(168);
    expect(unassignedPercentage).toBe(15.6);
  });
});
