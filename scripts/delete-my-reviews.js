const baseURL = 'https://fdnd-agency.directus.app/items';
const reviewEndpoint = `${baseURL}/decathlon_reviews?fields=*,attributes.*&limit=1000`;
const reviewCreateEndpoint = `${baseURL}/decathlon_reviews`;

const fetchJson = async (url, options) => {
  const response = await fetch(url, options);
  const text = await response.text();
  try {
    return { response, json: JSON.parse(text) };
  } catch {
    return { response, text };
  }
};

const parseArgs = () => {
  const args = process.argv.slice(2);
  const parsed = {};
  for (const arg of args) {
    if (arg.startsWith('--id=')) parsed.id = arg.slice(5);
    if (arg === '--dry-run') parsed.dryRun = true;
  }
  return parsed;
};

const run = async () => {
  const { id, dryRun } = parseArgs();

  if (!id) {
    console.error('Usage: npm run delete-reviews -- --id=<review-id> [--dry-run]');
    process.exit(1);
  }

  console.log(`Deleting review id=${id}`);
  if (dryRun) {
    console.log('Dry run enabled, no delete performed.');
    return;
  }

  const { response } = await fetchJson(`${reviewCreateEndpoint}/${id}`, { method: 'DELETE' });
  console.log(`DELETE ${id} -> ${response.status}`);
};

run().catch((error) => {
  console.error('Error deleting reviews:', error);
  process.exit(1);
});
