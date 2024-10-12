import { Timestamp } from 'firebase/firestore'; // Import Firestore Timestamp type

// Define Set interface
export interface Set {
	weight: number;
	reps: number;
}

// Define Exercise interface
export interface Exercise {
	name: string;
	sets: Set[];
}

// Define Workout interface (date can be a Firestore Timestamp or a JavaScript Date)
export interface Workout {
	id: string;
	title: string;
	date: Timestamp | Date; // Allow date to be either Timestamp or Date
	exercises: Exercise[];
}
