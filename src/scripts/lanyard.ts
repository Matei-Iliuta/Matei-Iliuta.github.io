// 3D glass-black ID badge hanging from a flexible black lanyard.
// The strap is a verlet rope; the card is a stiff two-point body at its end,
// so it drops in from above, swings, and can be grabbed and thrown.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

interface Point {
  pos: THREE.Vector2;
  prev: THREE.Vector2;
  pinned: boolean;
}

const SEGMENTS = 22;
const CARD_W = 1.55;
const CARD_H = 2.2;
const STRAP_W = 0.16;
const GRAVITY = -9.8;
const DAMPING = 0.99;
const ITERATIONS = 24;
const STEP = 1 / 120;
const CREAM = '#f3e9d2';
const BLACK = '#0d0d0f';
const SCRIPT = '"Great Vibes", "Snell Roundhand", cursive';
// The card can turn at most 270 degrees either way, then it settles back
const MAX_TWIST = Math.PI * 1.5;
// How far above its resting place the anchor starts, and how fast it drops (units per second)
const DROP = 6;
const DROP_SPEED = 9;

export function mountLanyard(container: HTMLElement, photoUrl?: string) {
  const canvas = document.createElement('canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(canvas);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(makeStudio(), 0.02).texture;

  // Phones: zoom in and shorten the strap, so the badge is big enough next to the name
  const small = window.innerWidth < 600;
  const camera = new THREE.PerspectiveCamera(small ? 23 : 30, 1, 0.1, 100);
  camera.position.set(0, 0, 10);

  // Key light from the top-left, the same side as the studio softbox
  // Warm, like a lamp over the desk, to match the cream of the site
  const light = new THREE.DirectionalLight(0xffd9a8, 1.7);
  light.position.set(-3, 4, 5);
  scene.add(light, new THREE.AmbientLight(0xffe8cc, 0.28));

  // ----- Rope (strap) -----
  let anchor = new THREE.Vector2(0, 2.7);
  // How far the card may be dragged before it would leave the canvas
  let bounds = { x: 4, y: -3 };
  const segLen = small ? 0.058 : 0.085;
  const points: Point[] = [];
  for (let i = 0; i <= SEGMENTS; i++) {
    // Start hanging from a point far above the view; the anchor then drops into place
    const p = new THREE.Vector2(anchor.x + i * 0.012, anchor.y + DROP - i * segLen);
    points.push({ pos: p.clone(), prev: p.clone(), pinned: i === 0 });
  }
  // Bottom point of the card; the card's top is the rope's last point
  const cardBottom: Point = {
    pos: new THREE.Vector2(anchor.x + 0.35, anchor.y + DROP - SEGMENTS * segLen - CARD_H),
    prev: new THREE.Vector2(anchor.x + 0.35, anchor.y + DROP - SEGMENTS * segLen - CARD_H),
    pinned: false,
  };

  const strapGeometry = new THREE.BufferGeometry();
  const SAMPLES = 80;
  const strapPositions = new Float32Array((SAMPLES + 1) * 2 * 3);
  const strapUvs = new Float32Array((SAMPLES + 1) * 2 * 2);
  const strapIndex: number[] = [];
  for (let i = 0; i < SAMPLES; i++) {
    const a = i * 2;
    strapIndex.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  strapGeometry.setAttribute('position', new THREE.BufferAttribute(strapPositions, 3));
  strapGeometry.setAttribute('uv', new THREE.BufferAttribute(strapUvs, 2));
  strapGeometry.setIndex(strapIndex);

  // Woven black strap with a soft satin sheen
  const strapMaterial = new THREE.MeshPhysicalMaterial({
    map: makeStrapTexture(),
    roughness: 0.45,
    clearcoat: 0.5,
    clearcoatRoughness: 0.3,
    side: THREE.DoubleSide,
  });
  const strap = new THREE.Mesh(strapGeometry, strapMaterial);
  scene.add(strap);

  // ----- Card -----
  const card = new THREE.Group();
  const body = new THREE.Mesh(
    roundedCardGeometry(CARD_W, CARD_H, 0.03, 0.11),
    new THREE.MeshPhysicalMaterial({ color: 0x0d0d0f, roughness: 0.15, clearcoat: 1, clearcoatRoughness: 0.05 }),
  );
  // Both faces are glossy glass-like surfaces: they reflect the studio as the card turns.
  // The emissive map keeps the print readable whatever the lighting.
  const glassFace = (map: THREE.Texture) =>
    new THREE.MeshPhysicalMaterial({
      map,
      emissiveMap: map,
      emissive: 0xffffff,
      emissiveIntensity: 0.55,
      roughness: 0.1,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
      transparent: true,
      alphaTest: 0.5,
    });
  const face = makeFaceTexture();
  const front = new THREE.Mesh(new THREE.PlaneGeometry(CARD_W, CARD_H), glassFace(face.texture));
  front.position.z = 0.016;
  const back = new THREE.Mesh(new THREE.PlaneGeometry(CARD_W, CARD_H), glassFace(makeBackTexture()));
  back.position.z = -0.016;
  back.rotation.y = Math.PI;
  const clip = new THREE.Mesh(
    new RoundedBoxGeometry(0.26, 0.16, 0.06, 2, 0.03),
    new THREE.MeshStandardMaterial({ color: 0xc7c7cc, metalness: 1, roughness: 0.25 }),
  );
  clip.position.y = 0.02;
  // A band of light that slides across the glass as the card moves
  const glintTexture = makeGlintTexture();
  const glint = new THREE.Mesh(
    new THREE.PlaneGeometry(CARD_W, CARD_H),
    new THREE.MeshBasicMaterial({
      map: glintTexture,
      alphaMap: makeCardAlpha(),
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  glint.position.z = 0.02;
  // Card group origin sits at the card's top edge, so it hangs from the rope end
  body.position.y = front.position.y = back.position.y = glint.position.y = -CARD_H / 2;
  card.add(body, front, back, glint, clip);
  scene.add(card);

  // Soft fake shadow behind the card, so it reads against the white page
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(CARD_W * 1.5, CARD_H * 1.35),
    new THREE.MeshBasicMaterial({ map: makeShadowTexture(), transparent: true, depthWrite: false }),
  );
  shadow.position.z = -0.6;
  scene.add(shadow);

  if (photoUrl) {
    const img = new Image();
    img.onload = () => face.setPhoto(img);
    img.src = photoUrl;
  }

  // ----- Interaction -----
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const hit = new THREE.Vector3();
  let dragging = false;
  const dragTarget = new THREE.Vector2();
  const dragOffset = new THREE.Vector2();

  function toWorld(e: PointerEvent) {
    const rect = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    raycaster.ray.intersectPlane(plane, hit);
    return new THREE.Vector2(hit.x, hit.y);
  }

  // Listen on the window: the canvas is wider than its column and must not block clicks
  window.addEventListener('pointerdown', (e) => {
    const world = toWorld(e);
    if (raycaster.intersectObjects([body, front, back], false).length === 0) return;
    dragging = true;
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
    dragOffset.copy(cardBottom.pos).sub(world);
    dragTarget.copy(world);
    e.preventDefault();
  });
  window.addEventListener('pointermove', (e) => {
    const world = toWorld(e);
    if (dragging) {
      dragTarget.copy(world);
      return;
    }
    const over = raycaster.intersectObjects([body, front, back], false).length > 0;
    document.body.style.cursor = over ? 'grab' : '';
  });
  const release = () => {
    dragging = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };
  // A finger that lands on the card claims the gesture, so the page does not scroll with it
  window.addEventListener(
    'touchstart',
    (e) => {
      const t = e.touches[0];
      if (!t) return;
      toWorld(t as unknown as PointerEvent);
      if (raycaster.intersectObjects([body, front, back], false).length > 0) e.preventDefault();
    },
    { passive: false },
  );
  // Stop the page from scrolling while a finger is dragging the card
  window.addEventListener(
    'touchmove',
    (e) => {
      if (dragging) e.preventDefault();
    },
    { passive: false },
  );
  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', release);

  // ----- Simulation -----
  let twist = 0;
  let twistVel = 0;
  const all = [...points, cardBottom];

  // slack: the strap may bunch up (only stretching is resisted), the card stays rigid
  function constrain(a: Point, b: Point, length: number, slack = false) {
    const delta = b.pos.clone().sub(a.pos);
    const dist = delta.length() || 1e-6;
    if (slack && dist < length) return;
    const diff = (dist - length) / dist;
    if (a.pinned && b.pinned) return;
    if (a.pinned) b.pos.addScaledVector(delta, -diff);
    else if (b.pinned) a.pos.addScaledVector(delta, diff);
    else {
      a.pos.addScaledVector(delta, diff * 0.5);
      b.pos.addScaledVector(delta, -diff * 0.5);
    }
  }

  let drop = DROP;
  function step() {
    drop = Math.max(0, drop - DROP_SPEED * STEP);
    points[0].pos.set(anchor.x, anchor.y + drop);
    for (const p of all) {
      if (p.pinned) continue;
      const vel = p.pos.clone().sub(p.prev).multiplyScalar(DAMPING);
      p.prev.copy(p.pos);
      p.pos.add(vel).add(new THREE.Vector2(0, GRAVITY * STEP * STEP));
    }
    if (dragging) {
      // Pull the card toward the pointer, limited to what the strap can reach
      const target = dragTarget.clone().add(dragOffset);
      const reach = SEGMENTS * segLen + CARD_H;
      const fromAnchor = target.clone().sub(anchor);
      if (fromAnchor.length() > reach) target.copy(anchor).add(fromAnchor.setLength(reach));
      // Never lift the card above the strap's anchor, or it slides out of view
      target.y = Math.min(target.y, anchor.y - CARD_H - 0.6);
      // ...and keep it on screen, so it is never cut off at an edge
      target.x = Math.max(-bounds.x, Math.min(bounds.x, target.x));
      target.y = Math.max(bounds.y, target.y);
      cardBottom.pos.lerp(target, 0.1);
      // Carry the card's top along too, so lifting raises the whole card and
      // lets the strap go slack, instead of only flipping the card over
      const top = target.clone().add(new THREE.Vector2(0, CARD_H));
      const topFromAnchor = top.clone().sub(anchor);
      const strapReach = SEGMENTS * segLen;
      if (topFromAnchor.length() > strapReach) top.copy(anchor).add(topFromAnchor.setLength(strapReach));
      points[SEGMENTS].pos.lerp(top, 0.06);
    }
    for (let k = 0; k < ITERATIONS; k++) {
      for (let i = 0; i < SEGMENTS; i++) constrain(points[i], points[i + 1], segLen, true);
      constrain(points[SEGMENTS], cardBottom, CARD_H);
    }
    // Twist around the vertical axis, driven by sideways motion, for a 3D feel
    // Slow and heavy: a weak spring pulls it back, damping keeps it from spinning
    const vx = cardBottom.pos.x - cardBottom.prev.x;
    // The face turns back towards the viewer soon after, even while the card keeps swinging
    twistVel += -twist * 0.0016 - twistVel * 0.06 + vx * 0.035;
    twist += twistVel;
    if (Math.abs(twist) > MAX_TWIST) {
      twist = Math.sign(twist) * MAX_TWIST;
      twistVel *= -0.3;
    }
  }

  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(p.pos.x, p.pos.y, 0)));

  // Where the card is on screen, shared with the hero circuit (its distance sensor aims at it)
  const cardCenter = new THREE.Vector2();
  const projected = new THREE.Vector3();
  function publishCardPosition() {
    projected.set(cardCenter.x, cardCenter.y, 0).project(camera);
    const r = canvas.getBoundingClientRect();
    (window as unknown as { badgePosition?: { x: number; y: number } }).badgePosition = {
      x: r.left + ((projected.x + 1) / 2) * r.width,
      y: r.top + ((1 - projected.y) / 2) * r.height,
    };
  }

  function updateMeshes() {
    const top = points[SEGMENTS].pos;
    const dir = top.clone().sub(cardBottom.pos);
    card.position.set(top.x, top.y, 0);
    card.rotation.set(0, twist, Math.atan2(dir.y, dir.x) - Math.PI / 2);
    const center = top.clone().add(cardBottom.pos).multiplyScalar(0.5);
    cardCenter.copy(center);
    shadow.position.set(center.x + 0.12, center.y - 0.22, -0.6);
    shadow.rotation.z = card.rotation.z;
    shadow.scale.x = Math.max(0.15, Math.abs(Math.cos(twist)));
    glintTexture.offset.x = THREE.MathUtils.clamp(-0.6 + twist * 0.35 + card.rotation.z * 0.9 + (center.x - anchor.x) * 0.25, -1, 1);

    points.forEach((p, i) => curve.points[i].set(p.pos.x, p.pos.y, 0));
    const tangent = new THREE.Vector3();
    const point = new THREE.Vector3();
    for (let i = 0; i <= SAMPLES; i++) {
      const t = i / SAMPLES;
      curve.getPointAt(t, point);
      curve.getTangentAt(t, tangent);
      // Strap gently turns its face as it nears the card, so it catches the light
      const nx = -tangent.y * (STRAP_W / 2);
      const ny = tangent.x * (STRAP_W / 2);
      const z = 0;
      strapPositions.set([point.x + nx, point.y + ny, z, point.x - nx, point.y - ny, z], i * 6);
      strapUvs.set([0, t * 3, 1, t * 3], i * 4);
    }
    strapGeometry.attributes.position.needsUpdate = true;
    strapGeometry.attributes.uv.needsUpdate = true;
    strapGeometry.computeVertexNormals();
    strapGeometry.computeBoundingSphere();
  }

  // ----- Layout -----
  function resize() {
    // Let the canvas bleed past its column, to both edges of the window, so the card and
    // its shadow are never cut off, however far it is dragged or swings
    const rect = container.getBoundingClientRect();
    const extraLeft = Math.max(0, rect.left);
    const extraRight = Math.max(0, document.documentElement.clientWidth - rect.right);
    const w = rect.width + extraLeft + extraRight;
    const h = rect.height;
    canvas.style.left = `${-extraLeft}px`;
    canvas.style.width = `${w}px`;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const viewH = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const columnCenter = extraLeft + rect.width / 2;
    const x = (columnCenter / w - 0.5) * viewH * camera.aspect;
    const moved = x - anchor.x;
    anchor = new THREE.Vector2(x, viewH / 2 + 0.05);
    bounds = { x: (viewH * camera.aspect) / 2 - CARD_W * 0.75, y: -viewH / 2 + 0.2 };
    for (const p of [...points, cardBottom]) {
      p.pos.x += moved;
      p.prev.x += moved;
    }
  }
  window.addEventListener('resize', resize);
  resize();

  // ----- Loop (paused while off screen) -----
  let visible = true;
  new IntersectionObserver(([entry]) => (visible = entry.isIntersecting)).observe(container);
  let last = performance.now();
  let acc = 0;
  function frame(now: number) {
    requestAnimationFrame(frame);
    if (!visible) {
      last = now;
      return;
    }
    acc += Math.min((now - last) / 1000, 0.05);
    last = now;
    while (acc >= STEP) {
      step();
      acc -= STEP;
    }
    updateMeshes();
    publishCardPosition();
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);
}

// Flat card with rounded corners (RoundedBoxGeometry clamps the radius to the thickness)
function roundedCardGeometry(w: number, h: number, depth: number, r: number) {
  const shape = new THREE.Shape();
  shape.moveTo(-w / 2 + r, -h / 2);
  shape.lineTo(w / 2 - r, -h / 2);
  shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  shape.lineTo(w / 2, h / 2 - r);
  shape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  shape.lineTo(-w / 2 + r, h / 2);
  shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  shape.lineTo(-w / 2, -h / 2 + r);
  shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 8 });
  geometry.translate(0, 0, -depth / 2);
  return geometry;
}

