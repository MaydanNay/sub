import defaultMascot from "../assets/pers.png";

export function resolveMascotImageSrc(
  gender: "MALE" | "FEMALE" | null,
  imageIndex: number
): string {
  const fileIndex = Math.min(Math.max(1, imageIndex), 16);
  if (gender === "MALE") {
    return `/assets/man/${fileIndex}.webp`;
  }
  if (gender === "FEMALE") {
    return `/assets/women/${fileIndex}.webp`;
  }
  return defaultMascot;
}

/** PNG fallback for dev or if webp fails to load in the browser. */
export function resolveMascotPngSrc(
  gender: "MALE" | "FEMALE" | null,
  imageIndex: number
): string {
  const fileIndex = Math.min(Math.max(1, imageIndex), 16);
  if (gender === "MALE") {
    return `/assets/man/${fileIndex}.PNG`;
  }
  if (gender === "FEMALE") {
    return `/assets/women/${fileIndex}.PNG`;
  }
  return defaultMascot;
}

function loadImage(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

/** Preload current mascot while the loading screen is visible. */
export async function preloadMascotImage(
  gender: "MALE" | "FEMALE" | null,
  imageIndex: number
): Promise<void> {
  const webpSrc = resolveMascotImageSrc(gender, imageIndex);
  const loaded = await loadImage(webpSrc);
  if (!loaded && (gender === "MALE" || gender === "FEMALE")) {
    await loadImage(resolveMascotPngSrc(gender, imageIndex));
  }
}

/** Prefetch the next stage image in the background. */
export function prefetchNextMascotImage(
  gender: "MALE" | "FEMALE" | null,
  imageIndex: number
): void {
  if (gender !== "MALE" && gender !== "FEMALE") return;
  const nextIndex = Math.min(imageIndex + 1, 16);
  if (nextIndex === imageIndex) return;
  void loadImage(resolveMascotImageSrc(gender, nextIndex));
}
