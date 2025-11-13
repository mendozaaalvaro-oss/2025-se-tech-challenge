function getUser(identifierValue, callback) {
  const { Client } = require('pg');
  const conString = '{POSTGRES_SQL_CONNECTION_STRING}';

  const client = new Client({ connectionString: conString, ssl: { rejectUnauthorized: false } });

  client.connect(err => {
    if (err) return callback(err);

    const query = `
      SELECT id, nickname, email, given_name, family_name,
             COALESCE(email_verified, false) AS email_verified
      FROM users
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1
    `;

    client.query(query, [identifierValue], (err, result) => {
      client.end();
      if (err) return callback(err);
      if (result.rows.length === 0) return callback(null, null);

      const u = result.rows[0];
      const profile = {
        user_id: String(u.id),
        email: u.email,
        nickname: u.nickname || u.email.split('@')[0],
        email_verified: !!u.email_verified
      };
      if (u.given_name)  profile.given_name  = String(u.given_name);
      if (u.family_name) profile.family_name = String(u.family_name);

      return callback(null, profile);
    });
  });
}