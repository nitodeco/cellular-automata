export function ceilPowerOfTwo(value: number): number {
	return 2 ** Math.ceil(Math.log2(value));
}

export function gaussianRandom(
	mean: number,
	standardDeviation: number,
): number {
	const uniformRandom1 = Math.random();
	const uniformRandom2 = Math.random();
	const boxMullerTransform =
		Math.sqrt(-2 * Math.log(uniformRandom1)) *
		Math.cos(2 * Math.PI * uniformRandom2);
	return mean + standardDeviation * boxMullerTransform;
}

export function clampedGaussianRandom(
	min: number,
	max: number,
	mean: number,
	standardDeviation: number,
): number {
	const value = gaussianRandom(mean, standardDeviation);
	return Math.max(min, Math.min(max, value));
}

export function generateRandomPopulationRatios(
	speciesCount: number,
	minimumPercentage: number,
): number[] {
	const availablePercentage = 100 - speciesCount * minimumPercentage;
	const randomValues = Array.from({ length: speciesCount }, () =>
		Math.random(),
	);
	const totalRandomValue = randomValues.reduce((sum, value) => sum + value, 0);

	return randomValues.map(
		(value) =>
			Math.round(
				(minimumPercentage + (value / totalRandomValue) * availablePercentage) *
					100,
			) / 100,
	);
}
