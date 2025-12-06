# Slime Mold Simulation

![Slime Mold Simulation](https://img.shields.io/badge/WebGPU-Accelerated-blue)
![License](https://img.shields.io/badge/license-MIT-green)

An interactive, real-time simulation of slime mold behavior using WebGPU for GPU-accelerated computation and rendering.

**[Click here for a live demo](https://slime.nicomoehn.codes)**

## Simulation

This simulation models the behavior of *Physarum polycephalum*, a single-celled organism that forms intricate network patterns while foraging for food. Each agent follows simple rules:

1. **Sense** - Sample the environment at three points ahead (left, center, right)
2. **Turn** - Rotate toward the direction with the highest trail concentration
3. **Move** - Step forward and deposit a trail marker
4. **Diffuse & Decay** - Trails spread to neighboring cells and fade over time

From these basic rules, complex patterns emerge.

## Tech Stack

- **[Bun](https://bun.sh/)** - Package manager & runtime
- **[SolidJS](https://www.solidjs.com/)** - Reactive UI framework
- **[WebGPU](https://www.w3.org/TR/webgpu/)** - GPU compute and rendering
- **[Tailwind CSS](https://tailwindcss.com/)** - Styling
- **[Vite](https://vitejs.dev/)** - Building & bundling
- **[Biome](https://biomejs.dev/)** - Linting and formatting

## Development

### Setup

Install dependencies:

```bash
bun install
```

Start the development server:

```bash
bun dev
```

The app will be available at `http://localhost:5173`

### Build the project

Build using Vite:  

```bash
bun run build
```

Build and run with Docker:

```bash
docker build -t slime-mold-simulation .
docker run -p 8080:80 slime-mold-simulation
```

## Browser Support

WebGPU is required for GPU acceleration. Check the [MDN docs](https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API#browser_compatibility) for current browser support.

The simulation automatically falls back to CPU mode when WebGPU is unavailable, although at significantly reduced performance and a fixed limit of 50,000 agents.

## License

This project is licensed under the [MIT License](LICENSE). Feel free to use, modify, and distribute the code as you see fit.
