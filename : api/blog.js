export default async function handler(req, res) {
  try {
    const response = await fetch(
      'https://wordwayjourney.blogspot.com/feeds/posts/default?alt=json&max-results=3'
    );

    if (!response.ok) {
      throw new Error(`Blogger feed responded with ${response.status}`);
    }

    const data = await response.json();

    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.status(200).json(data);
  } catch (err) {
    res.status(502).json({ error: 'Could not fetch blog feed' });
  }
}