// ----- Textures drawn on a 2D canvas -----

function makeShadowTexture() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const g = c.getContext('2d')!;
  g.filter = 'blur(22px)';
  g.fillStyle = 'rgba(0,0,0,0.13)';
  g.beginPath();
  g.roundRect(64, 54, 128, 148, 18);
  g.fill();
  return new THREE.CanvasTexture(c);
}

// A dark studio with a big softbox at the top-left and a thin strip light on the right.
// It is only used for reflections, so the glass catches clear highlights.
function makeStudio() {
  const studio = new THREE.Scene();
  studio.background = new THREE.Color(0x141416);
  const panel = (w: number, h: number, intensity: number, pos: [number, number, number]) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));
    m.material.color.setRGB(intensity, intensity * 0.84, intensity * 0.62); // warm softboxes
    m.position.set(...pos);
    m.lookAt(0, 0, 0);
    studio.add(m);
  };
  panel(5, 2.5, 6, [-3, 4, 4]);
  panel(0.6, 6, 3, [5, 0, 2]);
  panel(8, 1, 0.8, [0, -4, 3]);
  return studio;
}

function makeGlintTexture() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const g = c.getContext('2d')!;
  const band = g.createLinearGradient(0, 0, 512, 160);
  band.addColorStop(0.35, 'rgba(255,222,176,0)');
  band.addColorStop(0.47, 'rgba(255,222,176,0.5)');
  band.addColorStop(0.5, 'rgba(255,230,192,0.85)');
  band.addColorStop(0.53, 'rgba(255,222,176,0.5)');
  band.addColorStop(0.65, 'rgba(255,222,176,0)');
  g.fillStyle = band;
  g.fillRect(0, 0, 512, 512);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeCardAlpha() {
  const c = document.createElement('canvas');
  c.width = 350;
  c.height = Math.round((350 * CARD_H) / CARD_W);
  const g = c.getContext('2d')!;
  g.fillStyle = '#000';
  g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = '#fff';
  roundRect(g, 0, 0, c.width, c.height, 39);
  g.fill();
  return new THREE.CanvasTexture(c);
}

