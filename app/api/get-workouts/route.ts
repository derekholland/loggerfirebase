import { NextResponse } from 'next/server';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../utils/firebaseClient';

export async function GET() {
	try {
		// Fetch all workouts from the "workouts" collection
		const workoutCollection = collection(db, 'workouts');
		const workoutSnapshot = await getDocs(workoutCollection);

		// Map workout documents to workout objects with exercises and sets
		const workouts = await Promise.all(
			workoutSnapshot.docs.map(async doc => {
				// Fetch exercises as a subcollection of the workout
				const exercisesSnapshot = await getDocs(
					collection(db, `workouts/${doc.id}/exercises`),
				);
				const exercises = await Promise.all(
					exercisesSnapshot.docs.map(async exerciseDoc => {
						const setsSnapshot = await getDocs(
							collection(
								db,
								`workouts/${doc.id}/exercises/${exerciseDoc.id}/sets`,
							),
						);
						const sets = setsSnapshot.docs.map(setDoc => ({
							weight: setDoc.data().weight,
							reps: setDoc.data().reps,
						}));

						return {
							name: exerciseDoc.data().name,
							sets,
						};
					}),
				);

				return {
					id: doc.id,
					title: doc.data().title,
					date: doc.data().date, // Timestamp is stored here
					exercises,
				};
			}),
		);

		return NextResponse.json({ success: true, workouts });
	} catch (error) {
		console.error('Error fetching workouts:', error);
		return NextResponse.json(
			{ error: 'Error fetching workouts' },
			{ status: 500 },
		);
	}
}
