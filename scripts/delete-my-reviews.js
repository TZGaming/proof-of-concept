const baseURL = 'https://fdnd-agency.directus.app/items';
const reviewEndpoint = `${baseURL}/decathlon_reviews?fields=*,attributes.*&limit=1000`;
const reviewCreateEndpoint = `${baseURL}/decathlon_reviews`;

const currentUser = {
  id: '55',
  name: 'Tom',
};

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

  if (id) {
    console.log(`Deleting review id=${id}`);
    if (dryRun) {
      console.log('Dry run enabled, no delete performed.');
      return;
    }
    const { response } = await fetchJson(`${reviewCreateEndpoint}/${id}`, { method: 'DELETE' });
    console.log(`DELETE ${id} -> ${response.status}`);
    return;
  }

  const { response, json } = await fetchJson(reviewEndpoint);
  if (!response.ok) {
    console.error('Unable to load reviews:', response.status);
    process.exit(1);
  }

  const reviews = Array.isArray(json.data) ? json.data : [];
  const mine = reviews.filter((review) => {
    const userId = review.user_id != null ? String(review.user_id) : '';
    return userId === currentUser.id || review.name === currentUser.name;
  });

  if (!mine.length) {
    console.log('No reviews found for user', currentUser.name);
    return;
  }

  console.log(`Found ${mine.length} review(s) for ${currentUser.name}:`);
  for (const review of mine) {
    console.log(`- ${review.id}: ${review.title || '<no title>'}`);
  }

  if (dryRun) {
    console.log('Dry run enabled, no reviews deleted. Use without --dry-run to delete.');
    return;
  }

  for (const review of mine) {
    const { response: deleteResponse } = await fetchJson(`${reviewCreateEndpoint}/${review.id}`, { method: 'DELETE' });
    console.log(`Deleted ${review.id}: ${deleteResponse.status}`);
  }
};

run().catch((error) => {
  console.error('Error deleting reviews:', error);
  process.exit(1);
});
