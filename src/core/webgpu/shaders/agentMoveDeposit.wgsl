struct Config {
  width: u32,
  height: u32,
  sensorAngle: f32,
  turnAngle: f32,
  sensorDist: f32,
  agentSpeed: f32,
  depositAmount: f32,
  frameSeed: f32,
  decayRate: f32,
  diffuseWeight: f32,
  agentCount: u32,
}

const SCALE: f32 = 1000.0;

@group(0) @binding(0) var<storage, read> sourceGrid: array<u32>;
@group(0) @binding(1) var<storage, read_write> positionsX: array<f32>;
@group(0) @binding(2) var<storage, read_write> positionsY: array<f32>;
@group(0) @binding(3) var<storage, read_write> angles: array<f32>;
@group(0) @binding(4) var<storage, read_write> destGrid: array<atomic<u32>>;
@group(0) @binding(5) var<uniform> config: Config;

fn hash(seed: u32) -> f32 {
  var state = seed;
  state = state ^ 2747636419u;
  state = state * 2654435769u;
  state = state ^ (state >> 16u);
  state = state * 2654435769u;
  state = state ^ (state >> 16u);
  state = state * 2654435769u;
  return f32(state) / 4294967295.0;
}

fn sense(agentX: f32, agentY: f32, angle: f32, angleOffset: f32) -> f32 {
  let sensorAngle = angle + angleOffset;
  let sensorX = agentX + cos(sensorAngle) * config.sensorDist;
  let sensorY = agentY + sin(sensorAngle) * config.sensorDist;

  let wrappedX = u32(sensorX) & (config.width - 1u);
  let wrappedY = u32(sensorY) & (config.height - 1u);

  return f32(sourceGrid[wrappedY * config.width + wrappedX]) / SCALE;
}

@compute @workgroup_size(256)
fn main(@builtin(global_invocation_id) globalId: vec3<u32>) {
  let agentIndex = globalId.x;

  if (agentIndex >= config.agentCount) {
    return;
  }

  let agentX = positionsX[agentIndex];
  let agentY = positionsY[agentIndex];
  var agentAngle = angles[agentIndex];

  let leftSensor = sense(agentX, agentY, agentAngle, -config.sensorAngle);
  let centerSensor = sense(agentX, agentY, agentAngle, 0.0);
  let rightSensor = sense(agentX, agentY, agentAngle, config.sensorAngle);

  let randomValue = hash(agentIndex + u32(config.frameSeed * 1000.0));

  if (centerSensor >= leftSensor && centerSensor >= rightSensor) {
    // Keep going straight
  } else if (leftSensor > rightSensor) {
    agentAngle -= config.turnAngle;
  } else if (rightSensor > leftSensor) {
    agentAngle += config.turnAngle;
  } else {
    agentAngle += (randomValue - 0.5) * 2.0 * config.turnAngle;
  }

  var newX = agentX + cos(agentAngle) * config.agentSpeed;
  var newY = agentY + sin(agentAngle) * config.agentSpeed;

  let widthF = f32(config.width);
  let heightF = f32(config.height);

  if (newX < 0.0) { newX += widthF; }
  if (newX >= widthF) { newX -= widthF; }
  if (newY < 0.0) { newY += heightF; }
  if (newY >= heightF) { newY -= heightF; }

  positionsX[agentIndex] = newX;
  positionsY[agentIndex] = newY;
  angles[agentIndex] = agentAngle;

  let pixelX = u32(floor(newX));
  let pixelY = u32(floor(newY));
  let pixelIndex = pixelY * config.width + pixelX;

  let depositU32 = u32(config.depositAmount * SCALE);
  let maxValue = u32(255.0 * SCALE);

  var oldValue = atomicLoad(&destGrid[pixelIndex]);
  var newValue = oldValue + depositU32;
  if (newValue > maxValue) {
    newValue = maxValue;
  }

  atomicMax(&destGrid[pixelIndex], newValue);
}

