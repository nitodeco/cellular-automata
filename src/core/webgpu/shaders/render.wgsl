struct RenderConfig {
  size: vec2<f32>,
  lowColor: vec4<f32>,
  midColor: vec4<f32>,
  highColor: vec4<f32>,
}

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) uv: vec2<f32>,
}

const SCALE: f32 = 1000.0;

@group(0) @binding(0) var gridTexture: texture_2d<u32>;
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

  let pixelX = u32(uv.x * config.size.x);
  let pixelY = u32(uv.y * config.size.y);
  let texel = textureLoad(gridTexture, vec2u(pixelX, pixelY), 0);
  let value = f32(texel.r) / SCALE;
  let intensity = clamp(value / 255.0, 0.0, 1.0);
  let curved = pow(intensity, 2.2);

  let baseColor = vec3<f32>(0.039, 0.039, 0.059);
  var gradientColor: vec3<f32>;
  if (curved < 0.5) {
    gradientColor = mix(config.lowColor.rgb, config.midColor.rgb, curved * 2.0);
  } else {
    gradientColor = mix(
      config.midColor.rgb,
      config.highColor.rgb,
      (curved - 0.5) * 2.0
    );
  }

  let finalColor = mix(baseColor, gradientColor, curved);

  return vec4<f32>(finalColor, 1.0);
}
