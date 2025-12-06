struct RenderConfig {
  width: f32,
  height: f32,
  colorR: f32,
  colorG: f32,
  colorB: f32,
}

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) uv: vec2<f32>,
}

const SCALE: f32 = 1000.0;

@group(0) @binding(0) var<storage, read> grid: array<u32>;
@group(0) @binding(1) var<uniform> config: RenderConfig;

@vertex
fn vertexMain(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
  var positions = array<vec2<f32>, 3>(
    vec2<f32>(-1.0, -1.0),
    vec2<f32>(3.0, -1.0),
    vec2<f32>(-1.0, 3.0)
  );

  var uvs = array<vec2<f32>, 3>(
    vec2<f32>(0.0, 1.0),
    vec2<f32>(2.0, 1.0),
    vec2<f32>(0.0, -1.0)
  );

  var output: VertexOutput;
  output.position = vec4<f32>(positions[vertexIndex], 0.0, 1.0);
  output.uv = uvs[vertexIndex];
  return output;
}

@fragment
fn fragmentMain(input: VertexOutput) -> @location(0) vec4<f32> {
  let uv = input.uv;

  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    return vec4<f32>(0.039, 0.039, 0.059, 1.0);
  }

  let pixelX = u32(uv.x * config.width);
  let pixelY = u32(uv.y * config.height);
  let index = pixelY * u32(config.width) + pixelX;

  let valueU32 = grid[index];
  let value = f32(valueU32) / SCALE;
  let alpha = clamp(value / 255.0, 0.0, 1.0);

  let baseColor = vec3<f32>(0.039, 0.039, 0.059);
  let slimeColor = vec3<f32>(config.colorR, config.colorG, config.colorB);
  let finalColor = mix(baseColor, slimeColor, alpha);

  return vec4<f32>(finalColor, 1.0);
}
