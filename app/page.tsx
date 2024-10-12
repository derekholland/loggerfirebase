'use client';
import { useEffect, useState } from 'react';
import { Workout } from './types/workout';
import { Timestamp } from 'firebase/firestore'; // Import Firestore Timestamp

const MainPage: React.FC = () => {
	const [workouts, setWorkouts] = useState<Workout[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchWorkouts = async () => {
			try {
				const response = await fetch('/api/get-workouts');
				const data = await response.json();

				if (data.success) {
					const convertedWorkouts = data.workouts.map((workout: Workout) => ({
						...workout,
						// Convert Firestore Timestamp to JS Date if needed
						date:
							workout.date instanceof Timestamp
								? workout.date.toDate() // Convert Firestore Timestamp to JavaScript Date
								: workout.date, // Leave it as is if it's already a Date
					}));

					setWorkouts(convertedWorkouts);
				} else {
					setError('Failed to fetch workouts.');
				}
			} catch (err) {
				setError('An error occurred while fetching workouts.');
				console.error(err);
			} finally {
				setLoading(false);
			}
		};

		fetchWorkouts();
	}, []);

	// Function to handle deleting a workout
	const handleDeleteWorkout = async (id: string) => {
		const confirmDelete = confirm(
			'Are you sure you want to delete this workout?',
		);
		if (!confirmDelete) return;

		try {
			const response = await fetch('/api/delete-workout', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ id }),
			});

			if (response.ok) {
				setWorkouts(prevWorkouts =>
					prevWorkouts.filter(workout => workout.id !== id),
				);
			} else {
				alert('Error deleting workout.');
			}
		} catch (error) {
			console.error('Error deleting workout:', error);
			alert('Error deleting workout.');
		}
	};

	return (
		<div className='max-w-4xl mx-auto p-4'>
			<h1 className='text-2xl font-bold mb-4'>Workouts</h1>

			{loading && <p>Loading workouts...</p>}
			{error && <p className='text-red-500'>{error}</p>}

			{!loading && !error && workouts.length === 0 && <p>No workouts found.</p>}

			{!loading &&
				!error &&
				workouts.length > 0 &&
				workouts.map((workout: Workout) => (
					<div key={workout.id} className='p-4 border mb-4 rounded shadow-sm'>
						<h2 className='text-lg font-semibold'>{workout.title}</h2>
						<p className='text-gray-600'>
							{/* Use toLocaleDateString() only if date is a valid JavaScript Date */}
							Date:{' '}
							{workout.date instanceof Date
								? workout.date.toLocaleDateString()
								: 'Invalid date'}
						</p>

						{workout.exercises.length > 0 ? (
							<div>
								<h3 className='font-bold mt-2'>Exercises:</h3>
								<ul>
									{workout.exercises.map((exercise, index) => (
										<li key={index}>
											{exercise.name}:{' '}
											{exercise.sets
												.map(set => `${set.weight} lbs x ${set.reps} reps`)
												.join(', ')}
										</li>
									))}
								</ul>
							</div>
						) : (
							<p>No exercises found for this workout.</p>
						)}

						<button
							onClick={() => handleDeleteWorkout(workout.id)}
							className='bg-red-500 text-white p-2 mt-4 rounded'>
							Delete Workout
						</button>
					</div>
				))}
		</div>
	);
};

export default MainPage;
