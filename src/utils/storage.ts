import type {
	ColorPresetName,
	SlimeConfig,
	SpawnPattern,
	SpeciesConfig,
} from "../core/slime";

export interface SimulationSettings {
	speed: number;
	slimeConfig: SlimeConfig;
}

export interface SpeciesLockedSettings {
	sensorAngle: boolean;
	turnAngle: boolean;
	sensorDist: boolean;
	agentSpeed: boolean;
	depositAmount: boolean;
	colorPreset: boolean;
	agentCount: boolean;
}

export interface LockedSettings {
	decayRate: boolean;
	diffuseWeight: boolean;
	agentCount: boolean;
	enabledSpawnPatterns: SpawnPattern[];
	interactions: boolean;
	species: [
		SpeciesLockedSettings,
		SpeciesLockedSettings,
		SpeciesLockedSettings,
	];
}

export const DEFAULT_SPECIES_LOCKED_SETTINGS: SpeciesLockedSettings = {
	sensorAngle: false,
	turnAngle: false,
	sensorDist: false,
	agentSpeed: false,
	depositAmount: false,
	colorPreset: false,
	agentCount: false,
};

export const DEFAULT_LOCKED_SETTINGS: LockedSettings = {
	decayRate: false,
	diffuseWeight: false,
	agentCount: false,
	enabledSpawnPatterns: ["center", "circle", "multiCircle", "spiral"],
	interactions: false,
	species: [
		{ ...DEFAULT_SPECIES_LOCKED_SETTINGS },
		{ ...DEFAULT_SPECIES_LOCKED_SETTINGS },
		{ ...DEFAULT_SPECIES_LOCKED_SETTINGS },
	],
};

export const SIMULATION_SETTINGS_KEY = "simulation-settings";
export const LOCKED_SETTINGS_KEY = "locked-settings";

const VALID_COLOR_PRESET_NAMES: readonly ColorPresetName[] = [
	"neon",
	"ocean",
	"ember",
	"toxic",
	"void",
	"sunset",
	"forest",
	"arctic",
	"lava",
	"plasma",
	"aurora",
	"fire",
] as const;

const VALID_SPAWN_PATTERNS: readonly SpawnPattern[] = [
	"random",
	"center",
	"circle",
	"multiCircle",
	"spiral",
] as const;

function isValidColorPresetName(value: unknown): value is ColorPresetName {
	return (
		typeof value === "string" &&
		VALID_COLOR_PRESET_NAMES.includes(value as ColorPresetName)
	);
}

function isValidSpawnPattern(value: unknown): value is SpawnPattern {
	return (
		typeof value === "string" &&
		VALID_SPAWN_PATTERNS.includes(value as SpawnPattern)
	);
}

function isValidSpeciesConfig(value: unknown): value is SpeciesConfig {
	if (typeof value !== "object" || value === null) {
		return false;
	}

	const config = value as Record<string, unknown>;

	return (
		typeof config.sensorAngle === "number" &&
		typeof config.turnAngle === "number" &&
		typeof config.sensorDist === "number" &&
		typeof config.agentSpeed === "number" &&
		typeof config.depositAmount === "number" &&
		isValidColorPresetName(config.colorPreset) &&
		typeof config.agentCount === "number"
	);
}

function isValidSlimeConfig(value: unknown): value is SlimeConfig {
	if (typeof value !== "object" || value === null) {
		return false;
	}

	const config = value as Record<string, unknown>;

	if (
		typeof config.decayRate !== "number" ||
		typeof config.diffuseWeight !== "number" ||
		typeof config.agentCount !== "number"
	) {
		return false;
	}

	if (!Array.isArray(config.enabledSpawnPatterns)) {
		return false;
	}

	if (config.enabledSpawnPatterns.length === 0) {
		return false;
	}

	for (const pattern of config.enabledSpawnPatterns) {
		if (!isValidSpawnPattern(pattern)) {
			return false;
		}
	}

	if (!Array.isArray(config.species) || config.species.length !== 3) {
		return false;
	}

	if (
		!isValidSpeciesConfig(config.species[0]) ||
		!isValidSpeciesConfig(config.species[1]) ||
		!isValidSpeciesConfig(config.species[2])
	) {
		return false;
	}

	if (!Array.isArray(config.interactions) || config.interactions.length !== 3) {
		return false;
	}

	for (const interaction of config.interactions) {
		if (
			!Array.isArray(interaction) ||
			interaction.length !== 3 ||
			typeof interaction[0] !== "number" ||
			typeof interaction[1] !== "number" ||
			typeof interaction[2] !== "number"
		) {
			return false;
		}
	}

	return true;
}

