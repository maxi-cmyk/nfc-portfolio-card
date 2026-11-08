// Small helpers shared by the 3D figures.
import {
  Box3,
  Color,
  Group,
  MathUtils,
  PerspectiveCamera,
  Scene,
  Vector3,
} from "three";

export function baseFigure(fov = 26, distance = 8.5) {
  const scene = new Scene();
  const camera = new PerspectiveCamera(fov, 1, 0.1, 80);
  camera.position.set(0, 0, distance);
  const group = new Group();
  scene.add(group);
  return { scene, camera, group, baseFov: fov };
}

export const colorsFrom = (palette) =>
  Object.fromEntries(
    Object.entries(palette).map(([k, v]) => [k, new Color(v)]),
  );

// The radius of the sphere, centred on the group's pivot, that holds the whole
// drawing. A figure that spins about its pivot never leaves this sphere, so a
// camera that fits it can never clip the figure, whatever the angle.
export function boundingRadius(group, pad = 1.08) {
  group.updateMatrixWorld(true);
  const box = new Box3().setFromObject(group);
  if (box.isEmpty()) return 3;
  const corner = new Vector3();
  let radius = 0;
  for (const x of [box.min.x, box.max.x])
    for (const y of [box.min.y, box.max.y])
      for (const z of [box.min.z, box.max.z])
        radius = Math.max(radius, corner.set(x, y, z).length());
  return radius * pad;
}

// Distance at which a sphere of this radius fills the narrower side of the view.
export function fitDistance(radius, fovDegrees, aspect) {
  const half = MathUtils.degToRad(fovDegrees / 2);
  const limit = Math.min(half, Math.atan(Math.tan(half) * aspect));
  return radius / Math.sin(limit);
}

// Keep the whole drawing in view, at any angle, in a tall or a narrow host.
export function fitCamera(camera, baseFov, width, height, radius) {
  camera.aspect = width / height;
  if (radius) {
    camera.fov = baseFov;
    camera.position.z = fitDistance(radius, baseFov, camera.aspect);
  } else {
    camera.fov =
      camera.aspect < 1.25
        ? baseFov * (1.3 / Math.max(camera.aspect, 0.55))
        : baseFov;
  }
  camera.updateProjectionMatrix();
}

// Frees GPU memory when a figure is replaced.
export function disposeFigure(figure) {
  figure.scene.traverse((node) => {
    node.geometry?.dispose?.();
    const materials = Array.isArray(node.material)
      ? node.material
      : [node.material];
    for (const material of materials) {
      material?.map?.dispose?.();
      material?.dispose?.();
    }
  });
}

export const LED = { red: "#d83a3a", green: "#2f8f46", blue: "#1e4f9e" };
