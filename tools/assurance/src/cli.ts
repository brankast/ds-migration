import { repoRoot } from './paths.js';
import { ensureDataDirs, printAssessment, runAssurance, watchChangelog } from './run.js';

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args.find((arg) => !arg.startsWith('-')) ?? 'run';
  const changelogPath = flagValue(args, '--changelog');
  const createPr = args.includes('--create-pr');
  const fetchRemote = !args.includes('--no-fetch');
  const root = flagValue(args, '--root') ?? repoRoot();

  ensureDataDirs(root);

  if (command === 'watch') {
    await watchChangelog({ root, changelogPath, fetchRemote });
    return;
  }

  if (command !== 'run') {
    console.error(`Unknown command: ${command}`);
    console.error('Usage: npm run assure -- [run|watch] [--changelog <path>] [--create-pr] [--no-fetch]');
    process.exitCode = 1;
    return;
  }

  const assessment = await runAssurance({
    root,
    changelogPath,
    fetchRemote,
    createPr,
  });
  printAssessment(assessment);
}

function flagValue(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  if (index === -1) {
    return undefined;
  }
  return args[index + 1];
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
