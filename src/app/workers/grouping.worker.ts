
/// <reference lib="webworker" />

import { User, UserGroup, GroupingCriteria } from '../features/users/models/user.model';

addEventListener('message', ({ data }) => {
    const { users, criteria } = data as { users: User[]; criteria: GroupingCriteria };
    const grouped = groupUsers(users, criteria);
    postMessage(grouped);
});

function groupUsers(users: User[], criteria: GroupingCriteria): UserGroup[] {
    if (criteria === 'none') {
        return [{ name: 'All Users', users }];
    }

    const groups: Record<string, User[]> = {};

    for (const user of users) {
        let key = '';

        switch (criteria) {
            case 'alphabetical':
                key = user.name.first.charAt(0).toUpperCase();
                break;
            case 'age':
                // Group by 10s: 20-29, 30-39, etc.
                const decade = Math.floor(user.dob.age / 10) * 10;
                key = `${decade}-${decade + 9}`;
                break;
            case 'nationality':
                key = user.nat;
                break;
        }

        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(user);
    }

    // Convert map to array and sort keys
    return Object.keys(groups)
        .sort()
        .map((key) => ({
            name: key,
            users: groups[key],
        }));
}
