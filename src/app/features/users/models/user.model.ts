
export interface RandomUserResponse {
    results: User[];
    info: {
        seed: string;
        results: number;
        page: number;
        version: string;
    };
}

export interface User {
    gender: 'male' | 'female';
    name: {
        title: string;
        first: string;
        last: string;
    };
    location: {
        street: {
            number: number;
            name: string;
        };
        city: string;
        state: string;
        country: string;
        postcode: number | string;
        coordinates: {
            latitude: string;
            longitude: string;
        };
        timezone: {
            offset: string;
            description: string;
        };
    };
    email: string;
    login: {
        uuid: string;
        username: string;
    };
    dob: {
        date: string;
        age: number;
    };
    registered: {
        date: string;
        age: number;
    };
    phone: string;
    cell: string;
    id: {
        name: string;
        value: string | null;
    };
    picture: {
        large: string;
        medium: string;
        thumbnail: string;
    };
    nat: string;
}

export type GroupingCriteria = 'alphabetical' | 'age' | 'nationality' | 'all';

export interface UserGroup {
    name: string;
    users: User[];
}
