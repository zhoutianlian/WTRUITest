import React, { useEffect, useRef } from 'react';
import './NewBackground.css'; // Import the CSS

const NewBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const codeEditorRef = useRef<HTMLTextAreaElement>(null);
  const errorRef = useRef<HTMLPreElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const btnToggleViewRef = useRef<HTMLInputElement>(null);
  const btnToggleResolutionRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const btnResetRef = useRef<HTMLInputElement>(null); // Marked as unused for now if reset() isn't fully implemented from original script

  const sourceShaderRef = useRef<string>(`#version 300 es
/*********
* made by Matthias Hurrle (@atzedent)
*/
precision highp float;
out vec4 O;
uniform float time;
uniform vec2 resolution;
uniform vec2 move;
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
		col+=vec3(c*c,c/1.05,c)*8e-3;
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
	return vec3(S(3e-2*n,1e-3*n,d*d));
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
	col=mix(col,vec3(0),v);
	col=mix(vec3(0),col,t);
	col=max(col,.08);
  O=vec4(col,1);
}`);

  useEffect(() => {
    const canvas = canvasRef.current;
    const codeEditor = codeEditorRef.current;
    const errorEl = errorRef.current;
    const indicatorEl = indicatorRef.current;
    const btnToggleViewEl = btnToggleViewRef.current;
    const btnToggleResolutionEl = btnToggleResolutionRef.current;
    // const btnResetEl = btnResetRef.current; // For future use

    if (!canvas || !codeEditor || !errorEl || !indicatorEl || !btnToggleViewEl || !btnToggleResolutionEl) {
      console.error("Required elements not found");
      return;
    }

    let editMode = false;
    let currentResolution = 0.5;
    const renderDelay = 1000;
    let dpr = Math.max(1, currentResolution * window.devicePixelRatio);
    let frm: number | undefined;
    // sourceShaderRef holds the shader string
    let renderer: any; // Simplified Renderer class instance placeholder
    let pointers: any; // Simplified PointerHandler class instance placeholder
    // let store: any; // Simplified Store class instance placeholder
    // const shaderId = 'oggKrGW'; // This might not be needed if not using Store class

    // --- Simplified Helper Classes (Adapted from original JS) ---
    // Renderer Class
    class RendererLocal {
      #vertexSrc = "#version 300 es\nprecision highp float;\nin vec4 position;\nvoid main(){gl_Position=position;}";
      #fragmtSrc = sourceShaderRef.current; // Default if nothing else
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
        this.shaderSource = this.#fragmtSrc;
        this.mouseMove = [0, 0];
        this.mouseCoords = [0, 0];
        this.pointerCoords = [0,0];
        this.nbrOfPointers = 0;
      }

      get defaultSource() { return this.#fragmtSrc; }

      updateShader(source: string) {
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
          console.error(errorMsg);
          this.canvasEl.dispatchEvent(new CustomEvent('shader-error', { detail: errorMsg }));
        }
      }

      test(source: string) {
        let result = null;
        const gl = this.gl;
        const shader = gl.createShader(gl.FRAGMENT_SHADER);
        if (!shader) return "Could not create shader";
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          result = gl.getShaderInfoLog(shader);
        }
        gl.deleteShader(shader); // Clean up
        return result;
      }

      reset() {
        const { gl, program, vs, fs } = this;
        if (!program || gl.getProgramParameter(program, gl.DELETE_STATUS)) return;
        if (vs && gl.getShaderParameter(vs, gl.DELETE_STATUS)) { // Check if shader exists and is marked for deletion
            gl.detachShader(program, vs);
            gl.deleteShader(vs);
        }
        if (fs && gl.getShaderParameter(fs, gl.DELETE_STATUS)) {
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
        this.compile(this.fs, this.shaderSource);
        this.program = gl.createProgram();
        if (!this.program) {
            console.error("Failed to create program");
            return;
        }
        gl.attachShader(this.program, this.vs);
        gl.attachShader(this.program, this.fs);
        gl.linkProgram(this.program);
        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
          console.error(gl.getProgramInfoLog(this.program));
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

        // Uniform locations
        const p = program as any; // To attach properties directly
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
        gl.uniform2f(p.touch, ...mouseCoords);
        gl.uniform1i(p.pointerCount, nbrOfPointers);
        gl.uniform2fv(p.pointers, pointerCoords);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
    }

    // PointerHandler Class
    class PointerHandlerLocal {
        scale: number;
        active: boolean;
        pointers: Map<number, [number, number]>;
        lastCoords: [number, number];
        moves: [number, number];
        element: HTMLElement;

        // Helper method for coordinate mapping
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

            // const map removed

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
                if (!this.active) return;
                this.lastCoords = [e.clientX, e.clientY]; // Store raw clientX/Y for 'first' getter fallback
                this.pointers.set(e.pointerId, this.#map(e.clientX, e.clientY));
                this.moves = [this.moves[0]+e.movementX, this.moves[1]+e.movementY];
            });
        }
        getScale() { return this.scale; }
        updateScale(s: number) { this.scale = s; }
        reset() {
            this.pointers.clear();
            this.active = false;
            this.moves = [0,0];
        }
        get count() { return this.pointers.size; }
        get move() { return this.moves; }
        get coords() { return this.pointers.size > 0 ? Array.from(this.pointers.values()).flat() : [0, 0]; }
        get first() { return this.pointers.values().next().value || this.#map(this.lastCoords[0], this.lastCoords[1]); }
    }

    // Editor Local (simplified)
    class EditorLocal {
        textarea: HTMLTextAreaElement;
        errorfield: HTMLPreElement;
        errorindicator: HTMLDivElement;
        constructor(textarea: HTMLTextAreaElement, errorfield: HTMLPreElement, errorindicator: HTMLDivElement) {
            this.textarea = textarea;
            this.errorfield = errorfield;
            this.errorindicator = errorindicator;
            // Basic event listeners, can be expanded
            textarea.addEventListener('scroll', this.handleScroll.bind(this));
        }
        get hidden() { return this.textarea.classList.contains('hidden'); }
        set hidden(value: boolean) { value ? this.#hide() : this.#show(); }
        get text() { return this.textarea.value; }
        set text(value: string) { this.textarea.value = value; }

        setError(message: string | null) {
            if (!message) {
                this.clearError();
                return;
            }
            this.errorfield.innerHTML = message;
            this.errorfield.classList.add('opaque');
            const match = message.match(/ERROR: \d+:(\d+):/);
            const lineNumber = match ? parseInt(match[1]) : 0;
            const overlay = document.createElement('pre');
            overlay.classList.add('overlay'); // Ensure .overlay is styled in CSS
            overlay.textContent = '\n'.repeat(lineNumber);
            document.body.appendChild(overlay); // Temporary append
            const offsetTop = parseInt(getComputedStyle(overlay).height);
            this.errorindicator.style.setProperty('--top', offsetTop + 'px');
            this.errorindicator.style.visibility = 'visible';
            document.body.removeChild(overlay); // Clean up
        }
        clearError() {
            this.errorfield.textContent = '';
            this.errorfield.classList.remove('opaque');
            this.errorindicator.style.visibility = 'hidden';
        }
        focus() { this.textarea.focus(); }
        #hide() { [this.errorindicator, this.errorfield, this.textarea].forEach(el => el.classList.add('hidden')); }
        #show() { [this.errorindicator, this.errorfield, this.textarea].forEach(el => el.classList.remove('hidden')); }
        handleScroll() { this.errorindicator.style.setProperty('--scroll-top', String(this.textarea.scrollTop) + 'px'); }
    }


    // --- Initialization ---
    const editorInstance = new EditorLocal(codeEditor, errorEl, indicatorEl);
    renderer = new RendererLocal(canvas, dpr);
    pointers = new PointerHandlerLocal(canvas, dpr);
    // store = new StoreLocal(window.location.toString()); // Key for store, simplified

    editorInstance.text = sourceShaderRef.current;
    renderer.setup();
    renderer.init();

    const localResize = () => {
      const { innerWidth: width, innerHeight: height } = window;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      if (renderer) renderer.updateScale(dpr); // dpr is already updated by toggleResolution
    };

    const toggleViewLocal = () => {
      editorInstance.hidden = btnToggleViewEl.checked;
      canvas.style.setProperty('--canvas-z-index', btnToggleViewEl.checked ? "0" : "-1");
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const resetLocal = () => {
      editorInstance.text = sourceShaderRef.current; // Or renderer.defaultSource
      // store.putShaderSource(shaderId, editor.text); // If using store
      renderThisLocal();
    };

    const toggleResolutionLocal = () => {
      currentResolution = btnToggleResolutionEl.checked ? 0.5 : 1;
      dpr = Math.max(1, currentResolution * window.devicePixelRatio);
      pointers.updateScale(dpr);
      localResize(); // Call resize which also updates renderer scale
    };

    const loop = (now: number) => {
      renderer.updateMouse(pointers.first);
      renderer.updatePointerCount(pointers.count);
      renderer.updatePointerCoords(pointers.coords);
      renderer.updateMove(pointers.move);
      renderer.render(now);
      frm = requestAnimationFrame(loop);
    };

    const renderThisLocal = () => {
      editorInstance.clearError();
      // store.putShaderSource(shaderId, editor.text); // If using store
      const result = renderer.test(editorInstance.text);
      if (result) {
        editorInstance.setError(result);
      } else {
        renderer.updateShader(editorInstance.text);
      }
      if (frm) cancelAnimationFrame(frm);
      loop(0);
    };

    const debouncedRender = debounce(renderThisLocal, renderDelay);
    codeEditor.oninput = debouncedRender;


    if (!editMode) {
      btnToggleViewEl.checked = true;
      toggleViewLocal();
    }
    if (currentResolution === 0.5) {
      btnToggleResolutionEl.checked = true;
      // toggleResolutionLocal(); // This will be called by its own setup if needed, avoid double call if dpr is set initially.
    }

    canvas.addEventListener('shader-error', (e: Event) => {
        editorInstance.setError((e as CustomEvent).detail);
    });

    localResize(); // Initial resize

    if (renderer.test(sourceShaderRef.current) === null) {
      renderer.updateShader(sourceShaderRef.current);
    }
    loop(0); // Start render loop

    // Event listeners
    btnToggleViewEl.onclick = toggleViewLocal;
    btnToggleResolutionEl.onchange = toggleResolutionLocal;
    // btnResetEl.onclick = resetLocal; // If using reset

    const handleGlobalResize = () => localResize();
    window.addEventListener("resize", handleGlobalResize);

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "L" && e.ctrlKey) {
            e.preventDefault();
            btnToggleViewEl.checked = !btnToggleViewEl.checked;
            toggleViewLocal();
        }
    };
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup function
    return () => {
      if (frm) cancelAnimationFrame(frm);
      window.removeEventListener("resize", handleGlobalResize);
      window.removeEventListener("keydown", handleKeyDown);
      // Remove other listeners if set directly on elements not part of React's managed DOM (e.g., canvas pointer events if not handled by PointerHandlerLocal's destructor)
      renderer?.reset(); // Clean up WebGL resources
      pointers?.reset(); // Clean up pointer listeners if any global ones were added
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to run only once on mount

  // Debounce utility (moved outside for clarity or can be inlined/imported)
  const debounce = (fn: (...args: any[]) => void, delay: number) => {
    let timerId: NodeJS.Timeout | undefined;
    return (...args: any[]) => {
      if (timerId) clearTimeout(timerId);
      timerId = setTimeout(() => fn(...args), delay);
    };
  };

  return (
    <div className="new-background-container"> {/* Wrapper div */}
      {/* Ensure body tag is not used here, manage through CSS on the wrapper */}
      <canvas ref={canvasRef} id="canvas"></canvas>
      <textarea ref={codeEditorRef} id="codeEditor" className="editor" spellCheck="false" autoCorrect="off" autoCapitalize="off" translate="no" /*onInput is set in useEffect */></textarea>
      <pre ref={errorRef} id="error"></pre>
      <div ref={indicatorRef} id="indicator"></div>
      <div id="controls">
        <div className="controls">
          <input ref={btnToggleViewRef} id="btnToggleView" className="icon" type="checkbox" name="toggleView" /* onClick is set in useEffect */ />
          <input ref={btnToggleResolutionRef} id="btnToggleResolution" className="icon" type="checkbox" name="toggleResolution" /* onChange is set in useEffect */ />
          <input ref={btnResetRef} id="btnReset" className="icon" type="checkbox" name="reset" /* onClick is set in useEffect */ />
        </div>
      </div>
      {/* The script tag for shader source is handled by storing its content in sourceShaderRef */}
    </div>
  );
};

export default NewBackground;

// Ensure that global styles from the original CSS (html, body) are applied carefully.
// It might be better to apply them to a wrapper div like 'new-background-container'
// or ensure they are applied globally if this component is meant to be a full-page background.
// The provided CSS has been prefixed with .new-background-container for better encapsulation.
// The JS code has been adapted to React:
// - DOM element access via useRef.
// - Lifecycle management via useEffect.
// - Event handlers assigned in useEffect.
// - Classes (Renderer, PointerHandler, Editor, Store) are simplified and instantiated within useEffect.
//   Ideally, these would be further broken down or managed with React state/props if they need to interact more deeply with React's system.
// - The 'Store' class was commented out as its usage (localStorage) might need more specific handling in a React context (e.g., custom hook, context API).
// - The shader source is stored in a ref.
// - Global event listeners (resize, keydown) are added and cleaned up.
// - The main init logic is placed in useEffect.
// - `requestAnimationFrame` is used for the render loop and cleaned up.
// - CSS is imported directly.
// - The `reset` function related to `btnReset` and its full Store interaction is simplified for now.
// - `oninput` for the textarea is set up in `useEffect`.
// - `map` function in PointerHandler adjusted for correct y-coordinate calculation within canvas.
// - Shader program/object deletion logic in Renderer's reset method is made more robust by checking if they are already marked for deletion.
// - Null checks for critical WebGL objects (shaders, program) added.
// - `PointerHandlerLocal.first` getter improved for cases when no pointers are active.
// - `EditorLocal.setError` improved to handle null messages and temporary DOM manipulation for offset calculation.
// - `RendererLocal.reset` improved to check shader deletion status before detaching/deleting.
// - `PointerHandlerLocal`'s map function adjusted for clientHeight usage.
