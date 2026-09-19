const MAX_BYTES = 500 * 1024;

function dataUrlBytes(dataUrl: string) {
  const base64 = dataUrl.split(",")[1] ?? "";
  return Math.ceil((base64.length * 3) / 4);
}

export function resizeImageFile(file: File, maxSize = 512): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Choose an image file."));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read image."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not load image."));
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        const startScale = Math.min(1, maxSize / Math.max(width, height));
        width = Math.max(1, Math.round(width * startScale));
        height = Math.max(1, Math.round(height * startScale));

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not process image."));
          return;
        }

        let quality = 0.82;
        let result = "";
        for (let step = 0; step < 10; step += 1) {
          canvas.width = width;
          canvas.height = height;
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          result = canvas.toDataURL("image/jpeg", quality);
          if (dataUrlBytes(result) <= MAX_BYTES) {
            resolve(result);
            return;
          }
          if (quality > 0.45) quality -= 0.12;
          else {
            width = Math.max(64, Math.round(width * 0.75));
            height = Math.max(64, Math.round(height * 0.75));
            quality = 0.72;
          }
        }
        if (dataUrlBytes(result) <= MAX_BYTES) resolve(result);
        else reject(new Error("Logo must be under 500 KB."));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
