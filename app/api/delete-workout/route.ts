import { NextResponse } from 'next/server';
import { doc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../../utils/firebaseClient';

export async function POST(request: Request) {
	try {
		const { id } = await request.json(); // Extract workout ID from request body

		// Reference to the workout document in Firestore
		const workoutRef = doc(db, 'workouts', id);

		// Fetch and delete all exercises and their sets before deleting the workout
		const exercisesSnapshot = await getDocs(
			collection(db, `workouts/${id}/exercises`),
		);
		for (const exerciseDoc of exercisesSnapshot.docs) {
			const setsSnapshot = await getDocs(
				collection(db, `workouts/${id}/exercises/${exerciseDoc.id}/sets`),
			);
			for (const setDoc of setsSnapshot.docs) {
				await deleteDoc(
					doc(
						db,
						`workouts/${id}/exercises/${exerciseDoc.id}/sets/${setDoc.id}`,
					),
				); // Delete each set
			}
			await deleteDoc(doc(db, `workouts/${id}/exercises/${exerciseDoc.id}`)); // Delete each exercise
		}

		// Finally, delete the workout document
		await deleteDoc(workoutRef);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting workout:', error);
		return NextResponse.json(
			{ error: 'Error deleting workout' },
			{ status: 500 },
		);
	}
}