function isValidSimulationSettings(
	value: unknown,
): value is SimulationSettings {
	if (typeof value !== "object" || value === null) {
		return false;
	}

	const settings = value as Record<string, unknown>;

	return (
		typeof settings.speed === "number" &&
		isValidSlimeConfig(settings.slimeConfig)
	);
}

function migrateSlimeConfig(config: Record<string, unknown>): void {
	if ("spawnPattern" in config && !("enabledSpawnPatterns" in config)) {
		const oldPattern = config.spawnPattern;
		if (isValidSpawnPattern(oldPattern)) {
			const patternsWithoutRandom = VALID_SPAWN_PATTERNS.filter(
				(pattern) => pattern !== "random",
			);
			config.enabledSpawnPatterns =
				oldPattern === "random"
					? patternsWithoutRandom
					: [oldPattern as SpawnPattern];
			delete config.spawnPattern;
		}
	}
}

export function loadSimulationSettings(): SimulationSettings | null {
	try {
		const stored = localStorage.getItem(SIMULATION_SETTINGS_KEY);
		if (stored === null) {
			return null;
		}

		const parsed = JSON.parse(stored);
		if (parsed?.slimeConfig) {
			migrateSlimeConfig(parsed.slimeConfig);
		}
		return isValidSimulationSettings(parsed) ? parsed : null;
	} catch {
		return null;
	}
}

export function saveSimulationSettings(settings: SimulationSettings): void {
	try {
		localStorage.setItem(SIMULATION_SETTINGS_KEY, JSON.stringify(settings));
	} catch {}
}

const DELTA_VERSION = 2;
const FIXED_BINARY_VERSION = 1;
const FIXED_BINARY_BUFFER_SIZE = 37;
const DEFAULT_SPEED = 5;
const DEFAULT_DECAY_RATE = 2;
const DEFAULT_DIFFUSE_WEIGHT = 0.1;
const DEFAULT_AGENT_COUNT = 5;
const DEFAULT_SPAWN_PATTERNS_BITMASK = 0b11110;
const DEFAULT_SENSOR_ANGLE = Math.round((Math.PI / 4) * 100);
const DEFAULT_TURN_ANGLE = Math.round((Math.PI / 4) * 100);
const DEFAULT_SENSOR_DIST = 9;
const DEFAULT_AGENT_SPEED = 10;
const DEFAULT_DEPOSIT_AMOUNT = 50;
const DEFAULT_SPECIES_AGENT_COUNT = 33;
const DEFAULT_COLOR_PRESETS = [0, 11, 1];
const DEFAULT_INTERACTION_DIAGONAL = 100;
const DEFAULT_INTERACTION_OFF_DIAGONAL = -10;

enum FieldId {
	Speed = 0,
	UseWebGPU = 1,
	DecayRate = 2,
	DiffuseWeight = 3,
	SpawnPatterns = 4,
	AgentCount = 5,

	Species0SensorAngle = 10,
	Species0TurnAngle = 11,
	Species0SensorDist = 12,
	Species0AgentSpeed = 13,
	Species0DepositAmount = 14,
	Species0ColorPreset = 15,
	Species0AgentCount = 16,

	Species1SensorAngle = 20,
	Species1TurnAngle = 21,
	Species1SensorDist = 22,
	Species1AgentSpeed = 23,
	Species1DepositAmount = 24,
	Species1ColorPreset = 25,
	Species1AgentCount = 26,

	Species2SensorAngle = 30,
	Species2TurnAngle = 31,
	Species2SensorDist = 32,
	Species2AgentSpeed = 33,
	Species2DepositAmount = 34,
	Species2ColorPreset = 35,
	Species2AgentCount = 36,

