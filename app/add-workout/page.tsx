'use client';
import { useState, useEffect } from 'react';
import { Set, Exercise } from '../types/workout'; // Import TypeScript interfaces
import { useRouter } from 'next/navigation';

// Function to calculate warm-up sets based on working weight

const calculateWarmups = (weight: number): Set[] => {
	return [
		{ weight: Math.round(weight * 0.6), reps: 5 }, // 60% of working weight
		{ weight: Math.round(weight * 0.7), reps: 5 }, // 70%
		{ weight: Math.round(weight * 0.8), reps: 5 }, // 80%
		{ weight: Math.round(weight * 0.9), reps: 5 }, // 90%
	];
};

// AddWorkout component to handle adding workouts with warm-up sets
const AddWorkout: React.FC = () => {
	const router = useRouter();
	const [title, setTitle] = useState<string>(''); // Workout title state
	const [exercise, setExercise] = useState<string>(''); // Current exercise
	const [weight, setWeight] = useState<number>(0); // Working weight for the exercise
	const [warmups, setWarmups] = useState<Set[]>([]); // State to store calculated warm-up sets
	const [exercises, setExercises] = useState<Exercise[]>([]); // List of all added exercises

	// Automatically calculate warm-up sets whenever the weight changes
	useEffect(() => {
		if (weight > 0) {
			setWarmups(calculateWarmups(weight)); // Update warm-up sets when weight changes
		} else {
			setWarmups([]); // Clear warm-ups if weight is cleared
		}
	}, [weight]);

	// Function to handle adding an exercise
	const handleAddExercise = () => {
		if (!exercise || !weight) {
			alert('Please select an exercise and enter a working weight.');
			return;
		}

		// Create the new exercise with calculated warm-up sets and the working set
		const newExercise: Exercise = {
			name: exercise,
			sets: [...warmups, { weight, reps: 5 }], // Add the working set after the warm-ups
		};

		setExercises([...exercises, newExercise]); // Add exercise to the list
		setExercise(''); // Reset inputs
		setWeight(0);
	};

	// Function to handle submitting the workout
	const handleSubmitWorkout = async () => {
		if (!title || exercises.length === 0) {
			alert('Please add a workout title and at least one exercise.');
			return;
		}

		try {
			const response = await fetch('/api/add-workout', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ title, exercises }), // Send the workout data to the API
			});

			if (response.ok) {
				alert('Workout added successfully!');
				setTitle('');
				setExercises([]); // Reset the form
				router.push('/');
			} else {
				alert('Error adding workout.');
			}
		} catch (error) {
			console.error('Error adding workout:', error);
		}
	};

	return (
		<div className='max-w-md mx-auto p-4'>
			<h1 className='text-xl font-bold'>Add Workout</h1>

			{/* Input for the workout title */}
			<input
				type='text'
				value={title}
				onChange={e => setTitle(e.target.value)}
				placeholder='Workout Title'
				className='w-full p-2 border mb-4'
			/>

			{/* Dropdown for selecting an exercise */}
			<select
				value={exercise}
				onChange={e => setExercise(e.target.value)}
				className='w-full p-2 border mb-4'>
				<option value=''>-- Select Exercise --</option>
				<option value='Squat'>Squat</option>
				<option value='Bench Press'>Bench Press</option>
				<option value='Deadlift'>Deadlift</option>
			</select>

			{/* Input for the working weight */}
			<input
				type='number'
				value={weight}
				onChange={e => setWeight(parseInt(e.target.value))}
				placeholder='Working Weight'
				className='w-full p-2 border mb-4'
			/>

			{/* Display the calculated warm-up sets */}
			{warmups.length > 0 && (
				<div className='mb-4'>
					<h3 className='text-lg font-bold'>Warm-up Sets:</h3>
					<ul>
						{warmups.map((set, index) => (
							<li key={index}>
								{set.weight} lbs - {set.reps} reps
							</li>
						))}
					</ul>
				</div>
			)}

			{/* Button to add the exercise */}
			<button
				onClick={handleAddExercise}
				className='bg-green-500 text-white p-2 rounded'>
				Add Exercise
			</button>

			{/* Display the list of added exercises */}
			{exercises.length > 0 && (
				<div className='mt-4'>
					<h3 className='text-lg font-bold'>Exercises Added:</h3>
					<ul>
						{exercises.map((ex, index) => (
							<li key={index}>
								{ex.name} -{' '}
								{ex.sets
									.map(set => `${set.weight} lbs, ${set.reps} reps`)
									.join(' | ')}
							</li>
						))}
					</ul>
				</div>
			)}

			{/* Button to submit the workout */}
			{exercises.length > 0 && (
				<button
					onClick={handleSubmitWorkout}
					className='bg-blue-500 text-white p-2 mt-4 rounded'>
					Finish Workout
				</button>
			)}
		</div>
	);
};

export default AddWorkout;
