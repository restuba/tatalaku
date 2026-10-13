"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { isMotionReduced } from "@/lib/motion";

/**
 * Ambient "aurora" background rendered with a single fragment shader.
 *
 * Built for zero weight on the rest of the app:
 * - raw WebGL (no three.js), ~2 KB of code, one full-screen triangle
 * - renders at a fraction of CSS resolution (it's a blur, detail is wasted)
 * - capped to ~30 fps, paused when off-screen or the tab is hidden
 * - motion off / reduced → one static frame, no loop
 * - Save-Data or no WebGL → renders nothing; the caller's CSS orbs remain
 *
 * Colors follow the active theme (accent / info / skill tokens) and update
 * when the theme changes.
 */

const VERTEX_SHADER = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

// Three soft blobs drifting on slow Lissajous paths, blended over the surface.
const FRAGMENT_SHADER = `
precision mediump float;
uniform vec2 u_res;
uniform float u_time;
uniform vec3 u_c1;
uniform vec3 u_c2;
uniform vec3 u_c3;
uniform vec3 u_bg;
uniform vec2 u_mouse;     // pointer in aspect-corrected uv space
uniform float u_mouseMix; // 0 = no pointer light, 1 = full

float blob(vec2 uv, vec2 center, float radius) {
  float d = length(uv - center);
  return smoothstep(radius, 0.0, d);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  uv.x *= u_res.x / u_res.y;
  float aspect = u_res.x / u_res.y;
  float t = u_time * 0.06;

  vec2 p1 = vec2(aspect * (0.25 + 0.18 * sin(t * 1.1)), 0.75 + 0.15 * cos(t * 0.9));
  vec2 p2 = vec2(aspect * (0.78 + 0.16 * cos(t * 0.8)), 0.55 + 0.20 * sin(t * 1.3));
  vec2 p3 = vec2(aspect * (0.45 + 0.22 * sin(t * 0.7 + 2.0)), 0.18 + 0.12 * cos(t * 1.2));

  float b1 = blob(uv, p1, 0.75);
  float b2 = blob(uv, p2, 0.80);
  float b3 = blob(uv, p3, 0.70);

  vec3 color = u_bg;
  color = mix(color, u_c1, b1 * 0.50);
  color = mix(color, u_c2, b2 * 0.38);
  color = mix(color, u_c3, b3 * 0.34);

  // A softer light that trails the pointer and gently pushes the field
  float bm = blob(uv, u_mouse, 0.55);
  color = mix(color, mix(u_c1, u_c2, 0.5 + 0.5 * sin(t * 2.0)), bm * 0.34 * u_mouseMix);

  // Subtle grain hides 8-bit banding in the soft gradients
  float grain = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  color += (grain - 0.5) * 0.02;

  gl_FragColor = vec4(color, 1.0);
}
`;

/** Render resolution relative to CSS pixels — the output is heavily blurred anyway */
const RENDER_SCALE = 0.35;
const FRAME_INTERVAL_MS = 1000 / 30;
/** Shader time used for the still frame when motion is off (a balanced layout) */
const STATIC_FRAME_TIME = 18;
/** How quickly the pointer light catches up with the cursor (per frame, 0..1) */
const POINTER_EASE = 0.08;
/** How quickly the pointer light fades in/out (per frame, 0..1) */
const POINTER_FADE = 0.05;

type RGB = [number, number, number];

/** Resolve a CSS color expression (e.g. var(--color-accent)) to normalized RGB */
function readColor(probe: HTMLElement, cssColor: string): RGB {
  probe.style.color = cssColor;
  const match = getComputedStyle(probe).color.match(/[\d.]+/g);
  if (!match || match.length < 3) return [0, 0, 0];
  return [Number(match[0]) / 255, Number(match[1]) / 255, Number(match[2]) / 255];
}

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function prefersSaveData(): boolean {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return connection?.saveData === true;
}

interface AuroraBackgroundProps {
  /** Static CSS version shown until (or instead of, if WebGL is unavailable) the shader */
  fallback: ReactNode;
  className?: string;
  /** Adds a soft light that follows a mouse/pen pointer (ignored for touch) */
  interactive?: boolean;
}

