export interface Tab {
    _id: string;
    title?: string;
    groups: TabGroup[];
    tempo: number;
    capo: number;
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface TabGroup {
    _id: string;
    tabId: string;
    groupIndex: number;
    notes: Note[][];
}

export interface Note {
    _id: string;
    tabGroupId?: string;
    stringIndex: number;
    fret: string;
    position: number;
    absolutePosition: number;
    type?: 'h' | 'p' | 'space';
}

