import fs from 'node:fs/promises';

export async function fileExists(filePath): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true; // ファイルが存在する
  } catch {
    return false; // ファイルが存在しない
  }
}

export async function directoryExists(dirPath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(dirPath);
    return stats.isDirectory(); // ディレクトリかどうかを確認
  } catch {
    return false; // 存在しない場合
  }
}

export async function readJsonFile(filePath): Promise<any> {
  const data = await fs.readFile(filePath, 'utf8');
  return JSON.parse(data); 
}

export async function writeJsonFile(filePath, data): Promise<void> {
  const jsonData = JSON.stringify(data, null, 2);
  await fs.writeFile(filePath, jsonData, 'utf8');
}