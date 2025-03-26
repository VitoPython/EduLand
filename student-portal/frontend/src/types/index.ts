export interface Assignment {
    _id: string;
    title: string;
    description: string;
    code_editor?: string;
    lesson_id: string;
    created_at: string;
    updated_at: string;
}

export interface Lesson {
    _id: string;
    title: string;
    course_id: string;
    created_at: string;
    assignments: Assignment[];
}

export interface Course {
    _id: string;
    title: string;
    description: string;
    duration: number;
    price: number;
    created_at: string;
    lessons: Lesson[];
} 