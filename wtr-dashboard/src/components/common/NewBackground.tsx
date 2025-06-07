import React, { useEffect, useRef } from 'react';
import './NewBackground.css'; // Import the CSS

const NewBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Removed refs for editor, error, indicator, and control buttons

  const sourceShaderRef = useRef<string>(`#version 300 es
/*********
* made by Matthias Hurrle (@atzedent)
*/
precision highp float;
out vec4 O;
uniform float time;
uniform vec2 resolution;
uniform vec2 move;

const vec3 goldColor = vec3(0.894, 0.631, 0.106);
const vec3 baseBackgroundColor = vec3(0.039, 0.047, 0.063);

#define FC gl_FragCoord.xy
#define R resolution
#define T time
#define N normalize
#define S smoothstep
#define MN min(R.x,R.y)
#define rot(a) mat2(cos((a)-vec4(0,11,33,0)))
#define csqr(a) vec2(a.x*a.x-a.y*a.y,2.*a.x*a.y)
float rnd(vec3 p) {
	p=fract(p*vec3(12.9898,78.233,156.34));
	p+=dot(p,p+34.56);
	return fract(p.x*p.y*p.z);
}
float swirls(in vec3 p) {
	float d=.0;
	vec3 c=p;
	for(float i=min(.0,time); i<9.; i++) {
		p=.7*abs(p)/dot(p,p)-.7;
		p.yz=csqr(p.yz);
		p=p.zxy;
		d+=exp(-19.*abs(dot(p,c)));
	}
	return d;
}
vec3 march(in vec3 p, vec3 rd) {
	float d=.2, t=.0, c=.0, k=mix(.9,1.,rnd(rd)),
	maxd=length(p)-1.;
	vec3 col=vec3(0);
	for(float i=min(.0,time); i<120.; i++) {
		t+=d*exp(-2.*c)*k;
		c=swirls(p+rd*t);
		if (t<5e-2 || t>maxd) break;
		col += goldColor * c * c * 0.05; // Gold color based on intensity c
	}
	return col;
}
float rnd(vec2 p) {
	p=fract(p*vec2(12.9898,78.233));
	p+=dot(p,p+34.56);
	return fract(p.x*p.y);
}
vec3 sky(vec2 p, bool anim) {
	p.x-=.17-(anim?2e-4*T:.0);
	p*=500.;
	vec2 id=floor(p), gv=fract(p)-.5;
	float n=rnd(id), d=length(gv);
	if (n<.975) return vec3(0);
	return goldColor * S(3e-2*n,1e-3*n,d*d) * 0.1; // Tinted sky, very dim
}
void cam(inout vec3 p) {
	p.yz*=rot(move.y*6.3/MN-T*.05);
	p.xz*=rot(-move.x*6.3/MN+T*.025);
}
void main() {
	vec2 uv=(FC-.5*R)/MN;
	vec3 col=vec3(0),
	p=vec3(0,0,-16),
	rd=N(vec3(uv,1)), rdd=rd;
	cam(p); cam(rd);
	col=march(p,rd);
	col=S(-.2,.9,col);
	vec2 sn=.5+vec2(atan(rdd.x,rdd.z),atan(length(rdd.xz),rdd.y))/6.28318;
	col=max(col,vec3(sky(sn,true)+sky(2.+sn*2.,true)));
	float t=min((time-.5)*.3,1.);
	uv=FC/R*2.-1.;
	uv*=.7;
	float v=pow(dot(uv,uv),1.8);
	col=mix(col, baseBackgroundColor, v); // Vignette fades to base background color
	col=mix(baseBackgroundColor*0.5, col, t); // Initial fade-in from a darker background
	col=max(col, baseBackgroundColor * 0.5); // Ensure minimum color is dark themed background
  O=vec4(col,1);
}`);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      console.error("Canvas element not found");
      return;
    }

    // Default to full resolution for quality, can be adjusted if performance is an issue.
    const currentResolution = 1.0;
    let dpr = Math.max(1, currentResolution * window.devicePixelRatio);
    let frm: number | undefined;
    let renderer: any;
    let pointers: any;

    class RendererLocal {
      #vertexSrc = "#version 300 es\nprecision highp float;\nin vec4 position;\nvoid main(){gl_Position=position;}";
      // Shader source is now directly from sourceShaderRef.current
      #vertices = [-1, 1, -1, -1, 1, 1, 1, -1];
      gl: WebGL2RenderingContext;
      shaderSource: string;
      mouseMove: [number, number];
      mouseCoords: [number, number];
      pointerCoords: [number, number];
      nbrOfPointers: number;
      program: WebGLProgram | null = null;
      vs: WebGLShader | null = null;
      fs: WebGLShader | null = null;
      buffer: WebGLBuffer | null = null;
      canvasEl: HTMLCanvasElement;

      constructor(canvasElement: HTMLCanvasElement, scale: number) {
        this.canvasEl = canvasElement;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.gl = canvasElement.getContext("webgl2")!;
        this.gl.viewport(0, 0, canvasElement.width * scale, canvasElement.height * scale);
        this.shaderSource = sourceShaderRef.current; // Use initial shader source
        this.mouseMove = [0, 0];
        this.mouseCoords = [0, 0];
        this.pointerCoords = [0,0];
        this.nbrOfPointers = 0;
      }

      // get defaultSource() { return sourceShaderRef.current; } // Not strictly needed if not resetting to different defaults

      updateShader(source: string) { // This might only be called once now, or if shader could change dynamically later (not in this version)
        this.reset();
        this.shaderSource = source;
        this.setup();
        this.init();
      }
      updateMove(deltas: [number, number]) { this.mouseMove = deltas; }
      updateMouse(coords: [number, number]) { this.mouseCoords = coords; }
      updatePointerCoords(coords: [number,number]) { this.pointerCoords = coords; }
      updatePointerCount(nbr: number) { this.nbrOfPointers = nbr; }
      updateScale(scale: number) {
        this.gl.viewport(0, 0, this.canvasEl.width * scale, this.canvasEl.height * scale);
      }

      compile(shader: WebGLShader, source: string) {
        const gl = this.gl;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          const errorMsg = gl.getShaderInfoLog(shader);
          console.error("Shader compile error:", errorMsg); // Log error
          // No dispatchEvent for shader-error as editor UI is removed
        }
      }

      // Test function might not be needed if shader is static post-initialization
      // test(source: string): string | null { ... }

      reset() {
        const { gl, program, vs, fs } = this;
        if (!program || gl.getProgramParameter(program, gl.DELETE_STATUS)) return;
        if (vs && !gl.getShaderParameter(vs, gl.DELETE_STATUS)) {
            gl.detachShader(program, vs);
            gl.deleteShader(vs);
        }
        if (fs && !gl.getShaderParameter(fs, gl.DELETE_STATUS)) {
            gl.detachShader(program, fs);
            gl.deleteShader(fs);
        }
        gl.deleteProgram(program);
        this.program = null;
        this.vs = null;
        this.fs = null;
      }

      setup() {
        const gl = this.gl;
        this.vs = gl.createShader(gl.VERTEX_SHADER);
        this.fs = gl.createShader(gl.FRAGMENT_SHADER);
        if (!this.vs || !this.fs) {
            console.error("Failed to create shaders");
            return;
        }
        this.compile(this.vs, this.#vertexSrc);
        this.compile(this.fs, this.shaderSource); // this.shaderSource is sourceShaderRef.current
        this.program = gl.createProgram();
        if (!this.program) {
            console.error("Failed to create program");
            return;
        }
        gl.attachShader(this.program, this.vs);
        gl.attachShader(this.program, this.fs);
        gl.linkProgram(this.program);
        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
          console.error("Linker error:", gl.getProgramInfoLog(this.program));
        }
      }

      init() {
        const { gl, program } = this;
        if (!program) return;
        this.buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.#vertices), gl.STATIC_DRAW);
        const position = gl.getAttribLocation(program, "position");
        gl.enableVertexAttribArray(position);
        gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

        const p = program as any;
        p.resolution = gl.getUniformLocation(program, "resolution");
        p.time = gl.getUniformLocation(program, "time");
        p.move = gl.getUniformLocation(program, "move");
        p.touch = gl.getUniformLocation(program, "touch");
        p.pointerCount = gl.getUniformLocation(program, "pointerCount");
        p.pointers = gl.getUniformLocation(program, "pointers");
      }

      render(now = 0) {
        const { gl, program, buffer, canvasEl, mouseMove, mouseCoords, pointerCoords, nbrOfPointers } = this;
        if (!program || !buffer || gl.getProgramParameter(program, gl.DELETE_STATUS)) return;

        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(program);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        const p = program as any;
        gl.uniform2f(p.resolution, canvasEl.width, canvasEl.height);
        gl.uniform1f(p.time, now * 1e-3);
        gl.uniform2f(p.move, ...mouseMove);
        gl.uniform2f(p.touch, ...mouseCoords); // Touch might be less relevant if only mouse move parallax
        gl.uniform1i(p.pointerCount, nbrOfPointers);
        gl.uniform2fv(p.pointers, pointerCoords);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
    }

    class PointerHandlerLocal {
        scale: number;
        active: boolean;
        pointers: Map<number, [number, number]>;
        lastCoords: [number, number];
        moves: [number, number];
        element: HTMLElement;

        #map(x: number, y: number): [number, number] {
            const currentScale = this.getScale();
            const elHeight = (this.element as HTMLElement).clientHeight;
            return [x * currentScale, elHeight * currentScale - y * currentScale];
        }

        constructor(element: HTMLElement, scale: number) {
            this.element = element;
            this.scale = scale;
            this.active = false;
            this.pointers = new Map();
            this.lastCoords = [0,0];
            this.moves = [0,0];

            element.addEventListener("pointerdown", (e: PointerEvent) => {
                this.active = true;
                this.pointers.set(e.pointerId, this.#map(e.clientX, e.clientY));
            });
            element.addEventListener("pointerup", (e: PointerEvent) => {
                if (this.count === 1) this.lastCoords = this.first;
                this.pointers.delete(e.pointerId);
                this.active = this.pointers.size > 0;
            });
            element.addEventListener("pointerleave", (e: PointerEvent) => {
                if (this.count === 1) this.lastCoords = this.first;
                this.pointers.delete(e.pointerId);
                this.active = this.pointers.size > 0;
            });
            element.addEventListener("pointermove", (e: PointerEvent) => {
                if (!this.active) return; // Only track moves if a pointer is down (drag-like)
                                          // For continuous parallax on mouse hover without click, this logic might need adjustment
                                          // The current shader uses 'move' which seems to be an accumulation, so this might be fine.
                this.lastCoords = [e.clientX, e.clientY];
                this.pointers.set(e.pointerId, this.#map(e.clientX, e.clientY));
                this.moves = [this.moves[0]+e.movementX, this.moves[1]+e.movementY];
            });
        }
        getScale() { return this.scale; }
        updateScale(s: number) { this.scale = s; }
        reset() { // Might need to remove event listeners if PointerHandlerLocal is ever destroyed before canvas
            this.pointers.clear();
            this.active = false;
            this.moves = [0,0];
        }
        get count() { return this.pointers.size; }
        get move() { return this.moves; }
        get coords() { return this.pointers.size > 0 ? Array.from(this.pointers.values()).flat() : [0, 0]; }
        get first() { return this.pointers.values().next().value || this.#map(this.lastCoords[0], this.lastCoords[1]); }
    }

    renderer = new RendererLocal(canvas, dpr);
    pointers = new PointerHandlerLocal(canvas, dpr);

    // Directly setup and init the renderer with the shader from sourceShaderRef
    renderer.setup();
    renderer.init();
    // No need for test/updateShader here if it's static from the ref, setup handles it.

    const localResize = () => {
      const { innerWidth: width, innerHeight: height } = window;
      // Update DPR based on current window.devicePixelRatio, resolution is fixed at 1.0
      dpr = Math.max(1, currentResolution * window.devicePixelRatio);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      if (renderer) renderer.updateScale(dpr);
      if (pointers) pointers.updateScale(dpr); // Pointers also need updated scale
    };

    const loop = (now: number) => {
      renderer.updateMouse(pointers.first); // 'first' provides coordinates, good for 'touch' like uniforms
      renderer.updatePointerCount(pointers.count);
      renderer.updatePointerCoords(pointers.coords);
      renderer.updateMove(pointers.move); // 'move' provides accumulated movement, good for parallax
      renderer.render(now);
      frm = requestAnimationFrame(loop);
    };

    localResize(); // Initial resize and DPR calculation
    loop(0); // Start render loop

    const handleGlobalResize = () => localResize();
    window.addEventListener("resize", handleGlobalResize);

    // Cleanup function
    return () => {
      if (frm) cancelAnimationFrame(frm);
      window.removeEventListener("resize", handleGlobalResize);
      renderer?.reset();
      // pointers.reset(); // Call reset if it removes event listeners, otherwise not strictly needed if element is destroyed
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounce utility is removed as it was for editor input

  return (
    <div className="new-background-container">
      <canvas ref={canvasRef} id="canvas"></canvas>
      {/* Editor, error, indicator, and controls UI are removed */}
    </div>
  );
};

export default NewBackground;

// Comments on changes:
// - Removed all refs and JSX related to the editor UI (textarea, pre, divs, inputs).
// - Removed EditorLocal class and its instantiation.
// - Simplified useEffect:
//    - Removed logic for editMode, toggleView, toggleResolution, reset, shader error handling via UI.
//    - `dpr` is initialized based on a fixed `currentResolution` (e.g., 1.0 for full quality).
//    - RendererLocal directly uses `sourceShaderRef.current`.
//    - Removed `renderThisLocal` and `debouncedRender` as shader compilation is now on load.
//    - Removed event listeners for UI controls and Ctrl+L.
//    - `canvas.style.setProperty('--canvas-z-index', ...)` is removed, handled by CSS.
// - RendererLocal's `compile` method no longer dispatches 'shader-error' event.
// - PointerHandlerLocal's `pointermove` event listener might need adjustment if continuous parallax (without mouse down) is desired.
//   The current shader uses `move` which is an accumulated value, so the current setup might be fine.
// - Ensured `localResize` also updates `pointers.updateScale(dpr)`.
// - RendererLocal.reset improved slightly to check shader deletion status more carefully.
