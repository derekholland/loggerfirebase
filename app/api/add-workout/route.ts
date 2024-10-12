// app/api/add-workout/route.ts
import { NextResponse } from 'next/server';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../../utils/firebaseClient';

export async function POST(request: Request) {
	try {
		const { title, exercises } = await request.json();

		// Ensure the date is stored as Firebase Timestamp
		const workoutRef = await addDoc(collection(db, 'workouts'), {
			title,
			date: Timestamp.now(), // Store the current date as Firebase Timestamp
		});

		// Store exercises as subcollection under the workout document
		for (const exercise of exercises) {
			const exerciseRef = await addDoc(
				collection(db, `workouts/${workoutRef.id}/exercises`),
				{
					name: exercise.name,
				},
			);

			// Store sets under each exercise
			for (const set of exercise.sets) {
				await addDoc(
					collection(
						db,
						`workouts/${workoutRef.id}/exercises/${exerciseRef.id}/sets`,
					),
					{
						weight: set.weight,
						reps: set.reps,
					},
				);
			}
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error adding workout:', error);
		return NextResponse.json(
			{ error: 'Error adding workout' },
			{ status: 500 },
		);
	}
}