function makeStrapTexture() {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 1024;
  const g = c.getContext('2d')!;
  // Across the width: tinted edges, a clearer middle and a thin highlight, like a glass band
  const glass = g.createLinearGradient(0, 0, c.width, 0);
  glass.addColorStop(0, '#050506');
  glass.addColorStop(0.12, '#141416');
  glass.addColorStop(0.5, '#1c1c1f');
  glass.addColorStop(0.88, '#141416');
  glass.addColorStop(1, '#050506');
  g.fillStyle = glass;
  g.fillRect(0, 0, c.width, c.height);
  g.save();
  g.translate(c.width / 2, c.height / 2);
  g.rotate(-Math.PI / 2);
  g.fillStyle = 'rgba(243,233,210,0.75)';
  g.font = '600 40px "Inter Variable", -apple-system, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText('MATEI ILIUȚĂ  ·  ETTI UPB', 0, 4);
  g.restore();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  return tex;
}

function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.roundRect(x, y, w, h, r);
}

function drawFace(c: HTMLCanvasElement, photo?: HTMLImageElement) {
  const g = c.getContext('2d')!;
  const W = c.width;
  const H = c.height;
  g.clearRect(0, 0, W, H);
  roundRect(g, 0, 0, W, H, 78);
  g.fillStyle = BLACK;
  g.fill();

  // Slot for the clip
  roundRect(g, W / 2 - 60, 40, 120, 22, 11);
  g.fillStyle = '#1e1e21';
  g.fill();

  // Photo
  const px = W / 2 - 230;
  const py = 110;
  const pw = 460;
  const ph = 540;
  g.save();
  roundRect(g, px, py, pw, ph, 40);
  g.clip();
  if (photo) {
    const scale = Math.max(pw / photo.width, ph / photo.height);
    const iw = photo.width * scale;
    const ih = photo.height * scale;
    g.drawImage(photo, px + (pw - iw) / 2, py + (ph - ih) / 2, iw, ih);
  } else {
    g.fillStyle = '#1a1a1d';
    g.fillRect(px, py, pw, ph);
    g.fillStyle = 'rgba(243,233,210,0.35)';
    g.font = `140px ${SCRIPT}`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('MI', W / 2, py + ph / 2);
  }
  g.restore();

  g.textAlign = 'center';
  g.textBaseline = 'alphabetic';
  g.fillStyle = CREAM;
  g.font = `112px ${SCRIPT}`;
  g.fillText('Matei Iliuță', W / 2, 790);
  g.fillStyle = 'rgba(243,233,210,0.7)';
  g.font = '500 38px "Inter Variable", -apple-system, sans-serif';
  g.fillText('Electronics student', W / 2, 855);

  g.fillStyle = 'rgba(243,233,210,0.18)';
  g.fillRect(70, 915, W - 140, 2);
  g.fillStyle = 'rgba(243,233,210,0.75)';
  g.font = '600 32px "Inter Variable", -apple-system, sans-serif';
  g.textAlign = 'left';
  g.fillText('ETTI · UPB', 80, 985);
  g.textAlign = 'right';
  g.fillText('YEAR 1', W - 80, 985);
}

