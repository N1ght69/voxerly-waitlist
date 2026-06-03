const VALID_ROLES = ['buyer', 'seller', 'both'];

exports.handler = async (event) => {
  console.log('Function called with body: ' + event.body);

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { email, role } = body;

  if (!email || !VALID_ROLES.includes(role)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid email' }) };
  }

  try {
    const res = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email,
        attributes: { ROLE: role },
        listIds: [3],
        updateEnabled: true
      })
    });

    const resBody = await res.text().catch(() => '');
    console.log('Brevo response status: ' + res.status + ' body: ' + resBody);

    if (res.status === 201 || res.status === 204) {
      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    }

    if (res.status === 400) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid email' }) };
    }

    return { statusCode: 500, body: JSON.stringify({ error: 'Something went wrong' }) };

  } catch (err) {
    console.log('Brevo fetch error: ' + err.message);
    return { statusCode: 500, body: JSON.stringify({ error: 'Something went wrong' }) };
  }
};
