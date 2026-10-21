/**
 * Thumbnail of a Cloudinary-uploaded video, taken from its first frame.
 * Used only for URLs already stored in our MediaAsset database.
 */
export function cloudinaryVideoPoster(url: string): string | undefined {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || parsed.hostname !== "res.cloudinary.com") return undefined;
    const path = parsed.pathname;
    // Original video URL: /<cloud>/video/upload/v123/path/file.mp4
    const match = path.match(/^\/([^/]+)\/video\/upload\/(.+)$/);
    if (!match) return undefined;
    const [, cloud, filePath] = match;
    if (!/\.(?:mp4|webm|mov|m4v|avi|mkv)$/i.test(filePath)) return undefined;
    const jpgPath = filePath.replace(/\.[^.\/]+$/, ".jpg");
    parsed.pathname = `/${cloud}/video/upload/so_0,f_jpg/${jpgPath}`;
    parsed.search = "";
    return parsed.toString();
  } catch {
    return undefined;
  }
}
