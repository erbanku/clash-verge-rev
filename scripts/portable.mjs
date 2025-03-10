import fs from "fs-extra";
import path from "path";
import AdmZip from "adm-zip";
import { createRequire } from "module";
import { getOctokit, context } from "@actions/github";

const target = process.argv.slice(2)[0];

const ARCH_MAP = {
  "i686-pc-windows-msvc": "x86",
  "x86_64-pc-windows-msvc": "x64",
};

/// Script for ci
/// 打包绿色版/便携版 (only Windows)
async function resolvePortable() {
  if (process.platform !== "win32") return;

  const releaseDir = target
    ? `./src-tauri/target/${target}/release`
    : `./src-tauri/target/release`;
  const configDir = path.join(releaseDir, ".config");

  if (!(await fs.pathExists(releaseDir))) {
    throw new Error("could not found the release dir");
  }

  await fs.mkdir(configDir);
  await fs.createFile(path.join(configDir, "PORTABLE"));

  const zip = new AdmZip();

  zip.addLocalFile(path.join(releaseDir, "Clash Verge.exe"));
  // zip.addLocalFile(path.join(releaseDir, "clash.exe"));
  zip.addLocalFile(path.join(releaseDir, "clash-meta.exe"));
  zip.addLocalFile(path.join(releaseDir, "clash-meta-alpha.exe"));
  zip.addLocalFolder(path.join(releaseDir, "resources"), "resources");
  zip.addLocalFolder(configDir, ".config");

  const require = createRequire(import.meta.url);
  const packageJson = require("../package.json");
  const { version } = packageJson;

  const zipFile = `Clash.Verge_${version}_${ARCH_MAP[target]}_portable.zip`;
  zip.writeZip(zipFile);

  console.log("[INFO]: create portable zip successfully");

  // push release assets
  if (process.env.GITHUB_TOKEN === undefined) {
    throw new Error("GITHUB_TOKEN is required");
  }

  const options = { owner: context.repo.owner, repo: context.repo.repo };
  const github = getOctokit(process.env.GITHUB_TOKEN);

  console.log("[INFO]: upload to ", process.env.TAG_NAME || `v${version}`);

  const { data: release } = await github.rest.repos.getReleaseByTag({
    ...options,
    tag: process.env.TAG_NAME || `v${version}`,
  });

  console.log(release.name);

  await github.rest.repos.uploadReleaseAsset({
    ...options,
    release_id: release.id,
    name: zipFile,
    data: zip.toBuffer(),
  });
}

resolvePortable().catch(console.error);
