function login(email, password, callback) {
  const bcrypt = require('bcryptjs');
  const { Client } = require('pg');
  const conString = '{POSTGRES_SQL_CONNECTION_STRING}';

  const client = new Client({ connectionString: conString, ssl: { rejectUnauthorized: false } });

  client.connect(err => {
    if (err) return callback(err);

    const query = `
      SELECT id, nickname, email, password_hash, COALESCE(email_verified, false) AS email_verified
      FROM users
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1
    `;

    client.query(query, [email], (err, result) => {
      client.end();
      if (err) return callback(err);
      if (!result || result.rows.length === 0) 
      return callback(new WrongUsernameOrPasswordError(email));

      const u = result.rows[0];
      bcrypt.compare(password, u.password_hash, (err, ok) => {
        if (err) return callback(err);
        if (!ok) return callback(new WrongUsernameOrPasswordError(email));

        return callback(null, {
          user_id: String(u.id),
          email: u.email,
          nickname: u.nickname || u.email.split('@')[0],
          email_verified: !!u.email_verified
        });
      });
    });
  });
}