// Small helpers shared by the 3D figures.
import { Color, Group, PerspectiveCamera, Scene } from "three";

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

// Keep the whole drawing in view in a tall or a narrow host.
export function fitCamera(camera, baseFov, width, height) {
  camera.aspect = width / height;
  camera.fov =
    camera.aspect < 1.25
      ? baseFov * (1.3 / Math.max(camera.aspect, 0.55))
      : baseFov;
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
