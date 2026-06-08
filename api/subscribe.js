export default async function handler(req, res) {
  console.log('Function called with body: ' + JSON.stringify(req.body));

  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const { email, roles } = req.body || {};

  if (!email) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  const rolesArray = Array.isArray(roles) ? roles : [];
  const hasBuyer = rolesArray.includes('buyer');
  const hasSeller = rolesArray.includes('seller');
  const role = (hasBuyer && hasSeller) ? 'both' : hasBuyer ? 'buyer' : hasSeller ? 'seller' : 'buyer';

  const brevoPayload = {
    email,
    attributes: { ROLE: role },
    listIds: [3],
    updateEnabled: true
  };

  try {
    const apires = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(brevoPayload)
    });

    const resBody = await apires.text().catch(() => '');

    if (apires.status === 201 || apires.status === 204) {
      return res.status(200).json({ success: true });
    }

    if (apires.status === 400) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    return res.status(500).json({ error: 'Something went wrong' });

  } catch (err) {
    return res.status(500).json({ error: 'Something went wrong' });
  }
}