function makeFaceTexture() {
  const c = document.createElement('canvas');
  c.width = 700;
  c.height = Math.round((700 * CARD_H) / CARD_W);
  let photo: HTMLImageElement | undefined;
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  const redraw = () => {
    drawFace(c, photo);
    texture.needsUpdate = true;
  };
  redraw();
  // Redraw once the web fonts are ready, so the text uses the script face and Inter
  Promise.all([document.fonts?.load(`112px ${SCRIPT}`), document.fonts?.ready]).then(redraw, redraw);
  return {
    texture,
    setPhoto(img: HTMLImageElement) {
      photo = img;
      redraw();
    },
  };
}

function makeBackTexture() {
  const c = document.createElement('canvas');
  c.width = 700;
  c.height = Math.round((700 * CARD_H) / CARD_W);
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  const draw = () => {
    const g = c.getContext('2d')!;
    g.clearRect(0, 0, c.width, c.height);
    roundRect(g, 0, 0, c.width, c.height, 78);
    g.fillStyle = BLACK;
    g.fill();
    g.fillStyle = CREAM;
    g.font = `220px ${SCRIPT}`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('MI', c.width / 2, c.height / 2 - 30);
    g.fillStyle = 'rgba(243,233,210,0.6)';
    g.font = '500 32px "Inter Variable", -apple-system, sans-serif';
    g.fillText('matei-iliuta.github.io', c.width / 2, c.height / 2 + 120);
    texture.needsUpdate = true;
  };
  draw();
  Promise.all([document.fonts?.load(`220px ${SCRIPT}`), document.fonts?.ready]).then(draw, draw);
  return texture;
}
