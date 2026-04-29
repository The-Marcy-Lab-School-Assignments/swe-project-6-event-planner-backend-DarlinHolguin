const bcrypt = require('bcrypt');
const pool = require('./pool');

const SALT_ROUNDS = 8;

const seed = async () => {
    await pool.query('DROP TABLE IF EXISTS rsvps');
    await pool.query('DROP TABLE IF EXISTS events');
    await pool.query('DROP TABLE IF EXISTS users')

    await pool.query(`
    CREATE TABLE users (
    user_id         SERIAL  PRIMARY KEY,
    username        TEXT    NOT NULL   UNIQUE,
    password_hash   TEXT    NOT NULL
    )
`);

    await pool.query(`
    CREATE TABLE events (
    event_id SERIAL PRIMARY KEY,
    title        TEXT       NOT NULL,
    description  TEXT,
    date         TEXT       NOT NULL,
    location     TEXT       NOT NULL,
    event_type   TEXT       NOT NULL,
    max_capacity INTEGER    NOT NULL,
    user_id      INTEGER    REFERENCES users(user_id) ON DELETE CASCADE
    )
`);

    await pool.query(`
    CREATE TABLE rsvps (
    rsvp_id	    SERIAL	PRIMARY KEY,
    user_id	    INTEGER	REFERENCES users(user_id) ON DELETE CASCADE,
    event_id    INTEGER	REFERENCES events(event_id) ON DELETE CASCADE,
    UNIQUE(user_id, event_id)
    ) 
`);

    const user1hash = await bcrypt.hash('password123', SALT_ROUNDS);
    const user2hash = await bcrypt.hash('drowssap', SALT_ROUNDS);
    const user3hash = await bcrypt.hash('hello6789', SALT_ROUNDS);

    const insertUserSql = 'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING user_id;';

    const user1Response = await pool.query(insertUserSql, ['user1', user1hash]);
    const user2Response = await pool.query(insertUserSql, ['user2', user2hash]);
    const user3Response = await pool.query(insertUserSql, ['user3', user3hash]);

    const user1Id = user1Response.rows[0].user_id;
    const user2Id = user2Response.rows[0].user_id;
    const user3Id = user3Response.rows[0].user_id;

    const insertEvent = `
    INSERT INTO events (title, description, date, location, event_type, max_capacity, user_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING event_id
    `;

    const e1 = await pool.query(insertEvent, ['React Workshop', 'Learn React basics', '2025-06-01', 'New York, NY', 'workshop', 30, user1Id]);
    const e2 = await pool.query(insertEvent, ['Jazz Concert', 'Live jazz night', '2025-07-04', 'Brooklyn, NY', 'concert', 100, user2Id]);
    const e3 = await pool.query(insertEvent, ['Networking Mixer', 'Meet local devs', '2025-08-15', 'Manhattan, NY', 'networking', 50, user3Id]);
    const e4 = await pool.query(insertEvent, ['Charity Run', '5k fundraiser', '2025-09-10', 'Central Park, NY', 'fundraiser', 200, user1Id]);
    const e5 = await pool.query(insertEvent, ['Yoga in the Park', 'Morning yoga session', '2025-09-15', 'Prospect Park, NY', 'social', 40, user2Id]);

    const e1Id = e1.rows[0].event_id;
    const e2Id = e2.rows[0].event_id;
    const e3Id = e3.rows[0].event_id;
    const e4Id = e4.rows[0].event_id;
    const e5Id = e5.rows[0].event_id;

    const insertRsvp = 'INSERT INTO rsvps (user_id, event_id) VALUES ($1, $2)';

    await pool.query(insertRsvp, [user1Id, e2Id]);
    await pool.query(insertRsvp, [user1Id, e3Id]);
    await pool.query(insertRsvp, [user2Id, e1Id]);
    await pool.query(insertRsvp, [user2Id, e4Id]);
    await pool.query(insertRsvp, [user3Id, e1Id]);
    await pool.query(insertRsvp, [user3Id, e5Id]);

    console.log('Database seeded.');
}

seed()
    .catch((err) => {
        console.error('Error seeding database:', err);
        process.exit(1);
    })
    .finally(() => pool.end());