	Interaction00 = 40,
	Interaction01 = 41,
	Interaction02 = 42,
	Interaction10 = 43,
	Interaction11 = 44,
	Interaction12 = 45,
	Interaction20 = 46,
	Interaction21 = 47,
	Interaction22 = 48,
}

const FIELD_SIZES: Record<number, number> = {
	[FieldId.AgentCount]: 2,
};

function getFieldSize(fieldId: number): number {
	return FIELD_SIZES[fieldId] ?? 1;
}

function spawnPatternsToBitmask(patterns: SpawnPattern[]): number {
	let bitmask = 0;

	for (const pattern of patterns) {
		const index = VALID_SPAWN_PATTERNS.indexOf(pattern);

		if (index !== -1) {
			bitmask |= 1 << index;
		}
	}

	return bitmask;
}

function bitmaskToSpawnPatterns(bitmask: number): SpawnPattern[] {
	const patterns: SpawnPattern[] = [];

	for (let index = 0; index < VALID_SPAWN_PATTERNS.length; index++) {
		if (bitmask & (1 << index)) {
			patterns.push(VALID_SPAWN_PATTERNS[index]);
		}
	}

	return patterns;
}

function colorPresetToIndex(preset: ColorPresetName): number {
	return VALID_COLOR_PRESET_NAMES.indexOf(preset);
}

function indexToColorPreset(index: number): ColorPresetName {
	return VALID_COLOR_PRESET_NAMES[index] ?? "neon";
}

