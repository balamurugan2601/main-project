export const users = [
  {
    id: 'u1',
    name: 'Alice Johnson',
    role: 'user',
    status: 'approved'
  },
  {
    id: 'u2',
    name: 'Bob Smith',
    role: 'user',
    status: 'approved'
  },
  {
    id: 'u3',
    name: 'Charlie Davis',
    role: 'hq',
    status: 'approved'
  },
  {
    id: 'u4',
    name: 'David Wilson',
    role: 'user',
    status: 'pending'
  }
];

export const groups = [
  {
    id: 'g1',
    name: 'Alpha Team',
    members: ['u1', 'u2']
  },
  {
    id: 'g2',
    name: 'Command Center',
    members: ['u1', 'u2', 'u3']
  }
];

export const messages = [
  {
    id: 'm1',
    groupId: 'g1',
    senderId: 'u1',
    encryptedText: 'U2FsdGVkX19WnH4M8Tcdx7cWZFgXZlkxJaziskTCIjycf+2fXLkYt1vmekWSgFV5',
    timestamp: '2025-02-11T08:30:00Z'
  },
  {
    id: 'm2',
    groupId: 'g1',
    senderId: 'u2',
    encryptedText: 'U2FsdGVkX19zheylBVsWvIbzVJpH7i1ySzjSbIYIhZrW6YZNe2FKLJo+GLMNyk6W',
    timestamp: '2025-02-11T08:35:00Z'
  },
  {
    id: 'm3',
    groupId: 'g2',
    senderId: 'u3',
    encryptedText: 'U2FsdGVkX1+nOKSLTY3ibUGfpxfWTeVyo+CdezKAIv4=',
    timestamp: '2025-02-11T09:00:00Z'
  },
  {
    id: 'm4',
    groupId: 'g2',
    senderId: 'u1',
    encryptedText: 'U2FsdGVkX1+hA++VYwud1Wcu4pH1ExnoC2B1I6uFae8=',
    timestamp: '2025-02-11T09:05:00Z'
  },
  {
    id: 'm5',
    groupId: 'g1',
    senderId: 'u1',
    encryptedText: 'U2FsdGVkX1/8o/Ga8VRDbGhyzdROaeXP9IbdZntfeqpUy9UHcSLk8f7vzktxYqMh',
    timestamp: '2025-02-11T10:15:00Z'
  }
];
