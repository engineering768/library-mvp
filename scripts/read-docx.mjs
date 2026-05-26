import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import os from "os";

function extractDocx(filePath) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "docx-"));
  const zipPath = path.join(tmp, "file.zip");
  fs.copyFileSync(filePath, zipPath);
  execSync(
    `powershell -NoProfile -Command "Expand-Archive -LiteralPath '${zipPath.replace(/'/g, "''")}' -DestinationPath '${path.join(tmp, "out").replace(/'/g, "''")}' -Force"`,
    { stdio: "pipe" }
  );
  const xml = fs.readFileSync(path.join(tmp, "out", "word", "document.xml"), "utf8");
  fs.rmSync(tmp, { recursive: true, force: true });
  return xml
    .replace(/<w:tab[^/]*\/>/g, "\t")
    .replace(/<\/w:p>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const dir = path.resolve("..");
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".docx"))) {
  console.log(`=== ${f} ===`);
  console.log(extractDocx(path.join(dir, f)));
  console.log("");
}