function toUrlSafeBase64(base64: string): string {
	return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromUrlSafeBase64(urlSafe: string): string {
	let base64 = urlSafe.replace(/-/g, "+").replace(/_/g, "/");

	while (base64.length % 4 !== 0) {
		base64 += "=";
	}

	return base64;
}

function collectDeltaFields(settings: SimulationSettings): [number, number][] {
	const fields: [number, number][] = [];
	const config = settings.slimeConfig;

	if (Math.round(settings.speed) !== DEFAULT_SPEED) {
		fields.push([FieldId.Speed, Math.round(settings.speed)]);
	}

	if (Math.round(config.decayRate * 10) !== DEFAULT_DECAY_RATE * 10) {
		fields.push([FieldId.DecayRate, Math.round(config.decayRate * 10)]);
	}

	if (Math.round(config.diffuseWeight * 100) !== DEFAULT_DIFFUSE_WEIGHT * 100) {
		fields.push([
			FieldId.DiffuseWeight,
			Math.round(config.diffuseWeight * 100),
		]);
	}

	const spawnBitmask = spawnPatternsToBitmask(config.enabledSpawnPatterns);

	if (spawnBitmask !== DEFAULT_SPAWN_PATTERNS_BITMASK) {
		fields.push([FieldId.SpawnPatterns, spawnBitmask]);
	}

	if (Math.round(config.agentCount * 100) !== DEFAULT_AGENT_COUNT * 100) {
		fields.push([FieldId.AgentCount, Math.round(config.agentCount * 100)]);
	}

	const speciesBaseIds = [
		FieldId.Species0SensorAngle,
		FieldId.Species1SensorAngle,
		FieldId.Species2SensorAngle,
	];

	for (let speciesIdx = 0; speciesIdx < 3; speciesIdx++) {
		const species = config.species[speciesIdx];
		const baseId = speciesBaseIds[speciesIdx];

		const sensorAngle = Math.round(species.sensorAngle * 100);

		if (sensorAngle !== DEFAULT_SENSOR_ANGLE) {
			fields.push([baseId + 0, sensorAngle]);
		}

		const turnAngle = Math.round(species.turnAngle * 100);

		if (turnAngle !== DEFAULT_TURN_ANGLE) {
			fields.push([baseId + 1, turnAngle]);
		}

		if (Math.round(species.sensorDist) !== DEFAULT_SENSOR_DIST) {
			fields.push([baseId + 2, Math.round(species.sensorDist)]);
		}

		const agentSpeed = Math.round(species.agentSpeed * 10);

		if (agentSpeed !== DEFAULT_AGENT_SPEED) {
			fields.push([baseId + 3, agentSpeed]);
		}

		if (Math.round(species.depositAmount) !== DEFAULT_DEPOSIT_AMOUNT) {
			fields.push([baseId + 4, Math.round(species.depositAmount)]);
		}

		const colorIndex = colorPresetToIndex(species.colorPreset);

		if (colorIndex !== DEFAULT_COLOR_PRESETS[speciesIdx]) {
			fields.push([baseId + 5, colorIndex]);
		}

		const speciesAgentCount = Math.round(species.agentCount);

		if (speciesAgentCount !== DEFAULT_SPECIES_AGENT_COUNT) {
			fields.push([baseId + 6, speciesAgentCount]);
		}
	}

	for (let row = 0; row < 3; row++) {
		for (let col = 0; col < 3; col++) {
			const value = Math.round(config.interactions[row][col] * 100);
			const defaultValue =
				row === col
					? DEFAULT_INTERACTION_DIAGONAL
					: DEFAULT_INTERACTION_OFF_DIAGONAL;

			if (value !== defaultValue) {
				const fieldId = FieldId.Interaction00 + row * 3 + col;
				fields.push([fieldId, value < 0 ? 256 + value : value]);
			}
		}
	}

	return fields;
}

export function encodeSimulationSettings(settings: SimulationSettings): string {
	const fields = collectDeltaFields(settings);

	let bufferSize = 2;

	for (const [fieldId] of fields) {
		bufferSize += 1 + getFieldSize(fieldId);
	}

	const buffer = new ArrayBuffer(bufferSize);
	const view = new DataView(buffer);

	view.setUint8(0, DELTA_VERSION);
	view.setUint8(1, fields.length);

	let offset = 2;

	for (const [fieldId, value] of fields) {
		view.setUint8(offset, fieldId);
		offset++;

		const size = getFieldSize(fieldId);

		if (size === 2) {
			view.setUint16(offset, value, true);
			offset += 2;
		} else {
			view.setUint8(offset, value);
			offset++;
		}
	}

	const bytes = new Uint8Array(buffer);
	const binaryString = String.fromCharCode(...bytes);

	return toUrlSafeBase64(btoa(binaryString));
}

export function decodeSimulationSettings(
	encoded: string,
): SimulationSettings | null {
	try {
		const base64 = fromUrlSafeBase64(encoded);
		const binaryString = atob(base64);

		if (binaryString.length < 2) {
			return decodeLegacyJsonSettings(encoded);
		}

		const bytes = new Uint8Array(binaryString.length);

		for (let charIndex = 0; charIndex < binaryString.length; charIndex++) {
			bytes[charIndex] = binaryString.charCodeAt(charIndex);
		}

		const view = new DataView(bytes.buffer);
		const version = view.getUint8(0);

		if (version === DELTA_VERSION) {
			return decodeDeltaSettings(view, bytes.length);
		}

		if (
			version === FIXED_BINARY_VERSION &&
			binaryString.length === FIXED_BINARY_BUFFER_SIZE
		) {
			return decodeFixedBinarySettings(view);
		}

		return decodeLegacyJsonSettings(encoded);
	} catch {
		return decodeLegacyJsonSettings(encoded);
	}
}

function decodeDeltaSettings(
	view: DataView,
	length: number,
): SimulationSettings | null {
	const numFields = view.getUint8(1);

	const settings: SimulationSettings = {
		speed: DEFAULT_SPEED,
		slimeConfig: {
			decayRate: DEFAULT_DECAY_RATE,
			diffuseWeight: DEFAULT_DIFFUSE_WEIGHT,
			enabledSpawnPatterns: bitmaskToSpawnPatterns(
				DEFAULT_SPAWN_PATTERNS_BITMASK,
			),
			agentCount: DEFAULT_AGENT_COUNT,
			species: [
				{
					sensorAngle: DEFAULT_SENSOR_ANGLE / 100,
					turnAngle: DEFAULT_TURN_ANGLE / 100,
					sensorDist: DEFAULT_SENSOR_DIST,
					agentSpeed: DEFAULT_AGENT_SPEED / 10,
					depositAmount: DEFAULT_DEPOSIT_AMOUNT,
					colorPreset: indexToColorPreset(DEFAULT_COLOR_PRESETS[0]),
					agentCount: DEFAULT_SPECIES_AGENT_COUNT,
				},
				{
					sensorAngle: DEFAULT_SENSOR_ANGLE / 100,
					turnAngle: DEFAULT_TURN_ANGLE / 100,
					sensorDist: DEFAULT_SENSOR_DIST,
					agentSpeed: DEFAULT_AGENT_SPEED / 10,
					depositAmount: DEFAULT_DEPOSIT_AMOUNT,
					colorPreset: indexToColorPreset(DEFAULT_COLOR_PRESETS[1]),
					agentCount: DEFAULT_SPECIES_AGENT_COUNT,
				},
				{
					sensorAngle: DEFAULT_SENSOR_ANGLE / 100,
					turnAngle: DEFAULT_TURN_ANGLE / 100,
					sensorDist: DEFAULT_SENSOR_DIST,
					agentSpeed: DEFAULT_AGENT_SPEED / 10,
					depositAmount: DEFAULT_DEPOSIT_AMOUNT,
					colorPreset: indexToColorPreset(DEFAULT_COLOR_PRESETS[2]),
					agentCount: DEFAULT_SPECIES_AGENT_COUNT,
				},
			],
			interactions: [
				[
					DEFAULT_INTERACTION_DIAGONAL / 100,
					DEFAULT_INTERACTION_OFF_DIAGONAL / 100,
					DEFAULT_INTERACTION_OFF_DIAGONAL / 100,
				],
				[
					DEFAULT_INTERACTION_OFF_DIAGONAL / 100,
					DEFAULT_INTERACTION_DIAGONAL / 100,
					DEFAULT_INTERACTION_OFF_DIAGONAL / 100,
				],
				[
					DEFAULT_INTERACTION_OFF_DIAGONAL / 100,
					DEFAULT_INTERACTION_OFF_DIAGONAL / 100,
					DEFAULT_INTERACTION_DIAGONAL / 100,
				],
			],
		},
	};

	let offset = 2;

	for (let fieldIdx = 0; fieldIdx < numFields; fieldIdx++) {
		if (offset >= length) break;

		const fieldId = view.getUint8(offset);
		offset++;

		const size = getFieldSize(fieldId);

		if (offset + size > length) break;

		let value: number;

		if (size === 2) {
			value = view.getUint16(offset, true);
			offset += 2;
		} else {
			value = view.getUint8(offset);
			offset++;
		}

		applyFieldValue(settings, fieldId, value);
	}

	return isValidSimulationSettings(settings) ? settings : null;
}

function applyFieldValue(
	settings: SimulationSettings,
	fieldId: number,
	value: number,
): void {
	const config = settings.slimeConfig;

	switch (fieldId) {
		case FieldId.Speed:
			settings.speed = value;
			break;
		case FieldId.UseWebGPU:
			break;
		case FieldId.DecayRate:
			config.decayRate = value / 10;
			break;
		case FieldId.DiffuseWeight:
			config.diffuseWeight = value / 100;
			break;
		case FieldId.SpawnPatterns:
			config.enabledSpawnPatterns = bitmaskToSpawnPatterns(value);
			break;
		case FieldId.AgentCount:
			config.agentCount = value / 100;
			break;
		default:
			applySpeciesOrInteractionField(config, fieldId, value);
	}
}

function applySpeciesOrInteractionField(
	config: SlimeConfig,
	fieldId: number,
	value: number,
): void {
	if (
		fieldId >= FieldId.Species0SensorAngle &&
		fieldId <= FieldId.Species0AgentCount
	) {
		applySpeciesField(
			config.species[0],
			fieldId - FieldId.Species0SensorAngle,
			value,
		);
	} else if (
		fieldId >= FieldId.Species1SensorAngle &&
		fieldId <= FieldId.Species1AgentCount
	) {
		applySpeciesField(
			config.species[1],
			fieldId - FieldId.Species1SensorAngle,
			value,
		);
	} else if (
		fieldId >= FieldId.Species2SensorAngle &&
		fieldId <= FieldId.Species2AgentCount
	) {
		applySpeciesField(
			config.species[2],
			fieldId - FieldId.Species2SensorAngle,
			value,
		);
	} else if (
		fieldId >= FieldId.Interaction00 &&
		fieldId <= FieldId.Interaction22
	) {
		const interactionIdx = fieldId - FieldId.Interaction00;
		const row = Math.floor(interactionIdx / 3);
		const col = interactionIdx % 3;
		const signedValue = value > 127 ? value - 256 : value;
		config.interactions[row][col] = signedValue / 100;
	}
}

function applySpeciesField(
	species: SpeciesConfig,
	fieldOffset: number,
	value: number,
): void {
	switch (fieldOffset) {
		case 0:
			species.sensorAngle = value / 100;
			break;
		case 1:
			species.turnAngle = value / 100;
			break;
		case 2:
			species.sensorDist = value;
			break;
		case 3:
			species.agentSpeed = value / 10;
			break;
		case 4:
			species.depositAmount = value;
			break;
		case 5:
			species.colorPreset = indexToColorPreset(value);
			break;
		case 6:
			species.agentCount = value;
			break;
	}
}

function decodeFixedBinarySettings(view: DataView): SimulationSettings | null {
	const speed = view.getUint8(1);
	const flags = view.getUint8(2);
	const spawnBitmask = flags >> 1;
	const enabledSpawnPatterns = bitmaskToSpawnPatterns(spawnBitmask);

	const agentCount = view.getUint16(3, true) / 100;
	const decayRate = view.getUint8(5) / 10;
	const diffuseWeight = view.getUint8(6) / 100;

	const decodeSpecies = (offset: number): SpeciesConfig => ({
		sensorAngle: view.getUint8(offset) / 100,
		turnAngle: view.getUint8(offset + 1) / 100,
		sensorDist: view.getUint8(offset + 2),
		agentSpeed: view.getUint8(offset + 3) / 10,
		depositAmount: view.getUint8(offset + 4),
		colorPreset: indexToColorPreset(view.getUint8(offset + 5)),
		agentCount: view.getUint8(offset + 6),
	});

	const species0 = decodeSpecies(7);
	const species1 = decodeSpecies(14);
	const species2 = decodeSpecies(21);

	const interactions: number[][] = [[], [], []];
	let interactionOffset = 28;

	for (let row = 0; row < 3; row++) {
		for (let col = 0; col < 3; col++) {
			interactions[row][col] = view.getInt8(interactionOffset) / 100;
			interactionOffset++;
		}
	}

	const settings: SimulationSettings = {
		speed,
		slimeConfig: {
			decayRate,
			diffuseWeight,
			enabledSpawnPatterns,
			agentCount,
			species: [species0, species1, species2],
			interactions,
		},
	};

	return isValidSimulationSettings(settings) ? settings : null;
}

function decodeLegacyJsonSettings(encoded: string): SimulationSettings | null {
	try {
		const parsed = JSON.parse(atob(encoded));

		if (parsed?.slimeConfig) {
			migrateSlimeConfig(parsed.slimeConfig);
		}

		return isValidSimulationSettings(parsed) ? parsed : null;
	} catch {
		return null;
	}
}

function isValidSpeciesLockedSettings(
	value: unknown,
): value is SpeciesLockedSettings {
	if (typeof value !== "object" || value === null) {
		return false;
	}

	const settings = value as Record<string, unknown>;

	return (
		typeof settings.sensorAngle === "boolean" &&
		typeof settings.turnAngle === "boolean" &&
		typeof settings.sensorDist === "boolean" &&
		typeof settings.agentSpeed === "boolean" &&
		typeof settings.depositAmount === "boolean" &&
		typeof settings.colorPreset === "boolean" &&
		typeof settings.agentCount === "boolean"
	);
}

function isValidLockedSettings(value: unknown): value is LockedSettings {
	if (typeof value !== "object" || value === null) {
		return false;
	}

	const settings = value as Record<string, unknown>;

	if (
		typeof settings.decayRate !== "boolean" ||
		typeof settings.diffuseWeight !== "boolean" ||
		typeof settings.agentCount !== "boolean" ||
		typeof settings.interactions !== "boolean"
	) {
		return false;
	}

	if (!Array.isArray(settings.enabledSpawnPatterns)) {
		return false;
	}

	for (const pattern of settings.enabledSpawnPatterns) {
		if (!isValidSpawnPattern(pattern)) {
			return false;
		}
	}

	if (!Array.isArray(settings.species) || settings.species.length !== 3) {
		return false;
	}

	return (
		isValidSpeciesLockedSettings(settings.species[0]) &&
		isValidSpeciesLockedSettings(settings.species[1]) &&
		isValidSpeciesLockedSettings(settings.species[2])
	);
}

function migrateLockedSettings(settings: Record<string, unknown>): void {
	if ("spawnPattern" in settings && !("enabledSpawnPatterns" in settings)) {
		const oldLocked = settings.spawnPattern;

		if (typeof oldLocked === "boolean") {
			if (oldLocked) {
				settings.enabledSpawnPatterns = [];
			} else {
				const patternsWithoutRandom = VALID_SPAWN_PATTERNS.filter(
					(pattern) => pattern !== "random",
				);
				settings.enabledSpawnPatterns = patternsWithoutRandom;
			}

			delete settings.spawnPattern;
		}
	}
}

export function loadLockedSettings(): LockedSettings | null {
	try {
		const stored = localStorage.getItem(LOCKED_SETTINGS_KEY);

		if (stored === null) {
			return null;
		}

		const parsed = JSON.parse(stored);
		migrateLockedSettings(parsed);

		return isValidLockedSettings(parsed) ? parsed : null;
	} catch {
		return null;
	}
}

export function saveLockedSettings(settings: LockedSettings): void {
	try {
		localStorage.setItem(LOCKED_SETTINGS_KEY, JSON.stringify(settings));
	} catch {}
}

export interface Favorite {
	id: string;
	name: string;
	settings: SimulationSettings;
	createdAt: number;
}

export const FAVORITES_KEY = "simulation-favorites";

function isValidFavorite(value: unknown): value is Favorite {
	if (typeof value !== "object" || value === null) {
		return false;
	}

	const favorite = value as Record<string, unknown>;

	return (
		typeof favorite.id === "string" &&
		typeof favorite.name === "string" &&
		isValidSimulationSettings(favorite.settings) &&
		typeof favorite.createdAt === "number"
	);
}

export function loadFavorites(): Favorite[] {
	try {
		const stored = localStorage.getItem(FAVORITES_KEY);
		if (stored === null) {
			return [];
		}

		const parsed = JSON.parse(stored);
		if (!Array.isArray(parsed)) {
			return [];
		}

		const favorites: Favorite[] = [];
		for (const item of parsed) {
			if (item?.settings?.slimeConfig) {
				migrateSlimeConfig(item.settings.slimeConfig);
			}
			if (isValidFavorite(item)) {
				favorites.push(item);
			}
		}

		return favorites.sort((a, b) => b.createdAt - a.createdAt);
	} catch {
		return [];
	}
}

export function saveFavorites(favorites: Favorite[]): void {
	try {
		localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
	} catch {}
}

export function addFavorite(
	name: string,
	settings: SimulationSettings,
): Favorite[] {
	const favorites = loadFavorites();
	const newFavorite: Favorite = {
		id: crypto.randomUUID(),
		name,
		settings,
		createdAt: Date.now(),
	};
	const updated = [newFavorite, ...favorites];
	saveFavorites(updated);
	return updated;
}

export function removeFavorite(id: string): Favorite[] {
	const favorites = loadFavorites();
	const updated = favorites.filter((f) => f.id !== id);
	saveFavorites(updated);
	return updated;
}

export function renameFavorite(id: string, newName: string): Favorite[] {
	const favorites = loadFavorites();
	const updated = favorites.map((f) =>
		f.id === id ? { ...f, name: newName } : f,
	);
	saveFavorites(updated);
	return updated;
}