export function AuroraBackground({
  fallback,
  className = "",
  interactive = false,
}: AuroraBackgroundProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper || prefersSaveData()) return undefined;

    const gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
      preserveDrawingBuffer: false,
    });
    if (!gl) return undefined;

    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    const program = gl.createProgram();
    if (!vs || !fs || !program) return undefined;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return undefined;
    gl.useProgram(program);

    // One oversized triangle covers the viewport (cheaper than a quad)
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "u_res");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uC1 = gl.getUniformLocation(program, "u_c1");
    const uC2 = gl.getUniformLocation(program, "u_c2");
    const uC3 = gl.getUniformLocation(program, "u_c3");
    const uBg = gl.getUniformLocation(program, "u_bg");
    const uMouse = gl.getUniformLocation(program, "u_mouse");
    const uMouseMix = gl.getUniformLocation(program, "u_mouseMix");
    gl.uniform1f(uMouseMix, 0);

    // Pointer light state: client coords of the cursor, plus the eased light
    // position (canvas uv) and intensity that the shader actually sees.
    const pointer = { clientX: 0, clientY: 0, active: false };
    const light = { x: 0, y: 0, mix: 0, placed: false };
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      pointer.clientX = e.clientX;
      pointer.clientY = e.clientY;
      pointer.active = true;
    };
    const onPointerOut = (e: PointerEvent) => {
      // relatedTarget null → the pointer left the window
      if (!e.relatedTarget) pointer.active = false;
    };
    if (interactive) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      document.addEventListener("pointerout", onPointerOut, { passive: true });
    }

    const updateLight = () => {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const aspect = rect.width / rect.height;
        const targetX = ((pointer.clientX - rect.left) / rect.width) * aspect;
        const targetY = 1 - (pointer.clientY - rect.top) / rect.height;
        if (!light.placed) {
          // First sighting: start under the cursor instead of sweeping in from 0,0
          light.x = targetX;
          light.y = targetY;
          light.placed = pointer.active;
        }
        light.x += (targetX - light.x) * POINTER_EASE;
        light.y += (targetY - light.y) * POINTER_EASE;
      }
      light.mix += ((pointer.active ? 1 : 0) - light.mix) * POINTER_FADE;
      gl.uniform2f(uMouse, light.x, light.y);
      gl.uniform1f(uMouseMix, light.mix);
    };

    const probe = document.createElement("span");
    probe.style.display = "none";
    document.body.appendChild(probe);
    const applyColors = () => {
      gl.uniform3fv(uC1, readColor(probe, "var(--color-accent)"));
      gl.uniform3fv(uC2, readColor(probe, "var(--color-info)"));
      gl.uniform3fv(uC3, readColor(probe, "var(--color-skill)"));
      gl.uniform3fv(uBg, readColor(probe, "var(--color-surface)"));
    };
    applyColors();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width * RENDER_SCALE));
      const height = Math.max(1, Math.round(rect.height * RENDER_SCALE));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
      gl.uniform2f(uRes, width, height);
    };
    resize();

    const start = performance.now();
    const draw = (now: number) => {
      // Motion off: a fixed, deterministic frame (redraws on resize/theme
      // change must not visibly shift the blobs)
      const isStill = isMotionReduced();
      const seconds = isStill ? STATIC_FRAME_TIME : (now - start) / 1000;
      gl.uniform1f(uTime, seconds);
      // The still frame never shows the pointer light (it can't follow anyway)
      if (isStill) gl.uniform1f(uMouseMix, 0);
      else updateLight();
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    let rafId = 0;
    let lastFrame = 0;
    let isVisible = true;
    const loop = (now: number) => {
      rafId = requestAnimationFrame(loop);
      if (now - lastFrame < FRAME_INTERVAL_MS) return;
      lastFrame = now;
      draw(now);
    };
    const shouldAnimate = () => isVisible && !document.hidden && !isMotionReduced();
    const sync = () => {
      cancelAnimationFrame(rafId);
      rafId = 0;
      if (shouldAnimate()) rafId = requestAnimationFrame(loop);
      else draw(performance.now()); // static frame when paused / motion off
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (!rafId) draw(performance.now());
    });
    resizeObserver.observe(canvas);

    const intersection = new IntersectionObserver(([entry]) => {
      isVisible = entry?.isIntersecting ?? true;
      sync();
    });
    intersection.observe(canvas);

    // Theme switches (class/style on <html>) and the motion setting (data-motion)
    const themeObserver = new MutationObserver(() => {
      applyColors();
      sync();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style", "data-motion", "data-code-theme"],
    });

    document.addEventListener("visibilitychange", sync);
    sync();
    // Reveal the canvas and drop the CSS fallback (its blur/pulse stop costing GPU)
    wrapper.dataset["ready"] = "true";

    return () => {
      delete wrapper.dataset["ready"];
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      intersection.disconnect();
      themeObserver.disconnect();
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerout", onPointerOut);
      probe.remove();
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      // Deliberately not calling WEBGL_lose_context.loseContext(): the same
      // <canvas> can be re-initialised (React StrictMode re-runs effects, and
      // remounts keep the element), and getContext() would then hand back the
      // lost context. The context is released with the canvas element.
    };
  }, [interactive]);

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      className={`group absolute inset-0 overflow-hidden pointer-events-none ${className}`}
    >
      <div className="absolute inset-0 group-data-[ready=true]:hidden">{fallback}</div>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-700 group-data-[ready=true]:opacity-100"
      />
      {/* Soft wash keeps foreground text readable over the moving colors */}
      <div className="absolute inset-0 hidden bg-codex-surface/30 dark:bg-codex-surface/50 group-data-[ready=true]:block" />
    </div>
  );
}

export default AuroraBackground;
